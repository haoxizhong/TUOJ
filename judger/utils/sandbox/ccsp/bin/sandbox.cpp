#include "sandbox.h"
#include "system_table.h"

string read_string_from_regs(reg_val_t addr, pid_t pid) {
		char res[MAXBUF+1], *ptr = res;
		while (ptr != res + MAXBUF) {
				*(reg_val_t*)ptr = ptrace(PTRACE_PEEKDATA, pid, addr, NULL);
				for (int i = 0; i < (int)sizeof(reg_val_t); i++, ptr++, addr++) {
						if (*ptr == 0) {
								return res;
						}
				}
		}
		res[MAXBUF] = 0;
		return res;
}

int file_exists(const char *filename)
{
		return access(filename, 0) == 0;
}

string get_full_name_from_abs(string absname)
{
		if (absname[0]=='/')return absname;
		const char* pathptr = getenv("PATH");
		char buf[MAXBUF];
		strcpy(buf,pathptr);
		int pathlen = strlen(pathptr);
		for (int i=pathlen-1;i>=0;i--)
				if (buf[i] == ':')
						buf[i] = '\0';
		string str;
		for (int i=0;i<pathlen;i++)
		{
				if (!i || buf[i-1]=='\0')
				{
						str=(buf+i)+string("/")+absname;
						if (file_exists(str.c_str()))
								return str;
				}
		}
		getcwd(buf,sizeof(buf));
		str=buf+string("/")+absname;
		if (file_exists(str.c_str()))
				return str;
		return absname;
}
string update_command(string cmd)
{
		string suffix;
		for (int i=0;i<(int)cmd.size();i++)
		{
				if (cmd[i]==' ')
				{
						string ans;
						ans=get_full_name_from_abs(cmd.substr(0,i)) + cmd.substr(i,cmd.size()-i);
						return ans;
				}
		}
		return get_full_name_from_abs(cmd);
}
Sandbox_t::Sandbox_t()
{
		char cwd[1111];
		getcwd(cwd, sizeof(cwd));
		home_path = string(cwd);
		if (home_path.substr(home_path.length()-4,4) == "/bin")
				home_path = home_path.substr(0,home_path.length()-4);
		shared_path = home_path;
		tmp_path = home_path;
		run_path = home_path;
		whitelist_path = DEFAULT_WHITELIST_PATH;
		whitelist_method = "default";

		do_debug = false;
		do_ptrace = true;
		do_limit = true;
		timelimit = 1000;
		memorylimit = 256;
		command = "echo what?";
		action = "execute";

		init_flag = false;
		status_flag = false;
}
Sandbox_t::~Sandbox_t()
{
		if (init_flag)
				resfile.close();
		/*if (!do_debug && init_flag)system(("cp "+tmp_path+"/.result " + shared_path).c_str());
		  if (!do_debug && init_flag)system(("cp "+tmp_path+"/.stderr " + shared_path).c_str());
		  if (!do_debug && init_flag)system(("cp "+tmp_path+"/.stdout " + shared_path).c_str());*/
}
void Sandbox_t::set_debug(bool debug)
{
		do_debug = debug;
}
void Sandbox_t::set_ptrace(bool pt)
{
		do_ptrace = pt;
}
void Sandbox_t::set_limit(bool fl)
{
		do_limit = fl;
}
void Sandbox_t::set_pwhitelist(bool pw)
{
		do_pwhitelist = pw;
}
void Sandbox_t::set_whitelist_method(string str)
{
		whitelist_method = str;
}
void Sandbox_t::set_timelimit(int timelimit)
{
		this->timelimit = timelimit;
}
void Sandbox_t::set_memorylimit(int memorylimit)
{
		this->memorylimit = memorylimit;
}
void Sandbox_t::set_action(string action)
{
		this->action = action;
}
void Sandbox_t::set_path(string path) {
		this->home_path = path;
		this->shared_path = path;
		this->tmp_path = path;
		this->run_path = path;
		//this->whitelist_path = path;
}
void Sandbox_t::set_command(string command)
{
		this->command = command;
}
void Sandbox_t::let_fileft_assign(string str)
{
		fileft.assign(str);
}
void Sandbox_t::let_sysft_assign(string str)
{
		sysft.assign(str);
}
void Sandbox_t::PrintRes(int x)
{
		if (x==RS_AC)
				resfile<<"Accepted\n";
		else if (x==RS_WA)
				resfile<<"Wrong Answer\n";
		else if (x==RS_TLE)
				resfile<<"Time Limit Exceeded\n";
		else if (x==RS_MLE)
				resfile<<"Memory Limit Exceeded\n";
		else if (x==RS_RE)
				resfile<<"Runtime Error\n";
		else if (x==RS_SYE)
				resfile<<"System Error\n";
		else if (x==RS_CE)
				resfile<<"Compilation Error\n";
		else if (x==RS_FE)
				resfile<<"File Error\n";
		else if (x==RS_DGP)
				resfile<<"Dangerous Program\n";
}
void Sandbox_t::print_args()
{
		cerr<<"home_path="<<home_path<<endl;
		cerr<<"tmp_path="<<tmp_path<<endl;
		cerr<<"shared_path="<<shared_path<<endl;
		cerr<<"run_path="<<run_path<<endl;
		cerr<<"whitelist_path="<<whitelist_path<<endl;

		cerr<<"do_debug="<<do_debug<<endl;
		cerr<<"do_ptrace="<<do_ptrace<<endl;
		cerr<<"do_limit="<<do_limit<<endl;
		cerr<<"do_pwhitelist="<<do_pwhitelist<<endl;
		cerr<<"timelimit="<<timelimit<<endl;
		cerr<<"memorylimit="<<memorylimit<<endl;
		cerr<<"action="<<action<<endl;
		cerr<<"command="<<command<<endl;
}
void Sandbox_t::Init()
{
		if (!file_exists(tmp_path.c_str()))
				mkdir(tmp_path.c_str(),0755);
		if (!file_exists(run_path.c_str()))
				mkdir(run_path.c_str(),0755);
		if (!file_exists(run_path.c_str()))
				mkdir(run_path.c_str(),0755);
		init_flag = true;
		resfile.open((tmp_path+"/.result").c_str());
		if (do_debug)cout<<"Result file at"<<tmp_path+"/.result"<<endl;
		fileft.assign((whitelist_path+"/file-"+whitelist_method+".whitelist").c_str());
		sysft.assign((whitelist_path+"/syscall-"+whitelist_method+".whitelist").c_str());
		chdir(run_path.c_str());
}
int Sandbox_t::Run()
{  
		if (do_debug)print_args();
		//if (do_debug)cout<<"EXCUTE "<<update_command(command.c_str())<<endl;
		pid_t child;
		child = fork();
		if(child == 0) {
				rlimit rm_cpu_old,rm_cpu_new;
				rlimit rm_as_old,rm_as_new;
				if (do_limit)
				{
						getrlimit(RLIMIT_CPU,&rm_cpu_old);
						rm_cpu_new.rlim_cur=timelimit/1000+1;
						rm_cpu_new.rlim_max=timelimit/1000+1;
						setrlimit(RLIMIT_CPU,&rm_cpu_new);
						getrlimit(RLIMIT_AS,&rm_as_old);
						if (action == "java")
						{
								rm_as_new.rlim_cur=(memorylimit+2000)*1024*1024;
								rm_as_old.rlim_max=(memorylimit+2000)*1024*1024;
						}else
						{
								rm_as_new.rlim_cur=(memorylimit+10)*1024*1024;
								rm_as_old.rlim_max=(memorylimit+10)*1024*1024;
						}
						setrlimit(RLIMIT_AS,&rm_as_new);
				}
				if (do_ptrace)ptrace(PTRACE_TRACEME, 0, NULL, NULL);
				if (!do_debug)freopen((tmp_path+"/0.in").c_str(),"r",stdin);
				if (!do_debug)freopen((tmp_path+"/r.stdout").c_str(),"w",stdout);
				if (!do_debug)freopen((tmp_path+"/r.stderr").c_str(),"w",stderr);
				int status;
				if (action == "javac")
				{
						status = execl("/usr/bin/javac","/usr/bin/javac",command.c_str(),NULL);
				}else if (action == "java")
				{
						status = execl("/usr/bin/java","/usr/bin/java",(command).c_str(),NULL);
				}else if (action == "python")
				{
						status = execl("/usr/bin/python","/usr/bin/python",command.c_str(),NULL);
				}else if (action == "execute")
				{
						status = execl("/bin/bash","/bin/bash","-c",update_command(command.c_str()).c_str(),NULL);
				}else if (action == "command")
				{
						status = execl("/bin/bash","/bin/bash","-c",command.c_str(),NULL);
				}
				if (status)
						cerr<<"SYSTEM ERROR: EXECL FAILED"<<endl;
				return RS_SYE;
		}
		else {
				int timer;
				if (!(timer = fork()))//add timer and kill the process after 50ms over deadline
				{
						usleep(timelimit*1200);
						cerr<<"Timer killed"<<endl;
						kill(child,9);
						//		kill(getppid(),SIGUSR2);
						exit(0);
				}
				rusage rusa;
				int status;
				//	struct sigaction act;  
				//	act.sa_sigaction=handler_sig;  
				//	act.sa_flags=SA_SIGINFO;  
				//	sigaction(SIGUSR2,&act,NULL);
				while(1) //cycle for ptracing system calls
				{
						wait4(child,&status,__WALL,&rusa);
						//	cerr<<"Break..."<<endl;
						//	cerr<<(int)rusa.ru_utime.tv_sec*1000000+(int)rusa.ru_utime.tv_usec<<endl;
						if(WIFEXITED(status))
								break;
						if (!WIFEXITED(status) && !WEXITSTATUS(status))
								break;
						//cout<<WIFEXITED(status)<<" "<<WEXITSTATUS(status)<<endl;
						struct user_regs_struct regs;
						if (do_ptrace)ptrace(PTRACE_GETREGS, child,NULL,&regs);  
						if (do_debug)cerr<<sysid[regs.REG_SYSCALL]<<" "<<status<<endl;
						if (regs.REG_SYSCALL > 1000)//MLE?
								break;
						if (do_pwhitelist)
						{
								sysft.add(regs.REG_SYSCALL);
								if (regs.REG_SYSCALL == 2)
								{
										string fn=read_string_from_regs(regs.REG_ARG0,child);
										fn=get_full_name_from_abs(fn);
										fileft.add(fn);
						//				cout<<"F>"<<fn<<endl;
								}
						}else
						{
								if (regs.REG_SYSCALL == 2)
								{
										string fn=read_string_from_regs(regs.REG_ARG0,child);
										fn=get_full_name_from_abs(fn);
										if (!fileft.check(fn))
										{
												if (!do_pwhitelist)
												{
														cerr<<"File <"<<fn<<"> is forbidden!"<<endl;
														return RS_DGP;
												}
										}
								}
								if (regs.REG_SYSCALL == 16) {
									if (regs.REG_ARG0 <= 2) {
										goto nokill;
									}
								}
								if (!sysft.check(regs.REG_SYSCALL))
								{
										if (!do_pwhitelist)
										{
												cerr<<(int)regs.REG_SYSCALL<<endl;
												cerr<<"Unsafe System Call<"<<regs.REG_SYSCALL<<">"<<sysid[regs.REG_SYSCALL]<<endl;
												resfile<<-1<<" "<<-1<<endl;
												kill(timer,9);
												kill(child,9);
												if (do_debug)cerr<<"Kill timer"<<endl;
												return RS_DGP;
										}
								}
nokill: ;
						}
						if (do_ptrace)ptrace(PTRACE_SYSCALL,child, NULL, NULL);
				}
				kill(timer,9);
				if (do_debug)cerr<<"Kill timer"<<endl;
				int cur_Time=(int)rusa.ru_utime.tv_sec*1000+(int)rusa.ru_utime.tv_usec/1000;
				int cur_Memory=(int)rusa.ru_maxrss;
				if (!WIFEXITED(status) && WIFSIGNALED(status) && WTERMSIG(status) == SIGKILL)
						cur_Time = timelimit*1.200;
			//	printf("%d %d\n",cur_Time,cur_Memory);
				resfile<<cur_Time<<" "<<cur_Memory<<endl;
				if (do_debug)cerr<<"Time & Memory:"<<cur_Time<<" "<<cur_Memory<<endl;
				if (WIFEXITED(status))
				{
						if (!WEXITSTATUS(status))
						{
								if (cur_Time>timelimit)
										return do_limit ? RS_TLE : RS_AC;
								else if (cur_Memory>memorylimit*1024)
										return do_limit ? RS_MLE : RS_AC;
								else
										return RS_AC;
						}else
						{
								if (cur_Time>timelimit)
								{
										return do_limit ? RS_TLE : RS_AC;
								}else
								{
										return RS_RE;
								}
						}
				}else
				{
						if (WIFSIGNALED(status) && WTERMSIG(status) == SIGKILL)
								return do_limit ? RS_TLE : RS_AC;
						if (WIFSIGNALED(status) && WTERMSIG(status) == SIGSEGV)
								return do_limit ? RS_MLE : RS_AC;
						if (cur_Time>timelimit)
								return do_limit ? RS_TLE : RS_AC;
						else if (cur_Memory>memorylimit*1024)
								return do_limit ? RS_MLE : RS_AC;
						else
								return do_limit ? RS_RE : RS_AC;
				}
		}
}
void Sandbox_t::Final()
{
		if (do_pwhitelist)
		{
				if (do_debug)cerr<<"Export result into"<<(whitelist_path+"/syscall-"+whitelist_method+".whitelist")<<endl;
				sysft.fexport(whitelist_path+"/syscall-"+whitelist_method+".whitelist");
				fileft.fexport(whitelist_path+"/file-"+whitelist_method+".whitelist");
				//sysft.fexport(tmp_path+"/.swhitelist");
				//fileft.fexport(tmp_path+"/.fwhitelist");
		}
}

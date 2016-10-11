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

string get_full_name_from_abs(string str)
{
		if (str[0]=='/')return str;
		char buf[MAXBUF];
		if (str[0]=='.')
				str=str.substr(2,str.length()-2);
		getcwd(buf,sizeof(buf));
		str=buf+string("/")+str;
		return str;
}
Sandbox_t::Sandbox_t()
{
		do_debug = false;
		do_ptrace = true;
		timelimit = 1000;
		memorylimit = 256;
		command = "echo what?";
		action = "execute";
		resfile.open(HOME_PATH "/tmp/.result");
		fileft.assign(HOME_PATH"/bin/whitelist/file-default.whitelist");
		sysft.assign(HOME_PATH"/bin/whitelist/syscall-default.whitelist");
}
Sandbox_t::~Sandbox_t()
{
		resfile.close();
		if (!do_debug)system("cp " HOME_PATH "/tmp/.result "SHARED_PATH);
		if (!do_debug)system("cp " HOME_PATH "/tmp/.stderr "SHARED_PATH);
		if (!do_debug)system("cp " HOME_PATH "/tmp/.stdout "SHARED_PATH);
}
void Sandbox_t::set_debug(bool debug)
{
		do_debug = debug;
}
void Sandbox_t::set_ptrace(bool pt)
{
		do_ptrace = pt;
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
				resfile<<"Accept\n";
		else if (x==RS_WA)
				resfile<<"Wrong Answer\n";
		else if (x==RS_TLE)
				resfile<<"Time Limit Exceed\n";
		else if (x==RS_MLE)
				resfile<<"Memory Limit Exceed\n";
		else if (x==RS_RE)
				resfile<<"Runtime Error\n";
		else if (x==RS_SYE)
				resfile<<"System Error\n";
		else if (x==RS_CE)
				resfile<<"Compile Error\n";
		else if (x==RS_FE)
				resfile<<"File Error\n";
		else if (x==RS_DGP)
				resfile<<"Dangerous Program\n";
}
void Sandbox_t::Init()
{
		system("rm -r " RUN_PATH);
		system("mkdir " RUN_PATH);
		system("cp -R " SHARED_PATH "/* " RUN_PATH);
		chdir(RUN_PATH);
}
int Sandbox_t::Run()
{  
		pid_t child;
	//	cout<<action<<endl;
	//	cout<<command<<endl;
	//	cout<<timelimit<<" "<<memorylimit<<endl;
		child = fork();
		if(child == 0) {
				rlimit rm_cpu_old,rm_cpu_new;
				getrlimit(RLIMIT_CPU,&rm_cpu_old);
				rm_cpu_new.rlim_cur=timelimit/1000+1;
				rm_cpu_new.rlim_max=timelimit/1000+1;
				setrlimit(RLIMIT_CPU,&rm_cpu_new);

				rlimit rm_as_old,rm_as_new;
				getrlimit(RLIMIT_AS,&rm_as_old);
				rm_as_new.rlim_cur=(memorylimit+1)*1024*1024;
				rm_as_old.rlim_max=(memorylimit+1)*1024*1024;
				setrlimit(RLIMIT_AS,&rm_as_new);
				if (do_ptrace)
						ptrace(PTRACE_TRACEME, 0, NULL, NULL);
				if (do_debug)cerr<<"Action:"<<action<<endl;
				if (do_debug)cerr<<timelimit<<" "<<memorylimit<<endl;
				if (!do_debug)freopen(TMP_PATH"/.stdout","w",stdout);
				if (!do_debug)freopen(TMP_PATH"/.stderr","w",stderr);
				int status;
				if (action == "python")
				{
						status = execl("/usr/bin/python","/usr/bin/python","python/pass1.py",NULL);
				}else if (action == "execute")
				{
						status = execl("/bin/bash","/bin/bash","-c",get_full_name_from_abs(command.c_str()).c_str(),NULL);
						cerr<<get_full_name_from_abs(command.c_str())<<endl;
				}else if (action == "command")
				{
						char tbuf[MAXBUF];
						getcwd(tbuf,sizeof(tbuf));
						chdir(RUN_PATH);
						status = execl("/bin/bash","/bin/bash","-c",command.c_str(),NULL);
						chdir(tbuf);
				}
				if (!do_debug)fclose(stdout);
				if (!do_debug)fclose(stderr);
				setrlimit(RLIMIT_AS,&rm_as_old);
				setrlimit(RLIMIT_CPU,&rm_cpu_old);
				if (WIFEXITED(status))
				{
						if (!WEXITSTATUS(status))
								exit(0);
						exit(RS_RE);//Runtime Error or Interrupted
				}
				exit(RS_RE);
		}
		else {
				int timer;
				if (!(timer = fork()))
				{
						usleep((timelimit+50)*1000);
						kill(child,9);
						exit(0);
				}
				rusage rusa;
				int status;
				while(1) {
						wait4(child,&status,WUNTRACED,&rusa);
						if(WIFEXITED(status))
								break;
						if (!WIFEXITED(status) && !WEXITSTATUS(status))
								break;
						struct user_regs_struct regs;
						ptrace(PTRACE_GETREGS, child,NULL,&regs);  
						if (regs.REG_SYSCALL == 2)
						{
								string fn=read_string_from_regs(regs.REG_ARG0,child);
								fn=get_full_name_from_abs(fn);
								if (!fileft.check(fn))
								{
										cerr<<"File <"<<fn<<"> is forbidden!\n"<<endl;
										return RS_DGP;
								}
						}
						if (!sysft.check(regs.REG_SYSCALL))
						{
								//cout<<sysid[regs.REG_SYSCALL]<<endl;
								cerr<<"Unsafe System Call<"<<sysid[regs.REG_SYSCALL]<<">"<<endl;
								resfile<<-1<<" "<<-1<<endl;
								return RS_DGP;
						}
						ptrace(PTRACE_SYSCALL,child, NULL, NULL);
				}
				kill(timer,9);
				int cur_Time=(int)rusa.ru_utime.tv_sec*1000+(int)rusa.ru_utime.tv_usec/1000;
				int cur_Memory=(int)rusa.ru_maxrss;
				printf("%d %d\n",cur_Time,cur_Memory);
				resfile<<cur_Time<<" "<<cur_Memory<<endl;
				if (do_debug)cerr<<"Time & Memory:"<<cur_Time<<" "<<cur_Memory<<endl;
				if (WIFEXITED(status))
				{
						if (!WEXITSTATUS(status))
						{
								if (cur_Time>timelimit)
										return RS_TLE;
								else if (cur_Memory>memorylimit*1024)
										return RS_MLE;
								else
										return RS_AC;
						}else
						{
								if (cur_Time>timelimit)
								{
										return RS_TLE;
								}else
								{
										return RS_RE;
								}
						}
				}else
				{
						if (cur_Time>timelimit)
								return RS_TLE;
						else if (cur_Memory>memorylimit*1024)
								return RS_MLE;
						else
								return RS_SYE;
				}
		}
}
void Sandbox_t::Final()
{
		system("rm -rf " SHARED_PATH"/* ");
		system("cp -R " RUN_PATH "/* " SHARED_PATH "/");
}

#include <unistd.h>
#include <sys/ptrace.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/reg.h>
#include <sys/syscall.h>   /* For SYS_write etc */
#include <sys/resource.h>
#include <sys/user.h>
#include <asm/unistd.h>
#include <set>
#include <fstream>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <string>
#include <map>
#include <vector>
#include <cstring>
using namespace std;
#include "system_table.h"
#include "configure.h"
#include "filter.h"
extern const char* sysid[];
#define MAXN 1010
#ifdef __x86_64__
typedef unsigned long long int reg_val_t;
#define REG_SYSCALL orig_rax
#define REG_RET rax
#define REG_ARG0 rdi
#define REG_ARG1 rsi
#define REG_ARG2 rdx
#define REG_ARG3 rcx
#else
typedef long int reg_val_t;
#define REG_SYSCALL orig_eax
#define REG_RET eax
#define REG_ARG0 ebx
#define REG_ARG1 ecx
#define REG_ARG2 edx
#define REG_ARG3 esx
#endif
#define RS_SYE 10
#define RS_NOR 0
#define RS_AC 1
#define RS_TLE 2
#define RS_RE 3
#define RS_MLE 4
#define RS_WA 5
#define RS_CE 6
#define RS_FE 7
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
		getcwd(buf,sizeof(buf));
		str=buf+string("/")+str;
		return str;
}
bool debug = false;
bool do_ptrace = true;
string action = "execute";
int timelimit;
int memorylimit;
string command;
ofstream resfile(HOME_PATH "/tmp/.result");

void PrintRes(int x)
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
}

filter fileft;
sysfilter sysft;
void Init(int argc,char* argv[])
{
		char result;
		timelimit = 1000;
		memorylimit = 256;
		fileft.assign(HOME_PATH"/bin/whitelist/file-default.whitelist");
		sysft.assign(HOME_PATH"/bin/whitelist/syscall-default.whitelist");
		while (~(result =(char) getopt(argc,argv,"t:m:drf:s:")))
		{
				switch(result)
				{
						case 't':
								sscanf(optarg,"%d",&timelimit);
								break;
						case 'm':
								sscanf(optarg,"%d",&memorylimit);
								break;
						case 'f':
								fileft.assign(HOME_PATH"/shared/"+string(optarg));
								break;
						case 's':
								sysft.assign(HOME_PATH"/shared/"+string(optarg));
								break;
						case 'd':
								debug=true;
								break;
						case 'r':
								do_ptrace = false;
								break;
				}
		}
		if (!argv[optind])
		{
				cerr<<"Command required!"<<endl;
				exit(1);
		}
		command =argv[optind];
		system("rm -r " RUN_PATH);
		system("mkdir " RUN_PATH);
		system("cp -R " HOME_PATH "/shared/* " RUN_PATH);
		chdir(RUN_PATH);
}
int Run()
{  
		pid_t child;
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
				if (debug)cerr<<"Action:"<<action<<endl;
				if (debug)cerr<<timelimit<<" "<<memorylimit<<endl;
				if (!debug)freopen(HOME_PATH"/tmp/.stdout","w",stdout);
				if (!debug)freopen(HOME_PATH"/tmp/.stderr","w",stderr);
				int status;
				if (action == "python")
				{
						status = execl("/usr/bin/python","/usr/bin/python","python/pass1.py",NULL);
				}else if (action == "execute")
				{
						status = execl("/bin/bash","/bin/bash","-c",command.c_str(),NULL);
				}
				if (!debug)fclose(stdout);
				if (!debug)fclose(stderr);
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
										cerr<<"File <"<<fn<<"> is forbidden!\n"<<endl;
						}
						if (!sysft.check(regs.REG_SYSCALL))
						{
								cout<<sysid[regs.REG_SYSCALL]<<endl;
								cerr<<"Unsafe System Call<"<<sysid[regs.REG_SYSCALL]<<">"<<endl;
						}
						ptrace(PTRACE_SYSCALL,child, NULL, NULL);
				}
				int cur_Time=(int)rusa.ru_utime.tv_sec*1000+(int)rusa.ru_utime.tv_usec/1000;
				int cur_Memory=(int)rusa.ru_maxrss;
				printf("%d %d\n",cur_Time,cur_Memory);
				resfile<<cur_Time<<" "<<cur_Memory<<endl;
				if (debug)cerr<<"Time & Memory:"<<cur_Time<<" "<<cur_Memory<<endl;
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
						return RS_SYE;
				}
		}
}

void Final()
{
		//system("rm -v" HOME_PATH"/shared/* ");
		system("rm -rf " HOME_PATH"/shared/* ");
		system("cp -R " RUN_PATH "/* " HOME_PATH "/shared/");
}
int main(int argc,char* argv[])
{
		Init(argc,argv);
		if (debug)cerr<<"Command:"<<command<<endl;
		int status=Run();
		PrintRes(status);
		Final();
		resfile.close();
		if (!debug)system("cp " HOME_PATH "/tmp/.result "SHARED_PATH);
		if (!debug)system("cp " HOME_PATH "/tmp/.stderr "SHARED_PATH);
		if (!debug)system("cp " HOME_PATH "/tmp/.stdout "SHARED_PATH);
		return 0;
}

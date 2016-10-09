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
using namespace std;
#include "system_table.h"
#include "../configure.h"
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
bool debug = true;
string action = "execute";
int main()
{  
		pid_t child;
		child = fork();
		if(child == 0) {
				ptrace(PTRACE_TRACEME, 0, NULL, NULL);
				if (debug)cerr<<"Action:"<<action<<endl;
				if (!debug)freopen(HOME_PATH"/tmp/.stdout","w",stdout);
				if (!debug)freopen(HOME_PATH"/tmp/.stderr","w",stderr);
				if (action == "python")
				{
						execl("/usr/bin/python","/usr/bin/python","python/pass1.py",NULL);
				}else if (action == "execute")
				{
						execl("/bin/bash","/bin/bash","-c","python /home/judger/bin/test/python/pass1.py",NULL);
				}
				if (!debug)fclose(stdout);
				if (!debug)fclose(stderr);
				return 0;
		}
		else {
				filter fileft;
				fileft.assign("./whitelist/file-default-python.whitelist");
				filter sysft;
				sysft.assign("./whitelist/syscall-default-python.whitelist");
				rusage rusa;
				//freopen("whitelist/syscall-default-python.whitelist","w",stdout);
				while(1) {
						int status;
						wait4(child,&status,WUNTRACED,&rusa);
						if(WIFEXITED(status))
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
						//	cout<<sysid[regs.REG_SYSCALL]<<endl;
						if (!sysft.check(sysid[regs.REG_SYSCALL]))
								cerr<<"Unsafe System Call<"<<sysid[regs.REG_SYSCALL]<<">"<<endl;
						ptrace(PTRACE_SYSCALL,child, NULL, NULL);
				}
				int cur_Time=(int)rusa.ru_utime.tv_sec*1000+(int)rusa.ru_utime.tv_usec/1000;
				int cur_Memory=(int)rusa.ru_maxrss;
				printf("%d %d\n",cur_Time,cur_Memory);
		}
}

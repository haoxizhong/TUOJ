#include <sys/ptrace.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <sys/reg.h>
#include <sys/syscall.h>   /* For SYS_write etc */
#include <stdio.h>
#include <stdlib.h>
#include <sys/resource.h>
#include <sys/user.h>
#include "system_table.h"
extern const char* sysid[];

int main()
{  
		pid_t child;
		long orig_eax, eax;
		long params[3];
		int status;
		int insyscall = 0;
		child = fork();
		if(child == 0) {
				ptrace(PTRACE_TRACEME, 0, NULL, NULL);
				//	system("./prog");
				execl("./prog", "prog", NULL);
		}
		else {
				while(1) {
						//		wait(&status);
						int status;
						rusage rusa;
						wait4(child,&status,WUNTRACED,&rusa);
						int cur_Time=(int)rusa.ru_utime.tv_sec*1000+(int)rusa.ru_utime.tv_usec/1000;
						int cur_Memory=(int)rusa.ru_maxrss;
						printf("%d\n",cur_Time);
						if(WIFEXITED(status))
								break;
						orig_eax = ptrace(PTRACE_PEEKUSER, child, 8 * ORIG_RAX, NULL);
						user_regs_struct regs;
						//regs.rax=ptrace(PTRACE_PEEKUSER,child,8*ORIG_RAX,NULL);
						ptrace(PTRACE_GETREGS, child,NULL,&regs);  
						printf("Write called with %ld, %ld, %ld\n",regs.rbx,regs.rcx,regs.rdx); 
						printf("%s\n",sysid[orig_eax]);
						ptrace(PTRACE_SYSCALL,
										child, NULL, NULL);
				}
		}
		return 0;
}

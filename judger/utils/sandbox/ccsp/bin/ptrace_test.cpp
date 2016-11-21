#include <unistd.h>
#include <sys/wait.h>//support wait4
#include <sys/resource.h>//support ulimit
#include <sys/user.h>//support user_regs_struct
#include <set>
#include <map>
#include <cstdio>
#include <string>
#include <vector>
#include <fstream>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <errno.h>
#include "configure.h"
using namespace std;

void handler_sig(int signo,siginfo_t *siginfo,void* pvoid)
{
		cerr<<"SIGUSR2 Captured"<<endl;
}

int main()
{  
		pid_t child;
		child = fork();
		if(child == 0) {
				cerr<<"Child begin..."<<endl;
				for (int i=1;i<=2000000000;i++);
				cerr<<"Child end..."<<endl;
		}
		else {
				pid_t timer;
				timer = fork();
				if (!timer)
				{
						sleep(1);
						kill(getppid(),SIGUSR2);
						exit(0);
				}
				struct sigaction act;  
				act.sa_sigaction=handler_sig;  
				act.sa_flags=SA_SIGINFO;  
				sigaction(SIGUSR2,&act,NULL);
				struct rusage rusa;
				int status;
				wait4(-1,&status,__WALL,&rusa);
				int cur_Time=(int)rusa.ru_utime.tv_sec*1000+(int)rusa.ru_utime.tv_usec/1000;
				int cur_Memory=(int)rusa.ru_maxrss;
				printf("%d %d\n",cur_Time,cur_Memory);
		}
}

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
				struct rusage rusa;
				int status;
				wait4(-1,&status,__WALL,&rusa);
				int cur_Time=(int)rusa.ru_utime.tv_sec*1000+(int)rusa.ru_utime.tv_usec/1000;
				int cur_Memory=(int)rusa.ru_maxrss;
				printf("%d %d\n",cur_Time,cur_Memory);
		}
}

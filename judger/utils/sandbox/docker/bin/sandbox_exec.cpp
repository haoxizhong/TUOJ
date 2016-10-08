#include<iostream>
#include<fstream>
#include<cstdio>
#include<cstring>
#include<string>
#include<cstdlib>
#include<unistd.h>
#include<sys/ptrace.h>
#include<sys/wait.h>
#include<sys/types.h>
#include<sys/reg.h>
#include<sys/signal.h>
#include<sys/resource.h>
#include"configure.h"
using namespace std;

#define RS_SYE 10
#define RS_NOR 0
#define RS_AC 1
#define RS_TLE 2
#define RS_RE 3
#define RS_MLE 4
#define RS_WA 5
#define RS_CE 6
#define RS_FE 7

int timelimit;
int memorylimit;
char command[MAXBUF];
bool debug;
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

void Init(int argc,char* argv[])
{
		char result;
		timelimit = 1000;
		memorylimit = 256;
		while (~(result =(char) getopt(argc,argv,"t:m:d")))
		{
				switch(result)
				{
						case 't':
								sscanf(optarg,"%d",&timelimit);
								break;
								//printf("%c,%s\n",result,optarg);
						case 'm':
								sscanf(optarg,"%d",&memorylimit);
								break;
						case 'd':
								debug=true;
								break;
				}
		}
		if (!argv[optind])
		{
				cerr<<"Command required!"<<endl;
				exit(1);
		}
		strcpy(command,argv[optind]);
		system("rm -r " RUN_PATH);
		system("mkdir " RUN_PATH);
		system("cp -R " HOME_PATH "/shared/* " RUN_PATH);
		chdir(RUN_PATH);
}
int Run()
{
		pid_t child;
		if (!(child=fork()))
		{
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

				if (debug)cerr<<"Begin Run..."<<endl;
				int status = system(command);
				if (debug)cerr<<"Finish Run..."<<endl;

				setrlimit(RLIMIT_AS,&rm_as_old);
				setrlimit(RLIMIT_CPU,&rm_cpu_old);

				if (WIFEXITED(status))
				{
						if (!WEXITSTATUS(status))
								exit(0);
						exit(RS_RE);//Runtime Error or Interrupted
				}
				exit(RS_RE);
		}else
		{
				int status;
				rusage rusa;
				wait4(child,&status,WUNTRACED,&rusa);
				int cur_Time=(int)rusa.ru_utime.tv_sec*1000+(int)rusa.ru_utime.tv_usec/1000;
				int cur_Memory=(int)rusa.ru_maxrss;
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
		return -4;
} 

void Final()
{
		//system("rm -v" HOME_PATH"/shared/* ");
		system("rm -rf " HOME_PATH"/shared/* ");
		system("cp -R " RUN_PATH "/* " HOME_PATH "/shared/");
}
int main(int argc, char* argv[])
{
		Init(argc,argv);
	//	cerr<<"Init finish..."<<endl;
		if (debug)cerr<<"Command:"<<command<<endl;
		int status=Run();
		PrintRes(status);
		Final();
		resfile.close();
		system("cp " HOME_PATH "/tmp/.result "SHARED_PATH);
		return 0;
}

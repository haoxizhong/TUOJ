#include "sandbox.h"
using namespace std;

Sandbox_t J;
void Init(int argc,char* argv[])
{
		char result;
		while (~(result =(char) getopt(argc,argv,"wha:t:m:drf:s:cp:")))
		{
				FILE *fhelp ;
				switch(result)
				{
						case 'p':
								J.set_path(optarg);
						case 'a':
								if (strcmp(optarg,"python") == 0)
								{
										J.set_action("python");
										J.set_ptrace(false);
								}
								else if (strcmp(optarg,"java") == 0)
								{
										J.set_action("java");
										J.set_ptrace(false);
								}
								else if (strcmp(optarg,"javac") == 0)
								{
										J.set_action("javac");
										J.set_limit(false);
										J.set_ptrace(false);
								}
								break;
						case 'h':
								fhelp = fopen(DEFAULT_HOME_PATH "/bin/sandbox_exec.help","r");
								char ch;
								while (~(ch=fgetc(fhelp)))
										putchar(ch);
								fclose(fhelp);
								exit(0);
						case 'c':
								J.set_action("command");
								break;
						case 't':
								int timelimit;
								sscanf(optarg,"%d",&timelimit);
								J.set_timelimit(timelimit);
								break;
						case 'm':
								int memorylimit;
								sscanf(optarg,"%d",&memorylimit);
								J.set_memorylimit(memorylimit);
								break;
						case 'f':
								J.let_fileft_assign(SHARED_PATH"/"+string(optarg));
								break;
						case 's':
								J.let_sysft_assign(SHARED_PATH"/"+string(optarg));
								break;
						case 'd':
								J.set_debug(true);
								break;
						case 'r':
								J.set_ptrace(false);
								break;
						case 'w':
								J.set_pwhitelist(true);
				}
		}
		if (!argv[optind])
		{
				cerr<<"Command required!"<<endl;
				exit(1);
		}
		J.set_command(argv[optind]);
}


int main(int argc,char* argv[])
{
		Init(argc,argv);
		J.Init();
		int status=J.Run();
		J.PrintRes(status);
		J.Final();
		return 0;
}

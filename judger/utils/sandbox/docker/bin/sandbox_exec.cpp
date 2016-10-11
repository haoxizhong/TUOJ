#include "sandbox.h"
using namespace std;

Sandbox_t J;
void Init(int argc,char* argv[])
{
		char result;
		while (~(result =(char) getopt(argc,argv,"t:m:drf:s:c")))
		{
				switch(result)
				{
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

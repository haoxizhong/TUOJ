#include <unistd.h>
#include <sys/ptrace.h>//support ptrace
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
#include "configure.h"
#include "filter.h"
//#include "system_table.h"
#ifndef __TUOJ_SANDBOX_H__
#define __TUOJ_SANDBOX_H__
using namespace std;
class Sandbox_t
{
		bool do_debug;
		bool do_ptrace;
		int timelimit;
		int memorylimit;
		string action;
		string command;
		ofstream resfile;
		filter fileft;
		sysfilter sysft;
		public:
		Sandbox_t();
		~Sandbox_t();
		void set_debug(bool debug);
		void set_ptrace(bool pt);
		void set_timelimit(int timelimit);
		void set_memorylimit(int memorylimit);
		void set_action(string action);
		void set_command(string command);
		void let_fileft_assign(string str);
		void let_sysft_assign(string str);
		void PrintRes(int x);
		void Init();
		int Run();
		void Final();
};
#endif

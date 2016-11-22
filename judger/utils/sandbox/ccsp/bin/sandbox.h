#include <unistd.h>
#include <sys/ptrace.h>//support ptrace
#include <sys/wait.h>//support wait4
#include <sys/resource.h>//support ulimit
#include <sys/user.h>//support user_regs_struct
#include <sys/stat.h>//suppor mkdir
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
#ifndef __TUOJ_SANDBOX_H__
#define __TUOJ_SANDBOX_H__
using namespace std;
class Sandbox_t
{
	private:
		bool do_debug;
		bool do_ptrace;
		bool do_limit;
		bool do_pwhitelist;
		int timelimit;
		int memorylimit;
		string home_path;
		string tmp_path;
		string shared_path;
		string run_path;
		string whitelist_path;
		string whitelist_method;

		string action;
		string command;
		ofstream resfile;
		filter fileft;
		sysfilter sysft;
		bool init_flag;
		bool status_flag;
	public:
		Sandbox_t();
		~Sandbox_t();
		void print_args();
		void set_path(string path);
		void set_debug(bool debug);
		void set_ptrace(bool pt);
		void set_limit(bool fl);
		void set_pwhitelist(bool pw);
		void set_whitelist_method(string str);
		void set_timelimit(int timelimit);
		void set_memorylimit(int memorylimit);
		void set_action(string action);
		void set_command(string command);
		void let_fileft_assign(string str);
		void let_sysft_assign(string str);
		void PrintRes(int x);
		void Init();
		int Run();
		void GenerateWhitelist(string str);
		void Final();
};
#endif

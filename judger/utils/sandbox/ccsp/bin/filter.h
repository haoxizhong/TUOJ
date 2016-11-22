#include<map>
#include<vector>
#include<string>
#include<fstream>
using namespace std;

#ifndef __TUOJ_FILTER_H__
#define __TUOJ_FILTER_H__
class sysfilter
{
		int cnt[500];
		public:
		void assign(string str);
		bool check(int x);
		void add(int x);
		void fexport(string fn);
};
class filter
{
		map<string,int> cnt;
		vector<string> dir;
		public:
		void assign(string str);
		bool check(string fn);
		void add(string str);
		void fexport(string fn);
};
#endif

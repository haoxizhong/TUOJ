#include "filter.h"
#include "configure.h"
#include<iostream>
using namespace std;
//extern const char* sysid[];
void sysfilter::assign(string str)
{
		ifstream fin(str.c_str());
		int x,y;
		while (fin>>x>>y)
				cnt[x]=y;
		fin.close();
}
bool sysfilter::check(int x)
{
		if (!cnt[x])return false;
		if (cnt[x]>0)cnt[x]--;
		return true;
}
void sysfilter::add(int x)
{
		cnt[x]=-1;
}
void sysfilter::fexport(string fn)
{
		ofstream fout(fn.c_str());
		for (int i=0;i<(int)(sizeof(cnt)/sizeof(int));i++)
				if (cnt[i])
						fout<<i<<" "<<-1<<endl;
		fout.close();
}
void filter::assign(string str)
{
		ifstream fin(str.c_str());
		while (fin>>str)
		{
				if (str[0]=='^')
						dir.push_back(str.substr(1,str.length()-1));
				else if (str[0]=='$')
						dir.push_back(HOME_PATH+string("/run")+str.substr(1,str.length()-1));
				else if (str[0]=='>')
						fin>>cnt[str.substr(1,str.length()-1)];
		}
		fin.close();
}
bool filter::check(string fn)
{
		if (cnt.find(fn)==cnt.end())
		{
				for (int i=0;i<(int)dir.size();i++)
						if (fn.size()>=dir[i].size() && fn.substr(0,dir[i].size()) == dir[i])
								return true;
				return false;
		}
		else
		{
				if (cnt[fn]==-1)
						return true;
				else if (cnt[fn]==0)
						return false;
				else  
				{
						cnt[fn]--;
						return true;
				}
		}
}

void filter::add(string str)
{
		cnt[str]=-1;
}

void filter::fexport(string fn)
{
		ofstream fout(fn.c_str());
		for (int i=0;i<(int)dir.size();i++)
				fout<<"^"<<dir[i]<<endl;
		for (map<string,int> :: iterator it1=cnt.begin();it1!=cnt.end();it1++)
				fout<<">"<<it1->first<<" "<<it1->second<<endl;
		fout.close();
}

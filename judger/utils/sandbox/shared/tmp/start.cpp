#include<iostream>
#include<fstream>
#include<cstdio>
#include<cstring>
#include<string>
#include<vector>
#include<cstdlib>
#include"json/json.h"
#include"configure.h"
using namespace std;

int main(int argc,char* args[])
{
		char buf[MAXBUF];
		if (argc==1)
		{
				argc=2;
				args[1]="001";
		}
		if (argc!=2)
		{
				cerr<<"Wrong Argument"<<endl;
				return 1;
		}
		sprintf(buf,HOME_PATH "/shared/%s/configure.json",args[1]);
		cout<<buf<<endl;
		ifstream cfgin(buf);
		if (!cfgin.is_open())
		{
				cout<<"Connot Open Configure File!"<<endl;
				return 1;
		}
		Json::Reader reader;
		Json::Value root;
		if (!reader.parse(cfgin,root,false))
		{
				cout<<"Configure Syntax Error!"<<endl;
				return 1;
		}
		cfgin.close();
		vector<string> vs;
		system("rm -r " RUN_PATH "/test");
		system("mkdir " RUN_PATH "/test");
		for (int i=0;i<(int)root["builder"]["requiredfiles"].size();i++)
		{
				sprintf(buf,"cp " HOME_PATH "/shared/%s/%s " RUN_PATH "/test",args[1],root["builder"]["requiredfiles"][i].asString().c_str());
				system(buf);
		}
		for (int i=0;i<(int)root["builder"]["sourcefiles"].size();i++)
		{
				sprintf(buf,"cp " HOME_PATH "/shared/%s/%s " RUN_PATH ,args[1],root["builder"]["sourcefiles"][i].asString().c_str());
				system(buf);
		}
		ofstream judgercfg(RUN_PATH "/judger.json");
		judgercfg<<root["judger"];
		judgercfg.close();
		ofstream buildercfg(RUN_PATH "/builder.json");
		buildercfg<<root["builder"];
		buildercfg.close();
		return 0;
}

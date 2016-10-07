#include<iostream>
#include<fstream>
#include<cstdio>
#include<cstring>
#include<string>
#include<cstdlib>
#include<unistd.h>
#include"json/json.h"
#include"configure.h"
using namespace std;

int main(int argc,const char* agrs[])
{
		Json::Reader reader;
		Json::Value root;
		ifstream buildercfg(RUN_PATH "/builder.json");
		if (!buildercfg.is_open())
		{
				cerr<<"Can not open builder configure file!"<<endl;
				return 1;
		}
		if (!reader.parse(buildercfg,root,false))
		{
				cout<<"Configure Syntax Error!"<<endl;
				return 1;
		}
		chdir(RUN_PATH);
		string compilecmd;
		if (root["language"]=="C++" && root["compile_method"]=="default")
		{
				compilecmd="g++ ";
				for (int i=0;i<root["sourcefiles"].size();i++)
						compilecmd+=root["sourcefiles"][i].asString()+" ";
				compilecmd+=" -o test/user" + root["options"].asString();
				system(compilecmd.c_str());
		}else if (root["language"]=="C" && root["compile_method"]=="default")
		{
				compilecmd="gcc ";
				for (int i=0;i<root["sourcefiles"].size();i++)
						compilecmd+=root["sourcefiles"][i].asString()+" ";
				compilecmd+=" -o test/user" + root["options"].asString();
				system(compilecmd.c_str());
		}else if (root["language"]=="Pascal" && root["options"]=="default")
		{
				compilecmd="fpc ";
				for (int i=0;i<root["sourcefiles"].size();i++)
						compilecmd+=root["sourcefiles"][i].asString()+" ";
				system(compilecmd.c_str());
		}
}

#include<iostream>
#include<fstream>
#include<cstdio>
#include<cstring>
#include<string>
#include"json/json.h"
using namespace std;
#define HOME_PATH "/home/judger"

int main()
{
		ifstream taskcfg(HOME_PATH "/shared/task.json");
		if (!taskcfg.is_open())
		{
				cout<<"Connot Open Configure File!"<<endl;
				return 1;
		}
		Json::Reader reader;
		Json::Value root;
		if (!reader.parse(taskcfg,root,false))
		{
				cout<<"Configure Syntax Error!"<<endl;
				return 1;
		}
		cout<<root["directory"].asString()<<endl;
}

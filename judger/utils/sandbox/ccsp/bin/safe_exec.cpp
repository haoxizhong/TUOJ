#include<iostream>
#include<fstream>
#include<cstdio>
#include<cstring>
#include<string>
#include<vector>
#include<cstdlib>
#include<unistd.h>
#include"configure.h"
using namespace std;

int main(int argc,char* args[])
{
		if (argc!=2)
		{
				cerr<<"Wrong Argument"<<endl;
				return 1;
		}
		chdir(HOME_PATH"/shared");
		system(args[1]);
		return 0;
}

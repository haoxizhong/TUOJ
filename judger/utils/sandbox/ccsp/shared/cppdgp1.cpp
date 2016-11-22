#include<iostream>
#include<unistd.h>
#include<cstdlib>
using namespace std;
int a[256*1024*1024/4];

int main()
{
		fork();
		cout<<"This may not be printed"<<endl;
}

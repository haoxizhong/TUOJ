#include<iostream>
#include<unistd.h>
#include<cstdlib>
using namespace std;

int main()
{
		for (int i=0;i<10000000;i++)
				--++i;
		fork();
		cout<<"asd"<<endl;
}

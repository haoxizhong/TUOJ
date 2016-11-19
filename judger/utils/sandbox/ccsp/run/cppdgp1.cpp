#include<iostream>
#include<unistd.h>
#include<cstdlib>
using namespace std;
int a[256*1024*1024/4];

int main()
{
		int n=sizeof(a)/4;
		for (int i=0;i<n;i++)
				a[i]=i;
}

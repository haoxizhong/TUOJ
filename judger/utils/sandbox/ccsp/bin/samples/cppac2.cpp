#include<iostream>
using namespace std;
int a[250*1024*1024/4];

int main()
{
		int n=sizeof(a)/sizeof(int);
		for (int i=0;i<n;i++)
				a[i]=i;
		return 0;
}

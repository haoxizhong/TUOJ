/* 
 * Source code by mhy12345 
 * Modified by laekov
 */
#include<cstdio>
#include<cstring>
#include<algorithm>
using namespace std;
#define MS_SYSTEMERROR 0
#define MS_ACCEPT 0
#define MS_WRONGANSWER 0
#define MS_PRESENTATIONERROR 0
#define MS_MISSINGSTD 0
#define MS_MISSINGOUT 0
#define BUFLEN 10000
char buf1[BUFLEN],buf2[BUFLEN], tmp[BUFLEN];
char* rbuf1,*rbuf2;
int trans(char*& str,int &len)
{
	int res=0;
	while (*str==' ' || *str=='\t')str++,res++;
	len=(int)strlen(str);
	while ((len) && str[len-1]==' ' || str[len-1]=='\n' || str[len-1]=='\r')str[--len]='\0';
	return res;
}

FILE *fscore, *ext;

void writeRes(int score, char* info) {
	if (fscore) {
		fprintf(fscore, "%d", score);
		fclose(fscore);
	}
	if (ext && info) {
		fprintf(ext, "%s", info);
		fclose(ext);
	}
}

int main(int argc,const char* args[])
{
	if (argc!=7)
	{
		fprintf(stderr, "Wrong arguments");
		return MS_SYSTEMERROR;
	}
	FILE *fres,*fstd;
	fres=fopen(args[2],"r");
	fstd=fopen(args[3],"r");
	fscore = fopen(args[5], "w");
	ext = fopen(args[6], "w");
	if (!fres)
	{
		writeRes(0, (char*)"Missing Output File!\n");
		return MS_MISSINGSTD;
	}
	if (!fstd)
	{
		writeRes(0, "Missing Standart Output!\n");
		return MS_MISSINGOUT;
	}
	bool r1,r2;
	int l1,l2;
	int i,j;
	int cnt=0;
	bool PE_flag=false;
	int c1,c2;
	while (true)
	{
		cnt++;
		r1=(bool)fgets(buf1,sizeof(buf1),fres);
		r2=(bool)fgets(buf2,sizeof(buf2),fstd);
		rbuf1=buf1,rbuf2=buf2;
		c1=trans(rbuf1,l1);
		c2=trans(rbuf2,l2);
		if (!(r1+r2))
		{
			writeRes(PE_flag ? 0 : 100, (char*)(PE_flag?"Presentation Error\n":"Accept\n"));
			return MS_ACCEPT+2*PE_flag;
		}
		else if (!r1)
		{
			do
			{
				if (l2)
				{
					if (rbuf2[10])
						rbuf2[10]=rbuf2[11]=rbuf2[12]='.',rbuf2[13]='\0';
					sprintf(tmp, "At position (%d,%d):\nRead:<End Of File>\nBut Expect:[%s]\n",cnt,1, rbuf2);
					writeRes(0, tmp);
					return MS_WRONGANSWER;
				}
				r2=fgets(buf2,sizeof(buf2),fstd);
				rbuf2=buf2;
				c2=trans(rbuf2,l2);
				if (!r2)
				{
					sprintf(tmp, PE_flag?"Presentation Error\n":"Accept\n");
					writeRes(PE_flag ? 100 : 0, tmp);
					return MS_ACCEPT+2*PE_flag;
				}
				cnt++;
			}while (true);
		}else if (!r2)
		{
			do
			{
				if (l1)
				{
					if (rbuf1[10])
						rbuf1[10]=rbuf1[11]=rbuf2[12]='.',rbuf1[13]='\0';
					sprintf(tmp, "At position (%d,%d):\nRead:[%s]\nBut Expect:<End Of File>\n",cnt,1,rbuf1);
					writeRes(0, tmp);
					return MS_WRONGANSWER;
				}
				r1=fgets(buf1,sizeof(buf1),fres);
				rbuf1=buf1;
				c1=trans(rbuf1,l1);
				if (!r1)
				{
					sprintf(tmp, PE_flag?"Presentation Error\n":"Accept\n");
					writeRes(PE_flag ? 100 : 0, tmp);
					return MS_ACCEPT+2*PE_flag;
				}
				cnt++;
			}while (true);
		}else
		{
			if (rbuf1-buf1!=rbuf2-buf2)PE_flag=true;
			int ll=min(l1,l2);
			for (i=0;i<min(10,ll);i++,rbuf1++,rbuf2++)
				if (*rbuf1!=*rbuf2)
					break;
			if (*rbuf1!=*rbuf2)
			{
				if (*(rbuf1-i+10))
					*(rbuf1-i+10)=*(rbuf1-i+11)=*(rbuf1-i+12)='.',*(rbuf1-i+13)='\0';
				if (*(rbuf2-i+10))
					*(rbuf2-i+10)=*(rbuf2-i+11)=*(rbuf2-i+12)='.',*(rbuf2-i+13)='\0';
				//		*(rbuf1-i+10)=*(rbuf2-i+10)='\0';
				sprintf(tmp, "At position (%d,%d):\nRead:[%s]\nBut Expect:[%s]\n",cnt,c1+1,rbuf1-i,rbuf2-i);
				writeRes(0, tmp);
				return MS_WRONGANSWER;
			}
			while (*rbuf1 || *rbuf2)
			{
				if (*rbuf1!=*rbuf2)
				{
					*(rbuf1+5)=*(rbuf2+5)='\0';
					sprintf(tmp, "At postion(%d,%d):\nRead:[%s]\nBut Expect:[%s]\n",cnt,c1+i-5+1,rbuf1-5,rbuf2-5);
					writeRes(0, tmp);
					return MS_WRONGANSWER;
				}
				i++;
				rbuf1++,rbuf2++;
			}
		}
	}
	writeRes(0, "System Error\n");
	return MS_SYSTEMERROR;
}

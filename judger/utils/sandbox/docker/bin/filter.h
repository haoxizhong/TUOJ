

class sysfilter
{
		int cnt[500];
		public:
		void assign(string str)
		{
				ifstream fin(str.c_str());
				int x,y;
				while (fin>>x>>y)
						cnt[x]=y;
				fin.close();
		}
		bool check(int x)
		{
				if (!cnt[x])return false;
				if (cnt[x]>0)cnt[x]--;
				return true;
		}
};
class filter
{
		map<string,int> cnt;
		vector<string> dir;
		public:
		void assign(string str)
		{
				ifstream fin(str.c_str());
				while (fin>>str)
				{
						if (str[0]=='^')
								dir.push_back(str.substr(1,str.length()-1));
						else if (str[0]=='$')
								dir.push_back(HOME_PATH+string("/run")+str.substr(1,str.length()-1));
						else
						fin>>cnt[str];
				}
				fin.close();
		}
		bool check(string fn)
		{
				if (cnt.find(fn)==cnt.end())
				{
						for (int i=0;i<dir.size();i++)
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
};


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

#include<cstdio>
void print_help_file()
{
		puts(" \
sandbox [options] [command]  \n \
 \n \
Run a command in a sandbox \n \
 \n \
OPTIONS \n \
	-h Print the help file \n \
 \n \
	-t tl Set TimitLimit as tl (sec) \n \
	-m ml Set MemoryLimit as ml (MB) \n \
	-p path Set the path of judging directory (must contain subdirectory shared with your code) \n \
	-o wlist Set which whitelist to use (cpp,java,python) \n \
 \n \
	-d Print Debug Info \n \
	-r Disable ptrace \n \
	-w Generate Whitelist mode \n \
 \n \
	-a Set Particular action \n \
		excute : excute a command \n \
			<command> is the command you wanna excute \n \
				use quotation mark if necessary \n \
 \n \
		python : excute python code  \n \
			<command> is the name of your code \n \
 \n \
		javac : compile java source code \n \
			<command> is the project name (such as 'Main') \n \
 \n \
		java : excute java code  \n \
			<command> is the project name (such as 'Main') \n \
			make sure .class is exist \n \
 \n \
 \n \
EXAMPLES \n \
	sandbox_exec -h \n \
	sandbox_exec -t 1000 -m 256 -a java Main \n \
	sandbox_exec -a python pyprog.py \n \
	sandbox_exec -p \"/home/toby/Workspace/tmp\" -a python aaa.py \n \
	sandbox_exec -o cpp \"cppac1\" \n \
	");
}

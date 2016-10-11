#TUOJ-Sandbox 使用指南
by mhy12345

##安装

1. 确保你已经正确安装docker
2. 运行./install_images，之后Sandbox镜像文件tuoj-sandbox-image就成功安装了，可以通过docker images查看
3. 运行./create_container，之后你就通过刚刚建立的镜像文件新建一个容器，名为tuoj-sanbox，并默认进入其中的命令行

##执行指令

在容器运行期间，你可以通过想shared文件夹放文件实现与容器共享

###安全指令
安全指令如g++的执行可以通过
docker exec tuoj-sandbox bin/safe_exec "g++ aaa.cpp -o aaa"
直接运行，确保aaa.cpp已经放在了shared文件夹中
也可通过
docker exec tuoj-sandbox bin/sandbox_exec -t 1000 -m 256 -r -c "g++ aaa.cpp -o aaa"
其中-t -m限制了时间空间，-r表示不监视系统调用，-c表示执行命令

###沙箱运行
对于我们刚才编译出来的aaa，我们可以通过如下运行
docker exec tuoj-sandbox bin/sandbox_exec -t 1000 -m 256 "./aaa"
运行结果存放在shared文件夹的.result文件中
运行标准输出和错误输出分别存放在.stdout和.stderr中

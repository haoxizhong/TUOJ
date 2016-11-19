fin = open("system_table.txt","r")
dd = dict()
for i in range(0,312):
    a=fin.readline().split("\t")
    dd[a[1]]=int(a[0])
fin.close()

fin = open("syscall-default.whitelist","r")
while True:
    a=fin.readline().split(" ")
    a[1]=a[1][:-1]
    print dd[a[0]],a[1]

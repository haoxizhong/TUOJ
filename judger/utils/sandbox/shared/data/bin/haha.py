from random import *

fin = open("system_table.txt","r")
print 'switch(orig_eax){';
print '{';
for i in range(0,314):
    t = fin.readline().split("\t");
    print '"%s",'%(t[1]);
print '}';

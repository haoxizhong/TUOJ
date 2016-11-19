# Result status

- Accepted
- Wrong Answer
- Time Limit Exceeded
- Memory Limit Exceeded
- Runtime Error
- Compilation Error
- No Source
- Dangerous Program

# 获得一个评测任务

POST /api/judge/get_task/acm

## Request body

~~~
{
     "token": "faf3ar42q34"
}
~~~

## Response body

~~~
{
     "run_id": 32,
     "lang": "g++", // or "java"
     "source_url": "http://tuoj.com/download/Az23.cpp",
     // 或者"source_url": ["http://tuoj.com/download/a.cpp", "http://tuoj.com/download/t1.ans", "http://tuoj.com/download/t2.ans"],

     "total_cases": 10,
     "data_md5": "4b4dc93fafa1298f95e731ebac7725d1",
     "data_url": "http://tuoj.com/download/t3.zip"
}
~~~

如果没有任务
~~~
{
     "run_id": -1 // run_id为-1
}
~~~

# 向评测机返回评测结果

POST /api/judge/update_results

## Request body

若编译正常，则 
~~~
{
     "run_id": 32,
     "token": "faf3ar42q34",

     "results": {
          "0": { // 0 用来表示编译情况
               "status": "Compilation Success"
          }
          "1": { // 测试点必须在1至total_cases之间
               "status": "Accepted",
               "time": 864, // ms
               "memory": 27815, // kB
          }
          "3": {
               "status": "Wrong Answer",
               "time": 999,
               "memory": 27813,
          }
     }
}
~~~
否则返回

~~~
{
     "run_id": 32,
     "token": "faf3ar42q34",
     "results": {
          "0": {
               "status": "Compilation Error",
               "time": 0, // ms
               "memory": 0, // kB
          }
     }
}
~~~

## Response body

~~~
{
     "status": "success"
}
~~~

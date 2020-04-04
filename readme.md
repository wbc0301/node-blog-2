# node-blog
***node-blog-原生实现***


### nginx监听   端口：8080    (修改本地 C:\nginx-1.12.2\conf\nginx.conf  使之监听: 8080)
### 静态文件服务 端口：8001   （在view中打开cmd  执行：http-server -p 8001）
### node server 端口：8000    (项目根目录中执行：npm run dev)

```
1. localhost:8080/index.html           访问: /api/blog/list           不需要登录
2. localhost:8080/detail.html?id=1     访问：/api/blog/detail?id=1    不需要登录
3. localhost:8080/login.html           访问：/api/user/login          登录    登录完成后前端跳转 location.href = './admin.html'

```

### 需开启redis  执行：redis-server

## 项目从服务到数据经过五层拆分
1. www.js 层：  创建服务，监听端口
2. app.js 层：  解析 path， query， 处理 post 请求的 data， 引入路由， 处理404
3. router 层：  处理路由 并对路由获取到的数据进行包装（成功，失败）。通过不同的URL判断，调用不同的 controller 并且传入参数。
4. controller层：  处理数据, 通过不同的 sql 调用 `exec(sql)`，并返回结果.
5. db层： 
   1. conf/db.js 连接数据库配置文件：host,port,database,user,passsword
   2. db/blog.js,redis.js 
      - 连接 mysql: `mysql.createConnection(MYSQL_CONF).connect();` ;
      声明： `exec(sql){return new Promise(...)}` 并导出。 **因为这里返回 promise 所以 controller 层，router 层后续返回的都是 promise。**
      - 连接 redis: `redisClient = redis.createClient(REDIS_CONF.port, REDIS_CONF.host)`。
      声明：`function set(key, val){redisClient.set(key, val, redis.print)}`并导出。
      声明：`function get(key) {return new Promise(...)}` 并导出。


## windows nginx 相关
1. 官网下载
2. 不用安装， 解压到本地硬盘如：     C:\nginx-1.12.2       （最好不要有中文目录）
3. 进入 nginx 根目录  打开控制台  执行 nginx               （开启 nginx 服务）
4. 检查启动成功：
  1. 浏览器访问： http://localhost:80   显示欢迎页面
  2. 也可以执行：  tasklist /fi "imagename eq nginx.exe"
5. 配置：（本项目相关）  （C:\nginx-1.12.2\conf\nginx.conf）     (参考： /src/utils/nginx.conf)
  1. worker_processes  4;
  2. listen       8080;
  3. #location / {
     #root   html;
     #index  index.html index.htm;
     #}
  4. location / {
        proxy_pass http://localhost:8001;
      }
      location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
      }
6. 停止|重启
    nginx.exe -s stop                    //停止nginx
    nginx.exe -s reload                  //重新加载nginx
    nginx.exe -s quit                    //退出nginx
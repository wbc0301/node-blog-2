const http = require('http');
const serverHandle = require('../app'); // 引入

const server = http.createServer(serverHandle); // 创建服务
server.listen(8000); // 监听端口

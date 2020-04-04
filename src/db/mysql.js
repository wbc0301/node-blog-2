const mysql = require('mysql')
const { MYSQL_CONF } = require('../conf/db')

const con = mysql.createConnection(MYSQL_CONF) // 1： 创建链接对象
 
con.connect() // 2： 开始链接

function exec(sql) { // 统一执行 sql 的函数
  const promise = new Promise((resolve, reject) => {
    con.query(sql, (err, result) => {   // 3：  访问 MySQL
      if (err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
  return promise
}

module.exports = {
  exec,
  escape: mysql.escape
}
const { exec, escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')

const login = (username, password) => {
    username = escape(username)

    password = genPassword(password)  // 生成加密密码 
    password = escape(password)

    const sql = ` select username, realname from users where username=${username} and password=${password} `
    return exec(sql).then(rows => {
        return rows[0] || {}
    })
}

module.exports = { login }
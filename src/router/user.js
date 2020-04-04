const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { set } = require('../db/redis')

const handleUserRouter = (req, res) => {
  const method = req.method // GET POST

  if (method === 'POST' && req.path === '/api/user/login') {   // 登录
    const { username, password } = req.body
    const result = login(username, password)
    return result.then(data => {
      if (data.username) {
        req.session.username = data.username  // 设置 session
        req.session.realname = data.realname  // 设置 session
        set(req.sessionId, req.session)       // 同步到 redis
        return new SuccessModel()
      }
      return new ErrorModel('登录失败')
    })
  }
}

module.exports = handleUserRouter

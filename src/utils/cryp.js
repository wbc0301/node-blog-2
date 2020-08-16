const crypto = require('crypto')

const SECRET_KEY = 'WJiol_8776#' // 密匙

function md5(str) { // md5 加密
  let md5 = crypto.createHash('md5')
  return md5.update(str).digest('hex')
}

function genPassword(password) { // 加密函数
  const str = `password=${password}&key=${SECRET_KEY}`
  return md5(str)
}

module.exports = { genPassword }

// console.log(genPassword(123456)); // 4d4994bde299f6168c65f24c852897b7
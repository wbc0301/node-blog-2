const querystring = require('querystring')
const { get, set } = require('./src/db/redis')
const { access } = require('./src/utils/log')    // 记录日志
const handleUserRouter = require('./src/router/user')
const handleBlogRouter = require('./src/router/blog')

const getCookieExpires = () => { // 获取 cookie 的过期时间
    const d = new Date()
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000))
    return d.toGMTString()     // Sun, 05 Apr 2020 14:47:41 GMT
}

const getPostData = (req) => { // 处理 post data
    return new Promise((resolve, reject) => {
        if (req.method !== 'POST') { // 非 post
            resolve({})
            return
        }
        if (req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }
        let postData = ''
        req.on('data', chunk => {
            postData += chunk.toString()
        })
        req.on('end', () => {
            if (!postData) { // 空 data
                resolve({})
                return
            }
            resolve(JSON.parse(postData))
        })
    })
}

module.exports = (req, res) => {
    // 1：记录 access log
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${new Date().toString()} -------- wbc`)

    // 2：设置返回格式 JSON
    res.setHeader('Content-type', 'application/json')

    // 3：获取 path    query
    const url = req.url
    req.path = url.split('?')[0]
    req.query = querystring.parse(url.split('?')[1])

    // 4：解析 cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || ''  // k1=v1;k2=v2;k3=v3
    cookieStr.split(';').forEach(item => {
        if (!item) return
        const arr = item.split('=')
        req.cookie[arr[0].trim()] = arr[1].trim()
    })

    // 5：解析 session （使用 redis）
    let needSetCookie = false
    let userId = req.cookie.userid
    if (!userId) {    // 用户第一次访问 种下: userId
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`  // "1597331948757_0.3133110066216691"
        set(userId, {}) // 初始化 redis 中的 session 值
    }

    // 获取 session
    req.sessionId = userId
    get(req.sessionId).then(sessionData => {
        if (sessionData == null) { // 初始化 redis 中的 session 值
            set(req.sessionId, {})
            req.session = {} // 设置 session
        } else {
            req.session = sessionData // 设置 session
        }
        return getPostData(req) // 处理 post data
    }).then(postData => {
        req.body = postData
        console.log(req.body)

        // 1：处理 user 路由
        const userResult = handleUserRouter(req, res)
        if (userResult) {
            userResult.then(userData => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                }
                res.end(JSON.stringify(userData))
            })
            return
        }

        // 2： 处理 blog 路由
        const blogResult = handleBlogRouter(req, res)
        if (blogResult) {
            blogResult.then(blogData => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)  // res.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
                }
                res.end(JSON.stringify(blogData))
            })
            return
        }



        // 3：未命中路由，返回 404
        res.writeHead(404, { "Content-type": "text/plain" })
        res.write("404 Not Found\n")
        res.end()
    })
}

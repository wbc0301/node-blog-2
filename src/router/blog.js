const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const loginCheck = (req) => { // 统一的登录验证函数
    if (!req.session.username) {
        return Promise.resolve(new ErrorModel('尚未登录'))
    }
}

const handleBlogRouter = (req, res) => {
    const method = req.method // GET POST
    const id = req.query.id

    // 获取列表
    if (method === 'GET' && req.path === '/api/blog/list') {
        let author = req.query.author || ''
        const keyword = req.query.keyword || ''
        if (req.query.isadmin) { // 管理员界面
            const loginCheckResult = loginCheck(req)
            if (loginCheckResult) { return loginCheckResult } // 未登录
            author = req.session.username // 强制查询自己的博客
        }
        const result = getList(author, keyword)
        return result.then(data => { return new SuccessModel(data) })
    }

    // 获取详情
    if (method === 'GET' && req.path === '/api/blog/detail') {
        const result = getDetail(id)
        return result.then(data => { return new SuccessModel(data) })
    }

    // 新建
    if (method === 'POST' && req.path === '/api/blog/new') {
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) { return loginCheckResult } // 未登录
        req.body.author = req.session.username
        const result = newBlog(req.body)
        return result.then(data => { return new SuccessModel(data) })
    }

    // 更新
    if (method === 'POST' && req.path === '/api/blog/update') {
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) { return loginCheckResult } // 未登录
        const result = updateBlog(id, req.body)
        return result.then(val => {
            if (val) {
                return new SuccessModel()
            } else {
                return new ErrorModel('更新博客失败')
            }
        })
    }

    // 删除
    if (method === 'POST' && req.path === '/api/blog/del') {
        const loginCheckResult = loginCheck(req)
        if (loginCheckResult) { return loginCheckResult } // 未登录
        const author = req.session.username
        const result = delBlog(id, author)
        return result.then(val => {
            if (val) {
                return new SuccessModel()
            } else {
                return new ErrorModel('删除博客失败')
            }
        })
    }
}

module.exports = handleBlogRouter
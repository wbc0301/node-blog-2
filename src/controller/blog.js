const xss = require('xss')
const { exec } = require('../db/mysql')
const moment = require('moment');

const getList = (author, keyword) => {
  let sql = `select * from blogs where 1=1 `  // where 1=1  如果没有 author|keyword 保证查询功能正常
  if (author) {
    sql += `and author='${author}' `
  }
  if (keyword) {
    sql += `and title like '%${keyword}%' `
  }
  sql += `order by createtime desc;`
  return exec(sql) // 返回 promise
}

const getDetail = (id) => {
  const sql = `select * from blogs where id='${id}'`
  return exec(sql).then(rows => {
    return rows[0]
  })
}

const newBlog = (blogData = {}) => { // blogData 是一个博客对象，包含 title content author 属性
  const title = xss(blogData.title)
  const content = xss(blogData.content)
  const author = blogData.author
  const createTime = moment().format("YYYY-MM-DD hh:mm:ss")
  const sql = `insert into blogs (title, content, createtime, author) values ('${title}', '${content}', '${createTime}', '${author}');`
  return exec(sql).then(insertData => {
    return {
      id: insertData.insertId
    }
  })
}

const updateBlog = (id, blogData = {}) => {  // id 就是要更新博客的 id   blogData 是一个博客对象，包含 title content 属性
  const title = xss(blogData.title)
  const content = xss(blogData.content)
  const sql = `update blogs set title='${title}', content='${content}' where id=${id} `
  return exec(sql).then(updateData => {
    return updateData.affectedRows > 0
  })
}

const delBlog = (id, author) => { // id 就是要删除博客的 id
  const sql = `delete from blogs where id='${id}' and author='${author}';`
  return exec(sql).then(delData => {
    return updateData.affectedRows > 0
  })
}

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
}
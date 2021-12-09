const fs = require('fs')
const path = require('path')
const util = require('util')
const { pipeline } = require('stream')
const pump = util.promisify(pipeline)
const uploadPath = path.join(__dirname, '../../upload')

module.exports = async f => {
  // 详情
  f.get(
    '/visual/detail',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
          required: ['id'],
        },
      },
    },
    async req => {
      const { id } = req.query
      const data = {}

      let rs = await f.db.query({
        sql: `SELECT * FROM blade_visual WHERE id=?`,
        values: [id],
      })

      if (rs[0].length !== 1) throw new Error()

      rs = rs[0][0]
      data.visual = {
        id: rs.id,
        categoryId: rs.category_id,
        backgroundUrl: rs.background_url,
        createTime: rs.create_time,
        isDeleted: rs.is_deleted,
        password: rs.password,
        status: rs.status,
        title: rs.title,
        updateTime: rs.update_time,
      }

      rs = await f.db.query({
        sql: `SELECT * FROM blade_visual_config WHERE visual_id=?`,
        values: [id],
      })

      if (rs[0].length !== 1) throw new Error()

      rs = rs[0][0]
      data.config = {
        component: rs.component,
        detail: rs.detail,
        id: rs.id,
        visualId: rs.visual_id,
      }

      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data,
      }
    }
  )

  // 分页
  f.get(
    '/visual/list',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            categoryId: { type: 'number' },
            current: { type: 'number' },
            size: { type: 'number' },
          },
          required: ['categoryId', 'current', 'size'],
        },
      },
    },
    async req => {
      const { categoryId, current, size } = req.query

      let rs = await f.db.query({
        sql: `SELECT COUNT(category_id=${categoryId} or null) AS total FROM blade_visual WHERE is_deleted=0`,
        values: [],
      })

      const total = rs[0][0].total
      const data = {
        hitCount: false,
        searchCount: true,
        records: [],
        pages: Math.ceil(total / size),
        total,
        current,
        size,
      }

      rs = await f.db.query({
        sql: `SELECT * FROM blade_visual WHERE is_deleted=0 AND category_id=? ORDER BY id LIMIT ? OFFSET ?`,
        values: [categoryId, size, (current - 1) * size],
      })

      rs[0].forEach(v => {
        data.records.push({
          id: v.id,
          categoryId: v.category_id,
          title: v.title,
          backgroundUrl: v.background_url,
          password: v.password,
          status: v.status,
          isDeleted: v.is_deleted,
        })
      })

      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data,
      }
    }
  )

  // 新增
  f.post(
    '/visual/save',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            config: {
              type: 'object',
              properties: {
                component: { type: 'string' },
                detail: { type: 'string' },
              },
            },
            visual: {
              type: 'object',
              properties: {
                categoryId: { type: 'number' },
                password: { type: 'string' },
                title: { type: 'string' },
              },
            },
          },
          required: ['config', 'visual'],
        },
      },
    },
    async req => {
      const { config, visual } = req.body

      // 事务
      let rs = await f.db.query({
        sql: `INSERT INTO blade_visual SET ?`,
        values: {
          category_id: visual.categoryId,
          password: visual.password,
          title: visual.title,
        },
      })

      if (rs[0].affectedRows !== 1) throw new Error()

      const data = { id: rs[0].insertId }

      rs = await f.db.query({
        sql: `INSERT INTO blade_visual_config SET ?`,
        values: {
          visual_id: rs[0].insertId,
          ...config,
        },
      })

      if (rs[0].affectedRows !== 1) throw new Error()

      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data,
      }
    }
  )

  // 修改
  f.post(
    '/visual/update',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            config: {
              type: 'object',
              properties: {
                component: { type: 'string' },
                detail: { type: 'string' },
                id: { type: 'number' },
                visualId: { type: 'number' },
              },
            },
            visual: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                backgroundUrl: { type: 'string' },
              },
            },
          },
          required: ['config', 'visual'],
        },
      },
    },
    async req => {
      const { config, visual } = req.body

      // 事务
      let rs = await f.db.query({
        sql: `UPDATE blade_visual SET background_url=? WHERE id=?`,
        values: [visual.backgroundUrl, visual.id],
      })

      rs = await f.db.query({
        sql: `UPDATE blade_visual_config SET component=?,detail=? WHERE id=?`,
        values: [config.component, config.detail, config.id],
      })

      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data: {},
      }
    }
  )
  // 修改
  f.patch(
    '/visual/update',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            visual: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                categoryId: { type: 'number' },
                password: { type: 'string' },
                title: { type: 'string' },
              },
            },
          },
          required: ['visual'],
        },
      },
    },
    async req => {
      const { visual } = req.body

      // 事务
      await f.db.query({
        sql: `UPDATE blade_visual SET category_id=?,password=?,title=? WHERE id=?`,
        values: [visual.categoryId, visual.password, visual.title, visual.id],
      })

      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data: {},
      }
    }
  )

  // 删除
  f.post(
    '/visual/remove',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            ids: { type: 'number' },
          },
          required: ['ids'],
        },
      },
    },
    async req => {
      const { ids } = req.query

      await f.db.query({
        sql: `UPDATE blade_visual SET is_deleted=1 WHERE id=?`,
        values: [ids],
      })

      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data: {},
      }
    }
  )

  // 复制
  f.post(
    '/visual/copy',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
          required: ['id'],
        },
      },
    },
    async req => {
      const { id } = req.query

      let rs = await f.db.query({
        sql: `SELECT * FROM blade_visual INNER JOIN blade_visual_config ON blade_visual.id=blade_visual_config.visual_id WHERE blade_visual.id=?`,
        values: [id],
      })

      if (rs[0].length !== 1) throw new Error()

      rs = rs[0][0]
      const visual = {
        title: rs.title,
        category_id: rs.category_id,
        background_url: rs.background_url,
      }
      const config = {
        component: rs.component,
        detail: rs.detail,
      }

      // 事务
      rs = await f.db.query({
        sql: `INSERT INTO blade_visual SET ?`,
        values: visual,
      })

      if (rs[0].affectedRows !== 1) throw new Error()

      const data = rs[0].insertId
      config.visual_id = rs[0].insertId

      rs = await f.db.query({
        sql: `INSERT INTO blade_visual_config SET ?`,
        values: config,
      })

      if (rs[0].affectedRows !== 1) throw new Error()

      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data,
      }
    }
  )

  // 上传
  f.post(
    '/visual/put-file',
    {
      schema: {},
    },
    async req => {
      const file = await req.file()
      const filePath = path.join(uploadPath, file.filename)
      await pump(file.file, fs.createWriteStream(filePath))
      const data = {
        link: `/upload/${file.filename}`,
      }
      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data,
      }
    }
  )
}

module.exports = async f => {
  // 详情
  f.get(
    '/category/detail',
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
        sql: `SELECT * FROM blade_visual_category WHERE id=?`,
        values: [id],
      })

      if (rs[0].length !== 1) throw new Error()

      rs = rs[0][0]
      const data = {
        id: rs.id,
        name: rs.name,
        isDeleted: rs.is_deleted,
      }

      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data,
      }
    }
  )

  // 列表
  f.get(
    '/category/list',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            current: { type: 'number', default: 1 },
            size: { type: 'number', default: 100 },
          },
        },
      },
    },
    async req => {
      const { current, size } = req.query

      const rs = await f.db.query({
        sql: `SELECT * FROM blade_visual_category WHERE is_deleted=0 ORDER BY id LIMIT ? OFFSET ?`,
        values: [size, (current - 1) * size],
      })

      const data = []
      rs[0].forEach(v => {
        data.push({
          id: v.id,
          name: v.name,
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

  // 分页
  f.get(
    '/category/page',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            current: { type: 'number' },
            size: { type: 'number' },
          },
          required: ['current', 'size'],
        },
      },
    },
    async req => {
      const { current, size } = req.query

      let rs = await f.db.query({
        sql: `SELECT COUNT(*) AS total FROM blade_visual_category WHERE is_deleted=0`,
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
        sql: `SELECT * FROM blade_visual_category WHERE is_deleted=0 ORDER BY id LIMIT ? OFFSET ?`,
        values: [size, (current - 1) * size],
      })

      rs[0].forEach(v => {
        data.records.push({
          id: v.id,
          name: v.name,
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
    '/category/save',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        },
      },
    },
    async req => {
      const { name } = req.body

      const rs = await f.db.query({
        sql: `INSERT INTO blade_visual_category SET name=?`,
        values: [name],
      })

      if (rs[0].affectedRows !== 1) throw new Error()

      return {
        code: 200,
        msg: '操作成功',
        success: true,
        data: {},
      }
    }
  )

  // 修改
  f.post(
    '/category/update',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            id: { type: 'number' },
          },
          required: ['name', 'id'],
        },
      },
    },
    async req => {
      const { name, id } = req.body

      await f.db.query({
        sql: `UPDATE blade_visual_category SET name=? WHERE id=?`,
        values: [name, id],
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
    '/category/remove',
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
        sql: `UPDATE blade_visual_category SET is_deleted=1 WHERE id=?`,
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
}

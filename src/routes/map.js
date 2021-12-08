module.exports = async f => {
  // 详情
  f.get(
    '/map/detail',
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
        sql: `SELECT * FROM blade_visual_map WHERE id=?`,
        values: [id],
      })

      if (rs[0].length !== 1) throw new Error()

      rs = rs[0][0]
      const data = {
        id: rs.id,
        name: rs.name,
        data: rs.data,
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
    '/map/list',
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

      let rs = await f.db.query({
        sql: `SELECT COUNT(*) AS total FROM blade_visual_map`,
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
        sql: `SELECT * FROM blade_visual_map ORDER BY id LIMIT ? OFFSET ?`,
        values: [size, (current - 1) * size],
      })

      rs[0].forEach(v => {
        data.records.push({
          id: v.id,
          name: v.name,
          data: v.data,
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
    '/map/save',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            data: { type: 'string' },
          },
          required: ['name', 'data'],
        },
      },
    },
    async req => {
      const { name, data } = req.body

      const rs = await f.db.query({
        sql: `INSERT INTO blade_visual_map SET name=?,data=?`,
        values: [name, data],
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
    '/map/update',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            data: { type: 'string' },
            id: { type: 'number' },
          },
          required: ['name', 'data', 'id'],
        },
      },
    },
    async req => {
      const { name, data, id } = req.body

      await f.db.query({
        sql: `UPDATE blade_visual_map SET name=?,data=? WHERE id=?`,
        values: [name, data, id],
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
    '/map/remove',
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

      const rs = await f.db.query({
        sql: `DELETE FROM blade_visual_map WHERE id=?`,
        values: [ids],
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
}

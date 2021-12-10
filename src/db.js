const fastifyPlugin = require('fastify-plugin')
const mysql = require('mysql2')

async function dbConnector(fastify, options) {
  const pool = await mysql.createPool({
    host: '152.136.200.17',
    user: 'root',
    password: 'nayukidayo',
    database: 'bladex',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  const db = pool.promise()
  fastify.decorate('db', db)
}

module.exports = fastifyPlugin(dbConnector)

// docker run --restart=always --name mysql-avue -p 3306:3306 -v /srv/avue/mysql:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=nayukidayo -d mysql:5.7 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --max_allowed_packet=32505856

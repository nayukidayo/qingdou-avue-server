const fastifyPlugin = require('fastify-plugin')
const mysql = require('mysql2/promise')

async function dbConnector(fastify, options) {
  const connection = await mysql.createConnection({
    host: '152.136.200.17',
    user: 'root',
    password: 'nayukidayo',
    database: 'bladex',
    charset: 'utf8mb4',
  })
  fastify.decorate('db', connection)
}

module.exports = fastifyPlugin(dbConnector)


// docker run --name mysql-avue -p 3306:3306 -v /srv/avue/mysql:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=nayukidayo -d mysql:5.7 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --max_allowed_packet=32505856
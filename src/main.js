const fastify = require('fastify')({
  logger: false,
})

fastify.setErrorHandler(async (err, req, res) => {
  console.log(err)
  return {
    code: 400,
  }
})

const start = async () => {
  try {
    await fastify.register(require('./db'))
    await fastify.register(require('fastify-cors'))
    await fastify.register(require('fastify-multipart'))
    await fastify.register(require('./routes/category'))
    await fastify.register(require('./routes/visual'))
    await fastify.register(require('./routes/map'))

    await fastify.listen(3000, '0.0.0.0')
  } catch (err) {
    // fastify.log.error(err)
    console.log(err)
    process.exit(1)
  }
}
start()

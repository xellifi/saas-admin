export default async function (fastify, opts) {
    fastify.get('/api/store/products', async (request, reply) => {
        return {
            success: true,
            data: [
                { id: 1, name: 'T-Shirt', price: 19.99, stock: 45 },
                { id: 2, name: 'Coffee Mug', price: 9.99, stock: 120 }
            ]
        }
    })
    fastify.log.info('Online Store addon backend registered')
}

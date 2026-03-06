import { executeQuery } from '../db.js';

export default async function ordersPlugin(fastify, options) {
    // GET all orders
    fastify.get('', async (request, reply) => {
        try {
            const accountId = request.query.accountId || (request.user && request.user.id);
            const storeId = request.query.storeId;
            if (!accountId) return reply.status(400).send({ error: 'accountId is required' });

            let query = 'SELECT * FROM online_store_orders WHERE account_id = ?';
            let params = [accountId];

            if (storeId) {
                query += ' AND store_id = ?';
                params.push(storeId);
            }

            query += ' ORDER BY created_at DESC';

            const orders = await executeQuery(query, params);
            return { success: true, data: { orders } };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch orders' });
        }
    });

    // GET single order details
    fastify.get('/:id', async (request, reply) => {
        try {
            const orderId = request.params.id;
            const accountId = request.query.accountId || (request.user && request.user.id);

            const orders = await executeQuery(
                'SELECT * FROM online_store_orders WHERE id = ? AND account_id = ?',
                [orderId, accountId]
            );

            if (!orders || orders.length === 0) {
                return reply.status(404).send({ error: 'Order not found' });
            }

            return { success: true, data: { order: orders[0] } };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch order' });
        }
    });

    // UPDATE order status
    fastify.put('/:id/status', async (request, reply) => {
        try {
            const orderId = request.params.id;
            const { status } = request.body;
            const accountId = request.body.accountId || (request.user && request.user.id);

            if (!status) return reply.status(400).send({ error: 'status is required' });

            await executeQuery(
                'UPDATE online_store_orders SET status = ? WHERE id = ? AND account_id = ?',
                [status, orderId, accountId]
            );

            return { success: true, message: 'Order status updated' };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to update order status' });
        }
    });
}

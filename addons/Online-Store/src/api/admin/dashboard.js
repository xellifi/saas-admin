import { executeQuery } from '../db.js';

export default async function dashboardPlugin(fastify, options) {
    fastify.get('', async (request, reply) => {
        try {
            const accountId = request.query.accountId || (request.user && request.user.id);
            const storeId = request.query.storeId;
            if (!accountId) return reply.status(400).send({ error: 'accountId is required' });

            let whereClause = 'WHERE account_id = ?';
            let params = [accountId];

            if (storeId) {
                whereClause += ' AND store_id = ?';
                params.push(storeId);
            }

            // Stats
            const products = await executeQuery(`SELECT COUNT(*) as count FROM online_store_products ${whereClause}`, params);
            const orders = await executeQuery(`SELECT COUNT(*) as count FROM online_store_orders ${whereClause}`, params);
            const revenue = await executeQuery(`SELECT SUM(total) as sum FROM online_store_orders ${whereClause} AND status = ?`, [...params, 'paid']);
            
            // New order status stats
            const shippedOut = await executeQuery(`SELECT COUNT(*) as count FROM online_store_orders ${whereClause} AND fulfillment_status = ?`, [...params, 'fulfilled']);
            const pendingOrders = await executeQuery(`SELECT COUNT(*) as count FROM online_store_orders ${whereClause} AND status = ?`, [...params, 'pending']);
            const returnedOrders = await executeQuery(`SELECT COUNT(*) as count FROM online_store_orders ${whereClause} AND fulfillment_status = ?`, [...params, 'refunded']);
            
            const inventoryAlerts = await executeQuery(`SELECT * FROM online_store_products ${whereClause} AND inventory < 10 LIMIT 5`, params);
            const recentOrders = await executeQuery(`SELECT * FROM online_store_orders ${whereClause} ORDER BY created_at DESC LIMIT 5`, params);

            // Settings for setup check / switcher
            const storeSettings = await executeQuery('SELECT * FROM online_store_settings WHERE account_id = ?', [accountId]);

            return {
                success: true,
                data: {
                    stats: {
                        products: products[0]?.count || 0,
                        orders: orders[0]?.count || 0,
                        revenue: revenue[0]?.sum || 0,
                        shippedOut: shippedOut[0]?.count || 0,
                        pending: pendingOrders[0]?.count || 0,
                        returned: returnedOrders[0]?.count || 0
                    },
                    alerts: inventoryAlerts,
                    recentOrders,
                    storeSettings: storeSettings // Return all stores for the account
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch dashboard stats' });
        }
    });
}

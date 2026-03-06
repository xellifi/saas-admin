import { executeQuery } from '../db.js';

export default async function storePlugin(fastify, options) {
    // GET public store profile by accountId (legacy)
    fastify.get('/:accountId', async (request, reply) => {
        try {
            const accountId = request.params.accountId;

            const settings = await executeQuery('SELECT id, account_id, store_name, currency, enabled, store_slug, custom_domain, theme_color, payment_methods FROM online_store_settings WHERE account_id = ? AND enabled = TRUE LIMIT 1', [accountId]);
            if (!settings || settings.length === 0) return reply.status(404).send({ error: 'Store not found or disabled' });

            const store = settings[0];
            const products = await executeQuery('SELECT id, name, slug, description, price, images, inventory FROM online_store_products WHERE store_id = ? AND status = ?', [store.id, 'published']);

            return { success: true, store, products };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch store' });
        }
    });

    // GET public store profile by slug
    fastify.get('/slug/:slug', async (request, reply) => {
        try {
            const slug = request.params.slug;

            const settings = await executeQuery('SELECT id, account_id, store_name, currency, enabled, store_slug, custom_domain, theme_color, payment_methods FROM online_store_settings WHERE store_slug = ? AND enabled = TRUE', [slug]);
            if (!settings || settings.length === 0) return reply.status(404).send({ error: 'Store not found or disabled' });

            const store = settings[0];
            const products = await executeQuery('SELECT id, name, slug, description, price, images, inventory FROM online_store_products WHERE store_id = ? AND status = ?', [store.id, 'published']);

            return { success: true, store, products };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch store by slug' });
        }
    });

    // POST checkout
    fastify.post('/:accountId/checkout', async (request, reply) => {
        try {
            const accountId = request.params.accountId;
            const { customerName, customerEmail, items, paymentMethod } = request.body;

            if (!items || !items.length) return reply.status(400).send({ error: 'Cart is empty' });

            // Validate store is enabled
            const settings = await executeQuery('SELECT * FROM online_store_settings WHERE account_id = ? AND id = ? AND enabled = TRUE', [accountId, request.body.storeId || 0]);
            if (!settings || settings.length === 0) return reply.status(404).send({ error: 'Store not found or disabled' });

            // Calculate total and prep items
            let total = 0;
            const orderItems = [];

            for (const item of items) {
                const productDb = await executeQuery('SELECT price FROM online_store_products WHERE id = ? AND account_id = ?', [item.productId, accountId]);
                if (productDb.length > 0) {
                    const price = parseFloat(productDb[0].price);
                    total += price * item.qty;
                    orderItems.push({ productId: item.productId, qty: item.qty, price });
                }
            }

            // Apply tax and shipping
            const storeSettings = settings[0];
            const taxRate = parseFloat(storeSettings.tax_rate || 0);
            const tax = (total * taxRate) / 100;
            const shipping = parseFloat(storeSettings.shipping_flat_rate || 0);
            total = total + tax + shipping;

            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const result = await executeQuery(
                `INSERT INTO online_store_orders (account_id, store_id, order_number, customer_name, customer_email, items, total, status, payment_method)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [accountId, storeSettings.id, orderNumber, customerName, customerEmail, JSON.stringify(orderItems), total.toFixed(2), 'pending', paymentMethod || 'credit_card']
            );

            // Deduct inventory
            for (const item of orderItems) {
                await executeQuery('UPDATE online_store_products SET inventory = inventory - ? WHERE id = ?', [item.qty, item.productId]);
            }

            return reply.status(201).send({ success: true, orderId: result.insertId, orderNumber, message: 'Order placed successfully' });

        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to process checkout' });
        }
    });

    // GET public invoice
    fastify.get('/invoice/:invoiceId', async (request, reply) => {
        try {
            const invoiceId = request.params.invoiceId;
            const orders = await executeQuery('SELECT * FROM online_store_orders WHERE id = ?', [invoiceId]);
            if (!orders || orders.length === 0) return reply.status(404).send({ error: 'Invoice not found' });

            const order = orders[0];
            const settings = await executeQuery('SELECT store_name, custom_domain FROM online_store_settings WHERE account_id = ?', [order.account_id]);

            return { success: true, order, store: settings[0] || {} };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch invoice' });
        }
    });
}

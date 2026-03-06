import productsPlugin from './admin/products.js';
import ordersPlugin from './admin/orders.js';
import dashboardPlugin from './admin/dashboard.js';
import storesPlugin from './admin/stores.js';
import storePlugin from './public/store.js';

export default async function onlineStoreAddon(fastify, options) {
    fastify.log.info('Registering Online Store Addon routes');

    // Admin routes
    fastify.register(productsPlugin, { prefix: '/api/addons/online-store/admin/products' });
    fastify.register(ordersPlugin, { prefix: '/api/addons/online-store/admin/orders' });
    fastify.register(dashboardPlugin, { prefix: '/api/addons/online-store/admin/dashboard' });
    fastify.register(storesPlugin, { prefix: '/api/addons/online-store/admin/stores' });

    // Public routes
    fastify.register(storePlugin, { prefix: '/api/addons/online-store/public/store' });
}

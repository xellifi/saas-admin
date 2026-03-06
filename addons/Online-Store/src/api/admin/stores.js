import { executeQuery } from '../db.js';

export default async function storesPlugin(fastify, options) {
    // List all stores for an account
    fastify.get('', async (request, reply) => {
        try {
            const accountId = request.query.accountId || (request.user && request.user.id);
            if (!accountId) return reply.status(400).send({ error: 'accountId is required' });

            const stores = await executeQuery(
                'SELECT * FROM online_store_settings WHERE account_id = ? ORDER BY created_at DESC',
                [accountId]
            );
            return { success: true, data: stores };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch stores' });
        }
    });

    // Get single store with preferences
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const accountId = request.query.accountId || (request.user && request.user.id);

            const stores = await executeQuery(
                'SELECT * FROM online_store_settings WHERE id = ? AND account_id = ?',
                [id, accountId]
            );

            if (!stores || stores.length === 0) {
                return reply.status(404).send({ error: 'Store not found' });
            }

            // Get store preferences
            const preferences = await executeQuery(
                'SELECT * FROM online_store_preferences WHERE store_id = ? ORDER BY category, setting_key',
                [id]
            );

            const store = stores[0];
            store.preferences = preferences;

            return { success: true, data: store };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch store' });
        }
    });

    // Create a new store
    fastify.post('', async (request, reply) => {
        try {
            const accountId = request.body.accountId || (request.user && request.user.id);
            const { 
                store_name, 
                store_slug, 
                currency = 'USD', 
                theme_color = '#2563eb',
                logo_url = '',
                banner_url = '',
                payment_methods = [],
                shipping_methods = [],
                email_settings = {},
                social_links = {},
                custom_css = '',
                custom_js = '',
                maintenance_mode = false,
                enabled = true
            } = request.body;

            if (!accountId || !store_name || !store_slug) {
                return reply.status(400).send({ error: 'Missing required fields' });
            }

            // Always create a new store (multi-store mode)
            let result;
            try {
                // Try new multi-store INSERT first
                result = await executeQuery(
                    `INSERT INTO online_store_settings 
                    (account_id, store_name, store_slug, currency, theme_color, logo_url, banner_url,
                     payment_methods, shipping_methods, email_settings, social_links, custom_css, custom_js,
                     maintenance_mode, enabled) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        accountId, store_name, store_slug, currency, theme_color, logo_url, banner_url,
                        JSON.stringify(payment_methods), JSON.stringify(shipping_methods), 
                        JSON.stringify(email_settings), JSON.stringify(social_links), 
                        custom_css, custom_js, maintenance_mode, enabled
                    ]
                );
            } catch (error) {
                // If new INSERT fails, try old legacy INSERT
                console.log('New INSERT failed, trying legacy INSERT:', error.message);
                console.log('Error details:', error);
                console.log('Error code:', error.code);
                console.log('Error sqlMessage:', error.sqlMessage);
                
                // Try minimal INSERT with only basic columns
                try {
                    result = await executeQuery(
                        `INSERT INTO online_store_settings 
                        (account_id, store_name, store_slug, currency, enabled) 
                        VALUES (?, ?, ?, ?, ?)`,
                        [accountId, store_name, store_slug, currency, enabled]
                    );
                    console.log('Minimal INSERT succeeded');
                } catch (minimalError) {
                    console.log('Minimal INSERT also failed:', minimalError.message);
                    throw minimalError;
                }
            }

            // Create default preferences for new stores
            const defaultPreferences = [
                ['general', 'store_description', '', 'string'],
                ['general', 'store_email', '', 'string'],
                ['general', 'store_phone', '', 'string'],
                ['general', 'store_address', '', 'json'],
                ['display', 'products_per_page', '12', 'number'],
                ['display', 'show_out_of_stock', 'true', 'boolean'],
                ['checkout', 'require_phone', 'false', 'boolean'],
                ['checkout', 'enable_guest_checkout', 'true', 'boolean'],
                ['shipping', 'free_shipping_threshold', '0', 'number'],
                ['tax', 'tax_included', 'false', 'boolean'],
                ['notifications', 'new_order_email', 'true', 'boolean'],
                ['notifications', 'low_stock_email', 'true', 'boolean']
            ];

            for (const [category, key, value, type] of defaultPreferences) {
                await executeQuery(
                    'INSERT INTO online_store_preferences (store_id, category, setting_key, setting_value, setting_type) VALUES (?, ?, ?, ?, ?)',
                    [result.insertId, category, key, value, type]
                );
            }

            return { success: true, id: result.insertId };
        } catch (error) {
            fastify.log.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return reply.status(400).send({ error: 'Store URL already exists' });
            }
            return reply.status(500).send({ error: 'Failed to create store' });
        }
    });

    // Update a store
    fastify.put('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const accountId = request.body.accountId || (request.user && request.user.id);
            const { 
                store_name, 
                store_slug, 
                currency, 
                theme_color, 
                logo_url, 
                banner_url,
                payment_methods, 
                shipping_methods, 
                email_settings, 
                social_links, 
                custom_css, 
                custom_js, 
                maintenance_mode, 
                enabled 
            } = request.body;

            // Check if store belongs to user
            const stores = await executeQuery(
                'SELECT id FROM online_store_settings WHERE id = ? AND account_id = ?',
                [id, accountId]
            );

            if (!stores || stores.length === 0) {
                return reply.status(404).send({ error: 'Store not found' });
            }

            // Build dynamic UPDATE query based on what columns actually exist
            let updateFields = [];
            let updateValues = [];

            if (store_name !== undefined) {
                updateFields.push('store_name = ?');
                updateValues.push(store_name);
            }
            if (store_slug !== undefined) {
                updateFields.push('store_slug = ?');
                updateValues.push(store_slug);
            }
            if (currency !== undefined) {
                updateFields.push('currency = ?');
                updateValues.push(currency);
            }
            if (theme_color !== undefined) {
                updateFields.push('theme_color = ?');
                updateValues.push(theme_color);
            }
            if (logo_url !== undefined) {
                updateFields.push('logo_url = ?');
                updateValues.push(logo_url);
            }
            if (banner_url !== undefined) {
                updateFields.push('banner_url = ?');
                updateValues.push(banner_url);
            }
            if (payment_methods !== undefined) {
                updateFields.push('payment_methods = ?');
                updateValues.push(JSON.stringify(payment_methods));
            }
            if (shipping_methods !== undefined) {
                updateFields.push('shipping_methods = ?');
                updateValues.push(JSON.stringify(shipping_methods));
            }
            if (email_settings !== undefined) {
                updateFields.push('email_settings = ?');
                updateValues.push(JSON.stringify(email_settings));
            }
            if (social_links !== undefined) {
                updateFields.push('social_links = ?');
                updateValues.push(JSON.stringify(social_links));
            }
            if (custom_css !== undefined) {
                updateFields.push('custom_css = ?');
                updateValues.push(custom_css);
            }
            if (custom_js !== undefined) {
                updateFields.push('custom_js = ?');
                updateValues.push(custom_js);
            }
            if (maintenance_mode !== undefined) {
                updateFields.push('maintenance_mode = ?');
                updateValues.push(maintenance_mode);
            }
            if (enabled !== undefined) {
                updateFields.push('enabled = ?');
                updateValues.push(enabled);
            }

            // Try to add updated_at if the column exists
            try {
                updateFields.push('updated_at = CURRENT_TIMESTAMP');
            } catch (e) {
                // Column doesn't exist, ignore
            }

            if (updateFields.length === 0) {
                return reply.status(400).send({ error: 'No valid fields to update' });
            }

            const updateQuery = `UPDATE online_store_settings SET ${updateFields.join(', ')} WHERE id = ?`;
            updateValues.push(id);

            await executeQuery(updateQuery, updateValues);

            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to update store', details: error.message });
        }
    });

    // Duplicate a store
    fastify.post('/:id/duplicate', async (request, reply) => {
        try {
            const { id } = request.params;
            const accountId = request.body.accountId || (request.user && request.user.id);

            // Get original store
            const stores = await executeQuery(
                'SELECT * FROM online_store_settings WHERE id = ? AND account_id = ?',
                [id, accountId]
            );

            if (!stores || stores.length === 0) {
                return reply.status(404).send({ error: 'Store not found' });
            }

            const originalStore = stores[0];
            const newSlug = `${originalStore.store_slug}-copy-${Date.now()}`;

            // Create duplicate
            const result = await executeQuery(
                `INSERT INTO online_store_settings 
                (account_id, store_name, store_slug, currency, theme_color, logo_url, banner_url,
                 payment_methods, shipping_methods, email_settings, social_links, custom_css, custom_js,
                 maintenance_mode, enabled) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    accountId, 
                    `${originalStore.store_name} (Copy)`, 
                    newSlug, 
                    originalStore.currency, 
                    originalStore.theme_color, 
                    originalStore.logo_url, 
                    originalStore.banner_url,
                    originalStore.payment_methods, 
                    originalStore.shipping_methods, 
                    originalStore.email_settings, 
                    originalStore.social_links, 
                    originalStore.custom_css, 
                    originalStore.custom_js, 
                    originalStore.maintenance_mode, 
                    false // Start disabled
                ]
            );

            // Copy preferences
            const preferences = await executeQuery(
                'SELECT * FROM online_store_preferences WHERE store_id = ?',
                [id]
            );

            for (const pref of preferences) {
                await executeQuery(
                    'INSERT INTO online_store_preferences (store_id, category, setting_key, setting_value, setting_type, is_public) VALUES (?, ?, ?, ?, ?, ?)',
                    [result.insertId, pref.category, pref.setting_key, pref.setting_value, pref.setting_type, pref.is_public]
                );
            }

            return { success: true, id: result.insertId };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to duplicate store' });
        }
    });

    // Update store preferences
    fastify.put('/:id/preferences', async (request, reply) => {
        try {
            const { id } = request.params;
            const accountId = request.body.accountId || (request.user && request.user.id);
            const { preferences } = request.body;

            // Check if store belongs to user
            const stores = await executeQuery(
                'SELECT id FROM online_store_settings WHERE id = ? AND account_id = ?',
                [id, accountId]
            );

            if (!stores || stores.length === 0) {
                return reply.status(404).send({ error: 'Store not found' });
            }

            // Update preferences
            for (const [key, pref] of Object.entries(preferences)) {
                try {
                    await executeQuery(
                        'INSERT INTO online_store_preferences (store_id, category, setting_key, setting_value, setting_type, is_public) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP',
                        [
                            id, 
                            pref.category || 'general', 
                            key, 
                            typeof pref.value === 'object' ? JSON.stringify(pref.value) : pref.value,
                            pref.type || 'string',
                            pref.public || false
                        ]
                    );
                } catch (error) {
                    console.log('Preference insert failed for key:', key, error);
                    // Try simple INSERT without duplicate key handling
                    await executeQuery(
                        'INSERT INTO online_store_preferences (store_id, category, setting_key, setting_value, setting_type, is_public) VALUES (?, ?, ?, ?, ?, ?)',
                        [
                            id, 
                            pref.category || 'general', 
                            key, 
                            typeof pref.value === 'object' ? JSON.stringify(pref.value) : pref.value,
                            pref.type || 'string',
                            pref.public || false
                        ]
                    );
                }
            }

            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to update preferences' });
        }
    });

    // Reset store preferences to defaults
    fastify.put('/:id/preferences/reset', async (request, reply) => {
        try {
            const { id } = request.params;
            const accountId = request.body.accountId || (request.user && request.user.id);

            // Check if store belongs to user
            const stores = await executeQuery(
                'SELECT id FROM online_store_settings WHERE id = ? AND account_id = ?',
                [id, accountId]
            );

            if (!stores || stores.length === 0) {
                return reply.status(404).send({ error: 'Store not found' });
            }

            // Delete existing preferences
            await executeQuery(
                'DELETE FROM online_store_preferences WHERE store_id = ?',
                [id]
            );

            // Insert default preferences
            const defaultPreferences = [
                ['general', 'store_description', '', 'string'],
                ['general', 'store_email', '', 'string'],
                ['general', 'store_phone', '', 'string'],
                ['general', 'store_address', '', 'json'],
                ['display', 'products_per_page', '12', 'number'],
                ['display', 'show_out_of_stock', 'true', 'boolean'],
                ['checkout', 'require_phone', 'false', 'boolean'],
                ['checkout', 'enable_guest_checkout', 'true', 'boolean'],
                ['shipping', 'free_shipping_threshold', '0', 'number'],
                ['tax', 'tax_included', 'false', 'boolean'],
                ['notifications', 'new_order_email', 'true', 'boolean'],
                ['notifications', 'low_stock_email', 'true', 'boolean']
            ];

            for (const [category, key, value, type] of defaultPreferences) {
                await executeQuery(
                    'INSERT INTO online_store_preferences (store_id, category, setting_key, setting_value, setting_type) VALUES (?, ?, ?, ?, ?)',
                    [id, category, key, value, type]
                );
            }

            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to reset preferences' });
        }
    });

    // Delete a store
    fastify.delete('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const accountId = request.query.accountId || (request.user && request.user.id);

            // Check if store belongs to user
            const stores = await executeQuery(
                'SELECT id FROM online_store_settings WHERE id = ? AND account_id = ?',
                [id, accountId]
            );

            if (!stores || stores.length === 0) {
                return reply.status(404).send({ error: 'Store not found' });
            }

            // Note: We don't delete products/orders, we just delete store profile.
            // Products/orders remain in DB but orphaned from this storefront.
            await executeQuery('DELETE FROM online_store_settings WHERE id = ?', [id]);
            await executeQuery('DELETE FROM online_store_preferences WHERE store_id = ?', [id]);
            
            return { success: true };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to delete store' });
        }
    });

    // Get store analytics
    fastify.get('/:id/analytics', async (request, reply) => {
        try {
            const { id } = request.params;
            const accountId = request.query.accountId || (request.user && request.user.id);
            const { period = '30d' } = request.query;

            // Check if store belongs to user
            const stores = await executeQuery(
                'SELECT id FROM online_store_settings WHERE id = ? AND account_id = ?',
                [id, accountId]
            );

            if (!stores || stores.length === 0) {
                return reply.status(404).send({ error: 'Store not found' });
            }

            // Calculate date range
            const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Get analytics data
            const analytics = await executeQuery(
                `SELECT event_type, COUNT(*) as count, DATE(created_at) as date
                 FROM online_store_analytics 
                 WHERE store_id = ? AND created_at >= ?
                 GROUP BY event_type, DATE(created_at)
                 ORDER BY date DESC`,
                [id, startDate.toISOString().split('T')[0]]
            );

            // Get orders summary
            const ordersSummary = await executeQuery(
                `SELECT 
                    COUNT(*) as total_orders,
                    SUM(total) as total_revenue,
                    AVG(total) as avg_order_value
                 FROM online_store_orders 
                 WHERE store_id = ? AND created_at >= ? AND status = 'paid'`,
                [id, startDate.toISOString().split('T')[0]]
            );

            return { 
                success: true, 
                data: {
                    analytics,
                    summary: ordersSummary[0] || { total_orders: 0, total_revenue: 0, avg_order_value: 0 }
                }
            };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch analytics' });
        }
    });
}

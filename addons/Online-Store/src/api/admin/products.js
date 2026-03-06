import { executeQuery } from '../db.js';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream, mkdirSync, existsSync } from 'fs';

export default async function productsPlugin(fastify, options) {
    // Helper to ensure upload dir exists
    const UPLOAD_ROOT = path.join(process.cwd(), 'uploads', 'products');
    if (!existsSync(UPLOAD_ROOT)) {
        mkdirSync(UPLOAD_ROOT, { recursive: true });
    }

    // POST upload product image
    fastify.post('/upload', async (request, reply) => {
        try {
            const data = await request.file();
            if (!data) return reply.status(400).send({ error: 'No file uploaded' });

            const fileName = `${Date.now()}-${data.filename}`;
            const filePath = path.join(UPLOAD_ROOT, fileName);

            await pipeline(data.file, createWriteStream(filePath));

            const fileUrl = `/uploads/products/${fileName}`;
            return { success: true, url: fileUrl };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to upload image' });
        }
    });

    // GET all products for an account
    fastify.get('', async (request, reply) => {
        try {
            const accountId = request.query.accountId || (request.user && request.user.id);
            const storeId = request.query.storeId;
            if (!accountId) return reply.status(400).send({ error: 'accountId is required' });

            let query = 'SELECT * FROM online_store_products WHERE account_id = ?';
            let params = [accountId];

            if (storeId) {
                query += ' AND store_id = ?';
                params.push(storeId);
            }

            query += ' ORDER BY created_at DESC';

            const products = await executeQuery(query, params);

            // Fetch all paid orders for this criteria to calculate real sales
            const orders = await executeQuery(
                `SELECT items FROM online_store_orders WHERE account_id = ? ${storeId ? 'AND store_id = ?' : ''} AND status = ?`,
                storeId ? [accountId, storeId, 'paid'] : [accountId, 'paid']
            );

            const salesMap = {};
            orders.forEach(order => {
                try {
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                    items.forEach(item => {
                        if (item.id) {
                            salesMap[item.id] = (salesMap[item.id] || 0) + (item.quantity || 0);
                        }
                    });
                } catch (e) { }
            });

            // Parse JSON strings and add sales data
            const parsedProducts = products.map(p => {
                let images = [];
                let tags = [];
                try {
                    if (p.images) images = JSON.parse(p.images);
                } catch (e) {
                    console.error(`Failed to parse images for product ${p.id}:`, e);
                }
                try {
                    if (p.tags) tags = JSON.parse(p.tags);
                } catch (e) {
                    console.error(`Failed to parse tags for product ${p.id}:`, e);
                }
                return {
                    ...p,
                    images,
                    tags,
                    sales_count: salesMap[p.id] || 0
                };
            });

            return { success: true, data: { products: parsedProducts } };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch products' });
        }
    });

    // GET all categories for an account
    fastify.get('/categories', async (request, reply) => {
        try {
            const accountId = request.query.accountId || (request.user && request.user.id);
            if (!accountId) return reply.status(400).send({ error: 'accountId is required' });

            const results = await executeQuery(
                'SELECT DISTINCT category FROM online_store_products WHERE account_id = ? AND category IS NOT NULL AND category != ""',
                [accountId]
            );
            const categories = results.map(r => r.category);
            return { success: true, data: { categories } };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch categories' });
        }
    });

    // GET all tags for an account
    fastify.get('/tags', async (request, reply) => {
        try {
            const accountId = request.query.accountId || (request.user && request.user.id);
            if (!accountId) return reply.status(400).send({ error: 'accountId is required' });

            const results = await executeQuery('SELECT tags, category FROM online_store_products WHERE account_id = ?', [accountId]);

            const allTags = new Set();
            results.forEach(r => {
                // Add category as tag
                if (r.category) allTags.add(r.category);

                try {
                    const tags = typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags;
                    if (Array.isArray(tags)) tags.forEach(t => allTags.add(t));
                } catch (e) {
                    fastify.log.warn(`Failed to parse tags for product: ${r.tags}`);
                }
            });

            return { success: true, data: { tags: Array.from(allTags) } };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch tags' });
        }
    });

    // POST create a product
    fastify.post('', async (request, reply) => {
        try {
            const {
                accountId, storeId, name, productCode, description, price,
                costPrice, bulkDiscountPrice, taxRate, images: imageList,
                category, brand, status, inventory, tags: tagsList
            } = request.body;

            const finalAccountId = accountId || (request.user && request.user.id);
            if (!finalAccountId) return reply.status(400).send({ error: 'accountId is required' });
            if (!storeId) return reply.status(400).send({ error: 'storeId is required' });

            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
            const images = JSON.stringify(imageList || []);
            const tags = JSON.stringify(tagsList || []);

            const result = await executeQuery(
                `INSERT INTO online_store_products
                 (account_id, store_id, name, product_code, slug, description, price, cost_price, bulk_discount_price, tax_rate, images, category, brand, status, inventory, tags)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    finalAccountId, storeId, name, productCode || '', slug, description || '',
                    price || 0, costPrice || 0, bulkDiscountPrice || 0, taxRate || 0,
                    images, category || '', brand || '', status || 'draft', inventory || 0, tags
                ]
            );

            return reply.status(201).send({ success: true, id: result.insertId, message: 'Product created' });
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to create product' });
        }
    });

    // PUT update a product
    fastify.put('/:id', async (request, reply) => {
        try {
            const productId = request.params.id;
            const {
                name, productCode, description, price,
                costPrice, bulkDiscountPrice, taxRate, images: imageList,
                category, brand, status, inventory, tags: tagsList
            } = request.body;

            const images = imageList !== undefined ? JSON.stringify(imageList) : undefined;
            const tags = tagsList !== undefined ? JSON.stringify(tagsList) : undefined;

            let updateFields = [];
            let params = [];

            if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
            if (productCode !== undefined) { updateFields.push('product_code = ?'); params.push(productCode); }
            if (description !== undefined) { updateFields.push('description = ?'); params.push(description); }
            if (price !== undefined) { updateFields.push('price = ?'); params.push(price); }
            if (costPrice !== undefined) { updateFields.push('cost_price = ?'); params.push(costPrice); }
            if (bulkDiscountPrice !== undefined) { updateFields.push('bulk_discount_price = ?'); params.push(bulkDiscountPrice); }
            if (taxRate !== undefined) { updateFields.push('tax_rate = ?'); params.push(taxRate); }
            if (images !== undefined) { updateFields.push('images = ?'); params.push(images); }
            if (category !== undefined) { updateFields.push('category = ?'); params.push(category); }
            if (brand !== undefined) { updateFields.push('brand = ?'); params.push(brand); }
            if (status !== undefined) { updateFields.push('status = ?'); params.push(status); }
            if (inventory !== undefined) { updateFields.push('inventory = ?'); params.push(inventory); }
            if (tags !== undefined) { updateFields.push('tags = ?'); params.push(tags); }

            if (updateFields.length === 0) return { success: true, message: 'No fields to update' };

            params.push(productId);
            await executeQuery(`UPDATE online_store_products SET ${updateFields.join(', ')} WHERE id = ?`, params);

            return { success: true, message: 'Product updated' };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to update product' });
        }
    });

    // DELETE a product
    fastify.delete('/:id', async (request, reply) => {
        try {
            const productId = request.params.id;
            await executeQuery('DELETE FROM online_store_products WHERE id = ?', [productId]);
            return { success: true, message: 'Product deleted' };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to delete product' });
        }
    });
}

-- Add store_slug, payment_methods, and theme_color to online_store_settings
ALTER TABLE online_store_settings 
ADD COLUMN store_slug VARCHAR(255) AFTER custom_domain,
ADD COLUMN payment_methods JSON AFTER store_slug,
ADD COLUMN theme_color VARCHAR(50) AFTER payment_methods;

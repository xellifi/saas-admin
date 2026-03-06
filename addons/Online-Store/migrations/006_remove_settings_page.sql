--- Remove Settings Page Tables and Data
-- This migration removes tables and data related to the removed Settings page
-- while preserving the Preferences table and functionality

-- Drop SEO settings table (Settings page specific)
DROP TABLE IF EXISTS online_store_seo;

-- Note: online_store_preferences table is kept for Preferences page functionality
-- Note: online_store_settings table is kept as it's core store functionality

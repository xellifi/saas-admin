import { FastifyInstance } from 'fastify'
import fs from 'fs'
import { existsSync, readFileSync, readdirSync, lstatSync, rmSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { query } from '../database'
import pool from '../database'

/**
 * ═══════════════════════════════════════════════════════════════
 *  ADDON MANAGER — Production-Ready Addon Engine
 * ═══════════════════════════════════════════════════════════════
 *  
 *  Auto-detects addons in addons/ folder, syncs to DB, runs
 *  migrations, executes install/uninstall hooks, registers
 *  Fastify plugins, and exposes sidebar/route metadata.
 *  
 *  Addon structure:
 *    addons/<name>/
 *      ├── addon.json       ← REQUIRED manifest
 *      ├── package.json     ← backend entry point
 *      ├── database/
 *      │   ├── install.sql
 *      │   └── uninstall.sql
 *      ├── migrations/
 *      │   ├── 001_install.sql
 *      │   └── 002_xxx.sql
 *      ├── src/
 *      │   ├── api/index.js ← Fastify plugin
 *      │   └── hooks.js     ← onInstall / onUninstall
 *      └── static/          ← CSS/assets
 * ═══════════════════════════════════════════════════════════════
 */

export interface AddonManifestSidebar {
    icon?: string
    position?: number
    items?: {
        title: string
        href: string
        icon?: string
        permission?: string
    }[]
}

export interface AddonManifestData {
    name: string
    displayName?: string
    version?: string
    description?: string
    author?: string
    category?: string
    icon?: string
    sidebar?: AddonManifestSidebar
    routes?: string[]
    dbTables?: string[]
    permissions?: string[]
    frontend?: {
        routes?: {
            path: string
            label: string
            icon?: string
        }[]
    }
    // Legacy support
    'saas-dashboard'?: any
}

export class AddonManager {
    // Directories
    private static ADDONS_DIR = join(process.cwd(), 'addons')
    private static ROOT_ADDONS_DIR = join(process.cwd(), '..', '..', 'addons')

    // In-memory registry of loaded addons
    private static loadedAddons: Map<string, { manifest: AddonManifestData, dir: string }> = new Map()

    // ─── DIRECTORY RESOLUTION ────────────────────────────────

    static getAddonsDir(): string {
        if (existsSync(this.ROOT_ADDONS_DIR)) return this.ROOT_ADDONS_DIR
        return this.ADDONS_DIR
    }

    // ─── DATABASE SHARING ────────────────────────────────────

    /**
     * Expose the main database query function to addon plugins.
     * Addons can use `fastify.dbQuery(sql, params)` instead of their own pool.
     */
    static shareDatabase(fastify: FastifyInstance) {
        if (!fastify.hasDecorator('dbQuery')) {
            fastify.decorate('dbQuery', query)
            fastify.log.info('🔌 Shared database connection exposed to addons via fastify.dbQuery')
        }
    }

    // ─── MIGRATION TABLE ─────────────────────────────────────

    /**
     * Ensure the addon_migrations table exists for tracking applied migrations.
     */
    static async ensureMigrationsTable() {
        try {
            await query(`
                CREATE TABLE IF NOT EXISTS addon_migrations(
    id INT PRIMARY KEY AUTO_INCREMENT,
    addon_name VARCHAR(255) NOT NULL,
    migration_file VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_migration(addon_name, migration_file)
)
    `)
            console.log('✅ addon_migrations table ready')
        } catch (error: any) {
            console.error('⚠️  Could not create addon_migrations table:', error.message)
        }
    }

    /**
     * Ensure the addons table exists and has all required columns.
     */
    static async ensureAddonsTable() {
        try {
            await query(`
                CREATE TABLE IF NOT EXISTS addons(
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        folder_name VARCHAR(255),
        version VARCHAR(50) DEFAULT '1.0.0',
        description TEXT,
        author VARCHAR(255),
        category VARCHAR(100),
        icon VARCHAR(100),
        manifest JSON,
        is_installed BOOLEAN DEFAULT FALSE,
        is_enabled BOOLEAN DEFAULT FALSE,
        installed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
            `)

            // Safely add columns that may be missing from older table schemas
            const alterStatements = [
                'ALTER TABLE addons ADD COLUMN folder_name VARCHAR(255) AFTER name',
                'ALTER TABLE addons ADD COLUMN category VARCHAR(100) AFTER author',
                'ALTER TABLE addons ADD COLUMN icon VARCHAR(100) AFTER category',
                'ALTER TABLE addons ADD COLUMN installed_at TIMESTAMP NULL AFTER is_enabled',
            ]
            for (const sql of alterStatements) {
                try { await pool.execute(sql) } catch { /* column already exists, fail silently */ }
            }
        } catch (error: any) {
            // Table likely already exists with all columns
        }
    }

    // ─── FULL AUTO-DETECTION ─────────────────────────────────

    /**
     * MASTER METHOD: Scan addons/ → read manifests → sync DB → run migrations
     * → execute hooks → register Fastify plugins. Call once at startup.
     */
    static async scanAndSyncAddons(fastify: FastifyInstance) {
        const addonsDir = this.getAddonsDir()
        if (!existsSync(addonsDir)) {
            mkdirSync(addonsDir, { recursive: true })
            fastify.log.info(`📁 Created addons directory: ${addonsDir} `)
            return []
        }

        fastify.log.info(`🔍 Scanning addons directory: ${addonsDir} `)
        const entries = readdirSync(addonsDir)
        const discoveredAddons: any[] = []

        for (const entry of entries) {
            const addonDir = join(addonsDir, entry)

            // Skip non-directories and zip files
            if (!lstatSync(addonDir).isDirectory()) continue

            try {
                // Read manifest
                const manifest = this.readManifest(addonDir)
                if (!manifest) {
                    fastify.log.warn(`⚠️  Skipping ${entry}: no addon.json, manifest.json, or package.json found`)
                    continue
                }

                fastify.log.info(`🔍 Found addon: ${entry} → "${manifest.displayName || manifest.name}"`)

                // Store in memory
                this.loadedAddons.set(entry, { manifest, dir: addonDir })

                // Sync to database
                const synced = await this.syncToDb(entry, manifest)
                if (synced) discoveredAddons.push(synced)

                // Check if addon is installed and enabled in DB
                const dbAddon = await this.getDbAddon(manifest.displayName || manifest.name || entry)

                if (dbAddon && dbAddon.is_installed) {
                    // Run migrations (idempotent — tracked in addon_migrations)
                    await this.runMigrations(entry, fastify)

                    // Register Fastify backend plugin
                    await this.registerPlugin(fastify, entry, addonDir)
                }
            } catch (error: any) {
                fastify.log.error(`❌ Error loading addon ${entry}: ${error.message} `)
                // Error boundary: one broken addon won't crash the server
            }
        }

        fastify.log.info(`✅ Addon scan complete — ${discoveredAddons.length} addon(s) detected and synced`)
        return discoveredAddons
    }

    // ─── MANIFEST READING ────────────────────────────────────

    /**
     * Read addon manifest. Priority: addon.json → manifest.json → package.json
     */
    static readManifest(dir: string): AddonManifestData | null {
        // 1. addon.json (preferred — new standardized format)
        const addonJsonPath = join(dir, 'addon.json')
        if (existsSync(addonJsonPath)) {
            try {
                const raw = JSON.parse(readFileSync(addonJsonPath, 'utf-8'))
                return this.normalizeManifest(raw, 'addon.json')
            } catch (e: any) {
                console.error(`Failed to parse addon.json in ${dir}: ${e.message} `)
            }
        }

        // 2. manifest.json (legacy)
        const manifestPath = join(dir, 'manifest.json')
        if (existsSync(manifestPath)) {
            try {
                const raw = JSON.parse(readFileSync(manifestPath, 'utf-8'))
                return this.normalizeManifest(raw, 'manifest.json')
            } catch { }
        }

        // 3. package.json (fallback)
        const pkgPath = join(dir, 'package.json')
        if (existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
                return this.normalizeManifest(pkg, 'package.json')
            } catch { }
        }

        return null
    }

    /**
     * Normalize different manifest formats into a unified AddonManifestData.
     */
    private static normalizeManifest(raw: any, source: string): AddonManifestData {
        // Handle saas-dashboard nested format
        const sd = raw['saas-dashboard'] || {}

        // Build sidebar from various formats
        let sidebar: AddonManifestSidebar | undefined = raw.sidebar

        // If no explicit sidebar, try to build from frontend.routes
        if (!sidebar) {
            const frontend = raw.frontend || sd.frontend
            if (frontend?.routes?.length) {
                sidebar = {
                    icon: raw.icon || sd.icon,
                    position: 100,
                    items: frontend.routes.map((r: any) => ({
                        title: r.label || r.title || raw.displayName || sd.displayName || raw.name,
                        href: r.path || r.href,
                        icon: r.icon || raw.icon || sd.icon,
                        permission: null
                    }))
                }
            }
        }

        return {
            name: raw.name || raw.id || '',
            displayName: raw.displayName || sd.displayName || raw.name || '',
            version: raw.version || '1.0.0',
            description: raw.description || sd.description || '',
            author: raw.author || '',
            category: raw.category || sd.category || '',
            icon: raw.icon || sd.icon || '',
            sidebar,
            routes: raw.routes || [],
            dbTables: raw.dbTables || [],
            permissions: raw.permissions || [],
            frontend: raw.frontend || sd.frontend || {},
            'saas-dashboard': sd
        }
    }

    // ─── DATABASE SYNC ───────────────────────────────────────

    /**
     * Upsert addon to the addons table. Safe to call repeatedly.
     * New filesystem addons are synced but NOT auto-installed (user must click Install).
     */
    private static async syncToDb(folderName: string, manifest: AddonManifestData) {
        try {
            const displayName = manifest.displayName || manifest.name || folderName

            // Check if already exists
            const existing = await query(
                'SELECT id, is_installed, is_enabled FROM addons WHERE name = ?',
                [displayName]
            ) as any[]

            if (existing && existing.length > 0) {
                // Update manifest and version, keep install state
                await query(
                    `UPDATE addons SET
folder_name = ?,
    version = ?,
    description = ?,
    author = ?,
    category = ?,
    icon = ?,
    manifest = ?
        WHERE name = ? `,
                    [
                        folderName,
                        manifest.version || '1.0.0',
                        manifest.description || '',
                        manifest.author || '',
                        manifest.category || '',
                        manifest.icon || '',
                        JSON.stringify(manifest),
                        displayName
                    ]
                )
            } else {
                // New addon — insert as NOT installed (user must click Install)
                await query(
                    `INSERT INTO addons(name, folder_name, version, description, author, category, icon, manifest, is_installed, is_enabled)
VALUES(?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)`,
                    [
                        displayName,
                        folderName,
                        manifest.version || '1.0.0',
                        manifest.description || '',
                        manifest.author || '',
                        manifest.category || '',
                        manifest.icon || '',
                        JSON.stringify(manifest)
                    ]
                )
            }

            console.log(`📦 Addon synced to DB: ${displayName} `)
            return { name: displayName, folderName, version: manifest.version }
        } catch (error: any) {
            console.error(`❌ Failed to sync addon ${folderName}: ${error.message} `)
            return null
        }
    }

    /**
     * Get addon record from DB by display name.
     */
    private static async getDbAddon(name: string): Promise<any | null> {
        try {
            const rows = await query('SELECT * FROM addons WHERE name = ?', [name]) as any[]
            return rows?.[0] || null
        } catch {
            return null
        }
    }

    // ─── INSTALLATION ────────────────────────────────────────

    /**
     * Install an addon: run migrations, execute hooks, register plugin.
     */
    static async installAddon(fastify: FastifyInstance, addonId: number) {
        const rows = await query('SELECT * FROM addons WHERE id = ?', [addonId]) as any[]
        if (!rows?.length) throw new Error('Addon not found')

        const addon = rows[0]
        if (addon.is_installed) throw new Error('Addon is already installed')

        const folderName = addon.folder_name || addon.name.toLowerCase().replace(/\s+/g, '-')
        const addonDir = join(this.getAddonsDir(), folderName)

        if (!existsSync(addonDir)) {
            throw new Error(`Addon folder not found: ${folderName} `)
        }

        console.log(`📦 Installing addon: ${addon.name} `)

        // 1. Run database migrations
        await this.runMigrations(folderName, fastify)

        // 2. Run legacy install.sql (database/ folder)
        await this.runInstallSql(folderName)

        // 3. Execute install hooks
        await this.executeHook(folderName, 'onInstall')

        // 4. Register Fastify plugin
        await this.registerPlugin(fastify, folderName, addonDir)

        // 5. Mark as installed + enabled in DB
        await query(
            'UPDATE addons SET is_installed = TRUE, is_enabled = TRUE, installed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [addonId]
        )

        console.log(`✅ Addon installed: ${addon.name} `)
    }

    /**
     * Uninstall an addon: execute hooks, run uninstall SQL, mark as uninstalled.
     */
    static async uninstallAddon(addonId: number) {
        const rows = await query('SELECT * FROM addons WHERE id = ?', [addonId]) as any[]
        if (!rows?.length) throw new Error('Addon not found')

        const addon = rows[0]
        if (!addon.is_installed) throw new Error('Addon is not installed')

        const folderName = addon.folder_name || addon.name.toLowerCase().replace(/\s+/g, '-')

        console.log(`📦 Uninstalling addon: ${addon.name} `)

        // 1. Execute uninstall hooks
        await this.executeHook(folderName, 'onUninstall')

        // 2. Run uninstall SQL
        await this.runUninstallSql(folderName)

        // 3. Mark as uninstalled + disabled
        await query(
            'UPDATE addons SET is_installed = FALSE, is_enabled = FALSE WHERE id = ?',
            [addonId]
        )

        // 4. Remove migration records
        await query('DELETE FROM addon_migrations WHERE addon_name = ?', [folderName])

        console.log(`✅ Addon uninstalled: ${addon.name} `)
    }

    // ─── MIGRATIONS ──────────────────────────────────────────

    /**
     * Run tracked migrations from the migrations/ folder.
     * Only applies migrations that haven't been run yet.
     */
    private static async runMigrations(folderName: string, fastify: FastifyInstance) {
        const addonsDir = this.getAddonsDir()
        const migrationsDir = join(addonsDir, folderName, 'migrations')
        if (!existsSync(migrationsDir)) return

        const files = readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql') && !f.includes('uninstall'))
            .sort() // Ensure order: 001_xxx.sql, 002_xxx.sql, etc.

        for (const file of files) {
            try {
                // Check if already applied
                const applied = await query(
                    'SELECT id FROM addon_migrations WHERE addon_name = ? AND migration_file = ?',
                    [folderName, file]
                ) as any[]

                if (applied?.length > 0) continue

                // Apply migration
                const sql = readFileSync(join(migrationsDir, file), 'utf-8')
                await this.executeSql(sql)

                // Record as applied
                await query(
                    'INSERT INTO addon_migrations (addon_name, migration_file) VALUES (?, ?)',
                    [folderName, file]
                )

                fastify.log.info(`📋 Migration applied: ${folderName}/${file}`)
            } catch (error: any) {
                fastify.log.error(`❌ Migration failed: ${folderName}/${file} — ${error.message}`)
            }
        }
    }

    /**
     * Run the legacy install.sql from database/ folder.
     */
    private static async runInstallSql(folderName: string) {
        const addonsDir = this.getAddonsDir()
        const installPath = join(addonsDir, folderName, 'database', 'install.sql')
        if (existsSync(installPath)) {
            console.log(`Running install.sql for: ${folderName}`)
            const sql = readFileSync(installPath, 'utf-8')
            await this.executeSql(sql)
        }
    }

    /**
     * Run the legacy uninstall.sql from database/ folder.
     */
    private static async runUninstallSql(folderName: string) {
        const addonsDir = this.getAddonsDir()
        const uninstallPath = join(addonsDir, folderName, 'database', 'uninstall.sql')
        if (existsSync(uninstallPath)) {
            console.log(`Running uninstall.sql for: ${folderName}`)
            const sql = readFileSync(uninstallPath, 'utf-8')
            await this.executeSql(sql)
        }
    }

    // ─── HOOKS ───────────────────────────────────────────────

    /**
     * Execute an addon hook (onInstall or onUninstall).
     * Hooks receive { db: query } for database access.
     */
    private static async executeHook(folderName: string, hookName: 'onInstall' | 'onUninstall') {
        const addonsDir = this.getAddonsDir()

        // Check multiple possible hook file locations
        const hookPaths = [
            join(addonsDir, folderName, 'src', 'hooks.js'),
            join(addonsDir, folderName, 'hooks.js'),
        ]

        for (const hookPath of hookPaths) {
            if (existsSync(hookPath)) {
                try {
                    console.log(`🪝 Executing ${hookName} hook for: ${folderName}`)
                    const hookModule = await import(`file://${hookPath}`)
                    const hookFn = hookModule[hookName] || hookModule.default?.[hookName]

                    if (typeof hookFn === 'function') {
                        await hookFn({ db: { query, execute: query }, accountId: 1 })
                        console.log(`✅ ${hookName} hook executed for: ${folderName}`)
                    }
                    return
                } catch (error: any) {
                    console.error(`⚠️  Hook ${hookName} failed for ${folderName}: ${error.message}`)
                }
            }
        }
    }

    // ─── PLUGIN REGISTRATION ─────────────────────────────────

    /**
     * Register an addon's Fastify backend plugin.
     */
    static async registerPlugin(fastify: FastifyInstance, name: string, dir: string) {
        try {
            const pkgPath = join(dir, 'package.json')
            if (!existsSync(pkgPath)) return

            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
            const mainFile = pkg.main || 'src/api/index.js'
            const backendPath = join(dir, mainFile)

            if (existsSync(backendPath)) {
                fastify.log.info(`🔌 Registering addon plugin: ${name}`)
                const addonModule = await import(`file://${backendPath}`)
                const plugin = addonModule.default || addonModule

                // Register with error boundary
                await fastify.register(plugin)
                fastify.log.info(`✅ Addon plugin registered: ${name}`)
            }
        } catch (error: any) {
            fastify.log.error(`❌ Failed to register plugin ${name}: ${error.message}`)
            // Error boundary: don't crash — just log
        }
    }

    // ─── FILE OPERATIONS ─────────────────────────────────────

    /**
     * Delete addon files and clean up database completely.
     */
    static async deleteAddon(addonId: number) {
        const rows = await query('SELECT * FROM addons WHERE id = ?', [addonId]) as any[]
        if (!rows?.length) throw new Error('Addon not found')

        const addon = rows[0]
        if (addon.is_installed) throw new Error('Cannot delete an installed addon. Uninstall it first.')

        const folderName = addon.folder_name || addon.name.toLowerCase().replace(/\s+/g, '-')
        const addonsDir = this.getAddonsDir()
        const dir = join(addonsDir, folderName)

        // Remove files
        if (existsSync(dir)) {
            console.log(`🗑️  Removing addon files: ${folderName}`)
            rmSync(dir, { recursive: true, force: true })
        }

        // Remove from DB
        await query('DELETE FROM addons WHERE id = ?', [addonId])
        await query('DELETE FROM addon_migrations WHERE addon_name = ?', [folderName])

        // Remove from memory
        this.loadedAddons.delete(folderName)

        console.log(`✅ Addon deleted: ${addon.name}`)
    }

    // ─── SQL EXECUTION ───────────────────────────────────────

    /**
     * Execute multi-statement SQL safely.
     */
    private static async executeSql(sql: string) {
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0)

        for (const statement of statements) {
            try {
                await query(statement)
            } catch (error: any) {
                // Ignore "already exists" errors for idempotent migrations
                if (!error.message?.includes('already exists') && !error.message?.includes('Duplicate')) {
                    console.error(`SQL error: ${error.message}\nStatement: ${statement.substring(0, 100)}...`)
                }
            }
        }
    }

    // ─── GETTERS ─────────────────────────────────────────────

    /**
     * Get all loaded addon manifests (in-memory).
     */
    static getLoadedAddons() {
        return this.loadedAddons
    }

    // ─── LEGACY COMPAT ───────────────────────────────────────

    /** @deprecated Use scanAndSyncAddons instead */
    static async registerAddons(fastify: FastifyInstance) {
        return this.scanAndSyncAddons(fastify)
    }

    /** @deprecated Use runInstallSql instead */
    static async installDatabase(name: string) {
        return this.runInstallSql(name)
    }

    /** @deprecated Use runUninstallSql instead */
    static async uninstallDatabase(name: string) {
        return this.runUninstallSql(name)
    }

    /** @deprecated Use deleteAddon instead */
    static async removeAddon(name: string) {
        const addonsDir = this.getAddonsDir()
        const dir = join(addonsDir, name)
        await this.runUninstallSql(name)
        if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
        await query('DELETE FROM addons WHERE name = ?', [name])
    }
}

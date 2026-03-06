import { FastifyInstance } from 'fastify'
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, readdirSync, lstatSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { pipeline } from 'stream/promises'
import yauzl from 'yauzl'
import { query } from '../database'
import { AddonManager } from '../lib/addon-manager'

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'addons')
const ROOT_ADDONS_DIR = AddonManager.getAddonsDir()

// Ensure directories exist
if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true })

// Helper: recursively find a file in a directory tree
function findFileRecursive(dir: string, filename: string): string | null {
  const filePath = join(dir, filename)
  if (existsSync(filePath)) return filePath
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const entryPath = join(dir, entry)
      if (lstatSync(entryPath).isDirectory()) {
        const found = findFileRecursive(entryPath, filename)
        if (found) return found
      }
    }
  } catch { }
  return null
}

// Helper: recursively move files from src to dest
function moveRecursive(src: string, dest: string) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
  const entries = readdirSync(src)
  for (const entry of entries) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (lstatSync(srcPath).isDirectory()) {
      moveRecursive(srcPath, destPath)
    } else {
      renameSync(srcPath, destPath)
    }
  }
}

export async function addonRoutes(fastify: FastifyInstance) {

  // ─── GET ALL ADDONS ───────────────────────────────────────
  fastify.get('/addons', async (_request, reply) => {
    try {
      const addons = await query('SELECT * FROM addons ORDER BY name') as any[]
      const addonsDir = AddonManager.getAddonsDir()

      const formattedAddons = addons.map(addon => {
        // Parse DB manifest
        let manifest: any = {}
        try {
          const raw = addon.manifest || addon.config
          manifest = typeof raw === 'string' ? JSON.parse(raw) : (raw || {})
        } catch { manifest = {} }

        // Enrich from filesystem if sidebar info is missing
        const folderName = addon.folder_name || manifest.name || addon.name?.toLowerCase().replace(/\s+/g, '-')
        if (folderName) {
          const addonDir = join(addonsDir, folderName)
          if (existsSync(addonDir)) {
            const fsManifest = AddonManager.readManifest(addonDir)
            if (fsManifest) {
              // Merge filesystem manifest (always has latest data)
              manifest = { ...manifest, ...fsManifest }
            }
          }
        }

        return {
          id: addon.id,
          name: addon.name,
          folderName: addon.folder_name || folderName,
          version: addon.version,
          description: addon.description,
          author: addon.author,
          category: addon.category,
          icon: addon.icon,
          isInstalled: !!addon.is_installed,
          isEnabled: !!addon.is_enabled,
          installedAt: addon.installed_at,
          createdAt: addon.created_at,
          updatedAt: addon.updated_at,
          manifest
        }
      })

      return reply.send({ success: true, data: formattedAddons })
    } catch (error: any) {
      console.error('Failed to fetch addons:', error)
      return reply.status(500).send({ success: false, error: 'Failed to fetch addons', details: error.message })
    }
  })

  // ─── SCAN / AUTO-DETECT ADDONS FROM FILESYSTEM ───────────
  fastify.post('/addons/scan', async (_request, reply) => {
    try {
      console.log('🔍 === MANUAL ADDON SCAN TRIGGERED ===')

      // Run full scan + sync
      const discovered = await AddonManager.scanAndSyncAddons(fastify)

      // Return all addons from DB after scan
      const addons = await query('SELECT * FROM addons ORDER BY name') as any[]
      const formattedAddons = addons.map(addon => {
        let manifest: any = {}
        try {
          const raw = addon.manifest || addon.config
          manifest = typeof raw === 'string' ? JSON.parse(raw) : (raw || {})
        } catch { manifest = {} }

        return {
          id: addon.id,
          name: addon.name,
          folderName: addon.folder_name,
          version: addon.version,
          description: addon.description,
          author: addon.author,
          isInstalled: !!addon.is_installed,
          isEnabled: !!addon.is_enabled,
          manifest
        }
      })

      return reply.send({
        success: true,
        message: `Scan complete — ${discovered?.length || 0} addon(s) detected`,
        data: formattedAddons
      })
    } catch (error: any) {
      console.error('🔍 Scan failed:', error)
      return reply.status(500).send({ success: false, error: 'Failed to scan addons', details: error.message })
    }
  })

  // ─── UPLOAD ADDON (does NOT auto-install) ─────────────────
  fastify.post('/addons/upload', async (request, reply) => {
    console.log('📦 === ADDON UPLOAD ===')
    try {
      const data = await request.file()
      if (!data) {
        return reply.status(400).send({ success: false, error: 'No file uploaded' })
      }
      if (!data.filename?.endsWith('.zip')) {
        return reply.status(400).send({ success: false, error: 'Only .zip files are allowed' })
      }

      // Save file
      const timestamp = Date.now()
      const filePath = join(UPLOAD_DIR, `${timestamp}-${data.filename}`)
      await pipeline(data.file, createWriteStream(filePath))
      console.log('📦 Saved:', filePath)

      // Extract ZIP
      const extractDir = join(UPLOAD_DIR, `extracted-${timestamp}`)
      mkdirSync(extractDir, { recursive: true })

      await new Promise<void>((resolve, reject) => {
        yauzl.open(filePath, { lazyEntries: true }, (err, zipfile) => {
          if (err || !zipfile) return reject(err || new Error('Failed to open zip'))
          zipfile.readEntry()
          zipfile.on('entry', (entry) => {
            const entryPath = join(extractDir, entry.fileName)
            if (/\/$/.test(entry.fileName)) {
              mkdirSync(entryPath, { recursive: true })
              zipfile.readEntry()
            } else {
              const dir = dirname(entryPath)
              mkdirSync(dir, { recursive: true })
              zipfile.openReadStream(entry, (err, readStream) => {
                if (err || !readStream) return reject(err || new Error('Failed to read entry'))
                const ws = createWriteStream(entryPath)
                readStream.pipe(ws)
                ws.on('finish', () => zipfile.readEntry())
                ws.on('error', reject)
              })
            }
          })
          zipfile.on('end', resolve)
          zipfile.on('error', reject)
        })
      })
      console.log('📦 Extracted')

      // Find manifest — check addon.json first, then manifest.json, then package.json
      const foundAddonJson = findFileRecursive(extractDir, 'addon.json')
      const foundManifest = foundAddonJson ? null : findFileRecursive(extractDir, 'manifest.json')
      const foundPkg = (foundAddonJson || foundManifest) ? null : findFileRecursive(extractDir, 'package.json')

      let sourceDir = extractDir
      let manifest: any = null

      if (foundAddonJson) {
        manifest = JSON.parse(readFileSync(foundAddonJson, 'utf-8'))
        sourceDir = dirname(foundAddonJson)
      } else if (foundManifest) {
        manifest = JSON.parse(readFileSync(foundManifest, 'utf-8'))
        sourceDir = dirname(foundManifest)
      } else if (foundPkg) {
        const pkg = JSON.parse(readFileSync(foundPkg, 'utf-8'))
        manifest = (pkg as any)['saas-dashboard'] || pkg
        sourceDir = dirname(foundPkg)
      }

      // Fallback: auto-generate manifest from filename
      if (!manifest || !manifest.name) {
        const baseName = data.filename.replace(/\.zip$/i, '').replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
        manifest = {
          name: baseName,
          displayName: baseName,
          version: '1.0.0',
          description: `Addon from ${data.filename}`,
          author: 'Unknown'
        }
        const topEntries = readdirSync(extractDir)
        if (topEntries.length === 1 && lstatSync(join(extractDir, topEntries[0])).isDirectory()) {
          sourceDir = join(extractDir, topEntries[0])
        }
      }

      // Move files to addons directory
      const folderName = manifest.name || manifest.id || data.filename.replace(/\.zip$/i, '')
      const addonDir = join(ROOT_ADDONS_DIR, folderName)
      mkdirSync(addonDir, { recursive: true })
      moveRecursive(sourceDir, addonDir)
      console.log('📦 Files moved to:', addonDir)

      // Sync to DB (uploaded only, NOT installed)
      const displayName = manifest.displayName || manifest.name || folderName

      await query(
        `INSERT INTO addons (name, folder_name, version, description, author, category, icon, manifest, is_installed, is_enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)
         ON DUPLICATE KEY UPDATE 
         version = VALUES(version), 
         description = VALUES(description),
         author = VALUES(author),
         manifest = VALUES(manifest)`,
        [
          displayName,
          folderName,
          manifest.version || '1.0.0',
          manifest.description || '',
          manifest.author || 'Unknown',
          manifest.category || '',
          manifest.icon || '',
          JSON.stringify(manifest)
        ]
      )

      console.log('📦 Upload complete (not installed)')
      return reply.send({
        success: true,
        message: 'Addon uploaded successfully. You can now install it.',
        data: {
          name: displayName,
          folderName,
          version: manifest.version || '1.0.0',
          description: manifest.description || '',
          author: manifest.author || 'Unknown',
          isInstalled: false,
          isEnabled: false,
          manifest
        }
      })
    } catch (error: any) {
      console.error('📦 Upload failed:', error)
      return reply.status(500).send({ success: false, error: 'Failed to upload addon', details: error.message })
    }
  })

  // ─── INSTALL ADDON ────────────────────────────────────────
  fastify.post('/addons/:id/install', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      console.log('📦 Installing addon id:', id)

      await AddonManager.installAddon(fastify, parseInt(id))

      return reply.send({ success: true, message: 'Addon installed successfully' })
    } catch (error: any) {
      console.error('📦 Install failed:', error)
      return reply.status(error.message?.includes('not found') ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to install addon'
      })
    }
  })

  // ─── ENABLE / DISABLE ADDON ───────────────────────────────
  fastify.post('/addons/:id/toggle', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      const rows = await query('SELECT * FROM addons WHERE id = ?', [id]) as any[]
      if (!rows || rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Addon not found' })
      }
      const addon = rows[0]

      if (!addon.is_installed) {
        return reply.status(400).send({ success: false, error: 'Addon must be installed before enabling/disabling' })
      }

      const newState = !addon.is_enabled
      await query('UPDATE addons SET is_enabled = ? WHERE id = ?', [newState, id])

      return reply.send({
        success: true,
        message: `Addon "${addon.name}" ${newState ? 'enabled' : 'disabled'} successfully`,
        data: { isEnabled: newState }
      })
    } catch (error: any) {
      console.error('📦 Toggle failed:', error)
      return reply.status(500).send({ success: false, error: 'Failed to toggle addon', details: error.message })
    }
  })

  // ─── UNINSTALL ADDON ──────────────────────────────────────
  fastify.post('/addons/:id/uninstall', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      console.log('📦 Uninstalling addon id:', id)

      await AddonManager.uninstallAddon(parseInt(id))

      return reply.send({ success: true, message: 'Addon uninstalled successfully' })
    } catch (error: any) {
      console.error('📦 Uninstall failed:', error)
      return reply.status(error.message?.includes('not found') ? 404 : 500).send({
        success: false,
        error: error.message || 'Failed to uninstall addon'
      })
    }
  })

  // ─── DELETE ADDON (only if NOT installed) ─────────────────
  fastify.delete('/addons/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      console.log('📦 Deleting addon id:', id)

      await AddonManager.deleteAddon(parseInt(id))

      return reply.send({ success: true, message: 'Addon deleted successfully' })
    } catch (error: any) {
      console.error('📦 Delete failed:', error)
      return reply.status(error.message?.includes('not found') ? 404 : 400).send({
        success: false,
        error: error.message || 'Failed to delete addon'
      })
    }
  })
}

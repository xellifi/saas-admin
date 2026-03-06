import { watch, existsSync, mkdirSync } from 'fs'
import { FastifyInstance } from 'fastify'
import { AddonManager } from './addon-manager'

/**
 * ═══════════════════════════════════════════════════════════════
 *  ADDON WATCHER — Hot Reload for Development
 * ═══════════════════════════════════════════════════════════════
 *  
 *  Watches the addons/ directory for new folders appearing.
 *  When a new addon is detected, triggers a full re-scan.
 *  Only active in non-production environments.
 * ═══════════════════════════════════════════════════════════════
 */

export class AddonWatcher {
    private static watcher: ReturnType<typeof watch> | null = null
    private static debounceTimer: NodeJS.Timeout | null = null
    private static DEBOUNCE_MS = 2000

    /**
     * Start watching the addons/ directory.
     * Only starts in development mode.
     */
    static start(fastify: FastifyInstance) {
        if (process.env.NODE_ENV === 'production') {
            fastify.log.info('👁️  Addon watcher disabled in production')
            return
        }

        const addonsDir = AddonManager.getAddonsDir()
        if (!existsSync(addonsDir)) {
            mkdirSync(addonsDir, { recursive: true })
        }

        try {
            this.watcher = watch(addonsDir, { recursive: false }, (eventType, filename) => {
                if (eventType === 'rename' && filename) {
                    // Debounce to avoid duplicate triggers
                    if (this.debounceTimer) clearTimeout(this.debounceTimer)
                    this.debounceTimer = setTimeout(async () => {
                        fastify.log.info(`👁️  Addon folder change detected: ${filename}`)
                        try {
                            await AddonManager.scanAndSyncAddons(fastify)
                            fastify.log.info('👁️  Addon re-scan complete')
                        } catch (error: any) {
                            fastify.log.error(`👁️  Re-scan failed: ${error.message}`)
                        }
                    }, this.DEBOUNCE_MS)
                }
            })

            fastify.log.info(`👁️  Addon watcher started — monitoring: ${addonsDir}`)
        } catch (error: any) {
            fastify.log.warn(`⚠️  Could not start addon watcher: ${error.message}`)
        }
    }

    /**
     * Stop the watcher.
     */
    static stop() {
        if (this.watcher) {
            this.watcher.close()
            this.watcher = null
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
            this.debounceTimer = null
        }
        console.log('👁️  Addon watcher stopped')
    }
}

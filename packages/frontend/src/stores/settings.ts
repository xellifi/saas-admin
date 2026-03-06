import { create } from 'zustand'

interface SettingsState {
    settings: {
        siteName: string
        siteDescription: string
        adminEmail: string
        theme: 'light' | 'dark' | 'auto'
        primaryColor: string
        accentColor: string
        emailNotifications: boolean
        pushNotifications: boolean
        twoFactorAuth: boolean
        sessionTimeout: number

        // Integrations
        integration_google_drive: boolean
        integration_slack: boolean
        integration_notion: boolean
        integration_jira: boolean
        integration_zendesk: boolean
        integration_dropbox: boolean
        integration_github: boolean
        integration_gitlab: boolean
        integration_figma: boolean
        integration_adobe_xd: boolean
        integration_sketch: boolean
        integration_hubspot: boolean
        integration_zapier: boolean
    }
    loading: boolean
    error: string | null
    fetchSettings: () => Promise<void>
    updateSettings: (newSettings: any) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
    settings: {
        siteName: 'Admin Dashboard',
        siteDescription: 'SaaS Admin Dashboard Platform',
        adminEmail: 'admin@example.com',
        theme: 'light',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        emailNotifications: true,
        pushNotifications: false,
        twoFactorAuth: false,
        sessionTimeout: 30,

        // Integrations initial state
        integration_google_drive: false,
        integration_slack: false,
        integration_notion: false,
        integration_jira: false,
        integration_zendesk: false,
        integration_dropbox: false,
        integration_github: false,
        integration_gitlab: false,
        integration_figma: false,
        integration_adobe_xd: false,
        integration_sketch: false,
        integration_hubspot: false,
        integration_zapier: false,
    },
    loading: false,
    error: null,

    fetchSettings: async () => {
        set({ loading: true, error: null })
        try {
            const response = await fetch('/api/settings')
            if (!response.ok) throw new Error('Failed to fetch settings')
            const data = await response.json()
            set({ settings: data.settings, loading: false })
        } catch (error: any) {
            set({ error: error.message, loading: false })
        }
    },

    updateSettings: async (newSettings) => {
        set({ loading: true, error: null })
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: newSettings }),
            })
            if (!response.ok) throw new Error('Failed to update settings')
            set({ settings: newSettings, loading: false })
        } catch (error: any) {
            set({ error: error.message, loading: false })
        }
    },
}))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'
import { Addon } from '@/types'

interface AddonsState {
    activeAddons: Addon[]
    loading: boolean
    error: string | null
    fetchActiveAddons: () => Promise<void>
}

export const useAddonsStore = create<AddonsState>()(
    persist(
        (set) => ({
            activeAddons: [],
            loading: false,
            error: null,
            fetchActiveAddons: async () => {
                try {
                    set({ loading: true, error: null })
                    const response = await api.get<Addon[]>('/addons')
                    if (response.success) {
                        // Filter only active/enabled addons
                        const active = (response.data || []).filter(addon => addon.isEnabled)
                        set({ activeAddons: active, loading: false })
                    } else {
                        throw new Error(response.error || 'Failed to fetch addons')
                    }
                } catch (error: any) {
                    set({ error: error.message, loading: false })
                }
            }
        }),
        {
            name: 'addons-storage'
        }
    )
)

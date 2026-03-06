import { useState, useCallback } from 'react'
import type { MouseEvent } from 'react'

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'default' | 'primary' | 'danger'
  onConfirm: () => void | Promise<void>
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  isOpen: boolean
}

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmVariant: 'primary',
    onConfirm: () => {}
  })

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        confirmVariant: options.confirmVariant || 'primary',
        onConfirm: async () => {
          await options.onConfirm()
          resolve(true)
        }
      })
    })
  }, [])

  const handleConfirm = useCallback(async () => {
    await dialogState.onConfirm()
    setDialogState(prev => ({ ...prev, isOpen: false }))
  }, [dialogState.onConfirm])

  const handleCancel = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const ConfirmDialogComponent = () => {
    if (!dialogState.isOpen) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleCancel}
        />
        
        {/* Dialog */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ease-out">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {dialogState.title}
              </h3>
              <button
                onClick={handleCancel}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                {dialogState.message}
              </p>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {dialogState.cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    dialogState.confirmVariant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {dialogState.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent
  }
}

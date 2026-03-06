import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

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

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  }
  return context
}

export const ConfirmDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialogComponent
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText || 'Confirm'}
        cancelText={dialogState.cancelText || 'Cancel'}
        confirmVariant={dialogState.confirmVariant || 'primary'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  )
}

interface ConfirmDialogComponentProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  confirmVariant: 'default' | 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialogComponent: React.FC<ConfirmDialogComponentProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              onClick={onCancel}
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
              {message}
            </p>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-md transition-colors ${
                  confirmVariant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialogProvider

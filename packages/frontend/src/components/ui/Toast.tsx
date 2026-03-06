import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ToastItem {
  id: string
  content: ReactNode
}

interface ToastContextType {
  toasts: ToastItem[]
  push: (content: ReactNode) => void
  remove: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const push = (content: ReactNode) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, content }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      remove(id)
    }, 5000)
  }

  const remove = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

const ToastContainer: React.FC = () => {
  const { toasts, remove } = useToast()
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right duration-300"
        >
          {React.cloneElement(toast.content as React.ReactElement, {
            onClose: () => remove(toast.id)
          })}
        </div>
      ))}
    </div>
  )
}

// Global toast instance
let globalToast: ToastContextType | null = null

export const toast = {
  push: (content: ReactNode) => {
    if (globalToast) {
      globalToast.push(content)
    } else {
      console.warn('Toast provider not initialized')
    }
  }
}

// Hook to initialize global toast
export const useGlobalToast = () => {
  const context = useToast()
  React.useEffect(() => {
    globalToast = context
  }, [context])
  
  return context
}

export default ToastProvider

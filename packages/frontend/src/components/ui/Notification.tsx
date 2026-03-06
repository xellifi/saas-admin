import React from 'react'
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'

interface NotificationProps {
  title: string
  type: 'success' | 'warning' | 'danger' | 'info'
  children?: React.ReactNode
  onClose?: () => void
}

const Notification: React.FC<NotificationProps> = ({ 
  title, 
  type, 
  children, 
  onClose 
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 dark:bg-green-700 text-white'
      case 'warning':
        return 'bg-amber-500 dark:bg-amber-600 text-white'
      case 'danger':
        return 'bg-red-600 dark:bg-red-700 text-white'
      case 'info':
        return 'bg-blue-600 dark:bg-blue-700 text-white'
      default:
        return 'bg-gray-700 text-white'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'danger':
        return <XCircle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  return (
    <div className={`min-w-80 max-w-md p-4 rounded-xl shadow-lg ${getTypeStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 text-white">{getIcon()}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1 text-white">{title}</h4>
            {children && (
              <p className="text-sm opacity-90 text-white/90">{children}</p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Notification

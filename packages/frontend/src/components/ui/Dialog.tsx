import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import type { MouseEvent } from 'react'

interface DialogProps {
  isOpen: boolean
  onClose: (e: MouseEvent) => void
  onRequestClose: (e: MouseEvent) => void
  children: React.ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Dialog: React.FC<DialogProps> = ({ 
  isOpen, 
  onClose, 
  onRequestClose, 
  children, 
  title,
  size = 'md' 
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onRequestClose(e as any)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onRequestClose])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md'
      case 'lg':
        return 'max-w-2xl'
      case 'xl':
        return 'max-w-4xl'
      default:
        return 'max-w-lg'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onRequestClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl 
            transform transition-all duration-300 ease-out
            ${getSizeClasses()}
          `}
        >
          {/* Header */}
          {(title || onRequestClose) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {onRequestClose && (
                <button
                  onClick={(e) => onRequestClose(e)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dialog

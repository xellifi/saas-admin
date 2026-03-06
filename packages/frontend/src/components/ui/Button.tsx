import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'solid' | 'plain'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'default', 
  size = 'md', 
  children, 
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 text-white border-transparent'
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-transparent'
      case 'outline':
        return 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent'
      case 'solid':
        return 'bg-primary-600 hover:bg-primary-700 text-white border-transparent'
      case 'plain':
        return 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-transparent'
      default:
        return 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600'
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

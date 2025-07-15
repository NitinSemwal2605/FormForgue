import React from 'react'

const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  children, 
  loading, // extract loading
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background backdrop-blur-sm"
  
  const variants = {
    default: "bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-500/50",
    destructive: "bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 hover:border-red-500/50",
    outline: "border border-gray-600/50 bg-gray-800/30 text-gray-300 hover:bg-gray-700/50 hover:text-white",
    secondary: "bg-gray-500/20 border border-gray-500/30 text-gray-300 hover:bg-gray-500/30 hover:border-gray-500/50",
    ghost: "hover:bg-gray-800/30 hover:text-white text-gray-300",
    link: "text-blue-400 underline-offset-4 hover:underline"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  }

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent border-blue-400 rounded-full inline-block"></span> : null}
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button
import React from 'react'

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm"
  
  const variants = {
    default: "border-blue-500/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
    secondary: "border-gray-500/30 bg-gray-500/20 text-gray-300 hover:bg-gray-500/30",
    destructive: "border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/30",
    outline: "text-gray-300 border-gray-600/50 bg-gray-800/30",
    success: "border-green-500/30 bg-green-500/20 text-green-300 hover:bg-green-500/30",
    warning: "border-yellow-500/30 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30",
    info: "border-blue-500/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
  }

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }

 
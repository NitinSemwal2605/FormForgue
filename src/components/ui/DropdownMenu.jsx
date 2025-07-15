import { MoreHorizontal } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const DropdownMenu = React.forwardRef(({ children, trigger, className, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`} {...props}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
      >
        {trigger || <MoreHorizontal className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 z-50">
          <div className="p-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: (e) => {
                    if (child.props.onClick) {
                      child.props.onClick(e)
                    }
                    setIsOpen(false)
                  }
                })
              }
              return child
            })}
          </div>
        </div>
      )}
    </div>
  )
})
DropdownMenu.displayName = "DropdownMenu"

const DropdownMenuTrigger = React.forwardRef(({ children, className, ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
    {...props}
  >
    {children}
  </button>
))
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={`absolute right-0 mt-2 w-56 origin-top-right rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 z-50 ${className}`}
    {...props}
  >
    <div className="p-1">
      {children}
    </div>
  </div>
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(({ children, className, ...props }, ref) => (
  <button
    ref={ref}
    className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </button>
))
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger }

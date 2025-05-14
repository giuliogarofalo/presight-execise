import React from 'react'

interface SidebarProps {
  children: React.ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white">
      <div className="p-6 space-y-8">
        {children}
      </div>
    </div>
  )
}

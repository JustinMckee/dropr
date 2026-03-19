'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { logoutAction } from '@/app/(auth)/logout/actions'

interface UserNavProps {
  user: {
    displayName: string
    email: string
    role: string
    photoUrl?: string | null
  }
}

export function UserNav({ user }: UserNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  console.log(user)

  // Get initials for avatar fallback
  const initials = user.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Format role for display
  const roleDisplay = user.role.charAt(0).toUpperCase() + user.role.slice(1)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logoutAction()
  }

  return (
    <div className="relative z-10">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full hover:bg-accent transition-colors p-1 pr-3 md:w-56"
      >
        <Avatar>
          {user.photoUrl && <AvatarImage src={user.photoUrl} alt={user.displayName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="hidden md:block text-left">
          <div className="text-xs font-medium">{user.displayName}</div>
          <div className="text-xs text-muted-foreground">{roleDisplay}</div>
        </div>
      </button>

      <DropdownMenu ref={dropdownRef} open={isOpen}>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Link href="/dashboard" className="w-full">Dashboard</Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Link href="/profile" className="w-full">Profile</Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Link href="/settings" className="w-full">Settings</Link>
        </DropdownMenuItem>
        
        {user.role === 'maker' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/maker/products" className="w-full">My Products</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/maker/orders" className="w-full">Orders</Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  )
}

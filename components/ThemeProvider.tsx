'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply theme based on system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const applyTheme = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    // Apply initial theme
    applyTheme(mediaQuery)
    
    // Listen for changes
    mediaQuery.addEventListener('change', applyTheme)
    
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [])
  
  return <>{children}</>
}

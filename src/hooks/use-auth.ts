"use client"

import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/actions/auth/auth-actions'

export function useSignOut() {
   const [isLoggingOut, setIsLoggingOut] = useState(false)

   const handleLogout = async () => {
      if (isLoggingOut) return // Prevent double-click

      setIsLoggingOut(true)
      const toastId = toast.loading('Logging out...')

      try {
         // Sign out and wait for completion
         await authClient.signOut()

         // Show success toast
         toast.success('Logged out successfully', { id: toastId })

         // Redirect to home page - use window.location for clean navigation
         // This ensures a fresh page load without stale session state
         window.location.href = '/'
      } catch (error) {
         toast.error(
            error instanceof Error ? error.message : 'Failed to logout',
            { id: toastId }
         )
         console.error('Logout error:', error)
         setIsLoggingOut(false)
      }
   }

   return { handleLogout, isLoggingOut }
}

export function useAuthUser() {
   return useQuery({
      queryKey: ["auth-user"],
      queryFn: async () => {
         const result = await getUser();
         if (!result.success) {
            throw new Error(result.error);
         }
         return result.data;
      },
      retry: false, // Don't retry if user is not authenticated
      staleTime: 5 * 60 * 1000, // 5 minutes
   });
}
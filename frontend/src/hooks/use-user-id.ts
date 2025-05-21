"use client"

import { useAuth } from "@clerk/nextjs";

export function useUserId(): { userId: string | null; isLoaded: boolean } {
  const { userId, isLoaded } = useAuth()

  return { userId, isLoaded }
}

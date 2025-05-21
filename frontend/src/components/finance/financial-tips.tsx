"use client"

import { Button } from "@/components/ui/button"
import { fetchRandomTips, type Tip } from "@/lib/tips-service"
import { cn } from "@/lib/utils"
import { LightbulbIcon, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface FinancialTipsProps {
  className?: string
}

export function FinancialTips({ className }: FinancialTipsProps) {
  const [tips, setTips] = useState<Tip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTips = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const tipsData = await fetchRandomTips()

      if (Array.isArray(tipsData) && tipsData.length > 0) {
        setTips(tipsData)
      } else {
        console.warn("Nenhuma dica retornada ou formato inválido:", tipsData)
        setTips([])
      }
    } catch (err) {
      console.error("Erro ao carregar dicas:", err)
      setError("Não foi possível carregar as dicas. Tente novamente mais tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar dicas quando o componente montar
  useEffect(() => {
    loadTips()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2 text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={loadTips}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!tips || tips.length === 0) {
    return (
      <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 text-sm">
        <p>Nenhuma dica disponível no momento.</p>
        <Button variant="outline" size="sm" onClick={loadTips} className="mt-2">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {tips.map((tip) => (
        <div key={tip.id} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 p-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <LightbulbIcon className="h-3.5 w-3.5" />
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{tip.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

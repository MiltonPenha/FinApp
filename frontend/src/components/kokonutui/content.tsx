"use client"

import { Button } from "@/components/ui/button"
import { getTotalExpensesLast30Days } from "@/lib/expense-service"
import { useAuth } from "@clerk/nextjs"
import { AlertTriangle, CreditCard, Lightbulb, Newspaper, PlusCircle, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FinancialTips } from "../finance/financial-tips"
import { NewsFeed } from "../finance/news-feed"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import List01 from "./list-01"
import List02 from "./list-02"

export default function Content() {
  const router = useRouter()
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const { userId, isLoaded } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        if (isLoaded && userId) {
          console.log("Content: Buscando total de despesas com userId:", userId)
          const total = await getTotalExpensesLast30Days(userId)
          setTotalExpenses(total)
        }

        // Verificar se a URL da API está definida
        if (!process.env.NEXT_PUBLIC_API_URL) {
          console.warn("URL da API não configurada. Usando URL padrão.")
        }
      } catch (error) {
        console.error("Erro ao buscar total de despesas:", error)
        setApiError(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded) {
      fetchData()
    }
  }, [userId, isLoaded])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão Financeira</h1>
        <Button
          onClick={() => router.push("/expenses/new")}
          className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            Não foi possível conectar à API de despesas. Verifique se o servidor está em execução e se a variável de
            ambiente NEXT_PUBLIC_API_URL está configurada corretamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-auto">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23] lg:row-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Despesas (Últimos 30 dias)
          </h2>
          <div className="flex-1">
            <List01 className="h-full" totalExpenses={totalExpenses} isLoading={isLoading} userId={userId} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23] lg:row-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Transações Recentes
          </h2>
          <div className="flex-1">
            <List02 className="h-full" userId={userId} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <Newspaper className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Notícias Financeiras
          </h2>
          <div className="flex-1 max-h-[300px] overflow-y-auto">
            <NewsFeed />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Dicas Financeiras
          </h2>
          <div className="flex-1 max-h-[300px] overflow-y-auto">
            <FinancialTips />
          </div>
        </div>
      </div>
    </div>
  )
}
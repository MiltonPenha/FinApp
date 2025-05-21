"use client"

import { getRecentExpenses, type Expense } from "@/lib/expense-service"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowUpRight,
  Coffee,
  GraduationCap,
  HelpCircle,
  Home,
  Lightbulb,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  Tv,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

interface TransactionDisplay {
  id: string
  title: string
  amount: string
  type: "outgoing"
  category: string
  icon: LucideIcon
  timestamp: string
  status: "completed"
}

interface List02Props {
  className?: string
  userId?: string | null
}

const categoryIcons: Record<string, LucideIcon> = {
  alimentação: Coffee,
  transporte: ShoppingCart,
  moradia: Home,
  contas: Lightbulb,
  entretenimento: Tv,
  saúde: Stethoscope,
  educação: GraduationCap,
  compras: ShoppingBag,
  outros: HelpCircle,
}

const categoryLabels: Record<string, string> = {
  alimentação: "Alimentação",
  transporte: "Transporte",
  moradia: "Moradia",
  contas: "Contas",
  entretenimento: "Entretenimento",
  saúde: "Saúde",
  educação: "Educação",
  compras: "Compras",
  outros: "Outros",
}

export default function List02({ className, userId }: List02Props) {
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        if (userId) {
          console.log("List02: Buscando despesas recentes com userId:", userId)
          const recentExpenses = await getRecentExpenses(10, userId)

          const formattedTransactions: TransactionDisplay[] = recentExpenses.map((expense: Expense) => {
            const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date)

            return {
              id: expense.id,
              title: expense.description || categoryLabels[expense.category] || "Despesa",
              amount: `R$ ${typeof expense.value === "number" ? expense.value.toFixed(2) : expense.value}`,
              type: "outgoing",
              category: expense.category,
              icon: categoryIcons[expense.category] || HelpCircle,
              timestamp: format(expenseDate, "dd 'de' MMMM, HH:mm", { locale: ptBR }),
              status: "completed",
            }
          })

          setTransactions(formattedTransactions)
        }
      } catch (error) {
        console.error("Erro ao buscar transações recentes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  return (
    <div
      className={cn(
        "w-full max-w-xl mx-auto",
        "bg-white dark:bg-zinc-900/70",
        "border border-zinc-100 dark:border-zinc-800",
        "rounded-xl shadow-sm backdrop-blur-xl",
        className,
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Atividade Recente
            {transactions.length > 0 && (
              <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400 ml-1">
                ({transactions.length} transações)
              </span>
            )}
          </h2>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">Últimas Despesas</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "group flex items-center gap-3",
                    "p-2 rounded-lg",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                    "transition-all duration-200",
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      "bg-zinc-100 dark:bg-zinc-800",
                      "border border-zinc-200 dark:border-zinc-700",
                    )}
                  >
                    <transaction.icon className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                  </div>

                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{transaction.title}</h3>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{transaction.timestamp}</p>
                    </div>

                    <div className="flex items-center gap-1.5 pl-3">
                      <span className="text-xs font-medium text-red-600 dark:text-red-400">-{transaction.amount}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-zinc-500 dark:text-zinc-400">Nenhuma transação recente</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { getExpensesByCategory } from "@/lib/expense-service"
import { cn } from "@/lib/utils"
import { ArrowUpRight, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface CategoryItem {
  id: string
  title: string
  description?: string
  balance: string
  type: "expense"
  category: string
}

interface List01Props {
  totalExpenses?: number
  isLoading?: boolean
  className?: string
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

export default function List01({ totalExpenses = 0, isLoading = false, className }: List01Props) {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const expensesByCategory = await getExpensesByCategory()

        const categoryItems: CategoryItem[] = Object.entries(expensesByCategory).map(([category, amount], index) => ({
          id: index.toString(),
          title: categoryLabels[category] || category,
          description: "Últimos 30 dias",
          balance: `R$ ${amount.toFixed(2)}`,
          type: "expense",
          category,
        }))

        setCategories(categoryItems)
      } catch (error) {
        console.error("Erro ao buscar despesas por categoria:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      {/* Total Balance Section */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">Total de Despesas (30 dias)</p>
        {isLoading ? (
          <div className="flex items-center space-x-2 h-8">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
            <span className="text-sm text-zinc-500">Carregando...</span>
          </div>
        ) : (
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">R$ {totalExpenses.toFixed(2)}</h1>
        )}
      </div>

      {/* Categories List */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Categorias</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "group flex items-center justify-between",
                    "p-2 rounded-lg",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                    "transition-all duration-200",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{category.title}</h3>
                      {category.description && (
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{category.balance}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-zinc-500 dark:text-zinc-400">
                Nenhuma despesa registrada nos últimos 30 dias
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

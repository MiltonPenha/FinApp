"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { deleteExpense, getExpenses, type Expense } from "@/lib/expense-service"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { format, parseISO } from "date-fns"
import { Calendar, ChevronLeft, ChevronRight, Filter, Loader2, Pencil, Search, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

const categoryColors: Record<string, string> = {
  alimentação: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  transporte: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  moradia: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  contas: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  entretenimento: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  saúde: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  educação: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  compras: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  outros: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
}

export default function TransactionsList() {
  const [allTransactions, setAllTransactions] = useState<Expense[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Expense[]>([])
  const [displayedTransactions, setDisplayedTransactions] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const limit = 10
  const { userId, isLoaded } = useAuth()

  // Estados para filtros e pesquisa
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined
    endDate: Date | undefined
  }>({
    startDate: undefined,
    endDate: undefined,
  })
  const [isFiltered, setIsFiltered] = useState(false)
  const [totalItems, setTotalItems] = useState(0)

  // Função para formatar a data corretamente
  const formatDate = (date: string | Date): string => {
    if (typeof date === "string") {
      // Se for uma string ISO com Z (UTC), use parseISO e format
      if (date.endsWith("Z")) {
        return format(parseISO(date), "dd/MM/yyyy")
      }
      // Caso contrário, crie uma nova data
      const d = new Date(date)
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
    }

    // Se for um objeto Date
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
  }

  // Buscar todas as transações
  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!isLoaded){
          return
        }

        if (userId) {
          console.log("TransactionsList: Buscando todas as transações com userId:", userId)

          // Vamos verificar a resposta bruta da API para debug
          const rawResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/expenses?userId=${encodeURIComponent(userId)}&limit=1000`,
            {
              headers: {
                Authorization: `Bearer ${userId}`,
                "Content-Type": "application/json",
              },
            },
          )

          if (!rawResponse.ok) {
            throw new Error(`Erro ao buscar despesas: ${rawResponse.status} ${rawResponse.statusText}`)
          }

          const rawText = await rawResponse.text()
          console.log("Resposta bruta da API (texto):", rawText)

          const rawData = rawText ? JSON.parse(rawText) : []
          console.log("Resposta bruta da API (JSON):", rawData)

          // Processar os dados
          let expenses: Expense[] = []

          if (Array.isArray(rawData)) {
            expenses = rawData
          } else if (rawData && typeof rawData === "object") {
            if (Array.isArray(rawData.data)) {
              expenses = rawData.data
            } else if (rawData.items && Array.isArray(rawData.items)) {
              expenses = rawData.items
            } else {
              expenses = [rawData]
            }
          }

          // Filtrar apenas as despesas do usuário atual
          expenses = expenses.filter((expense) => expense.userId === userId)
          console.log(`Despesas do usuário ${userId}: ${expenses.length}`)

          // Atualizar estados
          setAllTransactions(expenses)
          setTotalItems(expenses.length)
          applyFilters(expenses)
        }
      } catch (err) {
        console.error("Erro ao buscar transações:", err)
        setError("Não foi possível carregar as transações. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchAllTransactions()
    }
  }, [userId, isLoaded])

  // Aplicar filtros e atualizar a lista de transações
  const applyFilters = (transactions = allTransactions) => {
    let filtered = [...transactions]

    // Filtrar por termo de pesquisa (na descrição)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((transaction) => transaction.description.toLowerCase().includes(searchLower))
    }

    // Filtrar por categoria
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((transaction) => transaction.category === selectedCategory)
    }

    // Filtrar por data
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate)
      startDate.setHours(0, 0, 0, 0)

      filtered = filtered.filter((transaction) => {
        const transactionDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date)
        return transactionDate >= startDate
      })
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate)
      endDate.setHours(23, 59, 59, 999)

      filtered = filtered.filter((transaction) => {
        const transactionDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date)
        return transactionDate <= endDate
      })
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date)
      const dateB = b.date instanceof Date ? b.date : new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })

    setFilteredTransactions(filtered)
    updateDisplayedTransactions(filtered, 1)

    // Verificar se há filtros ativos
    setIsFiltered(
      !!(searchTerm || (selectedCategory && selectedCategory !== "all") || dateRange.startDate || dateRange.endDate),
    )
  }

  // Atualizar transações exibidas com base na página
  const updateDisplayedTransactions = (transactions: Expense[], currentPage: number) => {
    // Garantir que temos um array válido
    const validTransactions = Array.isArray(transactions) ? transactions : []

    console.log(`updateDisplayedTransactions: Total de transações: ${validTransactions.length}`)

    // Calcular índices de início e fim para a página atual
    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit

    // Obter as transações para a página atual
    const transactionsForCurrentPage = validTransactions.slice(startIndex, endIndex)
    console.log(`Transações para página ${currentPage}: ${transactionsForCurrentPage.length}`)

    // Atualizar estado
    setDisplayedTransactions(transactionsForCurrentPage)

    // Calcular total de páginas (garantindo que seja pelo menos 1)
    const calculatedTotalPages = Math.max(1, Math.ceil(validTransactions.length / limit))
    console.log(`Total de páginas calculado: ${calculatedTotalPages}`)
    setTotalPages(calculatedTotalPages)

    // Atualizar o total de itens
    setTotalItems(validTransactions.length)

    // Garantir que a página atual não seja maior que o total de páginas
    const validPage = Math.min(currentPage, calculatedTotalPages || 1)
    if (validPage !== currentPage) {
      console.log(`Ajustando página atual de ${currentPage} para ${validPage}`)
    }
    setPage(validPage)

    console.log(
      `Paginação: Página ${validPage} de ${calculatedTotalPages}, Total de itens: ${validTransactions.length}`,
    )
  }

  // Efeito para atualizar as transações exibidas quando a página muda
  useEffect(() => {
    if (filteredTransactions.length > 0) {
      updateDisplayedTransactions(filteredTransactions, page)
    }
  }, [page, filteredTransactions])

  // Efeito para aplicar filtros quando os critérios mudam
  useEffect(() => {
    if (allTransactions.length > 0) {
      applyFilters()
    }
  }, [searchTerm, selectedCategory, dateRange.startDate, dateRange.endDate])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setDateRange({ startDate: undefined, endDate: undefined })

    // Usar setTimeout para garantir que os estados sejam atualizados antes de aplicar os filtros
    setTimeout(() => {
      applyFilters()
    }, 0)
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      if (!userId) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para excluir uma despesa",
          variant: "destructive",
        })
        return
      }

      setIsDeleting(id)
      console.log("TransactionsList: Excluindo despesa com userId:", userId)

      const success = await deleteExpense(id, userId)

      if (success) {
        toast({
          title: "Despesa excluída",
          description: "A despesa foi excluída com sucesso.",
        })

        // Atualizar a lista local removendo a despesa excluída
        const updatedTransactions = allTransactions.filter((t) => t.id !== id)
        setAllTransactions(updatedTransactions)
        setTotalItems(updatedTransactions.length)
        applyFilters(updatedTransactions)
      } else {
        throw new Error("Não foi possível excluir a despesa")
      }
    } catch (err) {
      console.error("Erro ao excluir despesa:", err)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a despesa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/expenses/edit/${id}`)
  }

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa e filtros */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de pesquisa */}
          <div className="flex-1">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Pesquisar na descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                Buscar
              </Button>
            </form>
          </div>

          {/* Filtro de categoria */}
          <div className="w-full md:w-64">
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value)
              }}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Filtrar por categoria" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de data */}
          <div className="w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange.startDate ? (
                    dateRange.endDate ? (
                      <>
                        {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                      </>
                    ) : (
                      formatDate(dateRange.startDate)
                    )
                  ) : (
                    "Filtrar por data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <div className="space-y-3">
                    <h4 className="font-medium">Período</h4>
                    <div className="grid gap-2">
                      <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.startDate}
                            onSelect={(date) => setDateRange((prev) => ({ ...prev, startDate: date || undefined }))}
                            disabled={(date) => (dateRange.endDate ? date > dateRange.endDate : false)}
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="grid gap-1">
                        <div className="flex items-center gap-2">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.endDate}
                            onSelect={(date) => setDateRange((prev) => ({ ...prev, endDate: date || undefined }))}
                            disabled={(date) => (dateRange.startDate ? date < dateRange.startDate : false)}
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDateRange({ startDate: undefined, endDate: undefined })}
                    >
                      Limpar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        applyFilters()
                      }}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Botão para limpar filtros */}
          {isFiltered && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Limpar filtros"
              className="w-full md:w-auto"
            >
              <X className="h-4 w-4" />
              <span className="ml-2 md:hidden">Limpar filtros</span>
            </Button>
          )}
        </div>

        {/* Chips de filtros ativos */}
        {isFiltered && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Pesquisa: {searchTerm}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => {
                    setSearchTerm("")
                  }}
                />
              </Badge>
            )}
            {selectedCategory && selectedCategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Categoria: {categoryLabels[selectedCategory] || selectedCategory}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory("")
                  }}
                />
              </Badge>
            )}
            {dateRange.startDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Data: {formatDate(dateRange.startDate)}
                {dateRange.endDate && ` - ${formatDate(dateRange.endDate)}`}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => {
                    setDateRange({ startDate: undefined, endDate: undefined })
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Tabela de transações */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center text-red-800 dark:text-red-400">
            {error}
            <Button
              variant="outline"
              className="mt-2 mx-auto block"
              onClick={() => {
                setLoading(true)
                const fetchAllTransactions = async () => {
                  try {
                    if (userId) {
                      const response = await getExpenses(1, 1000, userId)
                      setAllTransactions(response.data)
                      setTotalItems(response.data.length)
                      applyFilters(response.data)
                      setError(null)
                    }
                  } catch (err) {
                    console.error("Erro ao buscar transações:", err)
                    setError("Não foi possível carregar as transações. Tente novamente mais tarde.")
                  } finally {
                    setLoading(false)
                  }
                }
                fetchAllTransactions()
              }}
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedTransactions.length > 0 ? (
                  displayedTransactions.map((transaction) => {
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn("font-normal", categoryColors[transaction.category] || categoryColors.outros)}
                          >
                            {categoryLabels[transaction.category] || transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">R$ {transaction.value.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transaction.id)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(transaction.id)}
                              disabled={isDeleting === transaction.id}
                              title="Excluir"
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              {isDeleting === transaction.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {isFiltered
                        ? "Nenhuma transação encontrada com os filtros aplicados"
                        : "Nenhuma transação encontrada"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Paginação */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {filteredTransactions.length > 0 ? (page - 1) * limit + 1 : 0} a{" "}
              {Math.min(page * limit, filteredTransactions.length)} de {totalItems} transações
              {totalPages > 1 && ` (${totalPages} páginas)`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={page <= 1 || loading}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="flex items-center px-3 text-sm">
                Página {page} de {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page >= totalPages || loading}>
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

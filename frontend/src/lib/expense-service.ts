"use client"

import { toast } from "@/components/ui/use-toast"

// Tipos para as despesas conforme a API
export interface Expense {
  id: string
  value: number
  category: string
  date: string | Date
  description: string
  createdAt?: string
  userId?: string
}

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Função para formatar a data para a API
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Função para formatar a data para exibição
export function formatDate(dateString: string): string {
  const date = new Date(dateString)

  // Verificar se a data termina com Z (UTC)
  if (dateString.endsWith("Z")) {
    // Usar métodos UTC para evitar problemas de fuso horário
    const day = date.getUTCDate().toString().padStart(2, "0")
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
    const year = date.getUTCFullYear()
    return `${day}/${month}/${year}`
  } else {
    // Para datas sem indicação de UTC
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
}

// Adicionar uma nova despesa
export async function addExpense(expense: Omit<Expense, "id">, userId: string): Promise<Expense> {
  if (!userId) {
    throw new Error("Usuário não autenticado")
  }

  try {
    console.log("Enviando despesa com userId:", userId)

    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...expense,
        userId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erro ao criar despesa")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao adicionar despesa:", error)
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : "Erro ao criar despesa",
      variant: "destructive",
    })
    throw error
  }
}

// Obter todas as despesas com paginação
export async function getExpenses(page = 1, limit = 10, userId?: string, search?: string, category?: string, startDate?: string, endDate?: string,
): Promise<{ data: Expense[]; meta: {totalItems: number; totalPages: number; currentPage: number } }>  {

  if (!userId) {
    console.warn("Tentativa de buscar despesas sem userId")
    return {
      data: [],
      meta: {
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
      },
    }
  }

  try {
    let url = `${API_URL}/expenses?page=${page}&limit=${limit}&userId=${encodeURIComponent(userId)}`

    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    if (category) {
      url += `&category=${encodeURIComponent(category)}`
    }

    if (startDate) {
      url += `&startDate=${encodeURIComponent(startDate)}`
    }

    if (endDate) {
      url += `&endDate=${encodeURIComponent(endDate)}`
    }

    console.log("Buscando despesas com URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erro ao buscar despesas")
    }

    const responseText = await response.text()
    console.log("Resposta bruta da API (texto):", responseText)

    const responseData = responseText ? JSON.parse(responseText) : null
    console.log("Resposta da API (JSON):", responseData)

    let data: Expense[] = []

    if (Array.isArray(responseData)) {
      data = responseData
      console.log("API retornou um array de despesas")
    } else if (responseData && typeof responseData === "object") {
      if (Array.isArray(responseData.data)) {
        data = responseData.data
        console.log("API retornou um objeto com array de despesas em data")
      } else if (responseData.items && Array.isArray(responseData.items)) {
        data = responseData.items
        console.log("API retornou um objeto com array de despesas em items")
      } else {
        data = [responseData]
        console.log("API retornou um objeto único, convertendo para array")
      }
    }

    data = data.filter((expense) => expense.userId === userId)
    console.log(`Após filtrar por userId (${userId}): ${data.length} despesas`)

    // Calcular dados de paginação
    const totalItems = data.length
    const totalPages = Math.max(1, Math.ceil(totalItems / limit))

    const meta =
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      responseData && responseData.meta
        ? responseData.meta
        : {
            totalItems,
            totalPages,
            currentPage: page,
          }

    console.log(`API retornou ${data.length} despesas, total de ${meta.totalItems} itens em ${meta.totalPages} páginas`)

    return {
      data,
      meta,
    }
  } catch (error) {
    console.error("Erro ao buscar despesas:", error)
    return {
      data: [],
      meta: {
        totalItems: 0,
        totalPages: 0,
        currentPage: page,
      },
    }
  }
}

// Obter o total de despesas para os últimos 30 dias
export async function getTotalExpensesLast30Days (userId?: string): Promise<number> {
  if (!userId) {
    return 0
  }

  try {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const startDate = formatDateForAPI(thirtyDaysAgo)
    const endDate = formatDateForAPI(today)

    const { data: expenses } = await getExpenses(1, 1000, userId, undefined, undefined, startDate, endDate)

    const total = expenses.reduce((total, expense) => total + expense.value, 0)

    return total
  } catch (error) {
    console.error("Erro ao calcular total de despesas:", error)
    return 0
  }
}

// Obter despesas recentes (últimas 10)
export async function getRecentExpenses (limit = 10, userId?: string): Promise<Expense[]> {
  if (!userId) {
    return []
  }

  try {
    console.log("Buscando despesas recentes com userId:", userId)
    
    const response = await fetch(`${API_URL}/expenses?page=1&limit=${limit}&userId=${encodeURIComponent(userId)}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erro ao buscar despesas recentes")
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Erro ao buscar despesas recentes:", error)
    return []
  }
}

// Obter despesas agrupadas por categoria
export async function getExpensesByCategory (userId?: string): Promise<Record<string, number>> {
  if (!userId) {
    return {}
  }

  try {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const startDate = formatDateForAPI(thirtyDaysAgo)
    const endDate = formatDateForAPI(today)

    const { data: expenses } = await getExpenses(1, 1000, userId, undefined, undefined, startDate, endDate)

    const expensesByCategory: Record<string, number> = {}

    expenses.forEach((expense) => {
      const category = expense.category.toLowerCase()
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0
      }
      expensesByCategory[category] += expense.value
    })

    return expensesByCategory
  } catch (error) {
    console.error("Erro ao agrupar despesas por categoria:", error)
    return {}
  }
}

// Excluir uma despesa
export async function deleteExpense (id: string, userId: string): Promise<boolean> {
  if (!userId) {
    throw new Error("Usuário não autenticado")
  }

  try {
    console.log("Excluindo despesa com userId:", userId)

    const response = await fetch(`${API_URL}/expenses/${id}?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erro ao excluir despesa: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir despesa:", error)
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : "Erro ao excluir despesa",
      variant: "destructive",
    })
    throw error
  }
}

// Atualizar uma despesa
export async function updateExpense (id: string, expense: Partial<Expense>, userId: string): Promise<Expense> {
  if (!userId) {
    throw new Error("Usuário não autenticado")
  }

  try {
    console.log("Atualizando despesa com userId:", userId)

    const response = await fetch(`${API_URL}/expenses/${id}?userId=${encodeURIComponent(userId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...expense,
        userId,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Erro ao atualizar despesa")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error)
    toast({
      title: "Erro",
      description: error instanceof Error ? error.message : "Erro ao atualizar despesa",
      variant: "destructive",
    })
    throw error
  }
}

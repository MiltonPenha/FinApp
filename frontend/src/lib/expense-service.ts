// Tipos para as despesas conforme a API
export interface Expense {
  id: string
  value: number
  category: string
  date: string | Date
  description: string
  created_at?: string
}

export interface PaginatedResponse {
  data: Expense[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  statusCode: number
  data: T
  message: string
}

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Função para formatar a data para o formato esperado pela API (YYYY-MM-DD)
export function formatDateForApi(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Função para converter datas da API para objetos Date
export function formatApiData(expense: any): Expense {
  return {
    ...expense,
    date: new Date(expense.date),
  }
}

// Adicionar uma nova despesa
export const addExpense = async (expense: Omit<Expense, "id">): Promise<Expense | null> => {
  try {
    const response = await fetch(`${API_URL}/expenses`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: expense.value,
        category: expense.category,
        date: expense.date instanceof Date ? formatDateForApi(expense.date) : expense.date,
        description: expense.description,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro ao adicionar despesa: ${response.status}`)
    }

    const result: ApiResponse<Expense> = await response.json()
    return result.data
  } catch (error) {
    console.error("Erro ao adicionar despesa:", error)
    throw error
  }
}

// Parâmetros para filtrar despesas
export interface ExpenseFilters {
  search?: string
  category?: string
  startDate?: Date | string
  endDate?: Date | string
}

// Obter despesas com filtros e paginação
export const getFilteredExpenses = async (
  page = 1,
  limit = 10,
  filters?: ExpenseFilters,
): Promise<PaginatedResponse> => {
  try {
    // Construir a URL com os parâmetros de consulta
    let url = `${API_URL}/expenses?page=${page}&limit=${limit}`

    // Adicionar filtros à URL se fornecidos
    if (filters) {
      if (filters.search) {
        url += `&search=${encodeURIComponent(filters.search)}`
      }
      if (filters.category) {
        url += `&category=${encodeURIComponent(filters.category)}`
      }
      if (filters.startDate) {
        const formattedDate =
          filters.startDate instanceof Date ? formatDateForApi(filters.startDate) : filters.startDate
        url += `&startDate=${encodeURIComponent(formattedDate)}`
      }
      if (filters.endDate) {
        const formattedDate = filters.endDate instanceof Date ? formatDateForApi(filters.endDate) : filters.endDate
        url += `&endDate=${encodeURIComponent(formattedDate)}`
      }
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erro ao buscar despesas: ${response.status}`)
    }

    const result = await response.json()

    // Formatar as datas
    if (result.data) {
      result.data = result.data.map(formatApiData)
    }

    return result
  } catch (error) {
    console.error("Erro ao buscar despesas filtradas:", error)
    throw error
  }
}

// Obter todas as despesas com paginação
export const getExpenses = async (page = 1, limit = 100): Promise<PaginatedResponse> => {
  try {
    const response = await fetch(`${API_URL}/expenses?page=${page}&limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Erro ao buscar despesas: ${response.status}`)
    }

    const result = await response.json()

    // Formatar as datas
    if (result.data) {
      result.data = result.data.map(formatApiData)
    }

    return result
  } catch (error) {
    console.error("Erro ao buscar despesas:", error)
    throw error
  }
}

// Obter despesas para os últimos 30 dias
export const getExpensesLast30Days = async (): Promise<Expense[]> => {
  try {
    // Como a API não tem um endpoint específico para isso,
    // vamos buscar todas as despesas e filtrar no cliente
    const result = await getExpenses(1, 1000)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return result.data.filter((expense) => {
      const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date)
      return expenseDate >= thirtyDaysAgo
    })
  } catch (error) {
    console.error("Erro ao buscar despesas dos últimos 30 dias:", error)
    throw error
  }
}

// Obter o total de despesas para os últimos 30 dias
export const getTotalExpensesLast30Days = async (): Promise<number> => {
  try {
    const expenses = await getExpensesLast30Days()
    return expenses.reduce((total, expense) => total + expense.value, 0)
  } catch (error) {
    console.error("Erro ao calcular total de despesas:", error)
    return 0
  }
}

// Obter despesas recentes (últimas 10)
export const getRecentExpenses = async (limit = 10): Promise<Expense[]> => {
  try {
    const result = await getExpenses(1, limit)

    // Ordenar por data (mais recente primeiro)
    return result.data.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date)
      const dateB = b.date instanceof Date ? b.date : new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })
  } catch (error) {
    console.error("Erro ao buscar despesas recentes:", error)
    throw error
  }
}

// Obter despesas agrupadas por categoria
export const getExpensesByCategory = async (): Promise<Record<string, number>> => {
  try {
    const expenses = await getExpensesLast30Days()

    return expenses.reduce(
      (acc, expense) => {
        const { category, value } = expense
        acc[category] = (acc[category] || 0) + value
        return acc
      },
      {} as Record<string, number>,
    )
  } catch (error) {
    console.error("Erro ao agrupar despesas por categoria:", error)
    return {}
  }
}

// Excluir uma despesa
export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Erro ao excluir despesa: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Erro ao excluir despesa:", error)
    return false
  }
}

// Atualizar uma despesa
export const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense | null> => {
  try {
    const updates: any = { ...expense }

    // Converter Date para string ISO se necessário
    if (updates.date instanceof Date) {
      updates.date = formatDateForApi(updates.date)
    }

    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: updates.value,
        category: updates.category,
        date: updates.date,
        description: updates.description,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro ao atualizar despesa: ${response.status}`)
    }

    const result: ApiResponse<Expense> = await response.json()
    return formatApiData(result.data)
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error)
    return null
  }
}

"use client"

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Interfaces baseadas nos DTOs do backend
export interface SpendingAnalysis {
  currentMonth: {
    total: number
    byCategory: Record<string, number>
  }
  previousMonth: {
    total: number
    byCategory: Record<string, number>
  }
  variations: CategoryVariation[]
  savingOpportunities: SavingOpportunity[]
  insights: string[]
  hasHistoricalData: boolean
  hasCurrentData: boolean
}

export interface CategoryVariation {
  category: string
  currentAmount: number
  previousAmount: number
  variation: number
  difference: number
}

export interface SavingOpportunity {
  category: string
  currentSpending: number
  excessAmount: number
  potentialSaving: number
  suggestion: string
}

export interface InvestmentSuggestion {
  type: string
  title: string
  description: string
  suggestedAmount: number
  expectedReturn: number
  riskLevel: "baixo" | "medio" | "alto"
  category: string
}

export interface FinancialProjection {
  investmentType: string
  monthlyInvestment: number
  annualRate: number
  projections: ProjectionPoint[]
  totalInvested: number
  finalValue: number
  totalProfit: number
}

export interface ProjectionPoint {
  month: number
  value: number
  invested: number
  profit: number
}

export interface DashboardInsights {
  totalSpentThisMonth: number
  totalSpentLastMonth: number
  monthlyVariation: number
  topSavingOpportunity: SavingOpportunity
  bestInvestmentSuggestion: InvestmentSuggestion
  projectedGainIn2Years: number
  insights: string[]
}

// Funções para consumir a API
export async function getSpendingAnalysis(
  userId: string,
  currentMonth?: string,
  previousMonth?: string,
): Promise<SpendingAnalysis> {
  const params = new URLSearchParams()
  if (currentMonth) params.append("currentMonth", currentMonth)
  if (previousMonth) params.append("previousMonth", previousMonth)

  const response = await fetch(`${API_URL}/insights/spending-analysis/${userId}?${params}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao buscar análise de gastos: ${response.status} ${errorText}`)
  }

  return response.json()
}

export async function getInvestmentSuggestions(userId: string): Promise<InvestmentSuggestion[]> {
  const response = await fetch(`${API_URL}/insights/investment-suggestions/${userId}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao buscar sugestões de investimento: ${response.status} ${errorText}`)
  }

  return response.json()
}

export async function getFinancialProjections(
  userId: string,
  investmentAmount?: number,
  investmentType?: string,
): Promise<FinancialProjection> {
  const params = new URLSearchParams()
  if (investmentAmount) params.append("investmentAmount", investmentAmount.toString())
  if (investmentType) params.append("investmentType", investmentType)

  const response = await fetch(`${API_URL}/insights/financial-projections/${userId}?${params}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao calcular projeções financeiras: ${response.status} ${errorText}`)
  }

  return response.json()
}

export async function getDashboardInsights(userId: string): Promise<DashboardInsights> {
  const response = await fetch(`${API_URL}/insights/dashboard-summary/${userId}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ao buscar insights do dashboard: ${response.status} ${errorText}`)
  }

  return response.json()
}

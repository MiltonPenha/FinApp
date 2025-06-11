/* eslint-disable @typescript-eslint/prefer-optional-chain */
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
    getFinancialProjections,
    getInvestmentSuggestions,
    getSpendingAnalysis,
    type FinancialProjection,
    type InvestmentSuggestion,
    type SpendingAnalysis,
} from "@/lib/insights-service"
import { useAuth } from "@clerk/nextjs"
import { AlertCircle, ArrowLeft, BarChart3, DollarSign, Target, TrendingDown, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function InsightsPage() {
  const [spendingAnalysis, setSpendingAnalysis] = useState<SpendingAnalysis | null>(null)
  const [investmentSuggestions, setInvestmentSuggestions] = useState<InvestmentSuggestion[]>([])
  const [selectedProjection, setSelectedProjection] = useState<FinancialProjection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  const { toast } = useToast()
  const fetchingRef = useRef(false)

  useEffect(() => {
    // Evitar múltiplas chamadas simultâneas
    if (fetchingRef.current) return

    const fetchData = async () => {
      if (!userId) {
        setError("Usuário não identificado")
        setIsLoading(false)
        return
      }

      try {
        fetchingRef.current = true
        setIsLoading(true)
        setError(null)
        console.log("Buscando dados para userId:", userId)

        // Buscar análise de gastos e sugestões em paralelo
        const [analysis, suggestions] = await Promise.all([
          getSpendingAnalysis(userId),
          getInvestmentSuggestions(userId),
        ])

        console.log("Análise de gastos recebida:", analysis)
        console.log("Sugestões de investimento recebidas:", suggestions)

        setSpendingAnalysis(analysis)
        setInvestmentSuggestions(suggestions)

        // Buscar projeção para a primeira sugestão
        if (suggestions && suggestions.length > 0 && suggestions[0]) {
          const projection = await getFinancialProjections(
            typeof userId === "string" ? userId : "",
            suggestions[0].suggestedAmount,
            suggestions[0].type
          )
          console.log("Projeção financeira recebida:", projection)
          setSelectedProjection(projection)
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar dados")
        toast({
          title: "Erro ao carregar dados",
          description: err instanceof Error ? err.message : "Tente novamente mais tarde",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        fetchingRef.current = false
      }
    }

    fetchData()

    // Limpar referência ao desmontar
    return () => {
      fetchingRef.current = false
    }
  }, [userId, toast])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getVariationColor = (variation: number) => {
    if (variation > 0) return "text-red-600 dark:text-red-400"
    if (variation < 0) return "text-green-600 dark:text-green-400"
    return "text-gray-600 dark:text-gray-400"
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "baixo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medio":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "alto":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  // Usar uma referência para evitar múltiplas chamadas simultâneas
  const projectingRef = useRef(false)

  const handleProjectionSelect = async (suggestion: InvestmentSuggestion) => {
    if (projectingRef.current) return

    try {
      projectingRef.current = true
      setSelectedProjection(null) // Reset para mostrar loading
      console.log("Calculando projeção para:", suggestion)
      const projection = await getFinancialProjections(
        typeof userId === "string" ? userId : "",
        suggestion.suggestedAmount,
        suggestion.type
      )
      console.log("Nova projeção recebida:", projection)
      setSelectedProjection(projection)
    } catch (err) {
      console.error("Erro ao calcular projeção:", err)
      toast({
        title: "Erro ao calcular projeção",
        description: err instanceof Error ? err.message : "Tente novamente mais tarde",
        variant: "destructive",
      })
    } finally {
      projectingRef.current = false
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F12] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F12] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insights Financeiros</h1>
          </div>

          <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar dados</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F12] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insights Financeiros</h1>
        </div>

        {/* Análise de Gastos */}
        {spendingAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variações por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Variações por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {spendingAnalysis.variations && spendingAnalysis.variations.length > 0 ? (
                  spendingAnalysis.variations.slice(0, 5).map((variation, index) => (
                    <div key={`${variation.category}-${index}`} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{variation.category}</span>
                        <div className={`flex items-center gap-1 ${getVariationColor(variation.variation)}`}>
                          {variation.variation > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : variation.variation < 0 ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : (
                            <span className="w-4 h-4 text-center">-</span>
                          )}
                          <span className="text-sm font-medium">
                            {variation.variation === 0 ? "0%" : `${Math.abs(variation.variation).toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Atual: {formatCurrency(variation.currentAmount)}</span>
                        <span>Anterior: {formatCurrency(variation.previousAmount)}</span>
                      </div>
                      {variation.difference !== 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Diferença: {variation.difference > 0 ? "+" : ""}
                          {formatCurrency(variation.difference)}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Não há dados suficientes para análise de variações
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {!spendingAnalysis.hasCurrentData
                        ? "Adicione algumas despesas para começar a ver insights"
                        : "Continue registrando despesas para ver comparações mensais"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gastos por Categoria (Detalhado) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Gastos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {spendingAnalysis.hasCurrentData ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Mês Atual</h4>
                    {Object.entries(spendingAnalysis.currentMonth.byCategory).length > 0 ? (
                      Object.entries(spendingAnalysis.currentMonth.byCategory)
                        .sort(([, a], [, b]) => (b) - (a))
                        .map(([category, amount]) => (
                          <div
                            key={category}
                            className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded"
                          >
                            <span className="text-sm font-medium capitalize">{category}</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum gasto registrado este mês</p>
                    )}

                    {spendingAnalysis.hasHistoricalData && (
                      <>
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mt-4">Mês Anterior</h4>
                        {Object.entries(spendingAnalysis.previousMonth.byCategory).length > 0 ? (
                          Object.entries(spendingAnalysis.previousMonth.byCategory)
                            .sort(([, a], [, b]) => (b) - (a))
                            .map(([category, amount]) => (
                              <div
                                key={category}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                              >
                                <span className="text-sm font-medium capitalize">{category}</span>
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                  {formatCurrency(amount)}
                                </span>
                              </div>
                            ))
                        ) : (
                          <p className="text-sm text-gray-500">Nenhum gasto registrado no mês anterior</p>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhum gasto registrado ainda</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Comece adicionando suas primeiras despesas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Oportunidades de Economia */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Oportunidades de Economia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {spendingAnalysis.savingOpportunities && spendingAnalysis.savingOpportunities.length > 0 ? (
                  spendingAnalysis.savingOpportunities.map((opportunity, index) => (
                    <div key={index} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{opportunity.category}</span>
                        <span className="text-orange-600 dark:text-orange-400 font-semibold">
                          {formatCurrency(opportunity.potentialSaving)}/mês
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{opportunity.suggestion}</p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Gasto atual: {formatCurrency(opportunity.currentSpending)}
                        {opportunity.excessAmount > 0 && (
                          <span> | Excesso: {formatCurrency(opportunity.excessAmount)}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      {spendingAnalysis.hasCurrentData
                        ? "Não foram identificadas oportunidades de economia"
                        : "Adicione despesas para receber sugestões de economia"}
                    </p>
                    {spendingAnalysis.hasCurrentData && !spendingAnalysis.hasHistoricalData && (
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Continue registrando despesas para receber análises mais detalhadas
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sugestões de Investimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Sugestões de Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {investmentSuggestions && investmentSuggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {investmentSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleProjectionSelect(suggestion)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{suggestion.title}</h3>
                      <Badge className={getRiskColor(suggestion.riskLevel)}>{suggestion.riskLevel}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{suggestion.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{formatCurrency(suggestion.suggestedAmount)}/mês</span>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {(suggestion.expectedReturn * 100).toFixed(1)}% a.a.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Não há sugestões de investimento disponíveis
              </p>
            )}
          </CardContent>
        </Card>

        {/* Projeção Financeira */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Projeção de 2 Anos
              {selectedProjection && ` - ${selectedProjection.investmentType.replace("_", " ").toUpperCase()}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProjection ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resumo da Projeção */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Investimento Mensal</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(selectedProjection.monthlyInvestment)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Total</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedProjection.totalProfit)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor Final</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(selectedProjection.finalValue)}
                    </p>
                  </div>
                </div>

                {/* Timeline da Projeção */}
                <div className="space-y-4">
                  <h4 className="font-medium">Evolução do Investimento</h4>
                  {selectedProjection.projections.map((point) => (
                    <div key={point.month} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{point.month} meses</span>
                        <span className="font-medium">{formatCurrency(point.value)}</span>
                      </div>
                      <Progress value={(point.value / selectedProjection.finalValue) * 100} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Investido: {formatCurrency(point.invested)}</span>
                        <span>Lucro: {formatCurrency(point.profit)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Selecione uma sugestão de investimento para ver a projeção
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        {spendingAnalysis && spendingAnalysis.insights && (
          <Card>
            <CardHeader>
              <CardTitle>Insights Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              {spendingAnalysis.insights.length > 0 ? (
                <div className="space-y-3">
                  {spendingAnalysis.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Não há insights personalizados disponíveis
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

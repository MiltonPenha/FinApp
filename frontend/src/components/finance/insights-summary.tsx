"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getDashboardInsights, type DashboardInsights } from "@/lib/insights-service"
import { AlertCircle, DollarSign, Lightbulb, Target, TrendingDown, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface InsightsSummaryProps {
  userId?: string | null
}

export function InsightsSummary({ userId }: InsightsSummaryProps) {
  const [insights, setInsights] = useState<DashboardInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchInsights = async () => {
      if (!userId) return

      try {
        setIsLoading(true)
        setError(null)
        console.log("Buscando insights para userId:", userId)
        const data = await getDashboardInsights(userId)
        console.log("Insights recebidos:", data)
        setInsights(data)
      } catch (err) {
        console.error("Erro ao buscar insights:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar insights")
        toast({
          title: "Erro ao carregar insights",
          description: err instanceof Error ? err.message : "Tente novamente mais tarde",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [userId, toast])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error || !insights) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-sm text-center">{error || "Não foi possível carregar os insights"}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/insights")}>
          Ver Análise Manual
        </Button>
      </div>
    )
  }

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

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="w-4 h-4" />
    if (variation < 0) return <TrendingDown className="w-4 h-4" />
    return <DollarSign className="w-4 h-4" />
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

  return (
    <div className="space-y-4">
      {/* Variação Mensal */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gastos este mês</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(insights.totalSpentThisMonth)}
          </p>
        </div>
        <div className={`flex items-center gap-1 ${getVariationColor(insights.monthlyVariation)}`}>
          {getVariationIcon(insights.monthlyVariation)}
          <span className="text-sm font-medium">{Math.abs(insights.monthlyVariation).toFixed(1)}%</span>
        </div>
      </div>

      {/* Principal Oportunidade de Economia */}
      {insights.topSavingOpportunity && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              Oportunidade de Economia
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {insights.topSavingOpportunity.category.charAt(0).toUpperCase() +
                insights.topSavingOpportunity.category.slice(1)}
            </p>
            <p className="font-semibold text-orange-600 dark:text-orange-400">
              Economize até {formatCurrency(insights.topSavingOpportunity.potentialSaving)}/mês
            </p>
          </CardContent>
        </Card>
      )}

      {/* Melhor Sugestão de Investimento */}
      {insights.bestInvestmentSuggestion && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Sugestão de Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{insights.bestInvestmentSuggestion.title}</p>
              <Badge className={getRiskColor(insights.bestInvestmentSuggestion.riskLevel)}>
                {insights.bestInvestmentSuggestion.riskLevel}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {formatCurrency(insights.bestInvestmentSuggestion.suggestedAmount)}/mês
            </p>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Ganho em 2 anos: {formatCurrency(insights.projectedGainIn2Years)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights Principais */}
      {insights.insights && insights.insights.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights
          </h4>
          {insights.insights.slice(0, 2).map((insight, index) => (
            <p key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {insight}
            </p>
          ))}
        </div>
      )}

      {/* Botão para Ver Mais */}
      <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/insights")}>
        Ver Análise Completa
      </Button>
    </div>
  )
}

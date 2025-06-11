/* eslint-disable max-len */
// insights.service.ts - Versão Corrigida
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import {
  CategoryVariationDto,
  type DashboardInsightsDto,
  type FinancialProjectionDto,
  InvestmentSuggestionDto,
  SavingOpportunityDto,
  SpendingAnalysisDto
} from './insights.dto';

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaService) {}

  async analyzeSpendingPatterns(
    userId: string,
    currentMonth?: string,
    previousMonth?: string,
  ): Promise<SpendingAnalysisDto> {

    const currentDate = currentMonth ? new Date(currentMonth) : new Date();
    const previousDate = previousMonth
      ? new Date(previousMonth)
      : new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);


    // Buscar gastos do mês atual
    const currentMonthExpenses = await this.prisma.expense.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
        },
      },
      select: {
        id: true,
        value: true, // Certifique-se de que este campo existe na sua tabela
        category: true,
        date: true,
        description: true,
        userId: true,
      },
    });

    // Buscar gastos do mês anterior
    const previousMonthExpenses = await this.prisma.expense.findMany({
      where: {
        userId: userId,
        date: {
          gte: new Date(previousDate.getFullYear(), previousDate.getMonth(), 1),
          lt: new Date(previousDate.getFullYear(), previousDate.getMonth() + 1, 1),
        },
      },
      select: {
        id: true,
        value: true,
        category: true,
        date: true,
        description: true,
        userId: true,
      },
    });

    // Verificar se há dados suficientes
    const hasCurrentData = currentMonthExpenses.length > 0;
    const hasPreviousData = previousMonthExpenses.length > 0;
    const hasHistoricalData = hasPreviousData;

    // Agrupar por categoria
    const currentByCategory = this.groupExpensesByCategory(currentMonthExpenses);
    const previousByCategory = this.groupExpensesByCategory(previousMonthExpenses);

    // Calcular variações apenas se houver dados históricos
    const categoryAnalysis = hasHistoricalData
      ? this.calculateCategoryVariations(currentByCategory, previousByCategory)
      : this.createInitialCategoryAnalysis(currentByCategory);

    // Identificar oportunidades baseadas nos dados disponíveis
    const savingOpportunities = hasHistoricalData
      ? this.identifySavingOpportunities(categoryAnalysis)
      : this.identifyInitialSavingOpportunities(currentByCategory);

    // Gerar insights apropriados
    const insights = hasHistoricalData
      ? this.generateSpendingInsights(categoryAnalysis)
      : this.generateInitialInsights(currentByCategory, hasCurrentData);

    const result = {
      currentMonth: {
        total: this.calculateTotal(currentMonthExpenses),
        byCategory: currentByCategory,
      },
      previousMonth: {
        total: this.calculateTotal(previousMonthExpenses),
        byCategory: previousByCategory,
      },
      variations: categoryAnalysis,
      savingOpportunities,
      insights,
      hasHistoricalData,
      hasCurrentData,
    };

    return result;
  }

  // Método auxiliar corrigido para agrupar despesas
  private groupExpensesByCategory(expenses: any[]) {

    if (expenses.length === 0) {
      return {};
    }

    const grouped = expenses.reduce((acc, expense) => {
      const category = expense.category?.toLowerCase() || 'outros';

      // Tentar diferentes campos para o valor
      let value = 0;
      if (expense.value !== undefined && expense.value !== null) {
        value = parseFloat(expense.value.toString()) || 0;
      } else if (expense.amount !== undefined && expense.amount !== null) {
        value = parseFloat(expense.amount.toString()) || 0;
      }


      acc[category] = (acc[category] || 0) + value;
      return acc;
    }, {});

    return grouped;
  }

  // Método auxiliar corrigido para calcular total
  private calculateTotal(expenses: any[]): number {

    if (expenses.length === 0) {
      return 0;
    }

    const total = expenses.reduce((sum, expense) => {
      let value = 0;
      if (expense.value !== undefined && expense.value !== null) {
        value = parseFloat(expense.value.toString()) || 0;
      } else if (expense.amount !== undefined && expense.amount !== null) {
        value = parseFloat(expense.amount.toString()) || 0;
      }

      return sum + value;
    }, 0);

    return total;
  }

  // Resto dos métodos permanecem iguais...
  private calculateCategoryVariations(current: any, previous: any): CategoryVariationDto[] {
    const variations = [];
    const allCategories = new Set([...Object.keys(current), ...Object.keys(previous)]);

    for (const category of allCategories) {
      const currentAmount = current[category] || 0;
      const previousAmount = previous[category] || 0;
      const variation = previousAmount > 0
        ? ((currentAmount - previousAmount) / previousAmount) * 100
        : currentAmount > 0 ? 100 : 0;

      variations.push({
        category,
        currentAmount,
        previousAmount,
        variation: Math.round(variation * 100) / 100,
        difference: currentAmount - previousAmount,
      });
    }

    return variations.sort((a, b) => Math.abs(b.variation) - Math.abs(a.variation));
  }

  private createInitialCategoryAnalysis(current: any): CategoryVariationDto[] {
    const analysis = [];

    for (const [category, amount] of Object.entries(current)) {
      analysis.push({
        category,
        currentAmount: amount as number,
        previousAmount: 0,
        variation: 0,
        difference: 0,
        isInitial: true,
      });
    }

    return analysis.sort((a, b) => b.currentAmount - a.currentAmount);
  }

  private identifySavingOpportunities(variations: CategoryVariationDto[]): SavingOpportunityDto[] {
    return variations
      .filter(v => v.variation > 10 && v.currentAmount > 50)
      .map(v => ({
        category: v.category,
        currentSpending: v.currentAmount,
        excessAmount: v.difference,
        potentialSaving: Math.round(v.difference * 0.5),
        suggestion: this.getCategorySuggestion(v.category),
      }))
      .slice(0, 3);
  }

  private identifyInitialSavingOpportunities(currentByCategory: any): SavingOpportunityDto[] {
    const opportunities = [];
    const totalSpent = (Object.values(currentByCategory) as number[]).reduce((sum, amount) => sum + amount,0);

    for (const [category, amount] of Object.entries(currentByCategory)) {
      const percentage = ((amount as number) / totalSpent) * 100;

      if (percentage > 20 && (amount as number) > 100) {
        const potentialSaving = Math.round((amount as number) * 0.1);

        opportunities.push({
          category,
          currentSpending: amount as number,
          excessAmount: 0,
          potentialSaving,
          suggestion: this.getInitialCategorySuggestion(category),
          isInitial: true,
        });
      }
    }

    return opportunities.slice(0, 3);
  }

  private getInitialCategorySuggestion(category: string): string {
    const suggestions = {
      alimentacao: 'Planeje suas refeições e considere cozinhar mais em casa para economizar',
      transporte: 'Avalie opções de transporte mais econômicas como transporte público',
      entretenimento: 'Busque atividades gratuitas ou com desconto em sua cidade',
      compras: 'Faça listas de compras e evite compras por impulso',
      outros: 'Monitore seus gastos nesta categoria para identificar padrões',
    };
    return suggestions[category] || suggestions.outros;
  }

  private generateInitialInsights(currentByCategory: any, hasCurrentData: boolean): string[] {
    if (!hasCurrentData) {
      return [
        'Comece adicionando suas primeiras despesas para receber insights personalizados',
        'Registre seus gastos diários para acompanhar seus padrões de consumo',
        'Após algumas semanas, você receberá análises comparativas detalhadas',
      ];
    }

    const insights = [];
    const totalSpent = (Object.values(currentByCategory) as number[]).reduce((sum, amount) => sum + amount,0);
    const sortedCategories = Object.entries(currentByCategory)
      .sort(([,a], [,b]) => (b as number) - (a as number));

    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const percentage = ((topAmount as number) / totalSpent) * 100;

      insights.push(
        `Sua maior categoria de gastos é ${topCategory} com R$ ${(topAmount as number).toFixed(2)} (${percentage.toFixed(1)}% do total)`
      );
    }

    if (sortedCategories.length > 1) {
      const [secondCategory, secondAmount] = sortedCategories[1];
      insights.push(
        `Sua segunda maior categoria é ${secondCategory} com R$ ${(secondAmount as number).toFixed(2)}`
      );
    }

    insights.push(
      'Continue registrando seus gastos para receber comparações mensais e sugestões de economia'
    );

    return insights;
  }

  async generateInvestmentSuggestions(userId: string): Promise<InvestmentSuggestionDto[]> {
    const spendingAnalysis = await this.analyzeSpendingPatterns(userId);
    const suggestions: InvestmentSuggestionDto[] = [];

    // Baseado nas oportunidades de economia, gerar sugestões
    for (const opportunity of spendingAnalysis.savingOpportunities) {
      const investmentSuggestions = this.createInvestmentSuggestions(opportunity);
      suggestions.push(...investmentSuggestions);
    }

    return suggestions.slice(0, 5); // Limitar a 5 sugestões principais
  }

  // insights.service.ts - Método calculateFinancialProjections CORRIGIDO
  async calculateFinancialProjections(
    userId: string,
    investmentAmount?: number,
    investmentType?: string,
  ): Promise<FinancialProjectionDto> {

    const amount = investmentAmount || 100;
    const type = investmentType || 'tesouro_direto';

    // Taxas de retorno anuais
    const returnRates = {
      tesouro_direto: 0.1056, // 10.56% ao ano
      cdb: 0.12, // 12% ao ano
      acoes: 0.15, // 15% ao ano
      fundos_imobiliarios: 0.08, // 8% ao ano
      poupanca: 0.07, // 7% ao ano
    };

    const annualRate = returnRates[type] || returnRates.tesouro_direto;
    const monthlyRate = Math.pow(1 + annualRate, 1/12) - 1;


    // Fórmula correta para anuidade (investimento mensal com juros compostos)
    const projections = [];

    for (let month = 6; month <= 24; month += 6) {
      // Fórmula para valor futuro de anuidade:
      // FV = PMT * [((1 + r)^n - 1) / r]
      // Onde: PMT = pagamento mensal, r = taxa mensal, n = número de meses
      const futureValue = amount * (Math.pow(1 + monthlyRate, month) - 1) / monthlyRate;
      const totalInvested = amount * month;
      const profit = futureValue - totalInvested;
      projections.push({
        month,
        value: Math.round(futureValue * 100) / 100,
        invested: totalInvested,
        profit: Math.round(profit * 100) / 100,
      });
    }

    // Cálculo final para 24 meses
    const finalValue = amount * (Math.pow(1 + monthlyRate, 24) - 1) / monthlyRate;
    const totalInvested = amount * 24;
    const totalProfit = finalValue - totalInvested;

    const result = {
      investmentType: type,
      monthlyInvestment: amount,
      annualRate,
      projections,
      totalInvested,
      finalValue: Math.round(finalValue * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
    };

    return result;
  }

  async getDashboardInsights(userId: string): Promise<DashboardInsightsDto> {
    const spendingAnalysis = await this.analyzeSpendingPatterns(userId);
    const suggestions = await this.generateInvestmentSuggestions(userId);

    // Pegar a melhor sugestão para projeção
    const bestSuggestion = suggestions[0];
    let projection = null;

    if (bestSuggestion) {
      projection = await this.calculateFinancialProjections(
        userId,
        bestSuggestion.suggestedAmount,
        bestSuggestion.type,
      );
    }

    return {
      totalSpentThisMonth: spendingAnalysis.currentMonth.total,
      totalSpentLastMonth: spendingAnalysis.previousMonth.total,
      monthlyVariation: this.calculateMonthlyVariation(spendingAnalysis),
      topSavingOpportunity: spendingAnalysis.savingOpportunities[0],
      bestInvestmentSuggestion: bestSuggestion,
      projectedGainIn2Years: projection?.totalProfit || 0,
      insights: spendingAnalysis.insights.slice(0, 3), // Top 3 insights
    };
  }

  private getCategorySuggestion(category: string): string {
    const suggestions = {
      alimentacao: 'Considere cozinhar mais em casa e planejar suas refeições',
      transporte: 'Avalie usar transporte público ou caronas compartilhadas',
      entretenimento: 'Busque atividades gratuitas ou com desconto',
      compras: 'Faça uma lista antes de comprar e evite compras por impulso',
      outros: 'Revise seus gastos e identifique onde pode economizar',
    };
    return suggestions[category] || suggestions.outros;
  }

  private createInvestmentSuggestions(opportunity: any): InvestmentSuggestionDto[] {
    const amount = opportunity.potentialSaving;
    return [
      {
        type: 'tesouro_direto',
        title: 'Tesouro Direto',
        description: `Invista R$ ${amount} mensalmente em Tesouro Direto`,
        suggestedAmount: amount,
        expectedReturn: 0.1056,
        riskLevel: 'baixo',
        category: opportunity.category,
      },
      {
        type: 'cdb',
        title: 'CDB',
        description: `Aplique R$ ${amount} em CDB com boa rentabilidade`,
        suggestedAmount: amount,
        expectedReturn: 0.12,
        riskLevel: 'baixo',
        category: opportunity.category,
      },
    ];
  }

  private generateSpendingInsights(variations: any[]): string[] {
    const insights = [];
    for (const variation of variations.slice(0, 3)) {
      if (variation.variation > 20) {
        insights.push(
          `Você gastou ${variation.variation.toFixed(1)}% a mais com ${variation.category} este mês (R$ ${variation.difference.toFixed(2)} a mais)`
        );
      } else if (variation.variation < -20) {
        insights.push(
          `Parabéns! Você economizou ${Math.abs(variation.variation).toFixed(1)}% em ${variation.category} este mês (R$ ${Math.abs(variation.difference).toFixed(2)} a menos)`
        );
      }
    }

    return insights;
  }

  private calculateMonthlyVariation(analysis: any): number {
    const current = analysis.currentMonth.total;
    const previous = analysis.previousMonth.total;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }
}
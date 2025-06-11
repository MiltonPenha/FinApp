// insights.dto.ts
export interface SpendingAnalysisDto {
  currentMonth: {
    total: number;
    byCategory: Record<string, number>;
  };
  previousMonth: {
    total: number;
    byCategory: Record<string, number>;
  };
  variations: CategoryVariationDto[];
  savingOpportunities: SavingOpportunityDto[];
  insights: string[];
  hasHistoricalData: boolean;
  hasCurrentData: boolean;
}

export interface CategoryVariationDto {
  category: string;
  currentAmount: number;
  previousAmount: number;
  variation: number;
  difference: number;
  isInitial?: boolean;
}

export interface SavingOpportunityDto {
  category: string;
  currentSpending: number;
  excessAmount: number;
  potentialSaving: number;
  suggestion: string;
  isInitial?: boolean;
}

export interface InvestmentSuggestionDto {
  type: string;
  title: string;
  description: string;
  suggestedAmount: number;
  expectedReturn: number;
  riskLevel: 'baixo' | 'medio' | 'alto';
  category: string;
}

export interface FinancialProjectionDto {
  investmentType: string;
  monthlyInvestment: number;
  annualRate: number;
  projections: ProjectionPointDto[];
  totalInvested: number;
  finalValue: number;
  totalProfit: number;
}

export interface ProjectionPointDto {
  month: number;
  value: number;
  invested: number;
  profit: number;
}

export interface DashboardInsightsDto {
  totalSpentThisMonth: number;
  totalSpentLastMonth: number;
  monthlyVariation: number;
  topSavingOpportunity: SavingOpportunityDto;
  bestInvestmentSuggestion: InvestmentSuggestionDto;
  projectedGainIn2Years: number;
  insights: string[];
  hasHistoricalData?: boolean;
  hasCurrentData?: boolean;
}
// insights.controller.ts
import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { InsightsService } from './insights.service';

@ApiTags('insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('spending-analysis/:userId')
  @ApiResponse({ status: HttpStatus.OK, description: 'Análise de gastos do usuário' })
  async getSpendingAnalysis(
    @Param('userId') userId: string,
    @Query('currentMonth') currentMonth?: string,
    @Query('previousMonth') previousMonth?: string,
  ) {
    return this.insightsService.analyzeSpendingPatterns(
      userId,
      currentMonth,
      previousMonth,
    );
  }

  @Get('investment-suggestions/:userId')
  @ApiResponse({ status: HttpStatus.OK, description: 'Sugestões de investimento' })
  async getInvestmentSuggestions(@Param('userId') userId: string) {
    return this.insightsService.generateInvestmentSuggestions(userId);
  }

  @Get('financial-projections/:userId')
  @ApiResponse({ status: HttpStatus.OK, description: 'Projeções financeiras' })
  async getFinancialProjections(
    @Param('userId') userId: string,
    @Query('investmentAmount') investmentAmount?: number,
    @Query('investmentType') investmentType?: string,
  ) {
    return this.insightsService.calculateFinancialProjections(
      userId,
      investmentAmount,
      investmentType,
    );
  }

  @Get('dashboard-summary/:userId')
  @ApiResponse({ status: HttpStatus.OK, description: 'Resumo do dashboard do usuário' })
  async getDashboardSummary(@Param('userId') userId: string) {
    return this.insightsService.getDashboardInsights(userId);
  }
}
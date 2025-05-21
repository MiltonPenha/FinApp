import { BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';

import { CreateExpenseDto, createExpenseSchema } from './expenses.schema';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria nova despesa' })
  @ApiBody({
    description: 'Dados da despesa',
    schema: {
      example: {
        value: 150.75,
        category: 'alimentação',
        date: '2023-05-15',
        description: 'Jantar no restaurante',
        userId: 'userId-do-usuario', // Este campo será adicionado automaticamente
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Despesa criada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async create(
    @Body(new ZodValidationPipe(createExpenseSchema)) expense: CreateExpenseDto) {
    // Certifique-se de que o userId está incluído no corpo da requisição
    if (!expense.userId) {
      throw new BadRequestException('O ID do usuário é obrigatório');
    }

    const newExpense = await this.expensesService.create(expense);

    return {
      statusCode: HttpStatus.CREATED,
      data: newExpense,
      message: 'Despesa registrada com sucesso',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lista despesas com paginação' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista paginada de despesas',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('userId') userId: string,
  ) {

    const result = await this.expensesService.findAll(page, limit, userId);
    return {
      statusCode: HttpStatus.OK,
      ...(typeof result === 'object' && result !== null ? result : {}),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edita os dados de uma despesa específica' })
  @ApiParam({ name: 'id', required: true, example: 'uuid-da-despesa' })
  @ApiBody({
    description: 'Novos dados da despesa',
    schema: {
      example: {
        value: 200.00,
        category: 'transporte',
        date: '2023-06-10',
        description: 'Uber para reunião',
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Despesa editada com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Despesa não encontrada' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createExpenseSchema)) dto: CreateExpenseDto,
  ) {
    const updated = await this.expensesService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      data: updated,
      message: 'Despesa editada com sucesso',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma despesa' })
  @ApiParam({ name: 'id', required: true, example: 'uuid-da-despesa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Despesa removida com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Despesa não encontrada' })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    const result = await this.expensesService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      ...result,
    };
  }
}
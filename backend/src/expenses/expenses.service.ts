import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from 'prisma/prisma.service';
import { v4 as uuid } from 'uuid';

import { CreateExpenseDto } from './expenses.schema';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        id: uuid(),
        value: dto.value,
        category: dto.category,
        date: new Date(dto.date),
        description: dto.description,
        userId: dto.userId,
      },
    });

    await this.invalidatePaginationCache();

    return expense;
  }

  async findAll(page = 1, limit = 10, userId: string) {
    const pageSize = limit; // Usar o parâmetro limit em vez de um valor fixo
    const skip = (page - 1) * pageSize;
    const cacheKey = `expenses-page-${page}-limit-${limit}-user-${userId}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where: { userId },
        skip,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count({
        where: { userId }
      }),
    ]);

    const result = {
      data: expenses,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / pageSize),
        pageSize, // Adicionar o tamanho da página nos metadados
      },
    };

    await this.cacheManager.set(cacheKey, result, 60);
    return result;
  }

  private async invalidatePaginationCache() {
    const total = await this.prisma.expense.count();
    const lastPage = Math.ceil(total / 10);

    const keys = Array.from({ length: lastPage }, (_, i) => `expenses-page-${i + 1}`);
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }

  async update(id: string, dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Despesa não encontrada');

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        value: dto.value,
        category: dto.category,
        date: new Date(dto.date),
        description: dto.description,
      },
    });

    await this.invalidatePaginationCache();
    await this.cacheManager.del(`expense:${id}`);

    return updatedExpense;
  }

  async delete(id: string) {
    const existing = await this.prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Despesa não encontrada');

    await this.prisma.expense.delete({ where: { id } });

    await this.invalidatePaginationCache();
    await this.cacheManager.del(`expense:${id}`);
    return { message: 'Despesa removida com sucesso' };
  }

  async getExpensesByCategory(userId: string, category: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        category,
      },
      orderBy: { date: 'desc' },
    });

    return {
      data: expenses,
      count: expenses.length,
    };
  }
}
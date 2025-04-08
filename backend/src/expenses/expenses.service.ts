import { Injectable, Inject } from '@nestjs/common';
import { CreateExpenseDto } from './expenses.schema';
import { v4 as uuid } from 'uuid';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from 'prisma/prisma.service';

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
      },
    });

    await this.invalidatePaginationCache();

    return expense;
  }

  async findAll(page = 1, limit: number) {
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const cacheKey = `expenses-page-${page}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        skip,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count(),
    ]);

    const result = {
      data: expenses,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / pageSize),
      },
    };

    await this.cacheManager.set(cacheKey, result, 60);
    return result;
  }

  async findOne(id: string) {
    return this.prisma.expense.findUnique({ where: { id } });
  }

  async delete(id: string) {
    const deleted = await this.prisma.expense.delete({ where: { id } });

    await this.invalidatePaginationCache();

    return deleted;
  }

  private async invalidatePaginationCache() {
    const total = await this.prisma.expense.count();
    const lastPage = Math.ceil(total / 10);

    const keys = Array.from({ length: lastPage }, (_, i) => `expenses-page-${i + 1}`);
    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }
}
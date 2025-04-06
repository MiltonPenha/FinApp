import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './expenses.schema';
import { v4 as uuid } from 'uuid';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

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

    return expense;
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.expense.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.expense.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}
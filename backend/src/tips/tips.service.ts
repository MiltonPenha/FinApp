import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TipsService {
  constructor(private prisma: PrismaService) {}

  create(data: { content: string }) {
    return this.prisma.tip.create({
      data,
    });
  }

  findAll() {
    return this.prisma.tip.findMany();
  }

  async getRandomTip() {
  const allTips = await this.prisma.tip.findMany({
    select: { id: true },
  });

  if (allTips.length < 2) {
    return this.prisma.tip.findMany();
  }

  const shuffledIds = allTips
    .map(tip => tip.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  return this.prisma.tip.findMany({
    where: {
      id: { in: shuffledIds },
    },
  });
  }
}
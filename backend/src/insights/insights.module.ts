// insights.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';

@Module({
  controllers: [InsightsController],
  providers: [InsightsService, PrismaService],
  exports: [InsightsService],
})
export class InsightsModule {}
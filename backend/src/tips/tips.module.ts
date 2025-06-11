import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';

import { TipsController } from './tips.controller';
import { TipsService } from './tips.service';

@Module({
  imports: [PrismaModule],
  controllers: [TipsController],
  providers: [TipsService],
})
export class TipsModule {}
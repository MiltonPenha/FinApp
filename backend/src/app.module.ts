import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { ExpensesModule } from './expenses/expenses.module';
import { InsightsController } from './insights/insights.controller';
import { InsightsModule } from './insights/insights.module';
import { InsightsService } from './insights/insights.service';
import { NewsController } from './news/news.controller';
import { NewsModule } from './news/news.module';
import { NewsService } from './news/news.service';
import { TipsController } from './tips/tips.controller';
import { TipsModule } from './tips/tips.module';
import { TipsService } from './tips/tips.service';


@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
      isGlobal: true,
    }),
    ExpensesModule,
    NewsModule,
    TipsModule,
    InsightsModule,
  ],
  providers: [NewsService, TipsService, InsightsService],
  controllers: [NewsController, TipsController, InsightsController],
})
export class AppModule { }
import { Module } from '@nestjs/common';
import { ExpensesModule } from './expenses/expenses.module';
import { CacheModule } from '@nestjs/cache-manager';
import { NewsModule } from './news/news.module';
import { NewsService } from './news/news.service';
import { NewsController } from './news/news.controller';
import { TipsController } from './tips/tips.controller';
import { TipsService } from './tips/tips.service';
import { TipsModule } from './tips/tips.module';


@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
      isGlobal: true,
    }),
    ExpensesModule,
    NewsModule,
    TipsModule,
  ],
  providers: [NewsService, TipsService],
  controllers: [NewsController, TipsController],
})
export class AppModule { }
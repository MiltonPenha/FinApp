import { Module } from '@nestjs/common';
import { ExpensesModule } from './expenses/expenses.module';
import { CacheModule } from '@nestjs/cache-manager';
import { NewsModule } from './news/news.module';
import { NewsService } from './news/news.service';
import { NewsController } from './news/news.controller';


@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
      isGlobal: true,
    }),
    ExpensesModule,
    NewsModule,
  ],
  providers: [NewsService],
  controllers: [NewsController],
})
export class AppModule { }
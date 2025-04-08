import { Module } from '@nestjs/common';
import { ExpensesModule } from './expenses/expenses.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60,
      isGlobal: true,
    }),
    ExpensesModule,
  ],
})
export class AppModule {}
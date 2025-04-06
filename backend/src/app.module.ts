import { Module } from '@nestjs/common';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [ExpensesModule],
})
export class AppModule {}
import { z } from 'zod';

const categories = [
  'alimentação',
  'transporte',
  'moradia',
  'saúde',
  'educação',
  'lazer'
] as const;

export const createExpenseSchema = z.object({
  value: z.number()
    .positive('O valor deve ser positivo')
    .max(999999.99, 'Valor máximo é 999999.99')
    .refine(val => {
      const decimalPart = val.toString().split('.')[1];
      return !decimalPart || decimalPart.length <= 2;
    }, 'Máximo de 2 casas decimais'),
    
  category: z.enum(categories, {
    errorMap: () => ({ message: `Categoria inválida. Use: ${categories.join(', ')}` })
  }),
  
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)')
    .refine(date => new Date(date) <= new Date(), 'A data não pode ser futura'),
    
  description: z.string()
    .min(1, 'A descrição não pode estar vazia')
    .max(200, 'A descrição deve ter no máximo 200 caracteres')
});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
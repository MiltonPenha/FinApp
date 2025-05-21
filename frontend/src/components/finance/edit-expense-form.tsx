"use client"

import type React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { getExpenses, updateExpense } from "@/lib/expense-service"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const categories = [
  { value: "alimentação", label: "Alimentação" },
  { value: "transporte", label: "Transporte" },
  { value: "moradia", label: "Moradia" },
  { value: "contas", label: "Contas" },
  { value: "entretenimento", label: "Entretenimento" },
  { value: "saúde", label: "Saúde" },
  { value: "educação", label: "Educação" },
  { value: "compras", label: "Compras" },
  { value: "outros", label: "Outros" },
]

interface EditExpenseFormProps {
  expenseId: string
}

export default function EditExpenseForm({ expenseId }: EditExpenseFormProps) {
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    value: "",
    category: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!isLoaded) {
          return
        }

        if (!userId) {
          setError("Você precisa estar autenticado para editar uma despesa")
          setIsLoading(false)
          return
        }

        console.log("EditExpenseForm: Buscando despesa com userId:", userId)

        // Buscar todas as despesas e encontrar a que tem o ID correspondente
        const response = await getExpenses(1, 1000, userId)
        const expense = response.data.find((exp) => exp.id === expenseId)

        if (!expense) {
          throw new Error("Despesa não encontrada")
        }

        // Preencher o formulário com os dados da despesa
        setFormData({
          value: expense.value.toString(),
          category: expense.category,
          description: expense.description || "",
        })

        // Definir a data
        setDate(expense.date instanceof Date ? expense.date : new Date(expense.date))
      } catch (err) {
        console.error("Erro ao buscar despesa:", err)
        setError("Não foi possível carregar os dados da despesa. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoaded) {
      fetchExpense()
    }
  }, [expenseId, userId, isLoaded])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!isLoaded || !userId) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para atualizar uma despesa",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const value = Number.parseFloat(formData.value)
      if (isNaN(value) || value <= 0) {
        toast({
          title: "Erro",
          description: "Por favor, insira um valor válido",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!formData.category) {
        toast({
          title: "Erro",
          description: "Por favor, selecione uma categoria",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      console.log("EditExpenseForm: Atualizando despesa com userId:", userId)

      const updatedExpense = await updateExpense(expenseId, 
        {
          value: value,
          date: date,
          category: formData.category,
          description: formData.description || "Sem descrição",
        },
        userId,
      )

      if (!updatedExpense) {
        throw new Error("Erro ao atualizar despesa")
      }

      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso!",
      })

      // Redirecionar para a página de transações
      router.push("/transactions")
      router.refresh()
    } catch (error) {
      console.error("Error updating expense:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar despesa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/transactions")}>
          Voltar para transações
        </Button>
      </Alert>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-[#0F0F12] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#1F1F23]">
      <h2 className="flex items-center text-xl font-bold mb-6 text-gray-900 dark:text-white">Editar Despesa</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="value">Valor (R$)</Label>
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.value}
            onChange={handleChange}
            required
            className="bg-gray-50 dark:bg-[#1F1F23]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data da Despesa</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-gray-50 dark:bg-[#1F1F23]",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} autoFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category} onValueChange={handleCategoryChange} required>
            <SelectTrigger className="w-full bg-gray-50 dark:bg-[#1F1F23]">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Descreva sua despesa"
            value={formData.description}
            onChange={handleChange}
            className="bg-gray-50 dark:bg-[#1F1F23]"
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/transactions")}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  )
}

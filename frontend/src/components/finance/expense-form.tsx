"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { addExpense } from "@/lib/expense-service"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "../ui/use-toast"

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

export default function ExpenseForm() {
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  const [date, setDate] = useState<Date>(new Date())
  const [dateError, setDateError] = useState<string | undefined>()
  const [formData, setFormData] = useState({
    value: "",
    category: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const today = new Date()
      today.setHours(23, 59, 59, 999)

      if (date > today) {
        setDateError("Não é possível selecionar uma data futura")
        toast({
          title: "Erro de validação",
          description: "Não é possível cadastrar uma despesa com data futura",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!isLoaded || !userId) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para adicionar uma despesa",
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

      console.log("ExpenseForm: Adicionando despesa com userId:", userId)

      await addExpense(
        {
          value: value,
          date: date,
          category: formData.category,
          description: formData.description || "Sem descrição",
        },
        userId,
      )

      toast({
        title: "Sucesso",
        description: "Despesa adicionada com sucesso!",
      })

      // Reset form
      setFormData({
        value: "",
        category: "",
        description: "",
      })
      setDate(new Date())

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error adding expense:", error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar despesa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-[#0F0F12] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-[#1F1F23]">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Cadastrar Nova Despesa</h2>

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
                  dateError && "border-red-500 focus:border-red-500",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(23, 59, 59, 999)
                  return date > today
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {dateError && <p className="text-sm text-red-500 mt-1">{dateError}</p>}
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

        <Button
          type="submit"
          className="w-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Despesa"}
        </Button>
      </form>
    </div>
  )
}

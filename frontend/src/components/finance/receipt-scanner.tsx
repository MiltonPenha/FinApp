"use client"

import type React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { addExpense } from "@/lib/expense-service"
import { convertToExpense, processReceiptText, type ReceiptData } from "@/lib/receipt-scanner-service"
import { useAuth } from "@clerk/nextjs"
import { AlertTriangle, Check, DollarSign, Eye, EyeOff, File, Info, Loader2, Receipt, RefreshCw, Search, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

import Tesseract from "tesseract.js"

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

export default function ReceiptScanner() {
  const { userId, isLoaded } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upload")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ocrText, setOcrText] = useState<string>("")
  const [receiptData, setReceiptData] = useState<ReceiptData>({})
  const [formData, setFormData] = useState({
    value: "",
    category: "compras",
    description: "",
  })
  const [date, setDate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingLogs, setProcessingLogs] = useState<string[]>([])
  const [highlightedText, setHighlightedText] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)


  const addProcessingLog = (message: string) => {
    setProcessingLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setProcessingLogs([])
      addProcessingLog(`Imagem selecionada: ${file.name} (${Math.round(file.size / 1024)} KB)`)
    }
  }

  const handleProcessImage = async () => {
    if (!image) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem para processar.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setError(null)
    setProcessingProgress(0)
    setProcessingLogs([])
    addProcessingLog("Iniciando processamento da imagem...")
    setHighlightedText(null)

    try {
      addProcessingLog("Iniciando reconhecimento de texto com Tesseract.js...")
      const result = await Tesseract.recognize(
        imagePreview!,
        "por",
        {
          logger: (m) => {
            console.log(m)
            if (m.status === "recognizing text") {
              setProcessingProgress(m.progress * 100)
              if (m.progress > 0.2 && m.progress < 0.9 && Math.floor(m.progress * 10) % 2 === 0) {
                addProcessingLog(`Reconhecimento de texto: ${Math.round(m.progress * 100)}% concluído`)
              }
            }
          },
        },
      )

      const text = result.data.text
      setOcrText(text)
      addProcessingLog("Texto extraído com sucesso")
      addProcessingLog(`Texto contém ${text.length} caracteres e ${text.split("\n").length} linhas`)

      const valorTotalMatch = text.match(/VALOR\s*TOTAL\s*R\$\s*(\d+[,.]\d{2})/i)
      if (valorTotalMatch) {
        const matchedText = valorTotalMatch[0]
        setHighlightedText(matchedText)
        addProcessingLog(`Padrão "VALOR TOTAL R$" encontrado: ${matchedText}`)
      } else {
        addProcessingLog('Padrão "VALOR TOTAL R$" não encontrado no texto')
      }

      addProcessingLog("Processando texto para extrair informações...")
      const extractedData = processReceiptText(text)
      setReceiptData(extractedData)

      if (extractedData.establishment) {
        addProcessingLog(`Estabelecimento encontrado: ${extractedData.establishment}`)
      } else {
        addProcessingLog("Não foi possível identificar o estabelecimento")
      }

      if (extractedData.date) {
        addProcessingLog(`Data encontrada: ${extractedData.date}`)
      } else {
        addProcessingLog("Não foi possível identificar a data")
      }

      if (extractedData.total) {
        addProcessingLog(`Valor total encontrado: R$ ${extractedData.total}`)
      } else {
        addProcessingLog("Não foi possível identificar o valor total")
      }

      const expense = convertToExpense(extractedData)
      setFormData({
        value: expense.value.toString(),
        category: expense.category,
        description: expense.description,
      })
      setDate(expense.date)

      toast({
        title: "Processamento concluído",
        description: "A nota fiscal foi processada com sucesso. Verifique os dados extraídos.",
      })
    } catch (err) {
      console.error("Erro ao processar imagem:", err)
      setError("Ocorreu um erro ao processar a imagem. Tente novamente ou insira os dados manualmente.")
    } finally {
      setIsProcessing(false)
      setProcessingProgress(100)
    }
  }

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

      await addExpense(
        {
          value: value,
          date: date,
          category: formData.category,
          description: formData.description || "Despesa de nota fiscal",
        },
        userId,
      )

      toast({
        title: "Sucesso",
        description: "Despesa adicionada com sucesso!",
      })

      setFormData({
        value: "",
        category: "compras",
        description: "",
      })
      setDate(new Date())
      setImage(null)
      setImagePreview(null)
      setOcrText("")
      setReceiptData({})
      setHighlightedText(null)

      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar despesa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const highlightValuePattern = (text: string) => {
    if (!text) return text
    if (!highlightedText) return text

    return text
      .split(highlightedText)
      .join(`<span class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${highlightedText}</span>`)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            Upload de Imagem
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
            <h2 className="text-lg font-medium mb-4">Upload da Nota Fiscal</h2>

            <div className="space-y-4">
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                {imagePreview ? (
                  <div className="space-y-4 w-full">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview da nota fiscal"
                      className="max-h-64 mx-auto object-contain rounded-lg"
                    />
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Clique para selecionar outra imagem
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <File className="h-10 w-10 text-gray-400" />
                    <p className="text-sm font-medium">Clique para selecionar uma imagem</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Suporta JPG, PNG, etc.</p>
                  </div>
                )}
              </div>

              {imagePreview && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
              )}

              <Button onClick={handleProcessImage} disabled={!image || isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando... {Math.round(processingProgress)}%
                  </>
                ) : (
                  <>
                    <Receipt className="mr-2 h-4 w-4" />
                    Processar Nota Fiscal
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {ocrText && (
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Dados Extraídos</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(!showDebug)}>
              {showDebug ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showDebug ? "Ocultar Detalhes" : "Mostrar Detalhes"}
            </Button>
          </div>

          <div className="space-y-4">
            {receiptData.establishment && (
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">Estabelecimento</Label>
                <p className="font-medium">{receiptData.establishment}</p>
              </div>
            )}

            {receiptData.date && (
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                  Valor Total
                </Label>
                <p className="font-medium text-green-600">R$ {receiptData.total}</p>
              </div>
            )}

            {receiptData.total && (
              <div>
                <Label className="text-sm text-gray-500 dark:text-gray-400">Valor Total</Label>
                <p className="font-medium">R$ {receiptData.total}</p>
              </div>
            )}

            {showDebug && (
                <>
              <div>
                <Label htmlFor="ocrText" className="text-sm text-gray-500 dark:text-gray-400">
                  Texto Extraído
                </Label>
                {highlightedText ? (
                    <div
                      className="mt-1 p-3 bg-gray-50 dark:bg-[#1F1F23] rounded-md h-32 overflow-y-auto text-xs whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: highlightValuePattern(ocrText) }}
                    />
                  ) : (
                    <Textarea
                      id="ocrText"
                      value={ocrText}
                      readOnly
                      className="h-32 mt-1 bg-gray-50 dark:bg-[#1F1F23]"
                    />
                  )}
              </div>

              <div>
                  <Label className="text-sm text-gray-500 dark:text-gray-400">Logs de Processamento</Label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-[#1F1F23] rounded-md h-32 overflow-y-auto text-xs">
                    {processingLogs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <Search className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800 dark:text-yellow-200">Dica de Processamento</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    O sistema busca especificamente pelo padrão "VALOR TOTAL R$ XX,XX" na nota fiscal. Certifique-se de
                    que a imagem captura claramente essa informação.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {(!receiptData.establishment || !receiptData.date || !receiptData.total) && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Dica</AlertTitle>
                <AlertDescription>
                  Alguns dados não puderam ser extraídos automaticamente. Por favor, verifique e preencha manualmente os
                  campos abaixo.
                </AlertDescription>
              </Alert>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleProcessImage}
              disabled={!image || isProcessing}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 border border-gray-200 dark:border-[#1F1F23]">
        <h2 className="text-lg font-medium mb-4">Adicionar como Despesa</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="value">Valor (R$) *</Label>
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
            <Label htmlFor="category">Categoria *</Label>
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
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descrição da despesa"
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
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Salvar Despesa
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export interface ReceiptData {
  establishment?: string
  date?: string
  total?: string
  items?: Array<{
    description?: string
    quantity?: number
    unitPrice?: number
    totalPrice?: number
  }>
}

export function processReceiptText(text: string): ReceiptData {
  const receiptData: ReceiptData = {}

  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim()

  console.log("Texto normalizado para processamento:", normalizedText)

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  console.log("Linhas extraídas:", lines)

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    if (lines[i].length > 3 && !lines[i].match(/^(cnpj|cpf|nota fiscal|cupom|data|hora)/i)) {
      receiptData.establishment = lines[i]
      console.log("Estabelecimento encontrado:", lines[i])
      break
    }
  }

  let totalFound = false

  const valorTotalPattern = /VALOR\s*TOTAL\s*R\$\s*(\d+[,.]\d{2})/i

  // Procurar o padrão em cada linha
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    console.log(`Verificando linha ${i} para VALOR TOTAL: "${line}"`)

    const match = line.match(valorTotalPattern)
    if (match?.[1]) {
      receiptData.total = match[1].replace(",", ".")
      console.log(`VALOR TOTAL R$ encontrado: ${match[1]} na linha: "${line}"`)
      totalFound = true
      break
    }
  }

  if (!totalFound) {
    console.log("Padrão VALOR TOTAL R$ não encontrado. Tentando variações...")

    // Variações do padrão
    const variations = [
      /VALOR\s*TOTAL\s*:\s*R\$\s*(\d+[,.]\d{2})/i,
      /VALOR\s*TOTAL\s*:\s*(\d+[,.]\d{2})/i,
      /TOTAL\s*R\$\s*(\d+[,.]\d{2})/i,
      /TOTAL\s*:\s*R\$\s*(\d+[,.]\d{2})/i,
      /TOTAL\s*:\s*(\d+[,.]\d{2})/i,
    ]

    for (const pattern of variations) {
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const match = line.match(pattern)
        if (match?.[1]) {
          receiptData.total = match[1].replace(",", ".")
          console.log(`Variação de VALOR TOTAL encontrada: ${match[1]} na linha: "${line}"`)
          totalFound = true
          break
        }
      }
      if (totalFound) break
    }
  }

  if (!totalFound) {
    console.log("Variações de VALOR TOTAL não encontradas. Procurando por qualquer valor após TOTAL...")

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toUpperCase()
      if (line.includes("TOTAL")) {
        console.log(`Linha com TOTAL encontrada: "${lines[i]}"`)

        const valueMatches = /(\d+[,.]\d{2})/.exec(line)
        if (valueMatches?.[1]) {
          receiptData.total = valueMatches[1].replace(",", ".")
          console.log(`Valor após TOTAL encontrado: ${valueMatches[1]}`)
          totalFound = true
          break
        }
      }
    }
  }

  if (!totalFound) {
    console.log("Nenhum valor total encontrado com os métodos anteriores. Buscando o maior valor...")

    let highestValue = 0
    let highestValueString = ""

    const moneyPattern = /R?\$?\s*(\d+[,.]\d{2})/g
    let match

    const normalizedTextForValues = normalizedText.replace(/\s+/g, " ")
    while ((match = moneyPattern.exec(normalizedTextForValues)) !== null) {
      const valueStr = match[1].replace(",", ".")
      const value = Number.parseFloat(valueStr)

      console.log("Valor monetário encontrado:", valueStr, "convertido para:", value)

      if (value > highestValue) {
        highestValue = value
        highestValueString = valueStr
      }
    }

    if (highestValue > 0) {
      receiptData.total = highestValueString
      console.log("Valor total encontrado (maior valor):", highestValueString)
    }
  }

  return receiptData
}

export function convertToExpense(receiptData: ReceiptData): {
  value: number
  date: Date
  category: string
  description: string
} {
  let value = 0
  if (receiptData.total) {
    const normalizedValue = receiptData.total.replace(",", ".")
    value = Number.parseFloat(normalizedValue)
    console.log("Valor convertido para número:", value)
  }

  const date = new Date()

  let category = "compras" // categoria padrão

  if (receiptData.establishment) {
    const establishment = receiptData.establishment.toLowerCase()

    // categorias baseadas em palavras-chave no nome do estabelecimento
    if (/restaurante|lanchonete|pizzaria|cafe|padaria|food|burger|rest\.|bar/i.test(establishment)) {
      category = "alimentação"
    } else if (/farmacia|drogaria|hospital|clinica|medic/i.test(establishment)) {
      category = "saúde"
    } else if (/posto|combustivel|gas/i.test(establishment)) {
      category = "transporte"
    } else if (/mercado|supermercado|atacad|varejo|market/i.test(establishment)) {
      category = "alimentação"
    } else if (/cinema|teatro|show|ingresso|ticket/i.test(establishment)) {
      category = "entretenimento"
    } else if (/escola|curso|faculdade|livraria|livro/i.test(establishment)) {
      category = "educação"
    } else if (/agua|luz|energia|telefone|internet|gas/i.test(establishment)) {
      category = "contas"
    } else if (/aluguel|condominio|imobiliaria/i.test(establishment)) {
      category = "moradia"
    }
  }

  return {
    value: isNaN(value) ? 0 : value,
    date,
    category,
    description: receiptData.establishment || "Compra com nota fiscal",
  }
}

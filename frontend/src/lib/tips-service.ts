// Interface para os itens de dicas
export interface Tip {
  id: string
  content: string
}

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Função para buscar dicas aleatórias
export async function fetchRandomTips(): Promise<Tip[]> {
  try {
    console.log("Buscando dicas aleatórias da API")

    const response = await fetch(`${API_URL}/tips/random`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Adicionar um parâmetro de timestamp para evitar cache
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar dicas: ${response.status}`)
    }

    // Primeiro obtemos o texto da resposta para debug
    const responseText = await response.text()
    console.log("Resposta da API (texto):", responseText)

    // Convertemos o texto para JSON
    const data = responseText ? JSON.parse(responseText) : []
    console.log("Resposta da API (JSON):", data)

    // Verificar se a resposta é um array
    if (Array.isArray(data)) {
      return data
    }

    // Se não for um array, verificar se é um objeto com uma propriedade que contém um array
    if (data && typeof data === "object") {
      // Verificar propriedades comuns que podem conter arrays
      if (Array.isArray(data.data)) return data.data
      if (Array.isArray(data.items)) return data.items
      if (Array.isArray(data.tips)) return data.tips
      if (Array.isArray(data.results)) return data.results
    }

    // Se não conseguirmos encontrar um array, retornamos um array vazio
    console.error("Resposta da API não contém um array de dicas:", data)
    return []
  } catch (error) {
    console.error("Erro ao buscar dicas:", error)
    return []
  }
}

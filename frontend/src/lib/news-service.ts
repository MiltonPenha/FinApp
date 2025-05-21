// Interface para os itens de notícias
export interface NewsItem {
  title: string
  link: string
}

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Função para buscar notícias
export async function fetchNews(): Promise<NewsItem[]> {
  try {
    console.log("Buscando notícias da API:", `${API_URL}/news`)

    const response = await fetch(`${API_URL}/news`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar notícias: ${response.status}`)
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
      if (Array.isArray(data.news)) return data.news
      if (Array.isArray(data.results)) return data.results
    }

    // Se não conseguirmos encontrar um array, retornamos um array vazio
    console.error("Resposta da API não contém um array de notícias:", data)
    return []
  } catch (error) {
    console.error("Erro ao buscar notícias:", error)
    return []
  }
}

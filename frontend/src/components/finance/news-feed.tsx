"use client"

import { Button } from "@/components/ui/button"
import { fetchNews, type NewsItem } from "@/lib/news-service"
import { cn } from "@/lib/utils"
import { ExternalLink, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface NewsFeedProps {
  className?: string
}

export function NewsFeed({ className }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const newsData = await fetchNews()

        // Verificar se newsData é um array
        if (Array.isArray(newsData)) {
          setNews(newsData)
        } else {
          console.error("Dados de notícias não são um array:", newsData)
          setError("Formato de dados inválido. Verifique o console para mais detalhes.")
          // Definir news como um array vazio para evitar erros
          setNews([])
        }
      } catch (err) {
        console.error("Erro ao carregar notícias:", err)
        setError("Não foi possível carregar as notícias. Tente novamente mais tarde.")
        // Garantir que news seja um array vazio em caso de erro
        setNews([])
      } finally {
        setIsLoading(false)
      }
    }

    loadNews()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 mb-2 text-sm">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsLoading(true)
            fetchNews()
              .then((newsData) => {
                if (Array.isArray(newsData)) {
                  setNews(newsData)
                  setError(null)
                } else {
                  console.error("Dados de notícias não são um array:", newsData)
                  setError("Formato de dados inválido. Verifique o console para mais detalhes.")
                  setNews([])
                }
              })
              .catch((err) => {
                console.error("Erro ao recarregar notícias:", err)
                setError("Não foi possível carregar as notícias. Tente novamente mais tarde.")
                setNews([])
              })
              .finally(() => setIsLoading(false))
          }}
        >
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!news || news.length === 0) {
    return (
      <div className="text-center py-4 text-zinc-500 dark:text-zinc-400 text-sm">Nenhuma notícia disponível no momento.</div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {news.map((item, index) => (
        <div key={index} className="border-b border-gray-200 dark:border-gray-800 pb-3 last:border-0">
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="group">
            <h3 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm">
              {item.title}
            </h3>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
              <span className="flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" />
                Ler mais
              </span>
            </div>
          </a>
        </div>
      ))}
    </div>
  )
}

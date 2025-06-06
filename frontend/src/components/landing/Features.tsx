import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Lightbulb, PieChart, Receipt } from "lucide-react"

const features = [
    {
        icon: PieChart,
        title: "Análise de Gastos",
        description: "Visualize seus gastos por categoria e identifique onde seu dinheiro está indo.",
        items: ["Gráficos intuitivos", "Filtros personalizáveis", "Relatórios detalhados"]
    },
    {
        icon: Receipt,
        title: "Escaneamento de Boletos",
        description: "Escaneie códigos de barras com facilidade e registre seus boletos automaticamente.",
        items: ["Reconhecimento automático", "Upload de imagens e PDFs", "Alertas de vencimento"]
    },
    {
        icon: Lightbulb,
        title: "Conteúdo Financeiro Inteligente",
        description: "Receba dicas financeiras, sugestões de investimento e notícias atualizadas para tomar melhores decisões.",
        items: ["Dicas de economia e organização", "Notícias do mercado financeiro", "Sugestões de investimentos"]
    }
]

export default function Features() {
    return (
        <section id="recursos" className="py-20 bg-gray-100">
            <div className="container mx-auto">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Recursos Poderosos</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Tudo o que você precisa para gerenciar suas finanças em um só lugar.
                    </p>
                </div>
                <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <Card key={i} className="hover:scale-103">
                            <CardHeader>
                                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <feature.icon className="h-6 w-6 text-[#8c53d1]" />
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                                <CardDescription>{feature.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {feature.items.map((item, j) => (
                                        <li key={j} className="flex items-center">
                                            <Check className="mr-2 h-4 w-4 text-[#8c53d1]" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

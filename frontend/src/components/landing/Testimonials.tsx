import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"

const testimonials = [
    {
        name: "Ana Silva",
        type: "Usuária",
        text: "O FinApp mudou completamente minha relação com o dinheiro. Agora consigo visualizar exatamente onde estou gastando e economizei mais de R$ 500 por mês!",
        stars: 5,
    },
    {
        name: "Carlos Oliveira",
        type: "Usuário",
        text: "Como dono de uma pequena empresa, o FinApp me ajudou a organizar as finanças do negócio de forma simples e eficiente.",
        stars: 5,
    },
    {
        name: "Mariana Costa",
        type: "Usuária",
        text: "Consegui organizar minhas finanças. A interface é intuitiva e fácil de usar.",
        stars: 5,
    },
]

export default function Testimonials() {
    return (
        <section id="depoimentos" className="py-20 bg-muted bg-gray-100">
            <div className="container text-center mx-auto">
                <h2 className="text-3xl font-bold">O Que Nossos Usuários Dizem</h2>
                <p className="mt-4 text-muted-foreground">
                    Milhares de pessoas já transformaram suas finanças com o FinApp.
                </p>
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {testimonials.map((item, i) => (
                        <Card key={i}>
                            <CardContent className="p-6 text-left">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                                        <Image
                                            src="/avatar.jpg"
                                            width={48}
                                            height={48}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.type}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex">
                                    {[...Array(5)].map((_, j) => (
                                        <Star
                                            key={j}
                                            className={`h-4 w-4 ${j < item.stars ? "fill-[#8c53d1] text-[#8c53d1]" : "text-muted-foreground"}`}
                                        />
                                    ))}
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground">"{item.text}"</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
    {
        title: "Crie sua conta",
        description: "Configure seu perfil em menos de 2 minutos.",
        image: "/placeholder.svg?height=200&width=300"
    },
    {
        title: "Registre suas transações",
        description: "Adicione despesas e categorias manualmente.",
        image: "/placeholder.svg?height=200&width=300"
    },
    {
        title: "Gerencie suas finanças",
        description: "Veja tudo em um só lugar: gastos, dicas e notícias financeiras.",
        image: "/placeholder.svg?height=200&width=300"
    }
]

export default function HowItWorks() {
    return (
        <section id="como-funciona" className="py-20 bg-muted">
            <div className="container text-center mx-auto">
                <h2 className="text-3xl font-bold">Como Funciona</h2>
                <p className="mt-4 text-muted-foreground">Três passos simples para transformar sua vida financeira.</p>
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#8c53d1] text-white text-xl font-bold">
                                {i + 1}
                            </div>
                            <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                            <p className="mt-2 text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-12">
                    <Button
                        size="lg"
                        asChild>
                        <Link
                            href="/login"
                            className="text-white bg-[#8c53d1] hover:bg-[#8c53d1]/90 hover:scale-105 transition-all">
                            Começar Agora
                        </Link>
                    </Button>
                </div>
            </div>
        </section >
    )
}

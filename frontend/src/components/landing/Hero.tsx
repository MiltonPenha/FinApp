import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function Hero() {
    return (
        <section id="hero" className="py-24 text-center bg-gradient-to-b from-muted/50 to-background">
            <div className="container flex flex-col items-center mx-auto">
                <h1 className="max-w-3xl text-5xl font-bold">
                    Controle suas finanças com <span className="text-[#8c53d1]">simplicidade</span> e <span className="text-[#8c53d1]">eficiência</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                    Gerencie suas despesas e alcance seus objetivos financeiros com o FinAPP.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <Button
                        size="lg"
                        className="text-white bg-[#8c53d1] hover:bg-[#8c53d1]/90 hover:scale-105 transition-all"
                        asChild>
                        <Link href="/login">
                            Começar Agora
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className=" hover:bg-gray-900 hover:text-white hover:scale-105" asChild>
                        <Link href="#como-funciona">Saiba Mais</Link>
                    </Button>
                </div>
                {/*<Image 
                    src="/placeholder.svg?height=600&width=1200"
                    width={1200}
                    height={600}
                    alt="Dashboard"
                    className="mt-16 rounded-xl border shadow-xl"
                />*/}
            </div>
        </section>
    )
}

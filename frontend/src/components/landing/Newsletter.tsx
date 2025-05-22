import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Newsletter() {
    return (
        <section className="py-20">
            <div className="container text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold">Fique por dentro</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Assine nossa newsletter para receber dicas e novidades do FinAPP.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <Input type="email" placeholder="Seu melhor e-mail" className="sm:flex-1" />
                    <Button>Assinar Newsletter</Button>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                    Ao assinar, você concorda com nossa Política de Privacidade. Você pode cancelar a qualquer momento.
                </p>
            </div>
        </section>
    )
}

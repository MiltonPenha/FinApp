import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faqs = [
    {
        question: "O FinAPP é seguro?",
        answer:
            "Sim, utilizamos criptografia de ponta a ponta e seguimos os mais altos padrões de segurança. Nenhuma senha bancária é armazenada.",
    },
    {
        question: "Posso cancelar minha assinatura a qualquer momento?",
        answer:
            "Sim. Após o cancelamento, o plano continua ativo até o fim do período pago, sem cobranças adicionais.",
    },
    {
        question: "Como funciona a sincronização com bancos?",
        answer:
            "Conectamos com segurança às APIs dos principais bancos brasileiros para importar suas transações automaticamente.",
    },
    {
        question: "Posso usar o FinAPP no celular?",
        answer:
            "Sim! Está disponível para iOS, Android e navegadores, com sincronização em tempo real entre dispositivos.",
    },
    {
        question: "O plano gratuito tem limitações?",
        answer:
            "Sim, o plano gratuito permite até 50 transações por mês e acesso a funcionalidades básicas. Para mais recursos, use o Premium.",
    },
    {
        question: "Como funciona o suporte ao cliente?",
        answer:
            "Todos têm acesso via e-mail e chat. Clientes Premium e Empresarial recebem suporte prioritário.",
    },
]

export default function Faq() {
    return (
        <section className="py-20">
            <div className="container text-center mx-auto">
                <h2 className="text-3xl font-bold">Perguntas Frequentes</h2>
                <p className="mt-4 text-muted-foreground">Tire suas dúvidas sobre o FinAPP.</p>
                <div className="mt-16 grid gap-8 md:grid-cols-2 text-left">
                    {faqs.map((faq, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="text-lg">{faq.question}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
    {
        question: "O que é o FinApp?",
        answer:
            "O FinApp é um aplicativo web para gerenciamento de finanças pessoais. Com ele, você pode registrar despesas e ter um controle mais eficiente do seu dinheiro.",
    },
    {
        question: "O FinApp é gratuito?",
        answer:
            "Sim. O FinApp é totalmente gratuito e sempre será. Todas as funcionalidades estão disponíveis sem custo.",
    },
    {
        question: "Preciso criar uma conta para usar?",
        answer:
            "Sim. É necessário criar uma conta para que seus dados fiquem salvos com segurança na nuvem.",
    },
    {
        question: "Meus dados ficam salvos na nuvem?",
        answer:
            "Sim. Todos os seus dados são armazenados com segurança na nuvem, permitindo que você os acesse quando e onde quiser.",
    },
];

export default function Faq() {
    return (
        <section className="py-20">
            <div className="container text-center mx-auto">
                <h2 className="text-3xl font-bold">Perguntas Frequentes</h2>
                <p className="mt-4 text-muted-foreground">Tire suas dúvidas sobre o FinApp.</p>
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

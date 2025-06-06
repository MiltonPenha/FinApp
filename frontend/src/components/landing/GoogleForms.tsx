
export default function GoogleForm() {
    return (
        <section className="py-20 px-4 bg-muted/50 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center space-y-4 ">
            <h2 className="text-3xl font-bold">Queremos saber um pouco mais:</h2>
            <p className="text-muted-foreground">
            Preencha o formulário abaixo. Sua resposta é muito importante!
            </p>
            <div className="w-full aspect-[4/5]">
            <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSf72E-Up0GrEX_ZDjXQdA7139hdXl50DMQKE54DdXRdteV1mg/viewform?embedded=true" 
                width="100%"
                height="800"
                frameBorder="0"
                title="Formulário FinApp"
                className="w-full h-full rounded-xl shadow-lg border-1 bg-white"
            >
                Carregando…
            </iframe>
            </div>
        </div>
        </section>
    );
}

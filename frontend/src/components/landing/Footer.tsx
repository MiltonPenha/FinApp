import Link from "next/link"

export default function Footer() {
    return (
        <footer className="border-t bg-muted bg-gray-900 text-white">
            <div className="container py-12 grid gap-8 md:grid-cols-4 text-sm mx-auto">
                <div>
                    <Link href="#hero" className="flex items-center gap-2 font-semibold">
                        <img src="/logo-finapp.png" alt="LogoFinApp" className="h-9 mb-1" />
                    </Link>
                    <p className="mt-4 text-muted-foreground">
                        Controle suas finanças com simplicidade e eficiência.
                    </p>
                </div>
                <div>
                    <h3 className="mb-4 font-semibold">Produto</h3>
                    <ul className="space-y-2">
                        <li><Link href="#recursos" className="hover:text-[#8c53d1]">Recursos</Link></li>
                        <li><Link href="#como-funciona" className="hover:text-[#8c53d1]">Como Funciona</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="mb-4 font-semibold">Empresa</h3>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-[#8c53d1]">Sobre Nós</Link></li>
                        <li><Link href="#" className="hover:text-[#8c53d1]">Contato</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="mb-4 font-semibold">Legal</h3>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-[#8c53d1]">Termos</Link></li>
                        <li><Link href="#" className="hover:text-[#8c53d1]">Cookies</Link></li>
                        <li><Link href="#" className="hover:text-[#8c53d1]">Segurança</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t text-center text-muted-foreground py-6 text-sm">
                © {new Date().getFullYear()} FinApp. Todos os direitos reservados.
            </div>
        </footer>
    )
}

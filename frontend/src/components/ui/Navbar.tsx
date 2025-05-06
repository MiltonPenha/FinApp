import Link from "next/link";
import { Button } from "./button";

export default function Navbar() {

    return (
        <header>
            <nav className="fixed top-0 w-full bg-white/95  z-50 border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo-finapp-black.png" alt="FinApp" className="h-10 drop-shadow-2x1" />
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#recursos" className="text-gray-600 hover:text-[#8c53d1] hover:scale-105">Recursos</a>
                        <a href="#como-funciona" className="text-gray-600 hover:text-[#8c53d1] hover:scale-105">Como Funciona</a>
                        <Button variant="default" className="text-white bg-[#8c53d1] hover:bg-[#8c53d1]/90 hover:scale-105">
                            <Link href="/login">
                                Cadastrar-se
                            </Link>
                        </Button>

                    </div>
                </div>
            </nav>
        </header>
    )
}
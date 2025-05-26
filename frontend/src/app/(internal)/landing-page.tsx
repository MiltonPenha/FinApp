import Faq from "@/components/landing/Faq"
import Features from "@/components/landing/Features"
import Footer from "@/components/landing/Footer"
import Hero from "@/components/landing/Hero"
import HowItWorks from "@/components/landing/HowItWorks"
import Testimonials from "@/components/landing/Testimonials"
import Navbar from "@/components/ui/Navbar"

export default function LandingPage() {
    return (
        <>
            <main>
                <Navbar />
                <Hero />
                <Features />
                <HowItWorks />
                <Testimonials />
                <Faq />
            </main>
            <Footer />
        </>
    )
}

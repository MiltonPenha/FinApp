import { ptBR } from '@clerk/localizations'
import {
  ClerkProvider
} from '@clerk/nextjs'
import { type Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import "./global.css"


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FinApp',
  description: 'Gerencie suas finanças de forma simples, rápida e inteligente com o FinApp',
  icons: {
    icon: '/icon-finapp.png'
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
import ReceiptScanner from "@/components/finance/receipt-scanner"
import Layout from "@/components/kokonutui/layout"

export default function ReceiptScannerPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Leitura de Nota Fiscal</h1>
        <ReceiptScanner />
      </div>
    </Layout>
  )
}

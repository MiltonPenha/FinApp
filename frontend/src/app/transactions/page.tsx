import TransactionsList from "@/components/finance/transactions-list"
import Layout from "@/components/kokonutui/layout"

export default function TransactionsPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Transações</h1>
        <TransactionsList />
      </div>
    </Layout>
  )
}

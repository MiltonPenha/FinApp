import EditExpenseForm from "@/components/finance/edit-expense-form"
import Layout from "@/components/kokonutui/layout"

export default function EditExpensePage({ params }: { params: { id: string } }) {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <EditExpenseForm expenseId={params.id} />
      </div>
    </Layout>
  )
}

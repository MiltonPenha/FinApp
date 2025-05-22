import ExpenseForm from "@/components/finance/expense-form";
import Layout from "@/components/kokonutui/layout";


export default function NewExpensePage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <ExpenseForm />
      </div>
    </Layout>
  )
}

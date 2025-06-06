import EditExpenseForm from "@/components/finance/edit-expense-form";
import Layout from "@/components/kokonutui/layout";
import { use } from "react";

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (

    <Layout>
      <div className="max-w-4xl mx-auto">
        <EditExpenseForm expenseId={id} />
      </div>
    </Layout>
  )
}

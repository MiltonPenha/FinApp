import { currentUser } from "@clerk/nextjs/server";
import Dashboard from "../../components/kokonutui/dashboard";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        return;
    }

    return <Dashboard />
}

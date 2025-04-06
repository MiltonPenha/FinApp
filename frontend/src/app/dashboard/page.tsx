import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        return;
    }

    return (
        <div className='h-screen flex items-center justify-center flex-col gap-4'>
            <h1 className='text-2xl'>Dashboard</h1>
            <h2>Bem vindo {user.firstName}</h2>
            <Link href={"/"}>Home</Link>
        </div>
    )
}

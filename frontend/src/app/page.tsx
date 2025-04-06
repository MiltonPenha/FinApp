import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex justify-center items-center flex-col gap-4">
      <h1 className="text-2xl">Home</h1>
      <Link href={"/dashboard"}>Dashboard</Link>
      <br />
      <Link href={"/login"}>Entrar</Link>
    </div>
  );
}

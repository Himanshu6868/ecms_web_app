import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Ticket Management System</h1>
      <p className="text-slate-300">Navigate to dashboard and ticket pages.</p>
      <div className="flex gap-3">
        <Link href="/dashboard" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500">
          Dashboard
        </Link>
        <Link href="/tickets" className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:border-slate-500">
          Tickets
        </Link>
        <Link href="/tickets/new" className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:border-slate-500">
          Create Ticket
        </Link>
      </div>
    </div>
  );
}

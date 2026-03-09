import Link from "next/link";
import TicketForm from "@/components/TicketForm";

export default function NewTicketPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create New Ticket</h1>
        <Link href="/tickets" className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:border-slate-500">
          Back to Tickets
        </Link>
      </div>
      <TicketForm />
    </section>
  );
}

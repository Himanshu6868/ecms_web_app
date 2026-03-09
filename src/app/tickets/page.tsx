"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TicketTable from "@/components/TicketTable";
import AuthGuard from "@/components/AuthGuard";
import { subscribeTickets } from "@/lib/firebase";
import type { Ticket } from "@/types/ticket";
import { useToast } from "@/components/ui/Toast";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeTickets(
      (nextTickets) => {
        setTickets(nextTickets);
        setLoading(false);
      },
      () => {
        notify("Failed to load tickets.", "error");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [notify]);

  return (
    <AuthGuard>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tickets</h1>
          <Link href="/tickets/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500">
            Create Ticket
          </Link>
        </div>
        {loading ? <p className="text-slate-300">Loading tickets...</p> : <TicketTable tickets={tickets} showDescription />}
      </section>
    </AuthGuard>
  );
}

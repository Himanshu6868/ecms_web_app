"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardCards from "@/components/DashboardCards";
import TicketTable from "@/components/TicketTable";
import AuthGuard from "@/components/AuthGuard";
import { subscribeTickets, auth } from "@/lib/firebase";
import type { Ticket } from "@/types/ticket";
import { useToast } from "@/components/ui/Toast";
import { signOut } from "firebase/auth";

type FilterTab = "ALL" | "OPEN" | "HIGH";

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { notify } = useToast();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = subscribeTickets(
      (nextTickets) => {
        setTickets(nextTickets);
        setLoading(false);
      },
      () => {
        notify("Failed to load dashboard tickets.", "error");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [notify]);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await signOut(auth);
      notify("Logged out successfully.", "success");
      router.push("/login");
    } catch {
      notify("Unable to log out. Please try again.", "error");
    } finally {
      setSigningOut(false);
    }
  };

  const summary = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === "OPEN").length,
      highPriority: tickets.filter((ticket) => ["HIGH", "CRITICAL"].includes(ticket.priority)).length
    }),
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.status.toLowerCase().includes(normalizedSearch) ||
        ticket.priority.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "ALL" ||
        (filter === "OPEN" && ticket.status === "OPEN") ||
        (filter === "HIGH" && ["HIGH", "CRITICAL"].includes(ticket.priority));

      return matchesSearch && matchesFilter;
    });
  }, [tickets, search, filter]);

  return (
    <AuthGuard>
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link href="/tickets/new" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500">
              New Ticket
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={signingOut}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {signingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>

        <DashboardCards total={summary.total} open={summary.open} highPriority={summary.highPriority} />

        <div className="rounded-xl border border-slate-800 bg-panel p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              aria-label="Search tickets"
              placeholder="Search title / status / priority"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full md:max-w-sm"
            />
            <div className="flex gap-2">
              {[
                { label: "All", value: "ALL" },
                { label: "Open", value: "OPEN" },
                { label: "High Priority", value: "HIGH" }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as FilterTab)}
                  className={`rounded-md px-3 py-2 text-sm ${
                    filter === tab.value ? "bg-blue-600 text-white" : "border border-slate-700 text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? <p className="text-slate-300">Loading tickets...</p> : <TicketTable tickets={filteredTickets} showDescription />}
        </div>
      </section>
    </AuthGuard>
  );
}

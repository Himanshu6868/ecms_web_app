"use client";

import { useMemo, useState } from "react";
import { changeTicketStatus } from "@/lib/firebase";
import { STATUSES, type Ticket, type TicketStatus } from "@/types/ticket";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/ui/Toast";

interface TicketTableProps {
  tickets: Ticket[];
  showDescription?: boolean;
}

export default function TicketTable({ tickets, showDescription = false }: TicketTableProps) {
  const [pendingStatus, setPendingStatus] = useState<Record<string, TicketStatus>>({});
  const { notify } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const formatted = useMemo(
    () =>
      tickets.map((ticket) => ({
        ...ticket,
        createdAtLabel: ticket.createdAt ? ticket.createdAt.toDate().toLocaleString() : "Pending"
      })),
    [tickets]
  );

  const handleUpdate = async (ticketId: string, currentStatus: TicketStatus) => {
    const nextStatus = pendingStatus[ticketId] ?? currentStatus;
    if (nextStatus === currentStatus) {
      notify("Please select a different status before updating.", "error");
      return;
    }

    setUpdatingId(ticketId);
    try {
      await changeTicketStatus(ticketId, nextStatus);
      notify("Ticket status updated successfully.", "success");
    } catch {
      notify("Failed to update ticket status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-panel">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-muted">
          <tr>
            <th className="px-4 py-3">Ticket ID</th>
            {showDescription && <th className="px-4 py-3">Title</th>}
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Created At</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {formatted.map((ticket) => (
            <tr key={ticket.id} className="border-b border-slate-800/70">
              <td className="px-4 py-3 font-mono text-xs text-slate-300">{ticket.id.slice(0, 8)}...</td>
              {showDescription && <td className="px-4 py-3">{ticket.title}</td>}
              <td className="px-4 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3">{ticket.priority}</td>
              <td className="px-4 py-3">{ticket.category}</td>
              <td className="px-4 py-3 text-slate-300">{ticket.createdAtLabel}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:border-slate-500">View</button>
                  <select
                    aria-label={`Update status for ${ticket.id}`}
                    value={pendingStatus[ticket.id] ?? ticket.status}
                    onChange={(event) =>
                      setPendingStatus((prev) => ({ ...prev, [ticket.id]: event.target.value as TicketStatus }))
                    }
                    className="min-w-32"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => void handleUpdate(ticket.id, ticket.status)}
                    disabled={updatingId === ticket.id}
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingId === ticket.id ? "Updating..." : "Update"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {tickets.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-slate-400" colSpan={showDescription ? 7 : 6}>
                No tickets found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

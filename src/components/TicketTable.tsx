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
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
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
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:border-slate-500"
                  >
                    View
                  </button>
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

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-panel p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <p className="text-xs text-muted">Ticket Details</p>
                <h3 className="text-lg font-semibold text-white">{selectedTicket.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-md border border-slate-700 px-2 py-1 text-xs hover:border-slate-500"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <span className="text-muted">Ticket ID:</span>{" "}
                <span className="font-mono text-slate-300">{selectedTicket.id}</span>
              </p>
              <p>
                <span className="text-muted">Status:</span> <StatusBadge status={selectedTicket.status} />
              </p>
              <p>
                <span className="text-muted">Priority:</span> {selectedTicket.priority}
              </p>
              <p>
                <span className="text-muted">Category:</span> {selectedTicket.category}
              </p>
              <p>
                <span className="text-muted">Location:</span> {selectedTicket.location ?? "Not provided"}
              </p>
              <p>
                <span className="text-muted">Created At:</span>{" "}
                {selectedTicket.createdAt ? selectedTicket.createdAt.toDate().toLocaleString() : "Pending"}
              </p>
              <div>
                <p className="mb-1 text-muted">Description:</p>
                <p className="rounded-md border border-slate-800 bg-slate-900/40 p-3 text-slate-200">
                  {selectedTicket.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

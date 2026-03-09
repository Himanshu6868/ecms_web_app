import type { TicketStatus } from "@/types/ticket";

const statusClasses: Record<TicketStatus, string> = {
  OPEN: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  ASSIGNED: "bg-yellow-500/15 text-yellow-300 border-yellow-500/40",
  IN_PROGRESS: "bg-purple-500/15 text-purple-300 border-purple-500/40",
  RESOLVED: "bg-green-500/15 text-green-300 border-green-500/40",
  CLOSED: "bg-slate-500/15 text-slate-300 border-slate-500/40"
};

export default function StatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClasses[status]}`}>{status}</span>;
}

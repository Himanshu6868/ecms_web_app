interface DashboardCardsProps {
  total: number;
  open: number;
  highPriority: number;
}

const Card = ({ title, value }: { title: string; value: number }) => (
  <article className="rounded-xl bg-panel border border-slate-800 p-4">
    <p className="text-sm text-muted">{title}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
  </article>
);

export default function DashboardCards({ total, open, highPriority }: DashboardCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card title="Total Tickets" value={total} />
      <Card title="Open Tickets" value={open} />
      <Card title="High Priority Tickets" value={highPriority} />
    </section>
  );
}

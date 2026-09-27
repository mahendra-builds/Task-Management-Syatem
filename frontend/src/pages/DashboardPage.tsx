export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {['Total', 'Pending', 'In Progress', 'Completed', 'Overdue'].map((label) => (
          <div key={label} className="card">
            <div className="text-sm text-slate-500">{label} Tasks</div>
            <div className="mt-2 text-2xl font-semibold">—</div>
          </div>
        ))}
      </div>
    </div>
  );
}

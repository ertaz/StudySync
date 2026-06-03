import StatCard from "../../components/StatCard";
import { useStats } from "../../hooks/useStats";

export default function Stats() {
  const { stats } =
    useStats();

  return (
    <div className="p-6">

      <h1 className="mb-6 text-3xl font-bold">
        Assignment Statistics
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total"
          value={stats.total}
        />

        <StatCard
          title="Submitted"
          value={stats.submitted}
        />

        <StatCard
          title="Pending"
          value={stats.pending}
        />

        <StatCard
          title="Overdue"
          value={stats.overdue}
        />

      </div>

    </div>
  );
}
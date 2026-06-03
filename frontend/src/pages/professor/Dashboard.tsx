import { Link } from "react-router-dom";
import StatCard from "../../components/StatCard";
import { useStats } from "../../hooks/useStats";

export default function Dashboard() {
  const {
    stats,
    loading,
  } = useStats();

  if (loading)
    return (
      <div className="p-6">
        Loading...
      </div>
    );

  return (
    <div className="p-6">

      <h1 className="mb-6 text-3xl font-bold">
        Professor Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-4">

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

      <div className="mt-8 flex gap-4">

        <Link
          to="/assignments"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Manage Assignments
        </Link>

        <Link
          to="/data-tools"
          className="rounded-lg border px-5 py-3"
        >
          Import / Export
        </Link>

      </div>

    </div>
  );
}
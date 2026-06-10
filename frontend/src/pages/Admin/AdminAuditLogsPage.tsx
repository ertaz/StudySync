import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuditLogs } from '../../api/auditLogApi';

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entity_id: number;
  ip_address: string;
  created_at: string;

  User?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function AdminAuditLogsPage() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  const actions = [...new Set(logs.map(log => log.action))];
  const entities = [...new Set(logs.map(log => log.entity))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      `${log.action}
       ${log.entity}
       ${log.User?.email || ''}
       ${log.User?.first_name || ''}
       ${log.User?.last_name || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesAction =
      !actionFilter || log.action === actionFilter;

    const matchesEntity =
      !entityFilter || log.entity === entityFilter;

    return (
      matchesSearch &&
      matchesAction &&
      matchesEntity
    );
  });

  const getActionColor = (action: string) => {
    if (action.includes('DELETE'))
      return 'bg-red-100 text-red-700';

    if (action.includes('CREATE') || action.includes('REGISTER'))
      return 'bg-green-100 text-green-700';

    if (action.includes('UPDATE'))
      return 'bg-yellow-100 text-yellow-700';

    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-6">

      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-stroke hover:bg-gray-100"
        >
          ←
        </button>

        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Audit Logs
          </h1>

          <p className="text-gray-500">
            System activity tracking
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row">

        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border px-4 py-3"
        />

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border px-4 py-3"
        >
          <option value="">All Actions</option>

          {actions.map(action => (
            <option
              key={action}
              value={action}
            >
              {action}
            </option>
          ))}
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-lg border px-4 py-3"
        >
          <option value="">All Entities</option>

          {entities.map(entity => (
            <option
              key={entity}
              value={entity}
            >
              {entity}
            </option>
          ))}
        </select>

      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No audit logs found.
          </div>
        ) : (
          <table className="w-full">

            <thead>
              <tr className="border-b bg-gray-50 dark:bg-meta-4">
                <th className="p-4 text-left">Action</th>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Entity</th>
                <th className="p-4 text-left">IP Address</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>

            <tbody>

              {filteredLogs.map(log => (
                <tr
                  key={log.id}
                  className="border-t hover:bg-gray-50 dark:hover:bg-meta-4"
                >
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionColor(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="p-4">
                    {log.User
                      ? `${log.User.first_name} ${log.User.last_name}`
                      : 'System'}
                  </td>

                  <td className="p-4">
                    {log.entity}
                  </td>

                  <td className="p-4 text-sm text-gray-500">
                    {log.ip_address}
                  </td>

                  <td className="p-4 text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

            </tbody>

          </table>
        )}

      </div>
    </div>
  );
}
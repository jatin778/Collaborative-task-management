import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

const statusStyles = {
  Todo: 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-700',
};

const AdminDashboard = ({ data }) => {
  const maxCompleted = Math.max(1, ...data.teamPerformance.map((m) => m.completed || 0));
  const completionRate = data.totalTasks
    ? Math.round((data.completedTasks / data.totalTasks) * 100)
    : 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard label="Projects" value={data.totalProjects} tone="blue" />
        <StatCard label="Total tasks" value={data.totalTasks} tone="gray" sublabel={`${completionRate}% completed`} />
        <StatCard label="Completed" value={data.completedTasks} tone="green" />
        <StatCard label="Pending" value={data.pendingTasks} tone="amber" />
        <StatCard label="Overdue" value={data.overdueTasks} tone="red" />
      </div>

      <div className="bg-white rounded shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Team performance</h3>
        {data.teamPerformance.length === 0 ? (
          <div className="text-sm text-gray-500">No team members yet.</div>
        ) : (
          <ul className="space-y-3">
            {data.teamPerformance.map((m) => {
              const pct = Math.round(((m.completed || 0) / maxCompleted) * 100);
              return (
                <li key={m._id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-gray-500">{m.completed || 0} completed</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded overflow-hidden">
                    <div className="h-2 bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
};

const MemberDashboard = ({ data }) => {
  const completionRate = data.myTasks
    ? Math.round((data.completedTasks / data.myTasks) * 100)
    : 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard label="My tasks" value={data.myTasks} tone="blue" sublabel={`${completionRate}% completed`} />
        <StatCard label="Completed" value={data.completedTasks} tone="green" />
        <StatCard label="Pending" value={data.pendingTasks} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming deadlines</h3>
          {data.upcomingDeadlines.length === 0 ? (
            <div className="text-sm text-gray-500">Nothing on the horizon.</div>
          ) : (
            <ul className="divide-y">
              {data.upcomingDeadlines.map((t) => (
                <li key={t._id} className="py-2 flex items-center justify-between">
                  <span className="text-sm">{t.title}</span>
                  <span className="text-xs text-gray-500">{formatDate(t.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent activity</h3>
          {data.recentActivity.length === 0 ? (
            <div className="text-sm text-gray-500">No recent activity.</div>
          ) : (
            <ul className="divide-y">
              {data.recentActivity.map((t) => (
                <li key={t._id} className="py-2 flex items-center justify-between gap-2">
                  <span className="text-sm truncate">{t.title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${statusStyles[t.status] || ''}`}>{t.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const url = user.role === 'Admin' ? '/dashboard/admin' : '/dashboard/member';
        const res = await api.get(url);
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-gray-500">Welcome back, {user?.name}.</p>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {data && (user.role === 'Admin' ? <AdminDashboard data={data} /> : <MemberDashboard data={data} />)}
    </DashboardLayout>
  );
};

export default Dashboard;

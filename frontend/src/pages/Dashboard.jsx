import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";

const PIE_COLORS = ["#3b6dff", "#f59e0b", "#10b981", "#ef4444", "#6b7280"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/requests/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  const byStatus = (stats?.byStatus || []).map((s) => ({ name: s._id, count: s.count }));
  const byCategory = (stats?.byCategory || []).map((c) => ({ name: c._id, value: c.count }));
  const overTime = (stats?.overTime || []).map((d) => ({ date: d._id, count: d.count }));

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Total Requests</p>
            <p className="text-3xl font-bold text-brand-600">{stats?.total ?? 0}</p>
          </div>
          {byStatus.slice(0, 3).map((s) => (
            <div key={s.name} className="bg-white p-5 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm capitalize">{s.name}</p>
              <p className="text-3xl font-bold">{s.count}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4">Requests by Status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byStatus}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b6dff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4">Requests by Category</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm md:col-span-2">
            <h2 className="font-semibold mb-4">Requests Created — Last 14 Days</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b6dff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

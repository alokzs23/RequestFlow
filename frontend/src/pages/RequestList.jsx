import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const STATUSES = ["pending", "in-progress", "approved", "rejected", "closed"];
const CATEGORIES = ["IT", "Leave", "Purchase", "Access", "Other"];

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;
    if (q) params.q = q;
    const res = await api.get("/requests", { params });
    setRequests(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Requests</h1>
          <Link
            to="/requests/new"
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            + New Request
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm">
          <input
            type="text"
            placeholder="Search title or description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 min-w-[200px] border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
            Search
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="p-6 text-center text-gray-500">No requests found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <Link to={`/requests/${r._id}`} className="text-brand-600 font-medium">
                        {r.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{r.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">{r.createdBy?.name}</td>
                    <td className="px-4 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

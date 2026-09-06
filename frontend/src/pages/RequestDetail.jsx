import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ALLOWED_TRANSITIONS = {
  pending: ["in-progress", "approved", "rejected"],
  "in-progress": ["approved", "rejected"],
  approved: ["closed"],
  rejected: ["closed"],
  closed: [],
};

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTransition = async (newStatus) => {
    try {
      await api.patch(`/requests/${id}/status`, { status: newStatus });
      fetchRequest();
    } catch (err) {
      setError(err.response?.data?.message || "Transition failed");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await api.post(`/requests/${id}/comment`, { note });
    setNote("");
    fetchRequest();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this request permanently?")) return;
    await api.delete(`/requests/${id}`);
    navigate("/requests");
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error && !request) return <div className="p-8 text-center text-red-600">{error}</div>;

  const allowed = ALLOWED_TRANSITIONS[request.status] || [];

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{request.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {request.category} · Submitted by {request.createdBy?.name} on{" "}
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-4 text-gray-700 whitespace-pre-wrap">{request.description}</p>

          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded mt-4">{error}</p>}

          {user.role === "manager" && allowed.length > 0 && (
            <div className="mt-5 flex gap-2 flex-wrap">
              <span className="text-sm text-gray-500 self-center mr-1">Move to:</span>
              {allowed.map((s) => (
                <button
                  key={s}
                  onClick={() => handleTransition(s)}
                  className="bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-1.5 rounded-md text-sm capitalize font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {(user.role === "manager" || String(request.createdBy?._id) === user.id) && (
            <button
              onClick={handleDelete}
              className="mt-4 text-red-600 text-sm hover:underline"
            >
              Delete request
            </button>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">Activity Timeline</h2>
          <ul className="space-y-4">
            {request.activityLog
              .slice()
              .reverse()
              .map((entry) => (
                <li key={entry._id} className="border-l-2 border-brand-100 pl-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{entry.by?.name || "Unknown"}</span>{" "}
                    {entry.action === "created" && "created this request"}
                    {entry.action === "status_changed" && (
                      <>
                        moved status from <strong>{entry.fromStatus}</strong> to{" "}
                        <strong>{entry.toStatus}</strong>
                      </>
                    )}
                    {entry.action === "commented" && "commented"}
                  </p>
                  {entry.note && <p className="text-sm text-gray-500 mt-1">{entry.note}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
          </ul>

          <form onSubmit={handleComment} className="mt-5 flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

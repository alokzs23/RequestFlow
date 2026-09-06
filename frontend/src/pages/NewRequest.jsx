import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";

const CATEGORIES = ["IT", "Leave", "Purchase", "Access", "Other"];

export default function NewRequest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/requests", { title, description, category });
      navigate(`/requests/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create request");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">New Request</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-md font-medium"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}

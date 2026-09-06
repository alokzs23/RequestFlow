import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm w-96 space-y-4">
        <h1 className="text-2xl font-bold text-brand-600">RequestFlow</h1>
        <p className="text-gray-500 text-sm">Log in to your account</p>

        {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-md font-medium"
        >
          Log In
        </button>
        <p className="text-sm text-gray-500 text-center">
          No account?{" "}
          <Link to="/signup" className="text-brand-600 font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

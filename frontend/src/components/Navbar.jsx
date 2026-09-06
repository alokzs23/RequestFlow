import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-brand-600">
        RequestFlow
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-gray-600 hover:text-brand-600">
            Dashboard
          </Link>
          <Link to="/requests" className="text-gray-600 hover:text-brand-600">
            Requests
          </Link>
          <Link to="/requests/new" className="text-gray-600 hover:text-brand-600">
            New Request
          </Link>
          <span className="text-gray-400">|</span>
          <span className="text-gray-700">
            {user.name} <span className="text-gray-400">({user.role})</span>
          </span>
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

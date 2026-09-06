const COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  closed: "bg-gray-200 text-gray-700",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        COLORS[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

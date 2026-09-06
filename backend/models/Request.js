import mongoose from "mongoose";

// Fixed, simple workflow — keeps scope tight instead of a configurable engine
export const STATUSES = ["pending", "in-progress", "approved", "rejected", "closed"];

// Allowed transitions per status (prevents e.g. closed -> pending)
export const ALLOWED_TRANSITIONS = {
  pending: ["in-progress", "approved", "rejected"],
  "in-progress": ["approved", "rejected"],
  approved: ["closed"],
  rejected: ["closed"],
  closed: [],
};

const activityEntrySchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. "created", "status_changed", "commented"
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, default: "" },
    fromStatus: { type: String },
    toStatus: { type: String },
  },
  { timestamps: true }
);

const requestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["IT", "Leave", "Purchase", "Access", "Other"],
      default: "Other",
    },
    status: { type: String, enum: STATUSES, default: "pending" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    activityLog: [activityEntrySchema],
  },
  { timestamps: true }
);

requestSchema.index({ title: "text", description: "text" });

export default mongoose.model("Request", requestSchema);

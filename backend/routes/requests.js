import express from "express";
import Request from "../models/Request.js";
import { ALLOWED_TRANSITIONS } from "../models/Request.js";
import { protect, requireManager } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/requests?status=&category=&q=&mine=true
router.get("/", async (req, res) => {
  try {
    const { status, category, q, mine } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (mine === "true") filter.createdBy = req.user._id;
    // Employees only ever see their own requests; managers see everything
    if (req.user.role !== "manager") filter.createdBy = req.user._id;

    if (q) {
      filter.$text = { $search: q };
    }

    const requests = await Request.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests/stats  -- dashboard analytics
router.get("/stats", async (req, res) => {
  try {
    const baseMatch = req.user.role === "manager" ? {} : { createdBy: req.user._id };

    const byStatus = await Request.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byCategory = await Request.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Requests created per day, last 14 days
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const overTime = await Request.aggregate([
      { $match: { ...baseMatch, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const total = await Request.countDocuments(baseMatch);

    res.json({ total, byStatus, byCategory, overTime });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests/:id
router.get("/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("activityLog.by", "name email");

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (req.user.role !== "manager" && String(request.createdBy._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to view this request" });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests
router.post("/", async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const request = await Request.create({
      title,
      description,
      category,
      createdBy: req.user._id,
      activityLog: [
        {
          action: "created",
          by: req.user._id,
          note: "Request submitted",
          toStatus: "pending",
        },
      ],
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/requests/:id/status  -- workflow transition (manager only)
router.patch("/:id/status", requireManager, async (req, res) => {
  try {
    const { status, note } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const allowed = ALLOWED_TRANSITIONS[request.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot move from '${request.status}' to '${status}'. Allowed: ${allowed.join(", ") || "none"}`,
      });
    }

    request.activityLog.push({
      action: "status_changed",
      by: req.user._id,
      note: note || "",
      fromStatus: request.status,
      toStatus: status,
    });
    request.status = status;
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests/:id/comment  -- adds a note to the activity timeline
router.post("/:id/comment", async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) return res.status(400).json({ message: "Note is required" });

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (req.user.role !== "manager" && String(request.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.activityLog.push({ action: "commented", by: req.user._id, note });
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/requests/:id
router.delete("/:id", async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const isOwner = String(request.createdBy) === String(req.user._id);
    if (req.user.role !== "manager" && !isOwner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await request.deleteOne();
    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

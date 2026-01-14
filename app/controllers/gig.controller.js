const express = require("express");
const apiRouter = express.Router();
const Gig = require("../models/gig.model");
const authMiddleware = require("../middlewares/auth.middleware");

module.exports = function (app) {

  // ✅ GET ALL OPEN GIGS (with search)
  apiRouter.get("/api/gigs", async (req, res) => {
    try {
      const { search } = req.query;

      const query = {
        status: "open",
      };

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      const gigs = await Gig.find(query).sort({ createdAt: -1 });

      res.status(200).json({
        message: "Gigs fetched successfully",
        data: gigs,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // 🔒 CREATE GIG
  apiRouter.post("/api/gigs", authMiddleware, async (req, res) => {
    try {
      const { title, description, budget } = req.body;

      if (!title || !budget) {
        return res.status(200).json({
          message: "Title and budget are required",
        });
      }

      const gig = new Gig({
        title,
        description,
        budget,
        ownerId: req.userId,
        status: "open",
      });

      await gig.save();

      res.status(200).json({
        message: "Gig created successfully",
        data: gig,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // 🔒 GET MY GIGS (posted by logged-in user)
  apiRouter.get("/api/my-gigs", authMiddleware, async (req, res) => {
    try {
      const gigs = await Gig.find({ ownerId: req.userId })
        .sort({ createdAt: -1 });

      res.status(200).json({
        message: "My gigs fetched successfully",
        data: gigs,
      });

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.use("/", apiRouter);
};

const express = require("express");
const mongoose = require("mongoose");
const apiRouter = express.Router();
const Bid = require("../models/bid.model");
const Gig = require("../models/gig.model");
const authMiddleware = require("../middlewares/auth.middleware");

module.exports = function (app) {

    // 🔒 SUBMIT BID (Freelancer)
apiRouter.post("/api/bids", authMiddleware, async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !price) {
      return res.status(200).json({
        message: "gigId and price are required",
      });
    }

    // 1️⃣ Find the gig FIRST
    const gig = await Gig.findById(gigId);
    if (!gig || gig.status !== "open") {
      return res.status(200).json({
        message: "Gig not available for bidding",
      });
    }

    // 2️⃣ Prevent bidding on own gig
    if (gig.ownerId.toString() === req.userId) {
      return res.status(200).json({
        message: "You cannot bid on your own gig",
      });
    }

    // 3️⃣ Prevent duplicate bid
    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.userId,
    });

    if (existingBid) {
      return res.status(200).json({
        message: "You have already bid on this gig",
      });
    }

    // 4️⃣ Create bid
    const bid = new Bid({
      gigId,
      freelancerId: req.userId,
      message,
      price,
      status: "pending",
    });

    await bid.save();

    res.status(200).json({
      message: "Bid submitted successfully",
      data: bid,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


    // 🔒 GET BIDS FOR A GIG (Owner only)
    apiRouter.get("/api/bids/:gigId", authMiddleware, async (req, res) => {
        try {
            const { gigId } = req.params;

            const gig = await Gig.findById(gigId);
            if (!gig) {
                return res.status(200).json({
                    message: "Gig not found",
                });
            }

            // Only gig owner can view bids
            if (gig.ownerId.toString() !== req.userId) {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            const bids = await Bid.find({ gigId })
                .populate("freelancerId", "name email")
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: "Bids fetched successfully",
                data: bids,
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });


    // 🔒 HIRE A BID (ATOMIC OPERATION)
// apiRouter.patch("/api/bids/:bidId/hire", authMiddleware, async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const { bidId } = req.params;

//     // 1️⃣ Find the bid
//     const bid = await Bid.findById(bidId).session(session);
//     if (!bid) {
//       await session.abortTransaction();
//       return res.status(200).json({ message: "Bid not found" });
//     }

//     // ❗ Prevent rehiring / invalid state
//     if (bid.status !== "pending") {
//       await session.abortTransaction();
//       return res.status(200).json({
//         message: "This bid cannot be hired",
//       });
//     }

//     // 2️⃣ Find the gig
//     const gig = await Gig.findById(bid.gigId).session(session);
//     if (!gig) {
//       await session.abortTransaction();
//       return res.status(200).json({ message: "Gig not found" });
//     }

//     // 3️⃣ Only owner can hire
//     if (gig.ownerId.toString() !== req.userId) {
//       await session.abortTransaction();
//       return res.status(403).json({
//         message: "You are not authorized to hire for this gig",
//       });
//     }

//     // ❗ Prevent owner hiring themselves
//     if (bid.freelancerId.toString() === req.userId) {
//       await session.abortTransaction();
//       return res.status(200).json({
//         message: "You cannot hire yourself",
//       });
//     }

//     // 4️⃣ Prevent double hiring (CRITICAL)
//     if (gig.status === "assigned") {
//       await session.abortTransaction();
//       return res.status(200).json({
//         message: "Gig already assigned",
//       });
//     }

//     // 5️⃣ Hire selected bid
//     const hiredBid = await Bid.findByIdAndUpdate(
//       bidId,
//       { status: "hired" },
//       { new: true, session }
//     );

//     // 6️⃣ Reject all other bids
//     await Bid.updateMany(
//       {
//         gigId: bid.gigId,
//         _id: { $ne: bidId },
//       },
//       { status: "rejected" },
//       { session }
//     );

//     // 7️⃣ Update gig status
//     const updatedGig = await Gig.findByIdAndUpdate(
//       gig._id,
//       { status: "assigned" },
//       { new: true, session }
//     );

//     // 8️⃣ Commit transaction
//     await session.commitTransaction();

//     res.status(200).json({
//       message: "Freelancer hired successfully",
//       gig: updatedGig,
//       hiredBid,
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     res.status(500).json({ message: error.message });
//   } finally {
//     session.endSession();
//   }
// });

apiRouter.patch("/api/bids/:bidId/hire", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { bidId } = req.params;

    // 1️⃣ Find the bid
    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(200).json({ message: "Bid not found" });
    }

    // ❗ Prevent rehiring / invalid state
    if (bid.status !== "pending") {
      await session.abortTransaction();
      return res.status(200).json({
        message: "This bid cannot be hired",
      });
    }

    // 2️⃣ Find the gig
    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      return res.status(200).json({ message: "Gig not found" });
    }

    // 3️⃣ Only owner can hire
    if (gig.ownerId.toString() !== req.userId) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "You are not authorized to hire for this gig",
      });
    }

    // ❗ Prevent owner hiring themselves
    if (bid.freelancerId.toString() === req.userId) {
      await session.abortTransaction();
      return res.status(200).json({
        message: "You cannot hire yourself",
      });
    }

    // 4️⃣ Prevent double hiring (CRITICAL)
    if (gig.status === "assigned") {
      await session.abortTransaction();
      return res.status(200).json({
        message: "Gig already assigned",
      });
    }

    // 5️⃣ Hire selected bid
    const hiredBid = await Bid.findByIdAndUpdate(
      bidId,
      { status: "hired" },
      { new: true, session }
    );

    // 6️⃣ Reject all other bids
    await Bid.updateMany(
      {
        gigId: bid.gigId,
        _id: { $ne: bidId },
      },
      { status: "rejected" },
      { session }
    );

    // 7️⃣ Update gig status
    const updatedGig = await Gig.findByIdAndUpdate(
      gig._id,
      { status: "assigned" },
      { new: true, session }
    );

    // 8️⃣ Commit transaction
    await session.commitTransaction();

    // 🔔 9️⃣ Emit Socket.io notification (AFTER commit)
    // const io = req.app.get("io");
    // if (io) {
    //   io.to(bid.freelancerId.toString()).emit("hired", {
    //     gigId: updatedGig._id,
    //     gigTitle: updatedGig.title,
    //   });
    // }
    // 🔔 9️⃣ Emit Socket.io notification (AFTER commit)
const io = req.app.get("io");

console.log("📢 Preparing to emit hire notification");
console.log("📢 Freelancer ID:", bid.freelancerId.toString());

if (io) {
  console.log("📢 IO instance found");

  io.to(bid.freelancerId.toString()).emit("hired", {
    gigId: updatedGig._id,
    gigTitle: updatedGig.title,
  });

  console.log("✅ Hire event emitted to room:", bid.freelancerId.toString());
} else {
  console.log("❌ IO instance NOT found");
}


    res.status(200).json({
      message: "Freelancer hired successfully",
      gig: updatedGig,
      hiredBid,
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});


    // 🔒 GET MY APPLICATIONS (Freelancer)
    apiRouter.get("/api/my-applications", authMiddleware, async (req, res) => {
        try {
            const bids = await Bid.find({ freelancerId: req.userId })
                .populate("gigId", "title budget status")
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: "My applications fetched successfully",
                data: bids,
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // ✅ LOGOUT
    apiRouter.post("/api/auth/logout", (req, res) => {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                sameSite: "lax",
                secure: false, // true in production
            });

            res.status(200).json({
                message: "Logout successful",
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.use("/", apiRouter);
};

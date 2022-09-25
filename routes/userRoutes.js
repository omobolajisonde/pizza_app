const express = require("express");
const { authenticateHandler, adminAuthorizeHandler } = require("../auth");

const userModel = require("../models/userModel");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userData: body } = req.body;

    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Bad request!",
      });
    }

    const user = await userModel.create(body);

    return res.status(201).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }
});

router.use(authenticateHandler);

router.patch("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { userCredentials } = req.body;

    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    if (user.username !== userCredentials.username.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden! You cannot alter another user details!",
      });
    }

    const { userData: body } = req.body;

    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Bad request!",
      });
    }

    user = await userModel.findByIdAndUpdate(userId, body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { userCredentials } = req.body;

    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    if (
      userCredentials.user_type.toLowerCase() !== "admin" &&
      user.username !== userCredentials.username.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden! You cannot delete another user account!",
      });
    }

    user = await userModel.findByIdAndDelete(userId);

    return res.status(204).json({
      success: true,
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
});

router.use(adminAuthorizeHandler);

router.get("/", async (req, res) => {
  try {
    const users = await userModel.find({});
    return res.status(200).json({
      success: true,
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
});

module.exports = router;

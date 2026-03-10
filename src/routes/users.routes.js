import express from "express";

import {
  deleteUserById,
  fetchAllUsers,
  fetchUserById,
  updateUserById,
} from "#controllers/users.controller.js";

const userRouter = express.Router();

userRouter.get("/", fetchAllUsers);

userRouter.get("/:id", fetchUserById);

userRouter.put("/:id", updateUserById);

userRouter.delete("/:id", deleteUserById);

export default userRouter;

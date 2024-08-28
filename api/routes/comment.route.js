import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
    createComment,
    deleteComment,
    editComment,
    likeComment,
    getComments,
    getPostComments,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createComment);
router.delete("/deletecomment/:commentId", verifyToken, deleteComment);
router.put("/editcomment/:commentId", verifyToken, editComment);
router.put("/likecomment/:commentId", verifyToken, likeComment);
router.get("/getcomments", verifyToken, getComments);
router.get("/getpostcomments/:postId", verifyToken, getPostComments);

export default router;

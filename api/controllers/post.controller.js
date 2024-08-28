import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

export const create = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, "당신은 글을 쓸 권한이 없습니다."));
    }

    if (!req.body.title || !req.body.content) {
        return next(errorHandler(400, "모든 영역을 작성해야 합니다."));
    }

    const slug = req.body.title
        .split(" ")
        .join("-")
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, "");

    const newPost = new Post({
        ...req.body,
        slug,
        userId: req.user.id,
    });

    try {
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        next(error);
    }
};

export const getposts = async (req, res, next) => {
    try {

        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 3;

        const sortDirection = req.query.order === "asc" ? 1 : -1;

        //검색기능
        const posts = await Post.find({
            ...(req.query.userId && { userId: req.query.userId }), // userId가 쿼리에 있는 경우 조건에 추가
            ...(req.query.category && { category: req.query.category }), // category가 쿼리에 있는 경우 조건에 추가
            ...(req.query.slug && { slug: req.query.slug }), // slug가 쿼리에 있는 경우 조건에 추가
            ...(req.query.postId && { _id: req.query.postId }), // postId가 쿼리에 있는 경우 조건에 추가
            ...(req.query.searchTerm && {
                $or: [
                    { title: { $regex: req.query.searchTerm, $options: "i" } }, //제목에서 대소문자 구분없이 검색
                    { content: { $regex: req.query.searchTerm, $options: "i" } }, //내용에서 대소문자 구분없이 검색
                ],
            }),
        })
            .sort({ updatedAt: sortDirection })
            .skip(startIndex)
            .limit(limit);

        const totalPosts = await Post.countDocuments();
        const now = new Date();
        //한달 전 날짜를 계산
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        //한달 이내에 생성된 게시물 갯수
        const lastMonthPosts = await Post.countDocuments({
            createdAt: { $gte: oneMonthAgo },
        });

        res.status(200).json({
            posts,
            totalPosts,
            lastMonthPosts,
        })

    } catch (err) {
        next(err);
    }
}
export const deletepost = async (req, res, next) => {
    if (!req.user.isAdmin || req.user.id !== req.params.userId) {
        return next(errorHandler(403, "삭제할 권한이 없습니다."));
    }
    try {
        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json("글이 삭제되었습니다.");
    } catch (err) {
        next(err);
    }
};
export const updatepost = async (req, res, next) => {
    if (!req.user.isAdmin || req.user.id !== req.params.userId) {
        return next(errorHandler(403, "수정할 권한이 없습니다."));

    }
    try {
        const updatedpost = await Post.findByIdAndUpdate(req.params.userId, {
            $set: {
                title: req.body.title,
                content: req.body.content,
                category: req.body.category,
                image: req.body.image,
            }
        },
            { new: true }
        );

        res.status(200).json(updatedpost);
    } catch (err) {
        next(err);
    }
}


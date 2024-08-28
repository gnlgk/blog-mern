import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";

export const test = (req, res) => {
    res.json({ message: "API가 작동되고 있습니다." });
};

// 프로필 수정
export const updateUser = async (req, res, next) => {
    // 아이디 확인
    if (req.user.id !== req.params.userId) {
        return next(errorHandler(403, "업데이트 권한이 없습니다."));
    }

    // 패스워드 확인
    if (req.body.password) {
        if (req.body.password.length < 6) {
            return next(errorHandler(400, "비밀번호는 반드시 6자리 이상이어야 합니다."));
        }
        req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    // 이름 확인
    if (req.body.username) {
        if (req.body.username.length < 7 || req.body.username.length > 20) {
            return next(errorHandler(400, "이름은 7~20글자 이내로 작성해야 합니다."));
        }
        if (req.body.username.includes(" ")) {
            return next(errorHandler(400, "이름에는 빈칸을 사용할 수 없습니다."));
        }
        if (req.body.username !== req.body.username.toLowerCase()) {
            return next(errorHandler(400, "이름은 소문자로 작성해야 합니다."));
        }
        if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
            return next(errorHandler(400, "이름에는 반드시 영어와 숫자가 포함되어야 합니다. "));
        }
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    profilePicture: req.body.profilePicture,
                    password: req.body.password,
                },
            },
            { new: true }
        );
        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};

// 회원 탈퇴
export const deleteUser = async (req, res, next) => {
    if (!req.user.isAdmin) {
        if (req.user.id !== req.params.userId) {
            return next(errorHandler(403, "회원 계정을 삭제할 수 없습니다."));
        }
    }
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.status(200).json("회원 계정이 삭제되었습니다.");
    } catch (error) {
        next(error);
    }
};

// 로그아웃
export const signout = (req, res, next) => {
    try {
        res.clearCookie("access_token").status(200).json("로그아웃 되었습니다.!!");
    } catch (error) {
        next(error);
    }
};

// 모든 회원데이터
export const getusers = async (req, res, next) => {
    if (!req.user.isAdmin) {
        return next(errorHandler(403, "당신은 회원 데이터를 볼 수 없습니다."));
    }

    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 3;
        const sortDirection = req.query.sort === "asc" ? 1 : -1;

        const users = await User.find()
            .sort({ createAt: sortDirection })
            .skip(startIndex)
            .limit(limit);

        const userWithoutPassword = users.map((user) => {
            const { password, ...rest } = user._doc;
            return rest;
        });

        const totalUsers = await User.countDocuments();
        const now = new Date();

        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const lastMonthUsers = await User.countDocuments({
            createdAt: { $gte: oneMonthAgo },
        });

        res.status(200).json({
            users: userWithoutPassword,
            totalUsers,
            lastMonthUsers
        })

    } catch (err) {
        next(err);
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return next(errorHandler(404, "회원을 찾을 수 없습니다."));
        }
        const { password, ...rest } = user._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};
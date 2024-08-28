import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Comment from "./Comment";

export default function CommentSection({ postId }) {
    const { currentUser } = useSelector((state) => state.user);
    const [comment, setComment] = useState("");
    const [commentError, setCommentError] = useState(null);
    const [comments, setComments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (comment.length > 200) {
            return;
        }

        try {
            const res = await fetch("/api/comment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: comment,
                    postId,
                    userId: currentUser._id,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setComment("");
                setCommentError(null);
                setComments([data, ...comments]);
            }
        } catch (error) {
            setCommentError(error.message);
        }
    };

    useEffect(() => {
        const getComments = async () => {
            try {
                const res = await fetch(`/api/comment/getPostComments/${postId}`);
                if (res.ok) {
                    const data = await res.json();
                    console.log(data);
                    setComments(data);
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        getComments();
    }, [postId]);

    const handleLike = async (commentId) => {
        try {
            if (!currentUser) {
                navigate("/sign-in");
                return;
            }
            const res = await fetch(`/api/comment/likecomment/${commentId}`, {
                method: "PUT",
            });
            if (res.ok) {
                const data = await res.json();
                setComments(
                    comments.map((comment) =>
                        comment._id === commentId
                            ? {
                                ...comment,
                                likes: data.likes,
                                numberOfLikes: data.likes.length,
                            }
                            : comment
                    )
                );
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleEdit = async (comment, editedContent) => {
        setComments(comments.map((c) => (c._id === comment._id ? { ...c, content: editedContent } : c)));
    };

    const handleDelete = async (commentId) => {
        setShowModal(false);
        try {
            if (!currentUser) {
                navigate("/sign-in");
                return;
            }
            const res = await fetch(`/api/comment/deletecomment/${commentId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                const data = await res.json();
                setComments(comments.filter((comment) => comment._id !== commentId));
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div className="relative w-full max-w-2xl p-3 mx-auto">
            {currentUser ? (
                <div className="flex items-center gap-1 my-5 text-sm text-gray-500">
                    <p>Signed in as:</p>
                    <img className="object-cover w-5 h-5 rounded-full" src={currentUser.profilePicture} alt="" />
                    <Link to={"/dashboard?tab=profile"} className="text-xs text-blue-600 hover:underline">
                        @{currentUser.username}
                    </Link>
                </div>
            ) : (
                <div className="flex gap-1 my-5 text-sm text-blue-500">
                    로그인을 하면 댓글을 작성할 수 있습니다.
                    <Link className="text-blue-500 hover:underline" to={"/sign-in"}>
                        로그인 하기
                    </Link>
                </div>
            )}

            {currentUser && (
                <form onSubmit={handleSubmit} className="p-3 border border-blue-500 rounded-md">
                    <textarea
                        className="w-full p-2 text-black"
                        placeholder="Add a comment..."
                        rows="3"
                        maxLength="200"
                        onChange={(e) => setComment(e.target.value)}
                        value={comment}
                    />
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{200 - comment.length} characters remaining</p>
                        <button type="submit" className="p-1 px-4 rounded-sm bg-blue-500 hover:bg-blue-600">Submit</button>
                    </div>
                    {commentError && <div className="mt-4 border">{commentError}</div>}
                </form>
            )}

            {comments.length === 0 ? (
                <p className="my-4 text-sm">아직 댓글이 없어요!</p>
            ) : (
                <>
                    <div className="flex items-center gap-1 my-4 text-sm">
                        <p>Comments</p>
                        <div className="p-1 rounded-sm">
                            <p>{comments.length}</p>
                        </div>
                    </div>
                    {comments.map((comment) => (
                        <Comment
                            key={comment._id}
                            comment={comment}
                            onLike={handleLike}
                            onEdit={handleEdit}
                            onDelete={(commentId) => {
                                setShowModal(true);
                                setCommentToDelete(commentId);
                            }}
                        />
                    ))}
                </>
            )}

            {showModal && (
                <div className="absolute p-4 bg-white border top-4 left-4 text-black">
                    <h3>정말로 삭제하겠습니까?</h3>
                    <div className="flex justify-end">
                        <button
                            className="block p-2 mb-2 text-white bg-red-500"
                            onClick={() => handleDelete(commentToDelete)}
                        >
                            Yes
                        </button>
                        <button className="block p-2 bg-gray-300" onClick={() => setShowModal(false)}>
                            No
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

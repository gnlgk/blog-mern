import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function DashPosts() {
    const { currentUser } = useSelector((state) => state.user);
    const [userPosts, setUserPosts] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [postIdToDelete, setPostIdToDelete] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`/api/post/getposts?userId=${currentUser._id}`);
                const data = await res.json();

                if (res.ok) {
                    setUserPosts(data.posts);
                    if (data.posts.length < 9) {
                        setShowMore(false);
                    }
                }
                console.log(data);
            } catch (error) {
                console.log(error.message);
            }
        };
        fetchPosts();
    }, [currentUser._id]);

    const handleShowMore = async () => {
        const startIndex = userPosts.length;

        try {
            const res = await fetch(`/api/post/getposts?userId=${currentUser._id}&startIndex=${startIndex}`);
            const data = await res.json();

            if (res.ok) {
                setUserPosts((prev) => [...prev, ...data.posts]);
                if (data.posts.length < 9) {
                    setShowMore(false);
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleDeletePost = async () => {
        setShowModal(false);
        try {
            const res = await fetch(`/api/post/deletepost/${postIdToDelete}/${currentUser._id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok) {
                console.log(data.message);
            } else {
                setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="m-10 relative">
            {currentUser.isAdmin && userPosts.length > 0 ? (
                <>
                    <table className="w-full">
                        <caption className="my-8 text-3xl">Blog Post</caption>
                        <thead>
                            <tr>
                                <th>등록일</th>
                                <th>이미지</th>
                                <th>제목</th>
                                <th>카테고리</th>
                                <th>삭제</th>
                                <th>수정</th>
                            </tr>
                        </thead>

                        <tbody>
                            {userPosts.map((post, index) => (
                                <tr key={index} className="hover:bg-slate-950">
                                    <td className="p-2 border text-center">{new Date(post.updatedAt).toLocaleDateString()}</td>
                                    <td className="p-2 border text-center">
                                        <Link to={`/post/${post.slug}`}>
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="object-cover w-20 h-10 mx-auto"
                                            />
                                        </Link>
                                    </td>
                                    <td className="p-2 border text-center">
                                        <Link to={`/post/${post.slug}`}>{post.title}</Link>
                                    </td>
                                    <td className="p-2 border text-center">{post.category}</td>
                                    <td className="p-2 text-center border">
                                        <span
                                            onClick={() => {
                                                setShowModal(true);
                                                setPostIdToDelete(post._id);
                                            }}
                                            className="text-red-600 cursor-pointer hover:underline"
                                        >
                                            delete
                                        </span>
                                    </td>
                                    <td className="p-2 text-center border">
                                        <Link
                                            to={`/update-post/${post._id}`}
                                            className="text-green-600 cursor-pointer hover:underline"
                                        >
                                            edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {showMore && (
                        <button
                            onClick={handleShowMore}
                            className="w-full p-3 mt-5 text-sm text-teal-800 transition-all border hover:bg-gray-300"
                        >
                            더 보기
                        </button>
                    )}
                </>
            ) : (
                <p>아직 글이 없습니다.</p>
            )}

            {showModal && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-35 text-black">
                    <div className="absolute w-1/3 p-8 transform -translate-x-1/2 -translate-y-1/2 bg-white top-1/2 left-1/2">
                        <h3 className="mb-3">게시글을 정말 삭제하겠습니까?</h3>
                        <button className="px-4 mr-1 text-white bg-red-500" onClick={handleDeletePost}>
                            Yes
                        </button>
                        <button className="px-4 text-white bg-gray-500" onClick={() => setShowModal(false)}>
                            No
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useEffect, useState } from "react"
import { useSelector } from "react-redux";

import { FaCheck, FaTimes } from "react-icons/fa";

export default function DashUsers() {
    const { currentUser } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`/api/user/getusers`);
                const data = await res.json();

                if (res.ok) {
                    setUsers(data.users);
                    if (data.users.length < 3) {
                        setShowMore(false);
                    }
                }
                console.log(data)
            } catch (err) {
                console.log(err.message);
            }
        }
        fetchUsers();
    }, [currentUser._id]);

    const handleShowMore = async () => {
        const startIndex = users.length;

        try {
            const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`)
            const data = await res.json();

            if (res.ok) {
                setUsers((prev) => [...prev, ...data.users])
                if (data.users.length < 3) {
                    setShowMore(false);
                }
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    const handleDeleteUser = async () => {
        try {
            const res = await fetch(`/api/user/delete/${userIdToDelete}`, {
                method: "delete",
            });
            const data = await res.json();

            if (res.ok) {
                setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
                setShowModal(false);
            } else {
                console.log(data.message);
            }

        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="m-10 relative">
            {currentUser.isAdmin && users.length > 0 ? (
                <>
                    <table className="w-full">
                        <caption className="my-8 text-3xl">Users</caption>
                        <thead>
                            <tr>
                                <th>가입일</th>
                                <th>이미지</th>
                                <th>아이디</th>
                                <th>이메일</th>
                                <th>권한</th>
                                <th>삭제</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user, index) => (
                                <tr key={index} className="hover:bg-slate-950">
                                    <td className="p-2 border text-center">{users.createdAt ? new Date(users.createdAt).toLocaleDateString() : "today"}</td>
                                    <td className="p-2 border text-center">
                                        <img src={user.profilePicture} alt={user.username} className="object-cover w-10 h-10 mx-auto" />
                                    </td>
                                    <td className="p-2 border text-center">
                                        {user.username}
                                    </td>
                                    <td className="p-2 border text-center">{user.email}</td>
                                    <td className="p-2 border text-center">
                                        {user.isAdmin ? (
                                            <FaCheck className="text-green-300" />
                                        ) : (
                                            <FaTimes className="text-red-300" />
                                        )
                                        }
                                    </td>
                                    <td className="p-2 border text-center">
                                        <span className="text-red-400 cursor-pointer hover:underline "
                                            onClick={() => {
                                                setShowModal(true);
                                                setUserIdToDelete(user._id);
                                            }}>Delete</span>
                                    </td>
                                </tr>
                            ))}

                        </tbody>

                    </table>
                    {showMore && (
                        <button
                            onClick={handleShowMore}
                            className="w-full text-sm text-teal-800 p-3 m-5 hover:bg-gray-500">더보기</button>
                    )}
                </>
            ) : (
                <p>아직 회원이 없습니다.</p>
            )}
            {showModal && (
                <div className="w-full h-full bg-opacity-30 bg-black absolute top-0 left-0 ">
                    <div className="w-1/3 p-10 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <h3 className="mb-3 mx-auto text-black">게시글을 정말 삭제하시겠습니까?</h3>
                        <button className="bg-gray-700 px-2" onClick={handleDeleteUser}>YES</button>
                        <button className="bg-gray-700 px-2 mx-2" onClick={() => setShowModal(false)}>NO</button>
                    </div>
                </div>
            )}
        </div>
    )
}

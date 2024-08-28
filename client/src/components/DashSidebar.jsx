import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineProfile, AiFillAliwangwang, AiFillAlert, AiFillWechat, AiOutlineLogout } from "react-icons/ai";

import { useSelector } from "react-redux";

export default function DashSidebar() {
    const location = useLocation();
    const [tab, setTab] = useState("");

    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabFromUrl = urlParams.get("tab");
        // console.log(tabFromUrl);

        if (tabFromUrl) {
            setTab(tabFromUrl);
        }
    }, [location.search]);

    return (
        <div>
            <ul className="flex flex-col gap-3 p-5">
                <li className={`profile ${tab === "profile" ? "text-red-500" : ""}`}>
                    <Link to="/dashboard?tab=profile" className="flex items-center gap-1">
                        <AiOutlineProfile />
                        Profile
                    </Link>
                </li>
                {currentUser.isAdmin && (
                    <li className="">
                        <Link to="/dashboard?tab=users" className="flex items-center gap-1">
                            <AiFillAliwangwang />
                            Users
                        </Link>
                    </li>
                )}

                {currentUser.isAdmin && (
                    <li className="">
                        <Link to="/dashboard?tab=posts" className="flex items-center gap-1">
                            <AiFillAlert />
                            Posts
                        </Link>
                    </li>
                )}

                {currentUser.isAdmin && (
                    <li className="">
                        <Link to="/dashboard?tab=comments" className="flex items-center gap-1">
                            <AiFillWechat />
                            Comments
                        </Link>
                    </li>
                )}

                <li className="">
                    <Link to="/" className="flex items-center gap-1">
                        <AiOutlineLogout />
                        Signout
                    </Link>
                </li>
            </ul>
        </div>
    );
}

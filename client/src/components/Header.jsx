import { useState } from "react";
import { Link } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";

export default function Header() {

    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user);
    const { theme } = useSelector((state) => state.theme);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
    };
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header id='header' className="bg-[rgb(0,0,0,0.7)] text-white">
            <div className="flex justify-between items-center p-4">
                <nav>
                    <div
                        className="cursor-pointer mr-24"
                        onClick={toggleMenu}>
                        <IoMdMenu className="size-5" />
                    </div>
                    {isMenuOpen && (
                        <div className="w-60 h-full bg-white text-black py-4 absolute top-0 left-0">
                            <h2 className="border-b border-black pr-20 py-2 text-xl leading-10 mx-5"
                                onClick={toggleMenu}>Menu</h2>
                            <ul className="">
                                <li className="p-3 px-5 text-lg text-gray-400 hover:bg-blue-600 hover:text-white"><Link rel="stylesheet" to="/">Home</Link></li>
                                <li className="p-3 px-5 text-lg text-gray-400 hover:bg-blue-600 hover:text-white"><Link rel="stylesheet" to="/sign-in">SignIn</Link></li>
                                <li className="p-3 px-5 text-lg text-gray-400 hover:bg-blue-600 hover:text-white"><Link rel="stylesheet" to="/sign-up">SignUp</Link></li>
                                <li className="p-3 px-5 text-lg text-gray-400 hover:bg-blue-600 hover:text-white"><Link rel="stylesheet" to="/dashboard">Dashboard</Link></li>
                            </ul>
                        </div>
                    )}
                </nav>
                <h1 className="text-2xl font-['notosanskr']">
                    <Link to='/'><span className="font-bold">GNLGK</span> Blog</Link>
                </h1>
                <div className="flex">
                    <button onClick={() => dispatch(toggleTheme())} >
                        {theme === "light" ? <MdOutlineLightMode className="size-6" /> : <MdOutlineDarkMode className="size-6" />}

                    </button>
                    <button className="px-2 ml-1">
                        <FaSearch className="size-5" />
                    </button>



                    {/* <button className="px-2">
                        signin
                    </button>
                    <button className="px-2">
                        signup
                    </button> */}
                    {currentUser ? (
                        <>
                            <img
                                className="rounded-full w-7 h-7 ml-1"
                                src={currentUser.profilePicture}
                                onClick={toggleProfile}
                            />
                            {isProfileOpen && (
                                <div className="absolute z-50 flex flex-col items-center p-3 border border-gray-300 rounded-sm bg-white top-20 right-5 w-64 text-black space-y-2">
                                    <div className="flex flex-col items-center mb-2">
                                        <span className="text-lg font-semibold">{currentUser.username}</span>
                                        <span className="text-sm text-neutral-600">{currentUser.email}</span>
                                    </div>
                                    <Link
                                        to={'/dashboard?tab=profile'}
                                        className="w-full px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-sm hover:bg-blue-700 transition duration-200"
                                    >
                                        Profile
                                    </Link>
                                    <button className="w-full px-4 py-2 text-center text-sm font-medium text-white bg-black rounded-sm hover:bg-slate-900 transition duration-200">
                                        Sign Out
                                    </button>
                                </div>
                            )}

                        </>
                    ) : (
                        <Link to={"/sign-in"} className="ml-1">SignIn</Link>
                    )}
                </div>

            </div>

        </header >
    )
}

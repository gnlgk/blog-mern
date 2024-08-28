import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";

export default function SignUp() {
    const [formData, setFormData] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        // console.log(e.target.value);
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    };

    // console.log(formData);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.email || !formData.password) {
            return setErrorMessage("모든 영역을 채워주세요!");
        }

        try {
            setLoading(true);
            setErrorMessage(null);

            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success === false) {
                return setErrorMessage(data.message);
            }
            setLoading(false);

            if (res.ok) {
                alert("회원가입이 완료되었습니다!");
                navigate("/sign-in");
            }
        } catch (error) {
            setErrorMessage(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen mt-20">
            <h3 className="w-2/5 mx-auto text-center text-3xl py-20 border-y-2 border-b-2">Sign Up</h3>
            <div className="max-w-md mx-auto">
                <form className="flex flex-col space-y-5 mt-5" onSubmit={handleSubmit}>
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="이름"
                            id="username"
                            className="w-full p-3 rounded-sm text-black"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="email"
                            placeholder="이메일"
                            id="email"
                            className="w-full p-3 rounded-sm text-black"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="password"
                            placeholder="비밀번호"
                            id="password"
                            className="w-full p-3 rounded-sm text-black"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            id="passwordcheck"
                            className="w-full p-3 rounded-sm text-black"
                        />
                    </div>

                    {errorMessage && <div className="mt-5 text-red-500">{errorMessage}</div>}
                    <button type="submit" className="p-3 mt-3 bg-blue-600 rounded-sm hover:bg-blue-700" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="pl-3">Loading...</span>
                            </>
                        ) : (
                            "회원가입하기"
                        )}
                    </button>
                    <OAuth />
                </form>

                <div className="flex justify-center mt-10">
                    <span className="mr-2">계정이 있나요? </span>
                    <Link to="/sign-in" className="text-blue-500">
                        로그인하기
                    </Link>
                </div>
            </div>
        </div>
    );
}

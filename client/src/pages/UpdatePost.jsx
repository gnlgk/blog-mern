import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UpdatePost() {
    const [file, setFile] = useState(null);
    const [imageUploadProgress, setImageUploadProgress] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);
    const { postId } = useParams();

    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        try {
            const fetchPost = async () => {
                const res = await fetch(`/api/post/getposts?postId=${postId}`);
                const data = await res.json();

                console.log(data);
                if (!res.ok) {
                    console.log(data.message);
                    setPublishError(data.message);
                    return;
                }
                if (res.ok) {
                    setPublishError(null);
                    setFormData(data.posts[0]);
                }
            };

            fetchPost();
        } catch (error) {
            console.log(error.message);
        }
    }, [postId]);

    const handleUploadImage = async () => {
        try {
            if (!file) {
                setImageUploadError("이미지를 넣어주세요!");
                return;
            }
            setImageUploadError(null);
            const storage = getStorage(app);
            const fileName = new Date().getTime() + "-" + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setImageUploadProgress(progress.toFixed(0));
                },
                (error) => {
                    setImageUploadError("Image upload failed");
                    setImageUploadProgress(null);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        setImageUploadProgress(null);
                        setImageUploadError(null);
                        setFormData({ ...formData, image: downloadURL });
                    });
                }
            );
        } catch (error) {
            setImageUploadError("이미지 업로드 실패");
            setImageUploadProgress(null);
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) {
                setPublishError(data.message);
                return;
            }

            if (res.ok) {
                setPublishError(null);
                navigate(`/post/${data.slug}`);
            }
        } catch (error) {
            setPublishError("무엇인가 잘못된거 같네요! 관리자에게 문의하세요!");
        }
    };

    return (
        <div className="max-w-3xl min-h-screen mx-auto">
            <h1 className="text-3xl text-center my-14">수정하기</h1>
            <form onSubmit={handleSubmit}>
                <div className="flex justify-between mb-4">
                    <input
                        type="text"
                        className="w-4/6 h-10 p-2 rounded-sm text-black"
                        placeholder="타이틀을 작성하세요!"
                        required
                        id="title"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        value={formData.title}
                    />
                    <select
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-2/6 ml-2 h-10 p-2 rounded-sm bg-black border border-white"
                        value={formData.category}
                    >
                        <option value="uncategorized">카테고리를 선택하세요!</option>
                        <option value="javascript">javascript</option>
                        <option value="react.js">react.js</option>
                        <option value="next.js">next.js</option>
                    </select>
                </div>
                <div>
                    <input className="w-4/6 mb-4" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                    <button
                        type="button"
                        className="w-2/6 bg-blue-500 p-1 rounded-full hover:bg-blue-600"
                        onClick={handleUploadImage}
                        disabled={imageUploadProgress}
                    >
                        {imageUploadProgress ? (
                            <div className="p-1 mx-auto">{`${imageUploadProgress || 0}%`}</div>
                        ) : (
                            "이미지 업로드"
                        )}
                    </button>
                </div>
                {imageUploadError && <div color="failure">{imageUploadError}</div>}
                {formData.image && <img src={formData.image} alt="upload" className="object-cover w-full h-72 mb-4" />}

                <ReactQuill
                    theme="snow"
                    placeholder="내용을 적으세요!"
                    className="mb-10 h-72"
                    required
                    onChange={(value) => {
                        setFormData({ ...formData, content: value });
                    }}
                    value={formData.content}
                />

                <button type="submit" className="w-full p-3 mt-4 mb-20 bg-blue-600 rounded-sm hover:bg-blue-700">
                    수정하기
                </button>
                {publishError && <div className="mt-5 mb-20">{publishError}</div>}
            </form>
        </div>
    );
}
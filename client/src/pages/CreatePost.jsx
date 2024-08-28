import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
    const [file, setFile] = useState(null);
    const [imageUploadProgress, setImageUploadProgress] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [formData, setFormData] = useState({});
    const [publishError, setPublishError] = useState(null);

    const navigate = useNavigate();

    const handleUploadImage = async () => {
        try {
            if (!file) {
                setImageUploadError("이미지를 넣어주세요!!!");
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
                    console.log(progress);
                },
                (error) => {
                    setImageUploadError("이미지 업로드 실패!");
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
            setImageUploadProgress(null);
            setImageUploadError("이미지 업로드 실패");
            console.log(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/post/create", {
                method: "POST",
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
            setPublishError("무엇인가 잘못된거ㅏ 같네요! 관리자에게 문의하세요!");
        }
    };

    return (
        <div className="max-w-3xl min-h-screen mx-auto">
            <h1 className="text-3xl text-center my-14">글쓰기</h1>
            <form onSubmit={handleSubmit}>
                <div className="flex justify-between mb-4">
                    <input
                        type="text"
                        placeholder="타이틀을 작성하세요!"
                        required
                        className="w-4/6 h-10 p-2 rounded-sm text-black"
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <select
                        className="w-2/6 ml-2 h-10 p-2 rounded-sm bg-black border border-white"
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                        <option value="uncateorized">카테고리를 선택하세요!</option>
                        <option value="javascript">javascript</option>
                        <option value="react.js">react.js</option>
                        <option value="next.js">next.js</option>
                    </select>
                </div>
                <div>
                    <input className="w-4/6 mb-4" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                    <button
                        type="button"
                        onClick={handleUploadImage}
                        className="w-2/6 bg-blue-500 p-1 rounded-full hover:bg-blue-600"
                        disabled={imageUploadProgress}>
                        {imageUploadProgress ? (
                            <div className="p-1 mx-auto">{`${imageUploadProgress || 0}%`}</div>
                        ) : (
                            "이미지 업로드"
                        )}
                    </button>
                    {imageUploadError && <div className="p-2 bg-red-500 mb-4 rounded-sm">{imageUploadError}</div>}
                    {formData.image && <img src={formData.image} alt="upload" className="object-cover w-72 h-72 mb-4 mx-auto" />}

                    <ReactQuill
                        theme="snow"
                        placeholder="내용을 적어주세요!"
                        required
                        className="h-72 mb-10"
                        onChange={(value) => setFormData({ ...formData, content: value })}
                    />
                    <button type="submit" className="w-full p-3 my-4 bg-blue-600 rounded-sm hover:bg-blue-700">
                        저장하기
                    </button>
                    {publishError && <div className="mt-5">{publishError}</div>}
                </div>
            </form>
        </div>
    );
}

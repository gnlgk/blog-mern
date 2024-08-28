import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";

import {
    updateStart,
    updateSuccess,
    updateFailure,
    deleteUserStart,
    deleteUserSuccess,
    deleteUserFailure,
    signoutSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

export default function DashProfile() {
    const { currentUser, error } = useSelector((state) => state.user);
    const [imageFile, setImageFile] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
    const [imageFileUploadError, setImageFileUploadError] = useState(null);
    const [imageFileUploading, setImageFileUploading] = useState(false);
    const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
    const [updateUserError, setUpdateUserError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // console.log(imageFileUploadProgress, imageFileUploadError);
    const [formData, setFormData] = useState({});

    const filePickerRef = useRef();
    const dispatch = useDispatch();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImageFileUrl(URL.createObjectURL(file));
        }
    };

    // console.log(imageFile, imageFileUrl);

    useEffect(() => {
        if (imageFile) {
            uploadImage();
        }
    }, [imageFile]);

    const uploadImage = async () => {
        // service firebase.storage {
        //     match /b/{bucket}/o {
        //       match /{allPaths=**} {
        //         allow read;
        //         allow write: if
        //         request.resource.size < 1 * 1024 * 1024 &&
        //         request.resource.contentType.matches('image/.*')
        //         }
        //     }
        //   }
        // console.log("uploading image...");

        imageFileUploading(true);
        setImageFileUploadError(null);

        const storage = getStorage(app);
        const fileName = new Date().getTime() + imageFile.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setImageFileUploadProgress(progress.toFixed(0));
            },
            (error) => {
                setImageFileUploadError("이미지는 1메가를 초과할 수 없습니다.");
                setImageFileUploadProgress(null);
                setImageFile(null);
                setImageFileUrl(null);
                setImageFileUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setImageFileUrl(downloadURL);
                    setFormData({ ...formData, profilePicture: downloadURL });
                    setImageFileUploading(false);
                });
            }
        );
    };

    const handleChange = (e) => {
        setFormData((prevFormData) => ({ ...prevFormData, [e.target.id]: e.target.value }));
    };

    // console.log(formData);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateUserError(null);
        setUpdateUserSuccess(null);

        if (Object.keys(formData).length === 0) {
            setUpdateUserError("변경된 부분이 없습니다.");
            return;
        }

        if (imageFileUploading) {
            setUpdateUserError("이미지 업로드 중입니다.");
            return;
        }

        try {
            dispatch(updateStart());

            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            dispatch(updateSuccess(data));
            setUpdateUserSuccess("프로필 업데이트가 성공했습니다.");
        } catch (error) {
            dispatch(updateFailure(error.message));
            setUpdateUserError(error.message);
        }
    };

    const handleDeleteUser = async () => {
        setShowModal(false);
        try {
            dispatch(deleteUserStart());

            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (!res.ok) {
                dispatch(deleteUserFailure(data.message));
            } else {
                dispatch(deleteUserSuccess(data));
                alert("계정이 성공적으로 삭제되었습니다.");
            }
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
        }
    };

    const handleSignout = async () => {
        try {
            const res = await fetch("/api/user/signout", {
                method: "POST",
            });
            const data = await res.json();
            if (!res.ok) {
                console.log(data.message);
            } else {
                dispatch(signoutSuccess());
                alert("로그아웃 되었습니다.");
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <>
            <div className="max-w-lg mx-auto">
                <h1 className="w-full p-12 text-3xl text-center">Profile</h1>
                <form onSubmit={handleSubmit}>
                    <fieldset className="flex flex-col">
                        <input type="file" accept="image/*" onChange={handleImageChange} ref={filePickerRef} hidden />

                        <div
                            className="relative self-center w-32 h-32 cursor-pointer mb-12"
                            onClick={() => filePickerRef.current.click()}
                        >
                            <img
                                className="rounded-full w-full h-full object-cover border-8 border-[lightgray]"
                                src={imageFileUrl || currentUser.profilePicture}
                                alt="user"
                            />
                            {imageFileUploadProgress === !null
                                ? (
                                    <span className="grid place-items-center p-4">{`${imageFileUploadProgress}%`}</span>

                                ) : (
                                    ""
                                )}
                        </div>
                        <input
                            type="text"
                            id="username"
                            placeholder="이름"
                            className="w-full p-3 rounded-sm text-black mt-3"
                            defaultValue={currentUser.username}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            id="email"
                            placeholder="이메일"
                            className="w-full p-3 rounded-sm text-black mt-3"
                            defaultValue={currentUser.email}
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            id="password"
                            placeholder="비밀번호"
                            className="w-full p-3 rounded-sm text-black mt-3"
                            defaultValue="********"
                            onChange={handleChange}
                        />

                        {imageFileUploadError && (
                            <div className="p-3 mt-3 text-center text-red-600 bg-red-700 rounded-sm">
                                {imageFileUploadError}
                            </div>
                        )}
                        {updateUserSuccess && (
                            <div className="p-3 mt-3 text-center text-green-600 bg-green-700 rounded-sm">
                                {updateUserSuccess}
                            </div>
                        )}
                        {updateUserError && (
                            <div className="p-3 mt-3 text-center text-red-600 bg-red-700 rounded-sm">
                                {updateUserError}
                            </div>
                        )}
                        {error && (
                            <div className="p-3 mt-3 text-center text-red-600 bg-red-700 rounded-sm">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="p-3 mt-3 bg-blue-600 rounded-sm hover:bg-blue-700">
                            수정하기
                        </button>

                        {currentUser.isAdmin && (
                            <Link to={"/create-post"}>
                                <button
                                    type="button"
                                    className="w-full p-3 mt-3 text-white bg-slate-800 rounded-sm hover:bg-slate-900"
                                >
                                    글쓰기
                                </button>
                            </Link>
                        )}

                        <div className="flex justify-between mt-3 text-red-500 mb-14">
                            <span className="cursor-pointer hover:text-red-600" onClick={() => setShowModal(true)}>
                                계정 삭제
                            </span>
                            <span className="cursor-pointer hover:text-red-600" onClick={handleSignout}>
                                로그 아웃
                            </span>
                        </div>
                    </fieldset>
                </form>
            </div>

            {showModal && (
                <div className="modal-wrap">
                    <div className="modal">
                        <h3>계정을 정말 삭제하겠습니까?</h3>
                        <button onClick={handleDeleteUser}>그렇다.</button>
                        <button onClick={() => setShowModal(false)}>아니다.</button>
                    </div>
                </div>
            )}
        </>
    );
}

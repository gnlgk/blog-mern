// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "mern-blog-6009e.firebaseapp.com",
    projectId: "mern-blog-6009e",
    storageBucket: "mern-blog-6009e.appspot.com",
    messagingSenderId: "165124695117",
    appId: "1:165124695117:web:d6fb301110deb6319ba804",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

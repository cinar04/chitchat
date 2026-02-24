
import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

loginBtn.addEventListener("click", async () => {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  errorMsg.textContent = "";

  if (!email || !password) {
    errorMsg.textContent = "Email ve şifre gir!";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const q = query(
      collection(db, "users"),
      where("email", "==", email)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      errorMsg.textContent = "Firestore kullanıcı bulunamadı!";
      return;
    }

    const userData = snap.docs[0].data();

    localStorage.setItem("nickname", userData.nickname

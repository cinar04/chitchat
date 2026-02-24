import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { collection, query, where, getDocs }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.login = async function () {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Email ve şifre gir");
    return;
  }

  try {

    // Firebase Auth giriş
    await signInWithEmailAndPassword(auth, email, password);

    // Firestore'da kullanıcıyı email ile bul
    const q = query(
      collection(db, "users"),
      where("email", "==", email)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      alert("Firestore'da kullanıcı bulunamadı");
      return;
    }

    const userData = snap.docs[0].data();

    // loginKey adı değişmiyor!
    localStorage.setItem("nickname", userData.nickname);
    localStorage.setItem("userNo", userData.loginKey);

    window.location.replace("index.html");

  } catch (error) {
    alert("Giriş başarısız: " + error.message);
  }
};

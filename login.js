import { db } from "./firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById("loginBtn").onclick = async () => {

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if(!email || !password){
    document.getElementById("error").innerText="Bilgileri doldur!";
    return;
  }

  const q = query(
    collection(db,"users"),
    where("email","==",email),
    where("password","==",password)
  );

  const snap = await getDocs(q);

  if(snap.empty){
    document.getElementById("error").innerText="Yanlış eposta veya şifre!";
    return;
  }

  const user = snap.docs[0].data();

  localStorage.setItem("nickname", user.nickname);
  localStorage.setItem("userNo", user.userNo);

  window.location.href="index.html";
};
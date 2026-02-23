import { db } from "./firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById("loginBtn").onclick = async () => {
  const key = document.getElementById("loginKey").value;
  const q = query(collection(db,"users"), where("loginKey","==",key));
  const snap = await getDocs(q);

  if(snap.empty){
    document.getElementById("error").innerText="Yanlış anahtar!";
    return;
  }

  snap.forEach(doc=>{
    localStorage.setItem("nickname", doc.data().nickname);
    localStorage.setItem("userNo", doc.data().userNo);
  });

  window.location.href="index.html";
};

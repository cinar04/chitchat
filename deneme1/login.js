import { auth, db } from "./firebase.js"

import {
signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

const btn = document.getElementById("loginBtn")

btn.onclick = async () => {

const email = document.getElementById("email").value.trim()
const password = document.getElementById("password").value.trim()

if(!email || !password){
alert("Bilgileri doldur")
return
}

try{

const cred = await signInWithEmailAndPassword(auth,email,password)

if(!cred.user.emailVerified){
alert("Önce email doğrula!")
return
}

const userDoc = await getDoc(doc(db,"users",cred.user.uid))

const user = userDoc.data()

localStorage.setItem("nickname",user.nickname)
localStorage.setItem("userNo",user.userNo)

location.href="index.html"

}catch(e){
alert(e.message)
}

}
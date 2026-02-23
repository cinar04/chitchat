import { db } from "./firebase.js";
import { collection, addDoc, getDocs, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentRoom="global";

window.login=async function(){
const key=document.getElementById("key").value;
const q=query(collection(db,"users"),where("loginKey","==",key));
const snap=await getDocs(q);
if(snap.empty){alert("Yanlış Anahtar");return;}
snap.forEach(doc=>{
localStorage.nickname=doc.data().nickname;
});
window.location="index.html";
}

window.send=async function(){
const msg=document.getElementById("msg").value;
await addDoc(collection(db,"messages"),{
room:currentRoom,
sender:localStorage.nickname,
content:msg,
createdAt:Date.now()
});
document.getElementById("msg").value="";
}

window.createGroup=async function(){
const name=prompt("Grup adı?");
const code=Math.floor(100000+Math.random()*900000).toString();
await addDoc(collection(db,"groups"),{
name:name,
code:code,
members:[localStorage.nickname]
});
alert("Grup kodu: "+code);
}

window.joinGroup=function(){
const code=prompt("Kod gir");
currentRoom=code;
loadMessages();
}

window.toggleMenu=function(){
document.getElementById("menu").classList.toggle("hidden");
}

window.toggleTheme=function(){
document.body.classList.toggle("dark");
document.body.classList.toggle("light");
}

function loadMessages(){
onSnapshot(collection(db,"messages"),(snapshot)=>{
document.getElementById("chat").innerHTML="";
snapshot.forEach(doc=>{
const data=doc.data();
if(data.room===currentRoom){
const div=document.createElement("div");
div.className="message";
div.innerText=data.sender+": "+data.content;
document.getElementById("chat").appendChild(div);
}
});
});
}

if(window.location.pathname.includes("index.html")){
loadMessages();
}

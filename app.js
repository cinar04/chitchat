import { db } from "./firebase.js";
import { collection, addDoc, getDocs, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentRoom=null;
let currentUser=localStorage.nickname;
let currentUserNo=null;

init();

async function init(){
const q=query(collection(db,"users"),where("nickname","==",currentUser));
const snap=await getDocs(q);
snap.forEach(doc=>{
currentUserNo=doc.data().userNo;
});
loadGroups();
}

async function loadGroups(){
const snap=await getDocs(collection(db,"groups"));
document.getElementById("groupList").innerHTML="";
snap.forEach(doc=>{
const data=doc.data();
if(data.members.includes(currentUserNo)){
const div=document.createElement("div");
div.innerText=data.name;
div.onclick=()=>selectGroup(data.code,data.name);
document.getElementById("groupList").appendChild(div);
}
});
}

window.selectGroup=function(code,name){
currentRoom=code;
document.getElementById("chatHeader").innerText=name;
loadMessages();
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

window.send=async function(){
if(!currentRoom)return alert("Grup seç");
const msg=document.getElementById("msg").value;
await addDoc(collection(db,"messages"),{
room:currentRoom,
sender:currentUser,
content:msg,
createdAt:Date.now()
});
document.getElementById("msg").value="";
}

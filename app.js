import { db } from "./firebase.js";
import { collection, addDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentRoom=null;
let currentUser=localStorage.nickname;

loadGroups();

async function loadGroups(){
const snap=await getDocs(collection(db,"groups"));
snap.forEach(doc=>{
const data=doc.data();
const div=document.createElement("div");
div.innerText=data.name+" ("+data.code+")";
div.onclick=()=>selectGroup(data.code,data.name);
document.getElementById("groupList").appendChild(div);
});
}

window.createGroup=async function(){
const name=prompt("Grup adı?");
const code=Math.floor(100000+Math.random()*900000).toString();
await addDoc(collection(db,"groups"),{
name:name,
code:code
});
alert("Grup kodu: "+code);
loadGroups();
}

window.joinGroup=function(){
alert("Gruba katılmak için kodu bilmen yeterli. Listede varsa tıkla.");
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
if(!currentRoom)return alert("Önce grup seç");
const msg=document.getElementById("msg").value;
await addDoc(collection(db,"messages"),{
room:currentRoom,
sender:currentUser,
content:msg,
createdAt:Date.now()
});
document.getElementById("msg").value="";
}

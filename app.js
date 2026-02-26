import { db } from "./firebase.js";
import { collection, query, where, getDocs, addDoc, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

if (!window.matchMedia('(display-mode: standalone)').matches) {
alert("Lütfen ana ekrana ekleyin.");
}

let currentGroupId=null;
let unsubscribe=null;

const groupList=document.getElementById("groupList");
const groupTitle=document.getElementById("groupTitle");
const messagesDiv=document.getElementById("messages");
const sendBtn=document.getElementById("sendBtn");
const messageInput=document.getElementById("messageInput");
const mobileMenu=document.getElementById("mobileMenu");
const app=document.getElementById("app");
const backBtn=document.getElementById("backBtn");
const logoutBtn=document.getElementById("logoutBtn");

logoutBtn.onclick=()=>{localStorage.clear();location.href="login.html";};
backBtn.onclick=()=>{app.style.display="none";mobileMenu.style.display="flex";};

async function loadGroups(){
const q=query(collection(db,"groups"),where("members","array-contains",Number(localStorage.getItem("userNo"))));
const snap=await getDocs(q);
groupList.innerHTML="";
snap.forEach(doc=>{
const data=doc.data();
const div=document.createElement("div");
div.className="group-item";
div.textContent=data.name;
div.onclick=()=>{
document.querySelectorAll(".group-item").forEach(g=>g.classList.remove("active"));
div.classList.add("active");
selectGroup(doc.id,data.name);
mobileMenu.style.display="none";
app.style.display="flex";
};
groupList.appendChild(div);
});
}

function selectGroup(groupId,name){
currentGroupId=groupId;
groupTitle.textContent=name;
if(unsubscribe)unsubscribe();
const q=query(collection(db,"groups",groupId,"messages"),orderBy("createdAt"));
unsubscribe=onSnapshot(q,snap=>{
messagesDiv.innerHTML="";
snap.forEach(doc=>{
const data=doc.data();
const bubble=document.createElement("div");
bubble.className="bubble "+(String(data.userNo)===String(localStorage.getItem("userNo"))?"me":"other");
bubble.innerHTML="<div>"+data.nickname+"</div><div>"+data.text+"</div>";
messagesDiv.appendChild(bubble);
});
messagesDiv.scrollTop=messagesDiv.scrollHeight;
});
}

sendBtn.onclick=async()=>{
if(!currentGroupId)return;
const text=messageInput.value.trim();
if(!text)return;
await addDoc(collection(db,"groups",currentGroupId,"messages"),{
text:text,
nickname:localStorage.getItem("nickname"),
userNo:Number(localStorage.getItem("userNo")),
createdAt:Date.now()
});
messageInput.value="";
};

loadGroups();

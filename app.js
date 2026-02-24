import { db } from "./firebase.js";
import {
collection,
addDoc,
getDocs,
query,
where,
onSnapshot,
orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const nickname = localStorage.getItem("nickname");
const userNo = localStorage.getItem("userNo");

if(!nickname){
  window.location.href="login.html";
}

let currentGroupId=null;

async function loadGroups(){
  const q = query(
    collection(db,"groups"),
    where("members","array-contains",Number(userNo))
  );

  const snap = await getDocs(q);
  const groupList = document.getElementById("groupList");
  groupList.innerHTML="";

  snap.forEach(doc=>{
    const div=document.createElement("div");
    div.className="groupItem";
    div.innerText=doc.data().name;
    div.onclick=()=>selectGroup(doc.id,doc.data().name);
    groupList.appendChild(div);
  });
}

function selectGroup(id,name){
  currentGroupId=id;
  document.getElementById("chatHeader").innerText=name;
  document.getElementById("messageBox").classList.remove("hidden");
  loadMessages();
}

function loadMessages(){
  const q=query(
    collection(db,"groups",currentGroupId,"messages"),
    orderBy("createdAt")
  );

  onSnapshot(q,(snap)=>{
    const messages=document.getElementById("messages");
    messages.innerHTML="";
    snap.forEach(doc=>{
      const data=doc.data();
      const div=document.createElement("div");
      div.classList.add("message");
      if(data.userNo==userNo){
        div.classList.add("me");
      }else{
        div.classList.add("other");
      }
      div.innerText=data.nickname+": "+data.text;
      messages.appendChild(div);
    });
  });
}

document.getElementById("sendBtn").onclick=async ()=>{
  const text=document.getElementById("messageInput").value;
  if(!text||!currentGroupId)return;

  await addDoc(collection(db,"groups",currentGroupId,"messages"),{
    text:text,
    nickname:nickname,
    userNo:Number(userNo),
    createdAt:Date.now()
  });

  document.getElementById("messageInput").value="";
};

loadGroups();

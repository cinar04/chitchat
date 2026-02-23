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

let currentUser = null;
let currentGroupId = null;

const loginBtn = document.getElementById("loginBtn");
const groupList = document.getElementById("groupList");
const messagesDiv = document.getElementById("messages");
const messageBox = document.getElementById("messageBox");
const sendBtn = document.getElementById("sendBtn");

loginBtn.onclick = async () => {
  const username = document.getElementById("username").value;
  const userno = document.getElementById("userno").value;
  currentUser = { username, userno };
  document.getElementById("login").classList.add("hidden");
  document.getElementById("chatApp").classList.remove("hidden");
  loadGroups();
};

async function loadGroups(){
  const q = query(
    collection(db,"groups"),
    where("members","array-contains",currentUser.userno)
  );
  const snapshot = await getDocs(q);
  groupList.innerHTML = "";
  snapshot.forEach(doc=>{
    const div = document.createElement("div");
    div.className="groupItem";
    div.innerText = doc.data().name;
    div.onclick = ()=>selectGroup(doc.id,doc.data().name);
    groupList.appendChild(div);
  });
}

function selectGroup(id,name){
  currentGroupId = id;
  document.getElementById("chatHeader").innerText=name;
  messageBox.classList.remove("hidden");
  loadMessages();
}

function loadMessages(){
  const q = query(
    collection(db,"groups",currentGroupId,"messages"),
    orderBy("createdAt")
  );
  onSnapshot(q,(snapshot)=>{
    messagesDiv.innerHTML="";
    snapshot.forEach(doc=>{
      const data = doc.data();
      const msg = document.createElement("div");
      msg.classList.add("message");
      if(data.userno === currentUser.userno){
        msg.classList.add("me");
      }else{
        msg.classList.add("other");
      }
      msg.innerText = data.username + ": " + data.text;
      messagesDiv.appendChild(msg);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

sendBtn.onclick = async ()=>{
  const text = document.getElementById("messageInput").value;
  if(!text) return;
  await addDoc(collection(db,"groups",currentGroupId,"messages"),{
    text:text,
    username:currentUser.username,
    userno:currentUser.userno,
    createdAt:Date.now()
  });
  document.getElementById("messageInput").value="";
};

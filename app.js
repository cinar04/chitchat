import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userNo = localStorage.getItem("userNo");
const nickname = localStorage.getItem("nickname");

// LOGIN LOOP FIX
if (!userNo || !nickname) {
  window.location.href = "login.html";
}

let currentGroupId = null;

// GRUPLARI YÜKLE
async function loadGroups() {
  const q = query(
    collection(db, "groups"),
    where("members", "array-contains", Number(userNo))
  );

  const snap = await getDocs(q);
  const groupList = document.getElementById("groupList");
  groupList.innerHTML = "";

  snap.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.className = "group-item";
    div.innerText = data.name;
    div.onclick = () => selectGroup(doc.id, data.name);

    groupList.appendChild(div);
  });
}

loadGroups();

// GRUP SEÇ
function selectGroup(groupId, groupName) {
  currentGroupId = groupId;

  document.getElementById("chatHeader").innerText = groupName;
  document.getElementById("messageBox").classList.remove("hidden");

  listenMessages();
}

// MESAJLARI DİNLE
function listenMessages() {
  const messagesRef = collection(db, "groups", currentGroupId, "messages");
  const q = query(messagesRef, orderBy("createdAt"));

  onSnapshot(q, snapshot => {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      const bubble = document.createElement("div");
      bubble.classList.add("bubble");

      if (data.userNo == userNo) {
        bubble.classList.add("me");
      } else {
        bubble.classList.add("other");
      }

      bubble.innerHTML = `
        <div class="name">${data.nickname}</div>
        <div>${data.text}</div>
      `;

      messagesDiv.appendChild(bubble);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// MESAJ GÖNDER
document.getElementById("sendBtn").addEventListener("click", async () => {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text || !currentGroupId) return;

  await addDoc(
    collection(db, "groups", currentGroupId, "messages"),
    {
      text: text,
      nickname: nickname,
      userNo: Number(userNo),
      createdAt: Date.now()
    }
  );

  input.value = "";
});

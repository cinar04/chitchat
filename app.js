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

if (!userNo || !nickname) {
  window.location.replace("login.html");
}

let currentGroupId = null;
let unsubscribe = null;

const groupList = document.getElementById("groupList");
const groupTitle = document.getElementById("groupTitle");
const messagesDiv = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");

/* LOGOUT */

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("userNo");
  localStorage.removeItem("nickname");
  window.location.href = "login.html";
});

/* GRUPLARI YÜKLE */

async function loadGroups() {
  const q = query(
    collection(db, "groups"),
    where("members", "array-contains", Number(userNo))
  );

  const snap = await getDocs(q);
  groupList.innerHTML = "";

  if (snap.empty) {
    groupList.innerHTML = "<div style='opacity:0.6'>Grup yok</div>";
    return;
  }

  snap.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.className = "group-item";
    div.textContent = data.name;

    div.addEventListener("click", () => {
      document.querySelectorAll(".group-item").forEach(g =>
        g.classList.remove("active")
      );

      div.classList.add("active");

      selectGroup(doc.id, data.name);
    });

    groupList.appendChild(div);
  });
}

/* GRUP SEÇ */

function selectGroup(groupId, groupName) {
  currentGroupId = groupId;

  groupTitle.textContent = groupName;

  if (unsubscribe) unsubscribe();

  const messagesRef = collection(db, "groups", groupId, "messages");
  const q = query(messagesRef, orderBy("createdAt"));

  unsubscribe = onSnapshot(q, snapshot => {
    messagesDiv.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();

      const bubble = document.createElement("div");
      bubble.className = "bubble";

      if (String(data.userNo) === String(userNo)) {
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

/* MESAJ GÖNDER */

sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();

  if (!text) return;

  if (!currentGroupId) {
    alert("Önce grup seç");
    return;
  }

  await addDoc(
    collection(db, "groups", currentGroupId, "messages"),
    {
      text: text,
      nickname: nickname,
      userNo: Number(userNo),
      createdAt: Date.now()
    }
  );

  messageInput.value = "";
});

/* ENTER İLE GÖNDER */

messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

loadGroups();
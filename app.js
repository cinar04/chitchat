import { db } from "./firebase.js"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

const email = localStorage.getItem("email")
const nickname = localStorage.getItem("nickname")

// Nickname yoksa setup sayfasına yönlendir
if (!nickname || nickname.trim() === "") {
  window.location.replace("setup.html")
}

const groupScreen = document.getElementById("groupScreen")
const chatScreen = document.getElementById("chatScreen")

const groupList = document.getElementById("groupList")
const groupTitle = document.getElementById("groupTitle")
const userRoleSpan = document.getElementById("userRole")

const messagesDiv = document.getElementById("messages")

const messageInput = document.getElementById("messageInput")
const sendBtn = document.getElementById("sendBtn")

const backBtn = document.getElementById("backBtn")
const createGroupBtn = document.getElementById("createGroupBtn")
const settingsBtn = document.getElementById("settingsBtn")

let currentGroup = null
let currentUserRole = null
let unsubscribe = null

async function loadGroups() {

  // memberEmails dizisinde string olarak sorgula
  const q = query(
    collection(db, "groups"),
    where("memberEmails", "array-contains", email)
  )

  const snap = await getDocs(q)

  groupList.innerHTML = ""

  snap.forEach(d => {

    const data = d.data()

    // Rol bilgisini members obje dizisinden al
    const userMember = (data.members || []).find(m => m.email === email)
    const role = userMember ? userMember.role : "normal"

    const div = document.createElement("div")
    div.className = "groupItem"
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>${data.name}</span>
        <span style="font-size: 12px; color: #94a3b8; background: #374151; padding: 4px 10px; border-radius: 10px;">
          ${role === "admin" ? "👑 Admin" : "👤 Normal"}
        </span>
      </div>
    `
    div.style.cursor = "pointer"
    div.onclick = () => openGroup(d.id, data.name, role)
    groupList.appendChild(div)

  })

}

function openGroup(id, name, userRole) {

  currentGroup = id
  currentUserRole = userRole

  groupTitle.innerText = name
  userRoleSpan.innerText = userRole === "admin" ? "👑 Admin" : "👤 Normal Üye"
  userRoleSpan.style.color = userRole === "admin" ? "#fbbf24" : "#94a3b8"

  groupScreen.classList.add("hidden")
  chatScreen.classList.remove("hidden")

  settingsBtn.classList.toggle("hidden", currentUserRole !== "admin")

  loadMessages()

}

backBtn.onclick = () => {
  chatScreen.classList.add("hidden")
  groupScreen.classList.remove("hidden")
  if (unsubscribe) unsubscribe()
  loadGroups()
}

function loadMessages() {

  if (unsubscribe) unsubscribe()

  const q = query(
    collection(db, "groups", currentGroup, "messages"),
    orderBy("createdAt")
  )

  unsubscribe = onSnapshot(q, snap => {

    messagesDiv.innerHTML = ""

    snap.forEach(d => {

      const data = d.data()

      const date = new Date(data.createdAt)
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      const timeString = `${hours}:${minutes}`

      const div = document.createElement("div")
      div.className = "bubble"
      div.classList.add(data.email === email ? "me" : "other")

      const displayName = data.nickname && data.nickname.trim() !== ""
        ? data.nickname
        : (data.email ? data.email.split("@")[0] : "Kullanıcı")

      div.innerHTML = `
        <div class="message-header">
          <span class="sender-name">${displayName}</span>
          <span class="message-time">${timeString}</span>
        </div>
        <div class="message-text">${data.text}</div>
      `

      messagesDiv.appendChild(div)

    })

    messagesDiv.scrollTop = messagesDiv.scrollHeight

  })

}

sendBtn.onclick = async () => {

  const text = messageInput.value.trim()
  if (!text) return

  const senderNickname = nickname && nickname.trim() !== ""
    ? nickname
    : (email ? email.split("@")[0] : "Kullanıcı")

  await addDoc(
    collection(db, "groups", currentGroup, "messages"),
    {
      text,
      email,
      nickname: senderNickname,
      createdAt: Date.now()
    }
  )

  messageInput.value = ""

}

createGroupBtn.onclick = async () => {

  const name = prompt("Grup adı")
  if (!name) return

  // memberEmails: sorgulama için string dizisi
  // members: rol bilgisi için obje dizisi
  await addDoc(collection(db, "groups"), {
    name,
    memberEmails: [email],
    members: [{ email, role: "admin" }]
  })

  loadGroups()

}

settingsBtn.onclick = async () => {

  const newUserEmail = prompt("Eklenecek kullanıcının emaili")
  if (!newUserEmail) return

  const roleChoice = prompt("Rol seçin:\n1 = Admin\n2 = Normal\n(1 veya 2 girin)", "2")
  if (!roleChoice) return

  const selectedRole = roleChoice === "1" ? "admin" : "normal"

  const groupRef = doc(db, "groups", currentGroup)

  try {

    await updateDoc(groupRef, {
      memberEmails: arrayUnion(newUserEmail),
      members: arrayUnion({ email: newUserEmail, role: selectedRole })
    })

    alert(`${newUserEmail} ${selectedRole === "admin" ? "Admin" : "Normal"} olarak eklendi!`)

  } catch (e) {
    alert("Hata: " + e.message)
  }

}

loadGroups()

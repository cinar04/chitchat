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
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

const email = localStorage.getItem("email")

const groupScreen = document.getElementById("groupScreen")
const chatScreen = document.getElementById("chatScreen")

const groupList = document.getElementById("groupList")
const groupTitle = document.getElementById("groupTitle")

const messagesDiv = document.getElementById("messages")

const messageInput = document.getElementById("messageInput")
const sendBtn = document.getElementById("sendBtn")

const backBtn = document.getElementById("backBtn")

const createGroupBtn = document.getElementById("createGroupBtn")

const settingsBtn = document.getElementById("settingsBtn")

let currentGroup = null
let owner = null
let unsubscribe = null

async function loadGroups() {
  
  const q = query(
    collection(db, "groups"),
    where("members", "array-contains", email)
  )
  
  const snap = await getDocs(q)
  
  groupList.innerHTML = ""
  
  snap.forEach(d => {
    
    const data = d.data()
    
    const div = document.createElement("div")
    
    div.className = "groupItem"
    
    div.innerText = data.name
    
    div.onclick = () => {
      openGroup(d.id, data.name, data.owner)
    }
    
    groupList.appendChild(div)
    
  })
  
}

function openGroup(id, name, groupOwner) {
  
  currentGroup = id
  owner = groupOwner
  
  groupTitle.innerText = name
  
  groupScreen.classList.add("hidden")
  chatScreen.classList.remove("hidden")
  
  if (owner === email) {
    settingsBtn.classList.remove("hidden")
  } else {
    settingsBtn.classList.add("hidden")
  }
  
  loadMessages()
  
}

backBtn.onclick = () => {
  
  chatScreen.classList.add("hidden")
  groupScreen.classList.remove("hidden")
  
  if (unsubscribe) unsubscribe()
  
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
      
      const div = document.createElement("div")
      
      div.className = "bubble"
      
      if (data.email === email) {
        div.classList.add("me")
      } else {
        div.classList.add("other")
      }
      
      div.innerText = data.text
      
      messagesDiv.appendChild(div)
      
    })
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight
    
  })
  
}

sendBtn.onclick = async () => {
  
  const text = messageInput.value.trim()
  
  if (!text) return
  
  await addDoc(
    collection(db, "groups", currentGroup, "messages"),
    {
      text: text,
      email: email,
      createdAt: Date.now()
    }
  )
  
  messageInput.value = ""
  
}

createGroupBtn.onclick = async () => {
  
  const name = prompt("Grup adı")
  
  if (!name) return
  
  await addDoc(
    collection(db, "groups"),
    {
      name: name,
      owner: email,
      members: [email]
    }
  )
  
  loadGroups()
  
}

settingsBtn.onclick = async () => {
  
  const newUser = prompt("Eklenecek kullanıcının emaili")
  
  if (!newUser) return
  
  const groupRef = doc(db, "groups", currentGroup)
  
  const groupSnap = await getDocs(query(collection(db, "groups")))
  
  const group = groupSnap.docs.find(d => d.id === currentGroup)
  
  const data = group.data()
  
  data.members.push(newUser)
  
  await updateDoc(groupRef, {
    members: data.members
  })
  
  alert("Kullanıcı eklendi")
  
}

loadGroups()
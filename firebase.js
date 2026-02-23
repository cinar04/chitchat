import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
apiKey: "BURAYA_API_KEY",
authDomain: "BURAYA_AUTH_DOMAIN",
projectId: "BURAYA_PROJECT_ID",
storageBucket: "BURAYA_STORAGE_BUCKET",
messagingSenderId: "BURAYA_MSG_ID",
appId: "BURAYA_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

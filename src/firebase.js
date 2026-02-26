import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";



export const firebaseConfig = {
  apiKey: "AIzaSyCyyFkpCqDK4X5Tog9fktZU-JmktTYMhrI",
  authDomain: "e-list-74d99.firebaseapp.com",
  projectId: "e-list-74d99",
  storageBucket: "e-list-74d99.appspot.com",
  messagingSenderId: "1049929657317",
  appId: "1:1049929657317:web:d9381da0bb6e01838b5d0c",
  measurementId: "G-D7YBZ9JZWG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDlXvKkrruuTPjXIzpgjuWrXC9kSHKUwQM",
    authDomain: "mentorapp-4727d.firebaseapp.com",
    projectId: "mentorapp-4727d",
    storageBucket: "mentorapp-4727d.firebasestorage.app",
    messagingSenderId: "375811992772",
    appId: "1:375811992772:web:aff9ef689b3457a6512d91",
    measurementId: "G-60JB5VDZ04"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
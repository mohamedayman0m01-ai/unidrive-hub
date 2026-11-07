import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// إعدادات مشروعك السليمة
const firebaseConfig = {
  apiKey: "AIzaSyCFDc9OlhHp1CmLW3ocI_lpiRwIUC0RG3o", 
  authDomain: "unidrive-hub.firebaseapp.com",
  projectId: "unidrive-hub",
  storageBucket: "unidrive-hub.firebasestorage.app",
  messagingSenderId: "760919407450",
  appId: "1:760919407450:web:ae138b5a51bd3fe222d163"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// جلب عناصر واجهة المستخدم
const loginEmailInput = document.getElementById('login-user');
const loginPasswordInput = document.getElementById('login-pass');
const loginBtn = document.getElementById('login-btn');

const signupEmailInput = document.getElementById('reg-user');
const signupPasswordInput = document.getElementById('reg-pass');
const signupNameInput = document.getElementById('reg-name');
const signupBtn = document.getElementById('signup-btn');

// --- البريد الإلكتروني المعتمد للأدمن ---
const ADMIN_EMAIL = "modi572008@gmail.com";

// 1. برمجة زر "تسجيل الدخول"
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        if(!email || !password) {
            alert("يرجى إدخال البريد وكلمة المرور");
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                let role = 'student';
                if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                    role = 'admin';
                }

                let found = studentsList.find(s => String(s.id).toLowerCase() === email.toLowerCase());
                if (!found) {
                    found = { id: email, name: email.split('@')[0], role: role, xp: role === 'admin' ? 1000 : 0 };
                    studentsList.push(found);
                    saveData();
                }
                
                currentUser = {
                    ...found,
                    role: role,
                    studied: found.studied || [],
                    fileScores: found.fileScores || {},
                    quizScores: found.quizScores || {},
                    bookmarks: found.bookmarks || [],
                    quizzesDone: found.quizzesDone || [],
                    tasksDone: found.tasksDone || []
                };
                
                if (currentUser.role === 'admin') {
                    enterPlatform("أهلاً بك يا بطل (الأدمن) في لوحة التحكم الخاصة بك! 🚀");
                } else {
                    enterPlatform("تم تسجيل الدخول بنجاح! أهلاً بك.");
                }
            })
            .catch((error) => {
                alert("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
            });
    });
}

// 2. برمجة زر "إنشاء الحساب"
if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        const email = signupEmailInput.value.trim();
        const password = signupPasswordInput.value.trim();
        const name = signupNameInput ? signupNameInput.value.trim() : "طالب جديد";

        if(!email || !password) {
            alert("يرجى إدخال البريد وكلمة المرور");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                let role = 'student';
                if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                    role = 'admin';
                }

                const newSt = { 
                    id: email, 
                    name: name, 
                    pass: password, 
                    role: role, 
                    xp: 50, 
                    studied: [], fileScores: {}, quizScores: {}, bookmarks: [], quizzesDone: [], tasksDone: [] 
                };
                
                const idx = studentsList.findIndex(s => String(s.id).toLowerCase() === email.toLowerCase());
                if (idx >= 0) studentsList[idx] = newSt;
                else studentsList.push(newSt);
                saveData();
                
                currentUser = newSt;
                
                enterPlatform('🎉 تم إنشاء الحساب بنجاح! حصلت على +50 XP');
            })
            .catch((error) => {
                alert("حدث خطأ أثناء إنشاء الحساب: " + error.message);
            });
    });
}

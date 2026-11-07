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
const signupNameInput = document.getElementById('reg-name'); // لجلب اسم الطالب
const signupBtn = document.getElementById('signup-btn');

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
                // --- السطر السحري لربط فايربيز بواجهة المواد الخاصة بك ---
                
                // البحث عن بيانات الطالب محلياً أو إنشاء ملف جديد له
                let found = studentsList.find(s => String(s.id).toLowerCase() === email.toLowerCase());
                if (!found) {
                    found = { id: email, name: email.split('@')[0], role: 'student', xp: 0 };
                    studentsList.push(found);
                    saveData();
                }
                
                // تفعيل حساب الطالب في المنصة
                currentUser = {
                    ...found,
                    role: 'student',
                    studied: found.studied || [],
                    fileScores: found.fileScores || {},
                    quizScores: found.quizScores || {},
                    bookmarks: found.bookmarks || [],
                    quizzesDone: found.quizzesDone || [],
                    tasksDone: found.tasksDone || []
                };
                
                // تشغيل دالة بناء المواد الأصلية
                enterPlatform("تم تسجيل الدخول بنجاح! أهلاً بك.");
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
                // --- إعداد حساب الطالب الجديد داخل المنصة ---
                const newSt = { 
                    id: email, 
                    name: name, 
                    pass: password, 
                    role: 'student', 
                    xp: 50, 
                    studied: [], fileScores: {}, quizScores: {}, bookmarks: [], quizzesDone: [], tasksDone: [] 
                };
                
                const idx = studentsList.findIndex(s => String(s.id).toLowerCase() === email.toLowerCase());
                if (idx >= 0) studentsList[idx] = newSt;
                else studentsList.push(newSt);
                saveData();
                
                currentUser = newSt;
                
                // تشغيل وبناء الموقع وإظهار المواد
                enterPlatform('🎉 تم إنشاء الحساب بنجاح! حصلت على +50 XP');
            })
            .catch((error) => {
                alert("حدث خطأ أثناء إنشاء الحساب: " + error.message);
            });
    });
}
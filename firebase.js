import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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

const loginEmailInput = document.getElementById('login-user');
const loginPasswordInput = document.getElementById('login-pass');
const loginBtn = document.getElementById('login-btn');

const signupEmailInput = document.getElementById('reg-user');
const signupPasswordInput = document.getElementById('reg-pass');
const signupNameInput = document.getElementById('reg-name');
const signupBtn = document.getElementById('signup-btn');

const ADMIN_EMAIL = "modi572008@gmail.com";

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault(); // يمنع تحديث الصفحة
        
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        if(!email || !password) {
            alert("يرجى إدخال البريد وكلمة المرور");
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                const userRole = isAdmin ? 'admin' : 'student';

                currentUser = {
                    id: email,
                    name: isAdmin ? "المشرف (Admin)" : email.split('@')[0],
                    role: userRole,
                    xp: 9999,
                    studied: [],
                    fileScores: {},
                    quizScores: {},
                    bookmarks: [],
                    quizzesDone: [],
                    tasksDone: []
                };
                
                if (isAdmin || userRole === 'admin' || email.toLowerCase() === "modi572008@gmail.com") {
                    const authView = document.getElementById('auth-view');
                    if(authView) authView.style.display = 'none';
                    
                    const appView = document.getElementById('app-view');
                    if(appView) appView.style.display = 'block';

                    document.querySelectorAll('.admin-only, [data-admin]').forEach(el => el.style.display = 'block');

                    alert("أهلاً بك يا باشمهندس محمد (الأدمن) في لوحة التحكم! 🚀");
                    
                    if(typeof enterPlatform === 'function') {
                        enterPlatform("أهلاً بك يا أدمن");
                    }
                } else {
                    enterPlatform("تم تسجيل الدخول بنجاح!");
                }
            })
            .catch((error) => {
                alert("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
            });
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault(); // يمنع تحديث الصفحة
        
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
                
                // هنا تفترض وجود مصفوفة ودوال من ملفات أخرى مثل enterPlatform
                // قم بتعريفها أو التأكد من استدعائها بشكل صحيح
                if(typeof studentsList !== 'undefined') {
                    const idx = studentsList.findIndex(s => String(s.id).toLowerCase() === email.toLowerCase());
                    if (idx >= 0) studentsList[idx] = newSt;
                    else studentsList.push(newSt);
                }
                if(typeof saveData === 'function') saveData();
                
                currentUser = newSt;
                
                if(typeof enterPlatform === 'function') {
                    enterPlatform('🎉 تم إنشاء الحساب بنجاح!');
                }
            })
            .catch((error) => {
                alert("حدث خطأ أثناء إنشاء الحساب: " + error.message);
            });
    });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// إضافة مكتبة التخزين لرفع ملفات PDF
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
const storage = getStorage(app); // تفعيل التخزين

const loginEmailInput = document.getElementById('login-user');
const loginPasswordInput = document.getElementById('login-pass');
const loginBtn = document.getElementById('login-btn');

const signupEmailInput = document.getElementById('reg-user');
const signupPasswordInput = document.getElementById('reg-pass');
const signupNameInput = document.getElementById('reg-name');
const signupBtn = document.getElementById('signup-btn');

const ADMIN_EMAIL = "modi572008@gmail.com";

// =======================================================
// 1. مراقبة حالة الدخول (عشان الموقع ميخرجكش لما تعمل ريفرش)
// =======================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        // لو المستخدم مسجل دخول بالفعل
        const email = user.email;
        const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const userRole = isAdmin ? 'admin' : 'student';

        // إعادة بناء بيانات المستخدم وجعلها عامة (Global)
        window.currentUser = {
            id: email,
            name: isAdmin ? "المشرف (Admin)" : email.split('@')[0],
            role: userRole,
            xp: 9999,
            studied: [], fileScores: {}, quizScores: {}, bookmarks: [], quizzesDone: [], tasksDone: []
        };

        // إخفاء شاشة التسجيل وإظهار المنصة
        const authView = document.getElementById('auth-view');
        if(authView) authView.style.display = 'none';
        
        const appView = document.getElementById('app-view');
        if(appView) appView.style.display = 'block';

        // إظهار زراير الأدمن لو كان هو المشرف
        if (isAdmin || userRole === 'admin') {
            document.querySelectorAll('.admin-only, [data-admin]').forEach(el => el.style.display = 'block');
        }
    } else {
        // لو مش مسجل دخول، اظهر شاشة التسجيل فقط
        const authView = document.getElementById('auth-view');
        if(authView) authView.style.display = 'block';
        
        const appView = document.getElementById('app-view');
        if(appView) appView.style.display = 'none';
    }
});

// =======================================================
// 2. زر تسجيل الدخول
// =======================================================
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        if(!email || !password) {
            alert("يرجى إدخال البريد وكلمة المرور");
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                if (isAdmin) {
                    alert("أهلاً بك يا باشمهندس محمد (الأدمن) في لوحة التحكم! 🚀");
                }
                
                if(typeof enterPlatform === 'function') {
                    enterPlatform("تم تسجيل الدخول بنجاح");
                }
            })
            .catch((error) => {
                alert("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
            });
    });
}

// =======================================================
// 3. زر إنشاء حساب جديد
// =======================================================
if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        
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
                
                if(typeof studentsList !== 'undefined') {
                    const idx = studentsList.findIndex(s => String(s.id).toLowerCase() === email.toLowerCase());
                    if (idx >= 0) studentsList[idx] = newSt;
                    else studentsList.push(newSt);
                }
                if(typeof saveData === 'function') saveData();
                
                window.currentUser = newSt;
                
                if(typeof enterPlatform === 'function') {
                    enterPlatform('🎉 تم إنشاء الحساب بنجاح!');
                }
            })
            .catch((error) => {
                alert("حدث خطأ أثناء إنشاء الحساب: " + error.message);
            });
    });
}

// =======================================================
// 4. كود رفع ملفات PDF مباشرة لفايربيز
// =======================================================
const pdfFileInput = document.getElementById('pdf-file-input');
const uploadPdfBtn = document.getElementById('upload-pdf-btn');
const uploadStatus = document.getElementById('upload-status');

if (uploadPdfBtn && pdfFileInput) {
    uploadPdfBtn.addEventListener('click', () => {
        const file = pdfFileInput.files[0];
        
        if (!file) {
            alert("يرجى اختيار ملف PDF أولاً من جهازك!");
            return;
        }

        if(uploadStatus) uploadStatus.innerText = "جاري الرفع... الرجاء الانتظار ⏳";
        
        // رفع الملف لفايربيز
        const storageRef = ref(storage, 'pdfs/' + file.name);

        uploadBytes(storageRef, file).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                if(uploadStatus) uploadStatus.innerText = "✅ تم الرفع بنجاح!";
                alert("تم رفع المحاضرة بنجاح!\nالرابط المباشر للملف:\n" + downloadURL);
            });
        }).catch((error) => {
            if(uploadStatus) uploadStatus.innerText = "❌ حدث خطأ أثناء الرفع.";
            console.error(error);
        });
    });
}

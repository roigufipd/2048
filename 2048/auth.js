import { 
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    initializeUserData,
} from "./firebase-config.js";


function showMessage(elementId, message,isError = true) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.add("visible");

    if (isError){
        setTimeout(() => {
            element.classList.remove("visible");
        }, 3000);
    }
}

window.login = async function() {
const email = document.getElementById("login-email").value;
const password = document.getElementById("login-password").value;
const loginButton = document.querySelector("#login-form .btn");

try {
    loginButton.disabled = true;
    loginButton.textContent = "Logging you in...";

    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";

} catch (error) {
    showMessage("loginError", "Incorrect email or password. Please try again.");
} finally {
    loginButton.disabled = false;
    loginButton.textContent = "Login to 2048";
}
};


window.register = async function() {
const email = document.getElementById("register-email").value;     
const password = document.getElementById("register-password").value;
const registerButton = document.querySelector("#register-form .btn");

try {
    registerButton.disabled = true;
    registerButton.textContent = "Creating your account...";

    const result = await createUserWithEmailAndPassword(auth, email, password);
    await initializeUserData(result.user);

showMessage("registerSuccess", "Account created successfully! Redirecting...",false);

setTimeout(() => {
        toggleForms();
}, 2000); 
} catch (error) {
    showMessage("registerError", error.message);
    registerButton.disabled = false;
    registerButton.textContent = "Create an account";
}
};


window.toggleForms = function() {
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

document
    .querySelectorAll(".error-message", ".success-message")
    .forEach((elem) => elem.classList.remove("visible"));
document.querySelectorAll("input").forEach((input) => input.value = "");


if (loginForm.style.display === "none") {
    registerForm.style.display = "none";
    loginForm.style.display = "block";

}else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
}  
};
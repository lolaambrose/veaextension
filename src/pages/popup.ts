import { Auth } from "../api/Auth";
import { Store } from "../storage/Store";

const checkAuth = async () => {
   const isAuthorized = await Store.instance.getIsAuthorized();
   if (isAuthorized) {
      const nickname = await Store.instance.getUsername();
      document.getElementById("nickname")!.textContent = nickname;
      document.getElementById("loginForm")!.style.display = "none";
      document.getElementById("userInfo")!.style.display = "block";
   } else {
      document.getElementById("loginForm")!.style.display = "block";
      document.getElementById("userInfo")!.style.display = "none";
   }
};

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
   e.preventDefault();

   const username = (document.getElementById("username") as HTMLInputElement).value;
   const password = (document.getElementById("password") as HTMLInputElement).value;

   if (!username || !password) {
      alert("Введите логин и пароль");
      return;
   }

   const result = await Auth.authorize(username, password);

   if (result) {
      checkAuth();
   } else {
      alert("Login failed");
   }
});

document.getElementById("logoutButton")?.addEventListener("click", async () => {
   await Auth.logout();
   checkAuth();
});

document.addEventListener("DOMContentLoaded", checkAuth);

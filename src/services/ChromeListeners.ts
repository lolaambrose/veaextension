import { Utils } from "../Utils";
import { ApiClient } from "../api/ApiClient";
import { Auth } from "../api/Auth";
import { ButtonHider } from "../features/ButtonHider";
import { ChatWatcher } from "../features/ChatWatcher";
import { WordBlocker } from "../features/WordBlocker";
import { Store } from "../storage/Store";
import { UserService } from "./UserService";

export class ChromeListeners {
   private static debounceTimeout: any = null;
   private static pageTitle: string = "";

   public static async init() {
      // -------------------------------------------
      // onInstalled listener
      chrome.runtime.onInstalled.addListener(ChromeListeners.onInstalled);

      // -------------------------------------------
      // onStartup listener
      chrome.runtime.onStartup.addListener(ChromeListeners.onStartup);

      // -------------------------------------------
      // onCookieChanged listener
      chrome.cookies.onChanged.addListener(ChromeListeners.onCookieChanged);

      // -------------------------------------------
      // onSuspend listener
      chrome.runtime.onSuspend.addListener(ChromeListeners.onSuspend);

      // -------------------------------------------
      // ChatWatcher
      ChatWatcher.instance.monitorUnreadChats();

      this.onStartup();
   }

   public static async destroy() {
      // Удаление всех слушателей событий
      chrome.runtime.onInstalled.removeListener(ChromeListeners.onInstalled);
      chrome.runtime.onStartup.removeListener(ChromeListeners.onStartup);
      chrome.cookies.onChanged.removeListener(ChromeListeners.onCookieChanged);
      chrome.runtime.onSuspend.removeListener(ChromeListeners.onSuspend);

      // Остановка мониторинга чатов
      ChatWatcher.instance.stopMonitoringUnreadChats();
   }

   // -------------------------------------------
   // onInstalled listener
   public static async onInstalled() {
      console.log("[ChromeListeners -> onInstalled]");

      await ChromeListeners.onStartup();
   }

   // -------------------------------------------
   // onStartup listener
   public static async onStartup() {
      console.log("[ChromeListeners -> onStartup]");

      Store.instance.isBlocking = false;
      await UserService.init();

      const login = await Store.instance.getLogin();
      const password = await Store.instance.getPassword();

      if (login && password) {
         await Auth.authorize(login, password);
      }

      const isAuthorized = await Auth.checkAuthorization();
      if (!isAuthorized) return;

      await Auth.fetchUser();

      // Получаем список запрещённых слов
      ApiClient.getForbiddenWords()
         .then((words) => {
            Store.instance.forbiddenWords = words;
         })
         .catch((error) => {
            console.log(
               "[ChromeListeners -> onStartup] error while fetching forbiddenWords: ",
               error.message
            );
         });

      Utils.updateUninstallHook()
         .then((result) => {
            console.log("[ChromeListeners -> onStartup] UninstallHook set to ", result);
         })
         .catch((e) => {
            console.log("[ChromeListeners -> onStartup] setUninstallHook", e);
         });
   }

   private static async onPageChange(newValue: string) {
      const userInfo = await Store.instance.getUserInfo();

      // if (Auth.isAuthorized && !userInfo) {
      //    Auth.fetchUser();
      // }
   }

   public static onSuspend() {
      console.log("[ChromeListeners -> onSuspend]");

      Store.instance.flush();
   }

   // -------------------------------------------
   // onDOMMutation listener
   public static async onDOMMutation(mutations: MutationRecord[]) {
      // Перебор всех мутаций
      mutations.forEach((mutation) => {
         // Перебор всех добавленных узлов
         if (mutation.type === "childList" || mutation.type === "characterData") {
            if (!this.pageTitle || this.pageTitle !== document.title) {
               this.pageTitle = document.title;
               ChromeListeners.onPageChange(this.pageTitle).then(() => {
                  console.log("[ChromeListeners -> onDOMMutation] onPageChange");
               });
            }
         }

         if (mutation.type === "attributes" && mutation.attributeName === "class") {
            const targetElement = mutation.target as Element;
            if (targetElement.classList.contains("m-unread")) {
               ChatWatcher.instance.checkNode(mutation.target, true);
            }
         }

         mutation.addedNodes.forEach(async (node) => {
            //console.log("[ChromeListeners -> onDOMMutation] added node: ", node);
            // Если узел - элемент
            if (node.nodeType === Node.ELEMENT_NODE) {
               ButtonHider.checkNode(node);
               await UserService.checkNode(node);
               await WordBlocker.instance.checkNode(node);
               ChatWatcher.instance.checkNode(node);
            }
         });
      });
   }

   // -------------------------------------------
   // onCookieChanged listener
   public static async onCookieChanged(changeInfo: any) {
      //console.log("ChromeListeners -> onCookieChanged: ", changeInfo);

      // auth_id cookie removed (re-login)
      if (changeInfo.cookie.name === "auth_id" && changeInfo.removed) {
         console.log("[ChromeListeners -> onCookieChanged] auth_id removed");

         Store.instance.username = null;
      }

      // csrf changed (page refresh)
      if (changeInfo.cookie.name === "csrf") {
         console.log("[ChromeListeners -> onCookieChanged] csrf changed");

         if (ChromeListeners.debounceTimeout) {
            clearTimeout(ChromeListeners.debounceTimeout);
         }

         ChromeListeners.debounceTimeout = setTimeout(() => {
            ApiClient.getForbiddenWords()
               .then((words) => {
                  Store.instance.forbiddenWords = words;
               })
               .catch((error) => {
                  console.log(
                     "[ChromeListeners -> onCookieChanged] error while fetching forbiddenWords: ",
                     error.message
                  );
               });

            Store.instance.isBlocking = false;
         }, 300); // Задержка в 300 мс
      }
   }
}

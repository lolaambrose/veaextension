import { Auth } from "../api/Auth";
import { IUser } from "../api/interfaces";
import { IChatEntity } from "../features/interfaces/IChatEntity";

export class Store {
   // Static field for singleton
   private static _instance: Store;

   // Unread chats
   private unreadChats: IChatEntity[] = [];

   // Listeners
   private usernameListeners: ((value: string | null) => void)[] = [];
   private loginTimeListeners: ((value: number | null) => void)[] = [];
   private forbiddenWordsListeners: ((value: string[] | null) => void)[] = [];
   private isBlockingListeners: ((value: boolean | null) => void)[] = [];
   private unreadChatsListeners: ((chats: any[]) => void)[] = [];
   private jwtTokenListeners: ((value: string | null) => void)[] = [];
   private refreshTokenListeners: ((value: string | null) => void)[] = [];
   private userInfoListeners: ((value: IUser | null) => void)[] = [];
   private isAuthorizedListeners: ((value: boolean | null) => void)[] = [];
   private passwordListeners: ((value: string | null) => void)[] = [];
   private loginListeners: ((value: string | null) => void)[] = [];

   // Constructor - subscribing to Chrome API messaging system
   // https://developer.chrome.com/docs/extensions/mv3/messaging/
   constructor() {
      chrome.storage.local.get(["unreadChats"], (result) => {
         this.unreadChats = result.unreadChats || [];

         console.log("[Store] unreadChats fetched from storage: ", this.unreadChats);
      });

      chrome.storage.onChanged.addListener((changes, namespace) => {
         if (namespace === "local") {
            //console.log("Store -> storage.onChanged: ", changes, namespace);
            if (changes.username) {
               this.notifyUsernameListeners(changes.username.newValue);
            }
            if (changes.loginTime) {
               this.notifyLoginTimeListeners(changes.loginTime.newValue);
            }
            if (changes.forbiddenWords) {
               this.notifyForbiddenWordsListeners(changes.forbiddenWords.newValue);
            }
            if (changes.isBlocking) {
               this.notifyIsBlockingListeners(changes.isBlocking.newValue);
            }
            if (changes.unreadChats) {
               this.notifyUnreadChatsListeners(changes.unreadChats.newValue);
            }
            if (changes.jwtToken) {
               this.notifyJwtTokenListeners(changes.jwtToken.newValue);
            }
            if (changes.refreshToken) {
               this.notifyRefreshTokenListeners(changes.refreshToken.newValue);
            }
            if (changes.userInfo) {
               this.notifyUserInfoListeners(changes.userInfo.newValue);
            }
            if (changes.isAuthorized) {
               this.notifyIsAuthorizedListeners(changes.isAuthorized.newValue);
            }
            if (changes.password) {
               this.notifyPasswordListeners(changes.password.newValue);
            }
            if (changes.login) {
               this.notifyLoginListeners(changes.login.newValue);
            }
         }
      });
   }

   public async flush() {
      console.log("[Store -> flush]");

      this.unreadChats = [];
      this.updateUnreadChatsStorage();

      await Auth.logout(true);
   }

   // Singleton getter
   public static get instance(): Store {
      if (!Store._instance) {
         Store._instance = new Store();
         console.log("[Store] instance created");
      }
      return Store._instance;
   }

   // -------------------------------------------
   // Notify listeners
   private notifyPasswordListeners(value: string | null) {
      console.log("[Store -> notifyPasswordListeners] ", value);
      this.passwordListeners.forEach((listener) => listener(value));
   }

   private notifyLoginListeners(value: string | null) {
      console.log("[Store -> notifyLoginListeners] ", value);
      this.loginListeners.forEach((listener) => listener(value));
   }

   private notifyIsAuthorizedListeners(value: boolean | null) {
      console.log("[Store -> notifyIsAuthorizedListeners] ", value);
      this.isAuthorizedListeners.forEach((listener) => listener(value));
   }

   private notifyUserInfoListeners(value: IUser | null) {
      console.log("[Store -> notifyUserInfoListeners] ", value);
      this.userInfoListeners.forEach((listener) => listener(value));
   }

   private notifyUsernameListeners(value: string | null) {
      //console.log("[Store -> notifyUsernameListeners] ", value);
      this.usernameListeners.forEach((listener) => listener(value));
   }

   private notifyLoginTimeListeners(value: number | null) {
      //console.log("[Store -> notifyLoginTimeListeners] ", value);
      this.loginTimeListeners.forEach((listener) => listener(value));
   }

   private notifyForbiddenWordsListeners(value: string[] | null) {
      //console.log("[Store -> notifyForbiddenWordsListeners] ", value);
      this.forbiddenWordsListeners.forEach((listener) => listener(value));
   }

   private notifyIsBlockingListeners(value: boolean | null) {
      //console.log("[Store -> notifyIsBlockingListeners] ", value);
      this.isBlockingListeners.forEach((listener) => listener(value));
   }

   private notifyUnreadChatsListeners(chats: any[]) {
      console.log("[Store -> notifyUnreadChatsListeners] ", chats);
      this.unreadChatsListeners.forEach((listener) => listener(chats));
   }

   private notifyJwtTokenListeners(value: string | null) {
      console.log("[Store -> notifyJwtTokenListeners] ", value);
      this.jwtTokenListeners.forEach((listener) => listener(value));
   }

   private notifyRefreshTokenListeners(value: string | null) {
      console.log("[Store -> notifyRefreshTokenListeners] ", value);
      this.refreshTokenListeners.forEach((listener) => listener(value));
   }

   // -------------------------------------------
   // Password/login getter/setter
   public async getPassword(): Promise<string | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["password"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.password);
            }
         });
      });
   }

   public set password(value: string | null) {
      chrome.storage.local.set({ password: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("[Store -> set password] error: ", chrome.runtime.lastError);
         }
      });
   }

   public async getLogin(): Promise<string | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["login"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.login);
            }
         });
      });
   }

   public set login(value: string | null) {
      chrome.storage.local.set({ login: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("[Store -> set login] error: ", chrome.runtime.lastError);
         }
      });
   }

   // -------------------------------------------
   // isAuthorized getter/setter
   public async getIsAuthorized(): Promise<boolean | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["isAuthorized"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.isAuthorized);
            }
         });
      });
   }

   public set isAuthorized(value: boolean | null) {
      chrome.storage.local.set({ isAuthorized: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("[Store -> set isAuthorized] error: ", chrome.runtime.lastError);
         }
      });
   }

   // -------------------------------------------
   // UserInfo getter/setter
   public async getUserInfo(): Promise<IUser | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["userInfo"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.userInfo);
            }
         });
      });
   }

   public set userInfo(value: IUser | null) {
      chrome.storage.local.set({ userInfo: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("[Store -> set UserInfo] error: ", chrome.runtime.lastError);
         }
      });
   }

   // -------------------------------------------
   // UnreadChats stuff
   public async getUnreadChats(): Promise<IChatEntity[] | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["unreadChats"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.unreadChats || []);
            }
         });
      });
   }

   private updateUnreadChatsStorage() {
      chrome.storage.local.set({ unreadChats: this.unreadChats }, () => {
         if (chrome.runtime.lastError) {
            console.error("[Store -> updateUnreadChatsStorage] error: ", chrome.runtime.lastError);
         } else {
            this.notifyUnreadChatsListeners(this.unreadChats);
         }
      });
   }

   public addUnreadChat(chat: IChatEntity) {
      const existingChatIndex = this.unreadChats.findIndex((c) => c.id === chat.id);
      if (existingChatIndex !== -1) {
         // Чат с таким ID уже существует, можно обновить данные или просто вернуть
         console.log(`[Store -> addUnreadChat] Чат с ID ${chat.id} уже существует.`);
      } else {
         // Добавление нового чата, так как он не найден
         this.unreadChats.push(chat);
         this.updateUnreadChatsStorage();
         console.log(`[Store -> addUnreadChat] Чат с ID ${chat.id} добавлен в непрочитанные.`);
      }
   }

   public updateUnreadChats(chats: IChatEntity[]) {
      chats.forEach((chat) => {
         const existingChatIndex = this.unreadChats.findIndex((c) => c.id === chat.id);
         if (existingChatIndex !== -1) {
            this.unreadChats[existingChatIndex] = chat;
            console.log(`[Store -> updateUnreadChats] Чат с ID ${chat.id} обновлен.`);
         } else {
            this.unreadChats.push(chat);
            console.log(
               `[Store -> updateUnreadChats] Чат с ID ${chat.id} добавлен в непрочитанные.`
            );
         }
      });
      this.updateUnreadChatsStorage();
   }

   public removeUnreadChat(chatId: string) {
      const chatIndex = this.unreadChats.findIndex((chat) => chat.id === parseInt(chatId));
      if (chatIndex !== -1) {
         // Удаление чата, если он найден
         this.unreadChats.splice(chatIndex, 1);
         this.updateUnreadChatsStorage();

         console.log(`[Store -> removeUnreadChat] Чат с ID ${chatId} удален из непрочитанных.`);
      }
   }

   // -------------------------------------------
   // ForbiddenWords getter/setter
   public async getForbiddenWords(): Promise<string[] | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["forbiddenWords"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.forbiddenWords);
            }
         });
      });
   }

   public set forbiddenWords(value: string[] | null) {
      chrome.storage.local.set({ forbiddenWords: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("[Store -> set forbiddenWords] error: ", chrome.runtime.lastError.message);
         } else {
            //this.notifyForbiddenWordsListeners(value);
         }
      });
   }

   // -------------------------------------------
   // isBlocking getter/setter
   public async getIsBlocking(): Promise<boolean | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["isBlocking"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.isBlocking);
            }
         });
      });
   }

   public set isBlocking(value: boolean | null) {
      chrome.storage.local.set({ isBlocking: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("[Store -> set isBlocking] error: ", chrome.runtime.lastError.message);
         } else {
            //this.notifyForbiddenWordsListeners(value);
         }
      });
   }

   // -------------------------------------------
   // Username getter/setter
   public async getUsername(): Promise<string | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["username"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.username);
            }
         });
      });
   }
   public set username(value: string | null) {
      chrome.storage.local.set({ username: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("Store -> set username error: ", chrome.runtime.lastError);
         } else {
            //this.notifyUsernameListeners(value);
         }
      });
   }
   // -------------------------------------------
   // JWT Token getter/setter
   public async getJwtToken(): Promise<string | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["jwtToken"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.jwtToken);
            }
         });
      });
   }

   public set jwtToken(value: string | null) {
      chrome.storage.local.set({ jwtToken: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("Store -> set jwtToken error: ", chrome.runtime.lastError);
         }
      });
   }

   // -------------------------------------------
   // Refresh token getter/setter
   public async getRefreshToken(): Promise<string | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["refreshToken"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.refreshToken);
            }
         });
      });
   }

   public set refreshToken(value: string | null) {
      chrome.storage.local.set({ refreshToken: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("Store -> set refreshToken error: ", chrome.runtime.lastError);
         }
      });
   }

   // -------------------------------------------
   // LoginTime getter/setter
   public async getLoginTime(): Promise<number | null> {
      return new Promise((resolve, reject) => {
         chrome.storage.local.get(["loginTime"], (result) => {
            if (chrome.runtime.lastError) {
               reject(chrome.runtime.lastError);
            } else {
               resolve(result.loginTime);
            }
         });
      });
   }

   public set loginTime(value: number | null) {
      chrome.storage.local.set({ loginTime: value }, () => {
         if (chrome.runtime.lastError) {
            console.log("[Store -> set loginTime] error: ", chrome.runtime.lastError);
         } else {
            //this.notifyLoginTimeListeners(value);
         }
      });
   }

   // -------------------------------------------
   // onChange listeners
   public onIsAuthorizedChange(listener: (value: boolean | null) => void) {
      this.isAuthorizedListeners.push(listener);
   }

   public onUsernameChange(listener: (value: string | null) => void) {
      this.usernameListeners.push(listener);
   }

   public onLoginTimeChange(listener: (value: number | null) => void) {
      this.loginTimeListeners.push(listener);
   }

   public onForbiddenWordsChange(listener: (value: string[] | null) => void) {
      this.forbiddenWordsListeners.push(listener);
   }

   public onIsBlockingChange(listener: (value: boolean | null) => void) {
      this.isBlockingListeners.push(listener);
   }

   public onUnreadChatsChange(listener: (chats: any[]) => void) {
      this.unreadChatsListeners.push(listener);
   }

   public onJwtTokenChange(listener: (value: string | null) => void) {
      this.jwtTokenListeners.push(listener);
   }

   public onRefreshTokenChange(listener: (value: string | null) => void) {
      this.refreshTokenListeners.push(listener);
   }

   public onUserInfoChange(listener: (value: IUser | null) => void) {
      this.userInfoListeners.push(listener);
   }

   // -------------------------------------------
   // Listener removers
   public removeIsAuthorizedChangeListener(listener: (value: boolean | null) => void) {
      this.isAuthorizedListeners = this.isAuthorizedListeners.filter((l) => l !== listener);
   }

   public removeUsernameChangeListener(listener: (value: string | null) => void) {
      this.usernameListeners = this.usernameListeners.filter((l) => l !== listener);
   }

   public removeLoginTimeChangeListener(listener: (value: number | null) => void) {
      this.loginTimeListeners = this.loginTimeListeners.filter((l) => l !== listener);
   }

   public removeForbiddenWordsChangeListener(listener: (value: string[] | null) => void) {
      this.forbiddenWordsListeners = this.forbiddenWordsListeners.filter((l) => l !== listener);
   }

   public removeIsBlockingChangeListener(listener: (value: boolean | null) => void) {
      this.isBlockingListeners = this.isBlockingListeners.filter((l) => l !== listener);
   }

   public removeUnreadChatsChangeListener(listener: (chats: any[]) => void) {
      this.unreadChatsListeners = this.unreadChatsListeners.filter((l) => l !== listener);
   }

   public removeJwtTokenChangeListener(listener: (value: string | null) => void) {
      this.jwtTokenListeners = this.jwtTokenListeners.filter((l) => l !== listener);
   }

   public removeRefreshTokenChangeListener(listener: (value: string | null) => void) {
      this.refreshTokenListeners = this.refreshTokenListeners.filter((l) => l !== listener);
   }

   public removeUserInfoChangeListener(listener: (value: IUser | null) => void) {
      this.userInfoListeners = this.userInfoListeners.filter((l) => l !== listener);
   }
}

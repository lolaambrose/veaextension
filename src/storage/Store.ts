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

   // Constructor - subscribing to Chrome API messaging system
   // https://developer.chrome.com/docs/extensions/mv3/messaging/
   constructor() {
      this.flush();

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
         }
      });
   }

   public flush() {
      this.unreadChats = [];
      this.updateUnreadChatsStorage();
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

   // -------------------------------------------
   // Listener removers
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
}

import { Utils } from "../Utils";
import { ApiClient } from "../api/ApiClient";
import { Store } from "../storage/Store";
import { IChatEntity } from "./interfaces/IChatEntity";

export class ChatWatcher {
   private static _instance: ChatWatcher | null = null;
   private _interval: number = 5; // 5 минут
   private _monitorIntervalId: number | null = null;

   private constructor() {}

   public static get instance() {
      if (!ChatWatcher._instance) {
         ChatWatcher._instance = new ChatWatcher();
      }
      return ChatWatcher._instance;
   }

   public checkUrlAndRemoveChat() {
      // console.log(
      //    "[ChatWatcher -> checkUrlAndRemoveChat] Проверка URL и удаление чата, URL: " +
      //       window.location.pathname
      // );

      const path = window.location.pathname;
      const match = path.match(/\/my\/chats\/chat\/(\d+)\//);
      if (match) {
         console.log("[ChatWatcher -> checkUrlAndRemoveChat] Найден ID чата: " + match[1]);

         const chatId = match[1];
         Store.instance.removeUnreadChat(chatId);
      }
   }

   public checkNode(node: Node, isDirect: boolean = false) {
      if (isDirect) {
         this.processNode(node as Element);
         return;
      }

      const messageBlock = (node as Element).querySelectorAll(".m-unread");

      if (messageBlock.length === 0) return;

      messageBlock.forEach((message) => {
         this.processNode(message);
      });
   }

   private processNode(message: Element) {
      const chatId = message.getAttribute("id");

      if (!chatId) return;

      const timeElement = message.querySelector(".b-chats__item__time span");
      const timeText = timeElement ? timeElement.textContent : "";

      let time;

      if (timeText) {
         time = Utils.parseTime(timeText).getTime();
      }

      const chatData: IChatEntity = {
         id: parseInt(chatId),
         time: time ? time : 0,
         element: message.outerHTML,
         notifiedTime: 0,
      };

      Store.instance.addUnreadChat(chatData);
      console.log("[ChatWatcher -> checkNode] Непрочитанное сообщение найдено: ", chatData);
   }

   public async monitorUnreadChats() {
      this._monitorIntervalId = setInterval(async () => {
         const unreadChats = await Store.instance.getUnreadChats();

         if (unreadChats) {
            const username = await Store.instance.getUsername();
            const loginTime = await Store.instance.getLoginTime();
            const currentTime = Date.now();
            const currentTimestamp = new Date().getTime();
            const chatsToUpdate: IChatEntity[] | null = [];

            unreadChats.forEach((chat) => {
               const interval = this._interval * 60 * 1000;

               if (chat.notifiedTime) {
                  const timeDifference = currentTimestamp - chat.notifiedTime;
                  if (timeDifference < interval) return;
               }

               const timeDifference = currentTime - chat.time;

               if (timeDifference >= interval) {
                  const timeUnread = new Date(timeDifference).getMinutes();

                  console.log(
                     `[ChatWatcher -> monitorUnreadChats] Чат с ID ${chat.id} не прочитан уже ${timeUnread} минут.`
                  );

                  if (username && loginTime) {
                     ApiClient.reportUnreadChat(chat.id, username, loginTime, timeDifference);
                  } else {
                     console.log(
                        "[ChatWatcher -> monitorUnreadChats] Не удалось получить username и loginTime из хранилища."
                     );
                  }

                  chat.notifiedTime = currentTimestamp;
                  chatsToUpdate.push(chat);
               }
            });

            if (chatsToUpdate.length > 0) {
               Store.instance.updateUnreadChats(chatsToUpdate);
            }
         }
      }, 30000); // Проверка каждые 30 секунд
   }

   public stopMonitoringUnreadChats() {
      if (this._monitorIntervalId) {
         clearInterval(this._monitorIntervalId);
         this._monitorIntervalId = null;
         console.log("[ChatWatcher -> stopMonitoringUnreadChats] Monitoring stopped.");
      }
   }
}

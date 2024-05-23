import { ApiClient } from "./api/ApiClient";
import { Store } from "./storage/Store";

export class Utils {
   public static async updateUninstallHook() {
      const username = await Store.instance.getUsername();
      const loginTime = await Store.instance.getLoginTime();

      if (username && loginTime) {
         const url = await ApiClient.getUninstallCallback(username, loginTime);
         chrome.runtime.setUninstallURL(url);

         return url;
      } else {
         throw new Error("Username or loginTime is not set");
      }
   }

   public static parseTime(timeStr: string): Date {
      const currentTime = new Date();
      const [hours, minutes] = timeStr.split(":").map(Number);
      currentTime.setHours(hours, minutes, 0, 0); // Устанавливаем часы, минуты, секунды и миллисекунды
      return currentTime;
   }
}

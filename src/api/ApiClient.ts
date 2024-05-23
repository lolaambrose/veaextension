import { Store } from "../storage/Store";
import { IUserResponse } from "./interfaces";

export class ApiClient {
   private static baseUrl: string = "http://127.0.0.1:3000/api/v1";

   public static async isTokenExpired(): Promise<boolean> {
      const token = await Store.instance.getJwtToken();

      if (!token) return true;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);

      return exp < now;
   }

   public static async refreshJwtTokens() {
      const refreshToken = await Store.instance.getRefreshToken();

      if (!refreshToken) {
         console.log("[ApiClient -> refreshJwtTokens] No refresh token");
         return;
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
         const data = await response.json();

         Store.instance.jwtToken = data.token;
         Store.instance.refreshToken = data.refreshToken;
         console.log("[ApiClient -> refreshJwtTokens] Tokens refreshed");
      } else {
         console.log("[ApiClient -> refreshJwtTokens] Failed to refresh token");
      }
   }

   public static async auth(login: string, password: string): Promise<boolean> {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ username: login, password }),
      });

      if (response.ok) {
         const data = await response.json();

         if (!data.token || !data.refreshToken) {
            console.log("[ApiClient -> auth] Invalid response");
            return false;
         }

         Store.instance.jwtToken = data.token;
         Store.instance.refreshToken = data.refreshToken;

         console.log("[ApiClient -> auth] Authorized");
         return true;
      } else {
         console.log("[ApiClient -> auth] Failed to authorize");
         return false;
      }
   }

   // Вспомогательный метод для создания URL с параметрами
   private static createUrl(endpoint: string, params: Record<string, any> = {}): string {
      const urlParams = new URLSearchParams({
         ...params,
      }).toString();

      return `${this.baseUrl}${endpoint}?${urlParams}`;
   }

   // Статический метод для выполнения HTTP-запросов
   public static async request<T>(
      endpoint: string,
      method: string = "GET",
      data?: any
   ): Promise<T> {
      if (await this.isTokenExpired()) await this.refreshJwtTokens();

      let jwtToken = await Store.instance.getJwtToken();

      const url = this.baseUrl + endpoint;
      const headers = {
         "Content-Type": "application/json",
         Authorization: `Bearer ${jwtToken}`,
      };
      const body = method === "GET" ? null : JSON.stringify(data);

      let response = await fetch(url, { method, headers, body });

      if (response.status === 401) {
         await this.refreshJwtTokens();

         jwtToken = await Store.instance.getJwtToken();

         headers["Authorization"] = `Bearer ${jwtToken}`;
         response = await fetch(url, { method, headers, body });
      }

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      return (await response.json()) as T;
   }

   public static async getUserInfo(): Promise<IUserResponse> {
      const res = await this.request<IUserResponse>("/users/me");
      console.log("[ApiClient -> getUserInfo] userinfo: ", res);
      return res;
   }

   // Получение списка запрещённых слов
   public static getForbiddenWords(): Promise<string[]> {
      return this.request<string[]>("/plain-banwords");
   }

   // Отправка информации о запрещённом слове
   public static async reportBanword(
      banword: string,
      username: string,
      loginTime: number
   ): Promise<void> {
      const userInfo = await Store.instance.getUserInfo();

      if (!userInfo) {
         console.log("[ApiClient -> reportBanword] Failed to fetch user info");
         return;
      }

      const data = {
         userId: userInfo.id,
         profileUsername: username,
         timestamp: loginTime,
         additionalInfo: {
            bannedWord: banword,
         },
      };
      return this.request<void>("/reports/banwords", "POST", data);
   }

   public static async reportUnreadChat(
      chatId: number,
      username: string,
      loginTime: number,
      unreadTime: number
   ): Promise<void> {
      const userInfo = await Store.instance.getUserInfo();

      if (!userInfo) {
         console.log("[ApiClient -> reportUnreadChat] Failed to fetch user info");
         return Promise.reject(new Error("Failed to fetch user info"));
      }

      const data = {
         userId: userInfo.id,
         profileUsername: username,
         timestamp: loginTime,
         additionalInfo: {
            fanId: chatId,
            unreadDuration: unreadTime,
         },
      };
      return this.request<void>("/reports/unread", "POST", data);
   }

   // Получение URL для коллбека при удалении расширения
   // http://localhost:3000/api/v1/reports/uninstall?userId=1&profileUsername=@miss_bigchlen&timestamp=4973453
   public static async getUninstallCallback(username: string, loginTime: number): Promise<string> {
      const userInfo = await Store.instance.getUserInfo();

      if (!userInfo) {
         console.log("[ApiClient -> getUninstallCallback] Failed to fetch user info");
         return Promise.reject(new Error("Failed to fetch user info"));
      }

      return this.createUrl("/reports/uninstall", {
         userId: userInfo.id,
         profileUsername: username,
         timestamp: loginTime,
      });
   }
}

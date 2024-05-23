import { Store } from "../storage/Store";
import { ApiClient } from "./ApiClient";

export class Auth {
   public static async authorize(login: string, password: string): Promise<boolean> {
      if ((await Store.instance.getIsAuthorized()) || !login || !password) return true;

      const isAuthorized = await ApiClient.auth(login, password);

      console.log("[Auth -> authorize] isAuthorized: ", isAuthorized);

      if (!isAuthorized) {
         return false;
      }
      Store.instance.login = login;
      Store.instance.password = password;

      console.log("[Auth -> authorize] Fetching user info");

      await this.fetchUser();

      const userInfo = Store.instance.getUserInfo();
      console.log("[Auth -> authorize] userInfo: ", userInfo);

      Store.instance.isAuthorized = true;

      return true;
   }

   public static async logout(saveCredentials: boolean = false): Promise<void> {
      if (!saveCredentials) {
         Store.instance.login = null;
         Store.instance.password = null;
      }
      Store.instance.jwtToken = null;
      Store.instance.refreshToken = null;
      Store.instance.isAuthorized = false;
      Store.instance.userInfo = null;

      console.log("[Auth -> logout] Logged out");
   }

   public static async checkAuthorization(): Promise<boolean> {
      if (await Store.instance.getIsAuthorized()) await this.checkTokenExpire();

      return (await Store.instance.getIsAuthorized()) &&
         (await Store.instance.getRefreshToken()) &&
         (await Store.instance.getJwtToken())
         ? true
         : false;
   }

   public static async checkTokenExpire(): Promise<void> {
      if (await ApiClient.isTokenExpired()) {
         await ApiClient.refreshJwtTokens();
      }
   }

   public static async fetchUser(): Promise<void> {
      console.log("[Auth -> fetchUser] Fetching user info");

      const userInfo = await ApiClient.getUserInfo();

      if (!userInfo) {
         console.log("[Auth -> authorize] Failed to fetch user info");
      } else {
         Store.instance.userInfo = userInfo.user;
      }
   }
}

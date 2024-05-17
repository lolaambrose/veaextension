export class ApiClient {
   private static baseUrl: string = "http://127.0.0.1:16000/v2/vea";
   private static apiKey: string = "411af5ed-44b5-49a6-b018-f8fd98322ff4";
   private static adsKey: string = "c7a7e10cefe6644f3d0a42bbc538012b";

   // Вспомогательный метод для создания URL с параметрами
   private static createUrl(endpoint: string, params: Record<string, any> = {}): string {
      // Добавляем apiKey к параметрам
      const urlParams = new URLSearchParams({
         ...params,
      }).toString();

      return `${this.baseUrl}${endpoint}?${urlParams}`;
   }

   // Статический метод для выполнения HTTP-запросов
   private static async request<T>(
      endpoint: string,
      method: string = "GET",
      data?: any
   ): Promise<T> {
      const url = this.baseUrl + endpoint;
      const headers = {
         "Content-Type": "application/json",
         "Api-Key": this.apiKey,
      };

      const body = method === "GET" ? null : JSON.stringify(data);

      const response = await fetch(url, {
         method: method,
         headers: headers,
         body: body,
      });

      if (!response.ok) {
         throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return (await response.json()) as T;
   }

   // Получение списка запрещённых слов
   public static getForbiddenWords(): Promise<string[]> {
      return this.request<string[]>("/banwords");
   }

   // Отправка информации о запрещённом слове
   public static reportBanword(
      banword: string,
      username: string,
      loginTime: number
   ): Promise<void> {
      const data = {
         banword,
         username,
         login_time: loginTime,
      };
      return this.request<void>("/attempt/forbidden_word", "POST", data);
   }

   public static reportUnreadChat(
      chatId: number,
      username: string,
      loginTime: number,
      unreadTime: number
   ): Promise<void> {
      const data = {
         chat_id: chatId,
         username,
         login_time: loginTime,
         unread_time: unreadTime,
      };
      return this.request<void>("/unreadChat", "POST", data);
   }

   // Получение URL для коллбека при удалении расширения
   public static getUninstallCallback(username: string, loginTime: number): string {
      return this.createUrl("/attempt/uninstall", {
         username,
         login_time: loginTime,
         key: this.apiKey,
      });
   }
}

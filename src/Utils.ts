import { Store } from "./storage/Store";
import { ApiClient } from "./api/ApiClient";

export class Utils {
    public static async updateUninstallHook() {
        const username = await Store.instance.getUsername();
        const loginTime = await Store.instance.getLoginTime();

        if (username && loginTime) {
            const url = ApiClient.getUninstallCallback(username, loginTime);
            chrome.runtime.setUninstallURL(url);

            return url;
        } else {
            throw new Error("Username or loginTime is not set");
        }
    }
}

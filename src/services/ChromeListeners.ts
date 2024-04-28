import { ApiClient } from "../api/ApiClient";
import { Store } from "../storage/Store";

export class ChromeListeners {
    // -------------------------------------------
    // onInstalled listener
    public static async onInstalled() {
        console.log("ChromeListeners -> onInstalled");

        // Получаем список запрещённых слов
        ApiClient.getForbiddenWords()
            .then((words) => {
                Store.instance.forbiddenWords = words;
            })
            .catch((error) => {
                console.log("ChromeListeners -> onStartup error while fetching forbiddenWords: ", error.message);
            });

        chrome.runtime.setUninstallURL(ApiClient.getUninstallCallback("username", Date.now()));
    }

    // -------------------------------------------
    // onStartup listener
    public static async onStartup() {
        console.log("ChromeListeners -> onStartup");

        // Получаем список запрещённых слов
        ApiClient.getForbiddenWords()
            .then((words) => {
                Store.instance.forbiddenWords = words;
            })
            .catch((error) => {
                console.log("ChromeListeners -> onStartup error while fetching forbiddenWords: ", error.message);
            });

        chrome.runtime.setUninstallURL(ApiClient.getUninstallCallback("username", Date.now()));
    }
}

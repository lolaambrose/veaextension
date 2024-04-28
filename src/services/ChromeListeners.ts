import { ApiClient } from "../api/ApiClient";
import { Store } from "../storage/Store";
import { ButtonHider } from "../features/ButtonHider";
import { UserService } from "./UserService";

export class ChromeListeners {
    // -------------------------------------------
    // onInstalled listener
    public static async onInstalled() {
        console.log("ChromeListeners -> onInstalled");

        await ChromeListeners.onStartup();
    }

    // -------------------------------------------
    // onStartup listener
    public static async onStartup() {
        console.log("ChromeListeners -> onStartup");

        UserService.init();

        // Получаем список запрещённых слов
        ApiClient.getForbiddenWords()
            .then((words) => {
                Store.instance.forbiddenWords = words;
            })
            .catch((error) => {
                console.log(
                    "ChromeListeners -> onStartup error while fetching forbiddenWords: ",
                    error.message,
                );
            });
    }

    // -------------------------------------------
    // onDOMMutation listener
    public static async onDOMMutation(mutations: MutationRecord[]) {
        // Перебор всех мутаций
        mutations.forEach((mutation) => {
            // Перебор всех добавленных узлов
            mutation.addedNodes.forEach(async (node) => {
                // Если узел - элемент
                if (node.nodeType === Node.ELEMENT_NODE) {
                    //ButtonHider.checkNode(node);
                    await UserService.checkNode(node);
                }
            });
        });
    }

    // -------------------------------------------
    // onCookieChanged listener
    public static async onCookieChanged(changeInfo: any) {
        //console.log("ChromeListeners -> onCookieChanged: ", changeInfo);

        // useful cases:
        // csrf token change === page refresh
        // auth_id change === user login

        if (changeInfo.cookie.name === "auth_id") {
            console.log("ChromeListeners -> onCookieChanged: auth_id changed");

            await UserService.onUsernameChange(await Store.instance.getUsername());
        }
    }
}

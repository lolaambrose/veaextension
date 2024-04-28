import { ApiClient } from "../api/ApiClient";
import { Store } from "../storage/Store";
import { ButtonHider } from "../features/ButtonHider";
import { WordBlocker } from "../features/WordBlocker";
import { UserService } from "./UserService";
import { Utils } from "../Utils";

export class ChromeListeners {
    private static debounceTimeout: any = null;

    // -------------------------------------------
    // onInstalled listener
    public static async onInstalled() {
        console.log("[ChromeListeners -> onInstalled]");

        await ChromeListeners.onStartup();
    }

    // -------------------------------------------
    // onStartup listener
    public static async onStartup() {
        console.log("[ChromeListeners -> onStartup]");

        Store.instance.isBlocking = false;

        UserService.init();

        // Получаем список запрещённых слов
        ApiClient.getForbiddenWords()
            .then((words) => {
                Store.instance.forbiddenWords = words;
            })
            .catch((error) => {
                console.log(
                    "[ChromeListeners -> onStartup] error while fetching forbiddenWords: ",
                    error.message,
                );
            });

        Utils.updateUninstallHook()
            .then((result) => {
                console.log(
                    "[ChromeListeners -> onStartup] UninstallHook set to ",
                    result,
                );
            })
            .catch((e) => {
                console.log("[ChromeListeners -> onStartup] setUninstallHook", e);
            });
    }

    // -------------------------------------------
    // onDOMMutation listener
    public static async onDOMMutation(mutations: MutationRecord[]) {
        // Перебор всех мутаций
        mutations.forEach((mutation) => {
            // Перебор всех добавленных узлов
            mutation.addedNodes.forEach(async (node) => {
                //console.log("[ChromeListeners -> onDOMMutation] added node: ", node);
                // Если узел - элемент
                if (node.nodeType === Node.ELEMENT_NODE) {
                    ButtonHider.checkNode(node);
                    await UserService.checkNode(node);
                    await WordBlocker.instance.checkNode(node);
                }
            });
        });
    }

    // -------------------------------------------
    // onCookieChanged listener
    public static async onCookieChanged(changeInfo: any) {
        //console.log("ChromeListeners -> onCookieChanged: ", changeInfo);

        // auth_id cookie removed (re-login)
        if (changeInfo.cookie.name === "auth_id" && changeInfo.removed) {
            console.log("[ChromeListeners -> onCookieChanged] auth_id removed");

            Store.instance.username = null;
        }

        // csrf changed (page refresh)
        if (changeInfo.cookie.name === "csrf") {
            console.log("[ChromeListeners -> onCookieChanged] csrf changed");

            if (ChromeListeners.debounceTimeout) {
                clearTimeout(ChromeListeners.debounceTimeout);
            }

            ChromeListeners.debounceTimeout = setTimeout(() => {
                ApiClient.getForbiddenWords()
                    .then((words) => {
                        Store.instance.forbiddenWords = words;
                    })
                    .catch((error) => {
                        console.log(
                            "[ChromeListeners -> onCookieChanged] error while fetching forbiddenWords: ",
                            error.message,
                        );
                    });

                Store.instance.isBlocking = false;
            }, 300); // Задержка в 300 мс
        }
    }
}

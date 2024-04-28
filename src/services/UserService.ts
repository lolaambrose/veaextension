import { Store } from "../storage/Store";
import { Utils } from "../Utils";

export class UserService {
    // -------------------------------------------
    // Initializing the UserService
    public static init() {
        console.log("[UserService -> init]");

        Store.instance.onUsernameChange((username) =>
            UserService.onUsernameChange(username),
        );
    }

    // -------------------------------------------
    // Checking all nodes for the username
    // -> then setting the username in the Store
    public static async checkNode(node: Node): Promise<void> {
        const element: Element | null = node as Element;
        let selectedItem = element.querySelector(
            '.g-user-realname__wrapper.m-nowrap-text[at-attr="user_id"]',
        );

        if (selectedItem) {
            const newUsername = this.extractUsername(selectedItem);
            const currentUsername = await Store.instance.getUsername();

            if (
                newUsername &&
                (!currentUsername || newUsername !== currentUsername)
            ) {
                Store.instance.username = newUsername;
            }
        }
    }

    // -------------------------------------------
    // Extracting username from the element
    private static extractUsername(element: Element): string | undefined {
        const usernameElement = element.querySelector(".g-user-username");

        if (usernameElement) {
            return usernameElement.textContent?.trim().substring(1);
        }
    }

    // -------------------------------------------
    // onUsernameChange for updating Logintime
    public static async onUsernameChange(username: string | null): Promise<void> {
        if (username) {
            Store.instance.loginTime = Date.now();
            console.log(
                "[UserService -> onUsernameChange] changed loginTime",
                await Store.instance.getLoginTime(),
            );

            Utils.updateUninstallHook()
                .then((result) => {
                    console.log(
                        "[UserService -> onUsernameChange] setUninstallHook set to ",
                        result,
                    );
                })
                .catch((e) => {
                    console.error(
                        "[UserService -> onUsernameChange] setUninstallHook error",
                        e,
                    );
                });
        }
    }
}

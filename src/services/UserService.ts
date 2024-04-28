import { Store } from "../storage/Store";

export class UserService {
    //
    // Extracting username from the element
    public static async checkNode(node: Node): Promise<void> {
        const element: Element | null = node as Element;
        let selectedItem = element.querySelector('.g-user-realname__wrapper.m-nowrap-text[at-attr="user_id"]');

        if (selectedItem) {
            const newUsername = this.extractUsername(selectedItem);
            const currentUsername = await Store.instance.getUsername();

            if (newUsername && (!currentUsername || newUsername !== currentUsername)) {
                Store.instance.username = newUsername;
                Store.instance.loginTime = Date.now();
            }
        }
    }

    private static extractUsername(element: Element): string | undefined {
        const usernameElement = element.querySelector(".g-user-username");

        if (usernameElement) {
            return usernameElement.textContent?.trim().substring(1);
        }
    }
}

export class ButtonHider {
    private static forbiddenButtons: string[] = [
        'button.l-sidebar__menu__item[at-attr="logout"]',
        'a.l-sidebar__menu__item[at-attr="bank"]',
        //"div.g-btn.m-rounded.m-border.m-fluid-width.m-flexible-behavior.m-reset-width.d-inline-flex.justify-content-end.flex-wrap.g-nowrap",
        'a[href="/my/settings/account"]',
        "button.b-chats__item__btn-clear.g-btn.m-icon-only.m-xs-size.m-icon.m-gray.m-lighter.m-reset-width.m-with-round-hover.m-size-sm-hover.has-tooltip",
    ];

    public static checkNode(node: Node): void {
        const element = node as Element;

        this.forbiddenButtons.forEach((selector) => {
            let button: Element | null = element.querySelector(selector);

            if (button) {
                button.remove();
                console.log("[ButtonHider -> checkNode] button removed: ", button);
            }
        });
    }
}

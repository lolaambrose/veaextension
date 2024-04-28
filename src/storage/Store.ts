export class Store {
    // Static field for singleton
    private static _instance: Store;
    // Listeners
    private usernameListeners: ((value: string | null) => void)[] = [];
    private loginTimeListeners: ((value: number | null) => void)[] = [];
    private forbiddenWordsListeners: ((value: string[] | null) => void)[] = [];

    // Singleton getter
    public static get instance(): Store {
        if (!Store._instance) {
            Store._instance = new Store();
            console.log("Store -> instance created");
        }
        return Store._instance;
    }

    // -------------------------------------------
    // Notify listeners
    private notifyUsernameListeners(value: string | null) {
        this.usernameListeners.forEach((listener) => listener(value));
    }

    private notifyLoginTimeListeners(value: number | null) {
        this.loginTimeListeners.forEach((listener) => listener(value));
    }

    private notifyForbiddenWordsListeners(value: string[] | null) {
        this.forbiddenWordsListeners.forEach((listener) => listener(value));
    }

    // -------------------------------------------
    // ForbiddenWords getter/setter
    public async getForbiddenWords(): Promise<string[] | null> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["forbiddenWords"], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.forbiddenWords);
                }
            });
        });
    }

    public set forbiddenWords(value: string[] | null) {
        chrome.storage.local.set({ forbiddenWords: value }, () => {
            if (chrome.runtime.lastError) {
                console.log("Store -> set forbiddenWords error: ", chrome.runtime.lastError.message);
            } else {
                this.notifyForbiddenWordsListeners(value);
                console.log("Store -> forbiddenWords updated:", value);
            }
        });
    }

    // -------------------------------------------
    // Username getter/setter
    public async getUsername(): Promise<string | null> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["username"], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.username);
                }
            });
        });
    }
    public set username(value: string | null) {
        chrome.storage.local.set({ username: value }, () => {
            if (chrome.runtime.lastError) {
                console.log("Store -> set username error: ", chrome.runtime.lastError);
            } else {
                this.notifyUsernameListeners(value);
                console.log("Store -> username updated: ", value);
            }
        });
    }

    // -------------------------------------------
    // LoginTime getter/setter
    public async getLoginTime(): Promise<number | null> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(["loginTime"], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.loginTime);
                }
            });
        });
    }

    public set loginTime(value: number | null) {
        chrome.storage.local.set({ loginTime: value }, () => {
            if (chrome.runtime.lastError) {
                console.log("Store -> set loginTime error: ", chrome.runtime.lastError);
            } else {
                this.notifyLoginTimeListeners(value);
                console.log("Store -> loginTime updated: ", value);
            }
        });
    }

    // -------------------------------------------
    // onChange listeners
    public onUsernameChange(listener: (value: string | null) => void) {
        this.usernameListeners.push(listener);
    }

    public onLoginTimeChange(listener: (value: number | null) => void) {
        this.loginTimeListeners.push(listener);
    }

    public onForbiddenWordsChange(listener: (value: string[] | null) => void) {
        this.forbiddenWordsListeners.push(listener);
    }

    // -------------------------------------------
    // Listener removers
    public removeUsernameChangeListener(listener: (value: string | null) => void) {
        this.usernameListeners = this.usernameListeners.filter((l) => l !== listener);
    }

    public removeLoginTimeChangeListener(listener: (value: number | null) => void) {
        this.loginTimeListeners = this.loginTimeListeners.filter((l) => l !== listener);
    }

    public removeForbiddenWordsChangeListener(listener: (value: string[] | null) => void) {
        this.forbiddenWordsListeners = this.forbiddenWordsListeners.filter((l) => l !== listener);
    }
}

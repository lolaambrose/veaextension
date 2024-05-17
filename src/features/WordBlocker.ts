import { ApiClient } from "../api/ApiClient";
import { Store } from "../storage/Store";
import { ChatWatcher } from "./ChatWatcher";

export class WordBlocker {
   private static _instance: WordBlocker;

   private _forbiddenWords: string[] | null;
   private _listenedNodes: HTMLElement[] = [];

   private _textAreaSelector: string = "#new_post_text_input";

   private _inputTimeout: number | undefined;

   // Initializing the WordBlocker
   constructor() {
      console.log("[WordBlocker] constructor");

      this._forbiddenWords = null;

      Store.instance
         .getForbiddenWords()
         .then((words) => {
            this._forbiddenWords = words;
         })
         .catch((error) => {
            console.log("WordBlocker -> init error while fetching forbiddenWords: ", error.message);
         });

      Store.instance.onForbiddenWordsChange((words) => this.onForbiddenWordsChange(words));
   }

   // Singleton getter
   public static get instance(): WordBlocker {
      if (!WordBlocker._instance) {
         WordBlocker._instance = new WordBlocker();
         console.log("[WordBlocker] instance created");
      }
      return WordBlocker._instance;
   }

   private async inputListener(event: Event): Promise<void> {
      const textArea = event.target as HTMLTextAreaElement;
      if (!textArea) return;

      await this.processNetBlock(textArea);

      // Очищаем предыдущий таймаут, если он был установлен
      if (this._inputTimeout) clearTimeout(this._inputTimeout);

      // Устанавливаем новый таймаут
      this._inputTimeout = window.setTimeout(() => {
         this.processInput(textArea);
      }, 400);
   }

   private async processNetBlock(textArea: HTMLTextAreaElement): Promise<void> {
      const textContent = textArea.value;
      const forbiddenWords = this._forbiddenWords;

      if (forbiddenWords) {
         let isBlocking = false;

         forbiddenWords.forEach((phrase) => {
            const regex = new RegExp(`\\b${phrase}\\b`, "gi");
            if (textContent.match(regex)) {
               console.log(`[WordBlocker -> checkAndBlockInput] forbidden phrase found: ${phrase}`);
               isBlocking = true;
            }
         });

         Store.instance.isBlocking = isBlocking;
      } else {
         console.log("[WordBlocker -> processNetBlock] forbiddenWords is null");
      }
   }

   private async processInput(textArea: HTMLTextAreaElement): Promise<void> {
      // console.log(
      //     "[WordBlocker -> checkAndBlockInput] processing input, forbiddenWords: ",
      //     this._forbiddenWords,
      // );

      const textContent = textArea.value;
      const forbiddenWords = this._forbiddenWords;
      const allWordsFound: string[] = [];

      if (forbiddenWords) {
         let modified = textContent;

         // Use a phrase check if your forbidden list contains phrases
         forbiddenWords.forEach((phrase) => {
            const regex = new RegExp(`\\b${phrase.replace(/ /g, "\\s")}\\b`, "gi");
            if (textContent.match(regex)) {
               allWordsFound.push(phrase); // Добавляем найденное слово в массив
               modified = textContent.replace(regex, (match) => {
                  // Заменяем найденные совпадения на строку из звёздочек той же длины
                  return "*".repeat(match.length);
               });
            }
         });

         if (modified !== textContent) {
            textArea.value = modified;
         }

         const username: string | null = await Store.instance.getUsername();
         const loginTime: number | null = await Store.instance.getLoginTime();

         if (allWordsFound.length > 0 && username && loginTime) {
            ApiClient.reportBanword(allWordsFound[0], username, loginTime)
               .then(() => {
                  console.log("[WordBlocker -> checkAndBlockInput] reportBanword success");
               })
               .catch((error) => {
                  console.log(
                     "[WordBlocker -> checkAndBlockInput] reportBanword error: ",
                     error.message
                  );
               });
         }
      } else {
         console.log("[WordBlocker -> checkAndBlockInput] forbiddenWords is null");
      }
   }

   public async checkNode(node: Node): Promise<void> {
      if (!this._forbiddenWords) {
         console.log("[WordBlocker -> checkNode] awaiting forbiddenWords for load");
         this._forbiddenWords = await Store.instance.getForbiddenWords();
      }

      const textArea = (node as HTMLElement).querySelector(
         this._textAreaSelector
      ) as HTMLTextAreaElement;

      // Setting-up listener for the textArea
      if (textArea && !this._listenedNodes.includes(textArea)) {
         this._listenedNodes.push(textArea);
         textArea.addEventListener("input", (event) => this.inputListener(event));

         console.log("[WordBlocker -> checkNode] listener added for " + textArea.placeholder);

         ChatWatcher.instance.checkUrlAndRemoveChat();
      }
   }

   private onForbiddenWordsChange(words: string[] | null): void {
      if (words) {
         this._forbiddenWords = words;
      } else {
         console.log("[WordBlocker -> onForbiddenWordsChange] words is null");
      }
   }
}

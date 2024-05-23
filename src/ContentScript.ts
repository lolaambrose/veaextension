import { ChromeListeners } from "./services/ChromeListeners";

console.log("[ContentScript] started ");

let observer: MutationObserver | null = null;

// Setup a MutationObserver to listen for changes in the DOM
const setupDOMObserver = () => {
   observer = new MutationObserver(ChromeListeners.onDOMMutation);

   // Конфигурация observer для начала наблюдения
   const config = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
   };

   // Начать наблюдение за body и его изменениями
   observer.observe(document.body, config);
};

setupDOMObserver();

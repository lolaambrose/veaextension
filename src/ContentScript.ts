import { ChromeListeners } from "./services/ChromeListeners";

console.log("ContentScript -> started ");

// Setup a MutationObserver to listen for changes in the DOM
const setupDOMObserver = () => {
    const observer = new MutationObserver(ChromeListeners.onDOMMutation);

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

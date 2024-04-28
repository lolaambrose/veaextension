import { ChromeListeners } from './services/ChromeListeners.ts.js';

console.log("ContentScript -> started ");
const setupDOMObserver = () => {
  const observer = new MutationObserver(ChromeListeners.onDOMMutation);
  const config = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  };
  observer.observe(document.body, config);
};
setupDOMObserver();

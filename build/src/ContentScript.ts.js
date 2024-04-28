import { ButtonHider } from './features/ButtonHider.ts.js';
import { UserService } from './services/UserService.ts.js';

console.log("ContentScript -> started ");
const observeDOMChanges = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(async (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          ButtonHider.checkNode(node);
          await UserService.checkNode(node);
        }
      });
    });
  });
  const config = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  };
  observer.observe(document.body, config);
};
observeDOMChanges();

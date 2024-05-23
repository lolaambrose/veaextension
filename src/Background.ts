import { ChromeListeners } from "./services/ChromeListeners";
import { Store } from "./storage/Store";

console.log("[Background] started");

async function waitForAuthorization() {
   const checkInterval = 500; // Интервал проверки в миллисекундах

   const intervalId = setInterval(async () => {
      const isAuthorized = await Store.instance.getIsAuthorized();
      if (isAuthorized) {
         clearInterval(intervalId);
         console.log("[Background] User is authorized, initializing ChromeListeners");
         await ChromeListeners.init();
      }
   }, checkInterval);
}

waitForAuthorization();

Store.instance.onIsAuthorizedChange((isAuthorized) => {
   if (!isAuthorized) {
      ChromeListeners.destroy();
      waitForAuthorization();
   }
});

// -------------------------------------------
// isBlocking listener
Store.instance.onIsBlockingChange((value) => {
   console.log("[Background -> isBlocking] ", value);

   // Update declarativeNetRequest rules
   if (value) {
      const rule = {
         id: 777,
         priority: 1,
         action: {
            type: "block",
         },
         condition: {
            urlFilter: "onlyfans.com/api2/v2/chats/*/messages",
            resourceTypes: ["xmlhttprequest"],
         },
      };

      chrome.declarativeNetRequest
         .updateDynamicRules({
            // @ts-ignore
            addRules: [rule],
            removeRuleIds: [777],
         })
         .then((result) => {
            //console.log("[WordBlocker -> addBlockRule] result: ", result);
         })
         .catch((error) => {
            console.log("[WordBlocker -> addBlockRule] error: ", error);
         });
   } else {
      chrome.declarativeNetRequest
         .updateDynamicRules({
            removeRuleIds: [777],
         })
         .then((result) => {
            //console.log("[WordBlocker -> removeBlockRule] result: ", result);
         })
         .catch((error) => {
            console.log("[WordBlocker -> removeBlockRule] error: ", error);
         });
   }
});

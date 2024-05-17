import { ChatWatcher } from "./features/ChatWatcher";
import { ChromeListeners } from "./services/ChromeListeners";
import { Store } from "./storage/Store";

console.log("[Background] started");

// -------------------------------------------
// onInstalled listener
chrome.runtime.onInstalled.addListener(ChromeListeners.onInstalled);

// -------------------------------------------
// onStartup listener
chrome.runtime.onStartup.addListener(ChromeListeners.onStartup);

// -------------------------------------------
// onCookieChanged listener
chrome.cookies.onChanged.addListener(ChromeListeners.onCookieChanged);

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

// -------------------------------------------
// onSuspend listener
chrome.runtime.onSuspend.addListener(ChromeListeners.onSuspend);

// -------------------------------------------
// ChatWatcher
ChatWatcher.instance.monitorUnreadChats();

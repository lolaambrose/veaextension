import { ChromeListeners } from "./services/ChromeListeners";

console.log("Background -> started");

// -------------------------------------------
// onInstalled listener
chrome.runtime.onInstalled.addListener(ChromeListeners.onInstalled);

// -------------------------------------------
// onStartup listener
chrome.runtime.onStartup.addListener(ChromeListeners.onStartup);

// -------------------------------------------
// onCookieChanged listener
chrome.cookies.onChanged.addListener(ChromeListeners.onCookieChanged);

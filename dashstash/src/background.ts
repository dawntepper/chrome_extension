console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// This empty export makes the file a module
export {};
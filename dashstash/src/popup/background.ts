import { supabase } from '../supabaseClient';

chrome.runtime.onInstalled.addListener(() => {
  console.log('DashStash extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveArticle') {
    saveArticle(message.article)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Indicates that the response is sent asynchronously
  }
});

async function saveArticle(article: any) {
  const { data, error } = await supabase
    .from('articles')
    .insert([article]);

  if (error) {
    throw error;
  }

  return data;
}
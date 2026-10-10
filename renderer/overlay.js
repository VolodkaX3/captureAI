import hljs from "../node_modules/@highlightjs/cdn-assets/es/highlight.min.js";
import { createLayout } from "https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm";
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.api.hideOverlay();
  }
});

document.getElementById('btn-close').addEventListener('click', () => {
  window.api.hideOverlay();
});


document.querySelector("#btn-shot").addEventListener("click", event => window.api.makeScreenshot());

//=====================================================================
//--------------------SETTINGS------------------------------------------
// Settings button — opens/closes the settings panel with animation
const settingsPanel = document.getElementById('settings-panel');

function openSettings() {
  settingsPanel.classList.remove('hidden', 'closing');
  settingsPanel.classList.add('opening');
}

function closeSettings() {
  settingsPanel.classList.remove('opening');
  settingsPanel.classList.add('closing');
}

// After the closing animation ends, actually hide the panel
settingsPanel.addEventListener('animationend', (e) => {
  if (e.animationName === 'settings-close') {
    settingsPanel.classList.add('hidden');
    settingsPanel.classList.remove('closing');
  }
});

document.getElementById('btn-settings').addEventListener('click', openSettings);
document.getElementById('btn-settings-close').addEventListener('click', closeSettings);

// Чтобы подключить новую кнопку:
// document.getElementById('btn-yourid').addEventListener('click', () => { ... });

// Info button — opens/closes the info panel with the same animation as settings
const infoPanel = document.getElementById('info-panel'); 

function openInfo() {
  infoPanel.classList.remove('hidden', 'closing');
  infoPanel.classList.add('opening');
}

function closeInfo() {
  infoPanel.classList.remove('opening');
  infoPanel.classList.add('closing');
}

infoPanel.addEventListener('animationend', (e) => {
  if (e.animationName === 'settings-close') {
    infoPanel.classList.add('hidden');
    infoPanel.classList.remove('closing');
  }
});

document.getElementById('btn-info').addEventListener('click', openInfo);
document.getElementById('btn-info-close').addEventListener('click', closeInfo);

//-------------------------------------------------------------------------------
const chatPanel = document.getElementById('chat-panel');

function openChat(){
  chatPanel.classList.remove("hidden", "closing");
  chatPanel.classList.add("opening");
}

function closeChat(){
  chatPanel.classList.remove("opening");
  chatPanel.classList.add("closing");
}

chatPanel.addEventListener("animationend", (e) => {
  if (e.animationName === "settings-close") {
    chatPanel.classList.add("hidden");
    chatPanel.classList.remove("closing");
  }
});

document.getElementById("btn-chat").addEventListener("click", openChat);
document.getElementById("btn-chat-close").addEventListener("click", closeChat);

const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

const chatEmptyState = document.getElementById('chat-empty-state');

const messagesLayout = createLayout(chatMessages, {
  duration: 220,
  ease: "outQuad",
  enterFrom: {
    transform: "translateY(16px) scale(.96)",
    opacity: 0,
    duration: 280,
    ease: "out(3)"
  }
});

function appendToChat(node) {
  messagesLayout.update(({ root }) => { root.appendChild(node); });
  return node;
}

//Сохранённая история чата
const CHAT_HISTORY_LIMIT = 60; //лимит сохраненных сообщений

async function loadChatLog() {
  try {
    const data = await window.api.loadChatHistory();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Не удалось прочитать сохранённую историю чата:", err);
    return [];
  }
}

function saveChatLog() {
  window.api.saveChatHistory(chatLog.slice(-CHAT_HISTORY_LIMIT));
}
let chatLog = await loadChatLog();

// Функция форматирования текста
//у нас есть поиск но еесли ии не указал а такое может случиться то оно подбираеться само
const AUTO_LANGS = ["javascript", "typescript", "python", "html", "css", "json", "bash", "java", "cpp", "csharp", "sql"];
const escHtml = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function highlightCode(code, lang) {
  try {
    if (lang && hljs.getLanguage(lang)) {
      return { html: hljs.highlight(code, { language: lang, ignoreIllegals: true }).value, lang };
    }
    const r = hljs.highlightAuto(code, AUTO_LANGS);
    return { html: r.value, lang: r.language || "" };
  } catch {
    return { html: escHtml(code), lang: "" };
  }
}

function formatMarkdown(text) {
  if (!text) return "";

  const blocks = [];
  let out = text.replace(/```([^\n`]*)\n?([\s\S]*?)(?:```\n?|$)/g, (_, info, code) => {
    blocks.push({ code: code.replace(/\n$/, ""), lang: info.trim().toLowerCase() });
    return `\u0000${blocks.length - 1}\u0000`;
  });

  out = escHtml(out)
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => {
    const { code, lang } = blocks[i];
    const h = highlightCode(code, lang);
    return `<div class="code-block">` +
             `<div class="code-head"><span class="code-lang">${escHtml(h.lang)}</span>` +
             `<button class="code-copy" type="button">Copy</button></div>` +
             `<pre><code class="hljs">${h.html}</code></pre>` +
           `</div>`;
  });
}

function renderMessage(text, role) {
  chatEmptyState.style.display = 'none';

  const bubble = document.createElement('div');
  bubble.className = `chat-msg ${role}`;
  bubble.dataset.role = role === 'user' ? 'you' : 'ai';

  if (role === 'ai') {
    bubble.innerHTML = formatMarkdown(text);
  } else {
    bubble.textContent = text;
  }

  appendToChat(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

chatMessages.addEventListener("click", async e => {
  const btn = e.target.closest(".code-copy");
  if (!btn) return;
  const code = btn.closest(".code-block").querySelector("code").textContent;
  try {
    await navigator.clipboard.writeText(code);
    btn.textContent = "Copied";
    setTimeout(() => (btn.textContent = "Copy"), 1200);
  } catch (err) {
    console.error("Не удалось скопировать:", err);
  }
});

function addChatMessage(text, role) {
  const bubble = renderMessage(text, role);
  chatLog.push({ role, text, ts: Date.now() });
  saveChatLog();
  return bubble;
}

// восстанавливаем сохранённую историю при запуске приложения
for (const entry of chatLog) {
  if (entry && typeof entry.text === "string" && (entry.role === "user" || entry.role === "ai")) {
    renderMessage(entry.text, entry.role);
  }
}

let typingBubble = null;

function showTypingIndicator() {
  chatEmptyState.style.display = 'none';
  const bubble = document.createElement('div');
  bubble.className = 'chat-msg ai loading';
  bubble.dataset.role = 'ai';
  bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  appendToChat(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  typingBubble = bubble;
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  addChatMessage(text, 'user');
  chatInput.value = '';
  showTypingIndicator();
  window.api.sendMessageToAI(text);
  //
  // const reply = await window.api.sendChatMessage(text);
  // addChatMessage(reply, 'ai');
});

window.api.onReplyFromAI(data => {
  addChatMessage(data, "ai");
})

// текст дописывается по мере прихода
let streamBubble = null;
let streamText = "";
let streamLogEntry = null; // запись в chatLog которая обновляеться

window.api.onReplyChunk(chunk => {
  if (!streamBubble) {
    if (typingBubble) {
      //тот же элемент без пересоздания
      streamBubble = typingBubble;
      streamBubble.classList.remove('loading');
      streamBubble.innerHTML = '';
      typingBubble = null;
    } else {
      streamBubble = renderMessage("", "ai");
    }
    streamText = "";
    streamLogEntry = { role: "ai", text: "", ts: Date.now() };
    chatLog.push(streamLogEntry);
  }
  streamText += chunk;
  streamBubble.innerHTML = formatMarkdown(streamText);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  streamLogEntry.text = streamText;
  saveChatLog();
});

window.api.onReplyEnd(tail => {
  if (typingBubble) {
    typingBubble.classList.remove('loading');
    typingBubble.innerHTML = '';
    streamBubble = typingBubble;
    typingBubble = null;
  }
  if (tail) {
    if (streamBubble) {
      streamText += tail;
      streamBubble.innerHTML = formatMarkdown(streamText);
      if (!streamLogEntry) { streamLogEntry = { role: "ai", text: "", ts: Date.now() }; chatLog.push(streamLogEntry); }
      streamLogEntry.text = streamText;
    } else {
      addChatMessage(tail, "ai");
    }
  }
  saveChatLog();
  streamBubble = null;
  streamText = "";
  streamLogEntry = null;
});
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

const chatIllustration = document.getElementById('chat-illustration');

function addChatMessage(text, role) {
  chatIllustration.style.display = 'none'; // что бы спрятать илюстрацию 

  const bubble = document.createElement('div');
  bubble.className = `chat-msg ${role}`;
  bubble.dataset.role = role === 'user' ? 'you' : 'ai';
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  addChatMessage(text, 'user');
  chatInput.value = '';
  const reply = await window.api.sendChatMessage(text);
  addChatMessage(reply, 'ai');
});
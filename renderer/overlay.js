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

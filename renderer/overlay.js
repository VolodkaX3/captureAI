document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.api.hideOverlay();
  }
});

document.getElementById('btn-close').addEventListener('click', () => {
  window.api.hideOverlay();
});

document.getElementById('btn-shot').addEventListener('click', () => {
  console.log('');
});

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

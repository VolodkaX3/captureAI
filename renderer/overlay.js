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



// Settings button
const settingsPanel = document.getElementById('settings-panel');

document.getElementById('btn-settings').addEventListener('click', () => {
  settingsPanel.classList.remove('hidden');
});

document.getElementById('btn-settings-close').addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
});

// Чтобы подключить новую кнопку:
// document.getElementById('btn-yourid').addEventListener('click', () => { ... });

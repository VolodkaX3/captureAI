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


document.getElementById('btn-settings').addEventListener('click', () => {
  console.log('');
});

// Чтобы подключить новую кнопку:
// document.getElementById('btn-yourid').addEventListener('click', () => { ... });

const LIQUID_GLASS_URL = 'https://cdn.jsdelivr.net/npm/@ybouane/liquidglass@1.0.3/dist/index.js';

const stage = document.getElementById('stage');
const scene = document.getElementById('scene');
const glassEl = document.getElementById('glass');
const front = document.getElementById('front');

glassEl.dataset.config = JSON.stringify({
    cornerRadius: 32,
    zRadius: 24,
    blurAmount: 0.35,
    refraction: 0.5,
    chromAberration: 0.03,
    edgeHighlight: 0.15,
    specular: 0.2,
    fresnel: 0.7,
    brightness: -0.35,
    shadowOpacity: 0.3,
    shadowSpread: 16,
    shadowOffsetY: 6
});

let glass = null;
let shot = null;
let displayW = 1;
let originX = 0;
let originY = 0;
let drawnX = null;
let drawnY = null;

function drawScene() {
    if (!shot) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cw = Math.round(w * dpr);
    const ch = Math.round(h * dpr);
    if (scene.width !== cw || scene.height !== ch) {
        scene.width = cw;
        scene.height = ch;
    }
    const k = shot.naturalWidth / displayW;
    const ctx = scene.getContext('2d');
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(
        shot,
        (window.screenX - originX) * k, (window.screenY - originY) * k, w * k, h * k,
        0, 0, cw, ch
    );
    drawnX = window.screenX;
    drawnY = window.screenY;
    if (glass) glass.markChanged(scene);
}

function tick() {
    if (window.screenX !== drawnX || window.screenY !== drawnY) drawScene();
    requestAnimationFrame(tick);
}

window.api.onAiScene(async data => {
    try {
        displayW = data.displayW;
        originX = data.originX;
        originY = data.originY;
        shot = new Image();
        shot.src = data.dataUrl;
        await shot.decode();
        drawScene();

        // Импорт внутри try
        const { LiquidGlass } = await import(LIQUID_GLASS_URL);
        glass = await LiquidGlass.init({ root: stage, glassElements: [glassEl] });
    } catch (err) {
        console.error('LiquidGlass не запустился:', err);
    }
    requestAnimationFrame(tick);
    window.api.aiPanelReady(); // окно показывается только теперь
});

// ---------- Перетаскивание по экрану ----------
let grab = null;

front.addEventListener('pointerdown', e => {
    if (e.target.closest('.row')) return; // за поле поиска и кнопку не таскаем
    grab = { sx: e.screenX, sy: e.screenY, wx: window.screenX, wy: window.screenY };
    front.setPointerCapture(e.pointerId);
    front.classList.add('dragging');
    e.preventDefault();
});

front.addEventListener('pointermove', e => {
    if (!grab) return;
    window.api.aiPanelMove({
        x: grab.wx + e.screenX - grab.sx,
        y: grab.wy + e.screenY - grab.sy
    });
});

function endDrag() {
    grab = null;
    front.classList.remove('dragging');
}
front.addEventListener('pointerup', endDrag);
front.addEventListener('pointercancel', endDrag);

// Esc прячет панель
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.api.aiPanelClose();
});
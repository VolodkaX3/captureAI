const stage = document.getElementById("stage");
const scene = document.getElementById("scene");
const front = document.getElementById("front");

let shot = null;      // картинка фона (кусок сделанного скриншота)
let displayW = 1;     // размер экрана в CSS-пикселях
let originX = 0;
let originY = 0;
let drawnX = null;    // последняя позиция окна, для которой рисовали кадр
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
    const k = shot.naturalWidth / displayW; // пикселей скриншота в одном CSS-пикселе экрана
    const ctx = scene.getContext("2d");
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(
        shot,
        (window.screenX - originX) * k, (window.screenY - originY) * k, w * k, h * k,
        0, 0, cw, ch
    );
    drawnX = window.screenX;
    drawnY = window.screenY;
}

function tick() {
    if (window.screenX !== drawnX || window.screenY !== drawnY) drawScene();
    requestAnimationFrame(tick);
}

window.api.onAiScene(async data => {
    displayW = data.displayW;
    originX = data.originX;
    originY = data.originY;

    try {
        shot = new Image();
        shot.src = data.dataUrl;
        await shot.decode();
        drawScene();
    } catch (err) {
        console.error("Не удалось загрузить фон панели:", err);
    }

    requestAnimationFrame(tick);
    window.api.aiPanelReady(); // окно показывается только теперь
});

let grab = null;

front.addEventListener("pointerdown", e => {
    if (e.target.closest(".row, .top-row, .menu")) return;
    grab = { sx: e.screenX, sy: e.screenY, wx: window.screenX, wy: window.screenY };
    front.setPointerCapture(e.pointerId);
    front.classList.add("dragging");
    e.preventDefault();
});

front.addEventListener("pointermove", e => {
    if (!grab) return;
    window.api.aiPanelMove({
        x: grab.wx + e.screenX - grab.sx,
        y: grab.wy + e.screenY - grab.sy
    });
});

function endDrag() {
    grab = null;
    front.classList.remove("dragging");
}
front.addEventListener("pointerup", endDrag);
front.addEventListener("pointercancel", endDrag);

// Esc прячет панель
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        if (!additionalMenu.hidden) setMenuOpen(false);
        else window.api.aiPanelClose();
    }
});

const additionalBtn = document.getElementById("additional-btn");
const additionalMenu = document.getElementById("additional-menu");
const downloadBtn = document.getElementById("download-btn");

const menuItems = [
    { label: "Item One", checked: true },
    { label: "Item Two", checked: false },
    { label: "Item Three", checked: true },
    { label: "Item Four", checked: false },
    { label: "Item Five", checked: false },
    { label: "Item Six", checked: true },
    { label: "Item Seven", checked: false },
    { label: "Item Eight", checked: true },
    { label: "Item Nine", checked: true }
];

const CHECK_SVG =
    '<svg class="check" viewBox="0 0 24 24" fill="none">' +
    '<path d="M4 12.5l5 5L20 6.5" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>' +
    '</svg>';

function renderMenu() {
    additionalMenu.innerHTML = "";
    menuItems.forEach(item => {
        const el = document.createElement("div");
        el.className = "menu-item" + (item.checked ? " checked" : "");
        el.innerHTML = CHECK_SVG + '<span class="label"></span>';
        el.querySelector(".label").textContent = item.label;
        el.addEventListener("click", () => {
            item.checked = !item.checked;
            el.classList.toggle("checked", item.checked);
        });
        additionalMenu.appendChild(el);
    });
}

function setMenuOpen(open) {
    additionalMenu.hidden = !open;
    additionalBtn.classList.toggle("open", open);
}

renderMenu();

additionalBtn.addEventListener("click", e => {
    e.stopPropagation();
    setMenuOpen(additionalMenu.hidden);
});

//клик мимо меню закрывает его
document.addEventListener("pointerdown", e => {
    if (additionalMenu.hidden) return;
    if (e.target.closest(".menu, #additional-btn")) return;
    setMenuOpen(false);
});

downloadBtn.addEventListener("click", () => {
    downloadBtn.classList.add("active");
    //загрузка фото SOON
});
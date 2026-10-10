window.api.onScreenshotCapture(data => {
    document.querySelector("#bg").src = data;
})

const bg = document.querySelector("#bg");
const selection = document.querySelector("#selection");
const clickWrapper = document.querySelector("#clickWrapper");

//из index.html
const selectionPanel = document.querySelector("#selection-panel");

const minSizeX = 50;
const minSizeY = 50;

let isMouseDown = false;

let startX = 0;
let startY = 0;
let endX = 100;
let endY = 100;

function endSelection() {
    isMouseDown = false;
    let invertX = false;
    let invertY = false;
    if (startX > endX) {
        [startX, endX] = [endX, startX];
        invertX = true;
    }
    if (startY > endY) {
        [startY, endY] = [endY, startY];
        invertY = true;
    }
    if (endX - startX < minSizeX) {
        if (startX + minSizeX> bg.offsetWidth) {
            startX = bg.offsetWidth - minSizeX;
            endX = bg.offsetWidth;
        } else if (endX - minSizeX< 0) {
            startX = 0;
            endX = minSizeX;
        } else {
            if (invertX) startX = endX - minSizeX;
            else endX = startX + minSizeX;
        }
        selection.style.width = `${Math.abs(startX - endX)}px`;
        selection.style.left = `${startX}px`;
    }
    if (endY - startY < minSizeY) {
        if (startY + minSizeY > bg.offsetHeight) {
            startY = bg.offsetHeight - minSizeY;
            endY = bg.offsetHeight;
        } else if (endY - minSizeY < 0) {
            startY = 0;
            endY = minSizeY;
        } else {
            if (invertY) startY = endY - minSizeY;
            else endY = startY + minSizeY;
        }
        selection.style.height = `${Math.abs(startY - endY)}px`;
        selection.style.top = `${startY}px`;
    }
    selectionPanel.classList.remove("hidden");
}

clickWrapper.addEventListener("mousedown", event => {
    
    cutBtn?.classList.remove("active");

    selectionPanel.classList.add("hidden");
    const x = Math.min(event.clientX, bg.offsetWidth);
    const y = Math.min(event.clientY, bg.offsetHeight);
    if (isMouseDown) {
        endX = x;
        endY = y;
        endSelection();
        return;
    }
    selection.style.left = `${x}px`;
    selection.style.top = `${y}px`;
    selection.style.width = "0px";
    selection.style.height = "0px";
    startX = x;
    startY = y;
    isMouseDown = true;
})

clickWrapper.addEventListener("mousemove", event => {
    if (!isMouseDown) return;
    const x = Math.min(event.clientX, bg.offsetWidth);
    const y = Math.min(event.clientY, bg.offsetHeight);
    selection.style.width = `${Math.abs(startX - x)}px`;
    selection.style.height = `${Math.abs(startY - y)}px`;
    selection.style.left = `${Math.min(x, startX)}px`;
    selection.style.top = `${Math.min(y, startY)}px`;
})

clickWrapper.addEventListener("mouseup", event => {
    const x = Math.min(event.clientX, bg.offsetWidth);
    const y = Math.min(event.clientY, bg.offsetHeight);
    endX = x;
    endY = y;
    endSelection();
})

const cutBtn = document.querySelector("#cut-btn");

cutBtn.addEventListener("click", async () => {
    const png = await window.api.cutSelection({
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
        viewW: bg.offsetWidth,
        viewH: bg.offsetHeight
    });
    if (!png) return;

    try {
        const blob = new Blob([png], { type: "image/png" });
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        cutBtn.classList.add("active");
    } catch (err) {
        console.error("Error width copy:", err);
    }
});

document.querySelector("#search-btn").addEventListener("click", () => {
    const GAP = 12;
    const SIDE_PANEL_W = 64;
    const PANEL_W = 270;
    const r = selection.getBoundingClientRect();
    const border = (window.outerWidth - window.innerWidth) / 2;
    const contentX = window.screenX + border;
    const contentY = window.screenY + (window.outerHeight - window.innerHeight - border);
    let x = contentX + r.right + GAP + SIDE_PANEL_W + GAP;
    if (x + PANEL_W > window.screen.width - GAP) x = contentX + r.left - GAP - PANEL_W;
    window.api.toggleAiPanel({ x, y: contentY + r.top });
});
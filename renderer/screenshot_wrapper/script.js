window.api.onScreenshotCapture((event, data) => {
    document.querySelector("#bg").src = data;
})

const selection = document.querySelector("#selection");
const clickWrapper = document.querySelector("#clickWrapper");

let isMouseDown = false;
let startX = 0;
let startY = 0;

clickWrapper.addEventListener("mousedown", event => {
    selection.style.left = `${event.clientX}px`;
    selection.style.top = `${event.clientY}px`;
    selection.style.width = "0px";
    selection.style.height = "0px";
    startX = event.clientX;
    startY = event.clientY;
    isMouseDown = true;
})

clickWrapper.addEventListener("mousemove", event => {
    if (!isMouseDown) return;
    selection.style.width = `${Math.abs(startX - event.clientX)}px`;
    selection.style.height = `${Math.abs(startY - event.clientY)}px`;
    selection.style.left = `${Math.min(event.clientX, startX)}px`;
    selection.style.top = `${Math.min(event.clientY, startY)}px`;
})

clickWrapper.addEventListener("mouseup", event => {
    isMouseDown = false;
})
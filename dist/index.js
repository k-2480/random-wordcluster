"use strict";
const inputTextarea = (document.querySelector("#input-textarea"));
const outputCanvas = (document.querySelector("#output-canvas"));
const inputTitle = (document.querySelector("#input-title"));
const reloadButton = (document.querySelector("#reload-button"));
let minFontSizeVal = (document.querySelector("#min-font-size-val"));
let maxFontSizeVal = (document.querySelector("#max-font-size-val"));
let snapshotButton = (document.querySelector("#snapshot-button"));
let snapshotArea = (document.querySelector("#snapshot"));
const inputElements = {
    minFontSize: document.querySelector("#min-font-size"),
    maxFontSize: document.querySelector("#max-font-size"),
    canvasWidth: document.querySelector("#canvas-width"),
    canvasHeight: document.querySelector("#canvas-height"),
    backgroundColor: (document.querySelector("#background-color")),
    fontColor: document.querySelector("#font-color"),
};
const titleFontSize = 20;
const wordLimit = 100;
let plots = [];
inputTextarea.addEventListener("change", () => {
    initialize();
    drawText(outputCanvas, createWords(inputTextarea), inputTitle.value);
});
inputTitle.addEventListener("change", () => {
    initialize();
    drawText(outputCanvas, createWords(inputTextarea), inputTitle.value);
});
reloadButton.addEventListener("click", () => {
    initialize();
    drawText(outputCanvas, createWords(inputTextarea), inputTitle.value);
});
snapshotButton.addEventListener("click", snapshot);
for (let key in inputElements) {
    inputElements[key].addEventListener("change", () => {
        initialize();
        drawText(outputCanvas, createWords(inputTextarea), inputTitle.value);
    });
}
initialize();
drawText(outputCanvas, createWords(inputTextarea), inputTitle.value);
function snapshot() {
    outputCanvas.toBlob((result) => {
        let imageURL = URL.createObjectURL(result);
        let snapshotContainer = document.createElement("div");
        let snapshotImage = document.createElement("img");
        let datetimeSpan = document.createElement("span");
        datetimeSpan.innerText = now();
        snapshotImage.src = imageURL;
        snapshotContainer.append(datetimeSpan);
        snapshotContainer.append(snapshotImage);
        snapshotArea.append(snapshotContainer);
    });
}
function initialize() {
    minFontSizeVal.innerText = inputElements.minFontSize.value;
    maxFontSizeVal.innerText = inputElements.maxFontSize.value;
    outputCanvas.width = parseInt(inputElements.canvasWidth.value);
    outputCanvas.height = parseInt(inputElements.canvasHeight.value);
}
function createWords(textarea) {
    if (!textarea || !textarea.value)
        return [];
    let words = convertTextToWords(textarea.value);
    return words.slice(-1 * wordLimit).sort((a, b) => b.length - a.length);
}
function convertTextToWords(text) {
    let textLines = text.split(/\n|。/g);
    let speechLines = new Set(textLines
        .filter((s) => {
        return s.slice(0, 1) === "「" || s.slice(-1) === "」";
    })
        .map((s) => {
        return s.replace(/「|」/g, "");
    }));
    let splitedText = [...speechLines];
    return splitedText;
}
function drawText(canvas, words, title) {
    let context = (canvas.getContext("2d"));
    let fontColor = getColorInput(inputElements.fontColor.value);
    let backgroundColor = getColorInput(inputElements.backgroundColor.value);
    console.log(words);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = rgba(backgroundColor, 1);
    context.fillRect(0, 0, canvas.width, canvas.height);
    plots = [];
    words.forEach((word) => {
        randomTextPlot(context, word, canvas.width, canvas.height);
    });
    context.font = titleFontSize + "px 'Noto Serif JP'";
    context.fillStyle = rgba(backgroundColor, 0.75);
    context.fillRect(0, 0, title.length * titleFontSize + titleFontSize * 2, titleFontSize * 2);
    context.fillStyle = rgba(fontColor, 1);
    context.fillText(title, titleFontSize, titleFontSize * 1.25);
    console.log("done.");
}
function randomTextPlot(context, text, maxWidth, maxHeight) {
    let maxFontSize = +inputElements.maxFontSize.value;
    let minFontSize = +inputElements.minFontSize.value;
    const hugeMaxFontSize = 50;
    const hugeMinFontSize = 40;
    if (Math.random() < 0.03) {
        maxFontSize = hugeMaxFontSize;
        minFontSize = hugeMinFontSize;
    }
    let fontSizeSeed = Math.random();
    let fontSize = Math.floor(fontSizeSeed * (maxFontSize - minFontSize) + minFontSize);
    let textWidth = fontSize * text.length;
    let a = fontSize / hugeMaxFontSize;
    let plotY = Math.floor(Math.random() * maxHeight);
    let plotX = Math.floor(Math.random() * (maxWidth - textWidth));
    let loopFlg = false;
    if (plots.length > 0)
        loopFlg = true;
    let cnt = 0;
    while (loopFlg) {
        loopFlg = false;
        plotY = Math.floor(Math.random() * maxHeight);
        plotX = Math.floor(Math.random() * (maxWidth - textWidth));
        plots.forEach((v) => {
            if (Math.abs(plotX - v.x) < (textWidth + v.w) / 2 &&
                Math.abs(plotY - v.y) < (fontSize + v.h) / 2) {
                loopFlg = true;
                return;
            }
        });
        if (cnt++ > 1000)
            break;
    }
    console.log(`${cnt} loop`);
    context.lineWidth = 0.5;
    context.fillStyle = rgba(getColorInput(inputElements.fontColor.value), a);
    context.font = fontSize + "px 'Noto Serif JP'";
    context.fillText(text, plotX, plotY);
    console.log(text);
    plots.push({
        x: plotX,
        y: plotY,
        w: textWidth,
        h: fontSize,
    });
}
function rgba(rgb, a) {
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}
function getColorInput(color) {
    return {
        r: parseInt(color.substring(1, 3), 16),
        g: parseInt(color.substring(3, 5), 16),
        b: parseInt(color.substring(5, 7), 16),
    };
}
function now() {
    let date = new Date();
    return `${zeroPadding(date.getFullYear().toString(), 4)}-${zeroPadding((date.getMonth() - 1).toString(), 2)}-${zeroPadding(date.getDate().toString(), 2)} ${zeroPadding(date.getHours().toString(), 2)}:${zeroPadding(date.getMinutes().toString(), 2)}:${zeroPadding(date.getSeconds().toString(), 2)}`;
}
function zeroPadding(str, digit) {
    let zeros = "";
    for (let i = 0; i < digit; i++) {
        zeros += "0";
    }
    return (zeros + str).slice(-1 * digit);
}
//# sourceMappingURL=index.js.map
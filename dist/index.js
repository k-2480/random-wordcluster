"use strict";
class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    isCollided(rect) {
        if (this.x > rect.x + rect.w
            || this.x + this.w < rect.x
            || this.y > rect.y + rect.h
            || this.y + this.h < rect.y) {
            return false;
        }
        return true;
    }
    toString() {
        return `${this.x}:${this.y}:${this.w}:${this.h}`;
    }
}
const inputTextarea = (document.querySelector("#input-textarea"));
const outputCanvas = (document.querySelector("#output-canvas"));
const inputTitle = (document.querySelector("#input-title"));
const reloadButton = (document.querySelector("#reload-button"));
let minFontSizeVal = (document.querySelector("#min-font-size-val"));
let maxFontSizeVal = (document.querySelector("#max-font-size-val"));
let snapshotButton = (document.querySelector("#snapshot-button"));
let snapshotArea = (document.querySelector("#snapshot"));
let textFontSelect = (document.querySelector("#text-font"));
const inputElements = {
    minFontSize: document.querySelector("#min-font-size"),
    maxFontSize: document.querySelector("#max-font-size"),
    canvasWidth: document.querySelector("#canvas-width"),
    canvasHeight: document.querySelector("#canvas-height"),
    backgroundColor: (document.querySelector("#background-color")),
    fontColor: document.querySelector("#font-color"),
    bigFontNum: document.querySelector("#big-font-num"),
};
const titleFontSize = 25;
const firstFontSize = 50;
const wordLimit = 100;
// let plots: { [key: string]: number }[] = [];
let plots = [];
inputTextarea.addEventListener("change", () => {
    initialize();
});
inputTitle.addEventListener("change", () => {
    initialize();
});
reloadButton.addEventListener("click", () => {
    initialize();
});
textFontSelect.addEventListener("change", (e) => {
    initialize();
    textFontSelect.setAttribute("style", `font-family: '${textFontSelect.value}'`);
});
snapshotButton.addEventListener("click", snapshot);
for (let key in inputElements) {
    inputElements[key].addEventListener("change", (e) => {
        initialize();
    });
}
initialize();
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
    drawText(outputCanvas, createWords(inputTextarea), inputTitle.value);
}
function createWords(textarea) {
    if (!textarea || !textarea.value)
        return [];
    let words = convertTextToWords(textarea.value);
    return words.slice(-1 * wordLimit).sort(() => Math.random() - 0.5);
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
    const minFontSize = +inputElements.minFontSize.value;
    const maxFontSize = +inputElements.maxFontSize.value;
    const bigFontNum = +inputElements.bigFontNum.value;
    let unitSize = (maxFontSize - minFontSize) / words.length;
    let currentFontSize = maxFontSize;
    console.log(words);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = rgba(backgroundColor, 1);
    context.fillRect(0, 0, canvas.width, canvas.height);
    plots = [];
    let index = 0;
    words.forEach((word) => {
        randomTextPlot(context, word, canvas.width, canvas.height, (index < bigFontNum ? firstFontSize : currentFontSize));
        index++;
        currentFontSize -= unitSize;
    });
    console.log(plots);
    context.font = `${titleFontSize}px '${textFontSelect.value}'`;
    console.log(context.font);
    context.fillStyle = rgba(backgroundColor, 0.75);
    context.fillRect(0, 0, title.length * titleFontSize + titleFontSize * 2, titleFontSize * 2);
    context.fillStyle = rgba(fontColor, 1);
    context.fillText(title, titleFontSize, titleFontSize * 1.25);
    console.log("done.");
}
function randomTextPlot(context, text, maxWidth, maxHeight, fontSize) {
    let tryFontSize = fontSize;
    let textWidth = tryFontSize * text.length;
    let a = tryFontSize / (+inputElements.maxFontSize.value + 10);
    let plotX = Math.floor(Math.random() * (maxWidth - textWidth));
    let plotY = Math.floor(Math.random() * maxHeight);
    let wordRect = new Rectangle(plotX, plotY, textWidth, tryFontSize);
    let loopFlg = false;
    if (plots.length > 0)
        loopFlg = true;
    let cnt = 0;
    while (loopFlg) {
        loopFlg = false;
        a = tryFontSize / (+inputElements.maxFontSize.value + 10);
        wordRect.w = tryFontSize * text.length;
        wordRect.h = tryFontSize;
        wordRect.x = Math.floor(Math.random() * (maxWidth - wordRect.w));
        wordRect.y = Math.floor(Math.random() * (maxHeight - wordRect.h));
        plots.forEach((v) => {
            if (wordRect.isCollided(v)) {
                loopFlg = true;
                return;
            }
        });
        if (cnt++ > 100) {
            console.log('RESET ' + tryFontSize);
            cnt = 0;
            tryFontSize--;
        }
        if (tryFontSize <= 5) {
            console.log('諦めました。');
            break;
        }
    }
    context.lineWidth = 0.5;
    context.fillStyle = rgba(getColorInput(inputElements.fontColor.value), a);
    context.font = `${tryFontSize}px '${textFontSelect.value}'`;
    context.fillText(text, wordRect.x, wordRect.y + wordRect.h, tryFontSize * wordRect.w);
    plots.push(wordRect);
}
function rgba(rgb, a) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
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
    return `${zeroPadding(date.getFullYear().toString(), 4)} -${zeroPadding((date.getMonth() - 1).toString(), 2)} -${zeroPadding(date.getDate().toString(), 2)} ${zeroPadding(date.getHours().toString(), 2)}:${zeroPadding(date.getMinutes().toString(), 2)}:${zeroPadding(date.getSeconds().toString(), 2)} `;
}
function zeroPadding(str, digit) {
    let zeros = "";
    for (let i = 0; i < digit; i++) {
        zeros += "0";
    }
    return (zeros + str).slice(-1 * digit);
}
//# sourceMappingURL=index.js.map
const inputTextarea: HTMLTextAreaElement = <HTMLTextAreaElement>(
    document.querySelector("#input-textarea")
);
const outputCanvas: HTMLCanvasElement = <HTMLCanvasElement>(
    document.querySelector("#output-canvas")
);
const inputTitle: HTMLInputElement = <HTMLInputElement>(
    document.querySelector("#input-title")
);
const reloadButton: HTMLButtonElement = <HTMLButtonElement>(
    document.querySelector("#reload-button")
);
let minFontSizeVal: HTMLSpanElement = <HTMLInputElement>(
    document.querySelector("#min-font-size-val")
);
let maxFontSizeVal: HTMLSpanElement = <HTMLInputElement>(
    document.querySelector("#max-font-size-val")
);
let snapshotButton: HTMLButtonElement = <HTMLButtonElement>(
    document.querySelector("#snapshot-button")
);
let snapshotArea: HTMLDivElement = <HTMLDivElement>(
    document.querySelector("#snapshot")
);

const inputElements: { [key: string]: HTMLInputElement } = {
    minFontSize: <HTMLInputElement>document.querySelector("#min-font-size"),
    maxFontSize: <HTMLInputElement>document.querySelector("#max-font-size"),
    canvasWidth: <HTMLInputElement>document.querySelector("#canvas-width"),
    canvasHeight: <HTMLInputElement>document.querySelector("#canvas-height"),
    backgroundColor: <HTMLInputElement>(
        document.querySelector("#background-color")
    ),
    fontColor: <HTMLInputElement>document.querySelector("#font-color"),
};
const titleFontSize: number = 20;
const wordLimit: number = 100;

let plots: { [key: string]: number }[] = [];

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
        let imageURL = URL.createObjectURL(<Blob>result);
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

function createWords(textarea: HTMLTextAreaElement): string[] {
    if (!textarea || !textarea.value) return [];
    let words = convertTextToWords(textarea.value);
    return words.slice(-1 * wordLimit).sort((a, b) => b.length - a.length);
}

function convertTextToWords(text: string) {
    let textLines = text.split(/\n|。/g);
    let speechLines = new Set(
        textLines
            .filter((s) => {
                return s.slice(0, 1) === "「" || s.slice(-1) === "」";
            })
            .map((s) => {
                return s.replace(/「|」/g, "");
            })
    );
    let splitedText = [...speechLines];

    return splitedText;
}

function drawText(canvas: HTMLCanvasElement, words: string[], title: string) {
    let context: CanvasRenderingContext2D = <CanvasRenderingContext2D>(
        canvas.getContext("2d")
    );

    let fontColor: { [key: string]: number } = getColorInput(
        inputElements.fontColor.value
    );
    let backgroundColor: { [key: string]: number } = getColorInput(
        inputElements.backgroundColor.value
    );

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
    context.fillRect(
        0,
        0,
        title.length * titleFontSize + titleFontSize * 2,
        titleFontSize * 2
    );
    context.fillStyle = rgba(fontColor, 1);
    context.fillText(title, titleFontSize, titleFontSize * 1.25);

    console.log("done.");
}

function randomTextPlot(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxHeight: number
) {
    let maxFontSize: number = +inputElements.maxFontSize.value;
    let minFontSize: number = +inputElements.minFontSize.value;
    const hugeMaxFontSize: number = 50;
    const hugeMinFontSize: number = 40;

    if (Math.random() < 0.03) {
        maxFontSize = hugeMaxFontSize;
        minFontSize = hugeMinFontSize;
    }

    let fontSizeSeed: number = Math.random();
    let fontSize: number = Math.floor(
        fontSizeSeed * (maxFontSize - minFontSize) + minFontSize
    );

    let textWidth: number = fontSize * text.length;
    let a: number = fontSize / hugeMaxFontSize;
    let plotY: number = Math.floor(Math.random() * maxHeight);
    let plotX: number = Math.floor(Math.random() * (maxWidth - textWidth));
    let loopFlg: boolean = false;
    if (plots.length > 0) loopFlg = true;

    let cnt: number = 0;
    while (loopFlg) {
        loopFlg = false;
        plotY = Math.floor(Math.random() * maxHeight);
        plotX = Math.floor(Math.random() * (maxWidth - textWidth));
        plots.forEach((v) => {
            if (
                Math.abs(plotX - v.x) < (textWidth + v.w) / 2 &&
                Math.abs(plotY - v.y) < (fontSize + v.h) / 2
            ) {
                loopFlg = true;
                return;
            }
        });
        if (cnt++ > 1000) break;
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

function rgba(rgb: { [key: string]: number }, a: number): string {
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

function getColorInput(color: string): { [key: string]: number } {
    return {
        r: parseInt(color.substring(1, 3), 16),
        g: parseInt(color.substring(3, 5), 16),
        b: parseInt(color.substring(5, 7), 16),
    };
}

function now() {
    let date = new Date();
    return `${zeroPadding(date.getFullYear().toString(), 4)}-${zeroPadding(
        (date.getMonth() - 1).toString(),
        2
    )}-${zeroPadding(date.getDate().toString(), 2)} ${zeroPadding(
        date.getHours().toString(),
        2
    )}:${zeroPadding(date.getMinutes().toString(), 2)}:${zeroPadding(
        date.getSeconds().toString(),
        2
    )}`;
}

function zeroPadding(str: string, digit: number) {
    let zeros = "";
    for (let i = 0; i < digit; i++) {
        zeros += "0";
    }
    return (zeros + str).slice(-1 * digit);
}

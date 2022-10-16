class Rectangle {
    constructor(public x: number, public y: number, public w: number, public h: number) { }

    isCollided(rect: Rectangle): boolean {
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
let textFontSelect: HTMLSelectElement = <HTMLSelectElement>(
    document.querySelector("#text-font")
);
let textAlphaFlg: HTMLInputElement = <HTMLInputElement>(
    document.querySelector("#text-alpha-flg")
);
let dialogueFlg: HTMLInputElement = <HTMLInputElement>(
    document.querySelector("#dialogue-flg")
);

const inputElements: { [key: string]: HTMLInputElement | HTMLSelectElement } = {
    minFontSize: <HTMLInputElement>document.querySelector("#min-font-size"),
    maxFontSize: <HTMLInputElement>document.querySelector("#max-font-size"),
    canvasWidth: <HTMLInputElement>document.querySelector("#canvas-width"),
    canvasHeight: <HTMLInputElement>document.querySelector("#canvas-height"),
    backgroundColor: <HTMLInputElement>(
        document.querySelector("#background-color")
    ),
    fontColor: <HTMLInputElement>document.querySelector("#font-color"),
    bigFontNum: <HTMLInputElement>document.querySelector("#big-font-num"),
};
const titleFontSize: number = 25;
const firstFontSize: number = 50;
const wordLimit: number = 100;

// let plots: { [key: string]: number }[] = [];
let plots: Rectangle[] = [];

inputTextarea.addEventListener("change", () => {
    initialize();
});
inputTitle.addEventListener("change", () => {
    initialize();
});
reloadButton.addEventListener("click", () => {
    initialize();
});
textFontSelect.addEventListener("change", (e: Event) => {
    initialize();
    textFontSelect.setAttribute("style", `font-family: '${textFontSelect.value}'`);
});
textAlphaFlg.addEventListener("change", initialize);
dialogueFlg.addEventListener("change", initialize);
snapshotButton.addEventListener("click", snapshot);
for (let key in inputElements) {
    inputElements[key].addEventListener("change", (e) => {
        initialize();
    });
}
initialize();

console.log(inputElements.alphaSwitch);

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

    drawText(outputCanvas, createWords(inputTextarea), inputTitle.value);
}

function createWords(textarea: HTMLTextAreaElement): string[] {
    if (!textarea || !textarea.value) return [];
    let words = convertTextToWords(textarea.value);
    return words.slice(-1 * wordLimit).sort(() => Math.random() - 0.5);
}

function convertTextToWords(text: string) {
    let textLines = text.split(/\n|。/g);
    let speechLines = new Set(
        textLines
            .filter((s) => {
                let targetFlg: boolean = s.slice(0, 1) === "「" || s.slice(-1) === "」";
                targetFlg = targetFlg || !dialogueFlg.checked;
                return targetFlg;
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
    const minFontSize: number = +inputElements.minFontSize.value;
    const maxFontSize: number = +inputElements.maxFontSize.value;
    const bigFontNum: number = +inputElements.bigFontNum.value;
    let unitSize: number = (maxFontSize - minFontSize) / words.length;
    let currentFontSize: number = maxFontSize;

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
    maxHeight: number,
    fontSize: number
) {
    let tryFontSize: number = fontSize;
    let textWidth: number = tryFontSize * text.length;
    let a: number = tryFontSize / (+inputElements.maxFontSize.value + 10);
    let plotX: number = Math.floor(Math.random() * (maxWidth - textWidth));
    let plotY: number = Math.floor(Math.random() * maxHeight);
    let wordRect = new Rectangle(plotX, plotY, textWidth, tryFontSize);

    let loopFlg: boolean = false;
    if (plots.length > 0) loopFlg = true;

    let cnt: number = 0;
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

    if (!textAlphaFlg.checked) {
        a = 1.0;
    }
    context.fillStyle = rgba(getColorInput(inputElements.fontColor.value), a);
    context.font = `${tryFontSize}px '${textFontSelect.value}'`;

    context.fillText(text, wordRect.x, wordRect.y + wordRect.h, tryFontSize * wordRect.w);

    plots.push(wordRect);
}

function rgba(rgb: { [key: string]: number }, a: number): string {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
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
    return `${zeroPadding(date.getFullYear().toString(), 4)} -${zeroPadding(
        (date.getMonth() - 1).toString(),
        2
    )
        } -${zeroPadding(date.getDate().toString(), 2)} ${zeroPadding(
            date.getHours().toString(),
            2
        )
        }:${zeroPadding(date.getMinutes().toString(), 2)}:${zeroPadding(
            date.getSeconds().toString(),
            2
        )
        } `;
}

function zeroPadding(str: string, digit: number) {
    let zeros = "";
    for (let i = 0; i < digit; i++) {
        zeros += "0";
    }
    return (zeros + str).slice(-1 * digit);
}

const { pdfjsLib } = globalThis;
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

let currentPDF = null;
let papers = {};

document.renderPDF = function (file) {
    if(currentPDF !== null) {
        currentPDF.destroy();
        currentPDF = null;
        document.getElementById("pdf-canvas").remove();
    }

    let canvasElement = document.createElement("canvas");
    canvasElement.id = "pdf-canvas";
    document.getElementById("question-box").appendChild(canvasElement);

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = function() {
        const typedArray = new Uint8Array(this.result);

        let loadingTask = pdfjsLib.getDocument(typedArray);
        loadingTask.promise.then(async function (pdf) {
            currentPDF = pdf;
            if (papers[file]) {
                await renderQuestion(pdf, papers[file]);
            } else {
                getQuestionsFromPaper(pdf).then(async (maxQuestion) => {
                    papers[file] = {max: maxQuestion, selectedQuestions: []}
                    await renderQuestion(pdf, papers[file]);
                });
            }
        }, function (reason) {
            console.error(reason);
        });
    };
}

function renderPage(page, questionItem, nextQuestionItem) {
    const transform = questionItem.transform;
    const x = transform[4];
    const y = transform[5];
    const width = questionItem.width;
    const height = questionItem.height;

    const nextTransform = nextQuestionItem.transform;
    const nextX = nextTransform[4];
    const nextY = nextTransform[5];
    const nextWidth = nextQuestionItem.width;
    const nextHeight = nextQuestionItem.height;

    const canvas = document.getElementById('pdf-canvas');
    canvas.height = 1600;
    canvas.width = 2000;
    const context = canvas.getContext('2d');

    const result = convertToCanvasCoords(x, y, width, height, canvas.height, 2);
    const nextResult = convertToCanvasCoords(nextX, nextY, nextWidth, nextHeight, canvas.height, 2);

    canvas.height = nextResult[1] - result[1]

    const viewport = page.getViewport({
        scale: 2,
        offsetX: 5 -result[0],
        offsetY: -30 -result[1]
    })

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };
    const renderTask = page.render(renderContext);
}

function renderPageDefault(page, questionItem) {
    const transform = questionItem.transform;
    const x = transform[4];
    const y = transform[5];
    const width = questionItem.width;
    const height = questionItem.height;

    const canvas = document.getElementById('pdf-canvas');
    canvas.height = 800;
    canvas.width = 600;
    const context = canvas.getContext('2d');

    const result = convertToCanvasCoords(x, y, width, height, canvas.height, 1);

    const viewport = page.getViewport({
        scale: 1,
        offsetX: 30 -result[0],
        offsetY: -30 -result[1]
    })

    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };
    const renderTask = page.render(renderContext);
}

function getBold(textContent) {
    let boldContent = [];
    for (let i = 0; i < textContent.length; i++) {
        if (textContent[i].fontName.endsWith("f1")) {
            boldContent.push(textContent[i])
        }
    }
    return boldContent;
}

function getQuestionBoundaries(text, questionNumber) {
    for (let i = 0; i < text.length; i++) {
        if (text[i].str === questionNumber.toString() && text[i+1].str === " ") {
            return {result: true, questionItem: text[i]}
        }
    }
    return {result: false, questionItem: null};
}

function getQuestionMarks(text, questionNumber) {
    let marks = 0;
    let start = false;
    for (let i = 0; i < text.length; i++) {
        if (text[i].str === questionNumber.toString() && text[i+1].str === " ") {
            start = true;
        }
        if (text[i].str.startsWith("[") && text[i].str.endsWith("]") && start) {
            let markSubstring = text[i].str.substring(1, text[i].str.length-1);
            let mark = parseInt(markSubstring);
            marks += mark;
        }
        if (text[i].str === (questionNumber + 1).toString() && text[i+1].str === " ") {
            return marks;
        }
    }
    return marks;
}

function getMaxQuestion(text) {
    let max = -1;
    for (let i = 0; i < text.length; i++) {
        if (!isNaN(text[i].str) && text[i+1].str === " ") {
            let int = parseInt(text[i].str)
            if (int > max) {
                max = int;
            }
        }
    }
    return max;
}

async function getQuestionsFromPaper(pdf) {
    const maxPages = pdf.numPages;
    let promises = [];

    for (let pageNo = 2; pageNo <= maxPages; pageNo += 1) {
        let promise = pdf.getPage(pageNo).then(page => {
            return page.getTextContent().then(content => {
                let text = getBold(content.items)
                return getMaxQuestion(text);
            });
        })
        promises.push(promise);
    }

    return Promise.all(promises).then((numbers) => {
        return getMax(numbers);
    })
}

function getMax(array) {
    let max = -1;
    for (let i = 0; i < array.length; i++) {
        if (array[i] > max) max = array[i];
    }
    return max;
}

async function renderQuestion(pdf, paper) {
    const maxPages = pdf.numPages;
    if (maxPages === 1) return;

    let question = pickQuestion(paper);
    let found = false;
    for (let pageNo = 2; pageNo <= maxPages; pageNo += 1) {
        pdf.getPage(pageNo).then(page => {
            page.getTextContent().then(content => {
                let text = getBold(content.items)
                let firstBoundary = getQuestionBoundaries(text, question)
                let secondBoundary = getQuestionBoundaries(text, question + 1)
                if (firstBoundary.result && secondBoundary.result) {
                    let marks = getQuestionMarks(text, question);
                    document.startTimer(marks * 1.5 * 60);

                    renderPage(page, firstBoundary.questionItem, secondBoundary.questionItem);
                    found = true;
                } else if (firstBoundary.result) {
                    let marks = getQuestionMarks(text, question);
                    document.startTimer(marks * 1.5 * 60);

                    renderPageDefault(page, firstBoundary.questionItem);
                    found = true;
                }
            })
        })
        if (found) return;
    }
}

function pickQuestion(paper) {
    if (paper.selectedQuestions.length >= paper.max) {
        paper.selectedQuestions = []
    }
    let questions = [];
    for (let i = 1; i < paper.max + 1; i++) {
        if (!paper.selectedQuestions.includes(i)) questions.push(i);
    }

    let random = Math.floor(Math.random() * questions.length);
    let question = questions[random];
    paper.selectedQuestions.push(question);

    return question;
}

// https://github.com/mozilla/pdf.js/issues/5643
function convertToCanvasCoords(x, y, width, height, canvasHeight, scale) {
    return [x * scale, canvasHeight - ((y + height) * scale), width * scale, height * scale];
}
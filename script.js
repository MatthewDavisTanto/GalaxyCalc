const canvas = document.getElementById("galaxy");
const ctx = canvas.getContext("2d");

const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const errorMessage =
    document.getElementById("error-message");

const buttons =
    document.querySelectorAll(".buttons button");

let expression = "";

let particles = [];

let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;

function resizeCanvas() {
    const ratio =
        Math.min(window.devicePixelRatio, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width =
        width * ratio;

    canvas.height =
        height * ratio;

    canvas.style.width =
        `${width}px`;

    canvas.style.height =
        `${height}px`;

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

    centerX = width / 2;
    centerY = height / 2;

    createGalaxy();
}

function createGalaxy() {
    particles = [];

    const count =
        width < 700
            ? 650
            : 1200;

    for (let i = 0; i < count; i++) {

        const arm =
            i % 4;

        const radius =
            Math.random() *
            Math.min(width, height) *
            0.48;

        const angle =
            Math.random() *
            Math.PI * 2;

        const spiral =
            radius * 0.018;

        particles.push({
            radius,
            angle:
                angle +
                arm *
                (Math.PI * 2 / 4) +
                spiral,

            arm,
            size:
                Math.random() * 1.8 + 0.4,

            alpha:
                Math.random() * 0.65 + 0.2,

            speed:
                Math.random() *
                0.0009 + 0.00025,

            hue:
                175 +
                Math.random() * 90,

            depth:
                Math.random() * 0.65 + 0.35
        });
    }
}

function drawGalaxy() {
    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    const glow =
        ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            Math.min(width, height) * 0.42
        );

    glow.addColorStop(
        0,
        "rgba(255,255,255,0.95)"
    );

    glow.addColorStop(
        0.22,
        "rgba(185,245,255,0.5)"
    );

    glow.addColorStop(
        0.55,
        "rgba(205,185,255,0.18)"
    );

    glow.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );

    ctx.fillStyle = glow;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    ctx.globalCompositeOperation =
        "lighter";

    particles.forEach((particle) => {

        particle.angle +=
            particle.speed *
            particle.depth;

        const armOffset =
            Math.sin(
                particle.radius * 0.018
            ) * 0.75;

        const angle =
            particle.angle +
            armOffset;

        const spread =
            Math.sin(
                particle.radius * 0.012 +
                particle.arm
            ) * 12;

        const x =
            centerX +
            Math.cos(angle) *
            particle.radius +
            spread;

        const y =
            centerY +
            Math.sin(angle) *
            particle.radius *
            0.48 +
            spread * 0.35;

        const color =
            `hsla(${particle.hue}, 85%, 66%, ${particle.alpha})`;

        ctx.beginPath();

        ctx.fillStyle = color;

        ctx.arc(
            x,
            y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    ctx.globalCompositeOperation =
        "source-over";

    requestAnimationFrame(
        drawGalaxy
    );
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();
drawGalaxy();

function updateDisplay() {
    expressionDisplay.textContent =
        expression;
}

function clearCalculator() {
    expression = "";

    expressionDisplay.textContent = "";

    resultDisplay.textContent = "0";

    errorMessage.textContent = "";
}

function deleteLast() {
    expression =
        expression.slice(0, -1);

    errorMessage.textContent = "";

    updateDisplay();
}

function addValue(value) {
    errorMessage.textContent = "";

    const operators =
        ["+", "-", "×", "÷"];

    if (operators.includes(value)) {

        if (expression === "") {

            if (value !== "-") {
                return;
            }
        }

        const last =
            expression.slice(-1);

        if (operators.includes(last)) {
            expression =
                expression.slice(0, -1) +
                value;
        } else {
            expression += value;
        }

        updateDisplay();

        return;
    }

    if (value === ".") {

        const currentNumber =
            expression.split(/[+\-×÷]/).pop();

        if (currentNumber.includes(".")) {
            return;
        }

        if (
            currentNumber === "" ||
            operators.includes(
                expression.slice(-1)
            )
        ) {
            expression += "0.";
        } else {
            expression += ".";
        }

        updateDisplay();

        return;
    }

    expression += value;

    updateDisplay();
}

function calculatePercent() {

    if (expression === "") {
        return;
    }

    const match =
        expression.match(
            /(\d*\.?\d+)$/
        );

    if (!match) {
        return;
    }

    const value =
        Number(match[0]) / 100;

    expression =
        expression.slice(
            0,
            -match[0].length
        ) +
        value;

    updateDisplay();
}

function calculate() {

    errorMessage.textContent = "";

    if (expression === "") {

        errorMessage.textContent =
            "Enter a calculation.";

        return;
    }

    if (
        /[+\-×÷.]$/.test(expression)
    ) {

        errorMessage.textContent =
            "Complete the calculation.";

        return;
    }

    if (
        expression.startsWith("-")
    ) {

        errorMessage.textContent =
            "Invalid calculation.";

        return;
    }

    const normalized =
        expression
            .replace(/×/g, "*")
            .replace(/÷/g, "/");

    if (
        !/^[0-9+\-*/.]+$/.test(normalized)
    ) {

        errorMessage.textContent =
            "Invalid input.";

        return;
    }

    if (
        normalized.includes("/0") &&
        /\/0+(?:\.0*)?$/.test(normalized)
    ) {

        errorMessage.textContent =
            "Cannot divide by zero.";

        return;
    }

    try {

        const tokens =
            normalized.match(
                /\d*\.?\d+|[+\-*/]/g
            );

        if (!tokens) {
            throw new Error();
        }

        let values = [];
        let operators = [];

        function applyOperation() {

            const operator =
                operators.pop();

            const right =
                values.pop();

            const left =
                values.pop();

            let result;

            if (operator === "+") {
                result = left + right;
            }

            if (operator === "-") {
                result = left - right;
            }

            if (operator === "*") {
                result = left * right;
            }

            if (operator === "/") {

                if (right === 0) {
                    throw new Error();
                }

                result =
                    left / right;
            }

            values.push(result);
        }

        function precedence(operator) {

            if (
                operator === "*" ||
                operator === "/"
            ) {
                return 2;
            }

            return 1;
        }

        for (let i = 0; i < tokens.length; i++) {

            const token = tokens[i];

            if (!isNaN(token)) {

                values.push(
                    Number(token)
                );

                continue;
            }

            while (
                operators.length &&
                precedence(
                    operators[
                        operators.length - 1
                    ]
                ) >= precedence(token)
            ) {

                applyOperation();
            }

            operators.push(token);
        }

        while (operators.length) {
            applyOperation();
        }

        const result =
            values[0];

        if (!Number.isFinite(result)) {
            throw new Error();
        }

        resultDisplay.textContent =
            Number.isInteger(result)
                ? result
                : Number(
                    result.toFixed(10)
                );

    } catch {

        errorMessage.textContent =
            "Invalid calculation.";
    }
}

buttons.forEach((button) => {

    const value =
        button.dataset.value;

    const action =
        button.dataset.action;

    button.addEventListener(
        "click",
        () => {

            if (value) {
                addValue(value);
            }

            if (action === "clear") {
                clearCalculator();
            }

            if (action === "delete") {
                deleteLast();
            }

            if (action === "percent") {
                calculatePercent();
            }

            if (action === "calculate") {
                calculate();
            }
        }
    );
});

document.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key;

        if (/^[0-9.]$/.test(key)) {
            addValue(key);
            return;
        }

        if (
            ["+", "-"].includes(key)
        ) {
            addValue(key);
            return;
        }

        if (key === "*") {
            addValue("×");
            return;
        }

        if (key === "/") {

            event.preventDefault();

            addValue("÷");

            return;
        }

        if (
            key === "Enter" ||
            key === "="
        ) {
            calculate();
            return;
        }

        if (key === "Backspace") {
            deleteLast();
            return;
        }

        if (key === "Escape") {
            clearCalculator();
        }
    }
);

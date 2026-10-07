const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const errorMessage = document.getElementById("error-message");
const buttons = document.querySelectorAll(".buttons button");

let expression = "";

function updateDisplay() {
    expressionDisplay.textContent = expression;
}

function clearCalculator() {
    expression = "";
    resultDisplay.textContent = "0";
    errorMessage.textContent = "";
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    errorMessage.textContent = "";
    updateDisplay();
}

function addValue(value) {
    errorMessage.textContent = "";

    const operators = ["+", "-", "×", "÷"];

    if (operators.includes(value)) {
        if (expression === "") {
            if (value !== "-") {
                return;
            }
        }

        const lastCharacter = expression.slice(-1);

        if (operators.includes(lastCharacter)) {
            expression = expression.slice(0, -1) + value;
        } else {
            expression += value;
        }

        updateDisplay();
        return;
    }

    if (value === ".") {
        const currentNumber = expression.split(/[+\-×÷]/).pop();

        if (currentNumber.includes(".")) {
            return;
        }

        if (
            currentNumber === "" ||
            operators.includes(expression.slice(-1))
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

function calculate() {
    errorMessage.textContent = "";

    if (expression === "") {
        errorMessage.textContent = "Please enter a calculation.";
        return;
    }

    if (/[+\-×÷.]$/.test(expression)) {
        errorMessage.textContent = "Please complete the calculation.";
        return;
    }

    const safeExpression = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

    if (!/^[0-9+\-*/. ]+$/.test(safeExpression)) {
        errorMessage.textContent = "Invalid input.";
        return;
    }

    if (/\/0(?:\.0*)?$/.test(safeExpression)) {
        errorMessage.textContent = "Cannot divide by zero.";
        return;
    }

    try {
        const result = Function(
            `"use strict"; return (${safeExpression})`
        )();

        if (!Number.isFinite(result)) {
            errorMessage.textContent = "Invalid calculation.";
            return;
        }

        resultDisplay.textContent =
            Number.isInteger(result)
                ? result
                : Number(result.toFixed(10));

    } catch {
        errorMessage.textContent = "Invalid calculation.";
    }
}

function calculatePercent() {
    if (expression === "") {
        return;
    }

    const match = expression.match(/(\d*\.?\d+)$/);

    if (!match) {
        return;
    }

    const number = Number(match[0]) / 100;

    expression =
        expression.slice(0, -match[0].length) +
        number;

    updateDisplay();
}

buttons.forEach((button) => {

    const value = button.dataset.value;
    const action = button.dataset.action;

    button.addEventListener("click", () => {

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

    });

});

document.addEventListener("keydown", (event) => {

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
        return;
    }

    if (["+", "-"].includes(key)) {
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

    if (key === "Enter" || key === "=") {
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

});

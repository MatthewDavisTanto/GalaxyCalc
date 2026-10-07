const canvas = document.getElementById("galaxy");

const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const errorMessage =
    document.getElementById("error-message");

const buttons =
    document.querySelectorAll(".buttons button");

let expression = "";

const scene = new THREE.Scene();

const parameters = {
    count: 60000,
    size: 0.02,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: "#eb3700",
    outsideColor: "#4dbbcc"
};

let geometry = null;
let material = null;
let points = null;

function generateGalaxy() {

    if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    geometry = new THREE.BufferGeometry();

    const positions =
        new Float32Array(
            parameters.count * 3
        );

    const colors =
        new Float32Array(
            parameters.count * 3
        );

    const colorInside =
        new THREE.Color(
            parameters.insideColor
        );

    const colorOutside =
        new THREE.Color(
            parameters.outsideColor
        );

    for (
        let i = 0;
        i < parameters.count;
        i++
    ) {

        const i3 = i * 3;

        const radius =
            Math.random() *
            parameters.radius;

        const spinAngle =
            radius *
            parameters.spin;

        const branchAngle =
            (i % parameters.branches) /
            parameters.branches *
            Math.PI * 2;

        const randomY =
            Math.pow(
                Math.random(),
                parameters.randomnessPower
            ) *
            (
                Math.random() < 0.5
                    ? 1
                    : -1
            );

        const randomZ =
            Math.pow(
                Math.random(),
                parameters.randomnessPower
            ) *
            (
                Math.random() < 0.5
                    ? 1
                    : -1
            );

        const randomX =
            Math.pow(
                Math.random(),
                parameters.randomnessPower
            ) *
            (
                Math.random() < 0.5
                    ? 1
                    : -1
            );

        positions[i3] =
            Math.cos(
                branchAngle +
                spinAngle
            ) *
            radius +
            randomX;

        positions[i3 + 1] =
            randomY;

        positions[i3 + 2] =
            Math.sin(
                branchAngle +
                spinAngle
            ) *
            radius +
            randomZ;

        const mixedColor =
            colorInside.clone();

        mixedColor.lerp(
            colorOutside,
            radius /
            parameters.radius
        );

        colors[i3] =
            mixedColor.r;

        colors[i3 + 1] =
            mixedColor.g;

        colors[i3 + 2] =
            mixedColor.b;
    }

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(
            colors,
            3
        )
    );

    material =
        new THREE.PointsMaterial({
            size: parameters.size,
            sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });

    points =
        new THREE.Points(
            geometry,
            material
        );

    scene.add(points);
}

generateGalaxy();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

const camera =
    new THREE.PerspectiveCamera(
        52,
        sizes.width / sizes.height,
        0.1,
        100
    );

camera.position.set(
    3,
    1.5,
    3
);

camera.lookAt(0, 0, 0);

scene.add(camera);

const renderer =
    new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

renderer.setSize(
    sizes.width,
    sizes.height
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

window.addEventListener(
    "resize",
    () => {

        sizes.width =
            window.innerWidth;

        sizes.height =
            window.innerHeight;

        camera.aspect =
            sizes.width /
            sizes.height;

        camera.updateProjectionMatrix();

        renderer.setSize(
            sizes.width,
            sizes.height
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );
    }
);

const clock =
    new THREE.Clock();

function animateGalaxy() {

    const elapsedTime =
        clock.getElapsedTime();

    points.rotation.y =
        elapsedTime * 0.05;

    renderer.render(
        scene,
        camera
    );

    requestAnimationFrame(
        animateGalaxy
    );
}

animateGalaxy();

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

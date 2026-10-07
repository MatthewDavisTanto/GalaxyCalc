const canvas = document.getElementById("galaxy");

const birthDateInput =
    document.getElementById("birth-date");

const planetSelect =
    document.getElementById("planet");

const calculateButton =
    document.getElementById("calculate-button");

const resultDisplay =
    document.getElementById("result");

const resultDescription =
    document.getElementById("result-description");

const errorMessage =
    document.getElementById("error-message");

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
        sizes.width /
        sizes.height,
        0.1,
        100
    );

camera.position.set(
    3,
    1.5,
    3
);

camera.lookAt(
    0,
    0,
    0
);

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

const planetYears = {
    earth: 1,
    mercury: 0.2408467,
    venus: 0.61519726,
    mars: 1.8808158,
    jupiter: 11.862615,
    saturn: 29.447498,
    uranus: 84.016846,
    neptune: 164.79132
};

const planetNames = {
    earth: "Earth",
    mercury: "Mercury",
    venus: "Venus",
    mars: "Mars",
    jupiter: "Jupiter",
    saturn: "Saturn",
    uranus: "Uranus",
    neptune: "Neptune"
};

function calculateAge() {

    errorMessage.textContent = "";

    const birthDate =
        birthDateInput.value;

    const planet =
        planetSelect.value;

    if (!birthDate) {

        errorMessage.textContent =
            "Please enter your date of birth.";

        return;
    }

    if (!planet) {

        errorMessage.textContent =
            "Please select a planet.";

        return;
    }

    const birth =
        new Date(
            `${birthDate}T00:00:00`
        );

    const today =
        new Date();

    if (
        Number.isNaN(
            birth.getTime()
        )
    ) {

        errorMessage.textContent =
            "Please enter a valid date.";

        return;
    }

    if (birth > today) {

        errorMessage.textContent =
            "Date of birth cannot be in the future.";

        return;
    }

    const difference =
        today.getTime() -
        birth.getTime();

    const days =
        difference /
        (1000 * 60 * 60 * 24);

    const earthAge =
        days /
        365.2425;

    const galacticAge =
        earthAge /
        planetYears[planet];

    const roundedAge =
        galacticAge.toFixed(2);

    resultDisplay.textContent =
        `${roundedAge} years`;

    resultDescription.textContent =
        `You are ${roundedAge} years old on ${planetNames[planet]}.`;
}

calculateButton.addEventListener(
    "click",
    calculateAge
);

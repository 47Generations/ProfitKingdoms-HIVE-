let moving = false;
const timerValueEl = document.getElementById("timerValue");


const world = {
    caves: [
        { x: 2, y: 10 }
    ],
    cities: [
        {
            name: "BrayBald City",
            x1: 200, y1: 200,
            x2: 300, y2: 300,
            districts: [
                { name: "Market District", x1: 200, y1: 200, x2: 250, y2: 250 },
                { name: "North Residential", x1: 251, y1: 200, x2: 300, y2: 250 },
                { name: "South Alleyways", x1: 200, y1: 251, x2: 300, y2: 300 }
            ]
        },
        {
            name: "Ironreach",
            x1: 50, y1: 50,
            x2: 80, y2: 80
        },
        {
            name: "Goldhaven",
            x1: 400, y1: 100,
            x2: 450, y2: 150
        }
    ]
};

const startingCity = world.cities[0];

const gameState = {
    x: Math.floor((startingCity.x1 + startingCity.x2) / 2),
    y: Math.floor((startingCity.y1 + startingCity.y2) / 2),
    energy: 100,
    gold: 0,
    mapSize: 500
};

gameState.discovered = new Set(); // track explored cells as "x,y"
gameState.discovered.add(`${gameState.x},${gameState.y}`);

// 3️⃣ Utility functions
function updateContent(text) {
    document.getElementById("storyText").textContent = text;
}


function isAtCave() {
    return world.caves.some(cave =>
        cave.x === gameState.x && cave.y === gameState.y
    );
}

function getCurrentCity() {
    return world.cities.find(city =>
        gameState.x >= city.x1 &&
        gameState.x <= city.x2 &&
        gameState.y >= city.y1 &&
        gameState.y <= city.y2
    );
}


function getCurrentDistrict() {
    const city = getCurrentCity();
    if (!city || !city.districts) return null;
    return city.districts.find(d =>
        gameState.x >= d.x1 && gameState.x <= d.x2 &&
        gameState.y >= d.y1 && gameState.y <= d.y2
    );
}

function updateActions(city) {
    const workBtn = document.getElementById("work");
    const marketBtn = document.getElementById("market");

    workBtn.disabled = !city;
    marketBtn.disabled = !city;
}

// 4️⃣ Main functions
function describeLocation() {
    const regionTitle = document.getElementById("regionName");
    const districtTitle = document.getElementById("districtName");
    let text = `You are at (${gameState.x}, ${gameState.y}). `;
    const city = getCurrentCity();
    const district = getCurrentDistrict(); // You’ll define this next


    if (city) {
        regionTitle.textContent = city.name; // h3 shows city name
        districtTitle.textContent = district ? district.name : "General Area";
        text += `You are inside ${city.name}. The streets are busy and alive.`;
    } else if (isAtCave()) {
        regionTitle.textContent = "Dark Cave"; // h3 shows city name
        districtTitle.textContent = district ? district.name : ""; 
        text += "You stand before the mouth of a dark cave.";
    } else {
        regionTitle.textContent = "Wilderness" // h3 shows city name
        districtTitle.textContent = district ? district.name : "";
        text += "You are traveling through the wilderness.";
    }

    updateContent(text);
    updateActions(city);
}

function movePlayer(dx, dy) {
    const targetX = gameState.x + dx;
    const targetY = gameState.y + dy;

    // Check map bounds
    if (targetX < 0 || targetX >= gameState.mapSize || targetY < 0 || targetY >= gameState.mapSize) return;

    // Optional: show a message
    updateContent("Traveling... ⏳");

    setTimeout(() => {
        gameState.x = targetX;
        gameState.y = targetY;

        // Reveal tile
        gameState.discovered.add(`${targetX},${targetY}`);
        
        describeLocation();
    }, 30000); // 30 seconds
}


// 5️⃣ Call describeLocation() on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, running describeLocation");
    describeLocation();
});

// Travel to specific coordinates
function travelToCoords(targetX, targetY) {
    if (moving) return; 
    if (targetX < 0 || targetX >= gameState.mapSize || targetY < 0 || targetY >= gameState.mapSize) {
        alert("Coordinates are out of bounds!");
        return;
    }

    const distance = Math.max(Math.abs(targetX - gameState.x), Math.abs(targetY - gameState.y));
    const travelTime = distance * 30000; // 30s per tile
    let remainingTime = travelTime / 1000; // in seconds

    moving = true;
    document.getElementById("travel-btn").disabled = true;

    // Start timer countdown
    timerValueEl.textContent = `${remainingTime} Seconds`;
    const timerInterval = setInterval(() => {
        remainingTime--;
        timerValueEl.textContent = `${remainingTime} Seconds`;

        if (remainingTime <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);

    updateContent(`Traveling to (${targetX}, ${targetY})... Estimated time: ${travelTime / 1000}s ⏳`);

    // Finish travel
    setTimeout(() => {
        gameState.x = targetX;
        gameState.y = targetY;

        gameState.discovered.add(`${targetX},${targetY}`);
        describeLocation();

        moving = false;
        document.getElementById("travel-btn").disabled = false;
        timerValueEl.textContent = `0 Seconds`;
    }, travelTime);
}


document.getElementById("travel-btn").addEventListener("click", () => {
    const x = parseInt(document.getElementById("coordX").value);
    const y = parseInt(document.getElementById("coordY").value);
    if (isNaN(x) || isNaN(y)) {
        alert("Please enter valid coordinates!");
        return;
    }
    travelToCoords(x, y);
});


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

function generateMiniMap(size = 50) { // bigger = smoother
    const map = [];
    const scale = gameState.mapSize / size;

    for (let y = 0; y < size; y++) {
        let row = "";
        for (let x = 0; x < size; x++) {
            const worldX = Math.floor(x * scale);
            const worldY = Math.floor(y * scale);

            // Fog of War: hide cells not discovered
            if (!gameState.discovered.has(`${worldX},${worldY}`)) {
                row += "?"; // undiscovered
                continue;
            }

            // Player position
            if (gameState.x === worldX && gameState.y === worldY) {
                row += "X";
            }
            // Cave
            else if (world.caves.some(c => c.x === worldX && c.y === worldY)) {
                row += "C";
            }
            // City
            else if (world.cities.some(c => worldX >= c.x1 && worldX <= c.x2 && worldY >= c.y1 && worldY <= c.y2)) {
                row += "H";
            }
            // Wilderness
            else {
                row += ".";
            }
        }
        map.push(row);
    }

    return map.join("\n");
}

function updateMiniMap() {
    const miniMapEl = document.getElementById("miniMap");
    miniMapEl.textContent = generateMiniMap();
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
    updateMiniMap();
}


function movePlayer(dx, dy) {
    const targetX = player.x + dx;
    const targetY = player.y + dy;

    // Check map bounds
    if (targetX < 0 || targetX >= mapWidth || targetY < 0 || targetY >= mapHeight) return;

    disableMovementButtons();
    showMessage("Traveling... ⏳");

    // 30 seconds delay for wilderness
    setTimeout(() => {
        player.x = targetX;
        player.y = targetY;

        // Reveal tile
        player.discovered.add(`${targetX},${targetY}`);
        
        describeLocation();
        updateMiniMap();
        enableMovementButtons();
    }, 30000); // 30,000 ms = 30 seconds
}


// 5️⃣ Call describeLocation() on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, running describeLocation");
    describeLocation();
});

const canvas = document.getElementById("miniMapCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 50;
const mapWidth = 10;
const mapHeight = 10;

// Tile types: grass, forest, mountain, ore, tree, city
const tileTypes = ['grass', 'forest', 'mountain', 'ore', 'tree', 'city'];

// Create a simple map with random tiles
const map = [];
for (let y = 0; y < mapHeight; y++) {
    map[y] = [];
    for (let x = 0; x < mapWidth; x++) {
        map[y][x] = {
            type: x === 5 && y === 5 ? 'city' : tileTypes[Math.floor(Math.random() * 5)],
            discovered: false
        };
    }
}

// Player state
const player = { x: 5, y: 5 };
map[player.y][player.x].discovered = true; // start city revealed

// Draggable map
let isDragging = false;
let startX, startY, offsetX = 0, offsetY = 0;

canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
    canvas.style.cursor = "grabbing";
});

let mapOffsetX = 0;
let mapOffsetY = 0;


window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    mapOffsetX = e.clientX - startX;
    mapOffsetY = e.clientY - startY;
    drawMap();

});


window.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
});

// Draw map
function drawMap() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(mapOffsetX, mapOffsetY);



    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const tile = map[y][x];
            
            // Fog of War
            if (!tile.discovered) {
                ctx.fillStyle = 'black';
            } else {
                switch(tile.type) {
                    case 'grass': ctx.fillStyle = 'green'; break;
                    case 'forest': ctx.fillStyle = 'darkgreen'; break;
                    case 'mountain': ctx.fillStyle = 'grey'; break;
                    case 'ore': ctx.fillStyle = 'brown'; break;
                    case 'tree': ctx.fillStyle = 'forestgreen'; break;
                    case 'city': ctx.fillStyle = 'blue'; break;
                }
            }
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x * tileSize + 15, player.y * tileSize + 15, 20, 20);
    map[player.y][player.x].discovered = true;

}

let selectedTile = null;

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - mapOffsetX) / tileSize);
    const y = Math.floor((e.clientY - rect.top - mapOffsetY) / tileSize);

    if (x >= 0 && y >= 0 && x < mapWidth && y < mapHeight) {
        selectedTile = { x, y };
        highlightTile(x, y);
    }
});

function highlightTile(x, y) {
    drawMap();
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 3;
    ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
}


function exploreSelectedTile() {
    if (!selectedTile) return;

    const path = [];
    let cx = player.x;
    let cy = player.y;

    while (cx !== selectedTile.x || cy !== selectedTile.y) {
        if (cx < selectedTile.x) cx++;
        else if (cx > selectedTile.x) cx--;
        else if (cy < selectedTile.y) cy++;
        else if (cy > selectedTile.y) cy--;

        path.push({ x: cx, y: cy });
    }

    travelPath(path);
}


function travelPath(path) {
    if (path.length === 0) return;

    let step = 0;
    moving = true;

    function nextStep() {
        const tile = path[step];
        player.x = tile.x;
        player.y = tile.y;
        map[tile.y][tile.x].discovered = true;

        drawMap();
        describeLocation();

        step++;
        if (step < path.length) {
            setTimeout(nextStep, 30000); // 30s per tile
        } else {
            moving = false;
        }
    }

    document.getElementById("description").innerText = "Traveling...";
    nextStep();
}


// Describe current tile
function describeLocationType() {
    const tile = map[player.y][player.x];
    let description = '';
    switch(tile.type) {
        case 'grass': description = "Open grassy plains."; break;
        case 'forest': description = "A dense forest surrounds you."; break;
        case 'mountain': description = "Rocky mountains loom ahead."; break;
        case 'ore': description = "You spot some valuable ore here."; break;
        case 'tree': description = "Tall trees provide resources."; break;
        case 'city': description = "You're in a bustling city."; break;
    }
    document.getElementById('description').innerText = description;
}

// Move player with 30-second delay outside cities
let moving = false;
function movePlayer(dx, dy) {
    if (moving) return; // Prevent multiple moves
    const newX = player.x + dx;
    const newY = player.y + dy;

    // Check bounds
    if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) return;

    const targetTile = map[newY][newX];
    const travelTime = targetTile.type === 'city' ? 0 : 30000; // 0ms in city, 30s otherwise

    moving = true;
    document.getElementById('description').innerText = 'Traveling... ⏳';

    setTimeout(() => {
        player.x = newX;
        player.y = newY;
        targetTile.discovered = true;
        drawMap();
        describeLocationType();
        moving = false;
    }, travelTime);
}

// Initial draw
drawMap();
describeLocationType();

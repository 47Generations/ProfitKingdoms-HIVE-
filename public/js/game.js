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
    const storyText = document.getElementById("storyText");

    if (!regionTitle || !storyText) return; // Page doesn't support world view

    let text = `You are at (${gameState.x}, ${gameState.y}). `;
    const city = getCurrentCity();
    const district = getCurrentDistrict();

    if (city) {
        regionTitle.textContent = city.name;
        if (districtTitle) {
            districtTitle.textContent = district ? district.name : "General Area";
        }
        text += `You are inside ${city.name}.`;
    } else {
        regionTitle.textContent = "Wilderness";
        if (districtTitle) districtTitle.textContent = "";
        text += "You are traveling through the wilderness.";
    }

    storyText.textContent = text;
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


document.getElementById("goHome").addEventListener("click", () => {
    window.location.href = "index.html";
})



document.getElementById("work").addEventListener("click", () => {
    window.location.href = "work.html";
})


const travelBtn = document.getElementById("travel-btn");

if (travelBtn) {
    travelBtn.addEventListener("click", () => {
        const x = parseInt(document.getElementById("coordX").value);
        const y = parseInt(document.getElementById("coordY").value);

        if (isNaN(x) || isNaN(y)) {
            alert("Please enter valid coordinates!");
            return;
        }

        travelToCoords(x, y);
    });
}


const inventoryEl = document.getElementById("inventory");
let inventory = {
  slots: 100,
  items: {
    lumber: 75,
    stone: 12
  }
};


function getUsedSlots() {
  return Object.keys(inventory.items).length;
}



if (inventoryEl) {
    for (let i = 0; i < inventory.slots; i++) {
        const slot = document.createElement("div");
        slot.classList.add("inventory-slot");

        slot.innerHTML = `
            <span class="item-qty"></span>
            <span class="item-name"></span>
        `;

        inventoryEl.appendChild(slot);
    }
}


const ITEM_DEFS = {
    lumber: {
        id: "lumber",
        name: "Lumber",
        icon: "assets/image/Items/Lumber.png",
        stackable: true,
        maxStack: 100
    }
};

function addItemToInventory(itemId, qty) {
  qty = Number(qty);

  if (!inventory.items[itemId]) {
    inventory.items[itemId] = 0;
  }

  inventory.items[itemId] += qty;

  renderInventory();
  saveInventory(); // optional but recommended
}

function renderInventory() {
    const inventoryDiv = document.getElementById("inventory");
    inventoryDiv.innerHTML = ""; // clear previous

    // Always render 100 slots
    for (let i = 0; i < inventory.slots; i++) {
        const slotDiv = document.createElement("div");
        slotDiv.classList.add("inventory-slot");

        if (i < inventory.length) {
            const item = inventory[i];
            const itemDef = ITEM_DEFS[item.id];

            // Icon
            const img = document.createElement("img");
            img.src = itemDef.icon;
            img.alt = itemDef.name;
            img.classList.add("itemIcon");

            // Name
            const nameSpan = document.createElement("span");
            nameSpan.textContent = itemDef.name;
            nameSpan.classList.add("itemName");

            // Quantity
            const qtySpan = document.createElement("span");
            qtySpan.textContent = item.qty;
            qtySpan.classList.add("itemQty");

            slotDiv.appendChild(img);
            slotDiv.appendChild(nameSpan);
            slotDiv.appendChild(qtySpan);
        }

        inventoryDiv.appendChild(slotDiv);
    }

    // Update slot counter
    const inventoryCount = document.getElementById("inventory-count");
    if (inventoryCount) {
        inventoryCount.textContent = `${getUsedSlots()}/${inventory.slots}`;
    }
}


document.getElementById("wood")?.addEventListener("click", () => {
    addItemToInventory("lumber", 25);
    saveInventory();
});



const WALLET_ID = "kryptic-test-wallet"; // later from Hive login

async function login() {
  await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet_id: WALLET_ID })
  });
}

login();



async function saveInventory() {
  const items = Object.entries(inventory.items).map(
    ([item_id, quantity]) => ({ item_id, quantity })
  );

  await fetch(`http://localhost:3000/inventory/${WALLET_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  });
}



async function loadInventory() {
  const res = await fetch(`http://localhost:3000/inventory/${WALLET_ID}`);
  const data = await res.json();

  inventory.items = {};
  data.forEach(row => {
    inventory.items[row.item_id] = row.quantity;
  });

  renderInventory();
}

loadInventory();



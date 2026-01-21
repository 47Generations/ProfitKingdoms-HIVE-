/*===================
   KEYS SETUP
====================*/

const keys = {};

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

function addMenuItem(parent, text, callback) {
    const div = document.createElement("div");
    div.className = "menu-item";
    div.textContent = text;
    div.onclick = () => {
        callback();
        parent.classList.add("hidden");
    };
    parent.appendChild(div);
}




/* =====================
   CANVAS SETUP
===================== */
const canvas = document.getElementById("osrs");
const ctx = canvas.getContext("2d");

const resourceNodes = [
    {
        x: 410,
        y: 179,
        type: 'tree',
        action: 'Chop Wood',
        remaining: 15,
        icon: new Image()
    },
    {
        x: 412,
        y: 175,
        type: 'bank',
        action: 'Use Bank',
        remaining: 1,
        icon: new Image()
    },
    {
        x: 422,
        y: 164,
        type: 'rentFarm',
        action: 'Rent Farm',
        remaining: 1,
        icon: new Image()
    },
    {
        x: 413,
        y: 170,
        type: 'store',
        action: 'Buy/Sell',
        remaining: 1,
        icon: new Image()
    }

    /*{
        x: 110,
        y: 105,
        type: 'rock',
        action: 'Mine Ore',
        remaining: 5,
        icon: new Image()
    }
        */
];


// Load tree images
resourceNodes.forEach(node => {
    if (node.type === 'tree') {
        node.icon.src = "./assets/image/MapBlips/TreeSpot.png";
    }

    if (node.type === 'bank') {
        node.icon.src = "./assets/image/MapBlips/BankSpot.png";
    }

    if (node.type === 'rentFarm') {
        node.icon.src = "./assets/image/MapBlips/RentSpot.png";
    }

      if (node.type === 'store') {
        node.icon.src = "./assets/image/MapBlips/Store.png";
    }

    node.icon.onload = () =>
        console.log(`${node.type} image loaded`);

    node.icon.onerror = () =>
        console.log(`Failed to load ${node.type} image`);

});

class Tile {
    constructor(x, y, type, color, resource = null, customMenu = null) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.color = color;
        this.resource = resource;
        this.customMenu = customMenu;
    }

    getMenuOptions() {
        if(this.customMenu) return this.customMenu;
        const menu = ['Walk-to', 'Explore'];
        if(this.resource) menu.push('Harvest');
        menu.push('Cancel');
        return menu;
    }
}

class ResourceNode {
    constructor(type, imgSrc, harvestTime, respawnTime, maxAmount=100) {
        this.type = type;
        this.img = new Image();
        this.img.src = imgSrc;
        this.harvestTime = harvestTime;
        this.respawnTime = respawnTime;
        this.amount = maxAmount;
        this.maxAmount = maxAmount;
    }

    harvest(player) {
        if(this.amount <= 0) return false;
        this.amount--;
        if(this.amount === 0) this.startRespawn();
        return true;
    }

    startRespawn() {
        setTimeout(() => {
            this.amount = this.maxAmount;
        }, this.respawnTime);
    }
}


canvas.width = 800;
canvas.height = 600;

/* =====================
   MAP IMAGE
===================== */
const mapImage = new Image();
mapImage.src = "./assets/map/OSRS_Clean_Map.jpg";

const cursorImage = new Image();
cursorImage.src = "./assets/map/Pointer.png";

/* =====================
   TILE / CHUNK CONFIG
===================== */
const TILE_SIZE = 20;
const CHUNK_SIZE = 8;
const CHUNK_PX = TILE_SIZE * CHUNK_SIZE;

/* =====================
   PLAYER (TEMP)
===================== */
const player = {
  x: 416, // tile coords
  y: 176
};

player.speed = 4; // tiles per second (OSRS-like walking)


/* =====================
   CAMERA
===================== */
const camera = {
  x: 416,
  y: 176,
  width: canvas.width,
  height: canvas.height
};

const CAMERA_SPEED = 8;

// Near the top of your file
const focus = {
    x: player.x * TILE_SIZE,
    y: player.y * TILE_SIZE
};

function updateCamera() {
    // 1. Move the focus point with WASD
    if (keys["w"]) focus.y -= CAMERA_SPEED;
    if (keys["s"]) focus.y += CAMERA_SPEED;
    if (keys["a"]) focus.x -= CAMERA_SPEED;
    if (keys["d"]) focus.x += CAMERA_SPEED;

    // 2. Center the camera on the focus point
    // Formula: Camera = Focus - (Half of Screen)
    camera.x = focus.x - (canvas.width / 2);
    camera.y = focus.y - (canvas.height / 2);

    // 3. Optional: Clamp camera to map bounds so you don't see the "void"
    camera.x = Math.max(0, Math.min(camera.x, mapImage.width - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, mapImage.height - canvas.height));
}


/* =====================
   HELPERS
===================== */
function tileToWorld(tileX, tileY) {
  return {
    x: tileX * TILE_SIZE,
    y: tileY * TILE_SIZE
  };
}

function worldToTile(worldX, worldY) {
  return {
    x: Math.floor(worldX / TILE_SIZE),
    y: Math.floor(worldY / TILE_SIZE)
  };
}

canvas.addEventListener("contextmenu", e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    
    // World Math
    const mouseWorldX = e.clientX - rect.left + camera.x;
    const mouseWorldY = e.clientY - rect.top + camera.y;
    const tileX = Math.floor(mouseWorldX / TILE_SIZE);
    const tileY = Math.floor(mouseWorldY / TILE_SIZE);

    const resource = resourceNodes.find(n => n.x === tileX && n.y === tileY && n.remaining > 0);
    const menu = document.getElementById("canvas-menu");
    menu.innerHTML = ""; 

    if (resource) {
        addMenuItem(menu, resource.action, () => startHarvesting(resource));
    }
    addMenuItem(menu, "Walk-Here", () => { player.targetX = tileX; player.targetY = tileY; });
    addMenuItem(menu, "Examine", () => console.log(`Tile: ${tileX}, ${tileY}`));
    addMenuItem(menu, "Cancel", () => menu.classList.add("hidden"));

    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.classList.remove("hidden");
    console.log("Right-click tile:", tileX, tileY);
});

canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();

    const mouseWorldX = e.clientX - rect.left + camera.x;
    const mouseWorldY = e.clientY - rect.top + camera.y;

    const tileX = Math.floor(mouseWorldX / TILE_SIZE);
    const tileY = Math.floor(mouseWorldY / TILE_SIZE);


   // Check resource first
    const tree = resourceNodes.find(
    n => n.x === tileX && n.y === tileY && n.remaining > 0
    );

    if (tree) {
    startChopping(tree);
    return;
    }

    // Otherwise move player
    player.targetX = tileX;
    player.targetY = tileY;

    console.log("Walking to:", tileX, tileY);
});



canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left + camera.x) / TILE_SIZE);
  const y = Math.floor((e.clientY - rect.top + camera.y) / TILE_SIZE);

  const tree = resourceNodes.find(n => n.x === x && n.y === y && n.remaining > 0);
  canvas.style.cursor = tree ? "pointer" : "default";
});


/* =====================
   DRAW MAP
===================== */
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Map
    ctx.drawImage(
        mapImage,
        camera.x, camera.y, canvas.width, canvas.height,
        0, 0, canvas.width, canvas.height
    );

    // 2. Draw Layers
    drawGrid();
    drawPlayer();
    drawCursor(); // Now calls the function below
    drawHUD();
    drawResourceNodes();
}
/*======================
   DRAW RESOURCES
======================*/
function drawResourceNodes() {
    resourceNodes.forEach(node => {
        if (node.remaining <= 0) return;

        ctx.drawImage(
            node.icon,
            node.x * TILE_SIZE - camera.x,
            node.y * TILE_SIZE - camera.y,
            TILE_SIZE,
            TILE_SIZE
        );
    });
}


/* =====================
   CURSOR DRAW
===================== */
function drawCursor() {
    // Corrected variable name: cursorImage
    if (cursorImage.complete) {
        ctx.drawImage(
            cursorImage, 
            focus.x - camera.x - 16, // Center the cursor
            focus.y - camera.y - 16, 
            32, 32
        );
    }
}


/* =====================
   GRID OVERLAY
===================== */
function drawGrid() {
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;

  // Calculate the offset so the grid moves with the camera
  const offsetX = -camera.x % TILE_SIZE;
  const offsetY = -camera.y % TILE_SIZE;

  for (let x = offsetX; x < canvas.width; x += TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = offsetY; y < canvas.height; y += TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

/*======================
   DRAW HUD
=======================*/

function drawHUD() {
    // Convert the focus point back to Tile Coordinates for the display
    const tileCoords = worldToTile(focus.x, focus.y);

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent background box
    ctx.fillRect(10, 10, 120, 50);

    ctx.font = "16px 'Macondo', cursive"; // Using your custom font from HTML
    ctx.fillStyle = "#ffcc00"; // Gold color
    ctx.textAlign = "left";
    
    ctx.fillText(`X: ${tileCoords.x}`, 20, 30);
    ctx.fillText(`Y: ${tileCoords.y}`, 20, 50);

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent background box
    ctx.fillRect(500, 10, 290, 50);

    ctx.font = "16px 'Macondo', cursive"; // Using your custom font from HTML
    ctx.fillStyle = "#ffcc00"; // Gold color
    ctx.textAlign = "left";

    ctx.fillText(`Notifications: `, 510, 30);
    ctx.fillText("You chopped down 1 Tree", 510, 50);
}
/* =====================
   PLAYER DRAW
===================== */
function drawPlayer() {
  const world = tileToWorld(player.x, player.y);
  const playerBlip = new Image();
  playerBlip.src = "./assets/image/Player_Blip.png"

  ctx.drawImage(
    playerBlip,
    world.x - camera.x,
    world.y - camera.y,
    TILE_SIZE,
    TILE_SIZE
  );
}

/*======================
   MOVEMENT SYSTEM
======================*/

player.targetX = player.x;
player.targetY = player.y;

function updatePlayer(deltaTime) {
  if (player.x === player.targetX && player.y === player.targetY) return;

  const dx = player.targetX - player.x;
  const dy = player.targetY - player.y;

  const distance = Math.hypot(dx, dy);
  if (distance === 0) return;

  const step = player.speed * deltaTime;

  if (distance <= step) {
    player.x = player.targetX;
    player.y = player.targetY;
  } else {
    player.x += (dx / distance) * step;
    player.y += (dy / distance) * step;
  }
}



/* =====================
   INPUT (CLICK TO MOVE)
===================== */
/*canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const mouseX = e.clientX - rect.left + camera.x;
  const mouseY = e.clientY - rect.top + camera.y;

  const tile = worldToTile(mouseX, mouseY);

  player.x = tile.x;
  player.y = tile.y;

  console.log("Moved to tile:", tile);
});
*/
/* =====================
   GAME LOOP
===================== */

let lastTime = 0;

function gameLoop(currentTime) {
    // 1. Calculate how much time passed since the last frame (in seconds)
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // 2. Only update if deltaTime is valid (prevents huge jumps on first load)
    if (!isNaN(deltaTime)) {
        updateCamera();
        updatePlayer(deltaTime); // Pass the time here!
    }

    drawMap();
    requestAnimationFrame(gameLoop);
}

mapImage.onload = () => {
  console.log("Map loaded");
  gameLoop();
};


/*
===================================
     ACTIONS MENU
====================================

function startChopping(tree) {
  if (playerAction.type === "chopping") return;

  console.log("Started chopping tree at", tree.x, tree.y);

  playerAction.type = "chopping";
  playerAction.target = tree;

  playerAction.intervalId = setInterval(() => {
    if (tree.remaining <= 0) {
      stopChopping();
      return;
    }

    tree.remaining--;
    console.log("Chopped log. Remaining:", tree.remaining);
  }, 5000);
}

function stopChopping() {
  clearInterval(playerAction.intervalId);
  playerAction.type = null;
}
*/


/* =====================
   3. EVENT LISTENERS (Now they can see camera/player)
===================== */

/* =====================
   4. MISSING LOGIC
===================== */

function isAdjacent(player, resource) {
    const dx = Math.abs(player.x - resource.x);
    const dy = Math.abs(player.y - resource.y);
    return dx <= 1 && dy <= 1; // 1 tile away in X or Y
}

function movePlayerNextTo(resource) {
    // Find a nearby tile that's empty (ignoring collisions for now)
    const offsets = [
        {x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0},
        {x:-1,y:-1}, {x:1,y:-1}, {x:-1,y:1}, {x:1,y:1}
    ];

    for (let o of offsets) {
        const targetX = resource.x + o.x;
        const targetY = resource.y + o.y;

        // Here you could check for collisions or obstacles
        player.targetX = targetX;
        player.targetY = targetY;
        console.log(`Walking to adjacent tile: ${targetX}, ${targetY}`);
        return;
    }
}

function startHarvesting(resource) {
    if (isAdjacent(player, resource)) {
        console.log(`Harvesting ${resource.type} now!`);
        // Actually decrease resource or start interval
        resource.remaining--;
        addItemToInventory("logs", 1);
        saveInventory();
        console.log(`Remaining: ${resource.remaining}`);
    } else {
        console.log("Too far away! Move closer to harvest.");
        // Optional: auto-walk to an adjacent tile
        // For example:
        movePlayerNextTo(resource);
    }
}

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


/* =====================
   CANVAS SETUP
===================== */
const canvas = document.getElementById("osrs");
const ctx = canvas.getContext("2d");

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
const TILE_SIZE = 40;
const CHUNK_SIZE = 8;
const CHUNK_PX = TILE_SIZE * CHUNK_SIZE;

/* =====================
   PLAYER (TEMP)
===================== */
const player = {
  x: 100, // tile coords
  y: 100
};

/* =====================
   CAMERA
===================== */
const camera = {
  x: 100,
  y: 100,
  width: canvas.width,
  height: canvas.height
};

const CAMERA_SPEED = 8;

function updateCamera() {
  if (keys["w"] || keys["arrowup"]) camera.y -= CAMERA_SPEED;
  if (keys["s"] || keys["arrowdown"]) camera.y += CAMERA_SPEED;
  if (keys["a"] || keys["arrowleft"]) camera.x -= CAMERA_SPEED;
  if (keys["d"] || keys["arrowright"]) camera.x += CAMERA_SPEED;

  camera.x = Math.max(0, Math.min(camera.x, mapImage.width - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, mapImage.height - canvas.height));

  ctx.drawImage( 
    cursorImage,
    camera.x,
    camera.y
  );
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


canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();

    const mouseWorldX = e.clientX - rect.left + camera.x;
    const mouseWorldY = e.clientY - rect.top + camera.y;

    const tileX = Math.floor(mouseWorldX / TILE_SIZE);
    const tileY = Math.floor(mouseWorldY / TILE_SIZE);

 /*   // Check resource first
    const tree = resourceNodes.find(
    n => n.x === tileX && n.y === tileY && n.remaining > 0
    );

    if (tree) {
    startChopping(tree);
    return;
    }
*/
    // Otherwise move player
    player.targetX = tileX;
    player.targetY = tileY;

    console.log("Walking to:", tileX, tileY);
});


/*
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left + camera.x) / TILE_SIZE);
  const y = Math.floor((e.clientY - rect.top + camera.y) / TILE_SIZE);

  const tree = resourceNodes.find(n => n.x === x && n.y === y && n.remaining > 0);
  canvas.style.cursor = tree ? "pointer" : "default";
});
*/

/* =====================
   DRAW MAP
===================== */
function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Center camera on player
 // camera.x = player.x * TILE_SIZE - canvas.width / 2;
 // camera.y = player.y * TILE_SIZE - canvas.height / 2;

  ctx.drawImage(
    mapImage,
    camera.x,
    camera.y,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawGrid();
  drawPlayer();
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
/* =====================
   PLAYER DRAW
===================== */
function drawPlayer() {
  const world = tileToWorld(player.x, player.y);

  ctx.fillStyle = "red";
  ctx.fillRect(
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

function updatePlayer() {
    if (player.x < player.targetX) player.x++;
    else if (player.x > player.targetX) player.x--;

    if (player.y < player.targetY) player.y++;
    else if (player.y > player.targetY) player.y--;
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
function gameLoop() {
    updateCamera();
    updatePlayer();
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
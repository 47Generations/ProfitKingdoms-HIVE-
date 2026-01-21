
const TILE_SIZE = 40;
const MAP_WIDTH = 20;  // tiles
const MAP_HEIGHT = 15; // tiles


const mapTiles = [
  { x: 0, y: 0, type: "city", danger: 0, color: "gold" },
  { x: 1, y: 0, type: "forest", danger: 2, color: "green" },
  { x: 2, y: 0, type: "water", danger: 1, color: "blue" },
  { x: 3, y: 1, type: "mountain", danger: 4, color: "gray" }
];

const treeImage = new Image();
treeImage.src = "./assets/image/MapBlips/Tree.png";


const resourceNodes = [
  {
    id: "tree_1",
    x: 5,
    y: 8,
    type: "tree",
    maxResource: 2500,
    remaining: 2500,
    respawnTime: 3 * 60 * 60 * 1000, // 3 hours
    lastDepleted: null,
    icon: treeImage
  }
]; 


treeImage.onload = () => {
  renderMap(); // draw tiles, grid, AND tree now that image is loaded
};

const canvas = document.getElementById("GameMap");
const ctx = canvas.getContext("2d");

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault(); // disable browser menu

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const tileX = Math.floor(mouseX / TILE_SIZE);
  const tileY = Math.floor(mouseY / TILE_SIZE);

  handleCanvasRightClick(tileX, tileY, e.pageX, e.pageY);
});

function handleCanvasRightClick(tileX, tileY, screenX, screenY) {
  const tree = resourceNodes.find(
    n => n.x === tileX && n.y === tileY && n.remaining > 0
  );

  if (tree) {
    showCanvasMenu(screenX, screenY, tree);
  }
}

let contextTree = null;
const canvasMenu = document.getElementById("canvas-menu");

function showCanvasMenu(x, y, tree) {
  contextTree = tree;

  canvasMenu.style.left = `${x}px`;
  canvasMenu.style.top = `${y}px`;
  canvasMenu.classList.remove("hidden");
}

document.addEventListener("click", () => {
  canvasMenu.classList.add("hidden");
  contextTree = null;
});


canvasMenu.addEventListener("click", (e) => {
  if (!e.target.classList.contains("menu-item")) return;

  const action = e.target.dataset.action;

  if (!contextTree) return;

  if (action === "walk") {
    movePlayerTo(contextTree.x, contextTree.y);
  }

  if (action === "chop") {
    startChopping(contextTree);
  }

  canvasMenu.classList.add("hidden");
});



function drawGrid() {
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}


function drawTiles() {
  // Fill background (default tile)
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  mapTiles.forEach(tile => {
    ctx.fillStyle = tile.color;
    ctx.fillRect(
      tile.x * TILE_SIZE,
      tile.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  });
}


function renderMap() {
  drawTiles();
  drawGrid();
  drawResources();
}

renderMap();


canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

  const tile = mapTiles.find(t => t.x === x && t.y === y);

  if (tile) {
    console.log(`Clicked ${tile.type} | Danger: ${tile.danger}`);
  } else {
    console.log("Wilderness tile");
  }
});


canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const tileX = Math.floor(mouseX / TILE_SIZE);
  const tileY = Math.floor(mouseY / TILE_SIZE);

  const tileType = MAP[tileY]?.[tileX];

  console.log("Clicked tile:", tileX, tileY, "Type:", tileType);
});




function drawResources() {
  resourceNodes.forEach(node => {
    if (node.remaining <= 0) return; // skip depleted

    ctx.drawImage(
      node.icon,
      node.x * TILE_SIZE,
      node.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  });
}


function updateResourceNodes() {
  const now = Date.now();

  resourceNodes.forEach(node => {
    if (node.remaining <= 0 && node.lastDepleted) {
      if (now - node.lastDepleted >= node.respawnTime) {
        node.remaining = node.maxResource;
        node.lastDepleted = null;
      }
    }
  });
}




let playerAction = {
  type: null,
  target: null,
  startedAt: null,
  intervalId: null,
  timeoutId: null
};

function startChopping(tree) {
  if (playerAction.type === "chopping") return;

  playerAction.type = "chopping";
  playerAction.target = tree;
  playerAction.startedAt = Date.now();

  // Chop every 5 seconds
  playerAction.intervalId = setInterval(() => {
    chopTree(tree);
  }, 5000);

  // Stop after 30 minutes
  playerAction.timeoutId = setTimeout(stopChopping, 30 * 60 * 1000);
}


function chopTree(tree) {
  if (tree.remaining <= 0) {
    stopChopping();
    return;
  }

  const amount = 1; // 1 log per tick
  tree.remaining -= amount;

  addItemToInventory("lumber", amount);

  if (tree.remaining <= 0) {
    tree.remaining = 0;
    tree.lastDepleted = Date.now();
    stopChopping();
  }
}

function stopChopping() {
  if (playerAction.intervalId) {
    clearInterval(playerAction.intervalId);
    clearTimeout(playerAction.timeoutId);
  }

  playerAction = {
    type: null,
    target: null,
    startedAt: null,
    intervalId: null,
    timeoutId: null
  };
}

function movePlayer(x, y) {
  stopChopping();
  // existing movement logic
}


function gameLoop() {
  updateResources();
  renderMap();
  requestAnimationFrame(gameLoop);
}

gameLoop();


treeImage.onload = () => console.log("Tree loaded!");
treeImage.onerror = () => console.log("Failed to load tree image!");





const TILE_SIZE = 40;
const MAP_WIDTH = 20;  // tiles
const MAP_HEIGHT = 15; // tiles


// Define resource nodes array
const resourceNodes = [
  {
    type: 'tree',
    x: 1,
    y: 0,
    icon: new Image(),
    remaining: 100,
    maxResource: 100,
    respawnTime: 300000, // 5 minutes
    lastDepleted: null
  },
  {
    type: 'tree',
    x: 1,
    y: 1,
    icon: new Image(),
    remaining: 100,
    maxResource: 100,
    respawnTime: 300000,
    lastDepleted: null
  }
];

// Load tree images
resourceNodes.forEach(node => {
  if (node.type === 'tree') {
    node.icon.src = "./assets/image/MapBlips/Tree.png";
    node.icon.onload = () => console.log("Tree loaded!");
    node.icon.onerror = () => console.log("Failed to load tree image!");
  }
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

const mapTiles = [
  new Tile(0, 0, "city", "gold"),
  new Tile(1, 0, "forest", "green"),
  new Tile(2, 0, "water", "blue"),
  new Tile(3, 1, "mountain", "gray")
];

const canvas = document.getElementById("GameMap");
const ctx = canvas.getContext("2d");

canvas.width = MAP_WIDTH * TILE_SIZE;
canvas.height = MAP_HEIGHT * TILE_SIZE;

// Player action state
let playerAction = {
  type: null,
  target: null,
  startedAt: null,
  intervalId: null,
  timeoutId: null
};

// Canvas menu
const canvasMenu = document.getElementById("canvas-menu");
let contextTree = null;

// Drawing functions
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

function drawResources() {
  resourceNodes.forEach(node => {
    if (node.remaining <= 0) return;

    if (node.icon.complete && node.icon.naturalHeight !== 0) {
      ctx.drawImage(
        node.icon,
        node.x * TILE_SIZE,
        node.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  });
}

function renderMap() {
  drawTiles();
  drawGrid();
  drawResources();
}

// Context menu function
function showContextMenu(x, y, options, callback) {
  // Remove existing menu if any
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.position = 'absolute';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.background = '#333';
  menu.style.border = '1px solid #666';
  menu.style.borderRadius = '4px';
  menu.style.padding = '5px 0';
  menu.style.zIndex = '1000';

  options.forEach(option => {
    const item = document.createElement('div');
    item.textContent = option;
    item.style.padding = '8px 20px';
    item.style.cursor = 'pointer';
    item.style.color = '#fff';
    
    item.addEventListener('mouseenter', () => {
      item.style.background = '#555';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.background = 'transparent';
    });
    
    item.addEventListener('click', () => {
      callback(option);
      menu.remove();
    });
    
    menu.appendChild(item);
  });

  document.body.appendChild(menu);

  // Close menu on any click outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu() {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    });
  }, 0);
}

// Event handlers
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // Use clientX/Y for the logic, but pageX/Y for the menu positioning
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const tileX = Math.floor(mouseX / TILE_SIZE);
    const tileY = Math.floor(mouseY / TILE_SIZE);

    // Check for resource node first
    const resourceNode = resourceNodes.find(n => n.x === x && n.y === y && n.remaining > 0);
    
    if (resourceNode) {
        showCanvasMenu(e.pageX, e.pageY, resourceNode);
        return;
    }

    
    // Otherwise check for tile
    const tile = mapTiles.find(t => t.x === x && t.y === y);

    if (tile) {
        const menuOptions = tile.getMenuOptions();
        showContextMenu(e.pageX, e.pageY, menuOptions, (selectedOption) => {
            handleTileAction(tile, selectedOption);
        });
    }
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
  const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

  const tile = mapTiles.find(t => t.x === x && t.y === y);

  if (tile) {
    console.log(`Clicked ${tile.type} tile at (${x}, ${y})`);
  } else {
    console.log(`Clicked wilderness tile at (${x}, ${y})`);
  }
});

function handleTileAction(tile, action) {
    switch(action) {
        case 'Walk-to':
            movePlayer(tile.x, tile.y);
            break;
        case 'Explore':
            exploreTile(tile);
            break;
        case 'Harvest':
            if(tile.resource) startHarvest(tile.resource);
            break;
        case 'Cancel':
            console.log('Action cancelled');
            break;
        default:
            console.log('Default action on', tile);
    }
}

function showCanvasMenu(x, y, tree) {
  contextTree = tree;
  canvasMenu.style.left = `${x}px`;
  canvasMenu.style.top = `${y}px`;
  canvasMenu.classList.remove("hidden");
  canvasMenu.style.display = "block";
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
    movePlayer(contextTree.x, contextTree.y);
  }

  if (action === "chop") {
    startChopping(contextTree);
  }

  canvasMenu.classList.add("hidden");
});

// Game functions
function movePlayer(targetX, targetY) {
    console.log(`Moving player to (${targetX}, ${targetY})`);
    gameState.x = targetX;
    gameState.y = targetY;
    gameState.discovered.add(`${targetX},${targetY}`);
}

function exploreTile(tile) {
    console.log(`Exploring ${tile.type} tile at (${tile.x}, ${tile.y})`);
}

function startHarvest(resource) {
    console.log(`Starting harvest of ${resource.type}`);
}

function updateResourceNodes() {
  const now = Date.now();

  resourceNodes.forEach(node => {
    if (node.remaining <= 0 && node.lastDepleted) {
      if (now - node.lastDepleted >= node.respawnTime) {
        node.remaining = node.maxResource;
        node.lastDepleted = null;
        console.log(`${node.type} at (${node.x}, ${node.y}) respawned!`);
      }
    }
  });
}

function startChopping(tree) {
  if (playerAction.type === "chopping") {
    console.log("Already chopping!");
    return;
  }

  console.log("Started chopping tree at", tree.x, tree.y);

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

  const amount = 1;
  tree.remaining -= amount;

  console.log(`Chopped ${amount} lumber. Remaining: ${tree.remaining}`);

  if (tree.remaining <= 0) {
    tree.remaining = 0;
    tree.lastDepleted = Date.now();
    console.log("Tree depleted!");
    stopChopping();
  }
}

function stopChopping() {
  if (playerAction.intervalId) {
    clearInterval(playerAction.intervalId);
    clearTimeout(playerAction.timeoutId);
  }

  console.log("Stopped chopping");

  playerAction = {
    type: null,
    target: null,
    startedAt: null,
    intervalId: null,
    timeoutId: null
  };
}

// Game loop
function gameLoop() {
  updateResourceNodes();
  renderMap();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
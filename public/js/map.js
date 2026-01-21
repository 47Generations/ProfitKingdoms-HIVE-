const TILE_SIZE = 40;

const MAP = [
  [0,0,0,1,1,1,0,0],
  [0,2,2,1,3,1,0,0],
  [0,2,0,0,0,1,0,0],
  [0,0,0,3,0,0,0,0],
];

// Tile types
const TILE_COLORS = {
  0: "#4caf50", // grass
  1: "#2196f3", // water
  2: "#9e9e9e", // mountain
  3: "#c9a227", // city
};


const canvas = document.getElementById("GameMap");
const ctx = canvas.getContext("2d");

const MAP_WIDTH = MAP[0].length;
const MAP_HEIGHT = MAP.length;

// Set REAL canvas size
canvas.width = MAP_WIDTH * TILE_SIZE;
canvas.height = MAP_HEIGHT * TILE_SIZE;


function drawMap() {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = MAP[y][x];

      ctx.fillStyle = TILE_COLORS[tile];
      ctx.fillRect(
        x * TILE_SIZE,
        y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );

      // Optional grid lines
      ctx.strokeStyle = "#111";
      ctx.strokeRect(
        x * TILE_SIZE,
        y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }
}

drawMap();


canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const tileX = Math.floor(mouseX / TILE_SIZE);
  const tileY = Math.floor(mouseY / TILE_SIZE);

  const tileType = MAP[tileY]?.[tileX];

  console.log("Clicked tile:", tileX, tileY, "Type:", tileType);
});

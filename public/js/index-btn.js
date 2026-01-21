
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
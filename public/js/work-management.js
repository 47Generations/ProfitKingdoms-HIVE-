const ownedCompanies = ["milk_farm", "lumber_yard"];

const company = {
  id: "milk_farm",
  name: "Milk Farm",
  level: 1,
  funds: 250,
  wage: 15,
  maxWorkers: 3,
  workers: [
    { name: "NPC-01", lastWorked: "2026-01-20T12:00:00Z" }
  ],
  materials: {
    hay: 40
  },
  products: {
    milk: 12
  }
};

function loadCompany(companyId) {
  // later: fetch from backend
  const company = mockCompanies[companyId];
  renderCompany(company);
}

function workedLast24h(worker) {
  const last = new Date(worker.lastWorked);
  return Date.now() - last.getTime() <= 86400000;
}

function depositGold(amount) {
  if (gameState.gold < amount) return alert("Not enough gold");
  gameState.gold -= amount;
  company.funds += amount;
}


const upgradeCost = company.maxWorkers * 100;

if (company.funds >= upgradeCost) {
  company.funds -= upgradeCost;
  company.maxWorkers++;
}

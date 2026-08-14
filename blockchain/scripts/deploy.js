const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying PetrochainAudit contract...");

  const Audit = await hre.ethers.getContractFactory("PetrochainAudit");
  const audit = await Audit.deploy();

  await audit.waitForDeployment();

  const address = await audit.getAddress();
  console.log(`PetrochainAudit deployed to: ${address}`);

  // Save the contract address to a file so Laravel and React can read it
  const addressPath = path.join(__dirname, "../../web_portal/storage/app/blockchain_address.json");
  fs.writeFileSync(addressPath, JSON.stringify({ address: address }, null, 2));
  console.log("Contract address saved to web_portal/storage/app/blockchain_address.json");
  
  // Create an artifact copy for React
  const abiPath = path.join(__dirname, "../artifacts/contracts/PetrochainAudit.sol/PetrochainAudit.json");
  const reactAbiPath = path.join(__dirname, "../../web_portal/resources/js/lib/PetrochainAudit.json");
  
  // ensure lib dir exists
  const libDir = path.dirname(reactAbiPath);
  if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
  }
  
  if (fs.existsSync(abiPath)) {
      const artifact = JSON.parse(fs.readFileSync(abiPath));
      const minimalArtifact = {
          abi: artifact.abi,
          contractName: artifact.contractName,
          address: address
      };
      fs.writeFileSync(reactAbiPath, JSON.stringify(minimalArtifact, null, 2));
      console.log("Contract ABI saved to React lib directory");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

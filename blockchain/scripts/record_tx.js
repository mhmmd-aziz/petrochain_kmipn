const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const txId = process.env.TX_ID;
    const dataHash = process.env.DATA_HASH;
    const spbuCode = process.env.SPBU_CODE;

    if (!txId || !dataHash || !spbuCode) {
        throw new Error("Missing arguments in environment variables.");
    }

    const addressPath = path.join(__dirname, "../../web_portal/storage/app/blockchain_address.json");
    if (!fs.existsSync(addressPath)) {
        throw new Error("Contract address file not found. Deploy first.");
    }
    const contractData = JSON.parse(fs.readFileSync(addressPath));

    const Contract = await hre.ethers.getContractFactory("PetrochainAudit");
    const audit = Contract.attach(contractData.address);

    const tx = await audit.recordTransaction(txId, dataHash, spbuCode);
    await tx.wait();
    console.log(`Success: TxHash ${tx.hash}`);
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});

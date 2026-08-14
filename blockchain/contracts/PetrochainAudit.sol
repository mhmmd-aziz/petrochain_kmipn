// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PetrochainAudit {
    struct TransactionLog {
        string txId;
        string dataHash;
        string spbuCode;
        uint256 timestamp;
    }

    // Mapping to store logs by transaction ID
    mapping(string => TransactionLog) private logs;
    
    // Array to keep track of all transaction IDs
    string[] public transactionIds;

    address public admin;

    event TransactionRecorded(string txId, string dataHash, string spbuCode, uint256 timestamp);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can record transactions");
        _;
    }

    function recordTransaction(string memory _txId, string memory _dataHash, string memory _spbuCode) public onlyAdmin {
        require(bytes(logs[_txId].txId).length == 0, "Transaction already recorded");

        TransactionLog memory newLog = TransactionLog({
            txId: _txId,
            dataHash: _dataHash,
            spbuCode: _spbuCode,
            timestamp: block.timestamp
        });

        logs[_txId] = newLog;
        transactionIds.push(_txId);

        emit TransactionRecorded(_txId, _dataHash, _spbuCode, block.timestamp);
    }

    function verifyTransaction(string memory _txId) public view returns (TransactionLog memory) {
        require(bytes(logs[_txId].txId).length != 0, "Transaction not found");
        return logs[_txId];
    }

    function getTotalTransactions() public view returns (uint256) {
        return transactionIds.length;
    }
}

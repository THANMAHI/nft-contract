# 🖼️ NftCollection — ERC-721 NFT Smart Contract  
A fully implemented ERC-721–compatible NFT collection built using **Hardhat**, **OpenZeppelin**, and **Docker**.  
This project supports minting, transferring, pausing, burning, and metadata via tokenURI — along with a complete automated test suite.

---

## 🚀 Project Features

### ✔ Fully ERC-721 Compatible
- Unique token IDs  
- Owner-only minting  
- Safe transfers (`safeTransferFrom`)  
- Approval & operator approval system  
- Metadata URI via `tokenURI()`

### ✔ Collection Rules & Limits
- Configurable **maxSupply**  
- Prevents over-minting  
- Pausable minting & transfers  
- Tracks `totalSupply` correctly (mint & burn)

### ✔ Metadata
- Base URI + tokenId format  
  Example:  
  `https://metadata.example/token/1`

### ✔ Security & Validation
- Custom errors  
- Owner-only privileges  
- Reverts for invalid operations  
- Pausable contract logic

### ✔ Complete Test Suite
Includes tests for:
- Minting  
- Approvals  
- Transfers  
- Operator approvals  
- Burning  
- Metadata  
- Pausing  
- Max supply  
- Gas usage  

All **tests pass successfully**.

---

## 📂 Project Structure

nft-contract/
│
├── contracts/
│ └── NftCollection.sol
│
├── test/
│ └── NftCollection.test.js
│
├── Dockerfile
├── hardhat.config.js
├── package.json
└── README.md


---

## 🛠️ Local Development

### Compile Contracts
npx hardhat compile


### Run Tests
npx hardhat test


### Expected Output
All tests passing


---

## 🐳 Running With Docker (Reproducible Environment)

### Build Docker image
docker build -t nft-contract .


### Run tests inside Docker
docker run --rm nft-contract


---

## Docker Environment Details

- **Base Image Used:** `node:18-alpine`  
  - Lightweight, fast, suitable for Hardhat  
  - Ideal for reproducible builds

- **Assumptions:**
  - Docker is installed and running  
  - All dependencies are installed inside Docker automatically  
  - No manual setup required inside the container  

---

## 🔧 Technologies Used
- Solidity  
- Hardhat  
- Ethers.js  
- OpenZeppelin  
- Docker  
- Mocha & Chai  

---

## 📌 Key Design Decisions
- Token IDs start from **1**  
- `maxSupply` strictly enforced  
- Custom errors for efficiency  
- Uses `Ownable` for access control  
- Metadata handled via base URI  
- `totalSupply` updates on mint and burn  

---

## 👤 Author
**Thanmahi Peruri**


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// Simple but production-minded ERC721 NFT collection
/// - owner (Ownable) can mint, pause/unpause
/// - maxSupply enforced
/// - tokenURI uses baseURI + tokenId (overrideable)
/// - emits standard events via ERC721
/// - uses ERC721, ERC721Burnable, Pausable, Ownable from OpenZeppelin

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract NftCollection is ERC721, Pausable, Ownable, ERC721Burnable {
    using Counters for Counters.Counter;

    string private _baseTokenURI;
    uint256 public immutable maxSupply;
    Counters.Counter private _tokenIdCounter; // counts minted tokens
    uint256 public totalSupply; // track current supply (mint - burn)

    error MintToZeroAddress();
    error MaxSupplyReached();
    error TokenDoesNotExist(uint256 tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 maxSupply_
    ) ERC721(name_, symbol_) {
        require(maxSupply_ > 0, "maxSupply must be > 0");
        _baseTokenURI = baseURI_;
        maxSupply = maxSupply_;
    }

    // ---------- Modifiers / Guards ----------
    // Note: OpenZeppelin now uses a 4-argument hook: (from, to, tokenId, batchSize)
    // We must match that signature and pass batchSize to super.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        require(!paused(), "token transfer while paused");
    }

    // ---------- Admin functions ----------
    /// @notice Admin-only mint (safe)
    function safeMint(address to) external onlyOwner whenNotPaused returns (uint256) {
        if (to == address(0)) revert MintToZeroAddress();
        uint256 newId = _tokenIdCounter.current() + 1; // start token IDs at 1
        if (newId > maxSupply) revert MaxSupplyReached();

        _tokenIdCounter.increment();
        _safeMint(to, newId);
        totalSupply += 1;
        return newId;
    }

    /// Admin can pause/unpause (pauses transfers & minting checks via whenNotPaused)
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ---------- Metadata ----------
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// Admin can update base URI
    function setBaseURI(string memory newBase) external onlyOwner {
        _baseTokenURI = newBase;
    }

    /// tokenURI uses base + tokenId
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist(tokenId);
        string memory base = _baseURI();
        return bytes(base).length > 0 ? string(abi.encodePacked(base, _toString(tokenId))) : "";
    }

    // helper to convert uint => string (small gas footprint)
    function _toString(uint256 value) internal pure returns (string memory) {
        // inspired by OpenZeppelin Strings.toString
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // ---------- Optional: burn override to keep totalSupply correct ----------
    function burn(uint256 tokenId) public override {
        super.burn(tokenId);
        totalSupply -= 1;
    }

    // ---------- Read-only helpers ----------
    function currentMinted() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // safety: ensure token exists for external callers that expect revert messages
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }
}

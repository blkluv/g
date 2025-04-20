// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract VisitToken is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    mapping(address => uint256[]) public ownerToTokens;

    constructor(
        address initialOwner
    ) ERC721("VisitToken", "CVST") Ownable(initialOwner) {}

    function safeMint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        ownerToTokens[to].push(tokenId);
        return tokenId;
    }

    function getTokensByOwner(
        address owner
    ) external view returns (uint256[] memory) {
        return ownerToTokens[owner];
    }

    function getTokenURIsByOwner(
        address owner
    ) external view returns (string[] memory) {
        uint256 k = ownerToTokens[owner].length;
        string[] memory uris = new string[](k);
        for (uint256 j = 0; j < k; j++) {
            uris[j] = super.tokenURI(ownerToTokens[owner][j]);
        }
        return uris;
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

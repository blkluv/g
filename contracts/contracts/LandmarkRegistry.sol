// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./VisitToken.sol";

contract LandmarkRegistry {
    VisitToken public visitToken;

    // Grid precision: 0.001 degrees (~111 meters)
    int constant PRECISION = 1000;

    struct Landmark {
        int lat;
        int lng;
        uint256 tokenId;
        address owner;
    }

    // grid[lat][lng] => visit token ids
    mapping(int => mapping(int => uint256[])) public grid;

    mapping(uint256 => Landmark) public landmarks;

    event LandmarkCreated(
        uint256 indexed tokenId,
        address indexed owner,
        int lat,
        int lng
    );

    constructor(address tokenAddr) {
        visitToken = VisitToken(tokenAddr);
    }

    function _gridCoord(int coord) internal pure returns (int) {
        return coord / PRECISION;
    }

    function createMarker(int lat, int lng, string memory tokenURI) external {
        uint256 tokenId = visitToken.safeMint(msg.sender, tokenURI);
        int latIndex = _gridCoord(lat);
        int lngIndex = _gridCoord(lng);

        grid[latIndex][lngIndex].push(tokenId);
        landmarks[tokenId] = Landmark(lat, lng, tokenId, msg.sender);

        emit LandmarkCreated(tokenId, msg.sender, lat, lng);
    }

    // Returns nearby marker tokenIds within a grid window
    function getMarkersNearby(
        int lat,
        int lng,
        int range
    ) external view returns (uint256[] memory) {
        int latIndex = _gridCoord(lat);
        int lngIndex = _gridCoord(lng);

        uint256 count = 0;

        // 1st pass to get count
        for (int i = -range; i <= range; i++) {
            for (int j = -range; j <= range; j++) {
                count += grid[latIndex + i][lngIndex + j].length;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 k = 0;

        // 2nd pass to collect tokens
        for (int i = -range; i <= range; i++) {
            for (int j = -range; j <= range; j++) {
                uint256[] storage cell = grid[latIndex + i][lngIndex + j];
                for (uint m = 0; m < cell.length; m++) {
                    result[k++] = cell[m];
                }
            }
        }

        return result;
    }

    function getMarkerInfo(
        uint256 tokenId
    ) external view returns (int, int, address) {
        Landmark memory m = landmarks[tokenId];
        return (m.lat, m.lng, m.owner);
    }
}

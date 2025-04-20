// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "./VisitToken.sol";

contract LandmarkRegistry {
    VisitToken public visitToken;

    int constant PRECISION = 500; // 0.002 degrees
    uint256 public nextLandmarkId;

    struct Landmark {
        uint256 id;
        string name;
        string imageURI;
        int lat;
        int lng;
        address owner;
        int pathIndex;
    }

    // Mapping of landmarkId to landmark info
    mapping(uint256 => Landmark) public landmarks;

    // Grid-based lookup
    mapping(int => mapping(int => uint256[])) public grid;

    // Track visits: landmarkId => visitor => bool
    mapping(uint256 => mapping(address => bool)) public hasVisited;

    mapping(address => uint256[]) public visitedLandmarks;

    event LandmarkRegistered(
        uint256 indexed id,
        address indexed owner,
        string name,
        int lat,
        int lng
    );

    event VisitMinted(
        uint256 indexed tokenId,
        address indexed visitor,
        uint256 indexed landmarkId
    );

    constructor(address _visitToken) {
        visitToken = VisitToken(_visitToken);
    }

    function _gridCoord(int coord) internal pure returns (int) {
        return coord / PRECISION;
    }

    function registerLandmark(
        string memory name,
        string memory imageUri,
        int lat,
        int lng,
        int pathIndex
    ) external {
        uint256 id = nextLandmarkId++;

        landmarks[id] = Landmark({
            id: id,
            name: name,
            imageURI: imageUri,
            lat: lat,
            lng: lng,
            owner: msg.sender,
            pathIndex: pathIndex
        });

        int latIdx = _gridCoord(lat);
        int lngIdx = _gridCoord(lng);
        grid[latIdx][lngIdx].push(id);

        emit LandmarkRegistered(id, msg.sender, name, lat, lng);
    }

    function getNearbyLandmarks(
        int lat,
        int lng
    ) external view returns (Landmark[] memory) {
        int latIdx = _gridCoord(lat);
        int lngIdx = _gridCoord(lng);

        uint256 count = 0;

        // access 3x3 grid around user's grid cell
        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                count += grid[latIdx + i][lngIdx + j].length;
            }
        }

        Landmark[] memory result = new Landmark[](count);
        uint256 k = 0;

        for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
                uint256[] storage cell = grid[latIdx + i][lngIdx + j];
                for (uint m = 0; m < cell.length; m++) {
                    result[k++] = landmarks[cell[m]];
                }
            }
        }

        return result;
    }

    function getVisitedLandmarks(
        address user
    ) external view returns (Landmark[] memory) {
        uint256 k = visitedLandmarks[user].length;
        Landmark[] memory result = new Landmark[](k);

        for (uint256 i = 0; i < k; i++) {
            result[i] = landmarks[(visitedLandmarks[user])[i]];
        }

        return result;
    }

    function visitLandmark(
        uint256 landmarkId,
        string memory pictureUri
    ) external {
        require(
            landmarks[landmarkId].owner != address(0),
            "Landmark does not exist"
        );
        // require(!hasVisited[landmarkId][msg.sender], "Already visited");

        hasVisited[landmarkId][msg.sender] = true;
        uint256 tokenId = visitToken.safeMint(msg.sender, pictureUri);
        visitedLandmarks[msg.sender].push(landmarkId);

        emit VisitMinted(tokenId, msg.sender, landmarkId);
    }

    function hasUserVisited(
        uint256 landmarkId,
        address user
    ) external view returns (bool) {
        return hasVisited[landmarkId][user];
    }
}

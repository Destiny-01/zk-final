// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[24] memory input
    ) external view returns (bool);
}

contract DeadTarget is ERC721URIStorage {
    IVerifier private verifier;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(address => string) internal solutionHashes;
    mapping(address => uint256) internal lastGameCreated;

    constructor(address _verifier) ERC721("DeadTargetNFT", "DTA") {
        verifier = IVerifier(_verifier);
    }

    function tokenURI()
        private
        pure
        returns (string memory)
    {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Dead Target winner #', '"',
                '"description": "Reward for winning dead target', '"',
            '}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function won(
        address receiver
    )
        public
        returns (uint256)
    {
        require(lastGameCreated[msg.sender] > 0);
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(receiver, newItemId);
        _setTokenURI(newItemId, tokenURI());

        return newItemId;
    }

    function startGame(string memory hash) public {
        solutionHashes[msg.sender] = hash;
        lastGameCreated[msg.sender] = block.timestamp;
    }

    function guess(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[24] memory _input
    ) public view returns (bool) {
        return verifier.verifyProof(_a, _b, _c, _input);
    }
    
}

// 0x2e97EbdB8C2536A5349ec646dC499495daCA184c

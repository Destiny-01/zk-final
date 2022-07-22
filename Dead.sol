// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Verifier.sol";

interface IVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[36] memory input
    ) external view returns (bool);
}

interface IHasher {
    function poseidon(uint256[6] calldata inputs) external view returns (uint256 hash);
}

contract DeadTarget is ERC721URIStorage {
    IHasher public hasher;
    IVerifier public verifier;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Game {
        address player1;
        address player2;
        uint256 solution1;
        uint256 solution2;
        uint256 hash2;
        uint256 hash1;
        uint256[] guesses2;
        uint256[] guesses1;
        uint256[5][] status2;
        uint256[5][] status1;
        uint256 salt1;
        uint256 salt2;
        address turn;
        address winner;
        bool active;
    }

    struct Player {
        uint256 wins;
        uint256 losses;
    }

    event GameCreated (uint256 indexed _id);
    event GameJoined (uint256 indexed _id);
    event Guessed (uint256 indexed _id, address indexed _player, uint256 _guess, uint256[5] status);
    event GameWon (uint256 indexed _id, address indexed _winner);

    mapping(uint256 => Game) games;
    mapping(address => Player) players;

    constructor(address _verifier, address _hasher) ERC721("MythArenaNFT", "MAN") {
        hasher = IHasher(_hasher);
        verifier = IVerifier(_verifier);
    }

    function tokenURI()
        public
        pure
        returns (string memory)
    {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "Myth Arena winner NFT #', '"',
                '"image": "https://ipfs.io/ipfs/QmTR6TUi12eEmMLZ39FrSwX3udvoeT7F979B45wxhtiosw', '"',
                '"description": "Reward for winning Myth Arena', '"',
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
        uint256 _id,
        uint256 _guess
    ) public {
        require(games[_id].active, "Game not found");
        require(games[_id].winner == address(0), "Game won already");
        if(games[_id].player1 == msg.sender) {
            require(games[_id].solution2 == _guess, "How did you win?");
            players[games[_id].player2].losses++;
        } else if(games[_id].player2 == msg.sender) {
            require(games[_id].solution1 == _guess, "How did you win?");
            players[games[_id].player1].losses++;
        } else {
            revert("You didn't play...");
        }
        _tokenIds.increment();
        players[msg.sender].wins++;
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI());

        games[_id].winner = msg.sender;
        games[_id].active = false;

        emit GameWon (_id, msg.sender);
    }

    function startGame(
        uint256 _id,
        uint256 _salt,
        uint256 _solution,
        uint256 _solution1,
        uint256 _solution2,
        uint256 _solution3,
        uint256 _solution4,
        uint256 _solution5
    ) public {
        require (!games[_id].active, "Game id is taken");
        uint256 hash = hasher.poseidon([_solution1, _solution2, _solution3, _solution4, _solution5, _salt]);
        games[_id].hash1 = hash;
        games[_id].player1 = msg.sender;
        games[_id].salt1 = _salt;
        games[_id].solution1 = _solution;
        games[_id].active = true;

        emit GameCreated(_id);
    }

    function joinGame(
        uint256 _id,
        uint256 _salt,
        uint256 _solution,
        uint256 _solution1,
        uint256 _solution2,
        uint256 _solution3,
        uint256 _solution4,
        uint256 _solution5
    ) public {
        require (games[_id].active, "Game id is taken");
        require (games[_id].player2 == address(0), "Game already full");
        require (games[_id].player1 != msg.sender, "Can't join your own game");
        uint256 hash = hasher.poseidon([_solution1, _solution2, _solution3, _solution4, _solution5, _salt]);
        games[_id].hash2 = hash;
        games[_id].player2 = msg.sender;
        games[_id].salt2 = _salt;
        games[_id].solution2 = _solution;
        games[_id].turn = games[_id].player1;

        emit GameJoined(_id);
    }

    function guessCode(
        uint256 _id,
        uint256 guess,
        uint256[5] memory status,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[36] memory _input
    ) public {
        require(games[_id].active, "Game not found");
        require(games[_id].turn == msg.sender, "Not your turn to guess");
        require (verifier.verifyProof(_a, _b, _c, _input), "Proof check failed");

        if(games[_id].player1 == msg.sender) {
            games[_id].guesses1.push(guess);
            games[_id].status1.push(status);
        } else {
            games[_id].status2.push(status);
            games[_id].guesses2.push(guess);
        }

        games[_id].turn == games[_id].player1
            ? games[_id].turn = games[_id].player2
            : games[_id].turn = games[_id].player1;
        
        emit Guessed (_id, msg.sender, guess, status);
    }

    function getGame(uint256 _id) public view returns (Game memory game) {
        return games[_id];
    }

    function getPlayer() public view returns (Player memory player) {
        return players[msg.sender];
    }
    
}

// Hasher: 0xF323Fa91f47F5A76FEaa63C991eEd0fBD896687b
// Verifier: 0x42F3b6dAFAEC1F5df5c7D44224633250fb97b710

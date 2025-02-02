// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import { SignUpGatekeeper } from "./SignUpGatekeeper.sol";

/// @title SignUpTokenGatekeeper
/// @notice This contract allows to gatekeep MACI signups
/// by requiring new voters to own a certain ERC721 token
contract SignUpTokenGatekeeper is SignUpGatekeeper, Ownable(msg.sender) {
  /// @notice the reference to the SignUpToken contract
  ERC721 public immutable token;

  /// @notice the reference to the MACI contract
  address public maci;

  /// @notice a mapping of tokenIds to whether they have been used to sign up
  mapping(uint256 => bool) public registeredTokenIds;

  /// @notice custom errors
  error AlreadyRegistered();
  error NotTokenOwner();
  error OnlyMACI();

  /// @notice creates a new SignUpTokenGatekeeper
  /// @param _token the address of the ERC20 contract
  constructor(address _token) payable {
    token = ERC721(_token);
  }

  /// @notice Adds an uninitialised MACI instance to allow for token signups
  /// @param _maci The MACI contract interface to be stored
  function setMaciInstance(address _maci) public override onlyOwner {
    maci = _maci;
  }

  /// @notice Registers the user if they own the token with the token ID encoded in
  /// _data. Throws if the user does not own the token or if the token has
  /// already been used to sign up.
  /// @param _user The user's Ethereum address.
  /// @param _data The ABI-encoded tokenId as a uint256.
  function register(address _user, bytes memory _data) public override {
    if (maci != msg.sender) revert OnlyMACI();
    // Decode the given _data bytes into a uint256 which is the token ID
    uint256 tokenId = abi.decode(_data, (uint256));

    // Check if the user owns the token
    bool ownsToken = token.ownerOf(tokenId) == _user;
    if (!ownsToken) revert NotTokenOwner();

    // Check if the token has already been used
    bool alreadyRegistered = registeredTokenIds[tokenId];
    if (alreadyRegistered) revert AlreadyRegistered();

    // Mark the token as already used
    registeredTokenIds[tokenId] = true;
  }

  /// @notice Get the trait of the gatekeeper
  /// @return The type of the gatekeeper
  function getTrait() public pure override returns (string memory) {
    return "Token";
  }
}

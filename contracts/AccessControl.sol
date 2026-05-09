// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract AccessControl {

    address public admin;
    mapping(address => bool) public authorized;

    event AccessGranted(address user);
    event AccessDenied(address user);

    constructor() {
        admin = msg.sender;

        authorized[msg.sender] = true;
    }

    function authorizeUser(address user) public {
        require(msg.sender == admin, "Only admin allowed");

        authorized[user] = true;
    }

    function revokeUser(address user) public {
        require(msg.sender == admin, "Only admin allowed");

        authorized[user] = false;
    }

    function requestAccess() public {
        if (authorized[msg.sender]) {
            emit AccessGranted(msg.sender);
        } else {
            emit AccessDenied(msg.sender);
        }
    }
}
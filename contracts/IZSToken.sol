// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./ERC.sol";
import "./IERC20.sol";

contract IZSToken is ERC20 {
    constructor(address shop) ERC20("IzobShop", "IZS", 20, shop) {}
}

contract IZShop {
    IERC20 public token;
    address payable public owner;

    event Bought(uint _amount, address indexed _buyer);
    event Sold(uint _amount, address indexed _seller);

    constructor() {
        token = new IZSToken(address(this));
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not an owner!");
        _;
    }

    receive() external payable {
        uint tokensToBuy = msg.value;
        require(tokensToBuy > 0, "not enough funds!");
        require(tokenBalance() >= tokensToBuy, "not enough tokens!");
        token.transfer(msg.sender, tokensToBuy);
        emit Bought(tokensToBuy, msg.sender);
    }

    function sell(uint _amountToSell) external {
        require(
            _amountToSell > 0 && token.balanceOf(msg.sender) >= _amountToSell,
            "incorrect amount!"
        );

        uint allowance = token.allowance(msg.sender, address(this));
        require(allowance >= _amountToSell, "check allowance");
        token.transferFrom(msg.sender, address(this), _amountToSell);
        payable(msg.sender).transfer(_amountToSell);
        emit Sold(_amountToSell, msg.sender);
    }

    function tokenBalance() public view returns (uint) {
        return token.balanceOf(address(this));
    }
}

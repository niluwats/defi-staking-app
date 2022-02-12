pragma solidity ^0.5.0;

import "./RWD.sol";
import "./Tether.sol";

contract DecentralBank {
    string public name = "Decentral Bank";
    address public owner;
    Tether public tether;
    RWD public rwd;

    address[] public stakers;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(RWD _rwd, Tether _tether) public {
        rwd = _rwd;
        tether = _tether;
        owner = msg.sender;
    }

    // staking function
    function depositTokens(uint256 _amount) public {
        require(_amount > 0, "amount cannot be zero");
        //  transfer tether tokens to this contract address for staking
        tether.transferFrom(msg.sender, address(this), _amount);

        // update staking balance
        stakingBalance[msg.sender] += _amount;

        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // issue rewards
    function issueTokens() public {
        require(msg.sender == owner, "the caller must be the owner");
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient] / 9;
            require(balance > 0, "insufficient balance");
            rwd.transfer(recipient, balance);
        }
    }

    // unstake tokens
    function unstake() public {
        uint256 balance = stakingBalance[msg.sender];
        require(balance > 0, "staking balance cannot be less than zero");
        tether.transfer(msg.sender, balance);

        stakingBalance[msg.sender] = 0;

        isStaking[msg.sender] = false;
        // stakers.pop(msg.sender);
    }
}

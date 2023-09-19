//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Staking is Ownable {

    using SafeMath for uint256;

    IERC20 private _token;

    uint256 totalAmountStaked;
    uint256 maximumAmountStaked;
    uint256 minimumAmountToStake;
    bool paused;

    constructor(address _ERC20Address)  {
        _token = IERC20(0x2e5E530dC2C6b2A8f214ee929dC4a302575881A9);
        maximumAmountStaked = 10000 ether;
        minimumAmountToStake = 10 ether;
        paused = false;
    }


    //Fiecare stake este o structura care contine user,cantitate si timpul 
    struct Stake {
        address user;
        uint256 amount;
        uint256 since;
    }

    //Stakeholder este un staker care are deja stake-uria active
    struct Stakeholder {
        address user;
        Stake[] address_stakes;
    }

    Stakeholder[] internal stakeholders; // un vector care contine toate stake-urile facute 

    mapping (address => uint256) internal stakes; //

    event Staked(
        address indexed user,
        uint256 amount,
        uint256 index,
        uint256 timestamp
    );

    function _addStakeholder (address staker) internal returns (uint256){
        // se impinge un item gol in vector pentru a face un loc liber 
        stakeholders.push(); 
        // userIndex retine index-ul ultimului item din array
        uint256 userIndex = stakeholders.length - 1;
        // se retine adresa la noul index
        stakeholders[userIndex].user = staker;
        // 
        stakes[staker] = userIndex;

        return userIndex;
    }

    //_stake va face un stake pentru un user. Aceasta va lua o cantitate de monede din adresa user-ului si o va pune
    //intr-un container al contractului
    function _stake (uint256 _amount) external {
        require (!paused , "Staking is currently paused !");
        require (
            _amount >= minimumAmountToStake,
            "Minimum amount to stake is 10 WCHK"
        );
        require(
            (totalAmountStaked + _amount) <= maximumAmountStaked,
            "Staking limit exceeded. Lower your stake!"
        );
        require (_amount > 0 , "Can't stake nothing");
        require(
            _amount <= _token.balanceOf(msg.sender),
            "Can't stake more than you own!"
        );

        uint256 index = stakes[msg.sender];
        uint256 timestamp = block.timestamp;
        if (index == 0) {
            index = _addStakeholder(msg.sender);
        }

        stakeholders[index].address_stakes.push(Stake(msg.sender,_amount,timestamp));

        _token.transferFrom(msg.sender,address(this), _amount);
        totalAmountStaked += _amount;

        emit Staked(msg.sender, _amount, index,timestamp);
    }
    
    function computeStakeRewards (Stake memory _currentStake) internal view returns (uint256) {
        uint256 sinceIsStaking = _currentStake.since;
        uint256 currentTimeStamp = block.timestamp;
        //11% ROI/an => rewardPerHour = 0.001255% ( 11 / (365 * 24))
        uint256 reward = currentTimeStamp.sub(sinceIsStaking);
        reward = reward.div(1 hours);
        reward = reward.mul(_currentStake.amount);
        reward = reward.mul(1255);
        //reward = reward.div(10**8);

        return reward;

    }

    function computeUserRewards () external view returns (uint256) {
        uint256 user_index = stakes[msg.sender];
        uint256 totalReward;
        Stake[] memory userStakes = stakeholders[user_index].address_stakes;
        for (uint256 i = 0; i < userStakes.length; i++) {
            totalReward = totalReward + computeStakeRewards(userStakes[i]);
        }

        return totalReward;
    }

     function computeRewardPerStake(uint256 _stakeIndex)
        public
        view
        returns (uint256)
    {
    

        uint256 user_index = stakes[msg.sender];
        Stake memory currentStake = stakeholders[user_index].address_stakes[
            _stakeIndex
        ];

        uint256 reward = computeStakeRewards(currentStake);
        return reward;
    }

    function harvestReward (uint256 _stakeIndex) public  {
        uint256 user_index = stakes[msg.sender];
        Stake memory currentStake = stakeholders[user_index].address_stakes[_stakeIndex] ;
        uint256 currentTimeStamp = block.timestamp;
        uint256 sinceIsStaking = currentStake.since;
        uint256 minimumAmount = 0.1 ether;
        uint256 reward = computeStakeRewards(currentStake);

        //require (reward > minimumAmount , "Minimum harvest amount is 10 MTK");
        require (currentTimeStamp - sinceIsStaking > 1 minutes,
        "Minimum period until you can harvest your reward is 7 days");
        
        stakeholders[user_index].address_stakes[_stakeIndex].since = block.timestamp;

        _token.transfer(msg.sender, reward);
    }



    function withdrawStake (uint256 _stakeIndex) public {
        uint256 user_index = stakes[msg.sender];
        Stake memory currentStake = stakeholders[user_index].address_stakes[_stakeIndex];
        uint256 currentTimeStamp = block.timestamp;
        uint256 sinceIsStaking = currentStake.since;
        uint256 minimumTime = 1 minutes;

        require (currentTimeStamp - sinceIsStaking >= minimumTime ,
        "You can only withdraw after a minimum of 7 days");

        uint256 reward = computeStakeRewards(currentStake);
        uint256 totalAmount = reward + currentStake.amount;

        totalAmountStaked = totalAmountStaked - currentStake.amount;
        currentStake.amount = 0;
        delete stakeholders[user_index].address_stakes[_stakeIndex];

        _token.transfer(msg.sender, totalAmount);

    }

    function getTotalStakedOfStaker(address _staker)
        external
        view
        onlyOwner
        returns (uint256)
    {
        uint256 totalStaked;
        uint256 user_index = stakes[_staker];

        Stake[] memory currentStakes = stakeholders[user_index].address_stakes;
        for (uint256 i = 0; i < currentStakes.length; i++) {
            totalStaked = totalStaked + currentStakes[i].amount;
        }

        return totalStaked;
    }
    
    function getTotalRewardOfStaker(address staker)
        public
        view
        onlyOwner
        returns (uint256) 
        {
            require(
            staker != address(0),
            "Staker address must not be equal to zero-address!"
            );

            uint256 totalReward;
            uint256 user_index = stakes[staker];
            Stake[] memory currentStakes = stakeholders[user_index].address_stakes;

            for (uint256 i = 0; i < currentStakes.length; i++) {
            totalReward = totalReward + computeStakeRewards(currentStakes[i]);
        }

            return totalReward;

        }
    function forceStop() external onlyOwner {
        uint256 stakeReward;
        uint256 stakeAmount;
        address staker;

        for (uint256 i=0 ; i < stakeholders.length; i++)
        {
            stakeAmount = 0;
            stakeReward = 0;
            staker = stakeholders[i].user;
            for(uint256 j=0 ; j< stakeholders[i].address_stakes.length;j++ ) {
                stakeAmount = stakeholders[i].address_stakes[j].amount + stakeAmount;
                  stakeReward =
                  stakeReward +
                    computeStakeRewards(stakeholders[i].address_stakes[j]);
                stakeholders[i].address_stakes[j].amount = 0;
                delete stakeholders[i].address_stakes[j];
            }
            _token.transfer(staker, stakeAmount + stakeReward);
        }
    }

    function getAllStakes() external view returns (Stake[] memory) {
        uint256 user_index = stakes[msg.sender];
        return stakeholders[user_index].address_stakes;
    }

    function getTotalStaked() public view onlyOwner returns (uint256) {
        return totalAmountStaked;
    }


}

import { ethers } from "ethers";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CONTRACTS_REQUEST,
  CONTRACTS_SUCCESSFUL,
} from "../features/slicers/blockainSlicer";
import { FunctionFragment } from "ethers/lib/utils";

export default function StakePage() {
  const dispatch = useDispatch();
  const connectionState = useSelector((state) => state.blockchainReducer);
  const [stakingContractObj, setStakingContractObj] = useState(null);
  const [tokenContractObj, setTokenContractObj] = useState(null);
  const [quantity, setQuantity] = useState(0);

  const [stakes, setStakes] = useState([]);
  const [rewards, setRewards] = useState([]);

  const stake = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    //Pentru instantiere contract avem nevoie de adresa lui,ABI si signer
    const stakeaddress = "0xC04f12d19dae41480Baf55193189c2339a9E8b7D";
    const tokenaddress = "0x2e5E530dC2C6b2A8f214ee929dC4a302575881A9";
    const payload = { stake: stakeaddress, token: tokenaddress };
    dispatch(CONTRACTS_SUCCESSFUL(payload));
    const stakingABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "_stake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "forceStop",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_stakeIndex",
				"type": "uint256"
			}
		],
		"name": "harvestReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_ERC20Address",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "Staked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_stakeIndex",
				"type": "uint256"
			}
		],
		"name": "withdrawStake",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_stakeIndex",
				"type": "uint256"
			}
		],
		"name": "computeRewardPerStake",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "computeUserRewards",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllStakes",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "user",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "amount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "since",
						"type": "uint256"
					}
				],
				"internalType": "struct Staking.Stake[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "staker",
				"type": "address"
			}
		],
		"name": "getTotalRewardOfStaker",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalStaked",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_staker",
				"type": "address"
			}
		],
		"name": "getTotalStakedOfStaker",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
    const tokenABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenOwner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"a","type":"uint256"},{"internalType":"uint256","name":"b","type":"uint256"}],"name":"safeAdd","outputs":[{"internalType":"uint256","name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"a","type":"uint256"},{"internalType":"uint256","name":"b","type":"uint256"}],"name":"safeDiv","outputs":[{"internalType":"uint256","name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"a","type":"uint256"},{"internalType":"uint256","name":"b","type":"uint256"}],"name":"safeMul","outputs":[{"internalType":"uint256","name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"internalType":"uint256","name":"a","type":"uint256"},{"internalType":"uint256","name":"b","type":"uint256"}],"name":"safeSub","outputs":[{"internalType":"uint256","name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];

    const stakingContract = await new ethers.Contract(
      stakeaddress,
      stakingABI,
      signer
    );

    setStakingContractObj(stakingContract);

    const tokenContract = new ethers.Contract(tokenaddress, tokenABI, signer);
    setTokenContractObj(tokenContract);
  };

  React.useEffect(function () {
    stake();
  }, []);

  React.useEffect(() => {
    if (stakingContractObj !== null) {
      getStakes();
    }
  }, [stakingContractObj]);

  const getStakes = async () => {
    let res = await stakingContractObj.getAllStakes();
    setStakes(res);

    var _rewards = [];
    await Promise.all(
      res.map(async (element, index) => {
        var reward = await stakingContractObj.computeRewardPerStake(index);
        reward = ethers.utils.formatUnits(reward.toString(), "ether");
        _rewards.push(reward);
      })
    );
    console.log(_rewards);

    setRewards(_rewards);
  };

  const computeRewardPerStake = async (_index) => {
    let res = await stakingContractObj.computeRewardPerStake(_index);
    return res / 10 ** 18;
  };

  const withdrawStake = async (_index) => {
    await stakingContractObj.withdrawStake(_index);
    getStakes();
    alert("withdraw successful");
  };

  const harvestStake = async (_index) => {
    await stakingContractObj.harvestReward(_index);
    getStakes();
    alert("harvest successful");
  };

  const stakeFunction = async () => {
    const amountToWei = ethers.utils.parseUnits(quantity.toString(), "ether");
    const tx = await tokenContractObj.approve(
      stakingContractObj.address,
      amountToWei
    );
    await tx.wait();
    const response = await stakingContractObj._stake(amountToWei);
    await response.wait();
    getStakes();
    alert("Staking Successful");
  };

  return (
    <div className="page">
      <h1>Your stakes</h1>
      <input
        onChange={(e) => setQuantity(e.target.value)}
        type="number"
      ></input>
      <button onClick={() => stakeFunction()}>stake</button>
      <button onClick={() => getStakes()}>Show your stakes</button>
      {stakes.map((stake, index) => {
        if (stake.amount != 0) {
          return (
            <div className="eachStake" key={index}>
              <p>{stake.amount / 10 ** 18} WCHK</p>
              <p>Your reward: {rewards[index]}</p>
              <button onClick={() => harvestStake(index)}>Harvest</button>
              <button onClick={() => withdrawStake(index)}>Withdraw</button>
            </div>
          );
        }
      })}
      {}
    </div>
  );
}

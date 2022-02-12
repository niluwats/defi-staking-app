import contract from "@truffle/contract";
import detectEthereumProvider from "@metamask/detect-provider";

// export const laodContract = async (name, provider) => {
//   console.log("reached");
//   const res = await fetch(`/${name}.json`);
//   console.log("reached");
//   console.log(res);
//   const Artifact = await res.json();
//   const cont = contract(Artifact);
//   cont.setProvider(provider);
//   const deployedCon = await cont.deployed();
//   console.log("reached");
//   await deployedCon.issueTokens();
// return deployedCon;
// };

// export default laodContract;

// var contractj = require("../truffle_abis/DecentralBank.json");

// function issueRewards(callback) {
//   // let decentralBank =  contractj.deployed();
//   // await decentralBank.issueTokens();
//   contractj["DecentralBank"].deployed().then((value) => {
//     value.issueTokens();
//     console.log("Tokens have been issued successfully");
//     callback();
//   });
// }
// export default issueRewards;

// const DecentralBank = require("../truffle_abis/DecentralBank.json");

export const issueRewards = async (callback) => {
  const provider = await detectEthereumProvider();

  const res = await fetch(`/DecentralBank.json`);
  const artifact = await res.json();
  const cont = contract(artifact);
  cont.setProvider(provider);
  const deployedCon = await cont.deployed();
  console.log("reached");
  await deployedCon.issueTokens();
  console.log("Tokens have been issued successfully");
  callback();
};

export default issueRewards();

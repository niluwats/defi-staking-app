import React, { Component } from "react";
import "./App.css";
import "./Navbar";
import Navbar from "./Navbar";
import Web3 from "web3";
import Tether from "../truffle_abis/Tether.json";
import RWD from "../truffle_abis/RWD.json";
import DecentralBank from "../truffle_abis/DecentralBank.json";
import Main from "./Main";
import ParticleSettings from "./ParticleSettings";
// import detectEthereumProvider from "@metamask/detect-provider";
// import loadContract from "../scripts/issue-tokens.js";

class App extends Component {
  async UNSAFE_componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("No ethereum browser detected! checkout metamask");
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    //load tether contract

    const tetherData = Tether.networks[networkId];
    // console.log("tether address - ", tetherData.address);
    if (tetherData) {
      const tether = new web3.eth.Contract(Tether.abi, tetherData.address);
      this.setState({ tether });

      console.log(await tether.methods.balanceOf(this.state.account).call());
      let tetherBalance = await tether.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ tetherBalance: tetherBalance.toString() });
    } else {
      window.alert("Error! tether contract not deployed - no detected network");
    }

    const rwdData = RWD.networks[networkId];
    if (rwdData) {
      const rwd = new web3.eth.Contract(RWD.abi, rwdData.address);
      this.setState({ rwd });

      let rwdBalance = await rwd.methods.balanceOf(this.state.account).call();
      this.setState({ rwdBalance: rwdBalance.toString() });
    } else {
      window.alert("Error! rwd contract not deployed - no detected network");
    }

    const deBankData = DecentralBank.networks[networkId];
    if (deBankData) {
      const decentralBank = new web3.eth.Contract(
        DecentralBank.abi,
        deBankData.address
      );
      this.setState({ decentralBank });

      let stakingBalance = await decentralBank.methods
        .stakingBalance(this.state.account)
        .call();
      this.setState({ stakingBalance: stakingBalance.toString() });
    } else {
      window.alert(
        "Error! Decentral Bank contract not deployed - no detected network"
      );
    }
    this.setState({ loading: false });
  }

  //staking function
  stakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.tether.methods
      .approve(this.state.decentralBank._address, amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
    this.state.decentralBank.methods
      .depositTokens(amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  // unstaking function
  unstakeTokens = () => {
    this.setState({ loading: true });
    this.state.decentralBank.methods
      .unstake()
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  issueTokens = async () => {
    this.setState({ loading: true });
    console.log("reached");

    let owner = await this.state.decentralBank.methods.owner().call();
    console.log("decentralbank's owner - ", owner);
    console.log(window.web3.utils.isAddress(owner));
    this.state.decentralBank.methods
      .issueTokens()
      .send({ from: owner })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0W3WRH34J4J2NFF",
      tether: {},
      rwd: {},
      decentralBank: {},
      tetherBalance: "0",
      rwdBalance: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  render() {
    let content;
    {
      this.state.loading
        ? (content = (
            <p
              id="loader"
              className="text-center"
              style={{ margin: "30px", color: "white" }}
            >
              LOADING PLEASE...
            </p>
          ))
        : (content = (
            <Main
              tetherBalance={this.state.tetherBalance}
              rwdBalance={this.state.rwdBalance}
              stakingBalance={this.state.stakingBalance}
              stakeTokens={this.stakeTokens}
              unstakeTokens={this.unstakeTokens}
              issueTokens={this.issueTokens}
            />
          ));
    }
    return (
      <div className="App" style={{ position: "relative" }}>
        <div style={{ position: "absolute" }}>
          <ParticleSettings />
        </div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px", minHeight: "100vm" }}
            >
              <div>{content}</div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

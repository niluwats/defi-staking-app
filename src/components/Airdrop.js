import React, { Component } from "react";
// import { issueRewards } from "../scripts/issue-tokens";
// import detectEthereumProvider from "@metamask/detect-provider";

class Airdrop extends Component {
  constructor() {
    super();
    this.state = { time: {}, seconds: 5 };
    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  startTimer() {
    if (this.timer == 0 && this.state.seconds > 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown() {
    let seconds = this.state.seconds - 1;
    this.setState({ time: this.secondsToTime(seconds), seconds: seconds });
    if (seconds == 0) {
      clearInterval(this.timer);
    }
  }

  secondsToTime(secs) {
    let hours, minutes, seconds;
    hours = Math.floor(secs / (60 * 60));

    let devisor_for_minutes = secs % (60 * 60);
    minutes = Math.floor(devisor_for_minutes / 60);

    let devisor_for_seconds = devisor_for_minutes % 60;
    seconds = Math.ceil(devisor_for_seconds);

    let obj = {
      h: hours,
      m: minutes,
      s: seconds,
    };
    return obj;
  }

  componentDidMount() {
    let timeLeftVar = this.secondsToTime(this.state.seconds);
    this.setState({ time: timeLeftVar });
  }

  airdropReleaseTokens() {
    let stakingB = this.props.stakingBalance;
    if (stakingB >= "50000000000000000000") {
      this.startTimer();
    }
  }

  issueTokens() {
    if (this.state.seconds == 0) {
      // const provider = await detectEthereumProvider();
      // issueRewards();

      // console.log(provider);
      this.props.issueTokens();
      // await loadContract("DecentralBank", provider);
      // console.log(contract);
    }
  }

  render() {
    this.airdropReleaseTokens();
    this.issueTokens();

    return (
      <div style={{ color: "black" }}>
        {this.state.time.m}:{this.state.time.s}
      </div>
    );
  }
}

export default Airdrop;

const Tether = artifacts.require("Tether");
const RWD = artifacts.require("RWD");
const DecentralBank = artifacts.require("DecentralBank");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("DecentralBank", ([owner, customer]) => {
  let tether, rwd, decentralBank;

  function tokens(number) {
    return web3.utils.toWei(number, "ether");
  }

  before(async () => {
    // load contracts
    tether = await Tether.new();
    rwd = await RWD.new();
    decentralBank = await DecentralBank.new(rwd.address, tether.address);

    await rwd.transfer(decentralBank.address, tokens("1000000"));
    await tether.transfer(customer, tokens("100"), { from: owner });
  });

  describe("Mock Tether Deployment", async () => {
    it("matches name successfully", async () => {
      const name = await tether.name();
      assert.equal(name, "Tether");
    });
  });

  describe("RWD Deployment", async () => {
    it("matches name successfully", async () => {
      const name = await rwd.name();
      assert.equal(name, "Reward Token");
    });
  });

  describe("Decentral Bank Deployment", async () => {
    it("matches name successfully", async () => {
      const name = await decentralBank.name();
      assert.equal(name, "Decentral Bank");
    });

    it("contract has tokens", async () => {
      let balance = await rwd.balanceOf(decentralBank.address);
      assert.equal(balance, tokens("1000000"));
    });

    describe("yield farming ", async () => {
      it("reward tokens for staking", async () => {
        let result;

        // check investor balance
        result = await tether.balanceOf(customer);
        assert.equal(
          result.toString(),
          tokens("100"),
          "customer tether balance before staking"
        );

        // check staking for customer
        await tether.approve(decentralBank.address, tokens("100"), {
          from: customer,
        });
        await decentralBank.depositTokens(tokens("100"), { from: customer });

        // check updated balance of customer
        result = await tether.balanceOf(customer);
        assert.equal(
          result.toString(),
          tokens("0"),
          "customer tether balance after staking"
        );

        // check balance of tether in decentral bank
        // result = await decentralBank.stakingBalance(customer);
        result = await tether.balanceOf(decentralBank.address);
        assert.equal(
          result.toString(),
          tokens("100"),
          "decentral bank tether balance after staking"
        );

        // check staking status customer
        result = await decentralBank.hasStaked(customer);
        assert.equal(result, true, "has staked status of customer");

        // check isstaking status customer
        result = await decentralBank.isStaking(customer);
        assert.equal(result, true, "staking status of customer");

        // issue tokens
        await decentralBank.issueTokens({ from: owner });

        // only the owner can issue tokens
        await decentralBank.issueTokens({ from: customer }).should.be.rejected;

        // unstake tokens
        await decentralBank.unstakeTokens({ from: customer });

        // check balance of customer after unstaked
        result = await tether.balanceOf(customer);
        assert.equal(
          result.toString(),
          tokens("100"),
          "customer tether balance after unstaking"
        );

        // check balance of decentral bank after unstaked
        result = await tether.balanceOf(decentralBank.address);
        assert.equal(
          result.toString(),
          tokens("0"),
          "decentral bank tether balance after unstaking"
        );

        // check status of customer after unstaked
        result = await decentralBank.isStaking(customer);
        assert.equal(result, false, "customer status after unstaking");
      });
    });
  });
});

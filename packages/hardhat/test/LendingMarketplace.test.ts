import type { LendingMarketplace, CollateralManager, RepaymentTracker } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  borrower: HardhatEthersSigner;
  lender: HardhatEthersSigner;
};

async function deployFixture() {
  const [deployer, borrower, lender] = await ethers.getSigners();

  const PLACEHOLDER = "0x0000000000000000000000000000000000000001";

  const MarketplaceFactory = await ethers.getContractFactory("LendingMarketplace");
  const marketplace = await MarketplaceFactory.deploy(PLACEHOLDER, PLACEHOLDER) as LendingMarketplace;
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  const CollateralFactory = await ethers.getContractFactory("CollateralManager");
  const collateral = await CollateralFactory.deploy(marketplaceAddress) as CollateralManager;
  await collateral.waitForDeployment();
  const collateralAddress = await collateral.getAddress();

  const RepaymentFactory = await ethers.getContractFactory("RepaymentTracker");
  const repayment = await RepaymentFactory.deploy(marketplaceAddress, collateralAddress) as RepaymentTracker;
  await repayment.waitForDeployment();
  const repaymentAddress = await repayment.getAddress();

  await (await marketplace.updateCollateralManager(collateralAddress)).wait();
  await (await marketplace.updateRepaymentTracker(repaymentAddress)).wait();
  await (await collateral.updateMarketplace(marketplaceAddress)).wait();
  await (await repayment.updateMarketplace(marketplaceAddress)).wait();

  return {
    marketplace,
    collateral,
    repayment,
    marketplaceAddress,
    collateralAddress,
    repaymentAddress,
    deployer,
    borrower,
    lender,
  };
}

describe("LendingMarketplace", function () {
  let signers: Signers;
  let marketplace: LendingMarketplace;
  let collateral: CollateralManager;
  let repayment: RepaymentTracker;
  let marketplaceAddress: string;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      borrower: ethSigners[1],
      lender: ethSigners[2],
    };
  });

  beforeEach(async function () {
    ({ marketplace, collateral, repayment, marketplaceAddress } =
      await deployFixture());
  });

  it("should deploy all three contracts", async function () {
    expect(ethers.isAddress(await marketplace.getAddress())).to.eq(true);
    expect(ethers.isAddress(await collateral.getAddress())).to.eq(true);
    expect(ethers.isAddress(await repayment.getAddress())).to.eq(true);
  });

  it("borrower with no history should get base score", async function () {
    const tx = await marketplace.connect(signers.borrower).computeCreditScore();
    await tx.wait();

    const hasCreditScore = await marketplace
      .connect(signers.borrower)
      .hasCreditScore();
    expect(hasCreditScore).to.eq(true);

    const encryptedScore = await marketplace
      .connect(signers.borrower)
      .getCreditScore();

    const score = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedScore,
      marketplaceAddress,
      signers.borrower
    );

    expect(score).to.eq(500n);
  });

  it("lender can create an offer", async function () {
    const input = fhevm.createEncryptedInput(
      marketplaceAddress,
      signers.lender.address
    );
    input.add64(450n); // minCreditScore
    input.add64(10000n); // maxLoanAmount
    const enc = await input.encrypt();

    const tx = await marketplace
      .connect(signers.lender)
      .createLenderOffer(
        enc.handles[0], enc.inputProof,  
        enc.handles[1], enc.inputProof,
        5000,   
        500,    
        10000,  
        { value: ethers.parseEther("0.1") }
      );
    await tx.wait();

    expect(await marketplace.nextOfferId()).to.eq(1n);
  });
});
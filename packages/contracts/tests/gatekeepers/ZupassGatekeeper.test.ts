import { expect } from "chai";
import { Signer, ZeroAddress } from "ethers";
import { Keypair } from "maci-domainobjs";

import { deployContract } from "../../ts/deploy";
import { getDefaultSigner, getSigners } from "../../ts/utils";
import { MACI, ZupassGatekeeper } from "../../typechain-types";
import { STATE_TREE_DEPTH, initialVoiceCreditBalance } from "../constants";
import { deployTestContracts } from "../utils";

describe("Zupass Gatekeeper", () => {
  let zupassGatekeeper: ZupassGatekeeper;
  let signer: Signer;
  let signerAddress: string;

  const user = new Keypair();

  // Zupass proof created for 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 address (default signer)
  const data =
    "0x1d31414b4ccd818b4fae03a1be1d346f594805f8130ff53b4ff3b995b6d097e6179ea78a39307687593520021abcaf16d295e6827de178614fe10a88f053eedb00a9fad3f1d903c00469dba58434dd42fcb9f1f8de968ae5a8c2d33f4b23000e1dac49110056035d685cd6a06139241e127f9d2ce399db85a0df7ad5c6bf19eb17e96f2ff84444bcf4733d4137b3b22b31117389a240945e1db5437ea021d2461368a7339ab1ff0dac46c871c402d34f97a501721303f76b748f44bf25e492cd01e6fbb34ee1ac3b91d9ed4b170c7ee582bf12bfc463c5a92952421b258044982dcc85ea4601e681433e8246f4958b60fd1a785baf03c7ca5f4b84243564ae93000000000000000000000000000000001bcd6ba8183859918e10a47e8f46420c00000000000000000000000000000000d2ce5bb299a35a61b7e61cd46d2ee00d30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000000225132f1b9a3fc82364402e652b4c4dd140d74e4bd726011248ad8dacbc687ac1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e7500310ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d20430644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000627306090abab3a6e1400e9345bc60c78a8bef57000000000000000000000000627306090abab3a6e1400e9345bc60c78a8bef57";
  // Zupass proof created for another address
  const dataWithInvalidWatermark =
    "0x000b867d17d610de911605a3386d350e86cd5339eac83bbc85fe9c028e08c543156471a4f5ffddea23aca5a70fd890dc09fe797a0e354b73b44fe344c0a2a0672c81710290ca139c7a5d7399016423d37bbe35af644320ecc822e1df6507e58200894e191db1d4f18726043353d7084b7c390ad04c03f6bad3590c9a8b7a9f6d0b60ec311c69cc7f40de5fe862d01518fb7a8bf95320364a86fb653dc79f3fec10eab1df46eda1bc2147b75ee05f3d4a16c97e0d6bc0f7a7c3f5f5281428435014569d5180d2f0f824382deda44cfe18334cba7ded3f0516b09b10274c8a5ced148e8e582e421247fb2e183783e72c20f5d2a19d639550d9a014a894615572b5000000000000000000000000000000001bcd6ba8183859918e10a47e8f46420c00000000000000000000000000000000d2ce5bb299a35a61b7e61cd46d2ee00d30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000005f78379d23c237432399422bd02907a5cebebdc003a46f86a021361ebf095591ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e7500310ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d20430644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f000000030644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cbc8a82e3dfc6faa2506f3033271ebc7447f096b000000000000000000000000cbc8a82e3dfc6faa2506f3033271ebc7447f096b";
  // Zupass event UUID converted to bigint
  const validEventId = "280209352117126055869169359893920931853";
  // Zupass signer converted to bigint
  const zupassSigner = [
    "13908133709081944902758389525983124100292637002438232157513257158004852609027",
    "7654374482676219729919246464135900991450848628968334062174564799457623790084",
  ];

  before(async () => {
    signer = await getDefaultSigner();
    const verifier = await deployContract("ZupassGroth16Verifier", signer, true);
    const verifierAddress = await verifier.getAddress();
    signerAddress = await signer.getAddress();
    zupassGatekeeper = await deployContract(
      "ZupassGatekeeper",
      signer,
      true,
      validEventId,
      zupassSigner[0],
      zupassSigner[1],
      verifierAddress,
    );
  });

  describe("Deployment", () => {
    it("The gatekeeper should be deployed correctly", async () => {
      expect(zupassGatekeeper).to.not.eq(undefined);
      expect(await zupassGatekeeper.getAddress()).to.not.eq(ZeroAddress);
    });
  });

  describe("ZupassGatekeeper", () => {
    let maciContract: MACI;

    before(async () => {
      const r = await deployTestContracts({
        initialVoiceCreditBalance,
        stateTreeDepth: STATE_TREE_DEPTH,
        signer,
        gatekeeper: zupassGatekeeper,
      });

      maciContract = r.maciContract;
    });

    it("sets MACI instance correctly", async () => {
      const maciAddress = await maciContract.getAddress();
      await zupassGatekeeper.setMaciInstance(maciAddress).then((tx) => tx.wait());

      expect(await zupassGatekeeper.maci()).to.eq(maciAddress);
    });

    it("should fail to set MACI instance when the caller is not the owner", async () => {
      const [, secondSigner] = await getSigners();
      await expect(zupassGatekeeper.connect(secondSigner).setMaciInstance(signerAddress)).to.be.revertedWithCustomError(
        zupassGatekeeper,
        "OwnableUnauthorizedAccount",
      );
    });

    it("should fail to set MACI instance when the MACI instance is not valid", async () => {
      await expect(zupassGatekeeper.setMaciInstance(ZeroAddress)).to.be.revertedWithCustomError(
        zupassGatekeeper,
        "ZeroAddress",
      );
    });

    it("should not register a user if the register function is called with invalid watermark", async () => {
      await zupassGatekeeper.setMaciInstance(await maciContract.getAddress()).then((tx) => tx.wait());

      await expect(
        maciContract.signUp(user.pubKey.asContractParam(), dataWithInvalidWatermark),
      ).to.be.revertedWithCustomError(zupassGatekeeper, "InvalidWatermark");
    });

    it("should register a user if the register function is called with the valid data", async () => {
      const tx = await maciContract.signUp(user.pubKey.asContractParam(), data);

      const receipt = await tx.wait();

      expect(receipt?.status).to.eq(1);
    });

    it("should prevent signing up twice", async () => {
      await expect(maciContract.signUp(user.pubKey.asContractParam(), data)).to.be.revertedWithCustomError(
        zupassGatekeeper,
        "AlreadyRegistered",
      );
    });
  });
});

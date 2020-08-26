"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const utils_1 = require("@cosmjs/utils");
const cosmosclient_1 = require("./cosmosclient");
const gas_1 = require("./gas");
const secp256k1wallet_1 = require("./secp256k1wallet");
const signingcosmosclient_1 = require("./signingcosmosclient");
const testutils_spec_1 = require("./testutils.spec");
const httpUrl = "http://localhost:1317";
const faucet = {
    mnemonic: "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone",
    pubkey: {
        type: "tendermint/PubKeySecp256k1",
        value: "A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ",
    },
    address: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
};
describe("SigningCosmosClient", () => {
    describe("makeReadOnly", () => {
        it("can be constructed with default fees", async () => {
            const wallet = await secp256k1wallet_1.Secp256k1Wallet.fromMnemonic(faucet.mnemonic);
            const client = signingcosmosclient_1.SigningCosmosClient.fromOfflineSigner(httpUrl, faucet.address, wallet);
            const openedClient = client;
            expect(openedClient.fees).toEqual({
                send: {
                    amount: [
                        {
                            amount: "2000",
                            denom: "ucosm",
                        },
                    ],
                    gas: "80000",
                },
            });
        });
        it("can be constructed with custom gas price", async () => {
            const wallet = await secp256k1wallet_1.Secp256k1Wallet.fromMnemonic(faucet.mnemonic);
            const gasPrice = gas_1.GasPrice.fromString("3.14utest");
            const client = signingcosmosclient_1.SigningCosmosClient.fromOfflineSigner(httpUrl, faucet.address, wallet, gasPrice);
            const openedClient = client;
            expect(openedClient.fees).toEqual({
                send: {
                    amount: [
                        {
                            amount: "251200",
                            denom: "utest",
                        },
                    ],
                    gas: "80000",
                },
            });
        });
        it("can be constructed with custom gas limits", async () => {
            const wallet = await secp256k1wallet_1.Secp256k1Wallet.fromMnemonic(faucet.mnemonic);
            const gasLimits = {
                send: 160000,
            };
            const client = signingcosmosclient_1.SigningCosmosClient.fromOfflineSigner(httpUrl, faucet.address, wallet, undefined, gasLimits);
            const openedClient = client;
            expect(openedClient.fees).toEqual({
                send: {
                    amount: [
                        {
                            amount: "4000",
                            denom: "ucosm",
                        },
                    ],
                    gas: "160000",
                },
            });
        });
        it("can be constructed with custom gas price and gas limits", async () => {
            const wallet = await secp256k1wallet_1.Secp256k1Wallet.fromMnemonic(faucet.mnemonic);
            const gasPrice = gas_1.GasPrice.fromString("3.14utest");
            const gasLimits = {
                send: 160000,
            };
            const client = signingcosmosclient_1.SigningCosmosClient.fromOfflineSigner(httpUrl, faucet.address, wallet, gasPrice, gasLimits);
            const openedClient = client;
            expect(openedClient.fees).toEqual({
                send: {
                    amount: [
                        {
                            amount: "502400",
                            denom: "utest",
                        },
                    ],
                    gas: "160000",
                },
            });
        });
    });
    describe("getHeight", () => {
        it("always uses authAccount implementation", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const wallet = await secp256k1wallet_1.Secp256k1Wallet.fromMnemonic(faucet.mnemonic);
            const client = signingcosmosclient_1.SigningCosmosClient.fromOfflineSigner(httpUrl, faucet.address, wallet);
            const openedClient = client;
            const blockLatestSpy = spyOn(openedClient.lcdClient, "blocksLatest").and.callThrough();
            const authAccountsSpy = spyOn(openedClient.lcdClient.auth, "account").and.callThrough();
            const height = await client.getHeight();
            expect(height).toBeGreaterThan(0);
            expect(blockLatestSpy).toHaveBeenCalledTimes(0);
            expect(authAccountsSpy).toHaveBeenCalledTimes(1);
        });
    });
    describe("sendTokens", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const wallet = await secp256k1wallet_1.Secp256k1Wallet.fromMnemonic(faucet.mnemonic);
            const client = signingcosmosclient_1.SigningCosmosClient.fromOfflineSigner(httpUrl, faucet.address, wallet);
            // instantiate
            const transferAmount = [
                {
                    amount: "7890",
                    denom: "ucosm",
                },
            ];
            const beneficiaryAddress = testutils_spec_1.makeRandomAddress();
            // no tokens here
            const before = await client.getAccount(beneficiaryAddress);
            expect(before).toBeUndefined();
            // send
            const result = await client.sendTokens(beneficiaryAddress, transferAmount, "for dinner");
            cosmosclient_1.assertIsBroadcastTxSuccess(result);
            const [firstLog] = result.logs;
            expect(firstLog).toBeTruthy();
            // got tokens
            const after = await client.getAccount(beneficiaryAddress);
            utils_1.assert(after);
            expect(after.balance).toEqual(transferAmount);
        });
    });
    // TODO: move this test into InProcessOnlineSigner
    // describe("signAndBroadcast", () => {
    //   it("works", async () => {
    //     pendingWithoutWasmd();
    //     const wallet = await Secp256k1Wallet.fromMnemonic(faucet.mnemonic);
    //     const client = SigningCosmosClient.fromOfflineSigner(httpUrl, faucet.address, wallet);
    //     const msg: MsgDelegate = {
    //       type: "cosmos-sdk/MsgDelegate",
    //       value: {
    //         delegator_address: faucet.address,
    //         validator_address: validatorAddress,
    //         amount: coin(1234, "ustake"),
    //       },
    //     };
    //     const fee = {
    //       amount: coins(2000, "ucosm"),
    //       gas: "180000", // 180k
    //     };
    //     const result = await client.signAndBroadcast([msg], fee, "Use your power wisely");
    //     assertIsBroadcastTxSuccess(result);
    //   });
    // });
});
//# sourceMappingURL=signingcosmosclient.spec.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const utils_1 = require("@cosmjs/utils");
const coins_1 = require("../coins");
const cosmosclient_1 = require("../cosmosclient");
const encoding_1 = require("../encoding");
const secp256k1wallet_1 = require("../secp256k1wallet");
const signingcosmosclient_1 = require("../signingcosmosclient");
const testutils_spec_1 = require("../testutils.spec");
const lcdclient_1 = require("./lcdclient");
const staking_1 = require("./staking");
function makeStakingClient(apiUrl) {
    return lcdclient_1.LcdClient.withExtensions({ apiUrl }, staking_1.setupStakingExtension);
}
describe("StakingExtension", () => {
    const defaultFee = {
        amount: coins_1.coins(25000, "ucosm"),
        gas: "1500000",
    };
    beforeAll(async () => {
        if (testutils_spec_1.wasmdEnabled()) {
            const wallet = await secp256k1wallet_1.Secp256k1Wallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
            const client = signingcosmosclient_1.SigningCosmosClient.fromOfflineSigner(testutils_spec_1.wasmd.endpoint, testutils_spec_1.faucet.address, wallet);
            const chainId = await client.getChainId();
            {
                const msg = {
                    type: "cosmos-sdk/MsgDelegate",
                    value: {
                        delegator_address: testutils_spec_1.faucet.address,
                        validator_address: testutils_spec_1.validatorAddress,
                        amount: coins_1.coin(25000, "ustake"),
                    },
                };
                const memo = "Test delegation for wasmd";
                const { accountNumber, sequence } = await client.getSequence();
                const signBytes = encoding_1.makeSignBytes([msg], defaultFee, chainId, memo, accountNumber, sequence);
                const signature = await wallet.sign(testutils_spec_1.faucet.address, signBytes);
                const tx = {
                    msg: [msg],
                    fee: defaultFee,
                    memo: memo,
                    signatures: [signature],
                };
                const result = await client.broadcastTx(tx);
                cosmosclient_1.assertIsBroadcastTxSuccess(result);
            }
            {
                const msg = {
                    type: "cosmos-sdk/MsgUndelegate",
                    value: {
                        delegator_address: testutils_spec_1.faucet.address,
                        validator_address: testutils_spec_1.validatorAddress,
                        amount: coins_1.coin(100, "ustake"),
                    },
                };
                const memo = "Test undelegation for wasmd";
                const { accountNumber, sequence } = await client.getSequence();
                const signBytes = encoding_1.makeSignBytes([msg], defaultFee, chainId, memo, accountNumber, sequence);
                const signature = await wallet.sign(testutils_spec_1.faucet.address, signBytes);
                const tx = {
                    msg: [msg],
                    fee: defaultFee,
                    memo: memo,
                    signatures: [signature],
                };
                const result = await client.broadcastTx(tx);
                cosmosclient_1.assertIsBroadcastTxSuccess(result);
            }
            await utils_1.sleep(75); // wait until transactions are indexed
        }
    });
    describe("delegatorDelegations", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.delegatorDelegations(testutils_spec_1.faucet.address);
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: [
                    {
                        delegator_address: testutils_spec_1.faucet.address,
                        validator_address: testutils_spec_1.validatorAddress,
                        shares: jasmine.stringMatching(testutils_spec_1.bigDecimalMatcher),
                        balance: { denom: "ustake", amount: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher) },
                    },
                ],
            });
        });
    });
    describe("delegatorUnbondingDelegations", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const { height, result } = await client.staking.delegatorUnbondingDelegations(testutils_spec_1.faucet.address);
            expect(height).toMatch(testutils_spec_1.nonNegativeIntegerMatcher);
            utils_1.assert(result);
            expect(result).toEqual([
                {
                    delegator_address: testutils_spec_1.faucet.address,
                    validator_address: testutils_spec_1.validatorAddress,
                    entries: jasmine.arrayContaining([
                        {
                            creation_height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                            completion_time: jasmine.stringMatching(testutils_spec_1.dateTimeStampMatcher),
                            initial_balance: "100",
                            balance: "100",
                        },
                    ]),
                },
            ]);
        });
    });
    describe("delegatorTransactions", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.delegatorTransactions(testutils_spec_1.faucet.address);
            expect(response.length).toEqual(3);
        });
    });
    describe("delegatorValidators", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.delegatorValidators(testutils_spec_1.faucet.address);
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: [
                    {
                        operator_address: testutils_spec_1.validatorAddress,
                        consensus_pubkey: testutils_spec_1.wasmd.consensusPubkey,
                        jailed: false,
                        status: staking_1.BondStatus.Bonded,
                        tokens: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                        delegator_shares: jasmine.stringMatching(testutils_spec_1.bigDecimalMatcher),
                        description: {
                            moniker: testutils_spec_1.wasmd.moniker,
                            identity: "",
                            website: "",
                            security_contact: "",
                            details: "",
                        },
                        unbonding_height: "0",
                        unbonding_time: "1970-01-01T00:00:00Z",
                        commission: {
                            commission_rates: {
                                rate: "0.100000000000000000",
                                max_rate: "0.200000000000000000",
                                max_change_rate: "0.010000000000000000",
                            },
                            update_time: testutils_spec_1.wasmd.commissionUpdateTime,
                        },
                        min_self_delegation: "1",
                    },
                ],
            });
        });
    });
    describe("delegatorValidator", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.delegatorValidator(testutils_spec_1.faucet.address, testutils_spec_1.validatorAddress);
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: {
                    operator_address: testutils_spec_1.validatorAddress,
                    consensus_pubkey: testutils_spec_1.wasmd.consensusPubkey,
                    jailed: false,
                    status: staking_1.BondStatus.Bonded,
                    tokens: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                    delegator_shares: jasmine.stringMatching(testutils_spec_1.bigDecimalMatcher),
                    description: {
                        moniker: testutils_spec_1.wasmd.moniker,
                        identity: "",
                        website: "",
                        security_contact: "",
                        details: "",
                    },
                    unbonding_height: "0",
                    unbonding_time: "1970-01-01T00:00:00Z",
                    commission: {
                        commission_rates: {
                            rate: "0.100000000000000000",
                            max_rate: "0.200000000000000000",
                            max_change_rate: "0.010000000000000000",
                        },
                        update_time: testutils_spec_1.wasmd.commissionUpdateTime,
                    },
                    min_self_delegation: "1",
                },
            });
        });
    });
    describe("delegation", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.delegation(testutils_spec_1.faucet.address, testutils_spec_1.validatorAddress);
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: {
                    delegator_address: testutils_spec_1.faucet.address,
                    validator_address: testutils_spec_1.validatorAddress,
                    shares: jasmine.stringMatching(testutils_spec_1.bigDecimalMatcher),
                    balance: { denom: "ustake", amount: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher) },
                },
            });
        });
    });
    describe("unbondingDelegation", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const { height, result } = await client.staking.unbondingDelegation(testutils_spec_1.faucet.address, testutils_spec_1.validatorAddress);
            expect(height).toMatch(testutils_spec_1.nonNegativeIntegerMatcher);
            utils_1.assert(result);
            expect(result).toEqual({
                delegator_address: testutils_spec_1.faucet.address,
                validator_address: testutils_spec_1.validatorAddress,
                entries: jasmine.arrayContaining([
                    {
                        creation_height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                        completion_time: jasmine.stringMatching(testutils_spec_1.dateTimeStampMatcher),
                        initial_balance: "100",
                        balance: "100",
                    },
                ]),
            });
        });
    });
    describe("redelegations", () => {
        it("works", async () => {
            // TODO: Set up a result for this test
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.redelegations();
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: [],
            });
        });
    });
    describe("validators", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.validators();
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: [
                    {
                        operator_address: testutils_spec_1.validatorAddress,
                        consensus_pubkey: testutils_spec_1.wasmd.consensusPubkey,
                        jailed: false,
                        status: staking_1.BondStatus.Bonded,
                        tokens: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                        delegator_shares: jasmine.stringMatching(testutils_spec_1.bigDecimalMatcher),
                        description: {
                            moniker: testutils_spec_1.wasmd.moniker,
                            identity: "",
                            website: "",
                            security_contact: "",
                            details: "",
                        },
                        unbonding_height: "0",
                        unbonding_time: "1970-01-01T00:00:00Z",
                        commission: {
                            commission_rates: {
                                rate: "0.100000000000000000",
                                max_rate: "0.200000000000000000",
                                max_change_rate: "0.010000000000000000",
                            },
                            update_time: testutils_spec_1.wasmd.commissionUpdateTime,
                        },
                        min_self_delegation: "1",
                    },
                ],
            });
        });
        it("can filter by status with no results", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.validators({ status: "unbonded" });
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: [],
            });
        });
        it("can filter by status with some results", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.validators({ status: "bonded" });
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: [
                    {
                        operator_address: testutils_spec_1.validatorAddress,
                        consensus_pubkey: testutils_spec_1.wasmd.consensusPubkey,
                        jailed: false,
                        status: staking_1.BondStatus.Bonded,
                        tokens: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                        delegator_shares: jasmine.stringMatching(testutils_spec_1.bigDecimalMatcher),
                        description: {
                            moniker: testutils_spec_1.wasmd.moniker,
                            identity: "",
                            website: "",
                            security_contact: "",
                            details: "",
                        },
                        unbonding_height: "0",
                        unbonding_time: "1970-01-01T00:00:00Z",
                        commission: {
                            commission_rates: {
                                rate: "0.100000000000000000",
                                max_rate: "0.200000000000000000",
                                max_change_rate: "0.010000000000000000",
                            },
                            update_time: testutils_spec_1.wasmd.commissionUpdateTime,
                        },
                        min_self_delegation: "1",
                    },
                ],
            });
        });
    });
    describe("validator", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.validator(testutils_spec_1.validatorAddress);
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: {
                    operator_address: testutils_spec_1.validatorAddress,
                    consensus_pubkey: testutils_spec_1.wasmd.consensusPubkey,
                    jailed: false,
                    status: staking_1.BondStatus.Bonded,
                    tokens: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                    delegator_shares: jasmine.stringMatching(testutils_spec_1.bigDecimalMatcher),
                    description: {
                        moniker: testutils_spec_1.wasmd.moniker,
                        identity: "",
                        website: "",
                        security_contact: "",
                        details: "",
                    },
                    unbonding_height: "0",
                    unbonding_time: "1970-01-01T00:00:00Z",
                    commission: {
                        commission_rates: {
                            rate: "0.100000000000000000",
                            max_rate: "0.200000000000000000",
                            max_change_rate: "0.010000000000000000",
                        },
                        update_time: testutils_spec_1.wasmd.commissionUpdateTime,
                    },
                    min_self_delegation: "1",
                },
            });
        });
    });
    describe("validatorDelegations", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.validatorDelegations(testutils_spec_1.validatorAddress);
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: jasmine.arrayContaining([
                    {
                        delegator_address: testutils_spec_1.faucet.address,
                        validator_address: testutils_spec_1.validatorAddress,
                        shares: jasmine.stringMatching(testutils_spec_1.bigDecimalMatcher),
                        balance: { denom: "ustake", amount: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher) },
                    },
                    {
                        delegator_address: testutils_spec_1.delegatorAddress,
                        validator_address: testutils_spec_1.validatorAddress,
                        shares: "250000000.000000000000000000",
                        balance: { denom: "ustake", amount: "250000000" },
                    },
                ]),
            });
        });
    });
    describe("validatorUnbondingDelegations", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const { height, result } = await client.staking.validatorUnbondingDelegations(testutils_spec_1.validatorAddress);
            expect(height).toMatch(testutils_spec_1.nonNegativeIntegerMatcher);
            utils_1.assert(result);
            expect(result).toEqual([
                {
                    delegator_address: testutils_spec_1.faucet.address,
                    validator_address: testutils_spec_1.validatorAddress,
                    entries: jasmine.arrayContaining([
                        {
                            creation_height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                            completion_time: jasmine.stringMatching(testutils_spec_1.dateTimeStampMatcher),
                            initial_balance: "100",
                            balance: "100",
                        },
                    ]),
                },
            ]);
        });
    });
    describe("historicalInfo", () => {
        it("doesn't work yet", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const currentHeight = (await client.blocksLatest()).block.header.height;
            return expectAsync(client.staking.historicalInfo(currentHeight)).toBeRejectedWithError(/no historical info found \(HTTP 400\)/i);
        });
    });
    describe("pool", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.pool();
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: {
                    not_bonded_tokens: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                    bonded_tokens: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                },
            });
        });
    });
    describe("parameters", () => {
        it("works", async () => {
            testutils_spec_1.pendingWithoutWasmd();
            const client = makeStakingClient(testutils_spec_1.wasmd.endpoint);
            const response = await client.staking.parameters();
            expect(response).toEqual({
                height: jasmine.stringMatching(testutils_spec_1.nonNegativeIntegerMatcher),
                result: {
                    unbonding_time: "1814400000000000",
                    max_validators: 100,
                    max_entries: 7,
                    historical_entries: 0,
                    bond_denom: "ustake",
                },
            });
        });
    });
});
//# sourceMappingURL=staking.spec.js.map
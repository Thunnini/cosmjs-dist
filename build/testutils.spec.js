"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSignedTx = exports.fromOneElementArray = exports.pendingWithoutWasmd = exports.wasmdEnabled = exports.unused = exports.delegatorAddress = exports.validatorAddress = exports.faucet = exports.wasmd = exports.bech32AddressMatcher = exports.hexMatcher = exports.base64Matcher = exports.semverMatcher = exports.dateTimeStampMatcher = exports.tendermintShortHashMatcher = exports.tendermintAddressMatcher = exports.tendermintOptionalIdMatcher = exports.tendermintIdMatcher = exports.bigDecimalMatcher = exports.smallDecimalMatcher = exports.nonNegativeIntegerMatcher = exports.makeRandomAddress = void 0;
const crypto_1 = require("@cosmjs/crypto");
const encoding_1 = require("@cosmjs/encoding");
function makeRandomAddress() {
    return encoding_1.Bech32.encode("cosmos", crypto_1.Random.getBytes(20));
}
exports.makeRandomAddress = makeRandomAddress;
exports.nonNegativeIntegerMatcher = /^[0-9]+$/;
/** Matches decimals < 1.0 */
exports.smallDecimalMatcher = /^0\.[0-9]+$/;
/** Matches decimals >= 1.0 */
exports.bigDecimalMatcher = /^[1-9][0-9]*\.[0-9]+$/;
exports.tendermintIdMatcher = /^[0-9A-F]{64}$/;
exports.tendermintOptionalIdMatcher = /^([0-9A-F]{64}|)$/;
exports.tendermintAddressMatcher = /^[0-9A-F]{40}$/;
exports.tendermintShortHashMatcher = /^[0-9a-f]{40}$/;
exports.dateTimeStampMatcher = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?Z$/;
exports.semverMatcher = /^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
/** @see https://rgxdb.com/r/1NUN74O6 */
exports.base64Matcher = /^(?:[a-zA-Z0-9+/]{4})*(?:|(?:[a-zA-Z0-9+/]{3}=)|(?:[a-zA-Z0-9+/]{2}==)|(?:[a-zA-Z0-9+/]{1}===))$/;
exports.hexMatcher = /^([0-9a-fA-F][0-9a-fA-F])*$/;
// https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#bech32
exports.bech32AddressMatcher = /^[\x21-\x7e]{1,83}1[02-9ac-hj-np-z]{38}$/;
exports.wasmd = {
    endpoint: "http://localhost:1317",
    chainId: "testing",
    moniker: "node001",
    commissionUpdateTime: "2020-07-30T07:56:51.316162Z",
    consensusPubkey: "cosmosvalconspub1zcjduepquk9s489p8l40yvq9er07tfjzkpm4ku4wphhz6567793dsjmdec4suucg87",
};
exports.faucet = {
    mnemonic: "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone",
    pubkey: {
        type: "tendermint/PubKeySecp256k1",
        value: "A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ",
    },
    address: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
};
exports.validatorAddress = "cosmosvaloper1e9zn2ueue2m0edjhmsgsf03yfcmeg7m7xh5xu5";
exports.delegatorAddress = "cosmos1e9zn2ueue2m0edjhmsgsf03yfcmeg7m7rrqns8";
/** Unused account */
exports.unused = {
    pubkey: {
        type: "tendermint/PubKeySecp256k1",
        value: "ArkCaFUJ/IH+vKBmNRCdUVl3mCAhbopk9jjW4Ko4OfRQ",
    },
    address: "cosmos1cjsxept9rkggzxztslae9ndgpdyt2408lk850u",
    accountNumber: 19,
    sequence: 0,
};
function wasmdEnabled() {
    return !!process.env.WASMD_ENABLED;
}
exports.wasmdEnabled = wasmdEnabled;
function pendingWithoutWasmd() {
    if (!wasmdEnabled()) {
        return pending("Set WASMD_ENABLED to enable Wasmd based tests");
    }
}
exports.pendingWithoutWasmd = pendingWithoutWasmd;
/** Returns first element. Throws if array has a different length than 1. */
function fromOneElementArray(elements) {
    if (elements.length !== 1)
        throw new Error(`Expected exactly one element but got ${elements.length}`);
    return elements[0];
}
exports.fromOneElementArray = fromOneElementArray;
function makeSignedTx(firstMsg, fee, memo, firstSignature) {
    return {
        msg: [firstMsg],
        fee: fee,
        memo: memo,
        signatures: [firstSignature],
    };
}
exports.makeSignedTx = makeSignedTx;
//# sourceMappingURL=testutils.spec.js.map
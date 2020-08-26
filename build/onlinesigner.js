"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InProcessOnlineSigner = void 0;
const encoding_1 = require("@cosmjs/encoding");
const math_1 = require("@cosmjs/math");
const encoding_2 = require("./encoding");
const lcdapi_1 = require("./lcdapi");
const logs_1 = require("./logs");
class InProcessOnlineSigner {
    /**
     * This is a default implementation of an OnlineSigner that
     * takes and OfflineSigner and an LcdEndpoint in order to provide all needed functionality
     * for signing.
     *
     * @param signer An OfflineSigner that holds the keys
     * @param apiUrl The URL of a Cosmos SDK light client daemon API (sometimes called REST server or REST API)
     * @param broadcastMode Defines at which point of the transaction processing the broadcastTx method returns
     */
    constructor(signer, apiUrl, broadcastMode = lcdapi_1.BroadcastMode.Block) {
        this.signer = signer;
        this.lcdClient = lcdapi_1.LcdClient.withExtensions({ apiUrl: apiUrl, broadcastMode: broadcastMode }, lcdapi_1.setupAuthExtension);
    }
    async enable() {
        return true;
    }
    async getAccounts() {
        return this.signer.getAccounts();
    }
    async signAndBroadcast(address, request) {
        // never overridden
        const { msgs, chainId } = request;
        const memo = request.memo || "";
        const { accountNumber, sequence } = await this.getSequence(address);
        // set fee if not set (TODO properly)
        const { fee } = request;
        if (fee === undefined) {
            throw new Error("TODO: not implemented: setting fee in OnlineSigner");
        }
        const signBytes = encoding_2.makeSignBytes(msgs, fee, chainId, memo, accountNumber, sequence);
        const signature = await this.signer.sign(address, signBytes);
        const signedTx = {
            msg: msgs,
            fee: fee,
            memo: memo,
            signatures: [signature],
        };
        return this.broadcastTx(signedTx);
    }
    // helper function, maybe public?
    async broadcastTx(tx) {
        const result = await this.lcdClient.broadcastTx(tx);
        if (!result.txhash.match(/^([0-9A-F][0-9A-F])+$/)) {
            throw new Error("Received ill-formatted txhash. Must be non-empty upper-case hex");
        }
        return result.code !== undefined
            ? {
                height: math_1.Uint53.fromString(result.height).toNumber(),
                transactionHash: result.txhash,
                code: result.code,
                rawLog: result.raw_log || "",
            }
            : {
                logs: result.logs ? logs_1.parseLogs(result.logs) : [],
                rawLog: result.raw_log || "",
                transactionHash: result.txhash,
                data: result.data ? encoding_1.fromHex(result.data) : undefined,
            };
    }
    // helper function, maybe public?
    async getSequence(address) {
        const account = await this.lcdClient.auth.account(address);
        const value = account.result.value;
        if (value.address === "") {
            throw new Error("Account does not exist on chain. Send some tokens there before trying to query sequence.");
        }
        return {
            accountNumber: value.account_number,
            sequence: value.sequence,
        };
    }
}
exports.InProcessOnlineSigner = InProcessOnlineSigner;
//# sourceMappingURL=onlinesigner.js.map
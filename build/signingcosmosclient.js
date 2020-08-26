"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigningCosmosClient = void 0;
const cosmosclient_1 = require("./cosmosclient");
const gas_1 = require("./gas");
const lcdapi_1 = require("./lcdapi");
const onlinesigner_1 = require("./onlinesigner");
const defaultGasPrice = gas_1.GasPrice.fromString("0.025ucosm");
const defaultGasLimits = { send: 80000 };
class SigningCosmosClient extends cosmosclient_1.CosmosClient {
    /**
     * Creates a new client with signing capability to interact with a Cosmos SDK blockchain. This is the bigger brother of CosmosClient.
     *
     * This instance does a lot of caching. In order to benefit from that you should try to use one instance
     * for the lifetime of your application. When switching backends, a new instance must be created.
     *
     * @param apiUrl The URL of a Cosmos SDK light client daemon API (sometimes called REST server or REST API)
     * @param senderAddress The address that will sign and send transactions using this instance
     * @param signer An implementation of OfflineSigner which can provide signatures for transactions, potentially requiring user input.
     * @param gasPrice The price paid per unit of gas
     * @param gasLimits Custom overrides for gas limits related to specific transaction types
     * @param broadcastMode Defines at which point of the transaction processing the broadcastTx method returns
     */
    constructor(apiUrl, senderAddress, signer, gasPrice = defaultGasPrice, gasLimits = {}, broadcastMode = lcdapi_1.BroadcastMode.Block) {
        super(apiUrl, broadcastMode);
        this.anyValidAddress = senderAddress;
        this.senderAddress = senderAddress;
        this.signer = signer;
        this.fees = gas_1.buildFeeTable(gasPrice, defaultGasLimits, gasLimits);
    }
    static fromOfflineSigner(apiUrl, senderAddress, signer, gasPrice = defaultGasPrice, gasLimits = {}, broadcastMode = lcdapi_1.BroadcastMode.Block) {
        const online = new onlinesigner_1.InProcessOnlineSigner(signer, apiUrl, broadcastMode);
        return new SigningCosmosClient(apiUrl, senderAddress, online, gasPrice, gasLimits, broadcastMode);
    }
    async getSequence(address) {
        return super.getSequence(address || this.senderAddress);
    }
    async getAccount(address) {
        return super.getAccount(address || this.senderAddress);
    }
    async sendTokens(recipientAddress, transferAmount, memo = "") {
        const sendMsg = {
            type: "cosmos-sdk/MsgSend",
            value: {
                from_address: this.senderAddress,
                to_address: recipientAddress,
                amount: transferAmount,
            },
        };
        return this.signAndBroadcast([sendMsg], this.fees.send, memo);
    }
    async signAndBroadcast(msgs, fee, memo = "") {
        const request = {
            msgs: msgs,
            chainId: await this.getChainId(),
            memo: memo,
            fee: fee,
        };
        return this.signer.signAndBroadcast(this.senderAddress, request);
    }
}
exports.SigningCosmosClient = SigningCosmosClient;
//# sourceMappingURL=signingcosmosclient.js.map
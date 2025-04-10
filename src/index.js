import axios from 'axios';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import crypto from 'crypto';
import { randomInt } from 'crypto';

const BASE_URL = 'https://poe.com';
const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Sec-Ch-Ua": '"Microsoft Edge";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Upgrade-Insecure-Requests": "1",
    "Origin": "https://poe.com",
    "Referer": "https://poe.com/",
};

const QUERIES = {
    "AvailableBotsSelectorModalPaginationQuery": "26214d2e2381b435992200b171b9f39f360cfd5d668c71b071d5575aa6c3c10e",
    "SubscriptionsMutation": "5a7bfc9ce3b4e456cd05a537cfa27096f08417593b8d9b53f57587f3b7b63e99",
    "HandleBotLandingPageQuery": "2ec8856116b8c2cb587e9a05e60df21a751694b2ff06d67dfe0c3d0efaf5f6a2",
    "ChatPageQuery": "e7dcf93e713a35a6b5642496b78339c9ef5ff0ae5e7e0c150ef534a738cced8c",
    "SendMessageMutation": "f1486efc974a214dac6586c46b81bf631a95e58eab1d27b215f622859d74a23e",
    "StopMessage_messageCancel_Mutation": "d2d75098e1878758a5bcd39c89ff6c8c7f5fd633a4f432c234fede8cb743c2e6",
    "DeleteMessageMutation": "8d1879c2e851ba163badb6065561183600fc1b9de99fc8b48b654eb65af92bed",
    "SendChatBreakMutation": "528382d26ae0a33020feddee41e5a02f837b9b09886dc29dc1d638fd7143d212",
    "PoeBotCreate": "39d85c9ecc36bb1f91d219f1ad5520294bd757c1b1df65d00b3167acd214707b",
    "LayoutRightSidebarQuery": "357308110e99687fefcf5f4987bbfdf8427bf9b2fd512e265f6cc8a93ee0c9ae",
    "BotInfoCardActionBar_poeBotDelete_Mutation": "ddda605feb83223640499942fac70c440d6767d48d8ff1a26543f37c9bb89c68",
    "BotInfoCardActionBar_poeRemoveBotFromUserList_Mutation": "5dd4da93f99a2daf629f082b6a4938d940833e8054b5f4f611d9c8c1928b0dc4",
    "ExploreBotsIndexPageQuery": "13ad445fc3a55090f90d5d7bb0708e7fc5170717a77d695d305be0ee8e0c4b5d",
    "MarkMultiplayerNuxCompleted": "c1b1f2ce72d9f8e9cd7bbe1eecbf6e3bed3366df6a18b179b07ddfd9f1f8b3b1",
    "NuxInitialModal_poeSetHandle_Mutation": "93a0c939986bb344f87a76d9d709f147a23f1a45ec26e291bcea9acf66b3215f",
    "BotKnowledgeSourcesModalPaginationQuery": "c02cd4af451d17837143f8572e24b5b9624c2e023bb98bfc1217bde9aedec1ad",
};

const SubscriptionsMutation = {
    "subscriptions":[
        {"subscriptionName":"messageAdded","query":null,"queryHash":"993dcce616ce18788af3cce85e31437abf8fd64b14a3daaf3ae2f0e02d35aa03"},
        {"subscriptionName":"messageCancelled","query":null,"queryHash":"14647e90e5960ec81fa83ae53d270462c3743199fbb6c4f26f40f4c83116d2ff"},
        {"subscriptionName":"messageDeleted","query":null,"queryHash":"91f1ea046d2f3e21dabb3131898ec3c597cb879aa270ad780e8fdd687cde02a3"},
        {"subscriptionName":"messageRead","query":null,"queryHash":"8c80ca00f63ad411ba7de0f1fa064490ed5f438d4a0e60fd9caa080b11af9495"},
        {"subscriptionName":"messageCreated","query":null,"queryHash":"47ee9830e0383f002451144765226c9be750d6c2135e648bced2ca7efc9d8a67"},
        {"subscriptionName":"messageStateUpdated","query":null,"queryHash":"117a49c685b4343e7e50b097b10a13b9555fedd61d3bf4030c450dccbeef5676"},
        {"subscriptionName":"messageAttachmentAdded","query":null,"queryHash":"65798bb2f409d9457fc84698479f3f04186d47558c3d7e75b3223b6799b6788d"},
        {"subscriptionName":"messageFollowupActionAdded","query":null,"queryHash":"d2e770beae7c217c77db4918ed93e848ae77df668603bc84146c161db149a2c7"},
        {"subscriptionName":"messageMetadataUpdated","query":null,"queryHash":"71c247d997d73fb0911089c1a77d5d8b8503289bc3701f9fb93c9b13df95aaa6"},
        {"subscriptionName":"messageTextUpdated","query":null,"queryHash":"800eea48edc9c3a81aece34f5f1ff40dc8daa71dead9aec28f2b55523fe61231"},
        {"subscriptionName":"jobStarted","query":null,"queryHash":"17099b40b42eb9f7e32323aa6badc9283b75a467bc8bc40ff5069c37d91856f6"},
        {"subscriptionName":"jobUpdated","query":null,"queryHash":"e8e492bfaf5041985055d07ad679e46b9a6440ab89424711da8818ae01d1a1f1"},
        {"subscriptionName":"viewerStateUpdated","query":null,"queryHash":"3b2014dba11e57e99faa68b6b6c4956f3e982556f0cf832d728534f4319b92c7"},
        {"subscriptionName":"unreadChatsUpdated","query":null,"queryHash":"5b4853e53ff735ae87413a9de0bce15b3c9ba19102bf03ff6ae63ff1f0f8f1cd"},
        {"subscriptionName":"chatTitleUpdated","query":null,"queryHash":"ee062b1f269ecd02ea4c2a3f1e4b2f222f7574c43634a2da4ebeb616d8647e06"},
        {"subscriptionName":"knowledgeSourceUpdated","query":null,"queryHash":"7de63f89277bcf54f2323008850573809595dcef687f26a78561910cfd4f6c37"},
        {"subscriptionName":"messagePointLimitUpdated","query":null,"queryHash":"ed3857668953d6e8849c1562f3039df16c12ffddaaac1db930b91108775ee16d"},
        {"subscriptionName":"chatMemberAdded","query":null,"queryHash":"21ef45e20cc8120c31a320c3104efe659eadf37d49249802eff7b15d883b917b"},
        {"subscriptionName":"chatSettingsUpdated","query":null,"queryHash":"3b370c05478959224e3dbf9112d1e0490c22e17ffb4befd9276fc62e196b0f5b"},
        {"subscriptionName":"chatModalStateChanged","query":null,"queryHash":"f641bc122ac6a31d466c92f6c724343688c2f679963b7769cb07ec346096bfe7"}]
};

// GraphQL query for subscription
const SUBSCRIPTIONS_MUTATION = {
    query: `
        mutation SubscriptionsMutation {
            subscriptions {
                id
                name
                type
                status
                createdAt
                updatedAt
            }
        }
    `
};

export class PoeApi extends EventEmitter {
    /**
     * Create a new PoeApi instance
     * @param {string} p_b - The p-b token from poe.com
     * @param {string} p_lat - The p-lat token from poe.com
     * @param {string} [proxy] - Optional proxy URL
     */
    constructor(p_b, p_lat, proxy = null) {
        super();
        if (!p_b || !p_lat) {
            throw new Error('Please provide valid p-b and p-lat tokens');
        }

        this.tokens = {
            'p-b': p_b,
            'p-lat': p_lat
        };
        this.formkey = '';
        this.wsConnecting = false;
        this.wsConnected = false;
        this.wsError = false;
        this.activeMessages = new Map();
        this.messageQueues = new Map();
        this.currentThread = {};
        this.retryAttempts = 3;
        this.wsRefresh = 3;
        this.groups = {};
        this.channelUrl = null;
        this.wsDomain = null;
        this.tchannelData = null;

        this.client = axios.create({
            baseURL: BASE_URL,
            headers: {
                ...HEADERS,
                'Cookie': `p-b=${p_b}; p-lat=${p_lat}`
            }
        });

        this.connectWebSocket();
    }

    async initApp(src) {
        const script = await this.loadSrcScript(src);
        const windowSecretPattern = /let useFormkeyDecode=[\s\S]*?(window\.[\w]+="[^"]+")/;
        const match = script.match(windowSecretPattern);
        
        if (!match) {
            throw new Error('Failed to find window secret in js scripts');
        }
        
        return match[1] + ';';
    }

    async extendSrcScripts(manifestSrc) {
        const staticMainUrl = this.getBaseUrl(manifestSrc);
        const manifest = await this.loadSrcScript(manifestSrc);
        
        const staticPattern = /static[^"]*\.js/g;
        const matches = manifest.match(staticPattern) || [];
        const scriptList = matches.map(match => `${staticMainUrl}${match}`);
        
        return scriptList;
    }

    async loadSrcScript(src) {
        try {
            const response = await this.client.get(src);
            if (response.status !== 200) {
                console.warn(`Failed to load script ${src}, status code: ${response.status}`);
            }
            return response.data;
        } catch (error) {
            console.error(`Failed to load script ${src}:`, error.message);
            throw error;
        }
    }

    getBaseUrl(src) {
        return src.split('static/')[0];
    }

    async getChannelSettings() {
        try {
            const response = await this.client.get('/api/settings', {
                headers: HEADERS,
                maxRedirects: 5,
                timeout: 30000
            });
            
            const responseJson = response.data;
            this.wsDomain = `tch${Math.floor(Math.random() * 1e6)}`.slice(0, 11);
            this.tchannelData = responseJson.tchannelData;
            
            // Update client headers with tchannel
            this.client.defaults.headers.common['Poe-Tchannel'] = this.tchannelData.channel;
            
            // Construct channel URL with all required parameters
            this.channelUrl = `ws://${this.wsDomain}.tch.${this.tchannelData.baseHost}/up/${this.tchannelData.boxName}/updates?min_seq=${this.tchannelData.minSeq}&channel=${this.tchannelData.channel}&hash=${this.tchannelData.channelHash}`;
            
            // Subscribe after getting settings
            await this.subscribe();
            
            return responseJson;
        } catch (error) {
            throw new Error(`Failed to get channel settings: ${error.message}`);
        }
    }

    async subscribe() {
        try {
            // const response = await this.client.post('/api/gql_POST', {
            //     query: SUBSCRIPTIONS_MUTATION.query,
            //     operationName: 'SubscriptionsMutation'
            // });

            const response = await this.sendRequest('gql_POST', 'SubscriptionsMutation', SubscriptionsMutation);

            if (!response.data.data && response.data.errors) {
                throw new Error(`Failed to subscribe by sending SubscriptionsMutation. Raw response data: ${JSON.stringify(response.data)}`);
            }
        } catch (error) {
            throw new Error(`Failed to subscribe: ${error.message}`);
        }
    }

    async connectWebSocket(timeout = 20) {
        if (this.wsConnected) return;

        if (this.wsConnecting) {
            while (!this.wsConnected) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            return;
        }

        this.wsConnecting = true;
        this.wsConnected = false;
        this.wsRefresh = 3;

        // Get channel settings with retries
        while (true) {
            this.wsRefresh -= 1;
            if (this.wsRefresh === 0) {
                this.wsRefresh = 3;
                throw new Error("Rate limit exceeded for sending requests to poe.com. Please try again later.");
            }

            try {
                await this.getChannelSettings();
                break;
            } catch (error) {
                console.error(`Failed to get channel settings: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
        }

        // Create WebSocket connection
        this.ws = new WebSocket(this.channelUrl, {
            headers: {
                'Origin': BASE_URL,
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache',
            }
        });

        // Set up event handlers
        this.ws.on('open', () => this.onWsConnect());
        this.ws.on('close', (code, reason) => this.onWsClose(code, reason));
        this.ws.on('error', (error) => this.onWsError(error));
        this.ws.on('message', (data) => this.onMessage(data));

        // Wait for connection with timeout
        let timer = 0;
        while (!this.wsConnected) {
            await new Promise(resolve => setTimeout(resolve, 10));
            timer += 0.01;
            if (timer > timeout) {
                this.wsConnecting = false;
                this.wsConnected = false;
                this.wsError = true;
                this.ws.close();
                throw new Error("Timed out waiting for websocket to connect.");
            }
        }
    }

    onWsConnect() {
        this.wsConnecting = false;
        this.wsConnected = true;
        this.emit('connected');
    }

    onWsClose(code, reason) {
        this.wsConnecting = false;
        this.wsConnected = false;
        if (this.wsError) {
            console.warn("Connection to remote host was lost. Reconnecting...");
            this.wsError = false;
            this.connectWebSocket();
        }
        this.emit('disconnected', { code, reason });
    }

    onWsError(error) {
        this.wsConnecting = false;
        this.wsConnected = false;
        this.wsError = true;
        this.emit('error', error);
    }

    onMessage(data) {
        try {
            const wsData = JSON.parse(data);

            if (wsData.error === "missed_messages") {
                this.connectWebSocket();
                return;
            }

            if (!wsData.messages) {
                return;
            }

            for (const message of wsData.messages) {
                const data = JSON.parse(message);
                const messageType = data.message_type;

                if (messageType === "refetchChannel") {
                    this.connectWebSocket();
                    return;
                }

                const payload = data.payload || {};
                this.emit('message', payload);
            }
        } catch (error) {
            this.emit('error', error);
        }
    }

    disconnectWebSocket() {
        this.wsConnecting = false;
        this.wsConnected = false;
        if (this.ws) {
            this.ws.close();
            console.log("Websocket connection closed.");
        }
    }

    async getSettings() {
        try {
            const response = await this.client.get('/api/settings');
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get settings: ${error.message}`);
        }
    }

    async getAvailableBots(count = 25, getAll = false) {
        this.bots = {};
        if (!(getAll || count)) {
            throw new TypeError("Please provide at least one of the following parameters: getAll=<bool>, count=<int>");
        }

        let response = await this.sendRequest('gql_POST', 'AvailableBotsSelectorModalPaginationQuery', {});
        
        let bots = response.data.viewer.availableBotsConnection.edges
            .filter(edge => edge.node.deletionState === 'not_deleted')
            .map(edge => edge.node);
            
        let cursor = response.data.viewer.availableBotsConnection.pageInfo.endCursor;
        
        if (bots.length >= count && !getAll) {
            this.bots = Object.fromEntries(bots.map(bot => [bot.handle, { bot }]));
            return this.bots;
        }

        while (bots.length < count || getAll) {
            response = await this.sendRequest('gql_POST', 'AvailableBotsSelectorModalPaginationQuery', { cursor });
            
            const newBots = response.data.viewer.availableBotsConnection.edges
                .filter(edge => edge.node.deletionState === 'not_deleted')
                .map(edge => edge.node);
                
            cursor = response.data.viewer.availableBotsConnection.pageInfo.endCursor;
            bots = bots.concat(newBots);

            if (newBots.length === 0) {
                if (!getAll) {
                    console.warn(`Only ${bots.length} bots found on this account`);
                } else {
                    console.info(`Total ${bots.length} bots found on this account`);
                }
                this.bots = Object.fromEntries(bots.map(bot => [bot.handle, { bot }]));
                return this.bots;
            }
        }

        console.info("Succeed to get available bots");
        this.bots = Object.fromEntries(bots.map(bot => [bot.handle, { bot }]));
        return this.bots;
    }

    async sendMessage(bot, message, chatId = null, chatCode = null, timeout = 5) {
        try {
            const response = await this.client.post('/api/send_message', {
                bot,
                message,
                chatId,
                chatCode,
                timeout
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    async getChatHistory(bot = null, count = null, interval = 50, cursor = null) {
        try {
            const response = await this.client.get('/api/chat_history', {
                params: {
                    bot,
                    count,
                    interval,
                    cursor
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get chat history: ${error.message}`);
        }
    }

    async purgeConversation(bot, chatId = null, chatCode = null, count = 50, delAll = false) {
        try {
            const response = await this.client.post('/api/purge_conversation', {
                bot,
                chatId,
                chatCode,
                count,
                delAll
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to purge conversation: ${error.message}`);
        }
    }

    async sendRequest(path, queryName = "", variables = {}, fileForm = [], knowledge = false, rateLimit = 0) {
        if (rateLimit > 0) {
            console.warn(`Waiting queue ${rateLimit}/2 to avoid rate limit`);
            await new Promise(resolve => setTimeout(resolve, randomInt(2000, 3000)));
        }
        let statusCode = 0;

        try {
            const payload = this.generatePayload(queryName, variables);
            const baseString = payload + this.formkey + "4LxgHM6KpFqokX0Ox";
            let headers = { 'Content-Type': 'application/json' };

            if (fileForm.length > 0) {
                const fields = { queryInfo: payload };
                if (!knowledge) {
                    for (let i = 0; i < fileForm.length; i++) {
                        fields[`file${i}`] = fileForm[i];
                    }
                } else {
                    fields.file = fileForm[0];
                }
                const formData = new FormData();
                for (const [key, value] of Object.entries(fields)) {
                    formData.append(key, value);
                }
                payload = formData;
                headers = { 'Content-Type': 'multipart/form-data' };
            }

            headers['poe-tag-id'] = crypto.createHash('md5').update(baseString).digest('hex');

            const response = await this.client.post(`${BASE_URL}/api/${path}`, payload, { headers : headers });
            statusCode = response.status;

            if (statusCode === 403 && rateLimit < 2) {
                console.warn(`Received 403 status code, retrying... (attempt ${rateLimit + 1}/2)`);
                return this.sendRequest(path, queryName, variables, fileForm, knowledge, rateLimit + 1);
            }

            if (!response.data) {
                throw new Error(`Empty response with status code ${statusCode}`);
            }

            const jsonData = response.data;

            if (
                ('success' in jsonData && !jsonData.success) ||
                (jsonData && jsonData.data === null)
            ) {
                const errMsg = jsonData.errors[0].message;
                if (errMsg === 'Server Error') {
                    throw new Error(`Server Error. Raw response data: ${JSON.stringify(jsonData)}`);
                } else {
                    console.error(statusCode);
                    console.error(JSON.stringify(jsonData));
                    throw new Error(JSON.stringify(jsonData));
                }
            }

            if (statusCode === 200) {
                for (const file of fileForm) {
                    try {
                        if (file[1] && typeof file[1].close === 'function' && !file[1].closed) {
                            file[1].close();
                        }
                    } catch (e) {
                        console.warn(`Failed to close file: ${file[0]}. Reason: ${e.message}`);
                    }
                }
                return jsonData;
            }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                if (queryName === 'SendMessageMutation') {
                    console.error(`Failed to send message ${variables.query} due to timeout`);
                    throw error;
                } else {
                    console.error(`Automatic retrying request ${queryName} due to timeout`);
                    return this.sendRequest(path, queryName, variables, fileForm);
                }
            }

            if (
                (error.code === 'ECONNREFUSED' || (500 <= statusCode && statusCode < 600)) &&
                rateLimit < 2
            ) {
                return this.sendRequest(path, queryName, variables, fileForm, knowledge, rateLimit + 1);
            }

            const errorCode = statusCode ? `status_code:${statusCode}, ` : '';
            throw new Error(
                `Sending request ${queryName} failed. ${errorCode} Error log: ${error.message}`
            );
        }
    }

    generatePayload(queryName, variables) {
        if (queryName === 'recv') {
            return this.generateRecvPayload(variables);
        }
        const payload = {
            queryName,
            variables,
            extensions: {
                hash: QUERIES[queryName]
            }
        };
        return JSON.stringify(payload);
    }

    generateRecvPayload(variables) {
        const payload = [
            {
                category: 'poe/bot_response_speed',
                data: variables
            }
        ];

        if (Math.random() > 0.9) {
            payload.push({
                category: 'poe/statsd_event',
                data: {
                    key: 'poe.speed.web_vitals.INP',
                    value: randomInt(100, 125),
                    category: 'time',
                    path: '/[handle]',
                    extra_data: {}
                }
            });
        }
        return JSON.stringify(payload);
    }
} 
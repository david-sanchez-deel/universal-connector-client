"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UniversalClientAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const botbuilder_1 = require("botbuilder");
const ngrok = require("ngrok");
const readline = require("readline");
let UniversalClientAdapter = UniversalClientAdapter_1 = class UniversalClientAdapter extends botbuilder_1.BotAdapter {
    constructor(httpService) {
        super();
        this.httpService = httpService;
        this.conversations = {};
        this.logger = new common_1.Logger(UniversalClientAdapter_1.name);
        this.reference = {
            bot: { id: 'bot', name: 'Bot' },
            channelId: 'universe',
            conversation: { id: new Date().getTime(), name: '', isGroup: false, conversationType: '0', tenantId: '0' },
            serviceUrl: '',
            user: { id: new Date().getTime(), name: 'User1' },
        };
        this.nextId = 0;
    }
    async register(username, port, turnContext) {
        this.turnContext = turnContext;
        UniversalClientAdapter_1.username = username;
        UniversalClientAdapter_1.url = await ngrok.connect(port);
        this.logger.log(`DMZ Url created: ${UniversalClientAdapter_1.url}`);
        this.logger.debug('Attempting to connect to master');
        await this.httpService.post('https://nodeconf-chatbot.herokuapp.com/api/v1/bot/register', { username, url: UniversalClientAdapter_1.url }).toPromise();
        return true;
    }
    async respondToRequest({ from, text }) {
        const activity = botbuilder_1.TurnContext.applyConversationReference({
            id: (this.nextId++).toString(),
            text,
            timestamp: new Date(),
            type: botbuilder_1.ActivityTypes.Message,
        }, { ...this.reference, conversation: { id: from, name: '', isGroup: false, conversationType: '0', tenantId: '0' } }, true);
        // Create context and run middleware pipe
        const context = new botbuilder_1.TurnContext(this, activity);
        this.conversations[from] = [];
        await this.runMiddleware(context, this.turnContext).catch((err) => { this.printError(err.toString()); });
        return this.conversations[from];
    }
    listen(logic) {
        const rl = this.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
        rl.on('line', async (line) => {
            const regexp = /dile a (.*): (.*)/g;
            const regexpResult = regexp.exec(line);
            if (regexpResult && regexpResult.length > 2) {
                this.logger.debug(`Send message to ${regexpResult[1]}: ${regexpResult[2]}`);
                const result = await this.httpService.post('https://nodeconf-chatbot.herokuapp.com/api/v1/bot/messages/universal-connector', { username: UniversalClientAdapter_1.username, to: regexpResult[1], text: regexpResult[2] }).toPromise();
                result.data.forEach((data) => this.print(data.text));
            }
            else {
                const activity = botbuilder_1.TurnContext.applyConversationReference({
                    id: (this.nextId++).toString(),
                    text: line,
                    timestamp: new Date(),
                    type: botbuilder_1.ActivityTypes.Message,
                }, this.reference, true);
                // Create context and run middleware pipe
                const context = new botbuilder_1.TurnContext(this, activity);
                this.runMiddleware(context, logic).catch((err) => { this.printError(err.toString()); });
            }
        });
        return () => {
            rl.close();
        };
    }
    continueConversation(reference, logic) {
        // Create context and run middleware pipe
        const activity = botbuilder_1.TurnContext.applyConversationReference({}, reference, true);
        const context = new botbuilder_1.TurnContext(this, activity);
        return this.runMiddleware(context, logic)
            .catch((err) => { this.printError(err.toString()); });
    }
    async sendActivities(context, activities) {
        const conversation = this.conversations[context.activity.conversation.id];
        if (conversation) {
            this.conversations[context.activity.conversation.id] = activities.map((activity) => ({ text: activity.text }));
        }
        else {
            activities.forEach((activity) => this.print(activity.text));
        }
        return activities.map((_) => ({}));
    }
    /**
     * Not supported for the ConsoleAdapter.  Calling this method or `TurnContext.updateActivity()`
     * will result an error being returned.
     */
    updateActivity() {
        return Promise.reject(new Error(`ConsoleAdapter.updateActivity(): not supported.`));
    }
    /**
     * Not supported for the ConsoleAdapter.  Calling this method or `TurnContext.deleteActivity()`
     * will result an error being returned.
     */
    deleteActivity() {
        return Promise.reject(new Error(`ConsoleAdapter.deleteActivity(): not supported.`));
    }
    /**
     * Allows for mocking of the console interface in unit tests.
     * @param options Console interface options.
     */
    createInterface(options) {
        return readline.createInterface(options);
    }
    /**
     * Logs text to the console.
     * @param line Text to print.
     */
    print(line) {
        // tslint:disable-next-line:no-console
        console.log(line);
    }
    /**
     * Logs an error to the console.
     * @param line Error text to print.
     */
    printError(line) {
        // tslint:disable-next-line:no-console
        console.error(line);
    }
};
UniversalClientAdapter = UniversalClientAdapter_1 = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [common_1.HttpService])
], UniversalClientAdapter);
exports.UniversalClientAdapter = UniversalClientAdapter;
//# sourceMappingURL=universal-client.adapter.js.map
import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ActivityTypes, BotAdapter, TurnContext } from 'botbuilder';
import * as ngrok from 'ngrok';
import * as readline from 'readline';

@Injectable()
export class UniversalClientAdapter extends BotAdapter {
  private static url;
  private nextId;
  private reference;
  private static username;
  private conversations = {};
  private turnContext;
  private logger = new Logger(UniversalClientAdapter.name);
  constructor(
    private readonly httpService: HttpService,
  ) {
    super();
    this.reference = {
      bot: { id: 'bot', name: 'Bot' },
      channelId: 'universe',
      conversation: { id: new Date().getTime(), name: '', isGroup: false, conversationType: '0', tenantId: '0' },
      serviceUrl: '',
      user: { id: new Date().getTime(), name: 'User1' },
    };
    this.nextId = 0;
  }

  public async register(username, port, turnContext) {
    this.turnContext = turnContext;
    UniversalClientAdapter.username = username;
    UniversalClientAdapter.url = await ngrok.connect(port);
    this.logger.log(`DMZ Url created: ${UniversalClientAdapter.url}`);
    this.logger.debug('Attempting to connect to master');
    await this.httpService.post('https://nodeconf-chatbot.herokuapp.com/api/v1/bot/register', { username, url: UniversalClientAdapter.url }).toPromise();
    return true;
  }

  public async respondToRequest({ from, text }) {
    const activity = TurnContext.applyConversationReference({
      id: (this.nextId++).toString(),
      text,
      timestamp: new Date(),
      type: ActivityTypes.Message,
    }, { ...this.reference, conversation: { id: from, name: '', isGroup: false, conversationType: '0', tenantId: '0' } }, true);
    // Create context and run middleware pipe
    const context = new TurnContext(this, activity);
    this.conversations[from] = [];
    await this.runMiddleware(context, this.turnContext).catch((err) => { this.printError(err.toString()); });
    return this.conversations[from];
  }

  public listen(logic) {
    const rl = this.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
    rl.on('line', async (line) => {
      const regexp = /dile a (.*): (.*)/g;
      const regexpResult = regexp.exec(line);
      if (regexpResult && regexpResult.length > 2) {
        this.logger.debug(`Send message to ${regexpResult[1]}: ${regexpResult[2]}`);
        const result = await this.httpService.post(
          'https://nodeconf-chatbot.herokuapp.com/api/v1/bot/messages/universal-connector',
          { username: UniversalClientAdapter.username, to: regexpResult[1], text: regexpResult[2] }).toPromise();
        result.data.forEach((data) => this.print(data.text));
      } else {
        const activity = TurnContext.applyConversationReference({
          id: (this.nextId++).toString(),
          text: line,
          timestamp: new Date(),
          type: ActivityTypes.Message,
        }, this.reference, true);
        // Create context and run middleware pipe
        const context = new TurnContext(this, activity);
        this.runMiddleware(context, logic).catch((err) => { this.printError(err.toString()); });
      }
    });
    return () => {
      rl.close();
    };
  }

  public continueConversation(reference, logic) {
    // Create context and run middleware pipe
    const activity = TurnContext.applyConversationReference({}, reference, true);
    const context = new TurnContext(this, activity);
    return this.runMiddleware(context, logic)
      .catch((err) => { this.printError(err.toString()); });
  }

  public async sendActivities(context: TurnContext, activities) {
    const conversation = this.conversations[context.activity.conversation.id];
    if (conversation) {
      this.conversations[context.activity.conversation.id] = activities.map((activity) => ({ text: activity.text }));
    } else {
      activities.forEach((activity) => this.print(activity.text));
    }
    return activities.map((_) => ({}));
  }

  /**
   * Not supported for the ConsoleAdapter.  Calling this method or `TurnContext.updateActivity()`
   * will result an error being returned.
   */
  public updateActivity() {
    return Promise.reject(new Error(`ConsoleAdapter.updateActivity(): not supported.`));
  }
  /**
   * Not supported for the ConsoleAdapter.  Calling this method or `TurnContext.deleteActivity()`
   * will result an error being returned.
   */
  public deleteActivity() {
    return Promise.reject(new Error(`ConsoleAdapter.deleteActivity(): not supported.`));
  }
  /**
   * Allows for mocking of the console interface in unit tests.
   * @param options Console interface options.
   */
  public createInterface(options) {
    return readline.createInterface(options);
  }
  /**
   * Logs text to the console.
   * @param line Text to print.
   */
  public print(line) {
    // tslint:disable-next-line:no-console
    console.log(line);
  }
  /**
   * Logs an error to the console.
   * @param line Error text to print.
   */
  public printError(line) {
    // tslint:disable-next-line:no-console
    console.error(line);
  }
}

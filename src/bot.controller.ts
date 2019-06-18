import { Body, Controller, Logger, Post } from '@nestjs/common';
import { UniversalClientAdapter } from './universal-client.adapter';

@Controller('api/v1/bot')
export class BotController {
  private logger = new Logger(BotController.name);

  constructor(
    private universalClientAdapter: UniversalClientAdapter,
  ) {}

  @Post('receive-message')
  public async receiveMessage(@Body() body) {
    this.logger.debug(`Message received from ${body.from}`);
    const result = await this.universalClientAdapter.respondToRequest(body);
    this.logger.debug('Send Result');
    return result;
  }
}

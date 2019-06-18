import { HttpModule, Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { UniversalClientAdapter } from './universal-client.adapter';

@Module({
  controllers: [BotController],
  exports: [UniversalClientAdapter],
  imports: [
    HttpModule,
  ],
  providers: [
    UniversalClientAdapter,
  ],
})
export class UniversalConnectorModule { }

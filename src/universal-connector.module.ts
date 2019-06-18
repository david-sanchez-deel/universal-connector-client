import { HttpModule, Module, DynamicModule } from '@nestjs/common';
import { BotController } from './bot.controller';
import { UniversalClientAdapter } from './universal-client.adapter';

@Module({
  imports: [
    HttpModule,
  ],
})
export class UniversalConnectorModule {
  static forRoot(entities = [], options?): DynamicModule {

    const providers = [
      UniversalClientAdapter,
    ];
    return {
      module: UniversalConnectorModule,
      controllers: [BotController],
      providers: providers,
      exports: providers,
    };
  }
}

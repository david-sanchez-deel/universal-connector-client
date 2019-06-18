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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BotController_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const universal_client_adapter_1 = require("./universal-client.adapter");
let BotController = BotController_1 = class BotController {
    constructor(universalClientAdapter) {
        this.universalClientAdapter = universalClientAdapter;
        this.logger = new common_1.Logger(BotController_1.name);
    }
    async receiveMessage(body) {
        this.logger.debug(`Message received from ${body.from}`);
        const result = await this.universalClientAdapter.respondToRequest(body);
        this.logger.debug('Send Result');
        return result;
    }
};
__decorate([
    common_1.Post('receive-message'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotController.prototype, "receiveMessage", null);
BotController = BotController_1 = __decorate([
    common_1.Controller('api/v1/bot'),
    __metadata("design:paramtypes", [universal_client_adapter_1.UniversalClientAdapter])
], BotController);
exports.BotController = BotController;
//# sourceMappingURL=bot.controller.js.map
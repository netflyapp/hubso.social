"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('Main');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Security
    app.use((0, helmet_1.default)());
    // CORS
    app.enableCors({
        origin: process.env.WEB_URL || 'http://localhost:3000',
        credentials: true,
    });
    // Swagger/OpenAPI
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Hubso.social API')
        .setDescription('Modularna platforma społecznościowa white-label')
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
    })
        .addServer('http://localhost:3001', 'Development')
        .addServer('https://api.hubso.social', 'Production')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.API_PORT || 3001;
    await app.listen(port);
    logger.log(`🚀 Application running on http://localhost:${port}`);
    logger.log(`📚 Swagger documentation on http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
    logger.error('Failed to start application', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
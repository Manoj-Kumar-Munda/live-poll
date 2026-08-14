import swaggerUi from "swagger-ui-express";

import { openApiDocument } from "./openapi/index.js";

export const swaggerDocument = openApiDocument;
export const swaggerMiddleware = swaggerUi.serve;
export const swaggerHandler = swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "LivePoll API documentation",
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
  },
});

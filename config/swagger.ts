// for AdonisJS v6
import path from "node:path";
import url from "node:url";
// ---

export default {
    path: path.dirname(url.fileURLToPath(import.meta.url)) + "/../",
    tagIndex: 2,
    info: {
        title: "Drawaday API",
        version: "1.0.0",
        description: "",
    },
    snakeCase: true,

    debug: true,
    ignore: ["/swagger", "/docs"],
    preferredPutPatch: "PUT",
    common: {
        parameters: {},
        headers: {},
    },
    securitySchemes: {},
    authMiddlewares: ["auth", "auth:api"],
    defaultSecurityScheme: "BearerAuth",
    persistAuthorization: true,
    showFullPath: false,
};
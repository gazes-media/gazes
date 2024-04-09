import config from "./config";
import { createRouter } from "./routes";
import { createServer } from "./server";

const app = createRouter();
const server = createServer(app, config);

server.on('listening', () => {
    console.log(`Server listening on port ${config.PORT}`)
})

server.on('close', () => {
    console.log('Server closed')
})
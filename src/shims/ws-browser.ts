/**
 * Vite client alias target for Node's `ws`.
 * `@colyseus/sdk` does `import NodeWebSocket from 'ws'` then
 * `globalThis.WebSocket || NodeWebSocket`. In the browser the real
 * `ws` package resolves to a CJS stub with no ESM default export.
 */
const BrowserWebSocket = globalThis.WebSocket;

export default BrowserWebSocket;
export { BrowserWebSocket as WebSocket };

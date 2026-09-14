import { type IncomingMessage, type ServerResponse } from "node:http";
export type Handler = (req: IncomingMessage, res: ServerResponse, url: URL, body: Buffer) => void | Promise<void>;
export declare function send(res: ServerResponse, status: number, body: string | Buffer, type?: string): void;
export declare const html: (res: ServerResponse, s: string) => void;
export declare const json: (res: ServerResponse, v: unknown, status?: number) => void;
export declare const notFound: (res: ServerResponse) => void;
export declare function readBody(req: IncomingMessage): Promise<Buffer>;
export declare function page(title: string, body: string, extraHead?: string): string;
export declare function serve(port: number, name: string, handler: Handler): import("http").Server<typeof IncomingMessage, typeof ServerResponse>;
export declare function parseForm(body: Buffer, contentType: string | undefined): Record<string, string>;
//# sourceMappingURL=http.d.ts.map
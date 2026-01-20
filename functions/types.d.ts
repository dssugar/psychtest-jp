/// <reference types="@cloudflare/workers-types" />

// Type definitions for Cloudflare Pages Functions
declare global {
  interface EventContext<Env, P extends string, Data> {
    request: Request;
    functionPath: string;
    waitUntil: (promise: Promise<unknown>) => void;
    passThroughOnException: () => void;
    next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
    env: Env & {
      ASSETS: {
        fetch: typeof fetch;
      };
    };
    params: P extends `${infer _Start}:${infer Param}/${infer Rest}`
      ? { [K in Param | keyof PathParams<Rest>]: string }
      : P extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string }
      : { [key: string]: string };
    data: Data;
  }

  type PathParams<P extends string> = P extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof PathParams<Rest>]: string }
    : P extends `${infer _Start}:${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;

  type PagesFunction<
    Env = unknown,
    Params extends string = string,
    Data extends Record<string, unknown> = Record<string, unknown>
  > = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;
}

export {};

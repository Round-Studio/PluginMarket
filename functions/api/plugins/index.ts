export interface PluginIndexItem {
  username: string;
  pluginName: string;
  path: string;
  repositoryUrl: string;
  repositoryOwner: string;
  repositoryName: string;
}

type PagesContext = {
  request: Request;
};

type CloudflareRequestInit = RequestInit & {
  cf?: {
    cacheTtl?: number;
    cacheEverything?: boolean;
  };
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=60",
};

export async function onRequestGet(context: PagesContext): Promise<Response> {
  const url = new URL(context.request.url);
  const index = await readJson<{ plugins: PluginIndexItem[] }>(`${url.origin}/plugin/index.json`);

  return Response.json(index, { headers: JSON_HEADERS });
}

async function readJson<T>(url: string): Promise<T> {
  const init: CloudflareRequestInit = {
    cf: {
      cacheTtl: 60,
      cacheEverything: true,
    },
  };
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Failed to read JSON: ${url}`);
  }

  return (await response.json()) as T;
}

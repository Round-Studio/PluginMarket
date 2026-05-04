export interface PluginInfo {
  repositoryUrl: string;
  repositoryOwner: string;
  repositoryName: string;
  pluginName: string;
  icon: string;
}

type PagesContext = {
  request: Request;
  params: {
    username?: string | string[];
    pluginName?: string | string[];
  };
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
  const username = context.params.username;
  const pluginName = context.params.pluginName;

  if (typeof username !== "string" || typeof pluginName !== "string") {
    return Response.json({ error: "Invalid plugin path" }, { status: 400, headers: JSON_HEADERS });
  }

  const url = new URL(context.request.url);
  const pluginUrl = `${url.origin}/plugin/${encodeURIComponent(username)}/${encodeURIComponent(pluginName)}/plugin.json`;
  const init: CloudflareRequestInit = {
    cf: {
      cacheTtl: 60,
      cacheEverything: true,
    },
  };
  const response = await fetch(pluginUrl, init);

  if (response.status === 404) {
    return Response.json({ error: "Plugin not found" }, { status: 404, headers: JSON_HEADERS });
  }

  if (!response.ok) {
    return Response.json({ error: "Failed to read plugin" }, { status: 502, headers: JSON_HEADERS });
  }

  const plugin = (await response.json()) as PluginInfo;
  const iconUrl = `/plugin/${encodeURIComponent(username)}/${encodeURIComponent(pluginName)}/${encodeURIComponent(plugin.icon)}`;
  return Response.json({ username, ...plugin, pluginName, iconUrl }, { headers: JSON_HEADERS });
}

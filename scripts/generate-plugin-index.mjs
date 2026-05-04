import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pluginRoot = join(root, "public", "plugin");
const indexPath = join(pluginRoot, "index.json");

async function pathExists(path) {
  try {
    await readdir(path);
    return true;
  } catch {
    return false;
  }
}

async function readPluginInfo(pluginJsonPath) {
  const raw = await readFile(pluginJsonPath, "utf8");
  const info = JSON.parse(raw);

  for (const key of ["repositoryUrl", "repositoryOwner", "repositoryName"]) {
    if (typeof info[key] !== "string" || info[key].length === 0) {
      throw new Error(`${pluginJsonPath} 缺少有效字段: ${key}`);
    }
  }

  return info;
}

async function generateIndex() {
  if (!(await pathExists(pluginRoot))) {
    await writeFile(indexPath, JSON.stringify({ plugins: [] }, null, 2) + "\n");
    return;
  }

  const plugins = [];
  const users = await readdir(pluginRoot, { withFileTypes: true });

  for (const user of users) {
    if (!user.isDirectory()) {
      continue;
    }

    const username = user.name;
    const userPath = join(pluginRoot, username);
    const pluginDirs = await readdir(userPath, { withFileTypes: true });

    for (const pluginDir of pluginDirs) {
      if (!pluginDir.isDirectory()) {
        continue;
      }

      const pluginJsonPath = join(userPath, pluginDir.name, "plugin.json");
      const info = await readPluginInfo(pluginJsonPath);
      const path = `/${relative(join(root, "public"), pluginJsonPath).split(sep).join("/")}`;

      plugins.push({
        username,
        path,
        ...info,
      });
    }
  }

  plugins.sort((a, b) => `${a.username}/${a.pluginName}`.localeCompare(`${b.username}/${b.pluginName}`));
  await writeFile(indexPath, JSON.stringify({ plugins }, null, 2) + "\n");
  console.log(`Generated ${indexPath} (${plugins.length} plugins)`);
}

generateIndex().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

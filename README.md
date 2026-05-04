# PluginMarket

一个可以直接部署到 Cloudflare Pages 的插件市场后端示例。

## 数据目录

插件信息放在 `public/plugin` 下，目录结构为：

```text
public/plugin/{用户名}/{插件名}/plugin.json
```

每个 `plugin.json` 包含：

- `repositoryUrl`：插件仓库地址
- `repositoryOwner`：仓库主
- `repositoryName`：仓库名

由于 Cloudflare Pages Functions 运行时不能直接枚举静态资源目录，项目会在开发/部署前自动扫描 `public/plugin` 并生成 `public/plugin/index.json`。

也可以手动生成索引：

```bash
npm run generate:index
```

## API

- `GET /api/plugins`：返回全部插件
- `GET /api/plugins/:username/:pluginName`：返回指定插件

## 本地运行

安装依赖后运行开发服务：

```bash
npm install
npm run dev
```

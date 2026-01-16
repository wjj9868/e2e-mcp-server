# 快速开始

## 方式一：直接使用（推荐）

无需手动克隆，npx 直接从 GitHub 运行：

```json
{
  "mcpServers": {
    "e2e-test": {
      "command": "npx",
      "args": ["-y", "github:wjj9868/e2e-mcp-server"]
    }
  }
}
```

## 方式二：克隆仓库

```bash
git clone https://github.com/wjj9868/e2e-mcp-server.git
cd e2e-mcp-server
npm install
npm run build
```

## 配置 MCP 客户端

### Claude Desktop

编辑配置文件：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Kiro

编辑 `.kiro/settings/mcp.json`

### Cursor

在 Cursor 设置中添加 MCP 服务器配置

## 第一个测试

### 1. 初始化项目

让 AI 助手执行：

```
帮我在 /path/to/my-project 初始化 E2E 测试项目
```

AI 会调用 `e2e_init` 工具，创建标准项目结构。

### 2. 安装依赖

```bash
cd /path/to/my-project/e2e
npm install
npx playwright install chromium
```

### 3. 编写测试

让 AI 助手分析你的页面并生成测试：

```
帮我为登录页面编写 E2E 测试
```

### 4. 运行测试

```
运行 E2E 测试
```

AI 会调用 `e2e_run` 工具执行测试并返回结果。

### 5. 查看报告

```bash
cd /path/to/my-project/e2e
npx playwright show-report
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试 |
| `npm run test:headed` | 可视化运行 |
| `npm run test:debug` | 调试模式 |
| `npm run test:ui` | Playwright UI 模式 |
| `npm run report` | 打开测试报告 |

## 下一步

- [选择器策略](./selectors.md) — 编写稳定的选择器
- [UI 框架指南](./ui-frameworks.md) — 各框架的 DOM 特点

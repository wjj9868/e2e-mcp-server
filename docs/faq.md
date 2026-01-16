# 常见问题

## 安装问题

### Q: npm install 失败

检查 Node.js 版本：

```bash
node -v  # 需要 >= 18.0.0
```

### Q: Playwright 浏览器安装失败

```bash
# 只安装 Chromium
npx playwright install chromium

# 安装所有浏览器
npx playwright install

# 安装系统依赖（Linux）
npx playwright install-deps
```

### Q: Windows 上 PowerShell 执行策略问题

```powershell
# 临时允许
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 或使用 cmd
cmd /c "npm install"
```

## 配置问题

### Q: MCP 服务器连接失败

1. 检查配置文件路径是否正确
2. 检查 Node.js 是否在 PATH 中
3. 重启 MCP 客户端

### Q: 测试目录找不到

`e2e_run` 会按以下顺序查找：

1. 指定的 `testDir` 参数
2. `e2e/` 目录
3. `tests/` 目录
4. `test/` 目录
5. 当前目录

确保目录中有 `playwright.config.ts` 文件。

## 测试问题

### Q: 测试超时

```typescript
// 增加单个测试超时
test('长时间测试', async ({ page }) => {
  test.setTimeout(120000)  // 2 分钟
  // ...
})

// 或在配置中设置
// playwright.config.ts
export default defineConfig({
  timeout: 60000,  // 全局超时
})
```

### Q: 如何跳过测试

```typescript
test.skip('暂时跳过', async ({ page }) => {
  // ...
})

// 条件跳过
test('条件跳过', async ({ page }) => {
  test.skip(process.env.CI === 'true', '在 CI 中跳过')
  // ...
})
```

### Q: 如何只运行特定测试

```bash
# 按文件名
npx playwright test login.spec.ts

# 按测试名称
npx playwright test -g "登录"

# 按标签
npx playwright test --grep @smoke
```

### Q: 如何并行运行

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: 4,  // 并行数
})
```

### Q: 如何生成测试报告

```bash
# HTML 报告（默认）
npx playwright show-report

# JSON 报告
npx playwright test --reporter=json

# JUnit 报告（CI 用）
npx playwright test --reporter=junit
```

## 选择器问题

### Q: 如何处理动态 ID

避免使用动态 ID，改用：

```typescript
// 文本
page.getByText('按钮文字')

// placeholder
page.getByPlaceholder('输入提示')

// role
page.getByRole('button', { name: '提交' })

// data-testid（推荐在源码中添加）
page.locator('[data-testid="submit"]')
```

### Q: 如何处理 iframe

```typescript
const frame = page.frameLocator('#iframe-id')
await frame.locator('选择器').click()
```

### Q: 如何处理新窗口

```typescript
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.click('打开新窗口的按钮')
])
await newPage.waitForLoadState()
```

## 其他问题

### Q: 如何在 CI 中运行

```yaml
# GitHub Actions 示例
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run tests
  run: npx playwright test
```

### Q: 如何调试失败的测试

1. 查看 HTML 报告：`npx playwright show-report`
2. 查看失败截图：`test-results/` 目录
3. 查看 trace：`npx playwright show-trace trace.zip`
4. 使用 UI 模式：`npx playwright test --ui`

### Q: 如何录制测试

```bash
npx playwright codegen http://localhost:3000
```

这会打开浏览器，你的操作会自动生成代码。

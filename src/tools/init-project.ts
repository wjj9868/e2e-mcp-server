/**
 * 初始化 E2E 测试项目
 * 创建标准的项目结构和配置文件
 */

import * as fs from 'fs'
import * as path from 'path'

interface InitProjectArgs {
  projectDir: string
  baseUrl?: string
}

export async function initProject(args: InitProjectArgs): Promise<{
  content: Array<{ type: string; text: string }>
}> {
  const { projectDir, baseUrl = 'http://localhost:3000' } = args

  // 验证项目目录
  const resolvedProjectDir = path.resolve(projectDir)
  if (!fs.existsSync(resolvedProjectDir)) {
    return {
      content: [{
        type: 'text',
        text: `❌ 项目目录不存在: ${resolvedProjectDir}\n\n请确保目录存在后重试。`
      }]
    }
  }

  try {
    const e2eDir = path.join(resolvedProjectDir, 'e2e')
    
    // 创建目录结构
    const dirs = [
      'fixtures',
      'pages',
      'tests',
      'utils',
      'reports'
    ]
    
    for (const dir of dirs) {
      const fullPath = path.join(e2eDir, dir)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true })
      }
    }

    // 创建 playwright.config.ts
    const configContent = generatePlaywrightConfig(baseUrl)
    fs.writeFileSync(path.join(e2eDir, 'playwright.config.ts'), configContent)

    // 创建 package.json
    const packageContent = generatePackageJson()
    fs.writeFileSync(path.join(e2eDir, 'package.json'), packageContent)

    // 创建 test-data.ts
    const testDataContent = generateTestData()
    fs.writeFileSync(path.join(e2eDir, 'fixtures', 'test-data.ts'), testDataContent)

    // 创建示例 Page Object
    const examplePageContent = generateExamplePage()
    fs.writeFileSync(path.join(e2eDir, 'pages', 'example.page.ts'), examplePageContent)

    // 创建示例测试
    const exampleTestContent = generateExampleTest()
    fs.writeFileSync(path.join(e2eDir, 'tests', 'example.spec.ts'), exampleTestContent)

    // 创建 .gitignore
    fs.writeFileSync(path.join(e2eDir, '.gitignore'), `node_modules/
test-results/
playwright-report/
test-results.json
blob-report/
.auth/
`)

    return {
      content: [{
        type: 'text',
        text: `✅ E2E 测试项目初始化成功！

## 创建的文件结构
\`\`\`
${e2eDir}/
├── fixtures/
│   └── test-data.ts      # 测试数据
├── pages/
│   └── example.page.ts   # 示例 Page Object
├── tests/
│   └── example.spec.ts   # 示例测试
├── utils/
├── reports/
├── playwright.config.ts  # Playwright 配置
└── package.json
\`\`\`

## 下一步
\`\`\`bash
cd ${e2eDir}
npm install
npx playwright install chromium
npm test
\`\`\`

## 开始编写测试
1. 在 \`pages/\` 创建 Page Object
2. 在 \`tests/\` 创建测试用例
3. 运行 \`npm test\` 执行测试`
      }]
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: 'text', text: `❌ 初始化失败: ${msg}` }]
    }
  }
}

function generatePlaywrightConfig(baseUrl: string): string {
  return `import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : undefined,
  
  // 报告配置 - 同时生成多种格式
  reporter: [
    ['list'],  // 控制台输出
    ['html', { outputFolder: 'playwright-report', open: 'never' }],  // HTML 报告
    ['json', { outputFile: 'test-results.json' }],  // JSON 结果
  ],
  
  // 输出目录
  outputDir: 'test-results',
  
  timeout: 60000,
  expect: { timeout: 5000 },

  use: {
    baseURL: '${baseUrl}',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
`
}

function generatePackageJson(): string {
  return JSON.stringify({
    name: 'e2e-tests',
    version: '1.0.0',
    scripts: {
      test: 'playwright test',
      'test:headed': 'playwright test --headed',
      'test:debug': 'playwright test --debug',
      'test:ui': 'playwright test --ui',
      report: 'playwright show-report'
    },
    devDependencies: {
      '@playwright/test': '^1.40.0',
      '@types/node': '^20.10.0'
    }
  }, null, 2)
}

function generateTestData(): string {
  return `// 测试数据配置
// 根据实际项目修改

export const testUser = {
  username: 'testuser',
  password: '123456',
}

export const testAdmin = {
  username: 'admin',
  password: 'admin123',
}

// API 基础配置
export const apiConfig = {
  baseUrl: process.env.API_URL || 'http://localhost:8080',
}
`
}

function generateExamplePage(): string {
  return `import { Page, Locator, expect } from '@playwright/test'

/**
 * 示例 Page Object
 * 请根据实际页面修改
 */
export class ExamplePage {
  readonly page: Page
  readonly heading: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1')
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.heading).toBeVisible()
  }

  async getTitle(): Promise<string> {
    return await this.page.title()
  }
}
`
}

function generateExampleTest(): string {
  return `import { test, expect } from '@playwright/test'
import { ExamplePage } from '../pages/example.page'

test.describe('示例测试', () => {
  test('页面标题正确', async ({ page }) => {
    const examplePage = new ExamplePage(page)
    await examplePage.goto()
    
    const title = await examplePage.getTitle()
    expect(title).toBeTruthy()
  })

  test('页面可以正常加载', async ({ page }) => {
    await page.goto('/')
    await expect(page).not.toHaveURL(/error/)
  })
})
`
}

#!/usr/bin/env node
/**
 * E2E Test MCP Server
 * 专为 AI 助手设计的 E2E 测试服务
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { initProject } from './tools/init-project.js'
import { runTests } from './tools/run-tests.js'
import { openReport } from './tools/open-report.js'
import { PROMPTS } from './prompts/index.js'

const server = new Server(
  {
    name: 'e2e-test-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
)

// 注册工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'e2e_init',
      description: '初始化 E2E 测试项目，创建 Playwright 配置和目录结构',
      inputSchema: {
        type: 'object',
        properties: {
          projectDir: {
            type: 'string',
            description: '项目根目录路径',
          },
          baseUrl: {
            type: 'string',
            description: '测试目标 URL，默认 http://localhost:3000',
          },
        },
        required: ['projectDir'],
      },
    },
    {
      name: 'e2e_run',
      description: '运行 E2E 测试并返回结果',
      inputSchema: {
        type: 'object',
        properties: {
          testDir: {
            type: 'string',
            description: '测试目录路径',
          },
          testFile: {
            type: 'string',
            description: '指定测试文件',
          },
          grep: {
            type: 'string',
            description: '按名称过滤测试',
          },
          project: {
            type: 'string',
            description: '指定浏览器项目',
          },
          headed: {
            type: 'boolean',
            description: '是否显示浏览器窗口',
          },
        },
      },
    },
    {
      name: 'e2e_report',
      description: '打开 Playwright HTML 测试报告',
      inputSchema: {
        type: 'object',
        properties: {
          testDir: {
            type: 'string',
            description: '测试目录路径',
          },
        },
      },
    },
  ],
}))

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    case 'e2e_init':
      return await initProject(args as { projectDir: string; baseUrl?: string })
    case 'e2e_run':
      return await runTests(args as any)
    case 'e2e_report':
      return await openReport(args as { testDir?: string })
    default:
      throw new Error(`未知工具: ${name}`)
  }
})

// 注册提示词列表
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: Object.entries(PROMPTS).map(([name, fn]) => ({
    name,
    description: fn({}).description || name,
  })),
}))

// 处理提示词请求
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const promptFn = PROMPTS[name]

  if (!promptFn) {
    throw new Error(`未知提示词: ${name}`)
  }

  return promptFn(args || {})
})

// 启动服务
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('E2E Test MCP Server 已启动')
}

main().catch((error) => {
  console.error('启动失败:', error)
  process.exit(1)
})

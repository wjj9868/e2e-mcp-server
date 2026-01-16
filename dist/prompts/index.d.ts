/**
 * MCP 提示词 v3.2
 *
 * 通用设计：不绑定特定 UI 框架
 * 只提供 AI 需要但无法自己推断的通用知识
 */
type PromptResult = {
    description?: string;
    messages: Array<{
        role: 'user' | 'assistant';
        content: {
            type: 'text';
            text: string;
        };
    }>;
};
export declare const PROMPTS: Record<string, (args: any) => PromptResult>;
export {};
//# sourceMappingURL=index.d.ts.map
/**
 * 测试运行工具
 * 执行 Playwright 测试并返回结果
 */
interface RunTestsArgs {
    testDir?: string;
    testFile?: string;
    grep?: string;
    project?: string;
    headed?: boolean;
}
export declare function runTests(args: RunTestsArgs): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
export {};
//# sourceMappingURL=run-tests.d.ts.map
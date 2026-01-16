/**
 * 打开 Playwright 测试报告
 */
interface OpenReportArgs {
    testDir?: string;
}
export declare function openReport(args: OpenReportArgs): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
export {};
//# sourceMappingURL=open-report.d.ts.map
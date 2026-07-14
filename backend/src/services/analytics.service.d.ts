export declare const getPlatformKPIs: () => Promise<{
    kpis: {
        totalUsers: number;
        totalAuctions: number;
        totalGMV: number;
        platformRevenue: number;
    };
    charts: {
        revenue: {
            name: string;
            GMV: number;
            Revenue: number;
        }[];
    };
}>;
//# sourceMappingURL=analytics.service.d.ts.map
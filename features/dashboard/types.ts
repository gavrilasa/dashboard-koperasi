// features/dashboard/types.ts

export type DashboardStats = {
	mainAccountBalance: number;
	activeCustomerCount: number;
	totalTransactionVolume: number;
};

export type ChartDataPoint = {
	label: string;
	value: number;
};

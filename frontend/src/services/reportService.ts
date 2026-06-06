import api from "./api";
import type { MonthlyReport } from "../types/monthlyReport";
import type { MonthlyTrendsResponse } from "../types/monthlyTrends";

/**
 * GET /reports/monthly
 * Params: year, month
 */
export const getMonthlyReport = async (params: {
  year: number;
  month: number;
}): Promise<MonthlyReport> => {
  const res = await api.get<MonthlyReport>("/reports/monthly", {
    params: {
      year: params.year,
      month: params.month,
    },
  });

  return res.data;
};

/**
 * GET /reports/trends
 * Params: year, month
 */
export const getMonthlyTrends = async (params: {
  year: number;
  month: number;
}): Promise<MonthlyTrendsResponse> => {
  const res = await api.get<MonthlyTrendsResponse>("/reports/trends", {
    params: {
      year: params.year,
      month: params.month,
    },
  });

  return res.data;
};

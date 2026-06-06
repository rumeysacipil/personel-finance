import api from "./api";
import type { Budget, BudgetProgressResponse } from "../types/budget";

/**
 * GET /budgets?year=&month=
 */
export async function listBudgets(params: {
  year: number;
  month: number;
}): Promise<Budget[]> {
  const res = await api.get<Budget[]>("/budgets", { params });
  return res.data;
}

/**
 * POST /budgets
 * (Backend tarafında upsert gibi çalışıyorsa aynı endpoint ile devam)
 */
export async function upsertBudget(payload: {
  category: string;
  monthlyLimit: number;
  year: number;
  month: number;
}): Promise<Budget> {
  const res = await api.post<Budget>("/budgets", payload);
  return res.data;
}

/**
 * GET /budgets/progress?year=&month=
 */
export async function getBudgetProgress(params: {
  year: number;
  month: number;
}): Promise<BudgetProgressResponse> {
  const res = await api.get<BudgetProgressResponse>("/budgets/progress", { params });
  return res.data;
}

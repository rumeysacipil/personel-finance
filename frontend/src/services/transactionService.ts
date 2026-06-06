import api from "./api";
import type { PagedResponse, Transaction, TransactionType } from "../types/transaction";

/**
 * GET /transactions
 * Query params:
 * - from (yyyy-MM-dd)
 * - to   (yyyy-MM-dd)
 * - type (INCOME|EXPENSE) optional
 * - category (string) optional (backend LIKE destekliyorsa partial çalışır)
 * - page, size
 */
export const getTransactions = async (params: {
  from: string;
  to: string;
  page?: number;
  size?: number;
  type?: TransactionType;
  category?: string;
}): Promise<PagedResponse<Transaction>> => {
  const res = await api.get<PagedResponse<Transaction>>("/transactions", {
    params: {
      from: params.from,
      to: params.to,
      page: params.page ?? 0,
      size: params.size ?? 10,
      type: params.type,
      category: params.category?.trim() || undefined,
    },
  });

  return res.data;
};

/**
 * POST /transactions
 * Backend: TransactionCreateRequest
 */
export const createTransaction = async (body: {
  type: TransactionType;
  category: string;
  description?: string;
  amount: number;
  currency: string; // 3 letters (TRY, USD...)
  transactionDate: string; // yyyy-MM-dd
}) => {
  await api.post("/transactions", {
    type: body.type,
    category: body.category.trim(),
    description: body.description?.trim() || undefined,
    amount: body.amount,
    currency: body.currency.trim().toUpperCase(),
    transactionDate: body.transactionDate,
  });
};

/**
 * PUT /transactions/{id}
 * Backend: TransactionUpdateRequest (fields same as create)
 */
export const updateTransaction = async (
  id: number,
  body: {
    type: TransactionType;
    category: string;
    description?: string;
    amount: number;
    currency: string;
    transactionDate: string;
  }
) => {
  await api.put(`/transactions/${id}`, {
    type: body.type,
    category: body.category.trim(),
    description: body.description?.trim() || undefined,
    amount: body.amount,
    currency: body.currency.trim().toUpperCase(),
    transactionDate: body.transactionDate,
  });
};

/**
 * DELETE /transactions/{id}
 */
export const deleteTransaction = async (id: number) => {
  await api.delete(`/transactions/${id}`);
};

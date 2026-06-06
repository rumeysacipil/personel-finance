export type TransactionType = "INCOME" | "EXPENSE";

export type Transaction = {
  id: number;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  currency: string;
  transactionDate: string; // yyyy-MM-dd
};

// ✅ BACKEND ile aynı alan adları
export type PagedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

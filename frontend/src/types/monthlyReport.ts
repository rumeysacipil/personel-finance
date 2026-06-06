export interface CategoryTotal {
  category: string
  total: number
}

export interface MonthlyReport {
  year: number
  month: number
  totalIncome: number
  totalExpense: number
  netAmount: number
  expenseByCategory: CategoryTotal[]
}

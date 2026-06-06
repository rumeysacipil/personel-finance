export interface Budget {
  id: number
  category: string
  monthlyLimit: number
}

export interface BudgetProgressItem {
  category: string
  monthlyLimit: number
  spent: number
  remaining: number
  percentUsed: number
}

export interface BudgetProgressResponse {
  year: number
  month: number
  items: BudgetProgressItem[]
}

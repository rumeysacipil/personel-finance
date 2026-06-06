export interface DailyTrendPoint {
  day: number
  income: number
  expense: number
}

export interface MonthlyTrendsResponse {
  year: number
  month: number
  days: DailyTrendPoint[]
}

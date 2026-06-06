import api from "./api";
import type { MarketRates } from "../types/marketRates";

export const getMarketRates = async (): Promise<MarketRates> => {
  const res = await api.get<MarketRates>("/market-rates");
  return res.data;
};

export const TRY_PERIOD_DURATION_BY_DELIVERY_TYPE: Record<string, number> = {
  simple: 0,
  advanced: 600, // 10 minutes in seconds
  premium: 1020, // 17 minutes in seconds
};

export const TRY_PERIOD_PENALTY_BY_SECOND = 4.17; // 250/60 per second
export const TRY_PERIOD_CONSIDERED_STOLEN_AFTER_SECONDS = 900; // 15 minute

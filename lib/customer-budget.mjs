export const FREE_BUDGET_LIMIT=3;
export function canCreateBudget(cases,customerId,limit=FREE_BUDGET_LIMIT){const used=(cases||[]).filter(value=>value.customerId===customerId).length;return {allowed:used<limit,used,limit,remaining:Math.max(0,limit-used)};}

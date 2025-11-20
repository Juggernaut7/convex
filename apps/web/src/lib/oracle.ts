import { OracleConfig, OracleOperator } from "@/types/market";

export type OracleEvaluation =
  | { status: "pending"; reason: "before_close" | "missing_price" | "incomplete_config" }
  | { status: "met" | "missed"; difference: number };

export function evaluateCondition(price: number | undefined, operator: OracleOperator, target: number): OracleEvaluation {
  if (price === undefined || Number.isNaN(price)) {
    return { status: "pending", reason: "missing_price" };
  }

  const diff = price - target;

  switch (operator) {
    case "gte":
      return diff >= 0 ? { status: "met", difference: diff } : { status: "missed", difference: diff };
    case "gt":
      return diff > 0 ? { status: "met", difference: diff } : { status: "missed", difference: diff };
    case "lte":
      return diff <= 0 ? { status: "met", difference: diff } : { status: "missed", difference: diff };
    case "lt":
      return diff < 0 ? { status: "met", difference: diff } : { status: "missed", difference: diff };
    case "eq":
    default:
      return Math.abs(diff) < Number.EPSILON ? { status: "met", difference: diff } : { status: "missed", difference: diff };
  }
}

export function formatOperator(operator: OracleOperator) {
  switch (operator) {
    case "gte":
      return "≥";
    case "gt":
      return ">";
    case "lte":
      return "≤";
    case "lt":
      return "<";
    case "eq":
    default:
      return "=";
  }
}

export function describeOracleConfig(config?: OracleConfig | null) {
  if (!config) return "Oracle condition not configured";
  return `Price ${formatOperator(config.operator)} ${config.targetValue.toLocaleString()} USD`;
}


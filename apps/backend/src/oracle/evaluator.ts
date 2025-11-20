export type Operator = ">" | "<" | ">=" | "<=" | "==";

export interface EvaluationCondition {
  target: number;
  operator: Operator;
}

export interface EvaluationInput {
  marketType: "crypto" | "sports" | "event";
  condition: EvaluationCondition;
  fetchedValue: number | string | boolean;
}

export interface EvaluationResult {
  outcome: "yes" | "no";
}

export function evaluate(input: EvaluationInput): EvaluationResult {
  let numericValue: number;

  if (typeof input.fetchedValue === "number") {
    numericValue = input.fetchedValue;
  } else if (typeof input.fetchedValue === "boolean") {
    numericValue = input.fetchedValue ? 1 : 0;
  } else {
    const parsed = Number(input.fetchedValue);
    if (!Number.isFinite(parsed)) {
      // If value isn't numeric, treat "truthy" as yes, else no.
      return {
        outcome: input.fetchedValue ? "yes" : "no",
      };
    }
    numericValue = parsed;
  }

  const { target, operator } = input.condition;
  let isYes = false;

  switch (operator) {
    case ">":
      isYes = numericValue > target;
      break;
    case "<":
      isYes = numericValue < target;
      break;
    case ">=":
      isYes = numericValue >= target;
      break;
    case "<=":
      isYes = numericValue <= target;
      break;
    case "==":
      isYes = numericValue === target;
      break;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }

  return { outcome: isYes ? "yes" : "no" };
}



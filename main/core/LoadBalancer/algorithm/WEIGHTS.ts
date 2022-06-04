import { Target } from "../types";

/* weight algorithm */
export default function (tasks: Target[], weightTotal: number, context: { weightIndex: number }) {

  if (!tasks.length) return null;

  let max = tasks[0].weight as number, maxIndex = 0, sum;

  for (let i = 0; i < tasks.length; i++) {
    sum = (tasks[i].weight || 0) + Math.random() * weightTotal;
    if (sum >= max) {
      max = sum;
      maxIndex = i;
    }
  }

  context.weightIndex += 1;
  context.weightIndex %= (weightTotal + 1);

  return tasks[maxIndex];
};

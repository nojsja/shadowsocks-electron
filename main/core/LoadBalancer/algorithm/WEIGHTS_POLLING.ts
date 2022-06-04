import { Target } from "../types";

/* weights polling */
export default function (tasks: Target[], weightIndex: number, weightTotal: number, context: { weightIndex: number }) {

  if (!tasks.length) return null;

  let weight = 0;
  let task;

  for (let i = 0; i < tasks.length; i++) {
    weight += tasks[i].weight || 0;
    if (weight > weightIndex) {
      task = tasks[i];
      break;
    }
  }

  context.weightIndex += 1;
  context.weightIndex %= (weightTotal + 1);

  return task;
};

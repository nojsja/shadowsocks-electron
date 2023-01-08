import { Target } from '../types';

/* weights random algorithm */
export default function WEIGHTS_RANDOM(tasks: Target[], weightTotal: number) {
  let task;
  let weight = Math.ceil(Math.random() * weightTotal);

  for (let i = 0; i < tasks.length; i++) {
    weight -= tasks[i].weight || 0;
    if (weight <= 0) {
      task = tasks[i];
      break;
    }
  }

  return task || null;
}

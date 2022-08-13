import { Target } from "../types";

/* polling algorithm */
export default function POLLING(tasks: Target[], currentIndex: number, context: { currentIndex: number }) {
  if (!tasks.length) return null;

  const task = tasks[currentIndex];
  context.currentIndex ++;
  context.currentIndex %= tasks.length;

  return task || null;
}

import { Target } from '../types';

/* random algorithm */
export default function RANDOM(tasks: Target[]) {

  const length = tasks.length;
  const target = tasks[Math.floor(Math.random() * length)];

  return target || null;
}

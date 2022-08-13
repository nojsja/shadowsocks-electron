import { Target } from "../types";

/* specify by id algorithm */
export default function SPECIFY(tasks: Target[], id: any) {
  let task;

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      task = tasks[i];
      break;
    }
  }

  return task || null;
}

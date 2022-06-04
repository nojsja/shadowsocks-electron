import CONSTS from './consts';
import algorithm from './algorithm';
import { Target } from "./types";

/* Scheduler for LoadBalancer  */
export default class Scheduler {
  algorithm: CONSTS;
  constructor(algorithm: CONSTS) {
    this.algorithm = algorithm || CONSTS.POLLING;
  }

  /* pick one task from task list based on algorithm and params */
  calculate(tasks: Target[], params: any[]) {
    const results = (algorithm[this.algorithm] as any)(tasks, ...params);
    return results;
  }

  /* change algorithm strategy */
  setAlgorithm = (algorithm: CONSTS) => {
    if (algorithm in CONSTS) {
      this.algorithm = algorithm;
    } else {
      throw new Error(`Invalid algorithm: ${algorithm}, pick from ${Object.keys(CONSTS).join('|')}`);
    }
  }
}

import Scheduler from "./scheduler";
import CONSTS from './consts';
import { Target } from "./types";

export { CONSTS as ALGORITHM } from './consts';

const {
  RANDOM,
  POLLING,
  WEIGHTS,
  SPECIFY,
  WEIGHTS_RANDOM,
  WEIGHTS_POLLING,
  MINIMUM_CONNECTION,
  WEIGHTS_MINIMUM_CONNECTION,
} = CONSTS;

/* Load Balance Instance */
class LoadBalancer {
  private targets: Target[]
  private algorithm: CONSTS;
  private params: { [key: string]: any };
  private scheduler: Scheduler;
  private memoParams: { [key: string]: any }
  /**
    * @param  {Object} options [ options object ]
    * @param  {Array } options.targets [ targets for load balancing calculation: [{id: 1, weight: 1}, {id: 2, weight: 2}] ]
    * @param  {String} options.algorithm [ strategies for load balancing calculation : RANDOM | POLLING | WEIGHTS | SPECIFY | WEIGHTS_RANDOM | WEIGHTS_POLLING | MINIMUM_CONNECTION | WEIGHTS_MINIMUM_CONNECTION]
    */
  constructor(options: {
    targets: Target[],
    algorithm: CONSTS,
  }) {
    this.targets = options.targets;
    this.algorithm = options.algorithm || POLLING;
    this.params = { // data for algorithm
      currentIndex: 0, // index
      weightIndex: 0, // index for weight alogrithm
      weightTotal: 0, // total weight
      connectionsMap: {}, // connections of each target
      cpuOccupancyMap: {}, // cpu occupancy of each target
      memoryOccupancyMap: {}, // cpu occupancy of each target
    };
    this.scheduler = new Scheduler(this.algorithm);
    this.memoParams = this.memorizedParams();
    this.calculateWeightIndex();
    // ProcessManager.on('refresh', this.refreshParams);
  }

  /* params formatter */
  private memorizedParams = () => {
    return {
      [RANDOM]: () => [],
      [POLLING]: () => [this.params.currentIndex, this.params],
      [WEIGHTS]: () => [this.params.weightTotal, this.params],
      [SPECIFY]: (id: any) => [id],
      [WEIGHTS_RANDOM]: () => [this.params.weightTotal],
      [WEIGHTS_POLLING]: () => [this.params.weightIndex, this.params.weightTotal, this.params],
      [MINIMUM_CONNECTION]: () => [this.params.connectionsMap],
      [WEIGHTS_MINIMUM_CONNECTION]: () => [this.params.weightTotal, this.params.connectionsMap, this.params],
    };
  }

  /* refresh params data */
  public refreshParams = (pidMap: {[key: number]: { pid: any, cpu: any, memory: any}}) => {
    const infos = Object.values(pidMap);
    for (let info of infos) {
      // this.params.connectionsMap[id] = connections;
      this.params.cpuOccupancyMap[info.pid] = info.cpu;
      this.params.memoryOccupancyMap[info.pid] = info.memory;
    }
  }

  /* pick one task from queue */
  public pickOne = (...params: any[]): Target => {
    return this.scheduler.calculate(
      this.targets, this.memoParams[this.algorithm](...params)
    );
  }

  /* pick multi task from queue */
  public pickMulti = (count = 1, ...params: any[]) => {
    return new Array(count).fill(null).map(
      () => this.pickOne(...params)
    );
  }

  /* calculate weight */
  private calculateWeightIndex = () => {
    this.params.weightTotal = this.targets.reduce((total, cur) => total + (cur.weight || 0), 0);
    if (this.params.weightIndex > this.params.weightTotal) {
      this.params.weightIndex = this.params.weightTotal;
    }
  }

  /* calculate index */
  private calculateIndex = () => {
    if (this.params.currentIndex >= this.targets.length) {
      this.params.currentIndex = (this.params.currentIndex - 1 >= 0) ? (this.params.currentIndex - 1) : 0;
    }
  }

  /* clean data of a task or all task */
  public clean = (id?: any) => {
    if (id) {
      delete this.params.connectionsMap[id];
      delete this.params.cpuOccupancyMap[id];
      delete this.params.memoryOccupancyMap[id];
    } else {
      this.params = {
        currentIndex: 0,
        connectionsMap: {},
        cpuOccupancyMap: {},
        memoryOccupancyMap: {},
      };
    }
  }

  /* add a task */
  public add = (task: Target) => {
    if (this.targets.find(target => target.id === task.id)) {
      return console.warn(`Add Operation: the task ${task.id} already exists.`);
    }
    this.targets.push(task);
    this.calculateWeightIndex();
  }

  /* remove target from queue */
  public del = (target: Target) => {
    let found = false;
    for (let i  = 0; i < this.targets.length; i++) {
      if (this.targets[i].id === target.id) {
        this.targets.splice(i, 1);
        this.clean(target.id);
        this.calculateIndex();
        found = true;
        break;
      }
    }

    if (found) {
      this.calculateWeightIndex();
    } else {
      console.warn(`Del Operation: the task ${target.id} is not found.`, this.targets);
    }
  }

  /* wipe queue and data */
  public wipe = () => {
    this.targets = [];
    this.calculateWeightIndex();
    this.clean();
  }

  /* update calculate params */
  public updateParams = (object: {[key: string]: any}) => {
    Object.entries(object).map(([key, value]) => {
      if (key in this.params) {
        this.params[key] = value;
      }
    });
  }

  /* reset targets */
  public setTargets = (targets: Target[]) => {
    const targetsMap = targets.reduce((total, cur) => {
      total[cur.id] = 1;
      return total;
    }, {} as any);
    this.targets.forEach(target => {
      if (!(target.id in targetsMap)) {
        this.clean(target.id);
        this.calculateIndex();
      }
    });
    this.targets = targets;
    this.calculateWeightIndex();
  }

  /* change algorithm strategy */
  public setAlgorithm = (algorithm: CONSTS) => {
    if (algorithm in CONSTS) {
      this.algorithm = algorithm;
      this.params.weightIndex = 0;
      this.scheduler.setAlgorithm(this.algorithm);
    } else {
      throw new Error(`Invalid algorithm: ${algorithm}, pick from ${Object.keys(CONSTS).join('|')}`);
    }
  }
}

export default LoadBalancer;

import { Status } from "../../types";

export const SET_STATUS = "SET_STATUS";

export function setStatus<T extends keyof Status>(key: T, value: Status[T]) {
  return {
    type: SET_STATUS,
    key,
    value
  };
}

export type SetStatusAction = ReturnType<typeof setStatus>;

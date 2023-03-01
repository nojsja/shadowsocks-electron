import { useDispatch } from "react-redux";
import { store } from "../store";

export const useTypedDispatch = () => useDispatch<typeof store.dispatch>();

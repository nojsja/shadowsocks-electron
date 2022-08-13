import { createContext } from "react";

import { MenuContent } from './index';

const menucontext = {
  items: [] as MenuContent[],
  show: (
    event: React.MouseEvent<HTMLElement>,
    items: MenuContent[],
    callback?: (action: string) => void
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) => {}
};

export type ContextMenuProps = typeof menucontext;

export default createContext<ContextMenuProps>(menucontext);

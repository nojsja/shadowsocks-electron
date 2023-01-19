import { createContext } from "react";

import { MenuContent } from './index';

const menucontext = {
  items: [] as MenuContent[],
  show: (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    event: React.MouseEvent<HTMLElement>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    items: MenuContent[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    callback?: (action: string) => void
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) => {}
};

export type ContextMenuProps = typeof menucontext;

export default createContext<ContextMenuProps>(menucontext);

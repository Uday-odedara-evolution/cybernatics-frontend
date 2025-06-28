import { IToolbarActionsProps } from './types';

const ToolbarActions = ({ children }: IToolbarActionsProps) => {
  return <div className="flex items-center gap-4.5">{children}</div>;
};
export { ToolbarActions };

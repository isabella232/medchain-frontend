import classnames from 'classnames';
import {FunctionComponent} from 'react'
import classes from '../classes/classes';

const PanelElement: FunctionComponent<{ title: string; last?: boolean }> = ({
    title,
    children,
    last,
  }) => {
    return (
      <div
        className={classnames(
          "py-3 text-xs",
          "space-y-2",
          !last && "border-b border-gray-300"
        )}
      >
        <h2 className={classnames("mb-2", classes.boxSubtitle)}>{title}</h2>
        {children}
      </div>
    );
  };

  export default PanelElement
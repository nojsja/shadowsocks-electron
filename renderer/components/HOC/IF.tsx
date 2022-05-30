
import React from 'react';

type IfReturn = JSX.Element | null | string;
type IfCondition = boolean | null | undefined;

interface IfProps {
  condition: IfCondition;
  then?: IfReturn;
  else?: IfReturn;
}

const If = (props: IfProps): JSX.Element => {
  const condition = !!props.condition;
  const positive = props.then || null;
  const negative = props.else || null;

  return <>{condition ? positive : negative}</>;
};

export default If;

interface IfProps {
  condition: boolean | null | undefined;
  then: JSX.Element | null;
  else: JSX.Element | null;
}

const If = (props: IfProps): JSX.Element | null => {
  const condition = !!props.condition;
  const positive = props.then || null;
  const negative = props.else || null;

  return condition ? positive : negative;
};

export default If;

import React, { forwardRef, useImperativeHandle, useRef } from 'react';

const WrapperComponent = forwardRef((props, ref) => {
  const innerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getDOMNode: () => innerRef.current,
  }));

  return <div ref={innerRef}>{props.children}</div>;
});

export default WrapperComponent;

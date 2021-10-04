import React from 'react';
import './style.scss';

const ToggleButton = (props: { onClick: any }) => {
  return (
    <label className="switch">
      <input onClick={props.onClick} type="checkbox" />
      <span className="slider round"></span>
    </label>
  );
};

export default ToggleButton;

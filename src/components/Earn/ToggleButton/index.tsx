import React from 'react';
import './style.scss';

const ToggleButton = (props: { onClick: any; value: boolean }) => {
  return (
    <label className="switch">
      <input checked={props.value} onClick={props.onClick} onChange={()=>{}} type="checkbox" />
      <span className="slider round"></span>
    </label>
  );
};

export default ToggleButton;

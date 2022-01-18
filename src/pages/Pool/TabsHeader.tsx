import React from 'react';
import {useStores} from '../../stores';

const Tab: React.FC<{ name: string }> = ({ name }) => {
  const isSelected = window.location.hash === `#${name}`;
  const { theme } = useStores();
  const opacity = theme.currentTheme === 'dark' ? '0.8' : '0.2'

  return (
    <strong
      style={{
        padding: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        borderRadius: '10px',
        width: '224px',
        background: isSelected ? 'rgba(23,63,27,' + opacity + ')' : null,
        color: isSelected ? '#3ba246' : '#5F5F6B',
        textAlign: 'center'
      }}
      onClick={() => {
        if (!isSelected) {
          window.location.hash = name;
        }
      }}
    >
      {name}
    </strong>
  );
};

export class TabsHeader extends React.Component {
  constructor(props: Readonly<{}>) {
    super(props);
  }

  render() {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: '1em',
        }}
      >
        {/* <Tab name="Swap" /> */}
        <Tab name="Provide" />
        <Tab name="Withdraw" />
        {/* <Tab name="History" /> */}
      </div>
    );
  }
}

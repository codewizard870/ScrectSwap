import React from 'react';

const Tab: React.FC<{ name: string }> = ({ name }) => {
  const isSelected = window.location.hash === `#${name}`;

  return (
    <strong
      style={{
        padding: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        borderRadius: '10px',
        width: '224px',
        background: isSelected ? 'rgba(255, 114, 110, 0.2)' : null,
        color: isSelected ? '#FF726E' : '#5F5F6B',
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

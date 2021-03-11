import { SwapTokenMap } from 'pages/Swap/types/SwapToken';
import React, { useState } from 'react';
import { Icon, Image, Popup } from 'semantic-ui-react';
import { FlexRowSpace } from './FlexRowSpace';
import Loader from 'react-loader-spinner';

const routeLink = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="black"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export const RouteRow = ({
  isLoading,
  tokens,
  route,
}: {
  isLoading: boolean;
  tokens: SwapTokenMap;
  route: string[];
}) => {
  const [iconBackground, setIconBackground] = useState<string>('whitesmoke');

  if ((!route || route.length === 0) && !isLoading) {
    return null;
  }

  return (
    <div
      style={{
        paddingTop: isLoading ? '1em' : '0.5em',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      Route
      <Popup
        trigger={
          <Icon
            name="help"
            circular
            size="tiny"
            style={{
              marginLeft: '0.5rem',
              background: iconBackground,
              verticalAlign: 'middle',
            }}
            onMouseEnter={() => setIconBackground('rgb(237, 238, 242)')}
            onMouseLeave={() => setIconBackground('whitesmoke')}
          />
        }
        content="Routing through these tokens resulted in the best price for your trade."
        position="top center"
      />
      <FlexRowSpace />
      {isLoading ? (
        <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />
      ) : (
        route.map((node, idx) => {
          const token = tokens.get(node);
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
              key={token.identifier}
            >
              <Image
                src={token.logo}
                avatar
                style={{
                  boxShadow: 'rgba(0, 0, 0, 0.075) 0px 6px 10px',
                  borderRadius: '24px',
                  maxHeight: '24px',
                  maxWidth: '24px',
                }}
              />
              {token.symbol} {idx < route.length - 1 && routeLink}
            </div>
          );
        })
      )}
    </div>
  );
};

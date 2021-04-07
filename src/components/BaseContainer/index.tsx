import * as React from 'react';
import { Box, BoxProps } from 'grommet';
import { Head } from 'components';
import { MainFooter } from 'components';
import { withTheme } from 'styled-components';
import { IStyledChildrenProps } from 'interfaces';
import './notifications.css';
import Header from '../Header/Header';

export const BaseContainer: React.FC<IStyledChildrenProps<BoxProps>> = withTheme(
  ({ theme, children, ...props }: IStyledChildrenProps<BoxProps>) => {
    const { palette, container } = theme;
    const { minWidth, maxWidth } = container;
    return (
      <>
        {/*<div className={styles.backgroundImage} />*/}
        {/*<div className={styles.blur} />*/}
        <div
          style={{
            minHeight: '100%',
            width: '100vw',
            overflow:'auto',
          }}
        >
          <Header />
          <Box
            style={{
              width:'100%',
              minHeight: 'calc(100vh - 116px)',
              marginTop:'42px',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F8EC99 180.99%)'
            }}
            {...props}
          >
            <div id="notifications_container"></div>
            {children}
          </Box>
          {/* <MainFooter /> */}
        </div>
      </>
    );
  },
);

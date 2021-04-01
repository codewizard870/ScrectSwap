import * as React from 'react';
import { Box, BoxProps } from 'grommet';
import { Head } from 'components';
import { MainFooter } from 'components';
import { withTheme } from 'styled-components';
import { IStyledChildrenProps } from 'interfaces';
//import * as styles from './styles.styl';
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
            height: '100%',
            width: '100vw',
          }}
        >
          <Header />
          <Box
            style={{
              width:'100%',
              height: 'calc(100vh - 59px)',
              background: 'linear-gradient(0deg, rgba(248,236,153,1) 0%, rgba(255,255,255,1) 100%)'
            }}
            {...props}
          >
            {children}
          </Box>
          {/* <MainFooter /> */}
        </div>
      </>
    );
  },
);

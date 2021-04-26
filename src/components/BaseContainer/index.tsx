import * as React from 'react';
import { Box, BoxProps } from 'grommet';
import { Head } from 'components';
import { MainFooter } from 'components';
import { withTheme } from 'styled-components';
import { IStyledChildrenProps } from 'interfaces';
import './notifications.css';
import Header from '../Header/Header';
import { useStores } from 'stores';
import * as styles from './styles.styl';

export const BaseContainer: React.FC<IStyledChildrenProps<BoxProps>> = withTheme(
  ({ theme, children, ...props }: IStyledChildrenProps<BoxProps>) => {
    // const { palette, container } = theme;
    // const { minWidth, maxWidth } = container;
    const {theme:Theme}=useStores();
    
    return (
      <>
        {/*<div className={styles.backgroundImage} />*/}
        {/*<div className={styles.blur} />*/}
        <div
          style={{
            minHeight: '100%',
            width: '100vw',
            overflowY: "auto",
            overflowX: 'hidden',
          }}
          
        >
          <Header />
          <div
            className={`${styles[Theme.currentTheme]}`} 
            {...props}
          >
            <div id="notifications_container"></div>
            {children}
          </div>
          {/* <MainFooter /> */}
        </div>
      </>
    );
  },
);

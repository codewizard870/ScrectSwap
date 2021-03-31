import { createGlobalStyle } from 'styled-components';
import { transparentize } from 'polished';

export const GlobalStyle = createGlobalStyle<any>`
  html {
    color: ${props => props.theme.colorSecondary};
    background-color: ${props => transparentize(0.9, props.theme.palette.Basic700)};
  }
  
  body {
    font-family: ${props => props.theme.fontBase || 'Nunito'};
    overflow-x: hidden;
    background-position: 0 100%;
    background-repeat: no-repeat;
    background: rgb(248,236,153);
    background: linear-gradient(0deg, rgba(248,236,153,1) 0%, rgba(255,255,255,1) 100%);
    paddingBottom: 60px;
  }
`;

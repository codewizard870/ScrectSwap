export * from './baseTheme';
export * from './theme';
import { action,observable } from 'mobx';

const DARK ='dark';
const LIGHT ='light';

class Theme{
  @observable currentTheme: string;
  theme: any;

  constructor (){
    this.currentTheme = localStorage.getItem('currentTheme');
    if(!this.currentTheme){
      this.currentTheme = LIGHT;
      localStorage.setItem('currentTheme',LIGHT);
    }
  }


  @action public switchTheme():void{
    if(this.currentTheme == LIGHT){
      localStorage.setItem('currentTheme',DARK);
      this.currentTheme = DARK;
    }else{
      localStorage.setItem('currentTheme',LIGHT);
      this.currentTheme = LIGHT;
    }
  }
}

export default Theme;
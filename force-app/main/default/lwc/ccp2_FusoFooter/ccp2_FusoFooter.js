import { LightningElement } from 'lwc';
import Home_StaticResource from '@salesforce/resourceUrl/CCP_StaticResource_Home';

const FOOTER_LOGO = Home_StaticResource + '/CCP_StaticResource_Home/images/logo.svg';
export default class Ccp2_FusoFooter extends LightningElement {
    footer_logo = FOOTER_LOGO;
}
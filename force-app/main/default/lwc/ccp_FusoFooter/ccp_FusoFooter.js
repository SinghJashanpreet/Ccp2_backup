import { LightningElement } from 'lwc';
import Home_StaticResource from '@salesforce/resourceUrl/CCP_StaticResource_Home';

const FOOTER_LOGO = Home_StaticResource + '/CCP_StaticResource_Home/images/footer_logo.svg';
export default class Ccp_FusoFooter extends LightningElement {
    footer_logo = FOOTER_LOGO;
}
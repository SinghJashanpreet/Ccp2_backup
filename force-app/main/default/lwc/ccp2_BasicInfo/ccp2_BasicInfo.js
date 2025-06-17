import { LightningElement, track } from 'lwc';

export default class Ccp_BasicInfo extends LightningElement {

    @track showUppInfo = true;
    @track showwithdraw = true;
    
    closeShow(){
        this.showUppInfo = false;
    }
    handleCloseMember(){
        console.log("working 3")
        this.showwithdraw = false;
        console.log("working 2");
    }
    handleopenmember(){
        this.showUppInfo = true;
        this.showwithdraw = true;
        console.log("inside opennnnnn")
    }
    handleopenbasic(){
        this.showUppInfo = true;
    }
}
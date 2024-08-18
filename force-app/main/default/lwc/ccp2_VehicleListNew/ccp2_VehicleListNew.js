import { LightningElement,track,wire } from 'lwc';
import getVehicleData from '@salesforce/apex/CCP2_userData.userRegisteredVehicleList';
import Vehicle_StaticResource from '@salesforce/resourceUrl/CCP2_Resources';

const BACKGROUND_IMAGE_PC = Vehicle_StaticResource + '/CCP2_Resources/Common/Main_Background.png';
const Filter = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/filter_alt.png';
const Deleteveh = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/delete-vehicle.png';
const download = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/file_download.png';

export default class Ccp2_VehicleListNew extends LightningElement {
    
    backgroundImagePC = BACKGROUND_IMAGE_PC;
    filtericon = Filter;
    DelVehIcon = Deleteveh;
    DownloadIcon = download;

    vehicleData =[];
    CarModel =[];
    brandModel = [];
    offSetCount = 10;
    VehicleCount = 0;
    @track showVehicleList = true;
    @track showVehicleDetails = false;
    @track vehicleId;
    @track showVehicleModal = false;
    @track showSpinner = false;


@wire(getVehicleData)vehicledata({data,error}){

    if(data){
        this.vehicleData=data;
        this.VehicleCount = data.length;
        this.showSpinner = false;
        console.log("redata",this.vehicleData);
    }
    else if(error){
        console.log(error);
        this.showSpinner = true;
    }
}
connectedCallback(){
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    this.showSpinner = true;

}

handlecardClick(event) {
     this.vehicleId = event.currentTarget.dataset.id;
    console.log('Clicked Vehicle ID:', this.vehicleId);
    // this.dispatchEvent(new CustomEvent('vehicleclick', { detail: vehicleId }));
    this.showVehicleDetails = true;
    this.showVehicleList = false;
    window.scrollTo(0,0);
    
}
handleBack(){
    console.log("called");
    this.showVehicleList = true;
    this.showVehicleDetails = false;
}

showVehicleRegistration(){
 this.showVehicleModal = !this.showVehicleModal;
}
handleCloseModal(){
    this.showVehicleModal = false;
}
handlemoveModal(){
    this.showVehicleList = false;
}
}
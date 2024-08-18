import { LightningElement,track,wire} from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import FUSE_JS from '@salesforce/resourceUrl/fuse';
import Vehicle_StaticResource from '@salesforce/resourceUrl/CCP2_Resources';
import ChassisList from '@salesforce/apex/CCP2_VehicleManagment.allVehicleList';
import senddata from '@salesforce/apex/CCP2_VehicleManagment.vehicleByChassis';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';



const  ManualIcon = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Manual_Reg.png';
const   CSVIcon = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/CSV_Reg.png';
const   ElecIcon = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Electronic_Reg.png';
const   AddIcon = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/AddIcons.png';


export default class Ccp2VehicleModal extends LightningElement {

    @track showVehicleModal = true;
    @track showManualRegistration = false;
    @track optVehicles = [];
    @track searchResults = [];
    @track showlist = false;

    @track inputs = [{ id: 1, part1: '', part2: '', chassisNumber: '', validInput: true, showlist: false }];
    @track registeredVehicles = [];
    @track vehicleInfo = [];
    @track fullModal = true;

    @track searchdisenable = "searchbuttoninput btn";
    @track input1there = true;
    @track inputthere = false;
    //next nav 
    @track RegVehicle = false;
    @track VehicleInfo = false;
    @track Bothcase = false;
    @track nodata = false;
    @track Results = false;
    @track showregvehicle = false;
    @track filteredregisteredChassis = [];
    @track showsure = false;
    @track suretoclose = false;

    fuseInitialized = false;
    fuse;

    
    //Images
    ManualRegImg = ManualIcon;
    CSVRegImg = CSVIcon;
    ElecRegImg = ElecIcon;
    addButton = AddIcon;

    @wire(ChassisList)newfile({data,error}){
        if (data) {
            console.log("thisq",data);
            this.optVehicles = data.map(contact => {
                return { label: contact.carPlatformNo__c, value: contact.carPlatformNo__c, registrationNumber: contact.Registration_Number__c};
            });
            console.log("devil332",JSON.stringify(this.optVehicles));
            if (!this.fuseInitialized) {
                this.initializeFuse();
            }
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback(){
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

       
    }
    renderedCallback(){
        document.addEventListener('click', this.handleOutsideClick);
    }

    onInputClick(){
        this.suretoclose = true;
    }
    closeinputsure(){
        this.suretoclose = false;
    }

    onClose(){
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
    }
    
    disconnectedCallback() {
        // Remove event listener when component is removed from DOM
        document.removeEventListener('click', this.handleOutsideClick);
    }

    handleInsideClick(event) {
        event.stopPropagation();
    }
    suremodal(){
        this.showsure = true;
    }
    closesure(){
        this.showsure = false;
    }

    handleOutsideClick(event) {
        const isInsideModal = this.template.querySelector('.inputMultiple').contains(event.target);
        console.log("working");
        
        // Close lists if clicked outside the modal window
        if (!isInsideModal) {
            this.inputs.forEach(input => {
                input.showlist = false;
                console.log("working");
            });
            this.inputs = [...this.inputs]; // Ensure reactivity
        }
    }


    async initializeFuse() {
        if (this.fuseInitialized) {
            return;
        }

        try {
            await loadScript(this, FUSE_JS);
            this.fuse = new Fuse(this.optVehicles, {
                keys: ['label'],
                threshold: 0.4
            });
            this.fuseInitialized = true;
        } catch (error) {
            console.error('Error loading Fuse.js:', error);
        }
    }

    handleMoveModalFromParent() {
        const moveModalEvent = new CustomEvent('movemodal', {
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(moveModalEvent);
    }

    onNext(){
        this.showregvehicle = true;
        this.handleMoveModalFromParent();
        this.fullModal = false;
    }
   

//2nd modal
    openManualModal(){
        this.showManualRegistration = true;
        this.showVehicleModal = false;
    }
    closeManualModal(){
        this.showManualRegistration = false;
    }

    values(){
        console.log("inputvalues",this.inputs);
        console.log("inputvalues",JSON.stringify(this.inputs));
    }

    //inputs
    addInputFields() {
        this.inputs = this.inputs.map(input => ({
            ...input,
            showlist: false
        }));
        this.inputs.push({
            id: this.inputs.length + 1,
            part1: '',
            part2: '',
            chassisNumber: '',
            validInput: true,
            showlist: false
        });
    }

    handleInputChange(event) {
        const index = event.target.dataset.index;
        const type = event.target.dataset.type;
        const value = event.target.value;

        if (type === 'part1' && value.length > 5) {
            value = value.slice(0, 5);
        } else if (type === 'part2' && value.length > 7) {
            value = value.slice(0, 7);
        }

        if (value.match(/[^a-zA-Z0-9\-]/g)) {
            this.inputs[index].validInput = false;
            event.target.classList.add('input-field-modal-invalid');
        } else {
            this.inputs[index].validInput = true;
            event.target.classList.remove('input-field-modal-invalid');
        }

    
        if (type === 'part1') {
            this.inputs[index].part1 = value;
            console.log("32q",JSON.stringify(this.inputs));
        } else if (type === 'part2') {
            this.inputs[index].part2 = value;
            console.log("32q",JSON.stringify(this.inputs));
        }
    
        this.inputs[index].chassisNumber = `${this.inputs[index].part1}-${this.inputs[index].part2}`;
    
        if (this.fuse && value !== '') {
            const searchResults = this.fuse.search(value); 
            this.inputs = this.inputs.map((input, i) => ({
                ...input,
                searchResults: i === parseInt(index, 10) ? searchResults.map(result => result.item) : [],
                showlist: i === parseInt(index, 10) ? searchResults.length > 0 : false,
                emptylist: i === parseInt(index, 10) ? searchResults.length === 0 : false
            }));
    } else {
        this.inputs[index].searchResults = [];
        this.inputs[index].showlist = false;
    }
    
        this.inputs = [...this.inputs];
        if (this.inputs[index].validInput) {
            // Add the chassisNumber back to optVehicles
            if (!this.optVehicles.includes(this.inputs[index].chassisNumber)) {
                this.optVehicles = [...this.optVehicles, this.inputs[index].chassisNumber];
            }
        }
    }


    



    handleSelection(event) {
        const selectedValue = event.currentTarget.dataset.id;
        const index = event.currentTarget.dataset.index;
        // console.log("e311q",index);
    
        const hyphenIndex = selectedValue.indexOf('-');
        if (hyphenIndex !== -1) {
            const part1 = selectedValue.substring(0, hyphenIndex);
            const part2 = selectedValue.substring(hyphenIndex + 1);
            
            // console.log("part1:", JSON.stringify(part1));
            // console.log("part2:", JSON.stringify(part2));
            this.inputs[index].part1 = part1;
            this.inputs[index].part2 = part2;
            this.inputs[index].chassisNumber = selectedValue;
            console.log("Updated inputs after selection:", JSON.stringify(this.inputs));
            
        } else {
            const part1 = selectedValue.slice(0, 5);
            const part2 = selectedValue.slice(5, 12); // Adjust slicing as needed for the new condition
        
            this.inputs[index].part1 = part1;
            this.inputs[index].part2 = part2;
            this.inputs[index].chassisNumber = selectedValue;
            console.log("Updated inputs after selection (without hyphen):", JSON.stringify(this.inputs));
        }
        this.inputs[index].searchResults = this.inputs[index].searchResults.filter(result => result.value !== selectedValue);
    
    // Remove the selected value from optVehicles
         this.optVehicles = this.optVehicles.filter(vehicle => vehicle.value !== selectedValue);

            this.inputs[index].showlist = false;
            this.inputs = [...this.inputs];

    console.log("Filtered optVehicles:", JSON.stringify(this.optVehicles));
    }


    get searchButtonClass() {
        const firstInput = this.inputs[0];
        if (firstInput.part1.length == 5 && firstInput.part2.length > 0) {
            return "searchbutton btn"; // Enabled state
        } else {
            return "searchbuttoninput btn"; // Disabled state
        }
    }


    handleSearchButtonClick() {
        if (this.inputs.length > 0) {
            // if (!this.inputs[0].part1 || !this.inputs[0].part2) {
            //     // this.showToast('Error', 'Please fill all fields in the first input.', 'error');
            //     // return;
            //     this.searchdisenable = "searchbuttoninput btn";

            // }else{
            //     this.searchdisenable = "searchbutton btn";
            // }
    
            const filledInputs = this.inputs.filter((input, index) => {
                return index === 0 || (input.part1 && input.part2);
            });
    
            if (filledInputs.length > 0) {
                this.handleSearch(filledInputs);
            } else {
                this.showToast('Error', 'Please fill all chassis number fields.', 'error');
            }
        } else {
            this.showToast('Info', 'No chassis numbers to search.', 'info');
        }
    }
    
    handleSearch(filledInputs) {

        const chassisNumbers = filledInputs.map(input => input.chassisNumber);
    
        senddata({ chassisNumbers })
            .then(result => {
                this.registeredVehicles = result['Registered Vehicle'];
                this.vehicleInfo = result['Vehicle Info'];
                const vehicleIdsToAdd = this.vehicleInfo.map(vehicle => vehicle.carPlatformNo__c);
                this.filteredregisteredChassis = vehicleIdsToAdd;
    
                this.RegVehicle = this.registeredVehicles.length > 0 && this.vehicleInfo.length === 0;
                this.VehicleInfo = this.registeredVehicles.length === 0 && this.vehicleInfo.length > 0;
                this.Bothcase = this.registeredVehicles.length > 0 && this.vehicleInfo.length > 0;
                this.nodata = this.registeredVehicles.length === 0 && this.vehicleInfo.length === 0;
    
                this.Results = true;
                this.showManualRegistration = false;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Handle error scenario if needed
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

}
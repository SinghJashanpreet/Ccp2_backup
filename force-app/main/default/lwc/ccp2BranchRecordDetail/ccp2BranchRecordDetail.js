import { LightningElement,track,api,wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { loadStyle } from 'lightning/platformResourceLoader';
import pureCss from '@salesforce/resourceUrl/pure';
import Vehicle_StaticResource from '@salesforce/resourceUrl/CCP2_Resources';
import getBranchData from '@salesforce/apex/CCP2_userData.NewBranchDetails';
import getNullVehicles from '@salesforce/apex/CCP2_userData.VehicleWithoutAssociationDtl';
import deleteVehicles from '@salesforce/apex/CCP2_userData.unassociateVehicle';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import AddVehicle from '@salesforce/apex/CCP2_userData.associateVehicle';
import UserList from '@salesforce/apex/CCP2_userData.userListDtl';
import AddUser from '@salesforce/apex/CCP2_userData.associateUser';
import deleteUser from '@salesforce/apex/CCP2_userData.unassociateUser';
import UpdateFields from '@salesforce/apex/CCP2_branchController.updateBranchById';
import deletebranch from '@salesforce/apex/CCP2_branchController.deleteBranchById';



//labels 
import CCP2_LocationInformation from '@salesforce/label/c.CCP2_LocationInformation';
import CCP2_CompanyName from '@salesforce/label/c.CCP2_CompanyName';
import CCP2_BranchNumber from '@salesforce/label/c.CCP2_BranchNumber';
import CCP2_BranchName from '@salesforce/label/c.CCP2_BranchName';
import CCP2_Address from '@salesforce/label/c.CCP2_Address';
import CCP2_Contact from '@salesforce/label/c.CCP2_Contact';
import CCP2_AffiliatedVehicles from '@salesforce/label/c.CCP2_AffiliatedVehicles';
import CCP2_Users from '@salesforce/label/c.CCP2_Users';
import CCP2_ToEdit from '@salesforce/label/c.CCP2_ToEdit';
import CCP2_DeleteThisBranch from '@salesforce/label/c.CCP2_DeleteThisBranch';
import CCP2_Return from '@salesforce/label/c.CCP2_Return';
// import CCP2_BranchNo from '@salesforce/label/c.CCP2_BranchNumber';
import CCP2_Required from '@salesforce/label/c.CCP2_Required';
import CCP2_AddVehicles from '@salesforce/label/c.CCP2_AddVehicles';
import CCP2_AddUsers from '@salesforce/label/c.CCP2_AddUsers';
import CCP2_SelectAUser from '@salesforce/label/c.CCP2_SelectAUser';
import CCP2_SaveChanges from '@salesforce/label/c.CCP2_SaveChanges';
import CCP2_BackToMain from '@salesforce/label/c.CCP2_BackToMain';
import CCP2_WithoutHyphen from '@salesforce/label/c.CCP2_WIthoutHyphen';
import CCP2_PleaseSelect from '@salesforce/label/c.CCP2_PleaseSelect';
import CCP2_AssignMem from '@salesforce/label/c.CCP2_AssignNewMember';
import CCP2_AssignVeh from '@salesforce/label/c.CCP2_AssignNewVehicle';
import CCP2_PleaseEnter from '@salesforce/label/c.CCP2_PleaseEnter';
import CCP2_SelectedVehicle from '@salesforce/label/c.CCP2_SelectedVehicle';
import CCP2_SelectedMembers from '@salesforce/label/c.CCP2_SelectedMembers';






const BACKGROUND_IMAGE_PC = Vehicle_StaticResource + '/CCP2_Resources/Common/Main_Background.png';
const  arrowicon = Vehicle_StaticResource + '/CCP2_Resources/Common/arrow_under.png';
//const  searchicon = Vehicle_StaticResource + '/CCP2_Resources/images/search.png';

export default class Ccp2BranchRecordDetail extends LightningElement {

    labels = {
        CCP2_LocationInformation,
        CCP2_CompanyName,
        CCP2_BranchNumber,
        CCP2_BranchName,
        CCP2_Address,
        CCP2_Contact,
        CCP2_AffiliatedVehicles,
        CCP2_Users,
        CCP2_ToEdit,
        CCP2_DeleteThisBranch,
        CCP2_Return,
        CCP2_Required,
        CCP2_AddVehicles,
        CCP2_AddUsers,
        CCP2_SelectAUser,
        CCP2_SaveChanges,
        CCP2_BackToMain,
        CCP2_WithoutHyphen,
        CCP2_PleaseSelect,
        CCP2_AssignMem,
        CCP2_AssignVeh,
        CCP2_PleaseEnter,
        CCP2_SelectedVehicle,
        CCP2_SelectedMembers 
    };


    backgroundImagePC = BACKGROUND_IMAGE_PC;
    @track showDetails = true;
    @track showCancelModal = false;
    @api branchId;
    @track showlist = false;
    @track CompanyName = '';
    @track TipNumber = '';
    @track BranchNumber = '';
    @track originalBranchName = '';
    @track MentionName = '';
    @track Address = '';
    @track Contact = '';
    @track fullwidthnum = false;
    @track OriginalAddress = '';
    @track OriginalContact = '';
    @track originalMunicipalities = '';
    @track originalBuildingName = '';
    @track originalPostalCode = '';
    @track originalPrefecture = '';
    @track originalStreetAddress = '';
    @track vehicle = [];
    @track contacts = [];
    @track branchName = '';
    @track deletedVehicleIds = [];
    @track deletedContactIds = [];
    @track showSpinner = false;
    @track vehicles = [];
    @track selectedVehicleId = '';
    @track morevehicles = [];
    @track moreContacts = [];
    @track selectedContactId = '';
    @track optcontacts = [];
    @track vehicleIds = [];
    @track originalVehicle = [];
    @track originalContacts = [];
    @track showUserOpt = false;
    @track vehicletoPush = this.morevehicles;
    //for validations in inputs 
    @track branchNameClass = '';
    @track addressClass = '';
    @track contactClass = '';
    @track opts = true;
    @track main = true;
    outsideClickHandlerAdded = false;
    @track selectedLabels = '';
    searchTerm = '';
    imgdrop = arrowicon;
    @track showList = false;
    @track showsure = false;
    @track combinedAddress = '';
    @track postalCode = '';
    @track prefectures = '';
    @track municipalities = '';
    @track streetAddress = '';
    @track buildingName = '';
    @track siebelcode = '';
    @track showModal = false;
    @track showerrorbranch = false;
    @track showerrorbranchNull = false;

    @wire(getBranchData, { branchId: '$branchId' })
    wiredBranchData(result) {
        this.branchData = result;
        if (result.data) {
            this.processBranchData(result.data);
            this.showSpinner = false;
            console.log("datanew",result.data);
        } else if (result.error) {
            console.error(result.error);
            this.showSpinner = false;
        }
    }

    processBranchData(data) {
        const branch = data.BranchDetails;

        this.CompanyName = branch.Company || '-';
        this.Address = branch.Address || null;
        this.Contact = branch.ContactNo || null;
        this.branchName = branch.Name || '-';
        this.postalCode = branch.PostalCode || null;
        this.prefectures = branch.Prefecture || null;
        this.municipalities = branch.municipalities || null;
        this.streetAddress = branch.streetAddress || null;
        this.buildingName = branch.BuldingName || null;
        this.siebelcode = branch.Account.siebelAccountCode__c;
        this.BranchNumber = this.formatBranchNumber(branch.BranchNo) || '-';

        this.combinedAddress = [
            this.postalCode,
            this.prefectures,
            this.municipalities,
            this.streetAddress,
            this.buildingName
        ].filter(part => part).join(' ');

        this.originalBranchName = branch.Name;
       // this.OriginalAddress = branch.Address;
        this.OriginalContact = branch.ContactNo;
        this.originalBuildingName = branch.BuldingName;
        this.originalMunicipalities = branch.municipalities;
        this.originalPostalCode = branch.PostalCode;
        this.originalPrefecture = branch.Prefecture;
        this.originalStreetAddress = branch.streetAddress;

        this.contacts = data.Contacts.map(contact => ({
            Name: contact.Name,
            Id: contact.Id
        }));

        this.originalContacts = data.Contacts.map(contact => ({
            Name: contact.Name,
            Id: contact.Id
        }));
        console.log("con", JSON.stringify(this.originalContacts));

        this.vehicle = data.Vehicles.map(vehicle => ({
            Name: vehicle.Name,
            Id: vehicle.Id
        }));
        this.originalVehicle = data.Vehicles.map(vehicle => ({
            Name: vehicle.Name,
            Id: vehicle.Id
        }));
    }
    formatBranchNumber(branchCount) {
        if(branchCount != null){

            let count = branchCount;

            if (count < 100) {
                return `00${count}`;
            } else if (count >= 100 && count < 1000) {
                return `0${count}`;
            } else {
                return `${count}`;
            }
        }
    }

    showModalAndRefresh() {
        this.showModal = true;
        setTimeout(() => {
            this.showModal = false;
            refreshApex(this.branchData);
        }, 2000);
    }



    //get null 
    get hasContact() {
        return this.Contact !== null && this.Contact !== undefined && this.Contact.trim() !== '';
    }
    get hasCombinedAddress() {
        // Return true if at least one part is present
        return ![
            this.postalCode,
            this.prefectures,
            this.municipalities,
            this.streetAddress,
            this.buildingName
        ].every(part => !part || part.trim() === '');
    }
    get hasVehicles() {
        return Array.isArray(this.vehicle) && this.vehicle.length > 0;
    }
    get hasUsers() {
        return Array.isArray(this.contacts) && this.contacts.length > 0;
    }
    get hasPostalAddress() {
        return this.postalCode !== null && this.postalCode !== undefined;
    }


    handlevehChange(event){
        event.stopPropagation();
        this.showlist = !this.showlist;
        if (this.vehicles.length === 0) {
            this.showlist = false;
        }
    }
    handleConChange(event){
        event.stopPropagation();
        this.showList = !this.showList;
        if (this.optcontacts.length === 0) {
            this.showList = false;
        }
    }

    handleInsideClick(event) {
        event.stopPropagation();
    }



    get hasContacts() {
        return this.contacts.length > 0 || this.moreContacts.length > 0;
    }

    get hasVehicles() {
        return this.vehicle.length > 0 || this.morevehicles.length > 0;
    }

    @wire(getNullVehicles,{branchId: '$branchId'}) wiredVehicles({ data, error }) {
        if (data) {
              // Create a Set of existing vehicle IDs for quick lookup
              this.vehicles = data.map(vehicle => {
                return { label: vehicle.Name, value: vehicle.Id };
            });
            console.log("newv",data);

        // Debug logs
        } else if (error) {
            console.error(error);
        }
    }
    @wire(UserList,{branchId: '$branchId'}) wiredUsers({ data, error }) {
        if (data) {
            this.optcontacts = data.map(contact => {
                return { label: contact.Name, value: contact.Id };
            });

        } else if (error) {
            console.error(error);
        }
    }
   
    connectedCallback() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        this.template.host.style.setProperty('--dropdown-icon', `url(${this.imgdrop})`);
        requestAnimationFrame(() => {
            this.addCustomStyles();
        });
       
        this.showSpinner = true;
        loadStyle(this, pureCss)
        .then(() => {
            console.log('Pure CSS loaded successfully');
        })
        .catch(error => {
            console.error('Error loading Pure CSS', error);
        });
    }
    handleOutsideClick = (event) => {
        const dataDropElement = this.template.querySelector('.dataDrop');
        const listsElement = this.template.querySelector('.lists');
        
        if (
            dataDropElement &&
            !dataDropElement.contains(event.target) &&
            listsElement &&
            !listsElement.contains(event.target)
        ) {
            this.showlist = false;
        }
    };
    handleOutsideClick2 = (event) => {
        const dataDropElement = this.template.querySelector('.dataDrop2');
        const listsElement = this.template.querySelector('.lists2');
        
        if (
            dataDropElement &&
            !dataDropElement.contains(event.target) &&
            listsElement &&
            !listsElement.contains(event.target)
        ) {
            this.showList = false;
        }
    };
   
    renderedCallback() {
        if (!this.outsideClickHandlerAdded) {
            document.addEventListener('click', this.handleOutsideClick.bind(this));
            document.addEventListener('click', this.handleOutsideClick2.bind(this));
            this.outsideClickHandlerAdded = true;
        }
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }

    handleChange() {
             refreshApex(this.branchData);
            this.showDetails = !this.showDetails;
            
    }

    handleDeleteVehicle(event) {
        const vehicleId = event.currentTarget.dataset.id;

    const deletedVehicleFromVehicleArray = this.vehicle.find(veh => veh.Id === vehicleId);
    if (deletedVehicleFromVehicleArray) {
        this.vehicles = [...this.vehicles, { label: deletedVehicleFromVehicleArray.Name, value: deletedVehicleFromVehicleArray.Id }];
    }

    const deletedVehicleFromMoreVehiclesArray = this.morevehicles.find(veh => veh.Id === vehicleId);
    if (deletedVehicleFromMoreVehiclesArray && !deletedVehicleFromVehicleArray) {
        this.vehicles = [...this.vehicles, { label: deletedVehicleFromMoreVehiclesArray.Name, value: deletedVehicleFromMoreVehiclesArray.Id }];
    }

    this.deletedVehicleIds.push(vehicleId);

    this.vehicle = this.vehicle.filter(veh => veh.Id !== vehicleId);
    this.morevehicles = this.morevehicles.filter(veh => veh.Id !== vehicleId);
    this.selectedVehicleId = '';


    }

    //on clicking on cross button in contacts div in edit page
    handleDeleteContact(event) {
        const contactId = event.currentTarget.dataset.id;

        const deletedContactFromContactsArray = this.contacts.find(contact => contact.Id === contactId);
        if (deletedContactFromContactsArray) {
            this.optcontacts = [...this.optcontacts, { label: deletedContactFromContactsArray.Name, value: deletedContactFromContactsArray.Id }];
        }
    
        const deletedContactFromMoreContactsArray = this.moreContacts.find(contact => contact.Id === contactId);
        if (deletedContactFromMoreContactsArray && !deletedContactFromContactsArray) {
            this.optcontacts = [...this.optcontacts, { label: deletedContactFromMoreContactsArray.Name, value: deletedContactFromMoreContactsArray.Id }];
        }
    
        this.deletedContactIds.push(contactId);
    
        this.contacts = this.contacts.filter(contact => contact.Id !== contactId);
        this.moreContacts = this.moreContacts.filter(contact => contact.Id !== contactId);
    
        this.selectedContactId = ''; 
    }

    callbranchDelete(){
        this.main = false;
        this.showsure = false;
        window.scrollTo(0, 0);
    }

    checkAndDeleteBranch() {
        if (this.vehicle.length === 0 && this.contacts.length === 0) {
            this.showSpinner = true;
            this.showsure = false;
            this.deletebranch();
        } else {
            this.callbranchDelete();
        }
    }


 //on Saving the data on edit page
   async handleSave(event) {
    try {
        const branchInput = this.template.querySelector('input[name="branch"]');
        
        const phoneInput = this.template.querySelector('input[name="contactNumber"]');
        let allValid = true;

        const onlyHalfWidthNumber = /^[0-9]*$/;
        const fullWidthDigitsRegex = /[０-９]/;
        // Validate the branch input
        if (!branchInput.value) {
            branchInput.classList.add('invalid-input');
            window.scrollTo(0,0);
           // branchInput.setCustomValidity('この項目は必須です');
            // branchInput.reportValidity();
            this.showerrorbranchNull = true;
            this.showerrorbranch = false;
            allValid = false;
        } else if (branchInput.value.length > 24) {
            branchInput.classList.add('invalid-input');
            window.scrollTo(0,0);
            // branchInput.setCustomValidity('ブランチ名は20文字以内でなければなりません');
            // branchInput.reportValidity();
            this.showerrorbranch = true;
            this.showerrorbranchNull = false;
            allValid = false;
        } 
        else if (phoneInput.value.length > 0 && !onlyHalfWidthNumber.test(phoneInput.value) && fullWidthDigitsRegex.test(phoneInput.value)) {
            allValid = false;
            phoneInput.classList.add('invalid-input');
            this.fullwidthnum = true;
        }
        else {
            branchInput.classList.remove('invalid-input');
            phoneInput.classList.remove('invalid-input');
            // branchInput.setCustomValidity('');
            // branchInput.reportValidity();
            this.showerrorbranch = false;
            this.fullwidthnum = false;
            this.showerrorbranchNull = false;
        }
            // if (this.Contact.length !== 0 && this.Contact.length < 10) {
            //     const contactInput = this.template.querySelector('input[name="contactNumber"]');
            //     contactInput.classList.add('invalid-input');
            //     contactInput.setCustomValidity('連絡先番号は正確に 10 桁である必要があります');
            //     contactInput.reportValidity();
            //     allValid = false;
            // } else {
            //     const contactInput = this.template.querySelector('input[name="contactNumber"]');
            //     contactInput.classList.remove('invalid-input');
            //     contactInput.setCustomValidity('');
            //     contactInput.reportValidity();
            // }

            if (!allValid) {
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         //title: 'Error',
                //         message: 'すべての項目を入力してください。',
                //         variant: 'error',
                //     }),
                // );
                return;
            }
            
        const actions = [];
        if (this.deletedVehicleIds.length > 0) {
            actions.push(deleteVehicles({ vehicles: this.deletedVehicleIds, branchId: this.branchId}));
        }

        if (this.deletedContactIds.length > 0) {
            actions.push(deleteUser({ Contact: this.deletedContactIds, branchId: this.branchId}));
        }

        if (actions.length > 0) {
            Promise.all(actions);
        }

        if (this.morevehicles.length > 0) {
            const vehicleIdsToAdd = this.morevehicles.map(vehicle => vehicle.Id);
            actions.push(AddVehicle({ vehicles: vehicleIdsToAdd, branch: this.branchId }));
        }

        if (this.moreContacts.length > 0) {
            const ContactIdsToAdd = this.moreContacts.map(vehicle => vehicle.Id);
            actions.push(AddUser({ Contact: ContactIdsToAdd, branch: this.branchId }));
        }


        if (
            this.branchName !== this.originalBranchName ||
            this.Address !== this.originalAddress ||
            this.Contact !== this.originalContact ||
            this.municipalities !== this.originalMunicipalities ||
            this.streetAddress !== this.originalStreetAddress ||
            this.buildingName !== this.originalBuildingName ||
            this.prefectures !== this.originalPrefecture ||
            this.postalCode !== this.originalPostalCode
        ) {
            actions.push(UpdateFields({
                branchId: this.branchId,
                branchName: this.branchName,
                contactNo: this.Contact,
                postalCode: this.postalCode,
                Prefecture: this.prefectures,
                municipalities: this.municipalities,
                streetAddress: this.streetAddress,
                BuldingName: this.buildingName
            }));
        }
        if (actions.length > 0) {
            console.log('Actions length:', actions.length);
            await Promise.all(actions);
            console.log("success in edit");
            // this.dispatchEvent(
            //     new ShowToastEvent({
            //        // title: 'Success',
            //         message: '所属管理の編集が保存しました。',
            //         variant: 'success',
            //     }),
            // );
            this.goTodetail();
            this.moreContacts = [];
            this.morevehicles = [];
            this.showModalAndRefresh();
        } else {
            console.log("going");
            this.dispatchEvent(
                new ShowToastEvent({
                    //title: 'No Changes',
                    message: '保存する変更はありません',
                    variant: 'info',

                }),
            );
            this.goTodetail(); 
        }

    } catch (error) {
        this.dispatchEvent(
            new ShowToastEvent({
               // title: 'Error',
               message: error.body ? `${error.body.message}` : '変更を保存できませんでした',
               variant: 'error',
            }),
        );
    }
    }
    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
    }
    get filteredVehicles() {
        if (!this.searchTerm) {
            return this.vehicles;
        }
        const filtered = this.vehicles.filter(veh => {
            return veh.label.toLowerCase().includes(this.searchTerm.toLowerCase());
        });
        if (filtered.length === 0) {
            return [{ label: '見つかりません', value: 'no_results' }];
        }
        return filtered;
    }

    searchTermCon;
    handleSearchCon(event) {
        this.searchTermCon = event.target.value.toLowerCase();
    }
    get filteredContacts() {
        if (!this.searchTermCon) {
            return this.optcontacts;
        }
        const filtered = this.optcontacts.filter(contact => {
            return contact.label.toLowerCase().includes(this.searchTermCon.toLowerCase());
        });
        if (filtered.length === 0) {
            return [{ label: '見つかりません', value: 'no_results' }];
        }
        return filtered;
    }

     //on adding of vehicles 
    handleVehicleSelect(event) {
        this.selectedVehicleId = event.currentTarget.dataset.id;
        this.handleVehicleChange();
    
    }
    closeList(){
        this.showlist = false;
    }
    suremodal(){
        this.showsure = true;
    }
    closesure(){
        this.showsure = false;
    }

       
     handleVehicleChange() {
        let selectedVehicle = '';
        for (let i = 0; i < this.vehicles.length; i++) {
            if (this.vehicles[i].value === this.selectedVehicleId) {
                selectedVehicle = this.vehicles[i];
                this.vehicles = this.vehicles.filter(veh => veh.value !== this.selectedVehicleId);
                break;
            }
        }
        if (selectedVehicle) {
            this.morevehicles.push({ Id: selectedVehicle.value, Name: selectedVehicle.label });
             }
            this.selectedVehicleId = null; 
            if (this.vehicles.length === 0) {
                this.showlist = false;
            }
        
    }
     //on adding of contacts
    handleContactSelect(event) {
        this.selectedContactId = event.currentTarget.dataset.id;
        this.handleContactChange();
    
    }
    handleContactChange() {
        let selectedContact = '';
    for (let i = 0; i < this.optcontacts.length; i++) {
        if (this.optcontacts[i].value === this.selectedContactId) {
            selectedContact = this.optcontacts[i];
            this.optcontacts.splice(i, 1);
            break;
        }
    }
    if (selectedContact) {
        this.moreContacts.push({ Id: selectedContact.value, Name: selectedContact.label });
    }
    this.selectedContactId = null;
    if (this.optcontacts.length === 0) {
        this.showList = false;
    }     
    }

    //for edit page Inputs 
    handleBranchChange(event) {
        this.branchName = event.target.value;
        
        //this.branchNameClass = this.branchName ? '' : 'invalid-input';@not used but in future if need
        console.log("1br",this.branchName);
    }
    // handleAddressChange(event) {
    //     this.Address = event.target.value;
    //    // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
    //     console.log("2br",this.Address);
    // }
    handlevalidationpostal(event) {
        this.postalCode= event.target.value;
       // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
        if (this.postalCode.length > 8) {
             this.postalCode = this.postalCode.slice(0, 8);
        } 
    }
    onInputValidationAll(event) {
        if (event.target.value.length > 12) {
            value = value.slice(0, 12);
        } 
    } 
    
    

    handlePrefectureChange(event) {
        this.prefectures = event.target.value;
       // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
    }
    handlemunicipalitiesChange(event) {
        this.municipalities = event.target.value;
       // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
    }
    handleStreetChange(event) {
        this.streetAddress = event.target.value;
       // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
        
    }
    handlebuildingChange(event) {
        this.buildingName = event.target.value;
       // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
    }

    closesystem(){
        this.main = true;
        window.scrollTo(0, 0);
    }
    
    
    handleContactNoChange(event) {
        this.Contact = event.target.value;
    //    // this.contactClass = this.Contact ? '' : 'invalid-input'; @not used but in future if need
    //     //console.log("3br",this.Contact);
    //     const input = event.target.value;
    //     const numericValue = input.replace(/\D/g, ''); // Remove non-numeric characters
    
    //     if (numericValue.length <= 11) {
    //         this.Contact = numericValue;
    //         this.contactClass = this.Contact ? '' : 'invalid-input';
    //         console.log("Contact:", this.Contact);
    //     } else {
    //         this.Contact = numericValue.slice(0, 11);
    //         this.contactClass = this.Contact ? '' : 'invalid-input';
    //         console.log("Contact (truncated):", this.Contact);
    //     }
        const input = event.target;
        const cleanedPhone = input.value.replace(/[^\d０-９]/g, '').slice(0, 11);
        this.Contact = cleanedPhone; 
    }

    //contact input validation
    handleInput(event) {
        // const input = event.target;
        // input.value = input.value.replace(/\D/g, '').slice(0, 11);
        const input = event.target;
        input.value = input.value.replace(/[^\d０-９]/g, '').slice(0, 11);
        this.Contact = input.value; 
    }

    //function to redirect to branch page
    goToMain(){
        let baseUrl = window.location.href;
    if(baseUrl.indexOf("/s/") !== -1) {
        let addBranchUrl = baseUrl.split("/s/")[0] + "/s/branchmangement";
        window.location.href = addBranchUrl;
    }
    }
   
    //going to detail page
    goTodetail(){
        this.showDetails = !this.showDetails;
        window.scrollTo(0, 0);
    }

    //on deleting the branch(Whole branch removed)
    deletebranch(){
        deletebranch({ branchId: this.branchId })
        .then(() => {
            try {
                this.showSpinner = false;
                this.goToMain();
                this.dispatchEvent(
                    new ShowToastEvent({
                        //title: 'Success',
                        message: 'ブランチが正常に削除されました',
                        variant: 'success',
                    })
                );
            } catch (error) {
                this.showSpinner = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        //title: 'Error',
                        message: 'ブランチの削除中にエラーが発生しました:' + error.message,
                        variant: 'error',
                    })
                );
            }
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    //title: 'Error',
                    message: 'ブランチの削除中にエラーが発生しました:' + error.body.message,
                    variant: 'error',
                })
            );
        });
    }


    handleSelectionChange(event) {
        const vehicleId = event.target.value;
        const isSelected = event.target.checked;

        this.vehicles = this.vehicles.map(vehicle => {
            if (vehicle.value === vehicleId) {
                return { ...vehicle, selected: isSelected };
            }
            return vehicle;
        });

        this.updateSelectedLabels();
    }

    updateSelectedLabels() {
        this.selectedLabels = this.vehicles
            .filter(vehicle => vehicle.selected)
            .map(vehicle => vehicle.label)
            .join(', ');
    }

    saveSelections() {
        this.updateSelectedLabels();
        this.toggleDropdown();
    }
    handleCancel(){
        this.showCancelModal = true;
    }
    handleNo(){
        this.showCancelModal = false;
    }
    handleYes(){
        this.branchName = '';
        this.postalCode = '';
        this.Contact = '';
        this.prefectures = '';
        this.municipalities = '';
        this.streetAddress = '';
        this.buildingName = '';
        this.morevehicles.forEach(morevehicle => {
            this.vehicles.push({ label: morevehicle.Name, value: morevehicle.Id });
        });
        this.morevehicles = [];
        this.moreContacts.forEach(morevehicle => {
            this.optcontacts.push({ label: morevehicle.Name, value: morevehicle.Id });
        });
        this.moreContacts = [];
        this.originalVehicle.forEach(originalVehicle => {
            const isVehicleInList = this.vehicle.some(vehicle => vehicle.Id === originalVehicle.Id && vehicle.Name === originalVehicle.Name);
            if (!isVehicleInList) {
                this.vehicle.push({ Name: originalVehicle.Name, Id: originalVehicle.Id });
            }
        });
        
        this.originalContacts.forEach(originalContact => {
            const isContactInList = this.contacts.some(contact => contact.Id === originalContact.Id && contact.Name === originalContact.Name);
            if (!isContactInList) {
                this.contacts.push({ Name: originalContact.Name, Id: originalContact.Id });
            }
        });

        this.compareAndRemoveCommonValues();
       
        this.branchName = this.originalBranchName ? this.originalBranchName : null;
        this.Contact = this.OriginalContact ? this.OriginalContact : null;
        this.postalCode = this.originalPostalCode ? this.originalPostalCode : null;
        this.prefectures = this.originalPrefecture ? this.originalPrefecture : null;
        this.municipalities = this.originalMunicipalities ? this.originalMunicipalities : null;
        this.streetAddress = this.originalStreetAddress ? this.originalStreetAddress : null;
        this.buildingName = this.originalBuildingName ? this.originalBuildingName : null;
        this.showCancelModal = false;
        this.showerrorbranch = false;
        this.showerrorbranchNull = false;
        this.showDetails = true;  
    }

    compareAndRemoveCommonValues() {
        const filteredVehicles = [];
        const filteredContacts = [];

        // Filter vehicles by checking against optcontacts
        for (let vehicle of this.vehicles) {
            let isCommon = false;
            for (let contact of this.vehicle) {
                if (vehicle.label === contact.Name && vehicle.value === contact.Id) {
                    isCommon = true;
                    break;
                }
            }
            if (!isCommon) {
                filteredVehicles.push(vehicle);
            }
        }

        // Filter optcontacts by checking against vehicles
        for (let contact of this.optcontacts) {
            let isCommon = false;
            for (let vehicles of this.contacts) {
                if (contact.label === vehicles.Name && contact.value === vehicles.Id) {
                    isCommon = true;
                    break;
                }
            }
            if (!isCommon) {
                filteredContacts.push(contact);
            }
        }

        // Update the arrays with filtered data
        this.vehicles = filteredVehicles;
        this.optcontacts = filteredContacts;
    }

    //validations
}
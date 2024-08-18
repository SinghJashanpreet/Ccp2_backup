import { LightningElement, track, wire } from 'lwc';
import Vehicle_StaticResource from '@salesforce/resourceUrl/CCP_StaticResource_Vehicle';
import getVehicleWithoutAssociation from '@salesforce/apex/CCP2_userData.VehicleWithoutAssociation';
import getUsersWithoutAssociation from '@salesforce/apex/CCP2_userData.userList';
import AddBranch from '@salesforce/apex/CCP2_branchController.createBranch';
import checkBranch from '@salesforce/apex/CCP2_branchController.checkBranch';
import getAccount from '@salesforce/apex/CCP2_userData.accountDetails';
import Img1 from '@salesforce/resourceUrl/ccp2HeaderImg1';
import Img2 from '@salesforce/resourceUrl/ccp2HeaderImg2';
import Img3 from '@salesforce/resourceUrl/ccp2HeaderImg3';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord,getFieldValue } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import ACCOUNT_ID_FIELD  from '@salesforce/schema/User.AccountId';
const  arrowicon = Vehicle_StaticResource + '/CCP_StaticResource_Vehicle/images/arrow_under.png';

import CCP2_PleaseEnterBasicInfo from '@salesforce/label/c.CCP2_PleaseEnterBasicInfo';
import CCP2_OnlyOneBranchCanBeAdded from '@salesforce/label/c.CCP2_OnlyOneBranchCanBeAdded';
import CCP2_CompanyName from '@salesforce/label/c.CCP2_CompanyName';
import CCP2_BranchName from '@salesforce/label/c.CCP2_BranchName';
import CCP2_Required from '@salesforce/label/c.CCP2_Required';
import CCP2_Address from '@salesforce/label/c.CCP2_Address';
import CCP2_AffiliatedVehicles from '@salesforce/label/c.CCP2_AffiliatedVehicles';
import CCP2_SelectVehicles from '@salesforce/label/c.CCP2_SelectVehicles';
import CCP2_AffiliatedUsers from '@salesforce/label/c.CCP2_AffiliatedUsers';
import CCP2_ContactDetails from '@salesforce/label/c.CCP2_ContactDetails';
import CCP2_PleaseEnterPhoneNumber from '@salesforce/label/c.CCP2_PleaseEnterPhoneNumber';
import CCP2_TelephoneNumber from '@salesforce/label/c.CCP2_TelephoneNumber';
import CCP2_MobileNumber from '@salesforce/label/c.CCP2_MobileNumber';
import CCP2_AgreeToTerms from '@salesforce/label/c.CCP2_AgreeToTerms';
import CCP2_AgreeToDataProtection from '@salesforce/label/c.CCP2_AgreeToDataProtection';
import CCP2_Next from '@salesforce/label/c.CCP2_Next';
import CCP2_ConfirmDetails from '@salesforce/label/c.CCP2_ConfirmDetails';
import CCP2_Modify from '@salesforce/label/c.CCP2_Modify';
import CCP2_BackToBranchManagement from '@salesforce/label/c.CCP2_BackToBranchManagement';
import CCP2_WIthoutHyphen from '@salesforce/label/c.CCP2_WIthoutHyphen';
import CCP2_AddWorkLocation from '@salesforce/label/c.CCP2_AddWorkLocation';
import CCP2_AddBranch from '@salesforce/label/c.CCP2_AddBranch';
import CCP2_BranchAddCompleted from '@salesforce/label/c.CCP2_BranchAddCompleted';
import CCP2_AssignVehicleRelevant from '@salesforce/label/c.CCP2_AssignVehicleRelevant';
import CCP2_AssignMemberRelevant from '@salesforce/label/c.CCP2_AssignMemberRelevant';
import CCP2_PleaseSelect from '@salesforce/label/c.CCP2_PleaseSelect';
import CCP2_PleaseEnter from '@salesforce/label/c.CCP2_PleaseEnter';
import CCP2_BranchAdded from '@salesforce/label/c.CCP2_BranchAdded';
import CCP2_SelectedVehicle from '@salesforce/label/c.CCP2_SelectedVehicle';
import CCP2_SelectedMembers from '@salesforce/label/c.CCP2_SelectedMembers';
 


const BACKGROUND_IMAGE_PC = Vehicle_StaticResource + '/CCP_StaticResource_Vehicle/images/Main_Background.png';

export default class Ccp2AddBranchForm extends LightningElement {
    labels = {
        CCP2_PleaseEnterBasicInfo: CCP2_PleaseEnterBasicInfo,
        CCP2_OnlyOneBranchCanBeAdded: CCP2_OnlyOneBranchCanBeAdded,
        CCP2_CompanyName: CCP2_CompanyName,
        CCP2_BranchName: CCP2_BranchName,
        CCP2_Required: CCP2_Required,
        CCP2_Address: CCP2_Address,
        CCP2_AffiliatedVehicles: CCP2_AffiliatedVehicles,
        CCP2_SelectVehicles: CCP2_SelectVehicles,
        CCP2_AffiliatedUsers: CCP2_AffiliatedUsers,
        CCP2_ContactDetails: CCP2_ContactDetails,
        CCP2_PleaseEnterPhoneNumber: CCP2_PleaseEnterPhoneNumber,
        CCP2_TelephoneNumber: CCP2_TelephoneNumber,
        CCP2_MobileNumber: CCP2_MobileNumber,
        CCP2_AgreeToTerms: CCP2_AgreeToTerms,
        CCP2_AgreeToDataProtection: CCP2_AgreeToDataProtection,
        CCP2_Next: CCP2_Next,
        CCP2_ConfirmDetails: CCP2_ConfirmDetails,
        CCP2_Modify: CCP2_Modify,
        CCP2_BackToBranchManagement: CCP2_BackToBranchManagement,
        CCP2_WIthoutHyphen: CCP2_WIthoutHyphen,
        CCP2_AddWorkLocation: CCP2_AddWorkLocation,
        CCP2_AddBranch: CCP2_AddBranch,
        CCP2_BranchAddCompleted: CCP2_BranchAddCompleted,
        CCP2_AssignVehicleRelevant: CCP2_AssignVehicleRelevant,
        CCP2_AssignMemberRelevant:CCP2_AssignMemberRelevant,
        CCP2_PleaseSelect: CCP2_PleaseSelect,
        CCP2_PleaseEnter: CCP2_PleaseEnter,
        CCP2_BranchAdded: CCP2_BranchAdded,
        CCP2_SelectedVehicle: CCP2_SelectedVehicle,
        CCP2_SelectedMembers: CCP2_SelectedMembers

    };

    imgdrop = arrowicon;
    backgroundImagePC = BACKGROUND_IMAGE_PC;
    Image1 = Img1;
    Image2 = Img2;
    Image3 = Img3;
    @track Step1 = true;
    @track Step2 = false;
    @track Step3 = false;
    @track currentStep = 1; 
    @track callMain = false;
    @track addbranchpage = true;
    @track showList = false;
    @track showListUser = false;
    @track companyName = ''; 
    @track alreadybranch = false;
    @track fullwidthnum = false;
    // @track branchId = '';
    @track branchName = '';
    @track selectedVehicle = '';
    @track selectedUser = '';
    @track address = '';
    @track phone = '';
    @track fax = '';
    @track termsService = false;
    @track termsAgree = false;
    @track deletedVehicleIds = [];
    @track vehicles = []; 
    @track morevehicles = [];
    @track selectedVehicleId; // Selected vehicle Id
    @track users = []; // Array to hold users for combobox
    @track moreusers = [];// Selected user Id
    @track selectedUserId;
    @track showCancelModal = false;
    branchError = false;
    branchErrorText;
    @track showerrorbranch = false;
    @track showerrorbranchNull = false;

    @track isNextDisabled = true;
    searchTerm = '';
    outsideClickHandlerAdded = false;
    @track postalCode = '';
    @track prefectures = '';
    @track municipalities = '';
    @track streetAddress = '';
    @track buildingName = '';
    @track AccountName = '';
    @track BranchNumber = '';
    // Initialize combinedAddress
    @track combinedAddress = '';
    @track siebelCode = ''; 
    @track branchnosend = '';
    @track DisplayNumber = '';
  
    
    connectedCallback() {
       
 this.template.host.style.setProperty('--dropdown-icon', `url(${this.imgdrop})`);
        this.loadVehicles();
        this.loadUsers();

    }
    userId = USER_ID;
    accountId;

    @wire(getRecord, {
        recordId: '$userId',
        fields: [ACCOUNT_ID_FIELD]
    })
    userRecord({ error, data }) {
        if (data) {
            this.accountId = getFieldValue(data, ACCOUNT_ID_FIELD);
        } else if (error) {
            console.error('Error fetching user record:', error);
        }
    }
    get hasPostalAddress() {
        return this.postalCode !== null && this.postalCode !== undefined;
    }
   

    @wire(getAccount)loadaccount({data,error}){
        if(data){
            console.log("mydata",data);
            this.AccountName = data[0].Name;
            this.siebelCode = data[0].siebelAccountCode__c;
            this.BranchNumber =data[0].Current_Branch_Code__c;
            this.formatdata();
        }else if(error){
            console.log(error);
        }
    }
    
    formatdata() {
        this.BranchNumber += 1;

        let branchNumbertosend = this.BranchNumber.toString();
        if (this.BranchNumber < 10) {
            branchNumbertosend = "00" + branchNumbertosend;
        } else if (this.BranchNumber < 100) {
            branchNumbertosend = "0" + branchNumbertosend;
        }
        this.branchnosend = branchNumbertosend;
        console.log("branchnotosend",JSON.stringify(this.branchnosend));
    
       
    
      
        this.DisplayNumber = this.siebelCode + ' - ' + this.branchnosend;
        console.log("result",JSON.stringify(this.DisplayNumber)); // For debugging purposes
        return result; // If you need to use the result elsewhere
        
    }

   @wire(getVehicleWithoutAssociation)
    loadVehicles(data,error) {

        getVehicleWithoutAssociation()
            .then(result => {
                this.vehicles = result.map(vehicle => ({
                    label: vehicle.Name,
                    value: vehicle.Id
                }));

            })
            .catch(error => {
                console.error('Error fetching vehicles:', error);
            });
    }
    loadUsers() {
        getUsersWithoutAssociation()
            .then(result => {
                this.users = result.map(user => ({
                    label: user.Name,
                    value: user.Id
                }));
                console.log(JSON)
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    }
    openlist(event){
        event.stopPropagation();
        this.showList = !this.showList;
        if(this.vehicles.length === 0){
            this.showList = false;
          }

    }
    openlistUser(event){
        event.stopPropagation();
        this.showListUser = !this.showListUser;
        if(this.users.length === 0){
            this.showListUser = false;
        }
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
            if(this.vehicles.length === 0){
                this.showList = false;
              }

       
    }

    handleUserChange() {
        
        let selectedUser = '';
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].value === this.selectedUserId) {
                selectedUser = this.users[i];
                this.users = this.users.filter(memb => memb.value !== this.selectedUserId);
                
                break;
            }
        }

        if (selectedUser) {
            this.moreusers.push({ Id: selectedUser.value, Name: selectedUser.label });
        }

        this.selectedUserId = null;

        if(this.users.length === 0){
            this.showListUser = false;
        }
       
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


    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
    
  
    async handleNext() {

        // let branchList = this.template.querySelector('[name="branchss"]');
        // let prefectureList = this.template.querySelector('[name="prefucturesss"]');
        // let municipalitiesList = this.template.querySelector('[name="municipalitiesss"]');
        // let buildingList = this.template.querySelector('[name="buildingsss"]');

        try {
            const branchInput = this.template.querySelector('input[name="branchss"]');
            const phoneInput = this.template.querySelector('input[name="phone"]');

            let isValid = true;
            // const onlyNumber = /^[0-9]*$/;
            const onlyHalfWidthNumber = /^[0-9]*$/;
            const fullWidthDigitsRegex = /[０-９]/;
            // if (this.currentStep === 1) {
                
            //     this.showerrorbranch = false;
            //     this.showerrorbranchNull = false;
            //     this.alreadybranch = false;
            //     if (!branchInput.value) {
            //         branchInput.classList.add('invalid-input');
            //         // branchInput.setCustomValidity('この項目は必須です');
            //         // branchInput.reportValidity();
            //         this.showerrorbranchNull = true;
            //         this.showerrorbranch = false;
            //         window.scrollTo(0, 0);
            //         isValid = false;
            //     } else if (branchInput.value.length > 24) {
            //         branchInput.classList.add('invalid-input');
            //         // branchInput.setCustomValidity('ブランチ名は20文字以内でなければなりません');
            //         // branchInput.reportValidity();
            //         this.showerrorbranch = true;
            //         this.showerrorbranchNull = false;
            //         window.scrollTo(0, 0);
            //         isValid = false;
            //     }
            //     else if(phoneInput.value.length > 0 && !onlyHalfWidthNumber.test(phoneInput.value) && fullWidthDigitsRegex.test(phoneInput.value)){
            //         phoneInput.classList.add('invalid-input');
            //             this.fullwidthnum = true;
            //             isValid = false;
            //        }
            //     else if (branchInput.value) {
                    
            //         try {
            //             const result = await checkBranch({ accId: this.accountId, branchName: this.branchName });
            //             console.log("result branch name class", result);
            //         } 
            //         catch (error) {
            //             console.log('checkkkk name:', JSON.stringify(error));
            //             isValid = false;
            //             branchInput.classList.add('invalid-input');
            //             this.alreadybranch = true;
            //             window.scrollTo(0,0);
            //             this.dispatchEvent(
            //                 new ShowToastEvent({
            //                     message: error.body.message,
            //                     variant: 'error',
            //                 })
            //             );
            //             // return false;
            //         }
            //     }
               
                
            //     else {
            //         branchInput.classList.remove('invalid-input');
            //         console.log("in else branch remove classssss")
            //         // phoneInput.classList.remove('invalid-input');
            //         branchInput.setCustomValidity('');
            //         // branchInput.reportValidity();
            //         this.showerrorbranch = false;
            //         this.showerrorbranchNull = false;
            //         this.alreadybranch = false;
                    
            //         //    else{
            //         //     phoneInput.classList.remove('invalid-input');
            //         //     this.fullwidthnum = false;
            //         //    }
            //     }
            //     // else{
            //     //     phoneInput.classList.remove('invalid-input');
            //     //     this.fullwidthnum = false;
            //     // }
            //     // if (!this.branchName) {
            //     //     this.dispatchEvent(
            //     //         new ShowToastEvent({
            //     //             //title: 'Error',
            //     //             message: '所属名を入力してください',
            //     //             variant: 'error',
            //     //         })
            //     //     );
            //     //     //Please fill in branch name.
            //     //     // this.showToast('Error', '勤務地名を入力してください', 'error');
            //     //     return false; // Validation failed
            //     // }
    
            //     // if (phoneInput.value.length > 0 && !onlyHalfWidthNumber.test(phoneInput.value) && fullWidthDigitsRegex.test(phoneInput.value)) {
            //         // this.dispatchEvent(
            //         //     new ShowToastEvent({
            //         //         //title: 'Error',
            //         //         message: '有効な 10 桁の電話番号を入力してください.',
            //         //         variant: 'error',
            //         //     })
            //         // );
            //         // this.showToast('Error', 'Please enter a valid 10-digit phone number.', 'error');
            //         // return false; // Validation failed
            //     //     phoneInput.classList.add('invalid-input');
            //     //     this.fullwidthnum = true;
            //     //     isValid = false;
            //     // }// Validate branchName
            //         // if (!this.branchName) {
            //         //     branchList.className = "Inputs1 hello-class  form-input _error slds-form-element__control slds-input";
            //         //     this.branchError = true;
            //         //     this.branchErrorText = "24桁以内に入力してください";
            //         //     this.template.querySelector('.product-name').classList.add('error');

            //         //     return false; // Exit validation if there's an error
            //         // } else {
            //         //     this.branchErrorText = '';
            //         //     this.branchError = false;
            //         //     // Reset or modify classes as needed for valid state
            //         // }
                  
            // }
            if (this.currentStep === 1) {
                this.showerrorbranch = false;
                this.showerrorbranchNull = false;
                this.alreadybranch = false;
                this.fullwidthnum = false;
            
                // Validate branch input
                if (!branchInput.value) {
                    branchInput.classList.add('invalid-input');
                    this.showerrorbranchNull = true;
                    this.showerrorbranch = false;
                    window.scrollTo(0, 0);
                    isValid = false;
                } else if (branchInput.value.length > 24) {
                    branchInput.classList.add('invalid-input');
                    this.showerrorbranch = true;
                    this.showerrorbranchNull = false;
                    window.scrollTo(0, 0);
                    isValid = false;
                } else {
                    // Clear branch input errors if branch name is corrected
                    branchInput.classList.remove('invalid-input');
                    this.showerrorbranch = false;
                    this.showerrorbranchNull = false;
                    this.alreadybranch = false;
            
                    // Check branch availability if branch input is valid
                    try {
                        const result = await checkBranch({ accId: this.accountId, branchName: this.branchName });
                        console.log("result branch name class", result);
            
                        // Additional handling based on result can be done here
                    } catch (error) {
                        console.log('checkkkk name:', JSON.stringify(error));
                        isValid = false;
                        branchInput.classList.add('invalid-input');
                        this.alreadybranch = true;
                        window.scrollTo(0, 0);
                        this.dispatchEvent(
                            new ShowToastEvent({
                                message: error.body.message,
                                variant: 'error',
                            })
                        );
                        return; 
                    }
                }
            
                // Validate phone input after branch input validation
                if (phoneInput.value.length > 0 && !onlyHalfWidthNumber.test(phoneInput.value) && fullWidthDigitsRegex.test(phoneInput.value)) {
                    phoneInput.classList.add('invalid-input');
                    this.fullwidthnum = true;
                    isValid = false;
                } else {
                    // Clear phone input errors if phone number is corrected
                    phoneInput.classList.remove('invalid-input');
                    this.fullwidthnum = false;
                }
            
                // Scroll to the top if there are any errors
                if (!isValid) {
                    window.scrollTo(0, 0);
                }
            }
            
            
            // if (phoneInput.value.length > 0 && !onlyHalfWidthNumber.test(phoneInput.value) && fullWidthDigitsRegex.test(phoneInput.value)) {
            //     isValid = false;
            //     phoneInput.classList.add('invalid-input');
            //     this.fullwidthnum = true;
            // }else{
            //     console.log("elseeeeeee ")
            // }
            if (isValid) {
                this.Step1 = false;
                this.Step2 = true;
                this.currentStep = 2;
                this.showerrorbranch = false;
                this.showerrorbranchNull = false;
                this.alreadybranch = false;
            }
        } catch (error) {
           console.log(error);
        }
        
    }   
    

    validateBranchName() {
        if (!this.branchName) {
            this.template.querySelector('.product-name').classList.add('error');
        } else {
            this.template.querySelector('.product-name').classList.remove('error');
        }
    }

    handlePrevious() {
        if (this.currentStep === 2) {
            // Move back to Step 1
            this.Step1 = true;
            this.Step2 = false;
            this.currentStep = 1;
        } else if (this.currentStep === 3) {
            // Move back to Step 2
            this.Step2 = true;
            this.Step3 = false;
            this.currentStep = 2;
        }
    }

    handleInput(event){
        // const input = event.target;
        // input.value = input.value.replace(/\D/g, '').slice(0, 16); 
        // this.validatePhone(input.value);
        const input = event.target;
    input.value = input.value.replace(/[^\d０-９]/g, '').slice(0, 11);
    this.phone = input.value; 
    }
 


    handle2Next() {
        
        let vehicleIds = this.morevehicles.map(vehicle => vehicle.Id);
        console.log("map",JSON.stringify(vehicleIds));
        console.log("veh",JSON.stringify(this.morevehicles));

        let contactIds = this.moreusers.map(user => user.Id);

        let branchNumberAsInt = parseInt(this.branchnosend, 10); 

     let params = {
        vehicleIds: vehicleIds,
        contactIds: contactIds,
        accId: this.accountId,
        branchName: this.branchName,
        telephoneNo: this.phone,
        cellPhoneNo: this.fax,
        companyName: this.AccountName,
        BranchNO: branchNumberAsInt,
        postalCode: this.postalCode,
        Prefecture: this.prefectures,
        municipalities: this.municipalities,
        streetAddress: this.streetAddress,
        BuldingName: this.buildingName
    };
    console.log(JSON.stringify(params));

    AddBranch(params)
        .then(result => {
            console.log('Record inserted successfully:', result);
            // this.dispatchEvent(
            //     new ShowToastEvent({
            //         //title: 'Success', Branch is added Successfully
            //         message: '親所属が登録完了しました。',
            //         variant: 'success',
            //     })
            // );
            // this.showToast('Success', '新規勤務地が追加されました。', 'success');
            this.Step2 = false;
            this.Step3 = true;
            this.currentStep = 3;
        })
        .catch(error => {
            console.error('Error inserting branch record:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    //title: 'error',
                    message: 'ブランチレコードの挿入中にエラーが発生しました。もう一度試してください' + error.body.message,
                    variant: 'error',
                })
            );
            // this.showToast('Error', 'Error inserting branch record. Please try again.', 'error');
        });
    }



    handleCompanyNameChange(event) {
        console.log(this.companyName);
        this.companyName = event.target.value;
    }

    // handleBranchIdChange(event) {
    //     this.branchId = event.target.value;
    // }

    addressChange(event){
        this.address = event.target.value;

    }

    handleBranchNameChange(event) {
        this.branchName = event.target.value;
        console.log("branch name outside",this.branchName)
        const regexJapanese = /^[一-龠ぁ-ゔァ-ヴー々〆〤ヶ]*$/;
        let input = event.target.value;
    
        if (regexJapanese.test(input)) {
            if (input.length > 24) {
                // Truncate the input if it exceeds 24 characters
                input = input.slice(0, 24);
                event.target.value = input;
            }
            this.branchName = input;
            console.log("branch name inside if",this.branchName)
            this.errorMessage = '';
        } else {
            this.errorMessage = 'Invalid input: Only Japanese characters are allowed, and the length should be up to 24 characters.';
        }
    
        this.validateBranchName();
    }
    
    
    

   
    handlePhoneChange(event) {
        // const input = event.target;
        // // console.log("212wsw",input);
        // const cleanedPhone = input.value.replace(/\D/g, '').slice(0, 11); // Clean input to allow only digits and limit to 10 characters
        // this.phone = cleanedPhone; // Update phone number in component state
        // console.log("212wsw",cleanedPhone);
        const input = event.target;
    const cleanedPhone = input.value.replace(/[^\d０-９]/g, '').slice(0, 11);
    this.phone = cleanedPhone; 
    }
    

    

  
    
    check(){
        console.log("dofc",JSON.stringify(this.users));
        let contactIds = this.users.map(user => user.Id);
        console.log("con",JSON.stringify(contactIds));
        console.log("ds",JSON.stringify(this.selectedUserId));
    }
    handleSave(){
        this.goToMain();
       // Ensure morevehicles is an array of objects with Id field
    }

    goToMain(){
        let baseUrl = window.location.href;
    if(baseUrl.indexOf("/s/") !== -1) {
        let addBranchUrl = baseUrl.split("/s/")[0] + "/s/branchmangement";
        window.location.href = addBranchUrl;
    }
    }
    
    handleDeleteVehicle(event) {
      const vehicleId = event.currentTarget.dataset.id;

    const deletedVehicleFromMoreVehiclesArray = this.morevehicles.find(veh => veh.Id === vehicleId);

    this.deletedVehicleIds.push(vehicleId);

    this.morevehicles = this.morevehicles.filter(veh => veh.Id !== vehicleId);

    if (deletedVehicleFromMoreVehiclesArray) {
        this.vehicles = [...this.vehicles, { label: deletedVehicleFromMoreVehiclesArray.Name, value: deletedVehicleFromMoreVehiclesArray.Id }];

    }}

    handleDeleteUser(event) {
      

        const userId = event.currentTarget.dataset.id;

    const deletedUserFromMoreUsersArray = this.moreusers.find(memb => memb.Id === userId);

    this.deletedVehicleIds.push(userId);

    this.moreusers = this.moreusers.filter(memb => memb.Id !== userId);

    if (deletedUserFromMoreUsersArray) {
        this.users = [...this.users, { label: deletedUserFromMoreUsersArray.Name, value: deletedUserFromMoreUsersArray.Id }];

    }
}




validatePhone() {
    const phoneRegex = /^\d{11}$/;
    return phoneRegex.test(this.phone);
}


    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
    }
 
    get filteredVehicles() {
        if (!this.searchTerm) {
            return this.vehicles;
        }
        return this.vehicles.filter(veh => {
            return veh.Name.toLowerCase().includes(this.searchTerm);
        });
    }

    
    get filteredUsers() {
        if (!this.searchTerm) {
            return this.users;
        }
        return this.users.filter(memb => {
            return memb.Name.toLowerCase().includes(this.searchTerm);
        });
    }
    
    handleVehicleSelect(event) {
        this.selectedVehicleId = event.currentTarget.dataset.id;
        console.log("arrat",JSON.stringify(this.vehicles));
        this.handleVehicleChange();
    }

    handleUserSelect(event) {
        this.selectedUserId = event.currentTarget.dataset.id;
        console.log("arrat",JSON.stringify(this.users));
        this.handleUserChange();
    }
    

    handleOutsideClick = (event) => {
        const dataDropElement = this.template.querySelector('.Inputs1');
        const listsElement = this.template.querySelector('.lists');

        if (
            dataDropElement &&
            !dataDropElement.contains(event.target) &&
            listsElement &&
            !listsElement.contains(event.target)
        ) {
            this.showList = false;
            this.showListUser = false;
            console.log("Clicked outside");
        }
    };

    handleInsideClick(event) {
        event.stopPropagation();
    }
   
    renderedCallback() {
        if (!this.outsideClickHandlerAdded) {
            document.addEventListener('click', this.handleOutsideClick);
            this.outsideClickHandlerAdded = true;
        }
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick);
    }

    

    // Handle input change event
    handleInputChange(event) {
        const field = event.target.dataset.field;
        if (field === 'postalCode') {
            this.postalCode = event.target.value.trim();
        } else if (field === 'prefectures') {
            this.prefectures = event.target.value.trim();
        } else if (field === 'municipalities') {
            this.municipalities = event.target.value.trim();
        } else if (field === 'streetAddress') {
            this.streetAddress = event.target.value.trim();
        } else if (field === 'buildingName') {
            this.buildingName = event.target.value.trim();
        }

        // Update combined address
        this.updateCombinedAddress();
    }

    // Update combined address method
    updateCombinedAddress() {
        this.combinedAddress = `${this.postalCode} ${this.prefectures} ${this.municipalities} ${this.streetAddress} ${this.buildingName}`;
    }
    handleCancel(){
        this.showCancelModal = true;
    }
    handleNo(){
        this.showCancelModal = false;
        this.addbranchpage = true;
    }
    handleYes(){
        this.showCancelModal = false;
        this.addbranchpage = false;
        this.callMain = true;
    }
}
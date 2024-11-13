import { LightningElement,track,wire } from 'lwc';
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";

import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import getBasicInfo from '@salesforce/apex/CCP2_userController.userBasicInfo';

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

const dropdownImg =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";


export default class Ccp2_dtfsa extends LightningElement {
    backgroundImagePC = BACKGROUND_IMAGE_PC;
    dropdownImg = dropdownImg;
    userId = Id;
    contactId;

    outsideClickHandlerAdded = false;
    @track isDropdownOpen = false;
    @track isAccountSelected = true;
    @track isVehicleSelected = false;
    @track selectedCheckboxes = [];

    //start date and end date
    @track startDate;
    @track endDate;
    @track startMonthOptions = [];
    @track endMonthOptions = []; 
    @track isStartDropdownOpen = false;
    @track isEndDropdownOpen = false;
    @track endDisabled = false;

    //branch name error
    @track branchNameError = false;
    @track branchNameclass = "dropdown";

    @track registrationNum = "";
    @track contractNum = "";

    @track accountCheckboxes = [
        { label: 'ご契約一覧', isChecked: true, description: 'ご契約いただいた契約の簡易的な内容一覧' },
        { label: 'お支払集計表', isChecked: true, description: '発行月のおける契約の6か月間の引落予定表' },
        { label: '約定代金明細書', isChecked: true, description: '約定日に引落させていただく約定代金明細' },
        { label: 'お支払明細書', isChecked: true, description: '契約毎の約定お支払予定表' },
        { label: 'リース契約注記明細', isChecked: true, description: 'リース会計基準に基づく会計処理のための参考資料' },
        { label: '約定代金請求書(振込)', isChecked: true, description: '' }
    ];

    @track vehicleCheckboxes = [
        { label: 'ご契約一覧', isChecked: true, description: 'ご契約いただいた契約の簡易的な内容一覧' }
    ];

    userDetailData = {
        id: null,
        firstName: null,
        lastName: null,
        accountname: null,
        siebelAccountCode: null
    };

    @wire(getRecord, {
        recordId: '$userId',
        fields: [CONTACT_ID_FIELD]
    })
    userRecord({ error, data }) {
        if (data) {
            this.contactId = data.fields.ContactId.value;
            console.log('Contact ID adminnnnnnnn:', this.contactId);
        } else if (error) { 
            console.error('Error fetching user record:', error);
        }
    }

    @wire(getBasicInfo,{ContactId:'$contactId',refresh: 0})
    fetUserInfo({data,error}){
        if(data){
                this.userDetailData = {
                    accountname: data.AccountName == null ? '-' : data.AccountName,
                    firstName: data.FirstName == null ? '-' : data.FirstName,
                    lastName: data.LastName == null ? '-' : data.LastName,
                    siebelAccountCode: data.AccountSiebelAccountCode == null ? '-' : data.AccountSiebelAccountCode,
                    id: data.Id == null ? '-' : data.Id
                }
            
        }else if(error){
            console.log("error,userrrsss",error);
        }
    }

    connectedCallback(){
        this.generateMonthOptions();
        this.preselectCurrentMonth();
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap";
        link.rel = "stylesheet";
        this.template.host.style.setProperty(
            "--dropdown-icon",
            `url(${this.dropdownImg})`
          );
    }


    renderedCallback() {
        if (!this.outsideClickHandlerAdded) {
            document.addEventListener('click', this.handleOutsideClick.bind(this));
            document.addEventListener('click', this.handleOutsideClick2.bind(this));
            document.addEventListener('click', this.handleOutsideClick3.bind(this));
            this.outsideClickHandlerAdded = true;
        }
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
        document.removeEventListener('click', this.handleOutsideClick2.bind(this));
        document.removeEventListener('click', this.handleOutsideClick3.bind(this));
    }
    get isAllAccountsChecked() {
        return this.accountCheckboxes.every(item => item.isChecked);
    }


    get isAllVehiclesChecked() {
        return this.vehicleCheckboxes.every(item => item.isChecked);
    }


    get areAllSelected() {
        return this.isAllAccountsChecked && this.isAllVehiclesChecked;
    }

    get areanyselected(){
        return this.accountCheckboxes.some(item => item.isChecked) || this.vehicleCheckboxes.some(item => item.isChecked);
    }


    get selectedCount() {
        return this.selectedCheckboxes.length;
    }

    get accountButtonContainerClass() {
        return this.isAccountSelected ? 'border-right-red left-label-drop' : 'left-label-drop';
    }

    get vehicleButtonContainerClass() {
        return this.isVehicleSelected ? 'border-right-red left-label-drop' : 'left-label-drop';
    }


    toggleDropdown(event) {
        event.stopPropagation();
        this.isDropdownOpen = !this.isDropdownOpen;
        this.isStartDropdownOpen = false;
        this.isEndDropdownOpen = false;
        if (this.isDropdownOpen == true) {
            this.isAccountSelected = true;
            this.isVehicleSelected = false;
        }
    }

    handleAccountSelect(event) {
        event.stopPropagation();
        this.isAccountSelected = true;
        this.isVehicleSelected = false;
    }

    handleVehicleSelect(event) {
        event.stopPropagation();
        this.isAccountSelected = false;
        this.isVehicleSelected = true;
    }

    handleCheckboxChange(event) { 
        event.stopPropagation();
        const value = event.target.value;
        const isChecked = event.target.checked;

        if (event.target.name === 'account') {
            const checkbox = this.accountCheckboxes.find(item => item.label === value);
            checkbox.isChecked = isChecked;
        } else if (event.target.name === 'vehicle') {
            const checkbox = this.vehicleCheckboxes.find(item => item.label === value);
            checkbox.isChecked = isChecked;
        }

        this.updateSelectedCheckboxes();
    }

    handleSelectAllAccounts(event) {
        event.stopPropagation();
        const isChecked = event.target.checked;
        this.accountCheckboxes = this.accountCheckboxes.map(item => {
            return { ...item, isChecked: isChecked };
        });
        this.updateSelectedCheckboxes();
    }

    handleSelectAllVehicles(event) {
        event.stopPropagation();
        const isChecked = event.target.checked;
        this.vehicleCheckboxes = this.vehicleCheckboxes.map(item => {
            return { ...item, isChecked: isChecked };
        });
        this.updateSelectedCheckboxes();
    }

    updateSelectedCheckboxes() {
        const selectedAccounts = this.accountCheckboxes.filter(item => item.isChecked).map(item => item.label);
        const selectedVehicles = this.vehicleCheckboxes.filter(item => item.isChecked).map(item => item.label);

        this.selectedCheckboxes = [...selectedAccounts, ...selectedVehicles];
    }


    generateMonthOptions() {
        const options = [];
        const today = new Date();
        
        for (let i = 0; i < 3; i++) {
            const tempDate = new Date(today.getFullYear(), today.getMonth() - i);
            const year = tempDate.getFullYear();
            const month = tempDate.getMonth() + 1;

            const label = `${year}年${month}月`;

            options.unshift({
                label: label,
                value: `${year}-${month < 10 ? '0' + month : month}`, 
                disabled: false,
                cssClass: 'dropdown-item'
            });
        }

        this.startMonthOptions = [...options]; 
        this.endMonthOptions = [...options];
    }


    preselectCurrentMonth() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        this.startDate = `${year}-${month < 10 ? '0' + month : month}`;
        this.endDate = this.startDate;  

        this.updateEndDateOptions();
    }

    toggleStartDropdown(event) {
        event.stopPropagation();
        this.isStartDropdownOpen = !this.isStartDropdownOpen;
        this.isEndDropdownOpen = false;
    }

    toggleEndDropdown(event) {
        event.stopPropagation();
        this.isEndDropdownOpen = !this.isEndDropdownOpen;
        this.isStartDropdownOpen = false;
    }

    handleStartDateSelect(event) {
        const selectedValue = event.currentTarget.dataset.value;
        const selectedOption = this.startMonthOptions.find(option => option.value === selectedValue);

        // Prevent selection if the option is disabled
        if (selectedOption.disabled) {
            event.stopPropagation();
            return; // Do nothing if the option is disabled
        }
        this.startDate = selectedValue;
        this.isStartDropdownOpen = false;
        this.updateEndDateOptions();
    }

    handleEndDateSelect(event) {
        const selectedValue = event.currentTarget.dataset.value;
        const selectedOption = this.endMonthOptions.find(option => option.value === selectedValue);

        if (selectedOption.disabled) {
            event.stopPropagation();
            return;
        }
        this.endDate = selectedValue;
        this.isEndDropdownOpen = false;
        this.updateStartDateOptions();
    }

    // Update end date options based on selected start date
    updateEndDateOptions() {
        const [startYear, startMonth] = this.startDate.split('-').map(Number);

        this.endMonthOptions = this.endMonthOptions.map(option => {
            const [optYear, optMonth] = option.value.split('-').map(Number);

            if (optYear < startYear || (optYear === startYear && optMonth < startMonth)) {
                return { 
                    ...option, 
                    disabled: true, 
                    cssClass: 'dropdown-item dropdown-item-disabled' 
                };
            } else {
                return { 
                    ...option, 
                    disabled: false, 
                    cssClass: 'dropdown-item'
                };
            }
        });
    }


    updateStartDateOptions() {
        const [endYear, endMonth] = this.endDate.split('-').map(Number);

        this.startMonthOptions = this.startMonthOptions.map(option => {
            const [optYear, optMonth] = option.value.split('-').map(Number);

            if (optYear > endYear || (optYear === endYear && optMonth > endMonth)) {
                return { 
                    ...option, 
                    disabled: true, 
                    cssClass: 'dropdown-item dropdown-item-disabled'
                };
            } else {
                return { 
                    ...option, 
                    disabled: false, 
                    cssClass: 'dropdown-item' 
                };
            }
        });

    }

    get startDateLabel() {
        const selectedOption = this.startMonthOptions.find(option => option.value === this.startDate);
        return selectedOption ? selectedOption.label : 'Select a Start Date';
    }

    get endDateLabel() {
        const selectedOption = this.endMonthOptions.find(option => option.value === this.endDate);
        return selectedOption ? selectedOption.label : 'Select an End Date';
    }
    handleSearchclick(){
        console.log("selected checks",JSON.stringify(this.selectedCheckboxes),this.selectedCheckboxes.length);
        if(this.selectedCheckboxes.length === 0 && (!this.isAllAccountsChecked && !this.isAllVehiclesChecked)){
            this.branchNameError = true;
            this.branchNameclass = "dropdown branch-error";
            console.log("inside error");
        }else {
            this.branchNameError = false;
            this.branchNameclass = "dropdown";
        }
    }

    handleReset(){
        this.accountCheckboxes = this.accountCheckboxes.map(item => ({
            ...item,
            isChecked: true
        }));
    
        this.vehicleCheckboxes = this.vehicleCheckboxes.map(item => ({
            ...item,
            isChecked: true
        }));
        this.updateSelectedCheckboxes();
        this.preselectCurrentMonth();
        this.registrationNum = "";
        this.contractNum = "";
    }

    handleRegistrationInput(event){
        this.registrationNum = event.target.value;
    }

    handleContractInput(event){
        this.contractNum = event.target.value;
    }

    handleOutsideClick = (event) => {
        const dataDropElement = this.template.querySelector('.dropdown-wrapper-date');
        const listsElement = this.template.querySelector('.dropdown-list-date');

        const clickedOption = event.target.closest('.dropdown-item-disabled');
    
        if (clickedOption) {
            event.stopPropagation();
            return;
        }
        
        if (
            dataDropElement &&
            !dataDropElement.contains(event.target) &&
            listsElement &&
            !listsElement.contains(event.target)
        ) {
            this.isStartDropdownOpen = false;
        }
    };

    handleOutsideClick2 = (event) => {
        const dataDropElement = this.template.querySelector('.dropdown-wrapper-date');
        const listsElement = this.template.querySelector('.dropdown-list-date');

        const clickedOption = event.target.closest('.dropdown-item-disabled');
    
        if (clickedOption) {
            event.stopPropagation();
            return;
        }
        
        if (
            dataDropElement &&
            !dataDropElement.contains(event.target) &&
            listsElement &&
            !listsElement.contains(event.target)
        ) {
            this.isEndDropdownOpen = false;
        }
    };

    handleOutsideClick3 = (event) => {
        const dataDropElement = this.template.querySelector('.dropdown-content');
        
        if (
            dataDropElement &&
            !dataDropElement.contains(event.target) 
        ) {
            this.isDropdownOpen = false;
        }
    };

    handleInsideClick(event){
        event.stopPropagation();
    }
}
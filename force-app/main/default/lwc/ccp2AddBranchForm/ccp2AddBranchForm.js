import { LightningElement, track, wire } from 'lwc';
import Vehicle_StaticResource from '@salesforce/resourceUrl/CCP_StaticResource_Vehicle';
import Vehicle_StaticResources from "@salesforce/resourceUrl/CCP2_Resources";
import labelsBranch from '@salesforce/resourceUrl/ccp2_labels';
import i18nextStaticResource from '@salesforce/resourceUrl/i18next';
import getVehicleWithoutAssociation from '@salesforce/apex/CCP2_userData.VehicleWithoutAssociation';
import getUsersWithoutAssociation from '@salesforce/apex/CCP2_userData.userListDtl';
import AddBranch from '@salesforce/apex/CCP2_branchController.createBranch';
import checkBranch from '@salesforce/apex/CCP2_branchController.checkBranch';
import getAccount from '@salesforce/apex/CCP2_userData.accountDetails';
import Img1 from '@salesforce/resourceUrl/ccp2HeaderImg1';
import Img2 from '@salesforce/resourceUrl/ccp2HeaderImg2';
import Img3 from '@salesforce/resourceUrl/ccp2HeaderImg3';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import ACCOUNT_ID_FIELD from '@salesforce/schema/User.AccountId';
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

const arrowicon = Vehicle_StaticResource + '/CCP_StaticResource_Vehicle/images/arrow_under.png';

// import CCP2_PleaseEnterBasicInfo from '@salesforce/label/c.CCP2_PleaseEnterBasicInfo';
// import CCP2_OnlyOneBranchCanBeAdded from '@salesforce/label/c.CCP2_OnlyOneBranchCanBeAdded';
// import CCP2_CompanyName from '@salesforce/label/c.CCP2_CompanyName';
// import CCP2_BranchName from '@salesforce/label/c.CCP2_BranchName';
// import CCP2_Required from '@salesforce/label/c.CCP2_Required';
// import CCP2_Address from '@salesforce/label/c.CCP2_Address';
// import CCP2_AffiliatedVehicles from '@salesforce/label/c.CCP2_AffiliatedVehicles';
// import CCP2_SelectVehicles from '@salesforce/label/c.CCP2_SelectVehicles';
// import CCP2_AffiliatedUsers from '@salesforce/label/c.CCP2_AffiliatedUsers';
// import CCP2_ContactDetails from '@salesforce/label/c.CCP2_ContactDetails';
// import CCP2_PleaseEnterPhoneNumber from '@salesforce/label/c.CCP2_PleaseEnterPhoneNumber';
// import CCP2_TelephoneNumber from '@salesforce/label/c.CCP2_TelephoneNumber';
// import CCP2_MobileNumber from '@salesforce/label/c.CCP2_MobileNumber';
// import CCP2_AgreeToTerms from '@salesforce/label/c.CCP2_AgreeToTerms';
// import CCP2_AgreeToDataProtection from '@salesforce/label/c.CCP2_AgreeToDataProtection';
// import CCP2_Next from '@salesforce/label/c.CCP2_Next';
// import CCP2_ConfirmDetails from '@salesforce/label/c.CCP2_ConfirmDetails';
// import CCP2_Modify from '@salesforce/label/c.CCP2_Modify';
// import CCP2_BackToBranchManagement from '@salesforce/label/c.CCP2_BackToBranchManagement';
// import CCP2_WIthoutHyphen from '@salesforce/label/c.CCP2_WIthoutHyphen';
// import CCP2_AddWorkLocation from '@salesforce/label/c.CCP2_AddWorkLocation';
// import CCP2_AddBranch from '@salesforce/label/c.CCP2_AddBranch';
// import CCP2_BranchAddCompleted from '@salesforce/label/c.CCP2_BranchAddCompleted';
// import CCP2_AssignVehicleRelevant from '@salesforce/label/c.CCP2_AssignVehicleRelevant';
// import CCP2_AssignMemberRelevant from '@salesforce/label/c.CCP2_AssignMemberRelevant';
// import CCP2_PleaseSelect from '@salesforce/label/c.CCP2_PleaseSelect';
// import CCP2_PleaseEnter from '@salesforce/label/c.CCP2_PleaseEnter';
// import CCP2_BranchAdded from '@salesforce/label/c.CCP2_BranchAdded';
// import CCP2_SelectedVehicle from '@salesforce/label/c.CCP2_SelectedVehicle';
// import CCP2_SelectedMembers from '@salesforce/label/c.CCP2_SelectedMembers';



const BACKGROUND_IMAGE_PC = Vehicle_StaticResources + '/CCP2_Resources/Common/Main_Background.webp';

export default class Ccp2AddBranchForm extends LightningElement {
    @track Languagei18n = '';
    @track isLanguageChangeDone = true;

    // labels = {
    //     CCP2_PleaseEnterBasicInfo: CCP2_PleaseEnterBasicInfo,
    //     CCP2_OnlyOneBranchCanBeAdded: CCP2_OnlyOneBranchCanBeAdded,
    //     CCP2_CompanyName: CCP2_CompanyName,
    //     CCP2_BranchName: CCP2_BranchName,
    //     CCP2_Required: CCP2_Required,
    //     CCP2_Address: CCP2_Address,
    //     CCP2_AffiliatedVehicles: CCP2_AffiliatedVehicles,
    //     CCP2_SelectVehicles: CCP2_SelectVehicles,
    //     CCP2_AffiliatedUsers: CCP2_AffiliatedUsers,
    //     CCP2_ContactDetails: CCP2_ContactDetails,
    //     CCP2_PleaseEnterPhoneNumber: CCP2_PleaseEnterPhoneNumber,
    //     CCP2_TelephoneNumber: CCP2_TelephoneNumber,
    //     CCP2_MobileNumber: CCP2_MobileNumber,
    //     CCP2_AgreeToTerms: CCP2_AgreeToTerms,
    //     CCP2_AgreeToDataProtection: CCP2_AgreeToDataProtection,
    //     CCP2_Next: CCP2_Next,
    //     CCP2_ConfirmDetails: CCP2_ConfirmDetails,
    //     CCP2_Modify: CCP2_Modify,
    //     CCP2_BackToBranchManagement: CCP2_BackToBranchManagement,
    //     CCP2_WIthoutHyphen: CCP2_WIthoutHyphen,
    //     CCP2_AddWorkLocation: CCP2_AddWorkLocation,
    //     CCP2_AddBranch: CCP2_AddBranch,
    //     CCP2_BranchAddCompleted: CCP2_BranchAddCompleted,
    //     CCP2_AssignVehicleRelevant: CCP2_AssignVehicleRelevant,
    //     CCP2_AssignMemberRelevant:CCP2_AssignMemberRelevant,
    //     CCP2_PleaseSelect: CCP2_PleaseSelect,
    //     CCP2_PleaseEnter: CCP2_PleaseEnter,
    //     CCP2_BranchAdded: CCP2_BranchAdded,
    //     CCP2_SelectedVehicle: CCP2_SelectedVehicle,
    //     CCP2_SelectedMembers: CCP2_SelectedMembers

    // };
    labels = {};

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
    @track selectedVehicleId;
    @track users = [];
    @track moreusers = [];
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
    @track combinedAddress = '';
    @track siebelCode = '';
    @track branchnosend = '';
    @track DisplayNumber = '';

    labels2 = {};

    connectedCallback() {
        this.template.host.style.setProperty('--dropdown-icon', `url(${this.imgdrop})`);
        this.loadVehicles();
        this.loadUsers();

    }

    loadI18nextLibrary() {
        return new Promise((resolve, reject) => {
            if (!window.i18next) {
                const script = document.createElement("script");
                script.src = i18nextStaticResource; // Load i18next from the static resource
                script.onload = () => {
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error("Failed to load i18next script"));
                };
                document.head.appendChild(script);
            } else {
                resolve();
            }
        });
    }

    loadLabels() {
        fetch(`${labelsBranch}/labelsBranch.json`)
            .then(response => response.json())
            .then(data => {
                const userLocale = this.getLocale(); // Method to determine user locale (e.g., 'en', 'jp')

                // Initialize i18next with the fetched labels
                i18next.init({
                    lng: userLocale,
                    resources: {
                        [userLocale]: {
                            translation: data[userLocale]
                        }
                    }
                }).then(() => {
                    this.labels2 = i18next.store.data[userLocale].translation;
                    console.log("User Locale: ", userLocale);
                    console.log("User Labels: ", this.labels2);
                });
            })
            .catch((error) => {
                console.error("Error loading labels: ", error);
                let err = JSON.stringify(error);
                ErrorLog({ lwcName: "ccp2AddBranchForm", errorLog: err, methodName: "Load Labels" })
                    .then(() => {
                        console.log("Error logged successfully in Salesforce");
                    })
                    .catch((loggingErr) => {
                        console.error("Failed to log error in Salesforce:", loggingErr);
                    });
            });

    }

    getLocale() {
        console.log("Lang 2", this.Languagei18n);
        this.isLanguageChangeDone = false;
        if (this.Languagei18n === 'en_US') {
            console.log("working1");
            return "en";
        }
        else {
            console.log("working2");
            return "jp";
        }
    }



    userId = USER_ID;
    accountId;

    loadLanguage() {
        Languagei18n() // Assuming getLanguageI18n is the apex method that fetches the language.
            .then((data) => {
                this.Languagei18n = data;
                console.log("lang Method", data, this.Languagei18n);
                return this.loadI18nextLibrary(); // Return the promise for chaining
            })
            .then(() => {
                return this.loadLabels(); // Load labels after i18next is ready
            })
            .then(() => {
                console.log("Upload Label: ", this.isLanguageChangeDone); // Check language change status
            })
            .catch((error) => {
                console.error("Error loading language or labels: ", error);
                let err = JSON.stringify(error);
                ErrorLog({ lwcName: "ccp2AddBranchForm", errorLog: err, methodName: "Load Language" })
                    .then(() => {
                        console.log("Error logged successfully in Salesforce");
                    })
                    .catch((loggingErr) => {
                        console.error("Failed to log error in Salesforce:", loggingErr);
                    });
            });
    }

    @wire(getRecord, {
        recordId: '$userId',
        fields: [ACCOUNT_ID_FIELD]
    })
    userRecord({ error, data }) {
        if (data) {
            this.accountId = getFieldValue(data, ACCOUNT_ID_FIELD);
        } else if (error) {
            console.error('Error fetching user record:', error);
            let err = JSON.stringify(error);
            ErrorLog({ lwcName: "ccp2AddBranchForm", errorLog: err, methodName: "userrecord" })
                .then(() => {
                    console.log("Error logged successfully in Salesforce");
                })
                .catch((loggingErr) => {
                    console.error("Failed to log error in Salesforce:", loggingErr);
                });
        }
    }
    get hasPostalAddress() {
        return this.postalCode !== null && this.postalCode !== undefined;
    }


    @wire(getAccount) loadaccount({ data, error }) {
        if (data) {
            console.log("mydata", data);
            this.AccountName = data[0].Name;
            this.siebelCode = data[0].siebelAccountCode__c;
            this.BranchNumber = data[0].Current_Branch_Code__c;
            this.formatdata();
        } else if (error) {
            console.log(error);
            let err = JSON.stringify(error);
            ErrorLog({ lwcName: "ccp2AddBranchForm", errorLog: err, methodName: "Load Account" })
                .then(() => {
                    console.log("Error logged successfully in Salesforce");
                })
                .catch((loggingErr) => {
                    console.error("Failed to log error in Salesforce:", loggingErr);
                });
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
        console.log("branchnotosend", JSON.stringify(this.branchnosend));




        this.DisplayNumber = this.siebelCode + ' - ' + this.branchnosend;
        console.log("result", JSON.stringify(this.DisplayNumber));
        return result;

    }

    @wire(getVehicleWithoutAssociation)
    loadVehicles(data, error) {

        getVehicleWithoutAssociation()
            .then(result => {
                console.log("vehicles to add", result);
                this.vehicles = result.map(vehicle => ({
                    label: vehicle.Registration_Number__c,
                    value: vehicle.Id
                }));

            })
            .catch(error => {
                console.error('Error fetching vehicles:', error);
                let err = JSON.stringify(error);
                ErrorLog({ lwcName: "ccp2AddBranchForm", errorLog: err, methodName: "Load Vehicles" })
                    .then(() => {
                        console.log("Error logged successfully in Salesforce");
                    })
                    .catch((loggingErr) => {
                        console.error("Failed to log error in Salesforce:", loggingErr);
                    });
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
                let err = JSON.stringify(error);
                ErrorLog({ lwcName: "ccp2AddBranchForm", errorLog: err, methodName: "Load Users" })
                    .then(() => {
                        console.log("Error logged successfully in Salesforce");
                    })
                    .catch((loggingErr) => {
                        console.error("Failed to log error in Salesforce:", loggingErr);
                    });
            });
    }
    openlist(event) {
        event.stopPropagation();
        this.showList = !this.showList;
        if (this.vehicles.length === 0) {
            this.showList = false;
        }

    }
    openlistUser(event) {
        event.stopPropagation();
        this.showListUser = !this.showListUser;
        if (this.users.length === 0) {
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
        if (this.vehicles.length === 0) {
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

        if (this.users.length === 0) {
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
        try {
            const branchInput = this.template.querySelector('input[name="branchss"]');

            let isValid = true;

            if (this.currentStep === 1) {
                this.showerrorbranch = false;
                this.showerrorbranchNull = false;
                this.alreadybranch = false;
                this.fullwidthnum = false;
                if (!branchInput.value) {
                    branchInput.classList.add('invalid-input');
                    // this.showToast("エラー","必須項目を入力してください。","error");
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
                    branchInput.classList.remove('invalid-input');
                    this.showerrorbranch = false;
                    this.showerrorbranchNull = false;
                    this.alreadybranch = false;

                    try {
                        const result = await checkBranch({ accId: this.accountId, branchName: this.branchName });
                        console.log("result branch name class", result);
                    } catch (error) {
                        console.log('checkkkk name:', JSON.stringify(error));
                        let err = JSON.stringify(error);
                        ErrorLog({ lwcName: "ccp2AddBranchForm", errorLog: err, methodName: "handleNext" })
                            .then(() => {
                                console.log("Error logged successfully in Salesforce");
                            })
                            .catch((loggingErr) => {
                                console.error("Failed to log error in Salesforce:", loggingErr);
                            });
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

                if (!isValid) {
                    window.scrollTo(0, 0);
                }
            }

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
            let err = JSON.stringify(error);
            ErrorLog({ lwcName: "ccp2AddBranchForm", errorLog: err, methodName: "handleNext" })
                .then(() => {
                    console.log("Error logged successfully in Salesforce");
                })
                .catch((loggingErr) => {
                    console.error("Failed to log error in Salesforce:", loggingErr);
                });
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
            this.Step1 = true;
            this.Step2 = false;
            this.currentStep = 1;
        } else if (this.currentStep === 3) {
            this.Step2 = true;
            this.Step3 = false;
            this.currentStep = 2;
        }
    }

    handleInput(event) {
        const input = event.target;
        input.value = input.value.replace(/[^\d]/g, '').slice(0, 11);
        this.phone = input.value;
    }



    handle2Next() {
        let vehicleIds = this.morevehicles.map(vehicle => vehicle.Id);
        console.log("map", JSON.stringify(vehicleIds));
        console.log("veh", JSON.stringify(this.morevehicles));

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
                this.Step2 = false;
                this.Step3 = true;
                this.currentStep = 3;
                sessionStorage.removeItem("ongoingTransaction");
            })
            .catch(error => {
                console.error('Error inserting branch record:', error);
                let err = JSON.stringify(error);
                ErrorLog({ lwcName: "ccp2AddBranchForm", errorLog: err, methodName: "handle2Next" })
                    .then(() => {
                        console.log("Error logged successfully in Salesforce");
                    })
                    .catch((loggingErr) => {
                        console.error("Failed to log error in Salesforce:", loggingErr);
                    });
                this.dispatchEvent(
                    new ShowToastEvent({
                        message: 'ブランチレコードの挿入中にエラーが発生しました。もう一度試してください' + error.body.message,
                        variant: 'error',
                    })
                );
            });
    }



    handleCompanyNameChange(event) {
        console.log(this.companyName);
        this.companyName = event.target.value;
    }

    addressChange(event) {
        this.address = event.target.value;

    }

    handleBranchNameChange(event) {
        this.branchName = event.target.value;
        console.log("branch name outside", this.branchName)
        const regexJapanese = /^[一-龠ぁ-ゔァ-ヴー々〆〤ヶ]*$/;
        let input = event.target.value;

        if (regexJapanese.test(input)) {
            if (input.length > 24) {
                input = input.slice(0, 24);
                event.target.value = input;
            }
            this.branchName = input;
            console.log("branch name inside if", this.branchName)
            this.errorMessage = '';
        }
        else {
            this.errorMessage = 'Invalid input: Only Japanese characters are allowed, and the length should be up to 24 characters.';
        }

        this.validateBranchName();
    }





    handlePhoneChange(event) {
        const input = event.target;
        const cleanedPhone = input.value.replace(/[^\d０-９]/g, '').slice(0, 11);
        this.phone = cleanedPhone;
    }






    check() {
        console.log("dofc", JSON.stringify(this.users));
        let contactIds = this.users.map(user => user.Id);
        console.log("con", JSON.stringify(contactIds));
        console.log("ds", JSON.stringify(this.selectedUserId));
    }
    handleSave() {
        this.goToMain();
    }

    goToMain() {
        let baseUrl = window.location.href;
        if (baseUrl.indexOf("/s/") !== -1) {
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

        }
    }

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
        console.log("arrat", JSON.stringify(this.vehicles));
        this.handleVehicleChange();
    }

    handleUserSelect(event) {
        this.selectedUserId = event.currentTarget.dataset.id;
        console.log("arrat", JSON.stringify(this.users));
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
        if (this.isLanguageChangeDone) {
            setTimeout(() => {
                let ongoingTransactions =
                    JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

                ongoingTransactions.branchCreateTxn = true;

                sessionStorage.setItem(
                    "ongoingTransaction",
                    JSON.stringify(ongoingTransactions)
                );
            }, 0);
            console.log("Working 1");
            this.loadLanguage();
        }
        if (!this.outsideClickHandlerAdded) {
            document.addEventListener('click', this.handleOutsideClick);
            this.outsideClickHandlerAdded = true;
        }
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick);
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;

        if (field === 'postalCode') {
            this.postalCode = event.target.value;
        }
        else if (field === 'prefectures') {
            this.prefectures = event.target.value.trim();
        } else if (field === 'municipalities') {
            this.municipalities = event.target.value.trim();
        } else if (field === 'streetAddress') {
            this.streetAddress = event.target.value.trim();
        } else if (field === 'buildingName') {
            this.buildingName = event.target.value.trim();
        }

        this.updateCombinedAddress();
    }

    updateCombinedAddress() {
        this.combinedAddress = `${this.postalCode} ${this.prefectures} ${this.municipalities} ${this.streetAddress} ${this.buildingName}`;
    }
    handleCancel() {
        this.showCancelModal = true;
    }
    handleNo() {
        this.showCancelModal = false;
        this.addbranchpage = true;
    }
    handleYes() {
        sessionStorage.removeItem("ongoingTransaction");
        this.showCancelModal = false;
        this.addbranchpage = false;
        this.callMain = true;
    }

    // @track postalcodeIntermediate = "";
    handlePostalCode(event) {
        const input = event.target;
        console.log("Input.data is: ", event.data);
        input.value = input.value.replace(/[^\d]/g, '').slice(0, 7);
        this.postalCode = input.value;
        // this.postalcodeIntermediate = this.postalCode;
    }



    handlevalchange(event) {
        const maxLength = event.target.maxLength;
        let value = event.target.value;
        if (value.length > maxLength) {
            // event.target.value = value.substring(0, maxLength);
            event.target.blur();
        }
    }

}
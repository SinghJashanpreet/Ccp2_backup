import { LightningElement, track, wire } from 'lwc';
import Vehicle_StaticResource from '@salesforce/resourceUrl/CCP_StaticResource_Vehicle';
import Vehicle_StaticResources from '@salesforce/resourceUrl/CCP2_Resources';
import labelsBranch from '@salesforce/resourceUrl/ccp2_labels';
import i18nextStaticResource from '@salesforce/resourceUrl/i18next';
import getVehicleWithoutAssociation from '@salesforce/apex/CCP2_userData.VehicleWithoutAssociation';
import getUsersWithoutAssociation from '@salesforce/apex/CCP2_userData.userListDtl';
import AddBranch from '@salesforce/apex/CCP2_branchController.createBranch';
import checkBranch from '@salesforce/apex/CCP2_branchController.checkBranch';
import getAccount from '@salesforce/apex/CCP2_userData.accountDetails';
import checkManagerUser from "@salesforce/apex/CCP_HeaderController.checkManagerUser";
// import Img1 from '@salesforce/resourceUrl/ccp2HeaderImg1';
// import Img2 from '@salesforce/resourceUrl/ccp2HeaderImg2';
// import Img3 from '@salesforce/resourceUrl/ccp2HeaderImg3';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import ACCOUNT_ID_FIELD from '@salesforce/schema/User.AccountId';
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
const arrowicon = Vehicle_StaticResource + '/CCP_StaticResource_Vehicle/images/arrow_under.png';
const Img1 = Vehicle_StaticResources + '/CCP2_Resources/Branch/ccp2HeaderImg1.png';
const Img2 = Vehicle_StaticResources + '/CCP2_Resources/Branch/ccp2HeaderImg2.png';
const Img3 = Vehicle_StaticResources + '/CCP2_Resources/Branch/ccp2HeaderImg3.png';
const BACKGROUND_IMAGE_PC = Vehicle_StaticResources + '/CCP2_Resources/Common/Main_Background.webp';


export default class Ccp2_AddBranch extends LightningElement {

    @track Languagei18n = '';
    @track isLanguageChangeDone = true;
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
    @track adminFlag = true;
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
    @track VehiclesModal = false;
    @track vehicleByIdData = {
        vehicleNames: [],
        moreVehiclesCount: 0
    };
    @track morethanOneBranch = false;

    vehicleopen() {
        this.VehiclesModal = true;
    }
    vehiclehClose() {
        this.VehiclesModal = false;
    }

    connectedCallback() {
        this.checkManagerUserFunction();
        this.template.host.style.setProperty('--dropdown-icon', `url(${this.imgdrop})`);
        this.loadVehicles();
        this.loadUsers();

    }
    checkManagerUserFunction() {
        checkManagerUser()
            .then((result) => {
                this.adminFlag = result;
                // if (this.adminFlag === false) {
                //     let baseUrl = window.location.href;
                //     let Newurl;
                //     if (baseUrl.indexOf("/s/") !== -1) {
                //         Newurl = baseUrl.split("/s/")[0] + "/s/error";
                //     }
                //     window.location.href = Newurl;
                // }
            })
            .catch((error) => {
                this.errors = JSON.stringify(error);
                console.error("checkManagerUser errors:" + JSON.stringify(error));
                let err = JSON.stringify(error);
                ErrorLog({
                    lwcName: "ccp2_Addbranch",
                    errorLog: err,
                    methodName: "checkManagerUser",
                    ViewName: "create branch",
                    InterfaceName: "Salesforce",
                    EventName: "Data fetch",
                    ModuleName: "Header"
                })
                    .then(() => {
                        console.log("Error logged successfully in Salesforce");
                    })
                    .catch((loggingErr) => {
                        console.error("Failed to log error in Salesforce:", loggingErr);
                    });
            });
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
                });
            })
            .catch((error) => {
                console.error("Error loading labels: ", error);
                let err = JSON.stringify(error);
                ErrorLog({
                    lwcName: "ccp2AddBranchForm",
                    errorLog: err,
                    methodName: "Load Labels",
                    ViewName: "Create branch",
                    InterfaceName: "CCP User Interface",
                    EventName: "Loading labels",
                    ModuleName: "Create branch"
                })
                    .then(() => {
                        console.log("Error logged successfully in Salesforce");
                    })
                    .catch((loggingErr) => {
                        console.error("Failed to log error in Salesforce:", loggingErr);
                    });
            });

    }

    getLocale() {
        this.isLanguageChangeDone = false;
        if (this.Languagei18n === 'en_US') {
            return "en";
        }
        else {
            return "jp";
        }
    }



    userId = USER_ID;
    accountId;

    loadLanguage() {
        Languagei18n() // Assuming getLanguageI18n is the apex method that fetches the language.
            .then((data) => {
                this.Languagei18n = data;
                return this.loadI18nextLibrary(); // Return the promise for chaining
            })
            .then(() => {
                return this.loadLabels(); // Load labels after i18next is ready
            })
            .then(() => {
            })
            .catch((error) => {
                console.error("Error loading language or labels: ", error);
                let err = JSON.stringify(error);
                ErrorLog({
                    lwcName: "ccp2AddBranchForm",
                    errorLog: err,
                    methodName: "Load Language",
                    ViewName: "Create branch",
                    InterfaceName: "CCP User Interface",
                    EventName: "Loading language",
                    ModuleName: "Create branch"
                })
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
            ErrorLog({
                lwcName: "ccp2AddBranchForm",
                errorLog: err,
                methodName: "userrecord",
                ViewName: "Create branch",
                InterfaceName: "CCP User Interface",
                EventName: "Fetching account Id",
                ModuleName: "Create branch"
            })
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
            this.AccountName = data[0].Name;
            this.siebelCode = data[0]?.siebelAccountCode__c || "未登録";
            this.BranchNumber = data[0].Current_Branch_Code__c;
            if (data[0].Current_Branch_Code__c) {
                this.formatdata();
            }
        } else if (error) {
            let err = JSON.stringify(error);
            ErrorLog({
                lwcName: "ccp2AddBranchForm",
                errorLog: err,
                methodName: "Load Account",
                ViewName: "Create branch",
                InterfaceName: "CCP User Interface",
                EventName: "Loading account information",
                ModuleName: "Create branch"
            })
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

        this.DisplayNumber = this.siebelCode + ' - ' + this.branchnosend;
        return result;

    }

    get isAddress() {
        return !(this.postalCode || this.combinedAddress)
    }

    @wire(getVehicleWithoutAssociation)
    loadVehicles(data, error) {

        getVehicleWithoutAssociation()
            .then(result => {
                this.vehicles = result.map(vehicle => ({
                    label: vehicle?.Registration_Number__c,
                    value: vehicle.Id,
                    chassis: vehicle?.Chassis_number__c
                }));

            })
            .catch(error => {
                console.error('Error fetching vehicles:', error);
                let err = JSON.stringify(error);
                ErrorLog({
                    lwcName: "ccp2AddBranchForm",
                    errorLog: err,
                    methodName: "Load Vehicles",
                    ViewName: "Create branch",
                    InterfaceName: "CCP User Interface",
                    EventName: "Loading vehicles data",
                    ModuleName: "Create branch"
                })
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
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                let err = JSON.stringify(error);
                ErrorLog({
                    lwcName: "ccp2AddBranchForm",
                    errorLog: err,
                    methodName: "Load Users",
                    ViewName: "Create branch",
                    InterfaceName: "CCP User Interface",
                    EventName: "Loading users data",
                    ModuleName: "Create branch"
                })
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
            this.morevehicles.push({ Id: selectedVehicle.value, Name: selectedVehicle.label, chassis: selectedVehicle.chassis });
        }
        this.processVehicleData();

        this.selectedVehicleId = null;
        if (this.vehicles.length === 0) {
            this.showList = false;
        }


    }
    processVehicleData() {
        const vehiclesToShow = this.morevehicles.slice(0, 3); // First 3 vehicles
        this.vehicleByIdData.vehicleNames = vehiclesToShow.map(vehicle => ({
            name: vehicle.Name
        }));
        this.vehicleByIdData.moreVehiclesCount = this.morevehicles.length > 3 ? this.morevehicles.length - 3 : 0;
        this.morethanOneBranch = this.vehicleByIdData.moreVehiclesCount > 0;
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
        // const evt = new ShowToastEvent({
        //     title: title,
        //     message: message,
        //     variant: variant
        // });
        // this.dispatchEvent(evt);
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
                    // window.scrollTo(0, 0);
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
                    } catch (error) {
                        console.error('checkkkk name:', JSON.stringify(error));
                        let err = JSON.stringify(error);
                        ErrorLog({
                            lwcName: "ccp2AddBranchForm",
                            errorLog: err,
                            methodName: "handleNext",
                            ViewName: "Create branch",
                            InterfaceName: "CCP User Interface",
                            EventName: "Branch name already exists",
                            ModuleName: "Create branch"
                        })
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
                        // window.scrollTo(0, 0);
                        // this.dispatchEvent(
                        //     new ShowToastEvent({
                        //         message: error.body.message,
                        //         variant: 'error',
                        //     })
                        // );
                        return;
                    }
                }

                if (!isValid) {
                    // window.scrollTo(0, 0);

                    // this.dispatchEvent(
                    //     new ShowToastEvent({
                    //         message: this.labels2.ccp2_ab_affiliation_error,
                    //         variant: 'error',
                    //     })
                    // );
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
            this.processVehicleData();
            window.scrollTo(0, 0);
        } catch (error) {
            console.error(error);
            window.scrollTo(0, 0);
            let err = JSON.stringify(error);
            ErrorLog({
                lwcName: "ccp2AddBranchForm",
                errorLog: err,
                methodName: "handleNext",
                ViewName: "Create branch",
                InterfaceName: "CCP User Interface",
                EventName: "Moving from input section to confirmation",
                ModuleName: "Create branch"
            })
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

        window.scrollTo(0, 0);
    }

    handleInput(event) {
        const input = event.target;
        const onlyDigitsRegex = /^[0-9]*$/;
        if (!onlyDigitsRegex.test(input.value)) {
            event.target.blur();
        }
        const cleanedPhone = input.value.replace(/[^0-9]/g, '');
        input.value = cleanedPhone;
        this.phone = cleanedPhone
    }

    handle2Next() {
        let vehicleIds = this.morevehicles.map(vehicle => vehicle.Id);

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

        AddBranch(params)
            .then(result => {
                this.Step2 = false;
                this.Step3 = true;
                this.currentStep = 3;
                sessionStorage.removeItem("ongoingTransaction");

                window.scrollTo(0, 0);
            })
            .catch(error => {
                console.error('Error inserting branch record:', error);
                let err = JSON.stringify(error);
                ErrorLog({
                    lwcName: "ccp2AddBranchForm",
                    errorLog: err,
                    methodName: "handle2Next",
                    ViewName: "Create branch",
                    InterfaceName: "CCP User Interface",
                    EventName: "Creating branch(confirmation page to completion page)",
                    ModuleName: "Create branch"
                })
                    .then(() => {
                        console.log("Error logged successfully in Salesforce");
                    })
                    .catch((loggingErr) => {
                        console.error("Failed to log error in Salesforce:", loggingErr);
                    });
                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         message: 'ブランチレコードの挿入中にエラーが発生しました。もう一度試してください' + error.body.message,
                //         variant: 'error',
                //     })
                // );

                window.scrollTo(0, 0);
            });
    }



    handleCompanyNameChange(event) {
        this.companyName = event.target.value;
    }

    addressChange(event) {
        this.address = event.target.value;

    }

    handleBranchNameChange(event) {
        this.branchName = event.target.value;
        const regexJapanese = /^[一-龠ぁ-ゔァ-ヴー々〆〤ヶ]*$/;
        let input = event.target.value;

        if (regexJapanese.test(input)) {
            if (input.length > 24) {
                input = input.slice(0, 24);
                event.target.value = input;
            }
            this.branchName = input;
            this.errorMessage = '';
        }
        else {
            this.errorMessage = 'Invalid input: Only Japanese characters are allowed, and the length should be up to 24 characters.';
        }

        this.validateBranchName();
    }

    check() {
        let contactIds = this.users.map(user => user.Id);
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
        this.handleVehicleChange();
    }

    handleUserSelect(event) {
        this.selectedUserId = event.currentTarget.dataset.id;
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
        this.combinedAddress = `${this.prefectures} ${this.municipalities} ${this.streetAddress} ${this.buildingName}`;
    }

    get isAddress() {
        return this.postalCode === '' && this.combinedAddress === ''
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
        let baseUrl = window.location.href;
        if (baseUrl.indexOf("/s/") !== -1) {
            let NotificationCentreUrl =
                baseUrl.split("/s/")[0] + "/s/branchmangement";
            window.location.href = NotificationCentreUrl;
        }
        this.callMain = true;
    }

    @track postalcodeIntermediate = "";

    handlePostalCode(event) {
        const input = event.target;
        const onlyDigitsRegex = /^[0-9]*$/;
        if (!onlyDigitsRegex.test(input.value)) {
            event.target.blur();
        }
        const cleanedPhone = input.value.replace(/[^0-9]/g, '');
        input.value = cleanedPhone;
        this.postalCode = cleanedPhone;
    }

    handlevalchange(event) {
        const maxLength = event.target.maxLength;
        let value = event.target.value;
        if (value.length > maxLength) {
            // event.target.value = value.substring(0, maxLength);
            event.target.blur();
        }
    }
    navigateToHome() {
        let baseUrl = window.location.href;
        let homeUrl;
        if (baseUrl.indexOf("/s/") != -1) {
            homeUrl = baseUrl.split("/s/")[0];
        }
        window.location.href = homeUrl;
    }
}
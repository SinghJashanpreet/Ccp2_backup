/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, wire } from "lwc";
import Vehicle_StaticResource2 from "@salesforce/resourceUrl/CCP2_Resources";
import AddUser_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_AddUser";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_Vehicle";
import User_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
// import Branch_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_Vehicle";
import getContactData from "@salesforce/apex/CCP_AddUserCtrl.getContactData";
import checkUserEmail from "@salesforce/apex/CCP_AddUserCtrl.checkUserEmail";
//import checkManageUser from "@salesforce/apex/CCP_AddUserCtrl.checkManageUser";
import checkManagerUser from "@salesforce/apex/CCP_HeaderController.checkManagerUser";
import createContact from "@salesforce/apex/CCP_AddUserCtrl.createContact";
import createBranch from "@salesforce/apex/CCP2_branchController.addBranch";
import createUser from "@salesforce/apex/CCP_AddUserCtrl.createUser";
import getUserPermissionSet from "@salesforce/apex/CCP_AddUserCtrl.getUserPermissionSet";
import userTypeJudgment from "@salesforce/apex/CCP_AddUserCtrl.userTypeJudgment";
import checkUserNumber from "@salesforce/apex/CCP_AddUserCtrl.checkUserNumber";
import getBaseInfoByUserId from "@salesforce/apex/CCP_HomeCtrl.getBaseInfoByUserId";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import getUserServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import getLatestTermsUrls from '@salesforce/apex/CCP_RegisterAdminUserCtrl.getLatestTermsUrls';


import getbranchdetails from "@salesforce/apex/CCP2_userData.UnAssociatedBranch";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import Id from "@salesforce/user/Id";

const arrowicon =
  User_StaticResource + "/CCP2_Resources/Common/arrow_under.png";
const BACKGROUND_IMAGE_MOBILE =
  Vehicle_StaticResource +
  "/CCP_StaticResource_Vehicle/images/user_management.png";
const TRACK_ICON =
  AddUser_StaticResource + "/CCP_StaticResource_AddUser/images/icon_track.svg";
const CHECK_ICON =
  AddUser_StaticResource + "/CCP_StaticResource_AddUser/images/icon_check.svg";

const truckcancel =
  User_StaticResource + "/CCP2_Resources/User/truckcancel1.webp";
const truckcancel2 =
  User_StaticResource + "/CCP2_Resources/User/truckcancel2.webp";
const truckcancel3 =
  User_StaticResource + "/CCP2_Resources/User/truckcancel3.webp";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource2 + "/CCP2_Resources/Common/Main_Background.webp";

export default class Ccp2_AddUser extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  errors;
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  backgroundImageMobile = BACKGROUND_IMAGE_MOBILE;
  imgdrop = arrowicon;
  trackIcon = TRACK_ICON;
  checkIcon = CHECK_ICON;
  truckpic1 = truckcancel;
  truckpic2 = truckcancel2;
  truckpic3 = truckcancel3;
  @track showInputSection = true;
  showConfirmationSection = false;
  showCompletionSection = false;
  isManageUser = false;

  termServiceChecked = false;
  termDataChecked = false;
  vrChecked = false;
  rbChecked = true;
  showone = false;

  //bsChecked = false;
  //eiChecked = false;
  fsChecked = true;
  usermanagement;
  ombChecked = false;
  vmChecked = true;
  cmChecked = false;

  deletedBranchIds = [];
  selectedLabels = [];
  @track showCancelModal = false;
  @track showCheckboxModal = false;
  @track branchoptions = [];
  branch = [];
  branchranchDataForClass = [];
  selectbranchId = "";
  @track showlist = false;
  searchTerm = "";

  isLoading = false;
  contactData = [];
  allContactEmail = [];
  allUserEmail = [];
  lastNameError = false;

  firstNameError = false;
  lastNameKanaError = false;
  firstNameKanaError = false;
  emailError = false;
  branchError = false;
  servicesError = false;
  phoneError = false;
  vehicleShow = false;
  requestShow = false;

  financialshow = false;
  costshow = false;
  maintenanceshow = false;
  vehiclemanagementshow = false;
  @track adminFlag = true;

  isFDPShow = true;
  lastNameErrorText;

  firstNameErrorText;
  lastNameKanaErrorText;
  firstNameKanaErrorText;
  branchErrorText;
  emailErrorText;
  phoneErrorText;
  isShowModal = false;
  baseChecked = true;
  // baseService = true;
  eInvioceService = false;
  directBookService = false;
  @track contactInputData = {
    lastName: null,
    firstName: null,
    lastNameKana: null,
    firstNameKana: null,
    title: null,
    department: null,
    email: null,
    phone: null,
    mobilePhone: null,
    employeeCode: null
  };
  @track allBranchesData = {
    firstbranch: "",
    firstbranchreal: "",
    onscreenbranchcount: 0
  };
  @track morethanonebranch = false;
  @track Branchesmodal = false;
  @track userId = Id;
  @track allServices = [];

    // 利用規約のURLを保存
    @track termsUrls = {
      CCP: {
          id: null,
          url: null
      },
      DTFSA: {
          id: null,
          url: null
      },
      EInvoice: {
          id: null,
          url: null
      }
  };


  handlephoneInput(event) {
    const input = event.target;
    const onlyDigitsRegex = /^[0-9]*$/;
    if (!onlyDigitsRegex.test(input.value)) {
      event.target.blur();
    }
    const cleanedPhone = input.value.replace(/[^0-9]/g, '');
    input.value = cleanedPhone;
    this.contactInputData[event.target.name] = input.value;
    // Limit input to 11 characters
  }

  checkManagerUserFunction() {
    checkManagerUser()
      .then((result) => {
        this.adminFlag = result;
        // if (this.adminFlag === false) {
        //   let baseUrl = window.location.href;
        //   let Newurl;
        //   if (baseUrl.indexOf("/s/") !== -1) {
        //     Newurl = baseUrl.split("/s/")[0] + "/s/error";
        //   }
        //   window.location.href = Newurl;
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

  handleAllInputChange(event) {
    this.contactInputData[event.target.name] = event.target.value;
    let nextButton = this.template.querySelector('[name="nextButton"]');
    // if the two terms not check, the next button is disable
    if (nextButton != null) {
      if (
        this.contactInputData.firstName === null ||
        this.contactInputData.firstName === "" ||
        this.contactInputData.lastName === null ||
        this.contactInputData.lastName === "" ||
        this.contactInputData.firstNameKana === null ||
        this.contactInputData.firstNameKana === "" ||
        this.contactInputData.lastNameKana === null ||
        this.contactInputData.lastNameKana === "" ||
        // this.branch.length === 0 ||
        this.contactInputData.email === null ||
        this.contactInputData === "" ||
        ((this.contactInputData.mobilePhone === null ||
          this.contactInputData.mobilePhone === "") &&
          (this.contactInputData.phone === "" ||
            this.contactInputData.phone == null))
      ) {
        nextButton.className = "primary_nextbtn--m ";
      } else {
        nextButton.className = "primary_nextbtn--m";
      }
    }
  }

  connectedCallback() {
    this.checkManagerUserFunction();
    setTimeout(() => {
      let ongoingTransactions =
        JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

      ongoingTransactions.addUserCTxn = true;

      sessionStorage.setItem(
        "ongoingTransaction",
        JSON.stringify(ongoingTransactions)
      );
    }, 500);

    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.imgdrop})`
    );
    requestAnimationFrame(() => {
      this.addCustomStyles();
    });

    // 最新の利用規約のIDとURLを取得
    this.fetchTermsUrls();

    let baseUrl = window.location.href;
    this.usermanagement = baseUrl.split("/s/")[0] + "/s/usermanagement";

    // this.template.host.style.setProperty(
    //   "--dropdown-icon",
    //   `url(
    //         ${this.imgdrop}
    //         )`
    // );
    //res = false
    this.userTypeJudgment();
    //this.checkManageUser();
    checkUserNumber().then((res) => {
      if (!res) {
        this.isShowModal = true;
        return;
      }
      this.getContactData();
      this.setUserPermissionSet();
    });

    getBaseInfoByUserId({ uId: Id }).then((res) => {
      if (res.isFDP != undefined) {
        this.isFDP = res.isFDP;
      }
      if (this.isFDP) {
        this.isFDPShow = false;
      }
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

  labels2 = {};
  loadLabels() {
    fetch(`${labelsUser}/labelsUser.json`)
      .then((response) => response.json())
      .then((data) => {
        const userLocale = this.getLocale(); // Method to determine user locale (e.g., 'en', 'jp')

        // Initialize i18next with the fetched labels
        i18next
          .init({
            lng: userLocale,
            resources: {
              [userLocale]: {
                translation: data[userLocale]
              }
            }
          })
          .then(() => {
            this.labels2 = i18next.store.data[userLocale].translation;
          });
      })
      .catch((err) => {
        console.error("Error loading labels: ", err);
        let error = JSON.stringify(err);
        ErrorLog({
          lwcName: "ccp_AddUser",
          errorLog: error,
          methodName: "Load Labels CLASS",
          ViewName: "Create user page",
          InterfaceName: "CCP User Interface",
          EventName: "Loading labels",
          ModuleName: "Create user"
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
    if (this.Languagei18n === "en_US") {
      return "en";
    } else {
      return "jp";
    }
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      // let ongoingTransactions =
      //   JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

      // ongoingTransactions.userCreatenewTxn = true;

      // sessionStorage.setItem(
      //   "ongoingTransaction",
      //   JSON.stringify(ongoingTransactions)
      // );
      this.loadLanguage();
    }
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      this.outsideClickHandlerAdded = true;
    }
    this.nextButtonCSS();
  }

  setUserPermissionSet() {
    getUserPermissionSet({ userId: Id }).then((res) => {
      if (res.Direct_Booking) {
        this.vehicleShow = true;
      }
      if (res.E_invoice) {
        this.requestShow = true;
      }
      if (res.FUSO_CCP_External_Financial_service) {
        this.financialshow = true;
      }
      if (res.FUSO_CCP_External_Cost_management) {
        this.costshow = true;
      }
      if (res.FUSO_CCP_External_Online_maintenance_booking) {
        this.maintenanceshow = true;
      }
      // if (res.FUSO_CCP_External_Vehicle_management) {
      //   this.vehiclemanagementshow = true;
      // }
    });
  }

  // get default Account Data
  getContactData() {
    getContactData()
      .then((data) => {
        let contactData = [];
        if (data != null) {
          let accountData = data.Account;
          contactData = {
            id: data.Id,
            accountId: accountData.Id,
            accountName: accountData.Name,
            accountCode: accountData.siebelAccountCode__c
          };
          this.contactData = contactData;
        }
      })
      .catch((err) => {
        console.error("errors:" + JSON.stringify(err));
        let error = JSON.stringify(err);
        ErrorLog({
          lwcName: "ccp_AddUser",
          errorLog: error,
          methodName: "getContactDetails",
          ViewName: "Create user page",
          InterfaceName: "CCP User Interface",
          EventName: "Fetching account data",
          ModuleName: "Create user"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  checkManageUser() {
    checkManageUser()
      .then((data) => {
        // if the user is not ManageUser, navigate to the home page
        if (!data) {
          this.navigateToHome();
        } else {
          // display all add User Page
          this.isManageUser = true;
        }
      })
      .catch((err) => {
        console.error("errors:" + JSON.stringify(err));
        let error = JSON.stringify(err);
        ErrorLog({
          lwcName: "ccp_AddUser",
          errorLog: err,
          methodName: "Check Manager User",
          ViewName: "Create user page",
          InterfaceName: "CCP User Interface",
          EventName: "Check admin user",
          ModuleName: "Create user"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  @wire(getUserServices, {
    userId: "$userId",
    refresh: 0
  })
  userServicesFun({ data, error }) {
    if (data) {
      this.allServices = data.filter((serv) =>
        serv.isActive === true
      ).map((ser) => {
        return {
          ...ser,
          isChecked: true
        }
      });

      data.forEach((serv) => {
        if (serv.apiName === 'E_invoice') {
          this.rbChecked = serv.isActive;
        } else if (serv.apiName === "FUSO_CCP_External_Financial_service") {
          this.fsChecked = serv.isActive;
        } else if (serv.apiName === "FUSO_CCP_External_Vehicle_management") {
          this.vmChecked = serv.isActive;
        }
      })

      console.log("alll servv", JSON.stringify(this.allServices))
      console.log("alll servv2", this.rbChecked)
      console.log("alll servv3", this.vmChecked)
      console.log("alll servv4", this.fsChecked)
    } else {
      console.error("User Services Fetching error: wire", error);
    }
  }

  handleInput(event) {
    const input = event.target;
    input.value = input.value.replace(/\D/g, "").slice(0, 16);
    this.validatePhone(input.value);
  }
  validatePhone() {
    const phoneRegex = /^\d{11}$/;
    return phoneRegex.test(this.phone);
  }

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
      .catch((err) => {
        console.error("Error loading language or labels: ", err);
        let error = JSON.stringify(err);
        ErrorLog({
          lwcName: "ccp_AddUser",
          errorLog: error,
          methodName: "Load Language",
          ViewName: "Create user page",
          InterfaceName: "CCP User Interface",
          EventName: "Loading language",
          ModuleName: "Create user"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  @track branchesModal = false;
  branchopen() {
    this.branchesModal = true;
  }
  branchClose() {
    this.branchesModal = false;
  }

  @wire(getbranchdetails) wiredBranches({ data, err }) {
    if (data) {

      this.branchoptions = data.map((vehicle) => {
        // Retrieve the Branch_Code__c value, ensuring it's a string
        const branchCode = vehicle?.Branch_Code__c?.toString() || '';

        // Pad the branchCode to ensure it's at least 3 characters long
        const paddedBranchCode = branchCode.padStart(3, '0');

        return {
          label: vehicle.Name,
          value: vehicle.Id,
          siebelAccountCode__c: vehicle?.Account__r?.siebelAccountCode__c,
          Branch_Code__c: paddedBranchCode,
          selected: false
        };
      });
    } else if (err) {
      console.error(err);
      let error = JSON.stringify(err);
      ErrorLog({
        lwcName: "ccp_AddUser",
        errorLog: error,
        methodName: "getBranchDetails",
        ViewName: "Create user page",
        InterfaceName: "CCP User Interface",
        EventName: "Loading branch details",
        ModuleName: "Create user"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }
  //   handleOutsideClick = (event) => {
  //     if (!this.template.querySelector(".dataDrop").contains(event.target)) {
  //       this.showList = false;
  //     }
  //   };

  // Custom Validation, Input Section -> Confirmation Section
  nextClick() {
    const MAX_CHARS = 10;
    const MAX_CHARS_LAST = 11;
    const MAX_CHARS_EMPLOYEECODE = 24;
    const emailFormat = /[\w.\-]+@[\w\-]+\.[\w.\-]+/;
    const onlyNumber = /^[0-9０-９]*$/;
    const fullAngleNumbers = /[０-９]+/;
    const fullAngleLetters = /[ａ-ｚＡ-Ｚ]+/;
    let lastName = this.template.querySelector('[name="lastName"]');
    let firstName = this.template.querySelector('[name="firstName"]');
    let lastNameKana = this.template.querySelector('[name="lastNameKana"]');
    let firstNameKana = this.template.querySelector('[name="firstNameKana"]');
    let email = this.template.querySelector('[name="email"]');
    let phone = this.template.querySelector('[name="phone"]');
    let mobilePhone = this.template.querySelector('[name="mobilePhone"]');
    let department = this.template.querySelector('[name="department"]');
    let title = this.template.querySelector('[name="title"]');
    let branchList = this.template.querySelector('[name="branchsss"]');
    let serviceBox = this.template.querySelector('[data-name="serviceBox"]');

    let employeeCode = this.template.querySelector('[name="employeeCode"]');

    if (this.template.querySelector('[name="baseService"]') != null) {
      this.baseService = this.template.querySelector(
        '[name="baseService"]'
      ).checked;
    }

    if (this.template.querySelector('[name="requestbook"]') != null) {
      this.requestbook = this.template.querySelector(
        '[name="requestbook"]'
      ).checked;
    }
    if (this.template.querySelector('[name="financialservice"]') != null) {
      this.financialservice = this.template.querySelector(
        '[name="financialservice"]'
      ).checked;
    }
    if (
      this.template.querySelector('[name="onlinemaintenancebooking"]') != null
    ) {
      this.onlinemaintenancebooking = this.template.querySelector(
        '[name="onlinemaintenancebooking"]'
      ).checked;
    }
    if (this.template.querySelector('[name="vehiclemanagement"]') != null) {
      this.vehiclemanagement = this.template.querySelector(
        '[name="vehiclemanagement"]'
      ).checked;
    }
    if (this.template.querySelector('[name="costmanagement"]') != null) {
      this.costmanagement = this.template.querySelector(
        '[name="costmanagement"]'
      ).checked;
    }

    // if (this.termServiceChecked && this.termDataChecked) {
    //       this.showCheckboxModal = false;
    //     } else {
    //       this.showCheckboxModal = true;
    //       return;
    //     }

    if (
      !firstNameKana.value ||
      !lastNameKana.value ||
      !firstName.value ||
      (!phone.value && !mobilePhone.value) ||
      !email.value ||
      this.branch.length == 0
    ) {
      // this.dispatchEvent(
      //   new ShowToastEvent({
      //     title: this.labels2.ccp_up_error7,
      //     message: this.labels2.ccp_up_requiredField7,
      //     variant: "error"
      //   })
      // );
    } else if (this.termServiceChecked && this.termDataChecked) {
      this.showCheckboxModal = false;
    } else {
      this.showCheckboxModal = true;
      return;
    }

    // the department verify not null and up to 24 characters
    if (department.value.length > MAX_CHARS_EMPLOYEECODE) {
      department.className = "form-input _error slds-input";
      this.departmentError = true;
      this.departmentErrorText = this.labels2.ccp_up_maxLength24Chars7;
    } else {
      department.className = "form-input";
      this.departmentError = false;
      this.departmentErrorText = "";
    }
    // the title/position verify not null and up to 24 characters
    if (title.value.length > MAX_CHARS_EMPLOYEECODE) {
      title.className = "form-input _error slds-input";
      this.titleError = true;
      this.titleErrorText = this.labels2.ccp_up_maxLength24Chars7;
    } else {
      title.className = "form-input";
      this.titleError = false;
      this.titleErrorText = "";
    }
    //phonenumber
    // if (phone.value.length > 11) {
    //   phone.className = "form-input _error slds-input";
    //   this.phoneError = true;
    //   this.phoneErrorText = "11桁以内に入力してください";
    // } else {
    //   phone.className = "form-input";
    //   this.phoneError = false;
    //   this.phoneErrorText = "";
    // }
    //employee code upto 24
    if (employeeCode.value.length > MAX_CHARS_EMPLOYEECODE) {
      employeeCode.className = "form-input _error slds-input";
      this.employeeCodeError = true;
      this.employeeCodeErrorText = this.labels2.ccp_up_maxLength24Chars7;
    } else {
      employeeCode.className = "form-input";
      this.employeeCodeError = false;
      this.employeeCodeErrorText = "";
    }
    // the lastName verify not null and up to 10 characters
    if (!lastName.value) {
      lastName.className =
        "form-input _error slds-form-element__control slds-input  invalid-input";
      this.lastNameError = true;
      this.lastNameErrorText = this.labels2.ccp_up_enterLastName7;
      window.scrollTo(0, 0);
    } else if (lastName.value.length > MAX_CHARS) {
      lastName.className = "form-input _error slds-input  invalid-input";
      this.lastNameError = true;
      this.lastNameErrorText = this.labels2.ccp_up_maxLength10Chars7;
      window.scrollTo(0, 0);
    } else {
      lastName.className = "form-input";
      this.lastNameError = false;
      this.lastNameErrorText = "";
    }
    // the firstName verify not null and up to 11 characters
    if (!firstName.value) {
      firstName.className =
        "form-input _error slds-form-element__control slds-input  invalid-input";
      this.firstNameError = true;
      this.firstNameErrorText = this.labels2.ccp_up_enterFirstName7;
      window.scrollTo(0, 0);
    } else if (firstName.value.length > MAX_CHARS) {
      firstName.className = "form-input _error slds-input  invalid-input";
      window.scrollTo(0, 0);
      this.firstNameError = true;
      this.firstNameErrorText = this.labels2.ccp_up_maxLength10Chars7;
    } else {
      firstName.className = "form-input";
      this.firstNameError = false;
      this.firstNameErrorText = "";
    }
    if (!lastNameKana.value) {
      lastNameKana.className =
        "form-input _error slds-form-element__control slds-input  invalid-input";
      this.lastNameKanaError = true;
      window.scrollTo(0, 0);
      this.lastNameKanaErrorText = this.labels2.ccp_up_enterLastName7;
    } else if (lastNameKana.value.length > MAX_CHARS) {
      lastNameKana.className = "form-input _error slds-input  invalid-input";
      this.lastNameKanaError = true;
      window.scrollTo(0, 0);
      this.lastNameKanaErrorText = this.labels2.ccp_up_maxLength10Chars7;
    } else {
      lastNameKana.className = "form-input";
      this.lastNameKanaError = false;
      this.lastNameKanaErrorText = "";
    }
    if (this.branch.length === 0) {
      // this.dispatchEvent(
      //   new ShowToastEvent({
      //     title: "エラー",
      //     message:
      //       "必須項目を入力してください。",
      //     variant: "error"
      //   })
      // )
      branchList.className = "Inputs1 invalid-input icon";
      this.branchError = true;
      window.scrollTo(0, 0);
      this.branchErrorText = this.labels2.ccp_up_selectAffiliation7;
    } else {
      this.branchErrorText = "";
      this.branchError = false;
      branchList.className = "Inputs1 icon";
    }
    
    if (!firstNameKana.value) {
      firstNameKana.className =
        "form-input _error slds-form-element__control slds-input  invalid-input";
      this.firstNameKanaError = true;
      window.scrollTo(0, 0);
      this.firstNameKanaErrorText = this.labels2.ccp_up_enterFirstName7;
    } else if (firstNameKana.value.length > MAX_CHARS) {
      firstNameKana.className = "form-input _error slds-input  invalid-input";
      this.firstNameKanaError = true;
      window.scrollTo(0, 0);
      this.firstNameKanaErrorText = this.labels2.ccp_up_maxLength10Chars7;
    } else {
      firstNameKana.className = "form-input";
      this.firstNameKanaError = false;
      this.firstNameKanaErrorText = "";
    }
    // the lastNameKana verify not null
    // if (!lastNameKana.value) {
    //   lastNameKana.className = "form-input _error slds-input";
    //   this.lastNameKanaError = true;
    //   this.lastNameKanaErrorText = "姓（フリガナ）を入力してください";
    // } else {
    //   lastNameKana.className = "form-input";
    //   this.lastNameKanaError = false;
    //   this.lastNameKanaErrorText = "";
    // }
    // the firstNameKana verify not null
    // if (!firstNameKana.value) {
    //   firstNameKana.className = "form-input _error slds-input";
    //   this.firstNameKanaError = true;
    //   this.firstNameKanaErrorText = "名（フリガナ）を入力してください";
    // } else {
    //   firstNameKana.className = "form-input";
    //   this.firstNameKanaError = false;
    //   this.firstNameKanaErrorText = "";
    // }

    phone.className = "form-input  slds-form-element__control slds-input";
    mobilePhone.className = "form-input  slds-form-element__control slds-input";
    // verify the phone and mobile cannot be empty at the same time
    if (!phone.value && !mobilePhone.value) {
      phone.className =
        "form-input _error slds-form-element__control slds-input  invalid-input";
      mobilePhone.className =
        "form-input _error slds-form-element__control slds-input  invalid-input";
      this.phoneError = true;
      window.scrollTo(0, 0);
      this.phoneErrorText = this.labels2.ccp_up_enterPhoneOrMobile7;
    } else if (
      (phone.value.length > 0 && !onlyNumber.test(phone.value)) ||
      (mobilePhone.value.length > 0 && !onlyNumber.test(mobilePhone.value))
    ) {
      if (phone.value.length > 0 && !onlyNumber.test(phone.value)) {
        phone.className =
          "form-input _error slds-form-element__control slds-input  invalid-input";
      }
      if (mobilePhone.value.length > 0 && !onlyNumber.test(mobilePhone.value)) {
        mobilePhone.className =
          "form-input _error slds-form-element__control slds-input  invalid-input";
      }
      this.phoneError = true;
      window.scrollTo(0, 0);
      this.phoneErrorText = this.labels2.ccp_up_phoneMobileHalfWidth7;
    } else {
      phone.className = "form-input";
      mobilePhone.className = "form-input";
      this.phoneError = false;
      this.phoneErrorText = "";
    }

    // the email verify not null, have correct email format and the same email does not exist for contacts under the same account
    if (!email.value) {
      email.className = "slds-form-element__control slds-input  invalid-input";
      this.emailError = true;
      window.scrollTo(0, 0);
      this.emailErrorText = this.labels2.ccp_up_enterEmail7;
    } else if (
      !emailFormat.test(email.value) ||
      fullAngleNumbers.test(email.value) ||
      fullAngleLetters.test(email.value)
    ) {
      // this.dispatchEvent(
      //   new ShowToastEvent({
      //     title: this.labels2.ccp_up_error7,
      //     message: this.labels2.ccp2_um_invalidEmailFormat8,
      //     variant: "error"
      //   })
      // );

      email.className = "slds-form-element__control slds-input  invalid-input";
      window.scrollTo(0, 0);
      this.emailError = true;
      this.emailErrorText = this.labels2.ccp_up_invalidEmailFormat7;
    } else {
      checkUserEmail({ email: email.value })
        .then((data) => {
          if (data != null && data != "" && data != undefined) {
            if (data[0] == "false" && data[1] == "false") {

              email.className = "slds-form-element__control slds-input";
              this.emailError = false;
              this.emailErrorText = "";
            } else if (data[0] == "true") {

              email.className = "slds-form-element__control slds-input  invalid-input";
              this.emailError = true;
              window.scrollTo(0, 0);
              this.emailErrorText = this.labels2.ccp_up_emailAlreadyUsed7;
            } else if (data[1] == "true") {

              email.className = "slds-form-element__control slds-input  invalid-input";
              this.emailError = true;
              window.scrollTo(0, 0);
              this.emailErrorText =
                this.labels2.ccp_up_contactSalesForRegistration7;
            }
          }

          // if the page not error can turn to next section
          if (
            !this.lastNameError &&
            !this.firstNameError &&
            !this.lastNameKanaError &&
            !this.firstNameKanaError &&
            !this.emailError &&
            !this.phoneError &&
            !this.branchError &&
            !this.servicesError &&
            !this.employeeCodeError &&
            !this.titleError &&
            !this.departmentError &&
            !this.showCheckboxModal
          ) {
            if (phone.value == "") {
              this.contactInputData.phone = "-";
            }
            if (mobilePhone.value == "") {
              this.contactInputData.mobilePhone = "-";
            }
            if (title.value == "") {
              this.contactInputData.title = "-";
            }
            if (department.value == "") {
              this.contactInputData.department = "-";
            }
            if (employeeCode.value == "") {
              this.contactInputData.employeeCode = "-";
            }
            this.showInputSection = false;
            this.showConfirmationSection = true;

            window.scrollTo(0, 0);
            this.showCompletionSection = false;
          } else {
            window.scrollTo(0, 0);
          }
        })
        .catch((err) => {
          console.error("checkUserEmail Errors:" + JSON.stringify(err));
          let error = JSON.stringify(err);
          ErrorLog({
            lwcName: "ccp_AddUser",
            errorLog: error,
            methodName: "NextClick",
            ViewName: "Create user page",
            InterfaceName: "CCP User Interface",
            EventName: "Moving to confirmation section",
            ModuleName: "Create user"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });
    }



    console.log('service errors', this.allServices)
    if(this.allServices.filter((a)=>a.isChecked).length === 0){
      serviceBox.className = "services-data invalid-input";
      this.servicesError = true;
      window.scrollTo(0, 0);
    }else{
      serviceBox.className = "services-data";
      this.servicesError = false;
    }

    // get input data
    this.contactInputData = {
      lastName: lastName.value,
      firstName: firstName.value,
      lastNameKana: lastNameKana.value,
      firstNameKana: firstNameKana.value,
      title: title.value,
      department: department.value,
      email: email.value,
      phone: phone.value,
      mobilePhone: mobilePhone.value,
      employeeCode: employeeCode.value
    };

    // if(title.value == ''){
    //   this.contactInputData.title = '-';
    // }
    // if(department.value == ''){
    //   this.contactInputData.department = '-';
    // }
    // if(employeeCode.value == ''){
    //   this.contactInputData.employeeCode = '-';
    // }
    // if(phone.value == ''){
    //   this.contactInputData.phone = '-';
    // }
    // if(mobilePhone.value == ''){
    //   this.contactInputData.mobilePhone = '-';
    // }
  }

  processNextStep() {
    if (
      !this.lastNameError &&
      !this.firstNameError &&
      !this.lastNameKanaError &&
      !this.firstNameKanaError &&
      !this.emailError &&
      !this.phoneError &&
      !this.branchError &&
      !this.servicesError &&
      !this.employeeCodeError &&
      !this.titleError &&
      !this.departmentError &&
      !this.showCheckboxModal
    ) {
      this.contactInputData.phone = phone.value.trim() || "-";
      this.contactInputData.mobilePhone = mobilePhone.value.trim() || "-";
      this.contactInputData.title = title.value.trim() || "-";
      this.contactInputData.department = department.value.trim() || "-";
      this.contactInputData.employeeCode = employeeCode.value.trim() || "-";

      this.showInputSection = false;
      this.showConfirmationSection = true;
      this.showCompletionSection = false;
    }
    window.scrollTo(0, 0);
  }
  // get the checked information
  handleCheckboxChange(event) {
    let checkName = event.target.name;
    let isChecked = event.target.checked;
    if (checkName == "termService") {
      this.termServiceChecked = isChecked;
    } else if (checkName == "termData") {
      this.termDataChecked = isChecked;
    }
    // get input data
    this.getInputData();
  }

  //
  handleCheckboxChange1(event) {
    console.log("1111");
    let checkName = event.target.dataset.name;
    console.log("22", checkName);
    let isChecked = event.target.checked;
    console.log("33", isChecked);


    if (checkName == "E_invoice") {
      this.rbChecked = isChecked;
      console.log("rbb", this.rbChecked);
    } else if (checkName == "FUSO_CCP_External_Financial_service") {
      this.fsChecked = isChecked;
      console.log("fss", this.fsChecked);
    } else if (checkName == "FUSO_CCP_External_Vehicle_management") {
      this.vmChecked = isChecked;
      console.log("vmm", this.vmChecked);
    }


    this.allServices = this.allServices.map(service => {
      if (service.apiName === checkName) {
        return { ...service, isChecked: isChecked };
      }
      return service;
    });

    console.log("all serv in change", JSON.stringify(this.allServices))
    // if (checkName == "baseService") {
    //   this.baseChecked = isChecked;
    // } else if (checkName == "requestbook") {
    //   this.rbChecked = isChecked;
    // } else if (checkName == "financialservice") {
    //   this.fsChecked = isChecked;
    // } else if (checkName == "onlinemaintenancebooking") {
    //   this.ombChecked = isChecked;
    // } else if (checkName == "vehiclemanagement") {
    //   this.vmChecked = isChecked;
    // } else if (checkName == "costmanagement") {
    //   this.cmChecked = isChecked;
    // }
    // get input data
    this.getInputData();
  }

  handleParagraphClick(event) {
    const checkName = event.currentTarget.getAttribute("data-checkbox");
    let checkbox;
    let newCheckedState;

    switch (checkName) {
      // case 'baseService':
      //     checkbox = this.template.querySelector('input[name="baseService"]');
      //     newCheckedState = !this.baseChecked;
      //     this.baseChecked = newCheckedState;
      //     break;
      case "requestbook":
        checkbox = this.template.querySelector('input[name="requestbook"]');
        newCheckedState = !this.rbChecked;
        this.rbChecked = newCheckedState;
        break;
      case "financialservice":
        checkbox = this.template.querySelector(
          'input[name="financialservice"]'
        );
        newCheckedState = !this.fsChecked;
        this.fsChecked = newCheckedState;
        break;
      case "onlinemaintenancebooking":
        checkbox = this.template.querySelector(
          'input[name="onlinemaintenancebooking"]'
        );
        newCheckedState = !this.ombChecked;
        this.ombChecked = newCheckedState;
        break;
      case "vehiclemanagement":
        checkbox = this.template.querySelector(
          'input[name="vehiclemanagement"]'
        );
        newCheckedState = !this.vmChecked;
        this.vmChecked = newCheckedState;
        break;
      case "costmanagement":
        checkbox = this.template.querySelector('input[name="costmanagement"]');
        newCheckedState = !this.cmChecked;
        this.cmChecked = newCheckedState;
        break;
    }

    if (checkbox) {
      checkbox.checked = newCheckedState;
      this.handleCheckboxChange({ target: checkbox });
    }
  }
  //   handleSearch(event) {
  //     this.searchTerm = event.target.value.toLowerCase();
  //   }

  get countofbranch() {
    if (this.branch.length === this.branchoptions.length) {
      return "すべて"; // All selected
    }
    return this.branch.length > 0 ? `${this.branch.length}件選択中` : "";
  }

  get filteredbranch() {
    if (!this.searchTerm) {
      return this.branchoptions;
    }
    return this.branchoptions.filter((veh) => {
      return veh.label.toLowerCase().includes(this.searchTerm);
    });
  }

  updateAllCheckboxUI() {
    let allCheckbox = this.template.querySelector('input[name="all"]');
    if (allCheckbox) {
      allCheckbox.checked = this.isAllBranchSelected;
    }
  }

  //   closeList() {
  //     this.showlist = false;
  //   }

  // handlebranchChange() {
  //   // this.selectbranchId = event.detail.value;
  //   let selectedBranch = "";
  //   for (let i = 0; i < this.branchoptions.length; i++) {
  //     if (this.branchoptions[i].value === this.selectbranchId) {
  //       selectedBranch = this.branchoptions[i];
  //       console.log("options", this.branchoptions);
  //       this.branchoptions = this.branchoptions.filter(
  //         (bran) => bran.value !== this.selectbranchId
  //       );
  //       console.log("options2", JSON.stringify(this.branchoptions));
  //       break;
  //     }
  //   }
  //   if (selectedBranch) {
  //     console.log("selectedBranch", selectedBranch);
  //     this.branch.push({
  //       Id: selectedBranch.value,
  //       Name: selectedBranch.label
  //     });
  //     this.branchDataForClass.push(selectedBranch.label);
  //   }
  //   this.selectbranchId = null;
  //   if (this.branchoptions.length == 0) {
  //     this.showlist = false;
  //   }
  //   // console.log("AddOpt",this.selectbranchId);
  //   // console.log("optfind",selectedBranch);
  //   // console.log('optfindstr11:', JSON.stringify(this.vehicle));
  //   // console.log('optfindstr:', JSON.stringify(selectedVehicle));
  //   // console.log("veh on updt",this.morevehicles);
  // }
  // handlebranchChange() {
  //   let selectedBranch = null;

  //   // Find the selected branch in options
  //   for (let i = 0; i < this.branchoptions.length; i++) {
  //     if (this.branchoptions[i].value === this.selectbranchId) {
  //       selectedBranch = this.branchoptions[i];
  //       break;
  //     }
  //   }

  //   if (selectedBranch) {
  //     console.log("Selected Branch Before Toggle:", JSON.stringify(selectedBranch));

  //     // Ensure this.branch and this.branchDataForClass exist
  //     if (!this.branch) this.branch = [];
  //     if (!this.branchDataForClass) this.branchDataForClass = [];

  //     // Check if branch is already selected
  //     let existingIndex = this.branch.findIndex(b => b.Id === selectedBranch.value);

  //     if (existingIndex !== -1) {
  //       // **Unselect (Remove from arrays)**
  //       this.branch.splice(existingIndex, 1);
  //       this.branchDataForClass = this.branchDataForClass.filter(label => label !== selectedBranch.label);
  //       selectedBranch.selected = false;
  //       console.log("Branch Unselected:", selectedBranch.label);
  //     } else {
  //       // **Select (Add to arrays)**
  //       this.branch.push({
  //         Id: selectedBranch.value,
  //         Name: selectedBranch.label
  //       });
  //       this.branchDataForClass.push(selectedBranch.label);
  //       selectedBranch.selected = true;
  //       console.log("Branch Selected:", selectedBranch.label);
  //     }

  //     // Ensure reactivity is maintained
  //     this.branchoptions = [...this.branchoptions];
  //   }

  //   this.selectbranchId = null; // Reset selected branch ID

  //   // Check if the branch options are empty
  //   this.showlist = this.branchoptions.length > 0;
  // }

  // @track isAllBranchSelected = false;

  get isAllBranchSelected() {
    return this.branchoptions.every((item) => item.selected);
  }
  handleAllBranchSelect(event) {
    const isChecked = event.target.checked; // Get checked state from event

    // Update all branches' selected status
    this.branchoptions = this.branchoptions.map((b) => ({
      ...b,
      selected: isChecked
    }));

    // Update branch lists based on selection
    this.branch = isChecked
      ? this.branchoptions.map((b) => {
        // Ensure Branch_Code__c is a string
        const branchCode = b.Branch_Code__c ? b.Branch_Code__c.toString() : '';

        // Pad the branchCode to ensure it's at least 3 characters long
        const paddedBranchCode = branchCode.padStart(3, '0');

        return {
          Id: b.value,
          Name: b.label,
          siebelAccountCode__c: b.siebelAccountCode__c,
          Branch_Code__c: paddedBranchCode
        };
      })
      : [];

    if (this.branch.length > 0) {
      this.allBranchesData = {
        firstbranch: this.branch[0].Name, // Display name
        firstbranchreal: this.branch[0].Name, // Tooltip title
        onscreenbranchcount: this.branch.length - 1
      };

      this.morethanonebranch = this.branch.length > 1;
    }
    this.branchDataForClass = isChecked
      ? this.branchoptions.map((b) => b.label)
      : [];
    // Ensure UI updates
    this.branch.forEach((branch) => {
      if (branch.Branch_Code__c) {
        let prefix = "";
        if (branch.Branch_Code__c !== undefined && branch.Branch_Code__c !== null) {
          if (branch.Branch_Code__c >= 0 && branch.Branch_Code__c <= 9) {
            prefix = "00";
          } else if (branch.Branch_Code__c >= 10 && branch.Branch_Code__c <= 99) {
            prefix = "0";
          } else {
            prefix = " ";
          }
        }
        branch.Branch_Code__c = prefix + branch.Branch_Code__c;
        console.log("branch.Branch_Code__c", branch.Branch_Code__c);
      } else {
        // Handle case where Branch_Code__c is missing or not a valid number
        this.showone = false; // or any other logic you'd like
      }
    });
    this.branchoptions = [...this.branchoptions];
  }

  handleDeleteBranch(event) {
    let branchId = event.currentTarget.dataset.id;

    // Find the deleted branch from branch array
    const deletedBranchFromBranchArray = this.branch.find(
      (branch) => branch.Id === branchId
    );
    if (deletedBranchFromBranchArray) {
      this.branchoptions = [
        ...this.branchoptions,
        {
          label: deletedBranchFromBranchArray.Name,
          value: deletedBranchFromBranchArray.Id
        }
      ];
    }

    // Push the deleted branch ID to deletedBranchIds array
    this.deletedBranchIds.push(branchId);

    // Remove the branch from branch array
    this.branch = this.branch.filter((branch) => branch.Id !== branchId);

    if (this.branch.length > 0) {
      this.allBranchesData = {
        firstbranch: this.branch[0].Name, // Display name
        firstbranchreal: this.branch[0].Name, // Tooltip title
        onscreenbranchcount: this.branch.length - 1
      };

      this.morethanonebranch = this.branch.length > 1;
    }

    // Add the deleted branch back to another array if needed

    // Clear the selected branch ID
    branchId = "";
  }

  getInputData() {
    this.contactInputData = {
      lastName: this.template.querySelector('[name="lastName"]').value,
      firstName: this.template.querySelector('[name="firstName"]').value,
      lastNameKana: this.template.querySelector('[name="lastNameKana"]').value,
      firstNameKana: this.template.querySelector('[name="firstNameKana"]')
        .value,
      title: this.template.querySelector('[name="title"]').value,
      department: this.template.querySelector('[name="department"]').value,
      email: this.template.querySelector('[name="email"]').value,
      phone: this.template.querySelector('[name="phone"]').value,
      mobilePhone: this.template.querySelector('[name="mobilePhone"]').value,
      employeeCode: this.template.querySelector('[name="employeeCode"]').value
    };
  }

  // Confirmation Section -> Input Section
  back2InputClick() {
    if (this.contactInputData.department == "-") {
      this.contactInputData.department = "";
    }
    if (this.contactInputData.title == "-") {
      this.contactInputData.title = "";
    }
    if (this.contactInputData.employeeCode == "-") {
      this.contactInputData.employeeCode = "";
    }
    if (this.contactInputData.phone == "-") {
      this.contactInputData.phone = "";
    }
    if (this.contactInputData.mobilePhone == "-") {
      this.contactInputData.mobilePhone = "";
    }
    this.showInputSection = true;
    this.showConfirmationSection = false;
    this.showCompletionSection = false;
    window.scrollTo(0, 0);
  }

  nextButtonCSS() {
    // let nextButton = this.template.querySelector('[name="nextButton"]');
    // // if the two terms not check, the next button is disable
    // if (nextButton != null) {
    //   if (this.termServiceChecked && this.termDataChecked) {
    //     nextButton.className = "primary_nextbtn--m";
    //   } else {
    //     nextButton.className = "primary_nextbtn--m disabled";
    //   }
    // }
  }

  // Confirmation Section -> Completion Section
  confirmClick() {
    this.isLoading = true;
    createContact({
      accountId: this.contactData.accountId,
      accountCode: this.contactData.accountCode,
      contactInputDataStr: JSON.stringify(this.contactInputData)
    })
      .then((data) => {
        let contactID = data;

        if (data != null) {
          // create a new user according to the Info of contact
          createUser({
            contactId: data,
            accountCode: this.contactData.accountCode,
            contactInputDataStr: JSON.stringify(this.contactInputData),
            vmChecked: this.vmChecked,
            rbChecked: this.rbChecked,
            fsChecked: this.fsChecked,
            vrChecked: false,
            ombChecked: false,
            cmChecked: false
            // fsChecked: this.fsChecked,
            // ombChecked: this.ombChecked,
            // vmChecked: this.vmChecked,
            // cmChecked: this.cmChecked
          })
            .then((data) => {
              if (data != null) {
                this.isLoading = false;
                window.scrollTo(0, 0);
                // turn to success page when contact and user create success
                this.showInputSection = false;
                this.showConfirmationSection = false;
                this.showCompletionSection = true;
              }
            })
            .catch((error) => {
              this.isLoading = false;
              console.error("createUser Errors:" + JSON.stringify(error));
            });
          const BranchIdsToAdd = this.branch.map((vehicle) => vehicle.Id);
          createBranch({
            accountId: this.contactData.accountId,
            contactId: contactID,
            branches: BranchIdsToAdd
          })
            .then((data) => {

            })
            .catch((error) => {
              this.isLoading = false;
              console.error("createUser Errors:" + JSON.stringify(error));
            });
        }
        sessionStorage.removeItem("ongoingTransaction");
      })
      .catch((error) => {
        this.isLoading = false;
      });
  }

  // back to home page
  navigateToHome() {
    let baseUrl = window.location.href;
    let homeUrl;
    if (baseUrl.indexOf("/s/") != -1) {
      homeUrl = baseUrl.split("/s/")[0] + "/s/usermanagement";
    }
    window.location.href = homeUrl;
  }

  userTypeJudgment() {
    userTypeJudgment()
      .then((data) => {
        if (!data) {
          this.navigateToHome();
        }
      })
      .catch((err) => {
        console.error("userTypeJudgment errors:" + JSON.stringify(err));
        let error = JSON.stringify(err);
        ErrorLog({
          lwcName: "ccp_AddUser",
          errorLog: error,
          methodName: "userTypeJudgement",
          ViewName: "Create user page",
          InterfaceName: "CCP User Interface",
          EventName: "User type",
          ModuleName: "Create user"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  returnTop() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") != -1) {
      window.location.href = baseUrl.split("/s/")[0] + "/s/usermanagement";
    }
  }
  saveSelections() {
    this.updateSelectedLabels();
    this.toggleDropdown();
  }

  handleInsideClick(event) {
    event.stopPropagation();
  }

  handleOutsideClick = (event) => {
    const dataDropElement = this.template.querySelector(".dataDrop");
    const listsElement = this.template.querySelector(".lists");
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlist = false;
    }
  };

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
  }

  handleCancel() {
    this.showCancelModal = true;
  }
  handleNo() {
    this.showCancelModal = false;
    this.isManageUser = true;
  }
  handleYes() {
    sessionStorage.removeItem("ongoingTransaction");
    this.showCancelModal = false;
  }
  handleOk() {
    this.showCheckboxModal = false;
  }

  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    if (value.length > maxLength) {
      // event.target.value = value.substring(0, maxLength);
      event.target.blur();
    }
  }

  handlebranChange(event) {
    event.stopPropagation();
    this.showlist = !this.showlist;
    if (this.branchoptions.length == 0) {
      this.showlist = false;
    }
  }

  get filteredbranch() {
    if (!this.searchTerm) {
      return this.branchoptions;
    }
    return this.branchoptions.filter((veh) => {
      return veh.label.toLowerCase().includes(this.searchTerm);
    });
  }
  handleBranchSelect(event) {
    if (this.branchoptions.length == 1) {
      this.showlist = false;
    }
    this.selectbranchId = event.currentTarget.dataset.id;
    this.handlebranchChange();
  }

  handlebranchChange() {
    let selectedBranch = "";
    for (let i = 0; i < this.branchoptions.length; i++) {
      if (this.branchoptions[i].value === this.selectbranchId) {
        selectedBranch = this.branchoptions[i];
        this.branchoptions = this.branchoptions.filter(
          (bran) => bran.value !== this.selectbranchId
        );
        break;
      }
    }
    if (selectedBranch) {
      this.branch.push({
        Id: selectedBranch.value,
        Name: selectedBranch.label,
        siebelAccountCode__c: selectedBranch?.siebelAccountCode__c,
        Branch_Code__c: selectedBranch?.Branch_Code__c?.toString().padStart(3, '0') || '000'
      });

      if (this.branch.length > 0) {
        this.allBranchesData = {
          firstbranch: this.branch[0].Name, // Display name
          firstbranchreal: this.branch[0].Name, // Tooltip title
          onscreenbranchcount: this.branch.length - 1
        };

        this.morethanonebranch = this.branch.length > 1;
      }
      this.branchDataForClass.push(selectedBranch.label);
    }
    this.selectbranchId = null;
    if (this.branchoptions.length == 0) {
      this.showlist = false;
    }
  }

  // get servlen() {
  //   return this.rbChecked === false && this.fsChecked === false;
  // }
  navigateToHomepage() {
    let baseUrl = window.location.href;
    let homeUrl;
    if (baseUrl.indexOf("/s/") != -1) {
      homeUrl = baseUrl.split("/s/")[0];
    }
    window.location.href = homeUrl;
  }

  get selectedServices() {
    return this.allServices.every((ser) => !ser.isChecked)
  }

  /**
     * 最新の利用規約のIDとURLを取得
     */
  fetchTermsUrls() {
    getLatestTermsUrls()
        .then(data => {
            console.log("Latest Terms Data:", JSON.stringify(data));

            this.termsUrls = {
                CCP: {
                    id: data?.CCP?.Id || null,
                    url: `/resource/${data?.CCP?.pdf_Url}` || null
                },
                DTFSA: {
                    id: data?.DTFSA?.Id || null,
                    url: `/resource/${data?.DTFSA?.pdf_Url}` || null
                },
                EInvoice: {
                    id: data?.["E-Invoice"]?.Id || null,
                    url: `/resource/${data?.["E-Invoice"]?.pdf_Url}` || null
                }
            };

            console.log("Processed Terms Data:", JSON.stringify(this.termsUrls));
        })
        .catch(error => {
            console.error('Error fetching Latest Terms Data:', error);
        });
  }

}
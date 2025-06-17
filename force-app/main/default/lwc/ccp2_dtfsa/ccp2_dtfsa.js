import { LightningElement, track, wire } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";

import Id from "@salesforce/user/Id";
import { getRecord } from "lightning/uiRecordApi";
import CONTACT_ID_FIELD from "@salesforce/schema/User.ContactId";
import getBasicInfo from "@salesforce/apex/CCP2_userController.userBasicInfo";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
// import getUserServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import getUrlValues from "@salesforce/apex/CCP2_DashboardController.defaultDtfsa";
import dtfsaNotification from "@salesforce/apex/CCP2_DashboardController.dtsfaNotification";
import dtfsaDoc from "@salesforce/apex/CCP2_OTCSCALLouts.getWebCCReport";
import createlog from "@salesforce/apex/CCP2_OTCSCALLouts.insertDTFSA";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import { refreshApex } from "@salesforce/apex";
import CCP_Einvoice_Download_URL_Domain from "@salesforce/label/c.CCP_Einvoice_Download_URL_Domain";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

const dropdownImg =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";

const nosearch =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/NoVehicles.png";

const help1 = Vehicle_StaticResource + "/CCP2_Resources/Common/dtfsa1.webp";

const help2 = Vehicle_StaticResource + "/CCP2_Resources/Common/dtfsa2.webp";

export default class Ccp2_dtfsa extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  dropdownImg = dropdownImg;
  nosearch = nosearch;
  help1 = help1;
  help2 = help2;
  userId = Id;
  contactId;

  outsideClickHandlerAdded = false;
  @track isDropdownOpen = false;
  @track isAccountSelected = true;
  @track isVehicleSelected = false;
  @track selectedCheckboxes = [];
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  @track isGuestuser = false;
  //start date and end date
  @track startDate;
  @track startDatetosend;
  @track endDate;
  @track endDatetosend;
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
    {
      label: "ご契約一覧",
      isChecked: true,
      description: "簡易的なご契約内容の一覧"
    },
    {
      label: "お支払集計表",
      isChecked: true,
      description: "発行日以降6か月分の引落予定表"
    },
    {
      label: "約定代金明細書",
      isChecked: true,
      description: "約定日に引落される代金の明細"
    },
    {
      label: "お支払明細書",
      isChecked: true,
      description: "ご契約ごとのお支払予定表"
    },
    {
      label: "リース取引注記明細表",
      isChecked: true,
      description: "リース会計基準に基づく会計処理用の参考資料"
    },
    { label: "約定代金請求書(振込)", isChecked: true, description: "" }
  ];

  @track vehicleCheckboxes = [
    {
      label: "ご契約一覧",
      isChecked: true,
      description: "簡易的なご契約内容の一覧"
    }
  ];

  userDetailData = {
    id: null,
    firstName: null,
    lastName: null,
    accountname: null,
    siebelAccountCode: null
  };

  @track notificationDetails;
  @track notificationId;
  @track searchDtfsaDocs;
  @track encryptedJson = "";
  @track targetfileName = "";
  @track ellpName = "";
  @track targetdataId = "";
  @track totalIssueCount = 0;
  @track fileStatuses = [];

  //selected
  @track updatedSelectedItemslist = [];
  @track isModalOpen = false;
  @track isShowReissueModal = false;
  @track isShowReissueModal2 = false;

  //isalll
  @track isAllselected = false;

  //loader
  @track showSearchPageLoader = false;

  //click here modal
  @track openHelpmodal = false;

  //permissions
  // @track allServices = [];
  // @track hasDTFSA = true;

  //server
  @track serverError = false;

  @track emailNotif = false;

  @wire(getRecord, {
    recordId: "$userId",
    fields: [CONTACT_ID_FIELD]
  })
  userRecord({ error, data }) {
    if (data) {
      this.contactId = data.fields.ContactId.value;
    } else if (error) {
      console.error("Error fetching user record:", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_dtfsa",
        errorLog: err,
        methodName: "userRecord",
        ViewName: "DTFSA",
        InterfaceName: "CCP User Interface",
        EventName: "Fetching contact Id",
        ModuleName: "DTFSA"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @wire(getBasicInfo, { ContactId: "$contactId", refresh: 0 })
  fetUserInfo({ data, error }) {
    if (data) {
      console.log("data in wire", data);
      this.emailNotif = data.LeaseEmail;
      console.log(
        "data data.LeaseEmail",
        data.LeaseEmail,
        typeof data.LeaseEmail
      );

      this.userDetailData = {
        accountname: data.AccountName == null ? "-" : data.AccountName,
        firstName: data.FirstName == null ? "-" : data.FirstName,
        lastName: data.LastName == null ? "-" : data.LastName,
        siebelAccountCode:
          data.AccountSiebelAccountCode == null
            ? "-"
            : data.AccountSiebelAccountCode,
        id: data.Id == null ? "-" : data.Id
      };
    } else if (error) {
      console.error("error,userrrsss", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_dtfsa",
        errorLog: err,
        methodName: "fetUserInfo",
        ViewName: "DTFSA",
        InterfaceName: "CCP User Interface",
        EventName: "Fetching user info",
        ModuleName: "DTFSA"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @wire(dtfsaNotification)
  handleNotifications({ data, error }) {
    if (data) {
      console.log("notif-dtfsa", data);
      this.notificationDetails = data.map((notification) => ({
        Id: notification.Id,
        CorrectFlag: notification.CorrectFlag__c,
        CreatedDate: notification.CreatedDate
          ? this.formatJapaneseDate(notification.CreatedDate)
          : null,
        NotificationCreatedDate: notification.Notification_CreatedDate__c
          ? notification.Notification_CreatedDate__c
          : null,
        Description: notification.Description__c,
        NotificationType: notification.Notification_Type__c,
        reissue: notification.CorrectFlag__c === "1",
        docTypes: this.splitDocTypes(notification.Doc_Type__c)
      }));
    } else {
      console.error("error in notifications", error);
    }
  }

  get notificationLength() {
    return this.notificationDetails ? this.notificationDetails.length : 0;
  }

  // @wire(getUserServices, {
  //   userId: "$userId",
  //   refresh: 0
  // })
  // userServicesFun({ data, error }) {
  //   if (data) {
  //     this.allServices = data;

  //     this.allServices.forEach((serv) => {
  //       if (serv.apiName === "FUSO_CCP_External_Financial_service") {
  //         this.hasDTFSA = serv.isActive;
  //         if (this.hasDTFSA === false) {
  //           let baseUrl = window.location.href;
  //           let Newurl;
  //           if (baseUrl.indexOf("/s/") !== -1) {
  //             Newurl = baseUrl.split("/s/")[0] + "/s/error";
  //           }
  //           window.location.href = Newurl;
  //         }
  //       }
  //     });
  //   } else {
  //     console.error("User Services Fetching error: wire", error);
  //   }
  // }

  splitDocTypes(docTypeString) {
    return docTypeString
      ? docTypeString.split(",").map((type) => type.trim())
      : [];
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
      .then(() => {})
      .catch((error) => {
        console.error("Error loading language or labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_dtfsa",
          errorLog: err,
          methodName: "LoadLanguage",
          ViewName: "DTFSA",
          InterfaceName: "OTCS Server",
          EventName: "Loading language",
          ModuleName: "DTFSA"
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

  labels2 = {};
  loadLabels() {
    fetch(`${labelsUser}/infoCenter.json`)
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
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_dtfsa",
          errorLog: err,
          methodName: "loadLabels",
          ViewName: "DTFSA",
          InterfaceName: "OTCS Server",
          EventName: "Loading labels",
          ModuleName: "DTFSA"
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
    if (this.Languagei18n === "en_US") return "en";
    return "jp";
  }

  connectedCallback() {
    const urlParamsInstance = new URLSearchParams(window.location.search).get(
      "instance"
    );
    if (urlParamsInstance) {
      this.notificationId = urlParamsInstance;
      this.apexdatacall();
    }
    this.generateMonthOptions();
    this.preselectCurrentMonth();
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap";
    link.rel = "stylesheet";
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.dropdownImg})`
    );
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      this.loadLanguage();
    }
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      document.addEventListener("click", this.handleOutsideClick3.bind(this));
      this.outsideClickHandlerAdded = true;
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
    document.removeEventListener("click", this.handleOutsideClick2.bind(this));
    document.removeEventListener("click", this.handleOutsideClick3.bind(this));
  }
  get isAllAccountsChecked() {
    return this.accountCheckboxes.every((item) => item.isChecked);
  }

  get isAllVehiclesChecked() {
    return this.vehicleCheckboxes.every((item) => item.isChecked);
  }

  @track notificationFillData;

  apexdatacall() {
    getUrlValues({ notificationId: this.notificationId })
      .then((result) => {
        console.log("result from idd,", result);
        if (result.StartEnd) {
          let [year, month] = result.StartEnd.split("-").map(Number);
          if (year && month) {
            month = month < 10 ? `0${month}` : month; // Ensure two-digit month format
            this.startDate = `${year}-${month}`;
            this.startDatetosend = `${year}${month}`;
            this.endDate = this.startDate;
            this.endDatetosend = this.startDatetosend;
            // this.updateEndDateOptions();
          }
        }

        this.accountCheckboxes = this.accountCheckboxes.map((item) => ({
          ...item,
          isChecked: result[item.label] === true
        }));

        this.vehicleCheckboxes = this.vehicleCheckboxes.map((item) => ({
          ...item,
          isChecked: result[item.label] === true
        }));

        this.updateSelectedCheckboxes();
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_dtfsa",
          errorLog: err,
          methodName: "dataurl",
          ViewName: "DTFSA",
          InterfaceName: "OTCS Server",
          EventName: "Prefilling data when coming from notification",
          ModuleName: "DTFSA"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  get areAllSelected() {
    return this.isAllAccountsChecked && this.isAllVehiclesChecked;
  }

  get areanyselected() {
    return (
      this.accountCheckboxes.some((item) => item.isChecked) ||
      this.vehicleCheckboxes.some((item) => item.isChecked)
    );
  }

  get selectedCount() {
    return this.selectedCheckboxes.length;
  }

  get accountButtonContainerClass() {
    return this.isAccountSelected
      ? "border-right-red left-label-drop"
      : "left-label-drop";
  }

  get vehicleButtonContainerClass() {
    return this.isVehicleSelected
      ? "border-right-red left-label-drop"
      : "left-label-drop";
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

    if (event.target.name === "account") {
      const checkbox = this.accountCheckboxes.find(
        (item) => item.label === value
      );
      checkbox.isChecked = isChecked;
      if (value === "ご契約一覧") {
        const vehicleCheckbox = this.vehicleCheckboxes.find(
          (item) => item.label === value
        );
        if (vehicleCheckbox) {
          vehicleCheckbox.isChecked = isChecked;
        }
      }
    } else if (event.target.name === "vehicle") {
      const checkbox = this.vehicleCheckboxes.find(
        (item) => item.label === value
      );
      checkbox.isChecked = isChecked;
      if (value === "ご契約一覧") {
        const accountCheckbox = this.accountCheckboxes.find(
          (item) => item.label === value
        );
        if (accountCheckbox) {
          accountCheckbox.isChecked = isChecked;
        }
      }
    }

    this.updateSelectedCheckboxes();
  }

  handleSelectAllAccounts(event) {
    event.stopPropagation();
    const isChecked = event.target.checked;
    this.accountCheckboxes = this.accountCheckboxes.map((item) => {
      return { ...item, isChecked: isChecked };
    });
    if (isChecked) {
      const vehicleCheckbox = this.vehicleCheckboxes.find(
        (item) => item.label === "ご契約一覧"
      );
      if (vehicleCheckbox) {
        vehicleCheckbox.isChecked = true;
      }
    } else {
      // If deselecting all, ensure 'ご契約一覧' is also deselected in vehicles
      const vehicleCheckbox = this.vehicleCheckboxes.find(
        (item) => item.label === "ご契約一覧"
      );
      if (vehicleCheckbox) {
        vehicleCheckbox.isChecked = false;
      }
    }
    this.updateSelectedCheckboxes();
  }

  handleSelectAllVehicles(event) {
    event.stopPropagation();
    const isChecked = event.target.checked;
    this.vehicleCheckboxes = this.vehicleCheckboxes.map((item) => {
      return { ...item, isChecked: isChecked };
    });
    if (isChecked) {
      const accountCheckbox = this.accountCheckboxes.find(
        (item) => item.label === "ご契約一覧"
      );
      if (accountCheckbox) {
        accountCheckbox.isChecked = true;
      }
    } else {
      // If deselecting all, ensure 'ご契約一覧' is also deselected in accounts
      const accountCheckbox = this.accountCheckboxes.find(
        (item) => item.label === "ご契約一覧"
      );
      if (accountCheckbox) {
        accountCheckbox.isChecked = false;
      }
    }
    this.updateSelectedCheckboxes();
  }

  // updateSelectedCheckboxes() {
  //     const selectedAccounts = this.accountCheckboxes.filter(item => item.isChecked).map(item => item.label);
  //     const selectedVehicles = this.vehicleCheckboxes.filter(item => item.isChecked).map(item => item.label);

  //     this.selectedCheckboxes = [...selectedAccounts, ...selectedVehicles];
  // }

  updateSelectedCheckboxes() {
    const selectedSet = new Set();

    this.accountCheckboxes.forEach((item) => {
      if (item.isChecked) {
        selectedSet.add(item.label);
      }
    });

    this.vehicleCheckboxes.forEach((item) => {
      if (item.isChecked) {
        selectedSet.add(item.label);
      }
    });

    this.selectedCheckboxes = Array.from(selectedSet);
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
        value: `${year}-${month < 10 ? "0" + month : month}`,
        disabled: false,
        cssClass: "dropdown-item"
      });
    }

    this.startMonthOptions = [...options];
    this.endMonthOptions = [...options];
  }

  preselectCurrentMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    this.startDate = `${year}-${month < 10 ? "0" + month : month}`;
    this.startDatetosend = this.startDate.replace("-", "");
    this.endDate = this.startDate;
    this.endDatetosend = this.startDate.replace("-", "");
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
    const selectedOption = this.startMonthOptions.find(
      (option) => option.value === selectedValue
    );

    // Prevent selection if the option is disabled
    if (selectedOption.disabled) {
      event.stopPropagation();
      return; // Do nothing if the option is disabled
    }
    this.startDate = selectedValue;
    this.startDatetosend = this.startDate.replace("-", "");
    this.isStartDropdownOpen = false;
    this.updateEndDateOptions();
  }

  handleEndDateSelect(event) {
    const selectedValue = event.currentTarget.dataset.value;
    const selectedOption = this.endMonthOptions.find(
      (option) => option.value === selectedValue
    );

    if (selectedOption.disabled) {
      event.stopPropagation();
      return;
    }
    this.endDate = selectedValue;
    this.endDatetosend = this.endDate.replace("-", "");
    this.isEndDropdownOpen = false;
    this.updateStartDateOptions();
  }

  // Update end date options based on selected start date
  updateEndDateOptions() {
    const [startYear, startMonth] = this.startDate.split("-").map(Number);

    this.endMonthOptions = this.endMonthOptions.map((option) => {
      const [optYear, optMonth] = option.value.split("-").map(Number);

      if (
        optYear < startYear ||
        (optYear === startYear && optMonth < startMonth)
      ) {
        return {
          ...option,
          disabled: true,
          cssClass: "dropdown-item dropdown-item-disabled"
        };
      } else {
        return {
          ...option,
          disabled: false,
          cssClass: "dropdown-item"
        };
      }
    });
  }

  updateStartDateOptions() {
    const [endYear, endMonth] = this.endDate.split("-").map(Number);

    this.startMonthOptions = this.startMonthOptions.map((option) => {
      const [optYear, optMonth] = option.value.split("-").map(Number);

      if (optYear > endYear || (optYear === endYear && optMonth > endMonth)) {
        return {
          ...option,
          disabled: true,
          cssClass: "dropdown-item dropdown-item-disabled"
        };
      } else {
        return {
          ...option,
          disabled: false,
          cssClass: "dropdown-item"
        };
      }
    });
  }

  get startDateLabel() {
    const selectedOption = this.startMonthOptions.find(
      (option) => option.value === this.startDate
    );
    return selectedOption ? selectedOption.label : "Select a Start Date";
  }

  get endDateLabel() {
    const selectedOption = this.endMonthOptions.find(
      (option) => option.value === this.endDate
    );
    return selectedOption ? selectedOption.label : "Select an End Date";
  }
  handleSearchclick() {
    // Reset errors before validation
    this.branchNameError = false;
    this.regError = false;
    this.branchNameclass = "dropdown";

    const isBranchEmpty =
      this.selectedCheckboxes.length === 0 &&
      !this.isAllAccountsChecked &&
      !this.isAllVehiclesChecked;
    const hasInvalidRegNum =
      this.registrationNum &&
      (this.registrationNum.includes("-") ||
        this.registrationNum.includes("ー"));

    if (isBranchEmpty || hasInvalidRegNum) {
      if (isBranchEmpty) {
        this.branchNameError = true;
        window.scrollTo(0, 0);
        this.branchNameclass = "dropdown branch-error";
      }
      if (hasInvalidRegNum) {
        this.regError = true;
        window.scrollTo(0, 0);
      }
      return; // Exit function if validation fails
    }

    // Proceed with search if validation passes
    this.showSearchPageLoader = true;

    // Filter selected vehicles
    const selectedVehicles = this.vehicleCheckboxes
      .filter((item) => item.isChecked)
      .map((item) => item.label)
      .join(",");
    // Execute search function
    this.searchData();
  }

  @track wiredresult;

  async searchData() {
    let combinedLabels = [
      ...this.accountCheckboxes
        .filter((item) => item.isChecked)
        .map((item) => item.label),
      ...this.vehicleCheckboxes
        .filter((item) => item.isChecked)
        .map((item) => item.label)
    ].join(",");
    dtfsaDoc({
      CustomerCD: this.userDetailData.siebelAccountCode,
      DocName: combinedLabels,
      ContractNum1: this.contractNum,
      RegNum1: this.registrationNum,
      DateFrom: this.startDatetosend,
      DateTo: this.endDatetosend
    })
      .then((result) => {
        console.log("dtfsa doc result is here : - ", result);
        this.wiredresult = result[0];
        let userDataCount = result[1]?.userDataCount;

        this.searchDtfsaDocs = this.wiredresult.rows.map((doc) => {
          let issueCount = 0;

          for (const key in userDataCount) {
            if (key === doc.DataId) {
              issueCount = userDataCount[key];
              break;
            }
          }

          return {
            dataId: doc.DataId ? doc.DataId : "",
            contractNumber: doc.contractNumber ? doc.contractNumber : "-",
            customerCD: doc.customerCD ? doc.customerCD : "",
            fileName: doc.FileName ? doc.FileName : "",
            customerNumber: doc.customerNumber ? doc.customerNumber : "-",
            documentName: doc.documentName ? doc.documentName : "",
            issuedate: doc.issuedate
              ? this.formatJapaneseDate(doc.issuedate)
              : "-",
            registrationNumber: doc.registrationNumber
              ? doc.registrationNumber
              : "-",
            encryptedJson: doc.encryptedJson ? doc.encryptedJson : "",
            issueCount: issueCount || 0,
            selected: false,
            ellpName: doc.FileName ? doc.FileName.substring(0, 24) + "..." : ""
          };
        });

        this.showSearchPageLoader = false;
        this.updatedSelectedItemslist = [];

        console.log("this.searchDtfsaDocs", this.searchDtfsaDocs);
      })
      .catch((err) => {
        console.error("dtfsa doc errors", err);
        this.showSearchPageLoader = false;
        if (err.body.message === "Status Code: 500") {
          this.serverError = true;
        } else if (err.body.message === "Status Code: 502") {
          this.serverError = true;
        } else if (err.body.message === "Status Code: 503") {
          this.serverError = true;
        } else {
          this.serverError = false;
        }
      });
  }

  get searchLength() {
    return this.searchDtfsaDocs.length;
  }
  handleReset() {
    this.accountCheckboxes = this.accountCheckboxes.map((item) => ({
      ...item,
      isChecked: true
    }));

    this.vehicleCheckboxes = this.vehicleCheckboxes.map((item) => ({
      ...item,
      isChecked: true
    }));
    this.updateSelectedCheckboxes();
    this.preselectCurrentMonth();
    this.branchNameError = false;
    this.branchNameclass = "dropdown";
    this.registrationNum = "";
    this.contractNum = "";
    this.regError = false;
  }

  @track regError = false;

  handleRegistrationInput(event) {
    // this.handlevalchange(event);
    // this.registrationNum = event.target.value;
    this.registrationNum = event.target.value.replace(/^\s+/, "");
    event.target.value = this.registrationNum;
  }

  get errorClass() {
    return this.regError === true ? "input-box errorinput" : "input-box";
  }

  handleContractInput(event) {
    // this.handlevalchange(event);
    const input = event.target;
    const halfWidthRegex = /^[A-Za-z0-9\-]*$/;
    const halfkatakana = /^[\uFF65-\uFF9F]*$/;
    if (!halfWidthRegex.test(input.value)) {
      event.target.blur();
    }
    const specialCharPattern = /[^a-zA-Z0-9\-]/g;
    const cleanedPhone = input.value.replace(specialCharPattern, "");
    input.value = cleanedPhone;
    this.contractNum = input.value;
  }

  handleOutsideClick = (event) => {
    const dataDropElement = this.template.querySelector(
      ".dropdown-wrapper-date"
    );
    const listsElement = this.template.querySelector(".dropdown-list-date");

    const clickedOption = event.target.closest(".dropdown-item-disabled");

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
    const dataDropElement = this.template.querySelector(
      ".dropdown-wrapper-date"
    );
    const listsElement = this.template.querySelector(".dropdown-list-date");

    const clickedOption = event.target.closest(".dropdown-item-disabled");

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
    const dataDropElement = this.template.querySelector(".dropdown-content");

    if (dataDropElement && !dataDropElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  };

  handleInsideClick(event) {
    event.stopPropagation();
  }

  formatJapaneseDate(isoDate) {
    if (isoDate === undefined || !isoDate || isoDate === "-") {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}年${month}月${day}日`;
  }

  get allfilesdownloaded() {
    return this.fileStatuses && this.fileStatuses.length > 0
      ? this.fileStatuses.every((file) => file.isDownloaded)
      : false;
  }

  async onClickIssue(event) {
    const fileName = event.target.dataset.doc;
    const ellName = fileName.substring(0, 24) + "...";

    this.targetfileName = event.target.dataset.namee;

    this.ellpName = this.targetfileName.substring(0, 24) + "...";

    this.encryptedJson = event.target.dataset.json;

    this.targetdataId = event.target.dataset.idd;

    this.totalIssueCount = event.target.dataset.issuecount;

    this.fileStatuses = [
      {
        name: this.targetfileName,
        ellname: this.ellpName,
        status: "ダウンロード待ち...",
        isDownloading: false,
        isDownloaded: false
      }
    ];
    try {
      if (event.target.dataset.issuecount === "0") {
        this.isModalOpen = true;
        this.fileStatuses = [
          {
            name: this.targetfileName,
            ellname: this.ellpName,
            status: "ダウンロード中...",
            isDownloading: true,
            isDownloaded: false
          }
        ];
        await this.download();
        const res = await createlog({
          dataId: event.target.dataset.idd,
          fileName: fileName
        });
        // if (!res.isSuccess) {
        //     throw new Error("ダウンロードログ作成でエラーが発生しました。");
        // }
        this.fileStatuses = [
          {
            name: this.targetfileName,
            ellname: this.ellpName,
            status: "ダウンロード済み",
            isDownloading: false,
            isDownloaded: true
          }
        ];
        await this.searchData();
      } else if (event.target.dataset.issuecount > 0) {
        this.isShowReissueModal = true;
      }
    } catch (e) {
      let err = JSON.stringify(e);
      ErrorLog({
        lwcName: "ccp2_dtfsa",
        errorLog: err,
        methodName: "onclickissue method",
        ViewName: "DTFSA",
        InterfaceName: "OTCS Server",
        EventName: "Issuing document",
        ModuleName: "DTFSA"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  /* Last modified by Jashanpreet Singh 25/03 */
  async download() {
    const downloadWindow = window.open(
      `${CCP_Einvoice_Download_URL_Domain}/api/download?content=${this.encryptedJson}`,
      "downloadTab"
    );

    await this.waitForWindowToClose(downloadWindow);
  }

  /* Last modified by Jashanpreet Singh 25/03 */
  waitForWindowToClose(downloadWindow) {
    return new Promise((resolve) => {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      const checkWindowClosed = setInterval(() => {
        console.log("Checking if window is closed...");
        if (downloadWindow.closed) {
          console.log("Download window closed.");
          clearInterval(checkWindowClosed);
          resolve();
        }
      }, 1000);
    });
  }

  handleSelectAll() {
    this.isAllselected = true;
    const allSelected = this.searchDtfsaDocs.every((elm) => elm.selected);
    // Toggle all selected states
    this.searchDtfsaDocs.forEach((elm) => {
      elm.selected = !allSelected;
    });

    this.updateSelectedItems();
  }

  handleDeSelectAll() {
    this.isAllselected = false;
    this.searchDtfsaDocs.forEach((elm) => {
      elm.selected = false;
    });

    // Update the updatedSelectedItems list
    this.updateSelectedItems();
  }

  updateSelectedItems() {
    this.updatedSelectedItemslist = this.searchDtfsaDocs.filter(
      (elm) => elm.selected
    );
  }

  get allSelectedLength() {
    return this.searchDtfsaDocs.length === this.updatedSelectedItemslist.length;
  }

  get selectedListLen() {
    return this.updatedSelectedItemslist.length;
  }

  handleCheckboxChangeDownload(event) {
    const dataId = event.target.dataset.id;
    const isChecked = event.target.checked;
    const item = this.searchDtfsaDocs.find((elm) => elm.dataId === dataId);
    if (item) {
      item.selected = isChecked;
    }
    this.updateSelectedItems();
  }

  handleNoReissue() {
    this.isShowReissueModal = false;
  }

  async onClickReissueYesModal() {
    this.isShowReissueModal = false;
    this.fileStatuses = [
      {
        name: this.targetfileName,
        ellname: this.ellpName,
        status: "ダウンロード待ち...",
        isDownloading: false,
        isDownloaded: false
      }
    ];

    try {
      this.isModalOpen = true;
      this.fileStatuses = [
        {
          name: this.targetfileName,
          ellname: this.ellpName,
          status: "ダウンロード中...",
          isDownloading: true,
          isDownloaded: false
        }
      ];
      await this.download();
      const res = await createlog({
        dataId: this.targetdataId,
        fileName: this.targetfileName
      });
      //   if (!res.isSuccess) {
      //     throw new Error("ダウンロードログ更新でエラーが発生しました。");
      //   }

      this.fileStatuses = [
        {
          name: this.targetfileName,
          ellname: this.ellpName,
          status: "ダウンロード済み",
          isDownloading: false,
          isDownloaded: true
        }
      ];
    } catch (e) {
      console.error(e);
      this.isShowReissueModal = false;
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_dtfsa",
        errorLog: err,
        methodName: "okclickreissuemodal",
        ViewName: "DTFSA",
        InterfaceName: "OTCS Server",
        EventName: "Reissuing document",
        ModuleName: "DTFSA"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  async closeModal() {
    // refreshApex(this.wiredresult);
    this.isModalOpen = false;
    await this.searchData();
  }

  async handleDownloadAll() {
    this.fileStatuses = this.updatedSelectedItemslist.map((item) => ({
      name: item.fileName,
      ellname: item.ellpName,
      status: "ダウンロード待ち...",
      isDownloading: false,
      isDownloaded: false
    }));
    const hasReissueItems = this.updatedSelectedItemslist.some(
      (item) => item.issueCount > 0
    );
    if (hasReissueItems) {
      this.isShowReissueModal2 = true;
      // Return early to stop further processing until the modal is handled
      return;
    }
    for (let i = 0; i < this.updatedSelectedItemslist.length; i++) {
      const file = this.updatedSelectedItemslist[i];

      this.isModalOpen = true;
      this.fileStatuses[i].status = "ダウンロード中...";
      this.fileStatuses[i].isDownloading = true;
      this.fileStatuses = [...this.fileStatuses];

      try {
        // eslint-disable-next-line no-await-in-loop
        await this.downloadAll(file.encryptedJson);
        const res = await createlog({
          fileName: file.documentName,
          dataId: file.dataId
        });
        // if (!res.isSuccess) {
        //   throw new Error("ダウンロードログ更新でエラーが発生しました。");
        // }

        this.fileStatuses[i].status = "ダウンロード済み";
        this.fileStatuses[i].isDownloaded = true;
      } catch (error) {
        this.fileStatuses[i].status = "Error";
        console.error(`Error downloading ${file.fullFileName}:`, error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_dtfsa",
          errorLog: err,
          methodName: "handledownloadAll",
          ViewName: "DTFSA",
          InterfaceName: "OTCS Server",
          EventName: "Downloading multiple documents",
          ModuleName: "DTFSA"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      }

      this.fileStatuses[i].isDownloading = false;
      this.fileStatuses = [...this.fileStatuses];
    }
  }

  downloadAll(item) {
    return new Promise((resolve, reject) => {
      try {
        const downloadWindow = window.open(
          `${CCP_Einvoice_Download_URL_Domain}/api/download?content=${item}`,
          "downloadTab"
        );
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        const checkWindowClosed = setInterval(() => {
          if (downloadWindow.closed) {
            clearInterval(checkWindowClosed);
            resolve();
          }
        }, 1000);
      } catch (error) {
        console.error("rejected", error);
        reject(error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_dtfsa",
          errorLog: err,
          methodName: "download all error",
          ViewName: "DTFSA",
          InterfaceName: "OTCS Server",
          EventName: "Downloading multiple documents",
          ModuleName: "DTFSA"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      }
    });
  }

  handleNoReissue2() {
    this.isShowReissueModal2 = false;
  }

  async onClickReissueYesModal2() {
    this.isModalOpen = true;
    this.isShowReissueModal2 = false;
    this.fileStatuses = this.updatedSelectedItemslist.map((item) => ({
      name: item.fileName,
      ellname: item.ellpName,
      status: "ダウンロード待ち...",
      isDownloading: false,
      isDownloaded: false
    }));

    for (let i = 0; i < this.updatedSelectedItemslist.length; i++) {
      const file = this.updatedSelectedItemslist[i];

      this.fileStatuses[i].status = "ダウンロード中...";
      this.fileStatuses[i].isDownloading = true;
      this.fileStatuses = [...this.fileStatuses]; // Refresh UI

      try {
        await this.downloadAll(file.encryptedJson);

        const res = await createlog({
          dataId: file.dataId,
          fileName: file.documentName
        });
        //   if (!res.isSuccess) {
        //     throw new Error(
        //       "ダウンロードログ更新でエラーが発生しました。create"
        //     );
        // }

        this.fileStatuses[i].status = "ダウンロード済み";
        this.fileStatuses[i].isDownloaded = true;
      } catch (error) {
        this.fileStatuses[i].status = "Error";
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_dtfsa",
          errorLog: err,
          methodName: "okclickreissueModal2",
          ViewName: "DTFSA",
          InterfaceName: "OTCS Server",
          EventName: "Reissue document",
          ModuleName: "DTFSA"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
        console.error(
          `Error downloading reissued file ${file.fullFileName}:`,
          error
        );
      }

      this.fileStatuses[i].isDownloading = false;
      this.fileStatuses = [...this.fileStatuses];
    }
  }

  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    this.isButtonDisabled = value.trim().length === 0;
    if (value.length > maxLength) {
      event.target.blur();
    }
  }

  handleClickHere() {
    this.openHelpmodal = true;
  }

  closeHelp() {
    this.openHelpmodal = false;
  }

  navigateToHome() {
    let baseUrl = window.location.href;
    let homeUrl;
    if (baseUrl.indexOf("/s/") != -1) {
      homeUrl = baseUrl.split("/s/")[0];
    }
    window.location.href = homeUrl;
  }

  handleServerErr() {
    this.serverError = false;
  }

  navigateBasicInfo() {
    let baseUrl = window.location.href;
    let homeUrl;
    if (baseUrl.indexOf("/s/") != -1) {
      homeUrl = baseUrl.split("/s/")[0];
    }
    window.location.href = homeUrl + "/s/profile";
  }
}

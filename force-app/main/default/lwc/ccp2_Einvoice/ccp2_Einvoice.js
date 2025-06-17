/* eslint-disable no-await-in-loop */
import { LightningElement, wire, track } from "lwc";
import { refreshApex } from "@salesforce/apex";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getAccountInfo from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.getAllInvoiceGroup";
import getAccount from "@salesforce/apex/CCP2_userData.accountDetails";
import getDocByTime from "@salesforce/apex/CCP_RequestBookCtrl.getDocByTime";
import createLog from "@salesforce/apex/CCP_RequestBookCtrl.createLog";
import updateLog from "@salesforce/apex/CCP_RequestBookCtrl.updateLog";
import CCP_Einvoice_Download_URL_Domain from "@salesforce/label/c.CCP_Einvoice_Download_URL_Domain";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
// import getUserServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
// import Id from "@salesforce/user/Id";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const dropdownImg =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";
const help1 = Vehicle_StaticResource + "/CCP2_Resources/Common/dtfsa1.webp";

const help2 = Vehicle_StaticResource + "/CCP2_Resources/Common/dtfsa2.webp";

const nosearch =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/NoVehicles.png";

export default class Ccp2_Einvoice extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  dropdownImg = dropdownImg;
  // userId = Id;
  help1 = help1;
  help2 = help2;
  nosearch = nosearch;
  @track hasInvoiceGrp = false;
  @track accountsData = [];
  @track branchNameclass = "dropdown";
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;

  @track AccountName = "";
  @track accountCheckboxes = [];
  @track selectedCheckboxes = [];

  @track isDropdownOpen = false;
  @track dataSearch;

  //start date
  @track startDate;
  @track endDate;
  @track startDateTosend;
  @track endDateTosend;
  @track startMonthOptions = [];
  @track endMonthOptions = [];
  @track isStartDropdownOpen = false;
  @track isEndDropdownOpen = false;
  @track endDisabled = false;

  //loader
  @track showSearchPageLoader = false;

  //target
  @track isErrorModal = false;
  targetLogId = "";
  targetDataId = "";
  targetfullFileName = "";
  ellipseName = "";
  @track isShowReissueModal = false;
  @track isShowReissueModal2 = false;

  //selected
  @track updatedSelectedItemslist = [];

  //isalll
  @track isAllselected = false;

  //download loader
  @track isModalOpen = false;
  @track fileStatuses = []; // To store the status of each file

  //sort
  @track ascInvoice = false;
  @track closeSort = false;
  @track ascClosing = false;

  //click here modal
  @track openHelpmodal = false;

  //perm
  // @track allServices = [];
  // @track hasinvoice = true;

  //server
  @track serverError = false;

  @track emailNotif = false;

  connectedCallback() {
    this.generateMonthOptions();
    this.preselectCurrentMonth();
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.dropdownImg})`
    );
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
          lwcName: "ccp2_Einvoice",
          errorLog: err,
          methodName: "load language error",
          ViewName: "Einvoice",
          InterfaceName: "OTCS Server",
          EventName: "Loading language",
          ModuleName: "Einvoice"
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
          lwcName: "ccp2_Einvoice",
          errorLog: err,
          methodName: "Load Labels error",
          ViewName: "Einvoice",
          InterfaceName: "OTCS Server",
          EventName: "Loading labels",
          ModuleName: "Einvoice"
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
      this.loadLanguage();
    }
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick3.bind(this));
      this.outsideClickHandlerAdded = true;
    }
    if (!this.outsideClickHandlerAdded2) {
      document.addEventListener(
        "click",
        this.handleOutsideClickstart.bind(this)
      );
      this.outsideClickHandlerAdded2 = true;
    }
    if (!this.outsideClickHandlerAdded3) {
      document.addEventListener("click", this.handleOutsideClickend.bind(this));
      this.outsideClickHandlerAdded3 = true;
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick3.bind(this));
    document.removeEventListener(
      "click",
      this.handleOutsideClickstart.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleOutsideClickend.bind(this)
    );
  }

  @wire(getAccount)
  loadaccount({ data, error }) {
    if (data) {
      console.log("inv data", data);
      this.AccountName = data[0].Name;
      this.emailNotif = data[0].eInvoiceOpted;
    } else {
      console.error(error);
    }
  }

  // @wire(getUserServices, {
  //   userId: "$userId",
  //   refresh: 0
  // })
  // userServicesFun({ data, error }) {
  //   if (data) {
  //     this.allServices = data;

  //     this.allServices.forEach((serv) => {
  //       if (serv.apiName === "E_invoice") {
  //         this.hasinvoice = serv.isActive;
  //         if (this.hasinvoice === false) {
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

  @wire(getAccountInfo)
  handleInvoiceData({ data, error }) {
    if (data) {
      const accounts = data.accounts;
      this.hasInvoiceGrp = data.hasInvoiceGroup;
      this.accountsData = accounts.map((acc) => {
        return {
          id: acc.Id,
          name: acc.Name,
          invoiceGroup__c: acc.invoiceGroup__c,
          siebelCode: acc.siebelAccountCode__c
        };
      });
      this.accountCheckboxes = accounts.map((item) => {
        return {
          label: item.siebelAccountCode__c + " - " + item.Name,
          isChecked: true,
          siebelCode: item.siebelAccountCode__c
        };
      });
      this.updateSelectedCheckboxes();
    } else {
      console.error("error", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_Einvoice",
        errorLog: err,
        methodName: "handleInvoiceData method",
        ViewName: "Einvoice",
        InterfaceName: "OTCS Server",
        EventName: "Fetching account data",
        ModuleName: "Einvoice"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  handleOutsideClick3 = (event) => {
    const dataDropElement = this.template.querySelector(".dropdown-content");

    if (dataDropElement && !dataDropElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  };

  handleOutsideClickstart = (event) => {
    const dataDropElement = this.template.querySelector(".dropdown-list-date");

    if (dataDropElement && !dataDropElement.contains(event.target)) {
      this.isStartDropdownOpen = false;
    }
  };

  handleOutsideClickend = (event) => {
    const dataDropElement = this.template.querySelector(".dropdown-list-date");

    if (dataDropElement && !dataDropElement.contains(event.target)) {
      this.isEndDropdownOpen = false;
    }
  };

  get allfilesdownloaded() {
    return this.fileStatuses && this.fileStatuses.length > 0
      ? this.fileStatuses.every((file) => file.isDownloaded)
      : false;
  }

  get areanyselected() {
    return this.accountCheckboxes.some((item) => item.isChecked);
  }

  get isAllAccountsChecked() {
    return this.accountCheckboxes.every((item) => item.isChecked);
  }

  get areAllSelected() {
    return this.isAllAccountsChecked;
  }

  get selectedCount() {
    return this.selectedCheckboxes.length;
  }

  toggleDropdown(event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    this.isStartDropdownOpen = false;
    this.isEndDropdownOpen = false;
  }

  handleInsideClick(event) {
    event.stopPropagation();
  }
  handleSelectAllAccounts(event) {
    event.stopPropagation();
    const isChecked = event.target.checked;
    this.accountCheckboxes = this.accountCheckboxes.map((item) => {
      return { ...item, isChecked: isChecked };
    });
    this.updateSelectedCheckboxes();
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
    }

    this.updateSelectedCheckboxes();
  }

  updateSelectedCheckboxes() {
    const selectedAccounts = this.accountCheckboxes
      .filter((item) => item.isChecked)
      .map((item) => item.siebelCode);

    this.selectedCheckboxes = [...selectedAccounts];
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

  toggleStartDropdown(event) {
    event.stopPropagation();
    this.isStartDropdownOpen = !this.isStartDropdownOpen;
    this.isEndDropdownOpen = false;
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
    this.startDateTosend = selectedValue.replace("-", "");

    this.isStartDropdownOpen = false;
    this.updateEndDateOptions();
  }

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

  generateMonthOptions() {
    const options = [];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
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
    if (month === 1) {
      // Handle January
      this.startDate = `${year - 1}-12`;
    } else {
      this.startDate = `${year}-${month - 1 < 10 ? "0" + (month - 1) : month - 1}`;
    }

    // this.startDate = `${year}-${month < 10 ? "0" + month - 1 : month - 1}`;
    this.endDate = `${year}-${month < 10 ? "0" + month : month}`;

    this.startDateTosend = this.startDate.replace("-", "");
    this.endDateTosend = this.endDate.replace("-", "");
    this.updateEndDateOptions();
  }

  toggleEndDropdown(event) {
    event.stopPropagation();
    this.isEndDropdownOpen = !this.isEndDropdownOpen;
    this.isStartDropdownOpen = false;
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
    this.endDateTosend = selectedValue.replace("-", "");
    this.isEndDropdownOpen = false;
    this.updateStartDateOptions();
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

  handleReset() {
    this.accountCheckboxes = this.accountCheckboxes.map((item) => ({
      ...item,
      isChecked: true
    }));
    this.updateSelectedCheckboxes();
    this.preselectCurrentMonth();
    this.updateEndDateOptions();
    this.updateStartDateOptions();
  }

  async handleSearchclick() {
    if (this.selectedCheckboxes.length === 0 && !this.isAllAccountsChecked) {
      this.branchNameError = true;
      this.branchNameclass = "dropdown branch-error";
    } else {
      this.showSearchPageLoader = true;
      this.branchNameError = false;
      this.branchNameclass = "dropdown";
      this.searchData();
    }
  }

  async searchData() {
    const response = await getDocByTime({
      siebelAccountCodeList: this.selectedCheckboxes,
      yearFrom: this.startDateTosend,
      yearTo: this.endDateTosend
    });
    if (!response.isSuccess) {
      console.log("response uiii", response);
      const match = response.message.match(/Status Code: (\d+)/);

      if (match) {
        const statusCode = parseInt(match[1], 10);
        if ([500, 502, 503].includes(statusCode)) {
          this.showSearchPageLoader = false;
          this.serverError = true;
          console.error("Server Error: " + statusCode);
        } else {
          this.serverError = false;
        }
      } else {
        this.serverError = false;
      }

      throw new Error("請求書検索でエラーが発生しました。");
    }
    const result = response.data;
    const data = [...Array(result.length)].map((_, index) => {
      let issueDate = "-";
      if (result[index].dlog?.DownroadDate__c) {
        issueDate = new String(result[index].dlog?.DownroadDate__c);
        issueDate =
          issueDate.substring(0, 4) +
          "/" +
          issueDate.substring(5, 7) +
          "/" +
          issueDate.substring(8, 10);
      }
      return {
        invoiceDate:
          result[index].invoiceDate.substring(0, 4) +
          "/" +
          result[index].invoiceDate.substring(4, 6),
        invoiceDateTodisp: this.formatJapaneseInvoiceDate(
          result[index].invoiceDate.substring(0, 4) +
            "" +
            result[index].invoiceDate.substring(4, 6)
        ),
        siebelAccountCode: result[index].siebelAccountCode,
        closingDate: result[index].closingDate,
        IssueStatus: result[index].dlog ? "発行済み" : "未発行",
        IssueCount: result[index].dlog?.IssueCount__c
          ? result[index].dlog?.IssueCount__c
          : 0,
        IssueDate: issueDate,
        IssueDateTodisp: result[index].dlog?.DownroadDate__c
          ? this.formatJapaneseDate(issueDate)
          : "-",
        IssueUser: result[index].dlog?.FinalDownloadCCPUser__r?.Name
          ? result[index].dlog?.FinalDownloadCCPUser__r?.Name
          : "-",
        IssueApply: result[index].dlog ? "再発行" : "発行",
        fullFileName: result[index].fullFileName,
        fileName: result[index].fullFileName?.split(".")[0],
        fileNameEllipse: result[index].fullFileName.substring(0, 28) + "...",
        tacticsDisabled: false,
        logId: result[index].dlog?.Id,
        dataId: result[index].dataId,
        encryptedJson: result[index].encryptedJson,
        selected: false
      };
    });
    data.sort(function (a, b) {
      if (a.invoiceDate > b.invoiceDate) return -1;
      if (a.invoiceDate < b.invoiceDate) return 1;
      if (a.siebelAccountCode < b.siebelAccountCode) return -1;
      if (a.siebelAccountCode > b.siebelAccountCode) return 1;
      if (a.closingDate > b.closingDate) return -1;
      if (a.closingDate < b.closingDate) return 1;
      return 0;
    });
    this.dataSearch = [...data];
    console.log("data search", this.dataSearch);
    console.log("data search", JSON.stringify(this.dataSearch));
    this.closeSort = false;
    this.ascInvoice = false;
    this.updatedSelectedItemslist = [];
    this.showSearchPageLoader = false;
  }

  get searchLength() {
    return this.dataSearch.length;
  }

  async onClickIssue(event) {
    this.targetDataId = event.target.dataset.idd;
    this.targetFullFileName = event.target.dataset.fullnamee;
    this.ellipseName = this.targetFullFileName.substring(0, 28) + "...";
    this.targetLogId = event.target.dataset.logg;
    this.encryptedJson = event.target.dataset.json;
    const siebel = event.target.dataset.siebel;
    const fileName = event.target.dataset.namee;
    const closeDate = event.target.dataset.close;
    const invDate = event.target.dataset.invoicedate;
    const dataId = event.target.dataset.idd;
    console.log(
      "siebel filename closingdate invdate dataid",
      event.target.dataset.siebel,
      event.target.dataset.namee,
      event.target.dataset.close,
      event.target.dataset.invoicedate,
      event.target.dataset.idd
    );
    this.fileStatuses = [
      {
        name: this.targetFullFileName,
        ellname: this.ellipseName,
        status: "ダウンロード待ち...",
        isDownloading: false,
        isDownloaded: false
      }
    ];

    try {
      if (event.target.dataset.issue === "発行") {
        this.isModalOpen = true;
        this.fileStatuses = [
          {
            name: this.targetFullFileName,
            ellname: this.ellipseName,
            status: "ダウンロード中...",
            isDownloading: true,
            isDownloaded: false
          }
        ];

        await this.download();
        console.log(
          "siebel filename closingdate invdate dataid",
          event.target.dataset.siebel,
          event.target.dataset.namee,
          event.target.dataset.close,
          event.target.dataset.invoicedate,
          event.target.dataset.idd
        );
        console.log(
          "siebel filename closingdate invdate dataid",
          siebel,
          fileName,
          closeDate,
          invDate,
          dataId
        );
        const res = await createLog({
          // siebelAccountCode: event.target.dataset.siebel,
          // fileName: event.target.dataset.namee,
          // closingDate: event.target.dataset.close,
          // invoiceDate: event.target.dataset.invoicedate,
          // dataId: event.target.dataset.idd
          siebelAccountCode: siebel,
          fileName: fileName,
          closingDate: closeDate,
          invoiceDate: invDate,
          dataId: dataId
        });
        if (!res.isSuccess) {
          throw new Error("ダウンロードログ作成でエラーが発生しました。");
        }
        this.fileStatuses = [
          {
            name: this.targetFullFileName,
            ellname: this.ellipseName,
            status: "ダウンロード済み",
            isDownloading: false,
            isDownloaded: true
          }
        ];
      } else if (event.target.dataset.issue === "再発行") {
        this.isShowReissueModal = true;
      }
    } catch (e) {
      console.error(e);
      this.isErrorModal = true;
      let err = JSON.stringify(e);
      ErrorLog({
        lwcName: "ccp2_Einvoice",
        errorLog: err,
        methodName: "onclickissue method",
        ViewName: "Einvoice",
        InterfaceName: "OTCS Server",
        EventName: "Issuing document",
        ModuleName: "Einvoice"
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
    console.log(
      `${CCP_Einvoice_Download_URL_Domain}/api/download?content=${this.encryptedJson}`
    );

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
          resolve(); // Resolve the Promise when window is closed
        }
      }, 1000);
    });
  }

  downloadAll(item) {
    return new Promise((resolve, reject) => {
      try {
        const downloadWindow = window.open(
          `${CCP_Einvoice_Download_URL_Domain}/api/download?content=${item}`,
          "downloadTab"
        );
        fetch(
          `${CCP_Einvoice_Download_URL_Domain}/api/download?content=${item}`
        ).then((response) => {
          if (response.ok) {
            this.serverError = false;
            return response.blob();
          } else {
            this.serverError = true;
            throw new Error("Download failed");
          }
        });
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
          lwcName: "ccp2_Einvoice",
          errorLog: err,
          methodName: "download all error",
          ViewName: "Einvoice",
          InterfaceName: "OTCS Server",
          EventName: "Download all documents",
          ModuleName: "Einvoice"
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
  //   downloadAll(item) {
  //     return new Promise((resolve, reject) => {
  //         try {
  //             const downloadWindow = window.open(
  //                 `${CCP_Einvoice_Download_URL_Domain}/api/download?content=${item}`,
  //                 "downloadTab"
  //             );

  //             if (!downloadWindow) {
  //                 throw new Error("Popup blocked or failed to open.");
  //             }

  //             const checkWindowClosed = setInterval(() => {
  //                 if (downloadWindow.closed) {
  //                     clearInterval(checkWindowClosed);
  //                     // Check if the download failed
  //                     if (this.servererror) {
  //                         reject(new Error("Download failed"));
  //                     } else {
  //                         resolve();
  //                     }
  //                 }
  //             }, 1000);
  //         } catch (error) {
  //             console.error("Download rejected", error);
  //             reject(error);
  //             this.servererror = true;

  //             let err = JSON.stringify(error);
  //             ErrorLog({
  //                 lwcName: "ccp2_Einvoice",
  //                 errorLog: err,
  //                 methodName: "download all error",
  //                 ViewName: "Einvoice",
  //                 InterfaceName: "OTCS Server",
  //                 EventName: "Download all documents",
  //                 ModuleName: "Einvoice"
  //             })
  //             .then(() => {
  //                 console.log("Error logged successfully in Salesforce");
  //             })
  //             .catch((loggingErr) => {
  //                 console.error("Failed to log error in Salesforce:", loggingErr);
  //             });
  //         }
  //     });
  // }

  async onClickReissueYesModal() {
    this.isShowReissueModal = false;
    this.fileStatuses = [
      {
        name: this.targetFullFileName,
        ellname: this.ellipseName,
        status: "ダウンロード待ち...",
        isDownloading: false,
        isDownloaded: false
      }
    ];
    try {
      this.isModalOpen = true;
      this.fileStatuses = [
        {
          name: this.targetFullFileName,
          ellname: this.ellipseName,
          status: "ダウンロード中...",
          isDownloading: true,
          isDownloaded: false
        }
      ];
      await this.download();
      const res = await updateLog({ logId: this.targetLogId });
      if (!res.isSuccess) {
        throw new Error("ダウンロードログ更新でエラーが発生しました。");
      }

      this.fileStatuses = [
        {
          name: this.targetFullFileName,
          ellname: this.ellipseName,
          status: "ダウンロード済み",
          isDownloading: false,
          isDownloaded: true
        }
      ];
      // await this.searchData();
      // this.isShowReissueModal = false;
    } catch (e) {
      console.error(e);
      this.isShowReissueModal = false;
      this.isErrorModal = true;
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_Einvoice",
        errorLog: err,
        methodName: "okclickreissuemodal",
        ViewName: "Einvoice",
        InterfaceName: "OTCS Server",
        EventName: "Reissue documents",
        ModuleName: "Einvoice"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
    // this.isLoading = false;
  }

  handleCheckboxChangeDownload(event) {
    const dataId = event.target.dataset.id;
    const isChecked = event.target.checked;
    const item = this.dataSearch.find((elm) => elm.dataId === dataId);
    if (item) {
      item.selected = isChecked;
    }

    this.updateSelectedItems();
  }

  handleSelectAll() {
    this.isAllselected = true;
    const allSelected = this.dataSearch.every((elm) => elm.selected);
    // Toggle all selected states
    this.dataSearch.forEach((elm) => {
      elm.selected = !allSelected;
    });

    this.updateSelectedItems();
  }

  handleDeSelectAll() {
    this.isAllselected = false;
    this.dataSearch.forEach((elm) => {
      elm.selected = false;
    });

    // Update the updatedSelectedItems list
    this.updateSelectedItems();
  }

  updateSelectedItems() {
    this.updatedSelectedItemslist = this.dataSearch.filter(
      (elm) => elm.selected
    );
  }
  async handleDownloadAll() {
    this.fileStatuses = this.updatedSelectedItemslist.map((item) => ({
      name: item.fullFileName,
      ellname: item.fileNameEllipse,
      status: "ダウンロード待ち...",
      isDownloading: false,
      isDownloaded: false
    }));

    const hasReissueItems = this.updatedSelectedItemslist.some(
      (item) => item.IssueApply === "再発行"
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
        console.log("workdone12");
        await this.downloadAll(file.encryptedJson);
        console.log("workdone13");
        const res = await createLog({
          siebelAccountCode: file.siebelAccountCode,
          fileName: file.fileName,
          closingDate: file.closingDate,
          invoiceDate: file.invoiceDate,
          dataId: file.dataId
        });
        console.log("workdone14");
        if (!res.isSuccess) {
          throw new Error("ダウンロードログ更新でエラーが発生しました。");
        }

        this.fileStatuses[i].status = "ダウンロード済み";
        this.fileStatuses[i].isDownloaded = true;
        console.log("workdone");
      } catch (error) {
        console.log("workdone error");
        this.fileStatuses[i].status = "Error";
        console.error(`Error downloading ${file.fullFileName}:`, error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_Einvoice",
          errorLog: err,
          methodName: "handledownloadAll",
          ViewName: "Einvoice",
          InterfaceName: "OTCS Server",
          EventName: "Download all function",
          ModuleName: "Einvoice"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      }
      console.log("workdone2");
      this.fileStatuses[i].isDownloading = false;
      this.fileStatuses = [...this.fileStatuses];
    }
  }

  get selectedListLen() {
    return this.updatedSelectedItemslist.length;
  }

  handleNoReissue() {
    this.isShowReissueModal = false;
  }

  handleNoReissue2() {
    this.isShowReissueModal2 = false;
  }

  async closeModal() {
    this.isModalOpen = false;
    await this.searchData();
  }

  async onClickReissueYesModal2() {
    this.isModalOpen = true;
    this.isShowReissueModal2 = false;
    this.fileStatuses = this.updatedSelectedItemslist.map((item) => ({
      name: item.fullFileName,
      ellname: item.fileNameEllipse,
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

        if (!file.logId) {
          const res = await createLog({
            siebelAccountCode: file.siebelAccountCode,
            fileName: file.fileName,
            closingDate: file.closingDate,
            invoiceDate: file.invoiceDate,
            dataId: file.dataId
          });
          if (!res.isSuccess) {
            throw new Error(
              "ダウンロードログ更新でエラーが発生しました。create"
            );
          }
        } else {
          const res = await updateLog({ logId: file.logId });
          if (!res.isSuccess) {
            throw new Error("ダウンロードログ更新でエラーが発生しました。");
          }
        }

        this.fileStatuses[i].status = "ダウンロード済み";
        this.fileStatuses[i].isDownloaded = true;
      } catch (error) {
        this.fileStatuses[i].status = "Error";
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_Einvoice",
          errorLog: err,
          methodName: "okclickreissueModal2",
          ViewName: "Einvoice",
          InterfaceName: "OTCS Server",
          EventName: "Reissue documents",
          ModuleName: "Einvoice"
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

  handleInvoiceSortasc() {
    this.dataSearch = [...this.dataSearch].sort(function (a, b) {
      if (a.invoiceDate < b.invoiceDate) return -1;
      if (a.invoiceDate > b.invoiceDate) return 1;
      if (a.siebelAccountCode > b.siebelAccountCode) return -1;
      if (a.siebelAccountCode < b.siebelAccountCode) return 1;
      return 0;
    });
    this.dataSearch = [...this.dataSearch];
    this.ascInvoice = true;
  }

  handleInvoicedesc() {
    this.dataSearch = [...this.dataSearch].sort(function (a, b) {
      if (a.invoiceDate > b.invoiceDate) return -1;
      if (a.invoiceDate < b.invoiceDate) return 1;
      if (a.siebelAccountCode < b.siebelAccountCode) return -1;
      if (a.siebelAccountCode > b.siebelAccountCode) return 1;
      return 0;
    });
    this.dataSearch = [...this.dataSearch];
    this.ascInvoice = false;
    this.closeSort = false;
  }

  handleClosingSortasc() {
    this.dataSearch = [...this.dataSearch].sort(function (a, b) {
      if (a.IssueDate < b.IssueDate) return -1;
      if (a.IssueDate > b.IssueDate) return 1;
      if (a.siebelAccountCode > b.siebelAccountCode) return -1;
      if (a.siebelAccountCode < b.siebelAccountCode) return 1;
      return 0;
    });
    this.dataSearch = [...this.dataSearch];
    this.ascClosing = true;
  }

  handleClosingdesc() {
    this.dataSearch = [...this.dataSearch].sort(function (a, b) {
      if (a.IssueDate > b.IssueDate) return -1;
      if (a.IssueDate < b.IssueDate) return 1;
      if (a.siebelAccountCode < b.siebelAccountCode) return -1;
      if (a.siebelAccountCode > b.siebelAccountCode) return 1;
      return 0;
    });
    this.dataSearch = [...this.dataSearch];
    this.closeSort = true;
    this.ascClosing = false;
  }

  formatJapaneseDate(isoDate) {
    if (isoDate == undefined) {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let reiwaYear;
    return `${year}年${month}月${day}日`;
    // if (year === 2019) {
    //   if (month <= 4) {
    //     return `平成31年${month}月${day}日`;
    //   } else if (month > 4) {
    //     return `令和1年${month}月${day}日`;
    //   }
    // } else if (year > 2019) {
    //   reiwaYear = year - 2018;
    //   return `令和${reiwaYear}年${month}月${day}日`;
    // } else {
    //   reiwaYear = 30 - (2018 - year);
    //   return `平成${reiwaYear}年${month}月${day}日`;
    // }
    // return isoDate;
  }

  formatJapaneseInvoiceDate(invoiceDate) {
    if (!invoiceDate) {
      return ""; // Return empty string if the input is undefined or null
    }

    // Extract year and month from the provided format (YYYYMM)
    const year = invoiceDate.substring(0, 4); // First 4 characters are the year
    const month = parseInt(invoiceDate.substring(4, 6), 10); // Next 2 characters are the month

    // Return the formatted date in Japanese format (YYYY年M月)
    return `${year}年${month}月`;
  }

  get allSelectedLength() {
    return this.dataSearch.length === this.updatedSelectedItemslist.length;
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

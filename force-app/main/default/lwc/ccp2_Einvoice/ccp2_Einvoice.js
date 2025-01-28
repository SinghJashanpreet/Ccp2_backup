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

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const dropdownImg =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";

const nosearch =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/NoVehicles.png";

export default class Ccp2_Einvoice extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  dropdownImg = dropdownImg;
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

  connectedCallback() {
    this.generateMonthOptions();
    this.preselectCurrentMonth();
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.dropdownImg})`
    );

    //   window.addEventListener('message', (event) => {
    //     if (event.origin === CCP_Einvoice_Download_URL_Domain) {
    //         const statusCode = event.data.returnStatusCode;
    //         console.log("status code",statusCode);
    //         if (statusCode !== 200) {
    //             this.isErrorModal = true;
    //             sendEmailPdfDownloadException({ dataId: this.targetDataId, fullFileName: this.targetFullFileName, statusCode: event.data.returnStatusCode, content: this.encryptedJson });
    //         }
    //     } else {
    //         console.log('Origin mismatch:', event.origin);
    //     }
    // }, false);
  }

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
        ErrorLog({
          lwcName: "ccp2_Einvoice",
          errorLog: err,
          methodName: "load language error"
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
            console.log("Delete Detail User Locale: ", userLocale);
            console.log("Delete Detail User Labels: ", this.labels2);
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_Einvoice",
          errorLog: err,
          methodName: "Load Labels error"
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
    console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === "en_US") {
      console.log("working1");
      return "en";
    } else {
      console.log("working2");
      return "jp";
    }
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
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
      this.AccountName = data[0].Name;
    } else {
      console.log(error);
    }
  }

  @wire(getAccountInfo)
  handleInvoiceData({ data, error }) {
    if (data) {
      console.log(data);
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

      console.log("accounts", accounts);
      console.log("accounts multiple", JSON.stringify(this.accountsData));
      console.log(
        "accounts single checkbox",
        JSON.stringify(this.accountCheckboxes)
      );
    } else {
      console.log("error", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_Einvoice",
        errorLog: err,
        methodName: "handleInvoiceData method"
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
    console.log("selected checkboxes", JSON.stringify(this.selectedCheckboxes));
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

    console.log("selected start date", selectedValue);

    // Prevent selection if the option is disabled
    if (selectedOption.disabled) {
      event.stopPropagation();
      return; // Do nothing if the option is disabled
    }
    this.startDate = selectedValue;
    this.startDateTosend = selectedValue.replace("-", "");
    console.log("selected start date", this.startDate);
    console.log("selected start date replace", this.startDateTosend);

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

    this.startDate = `${year}-${month < 10 ? "0" + month - 1 : month - 1}`;
    this.endDate = `${year}-${month < 10 ? "0" + month : month}`;

    this.startDateTosend = this.startDate.replace("-", "");
    this.endDateTosend = this.endDate.replace("-", "");
    console.log("this.start", this.startDate);
    console.log("this.end", this.endDate);

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
    console.log(
      "selected checks",
      JSON.stringify(this.selectedCheckboxes),
      this.selectedCheckboxes.length
    );
    if (this.selectedCheckboxes.length === 0 && !this.isAllAccountsChecked) {
      this.branchNameError = true;
      this.branchNameclass = "dropdown branch-error";
      console.log("inside error");
    } else {
      this.showSearchPageLoader = true;
      console.log("show searcload", this.showSearchPageLoader);
      this.branchNameError = false;
      this.branchNameclass = "dropdown";
      console.log("selected checkbox", JSON.stringify(this.selectedCheckboxes));
      console.log("selected startDateTosend", this.startDateTosend);
      console.log("selected this.endDateTosend", this.endDateTosend);
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
      throw new Error("請求書検索でエラーが発生しました。");
    }
    const result = response.data;
    console.log("resulltt apiiiii", result);

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
    console.log("dataa api searchhh", JSON.stringify(this.dataSearch));
    this.closeSort = false;
    this.ascInvoice = false;
    this.updatedSelectedItemslist = [];
    this.showSearchPageLoader = false;
  }

  get searchLength() {
    return this.dataSearch.length;
  }

  async onClickIssue(event) {
    console.log("inside on download");
    this.targetDataId = event.target.dataset.idd;
    this.targetFullFileName = event.target.dataset.fullnamee;
    this.ellipseName = this.targetFullFileName.substring(0, 28) + "...";
    this.targetLogId = event.target.dataset.logg;
    this.encryptedJson = event.target.dataset.json;
    console.log("inside on download2");
    this.fileStatuses = [
      {
        name: this.targetFullFileName,
        ellname: this.ellipseName,
        status: "ダウンロード待ち...",
        isDownloading: false,
        isDownloaded: false
      }
    ];
    console.log("on click issueeee");

    try {
      if (event.target.dataset.issue == "発行") {
        // this.isLoading = true;
        console.log("inside on download 発行");
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

        this.download();
        const res = await createLog({
          siebelAccountCode: event.target.dataset.siebel,
          fileName: event.target.dataset.namee,
          closingDate: event.target.dataset.close,
          invoiceDate: event.target.dataset.invoicedate,
          dataId: event.target.dataset.idd
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
        // this.searchData();
      } else if (event.target.dataset.issue == "再発行") {
        console.log("inside on download 再発行");
        this.isShowReissueModal = true;
      }
    } catch (e) {
      console.log(e);
      this.isErrorModal = true;
      let err = JSON.stringify(e);
      ErrorLog({
        lwcName: "ccp2_Einvoice",
        errorLog: err,
        methodName: "onclickissue method"
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

  download() {
    console.log(
      CCP_Einvoice_Download_URL_Domain +
        "/api/download?content=" +
        this.encryptedJson
    );
    // window.open(
    //   CCP_Einvoice_Download_URL_Domain +
    //   "/api/download?content=" +
    //   this.encryptedJson
    // );
    const downloadWindow = window.open(
      `${CCP_Einvoice_Download_URL_Domain}/api/download?content=${this.encryptedJson}`,
      "downloadTab"
    );
    const checkWindowClosed = setInterval(() => {
      if (downloadWindow.closed) {
        clearInterval(checkWindowClosed);
        resolve();
      }
    }, 1000);
  }

  downloadAll(item) {
    return new Promise((resolve, reject) => {
      try {
        const downloadWindow = window.open(
          `${CCP_Einvoice_Download_URL_Domain}/api/download?content=${item}`,
          "downloadTab"
        );
        const checkWindowClosed = setInterval(() => {
          if (downloadWindow.closed) {
            clearInterval(checkWindowClosed);
            resolve();
          }
        }, 1000);
      } catch (error) {
        console.log("rejected");
        reject(error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_Einvoice",
          errorLog: err,
          methodName: "download all error"
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

  async onClickReissueYesModal() {
    console.log("reissue 1");
    this.isShowReissueModal = false;
    console.log("reissue 2");
    this.fileStatuses = [
      {
        name: this.targetFullFileName,
        ellname: this.ellipseName,
        status: "ダウンロード待ち...",
        isDownloading: false,
        isDownloaded: false
      }
    ];
    console.log("reissue 3");
    console.log("fileeee ststuss", JSON.stringify(this.fileStatuses));
    // this.isLoading = true;
    try {
      console.log("reissue above");
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
      this.download();
      console.log("reissue below");
      const res = await updateLog({ logId: this.targetLogId });
      console.log("reissue below target id", this.targetLogId);
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
      console.log(e);
      this.isShowReissueModal = false;
      this.isErrorModal = true;
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_Einvoice",
        errorLog: err,
        methodName: "okclickreissuemodal"
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
    console.log(
      "selected items",
      JSON.stringify(this.updatedSelectedItemslist)
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

    console.log("the lenght is ", this.updatedSelectedItemslist.length);
    for (let i = 0; i < this.updatedSelectedItemslist.length; i++) {
      const file = this.updatedSelectedItemslist[i];

      this.isModalOpen = true;
      this.fileStatuses[i].status = "ダウンロード中...";
      this.fileStatuses[i].isDownloading = true;
      this.fileStatuses = [...this.fileStatuses];

      try {
        console.log("inside down all");
        console.log("fileee", JSON.stringify(file));
        // eslint-disable-next-line no-await-in-loop
        await this.downloadAll(file.encryptedJson);
        const res = await createLog({
          siebelAccountCode: file.siebelAccountCode,
          fileName: file.fileName,
          closingDate: file.closingDate,
          invoiceDate: file.invoiceDate,
          dataId: file.dataId
        });
        if (!res.isSuccess) {
          throw new Error("ダウンロードログ更新でエラーが発生しました。");
        }

        this.fileStatuses[i].status = "ダウンロード済み";
        this.fileStatuses[i].isDownloaded = true;
        console.log("inside down all");
      } catch (error) {
        this.fileStatuses[i].status = "Error";
        console.error(`Error downloading ${file.fullFileName}:`, error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_Einvoice",
          errorLog: err,
          methodName: "handledownloadAll"
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

    console.log(
      "lengthhh updatedddd items",
      this.updatedSelectedItemslist.length
    );
    for (let i = 0; i < this.updatedSelectedItemslist.length; i++) {
      const file = this.updatedSelectedItemslist[i];
      console.log("fileeeeee in reissue", file);

      this.fileStatuses[i].status = "ダウンロード中...";
      this.fileStatuses[i].isDownloading = true;
      this.fileStatuses = [...this.fileStatuses]; // Refresh UI

      try {
        // Call the download function for reissued items
        console.log("inside reissue all");
        console.log("fileeeeee in reissue", JSON.stringify(file));
        await this.downloadAll(file.encryptedJson);
        console.log("loggg idd", file.logId);

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
          methodName: "okclickreissueModal2"
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
}

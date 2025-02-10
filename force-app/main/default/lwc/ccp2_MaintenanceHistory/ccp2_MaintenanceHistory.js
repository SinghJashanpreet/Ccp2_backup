/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api, track, wire } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { loadStyle } from "lightning/platformResourceLoader";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import getMaintenanceData from "@salesforce/apex/CCP2_Notification_Controller.getMaintenanceData";
import getMaintenanceDetails from "@salesforce/apex/CCP2_Notification_Controller.getMaintenanceDetails";
import updateMaintenance from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.updateMaintenance";
import deleteMaintenance from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.deleteMaintenance";
import getSearchAccount from "@salesforce/apex/CCP2_Notification_Controller.getAccountsByNamePattern";
import updateMaintenanceImage from "@salesforce/apex/CCP2_Notification_Controller.updateMaintenanceImage";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";

import CCP2_Resources from "@salesforce/resourceUrl/CCP2_Resources";
import homeintro from "@salesforce/resourceUrl/RichTextCSSEdit";
import getbranchList from "@salesforce/apex/CCP2_userData.BranchList";
import deletecontentversion from "@salesforce/apex/CCP2_vehcileImageUploader.deleteMaintenanceImageByVersionId";
import CONTENT_VERSION_OBJECT from "@salesforce/schema/ContentVersion";
import TITLE_FIELD from "@salesforce/schema/ContentVersion.Title";
import VERSION_DATA_FIELD from "@salesforce/schema/ContentVersion.VersionData";
import PATH_ON_CLIENT_FIELD from "@salesforce/schema/ContentVersion.PathOnClient";
import SERVICE_TYPE_FIELD from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Type__c";
import SERVICE_FACTORY_FIELD from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Factory__c";

const EmptyRecallDataIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/Empty-recall.png";

const arrowicon = CCP2_Resources + "/CCP2_Resources/Common/arrow_under.png";

const nosearch = CCP2_Resources + "/CCP2_Resources/Vehicle/NoVehicles.png";

export default class Ccp2MaintenanceHistory extends LightningElement {
  emptyRecallDataIcon = EmptyRecallDataIcon;
  @api vehicleId;
  @track wiredVehicleResult;
  @track wiredVehicleResultDetail;
  @track maintainceData = [];
  @track maintenanceDetails = { ImageUrls: [] };
  @track maintenanceDetailsApi = [];
  @track showEmptyContiner = true;
  @track showLeftDots2 = false;
  @track visiblePageCount2 = [1];
  @track showRightDots2 = false;
  @track currentPage = 1;
  @track totalPageCount2 = 1;
  @track prevGoing = false;
  @track isPreviousDisabled2 = false;
  @track isNextDisabled2 = false;
  @track iseditTopInfo = false;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;

  @track showListPage = true;
  @track showDetailPage = false;
  @track showImages = false;
  @track showDetailPageLoader = true;
  @track showZoomInImageModal = false;

  @track MaintenanceType = "";

  @track listTypeFilterValue = [];
  @track showListType = false;
  @track listTypeFilter = {
    selectAll: true,
    option1: true,
    option2: true
  };
  @track serviceTypeFilterValue = [];
  @track showServiceType = false;
  @track serviceTypeFilter = {
    selectAll: true,
    option1: true,
    option2: true,
    option3: true,
    option4: true,
    option5: true,
    option6: true
  };
  @track factoryFilterValue = [];
  @track showFactoryType = false;
  @track factoryFilter = {
    selectAll: true,
    // option1: true,
    option2: true,
    option3: true
  };

  @track showNormalSort1 = false;
  @track showNormalSort2 = true;
  @track showAscSort1 = false;
  @track showAscSort2 = false;
  @track showDescSort1 = true;
  @track showDescSort2 = false;
  @track sortingField = "Default";
  @track sortingDirection = "";

  @track currentImageUrl = "";

  dropdown = arrowicon;
  //rich text field
  @track isEditBottomInfo = false;
  // @track richTextVal = "";

  //image edit
  @track isalluploadedimages = false;
  @track imageList = [];
  @track uploadedImages = [];
  @track isloadingImages = false;

  //branch
  @track branchObj = "";
  //account
  @track accountObj;
  @track divforAccountAddress = false;

  //recieving destination
  @track destinationAccBranch = "";
  @track destinationBranchToshow = "";
  @track destinationAccBranchToShowonDetail = "";

  @track destPostcode = "";
  @track destMunc = "";
  @track destPref = "";
  @track destStreet = "";

  @track destinationNosearch = "";
  @track destinationAccountBranchtosend = null;
  @track richTextVal = "";

  //maintenance id
  @track MaintenanceId = "";

  //delete rec img
  @track deleteRecordIdsimg = [];
  @track deleteRecordFull = [];

  //serv type
  @track serviceTypeOptions = [];
  @track serviceFactoryOptions = [];
  @track showlistScheduleType = false;
  @track showlistfactoryType = false;
  @track selectedPicklistScheduleType = "";
  @track selectedPicklistfactoryType = "";
  @track branchList = [];
  @track showBranchlist = false;

  //search
  @track searchKey = "";
  @track searchArrayaccount = [];
  @track showMorelist = false;
  @track showMore = false;
  @track searchaccounts = [];
  @track readonlyaccount = false;
  @track searchAccountError = false;
  @track imagesArrayApi = [];
  nosearch = nosearch;
  //back modal
  @track showBackEditmodal = false;

  //date calendar
  @track isCalendarOpen = false;
  @track selectedDate = null;
  @track selectedDateToSend = null;
  @track year = new Date().getFullYear();
  @track month = new Date().getMonth() + 1;
  @track calendarDates = [];
  @track selectedDay; // To track the currently selected day
  @track isNextMonthDisabled = false;
  @track isPrevMonthDisabled = false;
  @track isCalendarOpen2 = false;
  @track selectedDate2 = null;
  @track selectedDateToSend2 = null;
  @track year2 = new Date().getFullYear();
  @track month2 = new Date().getMonth() + 1;
  @track calendarDates2 = [];
  @track selectedDay2; // To track the currently selected day
  @track isNextMonthDisabled2 = false;
  @track isPrevMonthDisabled2 = false;
  @track showPosterreal = false;
  @track showImplementation = false;
  @track showScheduleDate = false;
  @track myday;
  @track myMonth;
  @track myYear;
  @track myday2;
  @track myMonth2;
  @track myYear2;
  @track storedScheduleDate = null;
  @track storedScheduleEndDate = null;
  @track storedImplementationDate = null;
  // @track implementationPresent = false;

  //show more
  @track showmoreArray = [];

  //error search
  @track errorSearch;

  //update maintenance
  @track updatedMaintenance = {};
  @track multipleDest = false;

  //cancelmodal
  @track cancelplanModal = false;
  @track deleteHistoryModal = false;
  @track showModalRefresh = false;
  @track showModalRefreshDelete = false;

  //images array to compare
  @track imagesArrayTocompare = [];

  //cancel and save loader
  @track loaderBottom = false;

  get hasMaintainaceItems() {
    return this.maintainceData.length > 0;
  }

  // defaultSortPlanned(implementationCount) {
  //   this.implementationPresent = true;
  //   if (implementationCount == 0) {
  //     this.showNormalSort1 = false;
  //     this.showAscSort1 = false;
  //     this.showDescSort1 = true;
  //     this.showNormalSort2 = true;
  //     this.showAscSort2 = false;
  //     this.showDescSort2 = false;

  //     this.sortingField = "Schedule_Date__c";
  //     this.sortingDirection = "DESC";
  //     console.log("Default 1 applied");
  //   }
  // }

  @track maintenaceListId;

  connectedCallback() {
    const urlParamsInstance = new URLSearchParams(window.location.search).get(
      "instance"
    );
    const urlParams = new URLSearchParams(window.location.search).get(
      "vehicleId"
    );
    if (urlParams) {
      if (urlParamsInstance === "maintenanceDetail") {
        const maintenaceId = new URLSearchParams(window.location.search).get(
          "maintenanceId"
        );

        this.maintenaceListId = maintenaceId;
        console.log("maintenaceId22222", this.maintenaceListId);

        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.toggleListToDetailUi2();
          if (this.maintenaceListId !== null) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      }
    }
    this.populateCalendar5();

    this.selectedDate = this.maintenanceDetails.Implementation_Date__c || null;
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.dropdown})`
    );
    console.log("this.vehicleId in maintraine", this.vehicleId);
  }

  disconnectedCallback() {
    window.removeEventListener("click", this.handleOutsideClick5.bind(this));
    document.removeEventListener("click", this.handleOutsideClick1.bind(this));
    document.removeEventListener("click", this.handleOutsideClick2.bind(this));
    document.removeEventListener("click", this.handleOutsideClick3.bind(this));
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
    document.removeEventListener(
      "click",
      this.handleOutsideClickFactory.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleOutsideClickBranch.bind(this)
    );
    document.removeEventListener("click", this.handleOutsideClickCalendar);
    document.removeEventListener("click", this.handleOutsideClickCalendar2);
    document.removeEventListener("click", this.handleOutsideClickCalendar5);
    document.removeEventListener("click", this.handleOutsideClickSearch);
  }

  outsideClickHandlerAdded5 = false;

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
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "Load Language"
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
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "Load Labels"
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
    this.highlightRange5();
    this.updatePageButtons();
    try {
      loadStyle(this, homeintro);
      console.log("Error Loaded Successfully ");
    } catch (e) {
      console.error("Error loading styling", e);
    }
    if (!this.outsideClickHandlerAdded1) {
      document.addEventListener("click", this.handleOutsideClick1.bind(this));
      this.outsideClickHandlerAdded1 = true;
    }
    if (!this.outsideClickHandlerAdded2) {
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      this.outsideClickHandlerAdded2 = true;
    }
    if (!this.outsideClickHandlerAdded3) {
      document.addEventListener("click", this.handleOutsideClick3.bind(this));
      this.outsideClickHandlerAdded3 = true;
    }
    if (!this.outsideClickHandlerAdded5) {
      document.addEventListener("click", this.handleOutsideClick5.bind(this));
      this.outsideClickHandlerAdded5 = true;
    }
    if (!this.handleOutsideClickBound) {
      this.handleOutsideClickBound = this.handleOutsideClick.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound);
    }
    if (!this.handleOutsideClickBound2) {
      this.handleOutsideClickBound = this.handleOutsideClickFactory.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound);
    }
    if (!this.handleOutsideClickBound3) {
      this.handleOutsideClickBound = this.handleOutsideClickBranch.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound);
    }
    if (!this.handleOutsideClickBound4) {
      this.handleOutsideClickBound = this.handleOutsideClickCalendar.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound);
    }
    if (!this.handleOutsideClickBound5) {
      this.handleOutsideClickBound =
        this.handleOutsideClickCalendar2.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound);
    }
    if (!this.handleOutsideClickBound15) {
      this.handleOutsideClickBound =
        this.handleOutsideClickCalendar5.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound);
    }
    if (!this.handleOutsideClickBound6) {
      this.handleOutsideClickBound6 = this.handleOutsideClickSearch.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound6);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: SERVICE_TYPE_FIELD
  })
  wiredServiceTypePicklist({ data, error }) {
    if (data) {
      this.serviceTypeOptions = data.values.map((item) => {
        return { label: item.label, value: item.value };
      });
      console.log("serv type", this.serviceTypeOptions);
    } else if (error) {
      console.error("serv type", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_MaintainHistory",
        errorLog: err,
        methodName: "servicePicklist"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: SERVICE_FACTORY_FIELD
  })
  wiredServiceFactoryPicklist({ data, error }) {
    if (data) {
      this.serviceFactoryOptions = data.values.map((item) => {
        return { label: item.label, value: item.value };
      });
      console.log("factory field", JSON.stringify(this.serviceFactoryOptions));
    } else if (error) {
      console.error("factory field", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_MaintainHistory",
        errorLog: err,
        methodName: "factory Picklist"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @wire(getMaintenanceData, {
    vehicleId: "$vehicleId",
    filter1: "$serviceTypeFilterValue",
    filter2: "$factoryFilterValue",
    sort1: "$sortingField",
    page: "$currentPage",
    listType: "$listTypeFilterValue",
    sortingAttr: "$sortingDirection"
  })
  handledata(result) {
    this.wiredVehicleResult = result;
    const { data, error } = result;

    if (data) {
      console.log("vehicleId:", this.vehicleId);
      console.log("filter1:", JSON.stringify(this.serviceTypeFilterValue));
      console.log("filter2:", JSON.stringify(this.factoryFilterValue));
      console.log("sort1:", this.sortingField);
      console.log("page:", this.currentPage);
      console.log("listType:", this.listTypeFilterValue);
      console.log("sortingDirection:", this.sortingDirection);

      console.log("geting from Maintaince data api: ", data);
      this.showEmptyContiner = data.records.length === 0;
      this.maintainceData = data.records.map((elm) => {
        return {
          Id: elm.Id || "-",
          Name: elm.Name || "-",
          Service_Factory__c: elm.Service_Factory__c || "-",
          Service_Type__c: elm.Service_Type__c || "-",
          Ordered_Number__c: elm.Ordered_Number__c || "-",
          Schedule_Date__c:
            elm.Schedule_Date__c === undefined
              ? ""
              : this.formatJapaneseDate(elm.Schedule_Date__c) || "",
          Schedule_EndDate__c:
            elm.Schedule_EndDate__c === undefined
              ? ""
              : this.formatJapaneseDate(elm.Schedule_EndDate__c) || "",
          Implementation_Date__c:
            elm.Implementation_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate(elm.Implementation_Date__c) || "-",
          Recieving_Destination__c:
            elm.Recieving_Destination__c === undefined
              ? "-"
              : elm.Recieving_Destination__c.length <= 1
                ? elm.Recieving_Destination__c
                : this.substringToProperLength(
                    elm.Recieving_Destination__c,
                    14
                  ) || "-",
          Recieving_Destination__c_full:
            elm.Recieving_Destination__c === undefined
              ? "-"
              : elm.Recieving_Destination__c || "-"
        };
      });
      this.totalPageCount2 = data.totalPages;
      this.updateVisiblePages();
    } else if (error) {
      console.log("vehicleId:", this.vehicleId);
      console.log("filter1:", JSON.stringify(this.serviceTypeFilterValue));
      console.log("filter2:", JSON.stringify(this.factoryFilterValue));
      console.log("sort1:", this.sortingField);
      console.log("page:", this.currentPage);
      console.log("listType:", this.listTypeFilterValue);
      console.log("sortingDirection:", this.sortingDirection);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_MaintainHistory",
        errorLog: err,
        methodName: "handleData"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });

      console.error("geting from Maintaince data api: ", error);
    }
  }

  @wire(getbranchList)
  handlebranchList({ data, error }) {
    console.log("data branch", data);
    if (data) {
      this.branchList = data.map((item) => {
        return {
          id: item.Id,
          name: item.Name
        };
      });
      console.log("branch list", JSON.stringify(this.branchList));
    }
  }

  substringToProperLength(string, limit) {
    let tempString = "";
    let charCount = 0;

    for (let i = 0; i < string.length; i++) {
      const char = string.charAt(i);
      const charCode = string.charCodeAt(i);

      if (
        (charCode >= 0xff01 && charCode <= 0xff5e) || // Full-width characters
        (charCode >= 0xff61 && charCode <= 0xff9f) || // Half-width Katakana
        (charCode >= 0x3040 && charCode <= 0x309f) || // Hiragana
        (charCode >= 0x30a0 && charCode <= 0x30ff) || // Katakana
        (charCode >= 0x4e00 && charCode <= 0x9fff) // Kanji
      ) {
        charCount += 2;
      } else {
        charCount += 1; // Normal English character counts as 1
      }

      // Check if we should stop adding characters
      if (charCount > limit) {
        break; // Stop when exceeding 19 characters for English
      }
      if (
        charCount > limit &&
        ((charCode >= 0x3040 && charCode <= 0x9fff) || // Full-width Japanese
          (charCode >= 0xff01 && charCode <= 0xff5e)) // Full-width characters
      ) {
        break; // Stop when exceeding 12 for Japanese characters
      }

      tempString += char;
    }

    return tempString + (charCount >= limit ? "..." : "");
  }

  @api refreshData() {
    console.log("referesh data method called!!!");
    refreshApex(this.wiredVehicleResult);
    setTimeout(() => {
      console.log("referesh data method called2!!!");
      refreshApex(this.wiredVehicleResult);
    }, 1000);
  }

  @wire(getMaintenanceDetails, {
    maintenanceId: "$MaintenanceId"
  })
  handlemaintenanceDetails(result) {
    console.log(
      "Retrieved maintenance data api entered:",
      this.MaintenanceId,
      result
    );
    this.wiredVehicleResultDetail = result; // Store the wire result for refreshing
    const { data, error } = result;
    if (data) {
      this.maintenanceDetailsApi = data;
      let imagesArray = JSON.parse(data?.images) || [];
      this.imagesArrayTocompare = JSON.parse(data?.images) || [];
      console.log(
        "images arrayyyy to compa",
        JSON.stringify(this.imagesArrayTocompare)
      );
      this.showImages = imagesArray.length > 0;
      console.log("data of images2:- ", this.showImages);
      this.MaintenanceType = data.result[0].Maintenance_Type__c || "-";
      console.log("maintenance TYYPPOOOOOO", this.MaintenanceType);
      if (this.MaintenanceType === "Scheduled") {
        this.showPosterreal = true;
        this.showImplementation = true;
        this.showScheduleDate = true;
      } else {
        this.showPosterreal = false;
        this.showImplementation = true;
      }
      this.branchObj = data.result[0].CCP2_Branch__r || "";
      this.accountObj = data.result[0].Account__r || "";
      this.destinationNosearch =
        data.result[0].Recieving_Destination_noSearch__c || "";
      this.selectedPicklistScheduleType = data.result[0].Service_Type__c || "";
      this.selectedPicklistfactoryType =
        data.result[0].Service_Factory__c || "";
      this.richTextVal = data.result[0].Description_Rich_Text__c || "";
      this.storedScheduleDate =
        data.result[0].Schedule_Date__c === undefined
          ? null
          : data.result[0].Schedule_Date__c || null;
      this.storedScheduleEndDate =
        data.result[0].Schedule_EndDate__c === undefined
          ? null
          : data.result[0].Schedule_EndDate__c || null;
      this.storedImplementationDate =
        data.result[0].Implementation_Date__c === undefined
          ? null
          : data.result[0].Implementation_Date__c || null;

      this.maintenanceDetails = {
        Id: data.result[0].Id || "-",
        Implementation_Date__c:
          data.result[0].Implementation_Date__c === undefined
            ? "-"
            : this.formatJapaneseDate(data.result[0].Implementation_Date__c) ||
              "-",
        Implementation_Date__c3:
          data.result[0].Implementation_Date__c === undefined
            ? "-"
            : this.formatJapaneseDate(data.result[0].Implementation_Date__c) ||
              "-",
        Implementation_Date__c2:
          data.result[0].Implementation_Date__c === undefined
            ? null
            : data.result[0].Implementation_Date__c || null,
        Recieving_Destination__c:
          data.result[0].Recieving_Destination__c === undefined
            ? "-"
            : data.result[0].Recieving_Destination__c || "-",
        Schedule_Date__c:
          data.result[0].Schedule_Date__c === undefined
            ? "-"
            : this.formatJapaneseDate(data.result[0].Schedule_Date__c) || "-",
        Schedule_EndDate__c:
          data.result[0].Schedule_EndDate__c === undefined
            ? "-"
            : this.formatJapaneseDate(data.result[0].Schedule_EndDate__c) ||
              "-",
        Schedule_EndDate__c2:
          data.result[0].Schedule_EndDate__c === undefined
            ? "-"
            : this.formatJapaneseDate(data.result[0].Schedule_EndDate__c) ||
              "-",
        Schedule_EndDate__c3:
          data.result[0].Schedule_EndDate__c === undefined
            ? "-"
            : this.formatJapaneseDate(data.result[0].Schedule_EndDate__c) ||
              "-",
        Schedule_Date__c3:
          data.result[0].Schedule_Date__c === undefined
            ? "-"
            : this.formatJapaneseDate(data.result[0].Schedule_Date__c) || "-",
        Schedule_Date__c2:
          data.result[0].Schedule_Date__c === undefined
            ? "-"
            : data.result[0].Schedule_Date__c || "-",
        Service_Factory__c: data.result[0].Service_Factory__c || "-",
        Service_Type__c: data.result[0].Service_Type__c || "-",
        LastModifiedBy1: data.result[0].CCP2_Update_Name_Section_1__c || "-",
        LastModifiedBy2: data.result[0].CCP2_Update_Name_Section_2__c || "-",
        LastModifiedDate1:
          data.result[0].CCP2_Update_Section_1__c === undefined
            ? "-"
            : this.formatJapaneseDate2(
                data.result[0].CCP2_Update_Section_1__c
              ) || "-",
        LastModifiedDate2:
          data.result[0].CCP2_Update_Section_2__c === undefined
            ? "-"
            : this.formatJapaneseDate2(
                data.result[0].CCP2_Update_Section_2__c
              ) || "-",
        Description_Rich_Text__c:
          data.result[0].Description_Rich_Text__c || "-",
        Recieving_Destination_noSearch__c:
          data.result[0].Recieving_Destination_noSearch__c || "-",
        Branch: data.result[0].CCP2_Branch__r || "-",
        ImageUrls: imagesArray.map((img) => {
          return {
            recordId: img.id,
            fileName: img.fileName,
            fileURL: img.fileURL,
            Description: img.Description,
            filetype: img.filetype
          };
        })
      };

      if (this.maintenanceDetails.Service_Factory__c === "ふそう/自社 以外") {
        const destinationAccBranch = this.accountObj.Name || "";
        this.destinationAccBranchToShowonDetail =
          destinationAccBranch === "" ? "-" : destinationAccBranch;

        if (this.destinationAccBranch) {
          this.divforAccountAddress = true;
        } else {
          this.divforAccountAddress = false;
        }
      } else {
        const destinationAccBranch = this.branchObj.Name || "";
        this.destinationAccBranchToShowonDetail =
          destinationAccBranch === "" ? "-" : destinationAccBranch;
        console.log("branch to show", this.destinationBranchToshow);
      }
      if (this.storedScheduleDate) {
        this.startDate5 = {
          day: this.storedScheduleDate.split("-")[2],
          month: this.storedScheduleDate.split("-")[1],
          year: this.storedScheduleDate.split("-")[0]
        };
      }
      if (this.storedScheduleEndDate) {
        this.endDate5 = {
          day: this.storedScheduleEndDate.split("-")[2],
          month: this.storedScheduleEndDate.split("-")[1],
          year: this.storedScheduleEndDate.split("-")[0]
        };
      }
      if (this.startDate5) {
        this.selectedDateRange5 = this.endDate5
          ? `${this.formatDate5(this.startDate5)} - ${this.formatDate5(this.endDate5)}`
          : `${this.formatDate5(this.startDate5)} `;
      }

      if (this.storedScheduleDate)
        this.selectedDateToSendStart = this.storedScheduleDate;
      if (this.storedScheduleEndDate)
        this.selectedDateToSendEnd = this.storedScheduleEndDate;
      console.log(
        "Initial Schedule Dates: ",
        this.storedScheduleDate,
        this.storedScheduleEndDate
      );
      console.log("main details", JSON.stringify(data));
      console.log("main details type", JSON.stringify(this.branchObj));
      console.log("main details type account", JSON.stringify(this.accountObj));
      console.log(
        "main details type factt",
        JSON.stringify(this.maintenanceDetails)
      );
      this.wireCalled5 = true;
      this.showImages = this.maintenanceDetails.ImageUrls.length > 0;

      this.showDetailPageLoader = false;
    } else if (error) {
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_MaintainHistory",
        errorLog: err,
        methodName: "handleMaintenanceDetails"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
      console.error(
        "Error retrieving maintenance data:",
        this.MaintenanceId,
        error
      );
    }
  }

  handlePreviousPage2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (this.currentPage > 1) {
        this.refreshData();
        this.prevGoing = true;
        this.currentPage -= 1;
        this.isPreviousDisabled2 = this.currentPage === 1;
        this.isNextDisabled2 = this.currentPage === this.totalPageCount2;
        this.updatePageButtons();
        this.updateVisiblePages();
      }
    }
  }

  handleNextPage2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (this.totalPageCount2 > this.currentPage) {
        this.refreshData();
        this.prevGoing = false;
        this.currentPage += 1;
        console.log(
          "THIS is the current page in handle next",
          this.currentPage
        );
        this.isPreviousDisabled2 = this.currentPage === 1;
        this.isNextDisabled2 = this.currentPage === this.totalPageCount2;
        this.updatePageButtons();
        this.updateVisiblePages();
      }
    }
  }

  pageCountClick2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.refreshData();
      console.log(event.target.dataset.page);
      this.currentPage = Number(event.target.dataset.page);
      this.updatePageButtons();
      this.updateVisiblePages();
    }
  }

  updatePageButtons() {
    console.log("in update pagination");
    const buttons = this.template.querySelectorAll(".mm-page-button");
    buttons.forEach((button) => {
      const pageNum = Number(button.dataset.page);
      if (pageNum === this.currentPage) {
        console.log("Current Page Number clicked: ", pageNum);
        button.classList.add("cuurent-page");
      } else {
        button.classList.remove("cuurent-page");
      }
    });

    this.isPreviousDisabled2 = this.currentPage === 1;
    this.isNextDisabled2 = this.currentPage === this.totalPageCount2;
  }

  updateVisiblePages() {
    let startPage, endPage;

    if (this.currentPage <= 4) {
      startPage = 1;
      endPage = Math.min(4, this.totalPageCount2);
    } else if (
      this.currentPage > 4 &&
      this.currentPage <= this.totalPageCount2 - 4
    ) {
      startPage = this.currentPage - 1;
      endPage = this.currentPage + 2;
    } else {
      startPage = this.totalPageCount2 - 3;
      endPage = this.totalPageCount2;
    }

    this.visiblePageCount2 = [];
    for (let i = startPage; i <= endPage; i++) {
      this.visiblePageCount2.push(i);
    }

    this.visiblePageCount2.forEach((element) => {
      this.showRightDots2 = element !== this.totalPageCount2;
    });
  }

  formatJapaneseDate(isoDate) {
    if (isoDate == undefined || !isoDate || isoDate == "-") {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }

  formatJapaneseDate2(isoDate) {
    if (isoDate == undefined || !isoDate || isoDate == "-") {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-based month
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0"); // Ensure 2-digit hours
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Ensure 2-digit minutes

    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  }

  toggleListType(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showListType = !this.showListType;
      this.showServiceType = false;
      this.showFactoryType = false;
    }
  }
  toggleServiceType(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showServiceType = !this.showServiceType;

      this.showListType = false;
      this.showFactoryType = false;
    }
  }
  toggleFactory(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showFactoryType = !this.showFactoryType;

      this.showListType = false;
      this.showServiceType = false;
    }
  }

  toggleSort1(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.currentPage = 1;
      if (this.showNormalSort1) {
        this.showNormalSort1 = false;
        this.showAscSort1 = true;
        this.showDescSort1 = false;

        this.showNormalSort2 = true;
        this.showAscSort2 = false;
        this.showDescSort2 = false;

        this.sortingField = "Schedule_Date__c";
        this.sortingDirection = "ASC";
      } else if (this.showAscSort1) {
        this.showNormalSort1 = false;
        this.showAscSort1 = false;
        this.showDescSort1 = true;

        this.showNormalSort2 = true;
        this.showAscSort2 = false;
        this.showDescSort2 = false;

        this.sortingField = "Schedule_Date__c";
        this.sortingDirection = "DESC";
      } else if (this.showDescSort1) {
        this.showNormalSort1 = false;
        this.showAscSort1 = true;
        this.showDescSort1 = false;

        this.showNormalSort2 = true;
        this.showAscSort2 = false;
        this.showDescSort2 = false;

        this.sortingField = "Schedule_Date__c";
        this.sortingDirection = "ASC";
      }

      console.log("sort 1:- ", this.sortingField, this.sortingDirection);
    }
  }
  toggleSort2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.currentPage = 1;
      if (this.showNormalSort2) {
        this.showNormalSort2 = false;
        this.showAscSort2 = true;
        this.showDescSort2 = false;

        this.showNormalSort1 = true;
        this.showAscSort1 = false;
        this.showDescSort1 = false;

        this.sortingField = "Implementation_Date__c";
        this.sortingDirection = "ASC";
      } else if (this.showAscSort2) {
        this.showNormalSort2 = false;
        this.showAscSort2 = false;
        this.showDescSort2 = true;

        this.showNormalSort1 = true;
        this.showAscSort1 = false;
        this.showDescSort1 = false;

        this.sortingField = "Implementation_Date__c";
        this.sortingDirection = "DESC";
      } else if (this.showDescSort2) {
        this.showNormalSort2 = false;
        this.showAscSort2 = true;
        this.showDescSort2 = false;

        this.showNormalSort1 = true;
        this.showAscSort1 = false;
        this.showDescSort1 = false;

        this.sortingField = "Implementation_Date__c";
        this.sortingDirection = "ASC";
      }

      console.log("sort 2:- ", this.sortingField, this.sortingDirection);
    }
  }

  handleInsideClick(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
    }
  }

  handleOutsideClick1 = (event) => {
    const dataDropElement = this.template.querySelector(".mm-filter-dropdown1");
    const listsElement = this.template.querySelector(
      ".mm-filter-dropdown-rows1"
    );
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      console.log("template off by outside click", dataDropElement);
      console.log("template off by outside click", dataDropElement);
      console.log("template off by outside click", dataDropElement);
      console.log("template off by outside click", dataDropElement);
      this.showListType = false;
    }
  };
  handleOutsideClick2 = (event) => {
    const dataDropElement = this.template.querySelector(".mm-filter-dropdown2");
    const listsElement = this.template.querySelector(
      ".mm-filter-dropdown-rows2"
    );
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showServiceType = false;
    }
  };
  handleOutsideClick3 = (event) => {
    const dataDropElement = this.template.querySelector(".mm-filter-dropdown3");
    const listsElement = this.template.querySelector(
      ".mm-filter-dropdown-rows3"
    );
    console.log("in outside 3");
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showFactoryType = false;
    }
  };

  handleOutsideClick(event) {
    const isClickInside = this.template
      .querySelector(".inputs-edit")
      .contains(event.target);
    if (!isClickInside) {
      this.showlistScheduleType = false;
    }
  }

  handleOutsideClickFactory(event) {
    const isClickInside = this.template
      .querySelector(".inputs-edit-fact")
      .contains(event.target);
    if (!isClickInside) {
      this.showlistfactoryType = false;
    }
  }

  handleOutsideClickBranch(event) {
    const isClickInside = this.template
      .querySelector(".inputs-edit")
      .contains(event.target);
    if (!isClickInside) {
      this.showBranchlist = false;
    }
  }

  handleOutsideClickSearch(event) {
    const searchList = this.template.querySelector(
      ".paddedContainerSearchList"
    );
    const inputField = this.template.querySelector(".InputsScheduleSearch");
    const isClickInside = searchList?.searchList.contains(event.target);

    if (!isClickInside && !this.itemClicked && this.searchKey.length > 0) {
      this.searchArrayaccount = [];
      this.searchAccountError = true;
      console.log("searchAccountError", this.searchAccountError);
      this.showMorelist = false;
      this.showMyList = true;
      if (inputField) {
        inputField.classList.add("error-input");
      }
    } else {
      this.searchAccountError = false;
      if (inputField) {
        inputField.classList.remove("error-input");
      }
    }
  }

  handleOutsideClickCalendar(event) {
    const isClickInside = this.template
      .querySelector(".calendar-popup")
      .contains(event.target);
    if (!isClickInside) {
      this.isCalendarOpen = false;
      this.isCalendarOpen2 = false;
    }
  }

  handleOutsideClickCalendar2(event) {
    const isClickInside = this.template
      .querySelector(".calendar-popup2")
      .contains(event.target);
    if (!isClickInside) {
      this.isCalendarOpen2 = false;
    }
  }
  handleOutsideClickCalendar5(event) {
    const isClickInside = this.template
      .querySelector(".calendar-popup5")
      .contains(event.target);
    if (!isClickInside) {
      this.isCalendarOpen5 = false;
    }
  }

  handleListTypeChangeAll(event) {
    // event.stopPropagation();
    this.currentPage = 1;
    this.listTypeFilter.selectAll = event.target.checked;
    this.listTypeFilter.option1 = this.listTypeFilter.selectAll;
    this.listTypeFilter.option2 = this.listTypeFilter.selectAll;

    if (event.target.checked) {
      this.listTypeFilterValue = [];
      this.listTypeFilterValue.push("In Progress");
      this.listTypeFilterValue.push("Closed");
    } else {
      this.listTypeFilterValue = [];
      this.listTypeFilterValue.push("Nothing");
    }

    console.log(JSON.stringify(this.listTypeFilter));
  }

  handleListTypeChange(event) {
    // event.stopPropagation();
    this.currentPage = 1;
    const option = event.target.name.toLowerCase().replace(" ", "");

    this.listTypeFilter[option] = event.target.checked;
    this.listTypeFilter.selectAll =
      this.listTypeFilter.option1 && this.listTypeFilter.option2;

    if (!event.target.checked) {
      this.listTypeFilter.selectAll = false;
    }

    let recallArray = [];
    for (const [key, value] of Object.entries(this.listTypeFilter)) {
      if (key === "option1" && value === true) {
        recallArray.push("In Progress");
      } else if (key === "option2" && value === true) {
        recallArray.push("Closed");
      }
    }

    if (recallArray.length === 0) {
      this.listTypeFilterValue = [];
      this.listTypeFilterValue.push("Nothing");
    } else this.listTypeFilterValue = [...recallArray];
  }

  handleServiceTypeChangeAll(event) {
    this.currentPage = 1;
    if (this.sortingField == "Default") this.sortingField = "";
    this.serviceTypeFilter.selectAll = event.target.checked;
    this.serviceTypeFilter.option1 = this.serviceTypeFilter.selectAll;
    this.serviceTypeFilter.option2 = this.serviceTypeFilter.selectAll;
    this.serviceTypeFilter.option3 = this.serviceTypeFilter.selectAll;
    this.serviceTypeFilter.option4 = this.serviceTypeFilter.selectAll;
    this.serviceTypeFilter.option5 = this.serviceTypeFilter.selectAll;
    this.serviceTypeFilter.option6 = this.serviceTypeFilter.selectAll;

    if (event.target.checked) {
      this.serviceTypeFilterValue = [];
      this.serviceTypeFilterValue.push("一般整備");
      this.serviceTypeFilterValue.push("車検整備");
      this.serviceTypeFilterValue.push("3か月点検");
      this.serviceTypeFilterValue.push("6か月点検");
      this.serviceTypeFilterValue.push("12か月点検");
      this.serviceTypeFilterValue.push("24か月点検");
    } else {
      this.serviceTypeFilterValue = [];
      this.serviceTypeFilterValue.push("Nothing");
    }

    console.log(JSON.stringify(this.serviceTypeFilter));
  }

  handleServiceTypeChange(event) {
    this.currentPage = 1;
    if (this.sortingField == "Default") this.sortingField = "";
    const option = event.target.name.toLowerCase().replace(" ", "");

    this.serviceTypeFilter[option] = event.target.checked;
    this.serviceTypeFilter.selectAll =
      this.serviceTypeFilter.option1 &&
      this.serviceTypeFilter.option2 &&
      this.serviceTypeFilter.option3 &&
      this.serviceTypeFilter.option4 &&
      this.serviceTypeFilter.option5 &&
      this.serviceTypeFilter.option6;

    if (!event.target.checked) {
      this.serviceTypeFilter.selectAll = false;
    }

    let recallArray = [];
    for (const [key, value] of Object.entries(this.serviceTypeFilter)) {
      if (key === "option1" && value === true) {
        recallArray.push("一般整備");
      } else if (key === "option2" && value === true) {
        recallArray.push("車検整備");
      } else if (key === "option3" && value === true) {
        recallArray.push("3か月点検");
      } else if (key === "option4" && value === true) {
        recallArray.push("6か月点検");
      } else if (key === "option5" && value === true) {
        recallArray.push("12か月点検");
      } else if (key === "option6" && value === true) {
        recallArray.push("24か月点検");
      }
    }

    if (recallArray.length === 0) {
      this.serviceTypeFilterValue = [];
      this.serviceTypeFilterValue.push("Nothing");
    } else this.serviceTypeFilterValue = [...recallArray];
  }

  handleFactoryTypeChangeAll(event) {
    this.currentPage = 1;
    if (this.sortingField == "Default") this.sortingField = "";
    this.factoryFilter.selectAll = event.target.checked;
    // this.factoryFilter.option1 = this.factoryFilter.selectAll;
    this.factoryFilter.option2 = this.factoryFilter.selectAll;
    this.factoryFilter.option3 = this.factoryFilter.selectAll;

    if (event.target.checked) {
      this.factoryFilterValue = [];
      this.factoryFilterValue.push("自社");
      this.factoryFilterValue.push("ふそう/自社 以外");
    } else {
      this.factoryFilterValue = [];
      this.factoryFilterValue.push("Nothing");
    }
    console.log(JSON.stringify(this.factoryFilter));
  }

  handleFactoryTypeChange(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.currentPage = 1;
      if (this.sortingField == "Default") this.sortingField = "";
      const option = event.target.name.toLowerCase().replace(" ", "");

      this.factoryFilter[option] = event.target.checked;
      this.factoryFilter.selectAll =
        //   this.factoryFilter.option1 &&
        this.factoryFilter.option2 && this.factoryFilter.option3;

      if (!event.target.checked) {
        this.factoryFilter.selectAll = false;
      }

      let recallArray = [];
      for (const [key, value] of Object.entries(this.factoryFilter)) {
        //   if (key === "option1" && value === true) {
        //     recallArray.push("ふそう");
        //   } else
        if (key === "option2" && value === true) {
          recallArray.push("自社");
        } else if (key === "option3" && value === true) {
          recallArray.push("ふそう/自社 以外");
        }
      }

      if (recallArray.length === 0) {
        this.factoryFilterValue = [];
        this.factoryFilterValue.push("Nothing");
      } else this.factoryFilterValue = [...recallArray];
    }
  }

  //   handleSortNotificationDate() {
  //     this.currentPage = 1;
  //     this.renovationSortForQuery = "";
  //     if (this.notificationSortForQuery === "") {
  //       this.notificationSortForQuery = "ASC";

  //       this.renovationSortForQuery = "";
  //       this.showAscSort1 = false;
  //       this.showNormalSortIcon1 = true;
  //       this.showDescSort1 = false;

  //       this.showAscSort2 = true;
  //       this.showNormalSortIcon2 = false;
  //       this.showDescSort2 = false;
  //     } else if (this.notificationSortForQuery === "ASC") {
  //       this.notificationSortForQuery = "DESC";

  //       this.renovationSortForQuery = "";
  //       this.showAscSort1 = false;
  //       this.showNormalSortIcon1 = true;
  //       this.showDescSort1 = false;

  //       this.showAscSort2 = false;
  //       this.showNormalSortIcon2 = false;
  //       this.showDescSort2 = true
  //     } else if (this.notificationSortForQury === "DESC") {
  //       this.notificationSortForQuery = "ASC";

  //       this.renovationSortForQuery = "";
  //       this.showAscSort1 = false;
  //       this.showNormalSortIcon1 = true;
  //       this.showDescSort1 = false;

  //       this.showAscSort2 = true;
  //       this.showNormalSortIcon2 = false;
  //       this.showDescSort2 = false;
  //     }
  //     console.log("notification sort", this.notificationSortForQuery);
  //   } 

  // @track isFusoMaintenance = false;

  toggleListToDetailUi(event) {
      let maintenaceId = event.target.dataset.id;
      // let orderNumber = event.target.dataset.order; // if - then non fuso else fuso
      
      // if(orderNumber !== '-'){
      //   this.isFusoMaintenance = true;
      // }
      console.log("List to detail ui: ", maintenaceId, this.MaintenanceId);
      let newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&maintenanceId=${maintenaceId}&instance=maintenanceDetail`;
      console.log("List to detail ui 1");
      window.history.replaceState({}, document.title, newUrl);
      console.log("List to detail ui 2");
      if (
        this.MaintenanceId !== event.target.dataset.id &&
        !this.maintenaceListId
      ) {
        this.showDetailPageLoader = true;
        console.log(
          "this.maintenanceId",
          this.MaintenanceId,
          "event.target.dataset.id",
          event.target.dataset.id
        );
      }
      console.log("List to detail ui 3");
      this.myday = undefined;
      this.myMonth = undefined;
      this.myYear = undefined;
      console.log("List to detail ui 4");
      this.myday2 = undefined;
      this.myYear2 = undefined;
      this.myMonth2 = undefined;
      console.log("List to detail ui 5");

      refreshApex(this.wiredVehicleResultDetail);
      console.log("List to detail ui 6");
      setTimeout(() => {
        refreshApex(this.wiredVehicleResultDetail);
      }, 1000);
      console.log("List to detail ui 7");
      this.showListPage = false;
      this.showDetailPage = true;

      if (!this.maintenaceListId) {
        this.MaintenanceId = event.target.dataset.id;
      } else {
        this.MaintenanceId = this.maintenaceListId;
      }
      console.log("record id of maintance page:- ", event.target.dataset.id);
    
  }

  toggleListToDetailUi2() {
    console.log("maintenaceListId", this.maintenaceListId);

    this.myday = undefined;
    this.myMonth = undefined;
    this.myYear = undefined;

    this.myday2 = undefined;
    this.myYear2 = undefined;
    this.myMonth2 = undefined;

    refreshApex(this.wiredVehicleResultDetail);

    setTimeout(() => {
      refreshApex(this.wiredVehicleResultDetail);
    }, 1000);

    this.showListPage = false;
    this.showDetailPage = true;

    this.MaintenanceId = this.maintenaceListId;
  }

  @api returnToList() {
    console.log("returnTOList called");
    console.log("returnTOList called2");
    if (this.isEditBottomInfo || this.iseditTopInfo) {
      this.showBackEditmodal = true;
    } else {
      const newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=maintenancelist`;
      window.history.replaceState({}, document.title, newUrl);
      refreshApex(this.wiredVehicleResult);
      this.showListPage = true;
      this.showDetailPage = false;
    }

    this.maintenaceListId = null;
  }

  handleToggleZoomInImage(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (this.showZoomInImageModal === false) {
        this.currentImageUrl = event.target.dataset.fileurl;
        console.log("currentImageUrl1", event.target.dataset.fileurl);
      }
      if (event.target.dataset.fileurl) {
        this.showZoomInImageModal = !this.showZoomInImageModal;
      } else {
        this.showZoomInImageModal = false;
      }
    }
  }

  onClose(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=history`;
      window.history.replaceState({}, document.title, newUrl);
      this.dispatchEvent(new CustomEvent("back"));
      console.log("goback2");
    }
  }
  handleOpenNewMaintainHistory(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=schedule`;
      window.history.replaceState({}, document.title, newUrl);
      this.dispatchEvent(new CustomEvent("opennewmaintainhistory"));
    }
  }

  editTopInfo(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.iseditTopInfo = !this.iseditTopInfo;
      this.selectedDateRange5 = `${this.maintenanceDetails.Schedule_Date__c} - ${this.maintenanceDetails.Schedule_EndDate__c}`;
      this.selectedPicklistfactoryType =
        this.maintenanceDetails.Service_Factory__c === "-"
          ? ""
          : this.maintenanceDetails.Service_Factory__c;
      console.log(
        "On Editing: ",
        this.maintenanceDetails.Schedule_Date__c,
        this.maintenanceDetails.Schedule_EndDate__c
      );
      if (!!this.maintenanceDetails.Schedule_Date__c) {
        const dateParts = this.maintenanceDetails.Schedule_Date__c.match(
          /(\d{4})年(\d{2})月(\d{2})日/
        );
        if (dateParts) {
          this.startDate5 = {
            day: dateParts[3],
            month: dateParts[2],
            year: dateParts[1]
          };
        }
      }

      if (!!this.maintenanceDetails.Schedule_EndDate__c) {
        const endDateParts = this.maintenanceDetails.Schedule_EndDate__c.match(
          /(\d{4})年(\d{2})月(\d{2})日/
        );
        if (endDateParts) {
          this.endDate5 = {
            day: endDateParts[3],
            month: endDateParts[2],
            year: endDateParts[1]
          };
        }
      }
      if (this.maintenanceDetails.Service_Factory__c === "ふそう/自社 以外") {
        this.destinationAccBranch = this.accountObj.Name || "";
        this.destinationAccBranchToShowonDetail =
          this.destinationAccBranch === "" ? "-" : this.destinationAccBranch;
        this.destinationAccountBranchtosend = this.accountObj.Id || null;
        this.destPostcode = this.accountObj.ShippingPostalCode || "";
        this.destMunc = this.accountObj.ShippingCity || "";
        this.destPref = this.accountObj.ShippingState || "";
        this.destStreet = this.accountObj.ShippingStreet || "";

        if (this.destinationAccBranch) {
          this.divforAccountAddress = true;
        } else {
          this.divforAccountAddress = false;
        }
      } else {
        this.destinationAccBranch = this.branchObj.Name || "";
        this.destinationBranchToshow =
          this.substringToProperLength(this.branchObj.Name, 28) || "";
        console.log("branch to show", this.destinationBranchToshow);
      }

      console.log(
        "Before Edit Values Here: ",
        "this.serviceFactory: ",
        this.selectedPicklistfactoryType,
        "this.destinationAccBranch: ",
        this.destinationAccBranch,
        "this.destinationAccNoSearch: ",
        this.destinationNosearch
      );
    }
  }

  get ifHistory() {
    console.log("Maintenance Type:", this.MaintenanceType);
    console.log("Stored Schedule Date:", this.storedScheduleDate);
    console.log("Stored Implementation Date:", this.storedImplementationDate);
    // return !this.storedScheduleDate; // Explicitly convert to boolean
    return this.MaintenanceType === "History";
  }

  handleEditRichtext(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.isEditBottomInfo = !this.isEditBottomInfo;
      this.deleteRecordFull = [];
      this.deleteRecordIdsimg = [];
      console.log("inside rich edit");
    }
  }

  allowedFormats = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "indent",
    "align",
    "clean",
    "table",
    "header",
    "color",
    "background"
  ];
  handleInsertImage(event) {
    // Prompt the user for an image URL
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const imageUrl = prompt("Enter the image URL:");
      if (imageUrl) {
        // Insert the image into the rich text area
        const richTextArea = this.template.querySelector(
          "lightning-input-rich-text"
        );
        const currentContent = richTextArea.value;
        const updatedContent = `${currentContent}<img src="${imageUrl}" alt="Inserted Image" style="max-width: 100%; height: auto;">`;
        richTextArea.value = updatedContent; // Update the value with the new image
      }
    }
  }
  @track descValue = "";
  @track characterCount = 0;
  maxCharacterLimit = 1000;
  errorMessage = "";

  handleRichTextChange(event) {
    const richText = event.target.value;
    const plainText = this.stripHTML(richText);

    if (plainText.length > this.maxCharacterLimit) {
      event.target.value = this.richTextVal;
      this.errorMessage = `Character limit of ${this.maxCharacterLimit} exceeded!`;
    } else {
      this.richTextVal = richText;
      this.characterCount = plainText.length;
      this.errorMessage = "";
    }
  }
  stripHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  // handleFilesChange(event) {
  //   const files = event.target.files;
  //   const newImages = [];
  //   this.isalluploadedimages = true;

  //   if (this.maintenanceDetails.ImageUrls.length + files.length > 10) {
  //     this.dispatchEvent(
  //       new ShowToastEvent({
  //         message: this.labels2.ccp2_ce_error_max_images,
  //         variant: "error"
  //       })
  //     );
  //     this.isalluploadedimages = false;
  //     event.stopPropagation();
  //     this.template.querySelector('input[type="file"]').value = "";
  //     return;
  //   }

  //   // this.isloadingImages = true;

  //   const fileReadPromises = [];

  //   for (let i = 0; i < files.length; i++) {
  //     const file = files[i];

  //     const isDuplicate = this.uploadedImages.some(
  //       (image) => image.name === file.name
  //     );
  //     console.log("workonduplicate", JSON.stringify(isDuplicate));
  //     if (isDuplicate) {
  //       //console.log(`Duplicate file detected: ${file.name}`);
  //       this.dispatchEvent(
  //         new ShowToastEvent({
  //           message: `${file.name} 同じ名前のファイルがすでに存在します。`,
  //           variant: "error"
  //         })
  //       );
  //       this.isalluploadedimages = false;
  //       continue;
  //     }

  //     const fileReadPromise = new Promise((resolve) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => {
  //         const img = new Image();
  //         img.src = reader.result;

  //         img.onload = () => {
  //           let width = img.width;
  //           let height = img.height;

  //           if (width > 2400 || height > 2000) {
  //             width = width / 6;
  //             height = height / 6;
  //           }

  //           const canvas = document.createElement("canvas");
  //           canvas.width = width;
  //           canvas.height = height;
  //           const ctx = canvas.getContext("2d");
  //           ctx.drawImage(img, 0, 0, width, height);

  //           const resizedImageData = canvas.toDataURL(file.type);

  //           const newImage = {
  //             id: file.name + i,
  //             fileURL: resizedImageData,
  //             fileName: file.name,
  //             halfName: file.name.substring(0, 8) + "...",
  //             isloadingImages: true
  //           };

  //           this.maintenanceDetails.ImageUrls.push(newImage);
  //           newImages.push(newImage);

  //           this.maintenanceDetails.ImageUrls = [
  //             ...this.maintenanceDetails.ImageUrls
  //           ];

  //           resolve();
  //         };
  //       };

  //       reader.readAsDataURL(file);
  //     });

  //     fileReadPromises.push(fileReadPromise);
  //   }

  //   Promise.all(fileReadPromises).then(() => {
  //     if (newImages.length > 0) {
  //       this.createContentVersionRecords(newImages);
  //     }
  //     // this.isloadingImages = false;
  //   });
  //   event.target.value = null;
  // }

  @track showcancelimageModal = false;
  @track imageEvent;
  opencancelimagemodal(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.imageEvent = event.currentTarget;
      this.showcancelimageModal = true;
    }
  }

  handleimageNo(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.showcancelimageModal = false;
    }
  }

  handleimageYes(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.showcancelimageModal = false; // Close
      this.handleRemoveImage(this.imageEvent); // Call the function
    }
  }

  handleRemoveImage(event) {
    const recordId = event.dataset.id;
    this.deleteRecordIdsimg.push(recordId);
    console.log("delete record ids", JSON.stringify(this.deleteRecordIdsimg));
    this.isalluploadedimages = true;
    console.log("recid", recordId);
    if (recordId) {
      this.isloadingImages = true;
      const recordToDelete = this.maintenanceDetails.ImageUrls.find(
        (image) => image.recordId === recordId
      );
      if (recordToDelete) {
        this.deleteRecordFull.push(recordToDelete);
      }
      console.log("delete recordsssss", JSON.stringify(this.deleteRecordFull));
      console.log(
        "delete recordsssss length",
        JSON.stringify(this.deleteRecordFull.length)
      );

      this.maintenanceDetails.ImageUrls =
        this.maintenanceDetails.ImageUrls.filter(
          (image) => image.recordId !== recordId
        );

      this.uploadedImages = this.uploadedImages.filter(
        (image) => image.recordId !== recordId
      );

      console.log(" this.imagesCreatedId", this.imagesCreatedId);
      this.imagesCreatedId = this.imagesCreatedId.filter(
        (id) => id !== recordId
      );
      console.log(" this.imagesCreatedId2", this.imagesCreatedId);
      this.isloadingImages = false;
      this.isalluploadedimages = false;
    } else {
      console.error("Error: No valid record ID found for deletion.");
      this.isalluploadedimages = false;
    }
  }

  get isLoaderTrue() {
    let tem = false;
    console.log("isLoaderTrue:", tem, this.maintenanceDetails.ImageUrls);
    return tem || false;
  }

  handleFilesChange(event) {
    const files = event.target.files;
    const newImages = [];
    if (this.maintenanceDetails.ImageUrls.length + files.length > 10) {
      this.dispatchEvent(
        new ShowToastEvent({
          message: this.labels2.ccp2_ce_error_max_images,
          variant: "error"
        })
      );
      event.stopPropagation();
      this.template.querySelector('input[type="file"]').value = "";
      return;
    }

    const fileReadPromises = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validFileTypes.includes(file.type)) {
        this.dispatchEvent(
          new ShowToastEvent({
            message: this.labels2.ccp2_ce_error_invalid_file_type,
            variant: "error"
          })
        );
        this.isalluploadedimages = false;
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        this.dispatchEvent(
          new ShowToastEvent({
            message: this.labels2.ccp2_ce_error_file_size_exceeded,
            variant: "error"
          })
        );
        this.isalluploadedimages = false;
        continue;
      }

      console.log("uploaded images", JSON.stringify(this.uploadedImages));
      console.log("file name", file.name);

      const isDuplicate =
        this.uploadedImages.some((image) => image.fileName === file.name) ||
        this.maintenanceDetails.ImageUrls.some(
          (image) => image.fileName === file.name
        );
      console.log("is duplicate", isDuplicate);
      if (isDuplicate) {
        this.dispatchEvent(
          new ShowToastEvent({
            message: `${file.name} ${this.labels2.ccp2_ce_error_duplicate_file_name}`,
            variant: "error"
          })
        );
        continue;
      }

      const fileReadPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.src = reader.result;
          img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width > 2400 || height > 2000) {
              width = width / 6;
              height = height / 6;
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            const resizedImageData = canvas.toDataURL(file.type);

            const newImage = {
              id: file.name + i,
              fileURL: resizedImageData,
              fileName: file.name,
              halfName: file.name.substring(0, 8) + "...",
              isloadingImages: true
            };

            this.maintenanceDetails.ImageUrls.push(newImage);
            newImages.push(newImage);
            this.maintenanceDetails.ImageUrls = [
              ...this.maintenanceDetails.ImageUrls
            ];

            resolve();
          };
        };

        reader.readAsDataURL(file);
      });

      fileReadPromises.push(fileReadPromise);
    }

    Promise.all(fileReadPromises).then(() => {
      if (newImages.length > 0) {
        this.showImages = true; // Show images if new ones are added
        this.createContentVersionRecords(newImages);
      }
    });
    event.target.value = null;
  }

  // handleRemoveImage(event) {
  //   const recordId = event.target.dataset.id;
  //   if (recordId) {
  //     // this.maintenanceDetails.ImageUrls = this.maintenanceDetails.ImageUrls.map(
  //     //   (image) => {
  //     //     if(image.recordId === recordId){
  //     //       image.isloadingImages = true;
  //     //     }
  //     //     return image;
  //     //   }
  //     // );
  //     this.maintenanceDetails.ImageUrls = this.maintenanceDetails.ImageUrls.filter(
  //       (image) => image.recordId !== recordId
  //     );

  //     this.uploadedImages = this.uploadedImages.filter(
  //       (image) => image.recordId !== recordId
  //     );

  //     this.showImages = this.maintenanceDetails.ImageUrls.length > 0; // Dynamically update showImages
  //   } else {
  //     console.error("Error: No valid record ID found for deletion.");
  //   }
  // }

  deletecontentversion(recordId) {
    deletecontentversion({
      contentVersionId: recordId,
      maintenanceId: this.MaintenanceId
    })
      .then(() => {
        console.log("inside delete");
        this.maintenanceDetails.ImageUrls =
          this.maintenanceDetails.ImageUrls.filter(
            (image) => image.recordId !== recordId
          );

        console.log("inside delete2", this.maintenanceDetails.ImageUrls);

        this.uploadedImages = this.uploadedImages.filter(
          (image) => image.recordId !== recordId
        );
        console.log("below main details delete", this.uploadedImages);

        console.log("below main uploaded delete", this.imagesCreatedId);
        this.imagesCreatedId = this.imagesCreatedId?.filter(
          (id) => id !== recordId
        );
        console.log("below main uploaded delete2", this.imagesCreatedId);
        console.log("below imagescreated main uploaded delete");

        this.isloadingImages = false;
        this.isalluploadedimages = false;
      })
      .catch((error) => {
        this.isloadingImages = false;
        this.isalluploadedimages = false;
        console.error("Error deleting image:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "deleteContentVersion"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  createContentVersionRecords(newImages) {
    this.imagesCreatedId = this.imagesCreatedId || [];
    this.uploadedImages = this.uploadedImages || [];

    const uploadPromises = newImages
      .filter(
        (image) =>
          !this.uploadedImages.some(
            (uploaded) => uploaded.name === image.fileName
          )
      )
      .map((image) => {
        const fields = {};
        fields[TITLE_FIELD.fieldApiName] = image.fileName;

        const base64String = image.fileURL.includes("base64,")
          ? image.fileURL.split("base64,")[1]
          : image.fileURL;

        if (base64String.length > 0 && base64String.length <= 5242880) {
          fields[VERSION_DATA_FIELD.fieldApiName] = base64String;
          fields[PATH_ON_CLIENT_FIELD.fieldApiName] = image.fileName;

          return createRecord({
            apiName: CONTENT_VERSION_OBJECT.objectApiName,
            fields
          })
            .then((record) => {
              this.imagesCreatedId.push(record.id);

              this.uploadedImages.push(image);
              console.log(
                "uploaded images in content",
                JSON.stringify(this.uploadedImages)
              );

              const imageToUpdate = this.maintenanceDetails.ImageUrls.find(
                (img) => {
                  if (img.id === image.id) {
                    img.isloadingImages = false;
                  }
                  return img.id === image.id;
                }
              );
              if (imageToUpdate) {
                imageToUpdate.recordId = record.id;
                //console.log("sw2images",JSON.stringify(this.imageList));
              }
              console.log(
                "images array urlsss",
                JSON.stringify(this.maintenanceDetails.ImageUrls)
              );
            })
            .catch((error) => {
              console.error("Error creating ContentVersion:", error);
              let err = JSON.stringify(error);
              ErrorLog({
                lwcName: "ccp2_MaintainHistory",
                errorLog: err,
                methodName: "createContentVersion"
              })
                .then(() => {
                  console.log("Error logged successfully in Salesforce");
                })
                .catch((loggingErr) => {
                  console.error(
                    "Failed to log error in Salesforce:",
                    loggingErr
                  );
                });
              this.dispatchEvent(
                new ShowToastEvent({
                  message: `${this.labels2.ccp2_ce_error_uploading_image} "${image.fileName}": ${error}`,
                  variant: "error"
                })
              );
              this.isalluploadedimages = false;
            });
        } else {
          console.error(
            "Invalid Base64 string or exceeds size limit for image:",
            image.fileName
          );
          this.isalluploadedimages = false;
          return Promise.reject("Invalid Base64 string or size limit exceeded");
        }
      });

    Promise.all(uploadPromises)
      .then(() => {
        console.log("All new images uploaded:", this.imagesCreatedId);
        this.isloadingImages = false; // Stop the loader
        this.isalluploadedimages = false;
        // this.dispatchEvent(
        //     new Show{labels2.ccp2_ce_enter_entry_location}Event({
        //         title: 'Success',
        //         message: 'New images uploaded successfully',
        //         variant: 'success',
        //     })
        // );
      })
      .catch((error) => {
        this.isloadingImages = false; // Stop loader in case of an error
        this.isalluploadedimages = false;
        console.error("Error uploading one or more images:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "createContentVersion"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  handleScheduleTypeChange(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      // this.showerrorScheduleType = false;
      if (
        event.type === "click" ||
        (event.type === "keydown" && event.key === "Enter")
      ) {
        event.stopPropagation();
        this.showlistScheduleType = !this.showlistScheduleType;
        this.showlistfactoryType = false;
        this.showBranchlist = false;
        this.isCalendarOpen = false;
        this.isCalendarOpen2 = false;
        this.showMorelist = false;
        this.searchArrayaccount = [];
      }
    }
  }

  handlePickListChange(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const selectedValue = event.target.dataset.idd;
      this.selectedPicklistScheduleType = selectedValue;
      this.showlistScheduleType = false;
      console.log("this.selected pick", this.selectedPicklistScheduleType);
      // this.updateMaintenanceData();
    }
  }

  handlefactoryTypeChange(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showlistfactoryType = !this.showlistfactoryType;
      this.showlistScheduleType = false;
      this.showBranchlist = false;
      this.isCalendarOpen = false;
      this.isCalendarOpen2 = false;
      this.showMorelist = false;
      this.searchArrayaccount = [];
    }
  }

  handlePickListChangefactory(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const selectedValue = event.target.dataset.idd;
      this.selectedPicklistfactoryType = selectedValue;
      // this.updateMaintenanceData();
      // this.destinationAccBranch = "";
      // this.destinationAccountBranchtosend = null;
      // this.destMunc = "";
      // this.destPostcode = "";
      // this.destPref = "";
      // this.destStreet = "";
      // this.divforAccountAddress = false;
      this.handleRemovesearchKey();
      this.destinationBranchToshow = "";
      this.showlistfactoryType = false;
    }
  }

  handleBranchListclick(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showBranchlist = !this.showBranchlist;
      console.log("inside poen branch");
      this.showlistScheduleType = false;
      this.showlistfactoryType = false;
      this.isCalendarOpen = false;
      this.isCalendarOpen2 = false;
      this.showMorelist = false;
      this.searchArrayaccount = [];
    }
  }

  get isOwned() {
    return this.selectedPicklistfactoryType === "自社";
  }

  handleNone(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.destinationAccBranch = "";
      this.destinationBranchToshow = "";
      this.destinationAccountBranchtosend = null;
      this.showBranchlist = false;
      // this.updateMaintenanceData();
    }
  }

  // handlebranchNameClick(event) {
  //   // const branchname = event.target.dataset.namee
  //   // this.destinationAccBranch = branchname.length > 19 ? branchname.substring(0,19) + "..." : branchname;
  //   this.destinationAccBranch = event.currentTarget.dataset.namee;
  //   this.destinationBranchToshow = this.substringToProperLength(event.target.dataset.namee,28);
  //   this.destinationAccountBranchtosend = event.target.dataset.idd;
  //   this.showBranchlist = !this.showBranchlist;
  //   console.log("this.dessss", this.destinationAccountBranch);
  //   console.log("this.dessss show", this.destinationAccountBranchtosend);
  //   console.log("branch name id", this.destinationAccountBranchtosend);
  //   // this.updateMaintenanceData();
  // }

  handlebranchNameClick(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const branchname = event.currentTarget.dataset.namee; // Use currentTarget to get the correct dataset
      this.destinationAccBranch = branchname;
      this.destinationBranchToshow = this.substringToProperLength(
        branchname,
        28
      );
      this.destinationAccountBranchtosend = event.currentTarget.dataset.idd; // Use currentTarget
      this.showBranchlist = !this.showBranchlist;

      console.log("Branch Name:", this.destinationAccBranch);
      console.log("Branch ID:", this.destinationAccountBranchtosend);
    }
  }

  handleSearchAccount(event) {
    event.stopPropagation();
    this.searchKey = event.target.value;
    if (this.searchKey.length === 0) {
      this.searchArrayaccount = [];
      this.showMore = false;
    }
    this.showMyList = false;
    // this.itemClicked = false;
    if (this.searchKey.length >= 1) {
      this.showMorelist = true;
      this.showlistScheduleType = false;
      this.showlistfactoryType = false;
      this.isCalendarOpen = false;
      this.isCalendarOpen2 = false;
      this.isCalendarOpen5 = false;
      this.searchClassAccount(this.searchKey);
    } else {
      this.searchaccounts = [];
    }
  }

  searchClassAccount(account) {
    getSearchAccount({ accSearch: account })
      .then((result) => {
        console.log("data from search para", account);
        console.log("data from search", result);
        console.log("data from search length", result.length);

        this.searchaccounts = result.slice(0, 99);
        this.searchArrayaccount = result.map((item) => {
          const shippingAdd = item.ShippingAddress || {};
          return {
            id: item.Id,
            name: item.Name,
            shippingAdd: {
              PostalCode: shippingAdd.postalCode || "",
              prefect: shippingAdd.state || "",
              municipality: shippingAdd.city || "",
              street: shippingAdd.street || ""
            },
            hasAddress:
              shippingAdd.postalCode ||
              shippingAdd.state ||
              shippingAdd.city ||
              shippingAdd.street
          };
        });
        console.log("searchaccounts search length", result.slice(0, 99));
        this.errorSearch = undefined;
        console.log("inside class");
      })
      .catch((error) => {
        this.errorSearch = error.body.message;
        this.readonlyaccount = false;
        this.searchaccounts = undefined;
        console.error("searchClassAccount", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "searchClassAccount"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  get searchlistClass() {
    return (this.searchArrayaccount && this.searchArrayaccount.length > 0) ||
      (this.searchKey && !this.showMyList)
      ? "paddedContainerSearchList"
      : "paddedContainerSearchList empty";
  }

  handleAccountClick(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.showMore = false;
      this.destinationAccBranch = event.target.dataset.namee;
      this.destinationAccountBranchtosend = event.target.dataset.idd;
      this.destPostcode = event.target.dataset.postal || "";
      this.destMunc = event.target.dataset.mun || "";
      this.destPref = event.target.dataset.prefect || "";
      this.destStreet = event.target.dataset.street || "";
      console.log(
        "post mun perft",
        this.postCode,
        this.municipality,
        this.perfecturess
      );
      // this.searchKey = `${accountName} ${this.postCode} ${this.municipality} ${this.perfecturess} ${this.street}`;
      this.searchArrayaccount = [];
      this.itemClicked = true; // Set flag to true when an item is clicked
      this.readonlyaccount = true;
      this.searchAccountError = false;
      this.divforAccountAddress = true;
      this.showMyList = true;
      // console.log("desti account", this.destinationAccountBranch);
      // this.updateMaintenanceData();
    }
  }

  get searchKeyPresent() {
    return this.searchKey || this.destinationAccBranch;
  }

  handleRemovesearchKey() {
    // if (
    //   event.type === "click" ||
    //   (event.type === "keydown" && event.key === "Enter")
    // ) {
      // event.stopPropagation();
      console.log("clicked1", this.searchKey);
      this.searchKey = "";
      console.log("clicked2", this.searchKey);
      this.destinationAccBranch = "";
      console.log("clicked3", this.searchKey);
      this.destinationBranchToshow = "";
      console.log("clicked4", this.searchKey);

      this.destinationAccountBranchtosend = null;
      this.divforAccountAddress = false;
      this.readonlyaccount = false;
      this.searchArrayaccount = [];
      this.itemClicked = false;
      console.log("clicked5", this.searchKey);
      // this.updateMaintenanceData();
    // }
  }

  backfromEdittop(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.destinationBranchToshow = "";
      this.maintenanceDetails.Schedule_Date__c =
        this.maintenanceDetails.Schedule_Date__c3;
      this.maintenanceDetails.Schedule_EndDate__c =
        this.maintenanceDetails.Schedule_EndDate__c3;
      this.maintenanceDetails.Implementation_Date__c =
        this.maintenanceDetails.Implementation_Date__c3;

      this.iseditTopInfo = false;

      this.selectedPicklistScheduleType =
        this.maintenanceDetails.Service_Type__c;
      this.selectedPicklistfactoryType =
        this.maintenanceDetails.Service_Factory__c;
      this.destinationNosearch =
        this.maintenanceDetails.Recieving_Destination_noSearch__c === "-"
          ? ""
          : this.maintenanceDetails.Recieving_Destination_noSearch__c;
      this.searchKey = "";
      this.readonlyaccount = false;

      // this.maintenanceDetails.Schedule_Date__c = this.parseDate(this.storedScheduleDate);
      // this.maintenanceDetails.Schedule_EndDate__c = this.parseDate(this.storedScheduleEndDate);
      this.maintenanceDetails.Schedule_Date__c2 = this.storedScheduleDate;
      this.maintenanceDetails.Schedule_EndDate__c2 = this.storedScheduleEndDate;
      this.maintenanceDetails.Implementation_Date__c2 =
        this.storedImplementationDate;
      const todayD = new Date();
      this.selectedDate = null;
      this.selectedDay = null;
      this.year = todayD.getFullYear();
      this.month = todayD.getMonth() + 1;
      this.myYear = undefined;
      this.myMonth = undefined;
      this.myday = undefined;

      if (this.MaintenanceType === "Scheduled") {
        console.log("changing for schedule");
        this.myYear2 = todayD.getFullYear();
        this.myMonth2 = todayD.getMonth() + 1;
      } else {
        console.log("changing for implementatiin");
        this.myYear2 = undefined;
        this.myMonth2 = undefined;
      }
      this.myday2 = undefined;
      this.selectedDateToSend = null;
      this.selectedDateToSend2 = null;
      this.selectedDate2 = null;
      this.selectedDay2 = null;
    }
  }

  backfromEditbottom(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      console.log("belw refreshh");
      this.isEditBottomInfo = false;
      if (this.maintenanceDetails.Description_Rich_Text__c == "-") {
        this.richTextVal = "";
      } else {
        this.richTextVal = this.maintenanceDetails.Description_Rich_Text__c;
      }

      console.log(
        "delete recordsssss backkk",
        JSON.stringify(this.deleteRecordFull)
      );
      console.log(
        "delete recordsssss lengthhhh",
        JSON.stringify(this.deleteRecordFull.length)
      );

      if (this.deleteRecordFull.length !== 0) {
        let mainImages = [...this.maintenanceDetails.ImageUrls];
        const deletedImages = [...this.deleteRecordFull];
        const lastImages = [...this.imagesArrayTocompare];

        mainImages = mainImages.filter(
          (image) => !deletedImages.includes(image)
        );
        const updatedDeletedImages = deletedImages.filter(
          (image) => !lastImages.includes(image)
        );
        console.log("this data", JSON.stringify(updatedDeletedImages));
        const imagesToAdd = lastImages
          .filter(
            (lastImage) =>
              !mainImages.some(
                (mainImage) => mainImage.fileName === lastImage.fileName
              )
          )
          .map((image) => ({
            ...image, // Spread existing properties
            recordId: image.id, // Add a new property `recordId`
            id: undefined // Optionally remove the old `id` property
          }));
        console.log("this data 2", JSON.stringify(imagesToAdd));
        mainImages = [...mainImages, ...imagesToAdd];

        console.log("this data 3");

        this.maintenanceDetails.ImageUrls = mainImages;
        this.deleteRecordFull = updatedDeletedImages;
        console.log("this data 4");

        this.maintenanceDetails.ImageUrls =
          this.maintenanceDetails.ImageUrls.map((elm) => {
            elm.isloadingImages = false;
            return elm;
          });
      }
      console.log("this data 5");

      this.deleteRecordFull = [];
      this.deleteRecordIdsimg = [];
      console.log("this data 6");

      if (this.imagesCreatedId) {
        this.imagesCreatedId.forEach((img) => {
          this.deletecontentversion(img);
          console.log("working delete");
        });
      }

      console.log("this data 7");

      refreshApex(this.wiredVehicleResultDetail);

      // this.getMaintenanceDetailsMethod(this.MaintenanceId);
    }
  }

  handlenoSearch(event) {
    this.destinationNosearch = event.target.value;
    // this.updateMaintenanceData();
  }
  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    console.log("before", value, " - length", value.length);
    if (value.length > maxLength) {
      event.target.blur();
    }
  }

  handleCancelNo(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.showBackEditmodal = false;
    }
  }
  handleCancelYes(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=maintenancelist`;
      window.history.replaceState({}, document.title, newUrl);
      this.showListPage = true;
      refreshApex(this.wiredVehicleResultDetail);
      this.maintenanceDetails.Schedule_Date__c =
        this.maintenanceDetails.Schedule_Date__c3;
      this.maintenanceDetails.Schedule_EndDate__c =
        this.maintenanceDetails.Schedule_EndDate__c3;
      this.maintenanceDetails.Implementation_Date__c =
        this.maintenanceDetails.Implementation_Date__c3;
      this.maintenanceDetails.Schedule_Date__c2 = this.storedScheduleDate;
      this.maintenanceDetails.Schedule_EndDate__c2 = this.storedScheduleEndDate;
      this.maintenanceDetails.Implementation_Date__c2 =
        this.storedImplementationDate;
      this.destinationNosearch =
        this.maintenanceDetails.Recieving_Destination_noSearch__c;
      this.selectedPicklistScheduleType =
        this.maintenanceDetails.Service_Type__c;

      const todayD = new Date();
      this.selectedDate = null;
      this.selectedDay = null;
      this.year = todayD.getFullYear();
      this.month = todayD.getMonth() + 1;
      this.myYear = undefined;
      this.myMonth = undefined;
      this.myday = undefined;
      if (this.MaintenanceType === "Scheduled") {
        console.log("changing for schedule");
        this.myYear2 = undefined;
        this.myMonth2 = undefined;
      } else {
        console.log("changing for implementatiin");
        this.myYear2 = undefined;
        this.myMonth2 = undefined;
      }
      this.myday2 = undefined;
      this.selectedDateToSend = null;
      this.selectedDateToSend2 = null;

      this.selectedDate2 = null;
      this.selectedDay2 = null;

      this.showBackEditmodal = false;
      this.iseditTopInfo = false;
      this.isEditBottomInfo = false;
      this.showDetailPage = false;
      
      refreshApex(this.wiredVehicleResult);
      this.backfromEditbottom();
    }
  }

  handlesaveeditbottom(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      console.log("below main data update in save");
      this.deleteRecordIdsimg.forEach((img) => {
        console.log("working delete2", img);
        this.deletecontentversion(img);
        console.log("working delete");
      });
      this.updateMaintenanceData();
      console.log("below delete records data update in save");
      this.isEditBottomInfo = false;
      this.maintenanceDetails.Description_Rich_Text__c = this.richTextVal;

      refreshApex(this.wiredVehicleResultDetail);

      setTimeout(() => {
        refreshApex(this.wiredVehicleResultDetail);
      }, 1500);
      this.uploadedImages = [];
    }
  }

  get era() {
    return this.getJapaneseEra(this.year);
  }

  get era2() {
    return this.getJapaneseEra(this.year2);
  }

  get monthLabel() {
    return this.getMonthLabel(this.month);
  }

  get monthLabel2() {
    return this.getMonthLabel(this.month2);
  }

  get maintaindetailschstart() {
    if (this.maintenanceDetails.Schedule_Date__c != "-")
      return this.maintenanceDetails.Schedule_Date__c;
    else return "";
  }

  get maintaindetailschEnd() {
    if (this.maintenanceDetails.Schedule_EndDate__c != "-")
      return this.maintenanceDetails.Schedule_EndDate__c;
    else return "";
  }

  openCalendarSchedule(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showPosterreal = true;
      this.isCalendarOpen = !this.isCalendarOpen;
      this.isCalendarOpen2 = false;
      this.showMyList = true;
      this.showMorelist = false;
      this.searchArrayaccount = [];
      this.showBranchlist = false;
      this.showlistfactoryType = false;
      this.showlistScheduleType = false;
      console.log(
        "before upadte dates of cal :- ",
        this.myday,
        this.myMonth,
        this.myYear
      );
      console.log(
        "before upadte dates of cal2 :- ",
        this.maintenanceDetails?.Schedule_Date__c2
      );
      const temD = this.maintenanceDetails?.Schedule_Date__c2
        ? new Date(this.maintenanceDetails?.Schedule_Date__c2)
        : null;
      // console.log("yes not same!!123", this.selectedDay, this.myday);
      if (!this.myday && temD) this.myday = temD.getDate();
      if (!this.myMonth && temD) this.myMonth = temD.getMonth() + 1;
      if (!this.myYear && temD) this.myYear = temD.getFullYear();
      console.log(
        "yes not same!!123 temD",
        temD,
        this.myday,
        this.myMonth,
        this.myYear
      );
      if (this.selectedDay !== this.myday) {
        console.log("yes not same!!", this.selectedDay, this.myday);
        this.selectedDay = this.myday;
      }
      console.log("yes not same month!!!", this.month, this.myMonth);
      if (this.month !== this.myMonth && this.myMonth !== undefined) {
        this.month = this.myMonth;
      }
      if (this.year !== this.myYear && this.myYear !== undefined) {
        this.year = this.myYear;
      }

      this.populateCalendar();

      if (this.selectedDay) {
        const selectedButton = this.template.querySelector(
          `.day-button[data-day="${this.selectedDay}"]`
        );
        if (selectedButton) {
          selectedButton.classList.add("selected");
        }
      }
    }
  }

  closeCalendar() {
    this.isCalendarOpen = false;
  }

  populateCalendar() {
    const today = new Date();
    const firstDayOfMonth = new Date(this.year, this.month - 1, 1).getDay(); // Day of the week for 1st of the month
    const daysInMonth = new Date(this.year, this.month, 0).getDate(); // Number of days in the month

    // Initialize calendarDates array
    this.calendarDates = [];
    this.isNextMonthDisabled = false; // Reset flag for next month
    this.isPrevMonthDisabled = false; // Reset flag for prev month

    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDates.push({
        value: "",
        className: "day-button empty",
        isEmpty: true,
        isDisabled: true
      });
    }

    if (!this.showPosterreal) {
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(this.year, this.month - 1, i); // JS date function has months indexed from 0-11
        const isDisabled = currentDate > today;

        // Check if this date is the previously selected date
        const isSelected = this.selectedDay && this.selectedDay === i;
        let buttonClass = "day-button filled";

        if (isDisabled) {
          buttonClass += " disabled";
        } else if (isSelected) {
          buttonClass += " selected";
        }

        this.calendarDates.push({
          value: i,
          className: buttonClass,
          isEmpty: false,
          isDisabled
        });
      }
    } else {
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(this.year, this.month - 1, i); // JS date function has months indexed from 0-11
        const isDisabled = currentDate < today;

        // Check if this date is the previously selected date
        const isSelected = this.selectedDay && this.selectedDay === i;
        let buttonClass = "day-button filled";

        if (isDisabled) {
          buttonClass += " disabled";
        } else if (isSelected) {
          buttonClass += " selected";
        }

        this.calendarDates.push({
          value: i,
          className: buttonClass,
          isEmpty: false,
          isDisabled
        });
      }
    }

    const nextMonth = new Date(this.year, this.month);
    const prevMonth = new Date(this.year, this.month - 1);
    this.isNextMonthDisabled = nextMonth > today;
    this.isPrevMonthDisabled = prevMonth < today;
    console.log("isnextmonth", this.isNextMonthDisabled);
    console.log("isPrevMonth", this.isPrevMonthDisabled);
  }

  selectDate(event) {
    const selectedDay = Number(event.target.textContent);

    // Remove 'selected' class from the previously selected day
    if (this.selectedDay) {
      const previouslySelected =
        this.template.querySelector(`.day-button.selected`);
      if (previouslySelected) {
        previouslySelected.classList.remove("selected");
      }
    }

    // Set the selected day if it's not disabled
    if (selectedDay && !event.target.disabled) {
      this.selectedDay = selectedDay;
      const currentButton = event.target;
      currentButton.classList.add("selected"); // Mark this button as selected

      // Update only `selectedDateToSend`, not `selectedDate` yet
    }
    this.confirmDate();
  }

  confirmDate() {
    if (this.selectedDay) {
      // Update the formatted `selectedDate` when confirm is clicked
      this.selectedDate = `${this.year}年${this.month}月${this.selectedDay}日`;
      this.myday = this.selectedDay;
      this.myMonth = this.month;
      this.myYear = this.year;
      // Update the input field with the selected date
      const inputField = this.template.querySelector(".custom-input");
      inputField.value = this.selectedDate;

      const selectedDateToSend = new Date(
        this.year,
        this.month - 1,
        this.selectedDay
      );
      this.selectedDateToSend = this.formatDateToYYYYMMDD(selectedDateToSend);
    }
    this.isCalendarOpen = false;
  }

  // Reset the date
  resetDate() {
    this.selectedDate = null;
    this.selectedDay = null; // Clear the selected day
    const todayD = new Date();
    this.year = todayD.getFullYear();
    this.myYear = todayD.getFullYear();
    this.month = todayD.getMonth() + 1;
    this.myMonth = todayD.getMonth() + 1;
    this.myday = undefined;
    const inputField = this.template.querySelector(".custom-input");
    inputField.value = "";
    this.selectedDateToSend = null;
    this.maintenanceDetails.Schedule_Date__c = null;
    this.maintenanceDetails.Schedule_Date__c2 = null;
    this.maintenanceDetails.Schedule_EndDate__c = null;
    this.maintenanceDetails.Schedule_EndDate__c2 = null;
    console.log("selecrted to send reset", this.selectedDateToSend);

    // Reset the selected state of all buttons
    const selectedButtons = this.template.querySelectorAll(
      ".day-button.selected"
    );
    selectedButtons.forEach((button) => button.classList.remove("selected"));
    this.populateCalendar();
  }

  // Navigate to the previous month
  // Navigate to the previous month
  goToPreviousMonth() {
    if (this.showPosterreal) {
      if (!this.isPrevMonthDisabled) {
        this.month--;

        console.log("no this is what i wnat ", this.month, this.myMonth);
        this.selectedDay = null;

        if (this.month < 1) {
          this.month = 12;
          this.year--;
        }

        if (this.myMonth === this.month && this.myYear === this.year) {
          this.selectedDay = this.myday;
        }

        //this.selectedDate = null;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button.selected"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove("selected")
        );
        this.populateCalendar();
      }
    } else {
      this.month--;

      console.log("no this is what i wnat ", this.month, this.myMonth);
      this.selectedDay = null;

      if (this.month < 1) {
        this.month = 12;
        this.year--;
      }

      if (this.myMonth === this.month && this.myYear === this.year) {
        this.selectedDay = this.myday;
      }

      //this.selectedDate = null;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button.selected"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected"));
      this.populateCalendar();
    }
  }

  // Navigate to the next month
  goToNextMonth() {
    if (!this.isNextMonthDisabled && !this.showPosterreal) {
      this.month++;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button.selected"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected"));
      this.selectedDay = null;
      console.log("yes this is what i wnat 1", this.month, this.myMonth);
      if (this.month > 12) {
        this.month = 1;
        this.year++;
      }
      if (this.myMonth === this.month && this.myYear === this.year) {
        console.log("yes this is what i wnat ", this.month, this.myMonth);
        this.selectedDay = this.myday;
        // this.selectedDate = null;
      }
      // this.selectedDay = null;
      //this.selectedDate = null;
      this.populateCalendar();
    } else if (this.showPosterreal) {
      this.month++;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button.selected"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected"));
      this.selectedDay = null;
      console.log("yes this is what i wnat 1", this.month, this.myMonth);
      if (this.month > 12) {
        this.month = 1;
        this.year++;
      }
      if (this.myMonth === this.month && this.myYear === this.year) {
        console.log("yes this is what i wnat ", this.month, this.myMonth);
        this.selectedDay = this.myday;
        // this.selectedDate = null;
      }
      // this.selectedDay = null;
      //this.selectedDate = null;
      this.populateCalendar();
    }
  }

  openCalendarImplementation(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showPosterreal = false;
      this.isCalendarOpen2 = !this.isCalendarOpen2;
      this.isCalendarOpen = false;
      this.showMyList = true;
      this.showMorelist = false;
      this.searchArrayaccount = [];
      this.showBranchlist = false;
      this.showlistfactoryType = false;
      this.showlistScheduleType = false;
      console.log(
        "before upadte dates of cal :- ",
        this.myday2,
        this.myMonth2,
        this.myYear2
      );
      console.log(
        "before upadte dates of cal2 :- ",
        this.maintenanceDetails?.Implementation_Date__c2
      );

      const temD = this.maintenanceDetails?.Implementation_Date__c2
        ? new Date(this.maintenanceDetails?.Implementation_Date__c2)
        : null;
      // console.log("yes not same!!123", this.selectedDay, this.myday);
      if (!this.myday2 && temD) this.myday2 = temD.getDate();
      if (!this.myMonth2 && temD) this.myMonth2 = temD.getMonth() + 1;
      if (!this.myYear2 && temD) this.myYear2 = temD.getFullYear();
      console.log(
        "yes not same!!123 temD imp",
        temD,
        this.myday2,
        this.myMonth2,
        this.myYear2
      );

      if (temD === null && !this.selectedDay2) {
        let t = new Date();
        this.myMonth2 = t.getMonth() + 1;
        this.myYear2 = t.getFullYear();
      }

      if (this.selectedDay2 !== this.myday2) {
        // console.log("yes not same!!", this.selectedDay, this.myday);
        this.selectedDay2 = this.myday2;
      }
      console.log("yes not same month!!!", this.month2, this.myMonth2);
      if (this.month2 !== this.myMonth2 && this.myMonth2 !== undefined) {
        this.month2 = this.myMonth2;
      }
      if (this.year2 !== this.myYear2 && this.myYear2 !== undefined) {
        this.year2 = this.myYear2;
      }

      this.populateCalendar2();

      if (this.selectedDay2) {
        const selectedButton = this.template.querySelector(
          `.day-button[data-day="${this.selectedDay2}"]`
        );
        if (selectedButton) {
          selectedButton.classList.add("selected");
        }
      }
    }
  }

  closeCalendar2() {
    this.isCalendarOpen2 = false;
  }

  populateCalendar2() {
    const today = new Date();
    const firstDayOfMonth = new Date(this.year2, this.month2 - 1, 1).getDay(); // Day of the week for 1st of the month
    const daysInMonth = new Date(this.year2, this.month2, 0).getDate(); // Number of days in the month

    // Initialize calendarDates array
    this.calendarDates2 = [];
    this.isNextMonthDisabled2 = false; // Reset flag for next month
    this.isPrevMonthDisabled2 = false; // Reset flag for prev month

    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDates2.push({
        value: "",
        className: "day-button empty",
        isEmpty: true,
        isDisabled: true
      });
    }

    if (!this.showPosterreal) {
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(this.year2, this.month2 - 1, i); // JS date function has months indexed from 0-11
        const isDisabled = currentDate > today;

        // Check if this date is the previously selected date
        const isSelected = this.selectedDay2 && this.selectedDay2 == i;
        let buttonClass = "day-button filled";

        if (isDisabled) {
          buttonClass += " disabled";
        } else if (isSelected) {
          buttonClass += " selected";
        }

        this.calendarDates2.push({
          value: i,
          className: buttonClass,
          isEmpty: false,
          isDisabled
        });
      }
    } else {
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(this.year2, this.month2 - 1, i); // JS date function has months indexed from 0-11
        const isDisabled = currentDate < today;

        // Check if this date is the previously selected date
        const isSelected = this.selectedDay2 && this.selectedDay2 == i;
        let buttonClass = "day-button filled";

        if (isDisabled) {
          buttonClass += " disabled";
        } else if (isSelected) {
          buttonClass += " selected";
        }

        this.calendarDates2.push({
          value: i,
          className: buttonClass,
          isEmpty: false,
          isDisabled
        });
      }
    }

    const nextMonth = new Date(this.year2, this.month2);
    const prevMonth = new Date(this.year2, this.month2 - 1);
    this.isNextMonthDisabled2 = nextMonth > today;
    this.isPrevMonthDisabled2 = prevMonth < today;
    console.log("isnextmonth", this.isNextMonthDisabled2);
    console.log("isPrevMonth", this.isPrevMonthDisabled2);
  }

  selectDate2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const selectedDay = event.target.textContent;

      // Remove 'selected' class from the previously selected day
      if (this.selectedDay2) {
        const previouslySelected =
          this.template.querySelector(`.day-button.selected`);
        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
        }
      }

      // Set the selected day if it's not disabled
      if (selectedDay && !event.target.disabled) {
        this.selectedDay2 = selectedDay;
        const currentButton = event.target;
        currentButton.classList.add("selected"); // Mark this button as selected

        // Update only `selectedDateToSend`, not `selectedDate` yet
      }

      this.confirmDate2();
    }
  }

  confirmDate2() {
    if (this.selectedDay2) {
      // Update the formatted `selectedDate` when confirm is clicked
      this.selectedDate2 = `${this.year2}年${this.month2}月${this.selectedDay2}日`;
      this.myday2 = this.selectedDay2;
      this.myMonth2 = this.month2;
      this.myYear2 = this.year2;
      // Update the input field with the selected date
      const inputField = this.template.querySelector(".custom-input");
      inputField.value = this.selectedDate2;

      const selectedDateToSend = new Date(
        this.year2,
        this.month2 - 1,
        this.selectedDay2
      );
      this.selectedDateToSend2 = this.formatDateToYYYYMMDD(selectedDateToSend);
    }
    this.isCalendarOpen2 = false;
  }

  resetDate2() {
    this.selectedDate2 = null;
    this.selectedDay2 = null; // Clear the selected day
    const todayD = new Date();
    this.year2 = todayD.getFullYear();
    this.myYear2 = todayD.getFullYear();
    this.month2 = todayD.getMonth() + 1;
    this.myMonth2 = todayD.getMonth() + 1;
    this.myday2 = undefined;
    const inputField = this.template.querySelector(".custom-input");
    inputField.value = "";
    this.selectedDateToSend2 = null;
    this.maintenanceDetails.Implementation_Date__c = null;
    this.maintenanceDetails.Implementation_Date__c2 = null;

    // Reset the selected state of all buttons
    const selectedButtons = this.template.querySelectorAll(
      ".day-button.selected"
    );
    selectedButtons.forEach((button) => button.classList.remove("selected"));
    this.populateCalendar2();
  }

  goToPreviousMonth2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (this.showPosterreal) {
        if (!this.isPrevMonthDisabled2) {
          this.month2--;

          console.log("no this is what i wnat ", this.month, this.myMonth);
          this.selectedDay2 = null;

          if (this.month2 < 1) {
            this.month2 = 12;
            this.year2--;
          }

          if (this.myMonth2 === this.month2 && this.myYear2 === this.year2) {
            this.selectedDay2 = this.myday2;
          }

          //this.selectedDate = null;
          const selectedButtons = this.template.querySelectorAll(
            ".day-button.selected"
          );
          selectedButtons.forEach((button) =>
            button.classList.remove("selected")
          );
          this.populateCalendar2();
        }
      } else {
        this.month2--;

        console.log("no this is what i wnat ", this.month, this.myMonth);
        this.selectedDay2 = null;

        if (this.month2 < 1) {
          this.month2 = 12;
          this.year2--;
        }

        if (this.myMonth2 === this.month2 && this.myYear2 === this.year2) {
          this.selectedDay2 = this.myday2;
        }

        //this.selectedDate = null;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button.selected"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove("selected")
        );
        this.populateCalendar2();
      }
    }
  }

  goToNextMonth2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (!this.isNextMonthDisabled2 && !this.showPosterreal) {
        this.month2++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button.selected"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove("selected")
        );
        this.selectedDay2 = null;
        console.log("yes this is what i wnat 1", this.month, this.myMonth);
        if (this.month2 > 12) {
          this.month2 = 1;
          this.year2++;
        }
        if (this.myMonth2 === this.month2 && this.myYear2 === this.year2) {
          console.log("yes this is what i wnat ", this.month2, this.myMonth2);
          this.selectedDay2 = this.myday2;
          // this.selectedDate = null;
        }
        // this.selectedDay = null;
        //this.selectedDate = null;
        this.populateCalendar2();
      } else if (this.showPosterreal) {
        this.month2++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button.selected"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove("selected")
        );
        this.selectedDay2 = null;
        console.log("yes this is what i wnat 1", this.month, this.myMonth);
        if (this.month2 > 12) {
          this.month2 = 1;
          this.year2++;
        }
        if (this.myMonth2 === this.month2 && this.myYear2 === this.year2) {
          console.log("yes this is what i wnat ", this.month2, this.myMonth2);
          this.selectedDay2 = this.myday2;
          // this.selectedDate = null;
        }
        // this.selectedDay = null;
        //this.selectedDate = null;
        this.populateCalendar2();
      }
    }
  }

  formatDateToYYYYMMDD(date) {
    if (!date || !(date instanceof Date)) {
      console.error("Invalid date:", date);
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // Function to get the Japanese era based on the year
  getJapaneseEra(year) {
    if (year >= 2019) {
      const eraYear = year - 2018; // Reiwa started in 2019, so 2024 is Reiwa 6
      return `令和${eraYear}年`;
    } else if (year >= 1989) {
      const eraYear = year - 1988; // Heisei started in 1989
      return `平成${eraYear}年`;
    }
    // Add more eras as needed
    return "";
  }

  // Function to get the localized month name
  getMonthLabel(month) {
    const monthLabels = [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月"
    ];
    console.log("month label", monthLabels[month - 1]);
    return monthLabels[month - 1];
  }

  get displayDate() {
    console.log(
      "Inside displayDate to display:",
      this.selectedDate2,
      this.maintenanceDetails.Implementation_Date__c
    );

    if (this.selectedDate2) {
      return this.selectedDate2 === "-" ? "" : this.selectedDate2;
    }

    if (this.maintenanceDetails.Implementation_Date__c) {
      return this.maintenanceDetails.Implementation_Date__c === "-"
        ? ""
        : this.maintenanceDetails.Implementation_Date__c;
    }

    return "";
  }

  get displayDateSchedule() {
    return this.selectedDate || this.maintenanceDetails.Schedule_Date__c;
  }

  handleShowMoreCLick(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      console.log("insdei show more");
      this.searchClassAccount2(this.searchKey);
      console.log("insdei show more2");
      // this.searchAccountError = false;
      // this.showMore=true;
    }
  }

  searchClassAccount2(account) {
    getSearchAccount({ accSearch: account })
      .then((result) => {
        console.log("data from search para", account);
        console.log("data from search", result);
        // this.newArray = result;
        this.showmoreArray = result.map((item) => {
          const shippingAdd = item.ShippingAddress || {};
          return {
            id: item.Id,
            name: item.Name,
            shippingAdd: {
              PostalCode: shippingAdd.postalCode || "",
              prefect: shippingAdd.state || "",
              municipality: shippingAdd.city || "",
              street: shippingAdd.street || ""
            }
          };
        });
        console.log("showmore arrayyyyy", JSON.stringify(this.showmoreArray));
        console.log("searchaccounts search length", result.slice(0, 99));
        this.errorSearch = undefined;
        console.log("inside class");

        this.searchAccountError = false;
        this.showMore = true;
        console.log("inside show more true");
      })
      .catch((error) => {
        this.errorSearch = error.body.message;
        this.readonlyaccount = false;
        this.searchaccounts = undefined;
        console.error("searchClassAccount", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "searchClassAccount2"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  handlesearchAccount2(event) {
    event.stopPropagation();
    this.divforAccountAddress = false;

    this.searchKey = event.target.value;
    if (this.searchKey.length >= 1) {
      this.searchClassAccount2(this.searchKey);
    } else {
      this.showmoreArray = [];
    }
  }

  get showmorelength() {
    return this.showmoreArray.length > 0;
  }

  updateMaintenanceData() {
    this.updatedMaintenance.maintenanceId = this.MaintenanceId;
    console.log("Maintenance ID:", this.MaintenanceId);
    console.log("Rich text value:", this.richTextVal);
    console.log("Is edit top info:", this.iseditTopInfo);
    console.log("Is edit bottom info:", this.isEditBottomInfo);
    console.log(
      "Selected picklist schedule type:",
      this.selectedPicklistScheduleType
    );
    console.log(
      "Current service type:",
      this.maintenanceDetails.Service_Type__c
    );
    console.log(
      "Selected picklist factory type:",
      this.selectedPicklistfactoryType
    );
    console.log(
      "Current service factory:",
      this.maintenanceDetails.Service_Factory__c
    );
    console.log("Destination no search:", this.destinationNosearch);
    console.log(
      "Current receiving destination no search:",
      this.maintenanceDetails.Recieving_Destination_noSearch__c
    );
    console.log("Selected start date:", this.selectedDateToSendStart);
    console.log("Stored schedule start date:", this.storedScheduleDate);
    console.log("Selected end date:", this.selectedDateToSendEnd);
    console.log("Stored schedule end date:", this.storedScheduleEndDate);
    console.log("Selected implementation date:", this.selectedDateToSend2);
    console.log("Stored implementation date:", this.storedImplementationDate);
    console.log(
      "Selected picklist factory type:",
      this.selectedPicklistfactoryType
    );
    console.log(
      "Destination account branch to send:",
      this.destinationAccountBranchtosend
    );
    console.log("Branch object ID:", this.branchObj?.Id);
    console.log("Account object ID:", this.accountObj?.Id);
    console.log(
      "Maintenance Details Rich Text:",
      this.maintenanceDetails.Description_Rich_Text__c
    );

    if (this.iseditTopInfo === true) {
      if (this.isEditBottomInfo === false) {
        this.updatedMaintenance.serviceType = this.selectedPicklistScheduleType;

        this.updatedMaintenance.serviceFactory =
          this.selectedPicklistfactoryType;

        this.updatedMaintenance.recievingDestinationNoSearch =
          this.destinationNosearch;
        // }

        if (this.selectedDateToSendStart !== null) {
          this.updatedMaintenance.scheduleDate = this.selectedDateToSendStart;
        }
        if (this.selectedDateToSendEnd !== null) {
          this.updatedMaintenance.scheduleEndDate = this.selectedDateToSendEnd;
        }
        if (this.selectedDateToSend2 !== null) {
          this.updatedMaintenance.implementationDate = this.selectedDateToSend2;
        }
        if (this.selectedPicklistfactoryType === "自社") {
          this.updatedMaintenance.recievingDestinationAccount = null;
          if (this.destinationAccountBranchtosend !== this.branchObj.Id) {
            this.updatedMaintenance.recievingDestinationBranch =
              this.destinationAccountBranchtosend;
          }
        } else if (this.selectedPicklistfactoryType === "ふそう/自社 以外") {
          this.updatedMaintenance.recievingDestinationBranch = null;
          if (this.destinationAccountBranchtosend !== this.accountObj.Id) {
            this.updatedMaintenance.recievingDestinationAccount =
              this.destinationAccountBranchtosend;
          }
        }
      }
    }

    if (this.isEditBottomInfo === true) {
      if (this.iseditTopInfo === false) {
        if (
          this.richTextVal !== this.maintenanceDetails.Description_Rich_Text__c
        ) {
          this.updatedMaintenance.richText = this.richTextVal;
        }
      }
    }

    console.log(
      "maintenance updatedd",
      JSON.stringify(this.updatedMaintenance)
    );

    this.finalUpdateMaintenance();
  }

  // handlesaveedittop() {
  //   if (this.destinationAccBranch) {
  //     if (this.destinationNosearch) {
  //       this.multipleDest = true;
  //       console.log("inside no search");
  //     } else {
  //       console.log("update in handle save");
  //       this.maintenanceDetails.Schedule_Date__c = this.formatDate5(this.startDate5);
  //       this.maintenanceDetails.Schedule_EndDate__c = this.formatDate5(this.endDate5);
  //       this.maintenanceDetails.Implementation_Date__c = this.formatJapaneseYear(this.selectedDateToSend2);
  //       this.updateMaintenanceData();
  //       console.log("upd main done");
  //       this.iseditTopInfo = false;
  //       console.log("upd main falseeee");

  //       refreshApex(this.wiredVehicleResultDetail);
  //       console.log("refresshh done main falseeee");

  //       // this.template
  //       //   .querySelector(".listScheduleTypeRec")
  //       //   .classList.remove("error-input");
  //       // this.template
  //       //   .querySelector(".InputsScheduleTypeSearch")
  //       //   .classList.remove("error-input");
  //     }
  //   } else {
  //     if (
  //       (this.searchAccountError &&
  //         this.searchKey &&
  //         !this.destinationAccBranch) ||
  //       (!this.searchAccountError &&
  //         this.searchKey &&
  //         !this.destinationAccBranch)
  //     ) {
  //       console.log("in if.........");
  //       window.scrollTo(0, 0);
  //     } else {

  //       console.log("Date Before Last Updating: ", this.maintenanceDetails.Schedule_Date__c, this.maintenanceDetails.Schedule_EndDate__c);
  //       this.maintenanceDetails.Schedule_Date__c = this.formatDate5(this.startDate5);
  //       this.maintenanceDetails.Schedule_EndDate__c = this.formatDate5(this.endDate5);
  //       this.maintenanceDetails.Implementation_Date__c = this.formatJapaneseDate(this.selectedDateToSend2);
  //       console.log("Date After Last Updating: ", this.maintenanceDetails.Schedule_Date__c, this.maintenanceDetails.Schedule_EndDate__c);
  //       this.updateMaintenanceData();

  //       // this.isStep1 = false;
  //       //   this.isStep2 = true;
  //       //   this.isStep3 = false;
  //       //   this.isStep4 = false;
  //       this.iseditTopInfo = false;
  //       console.log("refresshh startttt");

  //       refreshApex(this.wiredVehicleResultDetail);
  //       console.log("refresshh done main falseeee");

  //       this.maintenanceDetails.Implementation_Date__c = this.maintenanceDetails.Implementation_Date__c ? this.maintenanceDetails.Implementation_Date__c : "-";
  //       console.log("Implementation Date at Last: ", this.maintenanceDetails.Implementation_Date__c);
  //       window.scrollTo(0, 0);
  //       // }
  //     }
  //   }
  // }

  formatJapaneseYear(isoDate) {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    let reiwaYear;
    if (!isoDate || isoDate == "") {
      return "-";
    }
    if (year === 2019) {
      return `平成31年 / 令和1年`;
    } else if (year > 2019) {
      reiwaYear = year - 2018;
      return `令和${reiwaYear}年`;
    } else {
      reiwaYear = 30 - (2018 - year);
      return `平成${reiwaYear}年`;
    }
  }

  handlesaveedittop(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      try {
        if (this.destinationAccBranch) {
          if (this.destinationNosearch) {
            this.multipleDest = true;
          } else {
            try {
              console.log(
                "Destination Related Consoles: ",
                "this.destinationNoSearch: ",
                this.destinationNoSearch,
                "this.destinationAccBranch: ",
                this.destinationAccBranch,
                "this.destinationAccBranchToShow: ",
                this.destinationAccBranchToShow,
                "this.destinationBranchToshow: ",
                this.destinationBranchToshow
              );
              // if (this.selectedPicklistScheduleType) {
              //     this.maintenanceDetails.Service_Type__c = this.selectedPicklistScheduleType;
              // } else {
              //     this.maintenanceDetails.Service_Type__c = "-";
              // }

              if (this.startDate5) {
                this.maintenanceDetails.Schedule_Date__c = this.formatDate5(
                  this.startDate5
                );
              } else {
                this.maintenanceDetails.Schedule_Date__c = "-";
              }

              if (this.endDate5) {
                this.maintenanceDetails.Schedule_EndDate__c = this.formatDate5(
                  this.endDate5
                );
              } else {
                this.maintenanceDetails.Schedule_EndDate__c = "-";
              }

              if (this.selectedDateToSend2) {
                this.maintenanceDetails.Implementation_Date__c =
                  this.formatJapaneseDate(this.selectedDateToSend2);
              }

              // if (this.selectedPicklistfactoryType) {
              //     this.maintenanceDetails.Service_Factory__c = this.selectedPicklistfactoryType;
              // } else {
              //     this.maintenanceDetails.Service_Factory__c = "-";
              // }

              // if (this.destinationNosearch) {
              //     this.maintenanceDetails.Recieving_Destination_noSearch__c = this.destinationNosearch;
              // } else {
              //     this.maintenanceDetails.Recieving_Destination_noSearch__c = "-";
              // }

              // if (this.destinationAccBranch) {
              //     this.maintenanceDetails.Recieving_Destination__c = this.substringToProperLength(this.destinationAccBranch, 28);
              //     this.maintenanceDetails.Recieving_Destination__c_full = this.destinationAccBranch;
              //     this.destinationBranchToShow = this.substringToProperLength(this.destinationAccBranch, 28);
              // } else {
              //     this.maintenanceDetails.Recieving_Destination__c = "-";
              //     this.maintenanceDetails.Recieving_Destination__c_full = "-";
              //     this.destinationBranchToShow = "-";
              // }

              this.updateMaintenanceData();
              this.iseditTopInfo = false;
              refreshApex(this.wiredVehicleResultDetail);
              setTimeout(() => {
                refreshApex(this.wiredVehicleResultDetail);
              }, 1500);
            } catch (error) {
              console.error("Error in updating maintenance details:", error);
              let err = JSON.stringify(error);
              ErrorLog({
                lwcName: "ccp2_MaintainHistory",
                errorLog: err,
                methodName: "handlesaveedittop"
              })
                .then(() => {
                  console.log("Error logged successfully in Salesforce");
                })
                .catch((loggingErr) => {
                  console.error(
                    "Failed to log error in Salesforce:",
                    loggingErr
                  );
                });
            }
          }
        } else {
          if (
            (this.searchAccountError &&
              this.searchKey &&
              !this.destinationAccBranch) ||
            (!this.searchAccountError &&
              this.searchKey &&
              !this.destinationAccBranch)
          ) {
            console.log("in if.........");
            window.scrollTo(0, 0);
          } else {
            try {
              // if (this.selectedPicklistScheduleType) {
              //     this.maintenanceDetails.Service_Type__c = this.selectedPicklistScheduleType;
              // } else {
              //     this.maintenanceDetails.Service_Type__c = "-";
              // }

              if (this.startDate5) {
                this.maintenanceDetails.Schedule_Date__c = this.formatDate5(
                  this.startDate5
                );
              } else {
                this.maintenanceDetails.Schedule_Date__c = "-";
              }

              if (this.endDate5) {
                this.maintenanceDetails.Schedule_EndDate__c = this.formatDate5(
                  this.endDate5
                );
              } else {
                this.maintenanceDetails.Schedule_EndDate__c = "-";
              }

              if (this.selectedDateToSend2) {
                this.maintenanceDetails.Implementation_Date__c =
                  this.formatJapaneseDate(this.selectedDateToSend2);
              }

              // if (this.selectedPicklistfactoryType) {
              //     this.maintenanceDetails.Service_Factory__c = this.selectedPicklistfactoryType;
              // } else {
              //     this.maintenanceDetails.Service_Factory__c = "-";
              // }

              // if (this.destinationNosearch) {
              //     this.maintenanceDetails.Recieving_Destination_noSearch__c = this.destinationNosearch;
              // } else {
              //     this.maintenanceDetails.Recieving_Destination_noSearch__c = "-";
              // }

              // if (this.destinationAccBranch) {
              //     this.maintenanceDetails.Recieving_Destination__c = this.substringToProperLength(this.destinationAccBranch, 28);
              //     this.maintenanceDetails.Recieving_Destination__c_full = this.destinationAccBranch;
              //     this.destinationBranchToShow = this.substringToProperLength(this.destinationAccBranch, 28);
              // } else {
              //     this.maintenanceDetails.Recieving_Destination__c = "-";
              //     this.maintenanceDetails.Recieving_Destination__c_full = "-";
              //     this.destinationBranchToShow = "-";
              // }

              this.updateMaintenanceData();

              this.iseditTopInfo = false;
              refreshApex(this.wiredVehicleResultDetail);
              setTimeout(() => {
                refreshApex(this.wiredVehicleResultDetail);
              }, 1500);
              console.log("refresshh startttt");

              console.log("refresshh done main falseeee");

              this.maintenanceDetails.Implementation_Date__c = this
                .maintenanceDetails.Implementation_Date__c
                ? this.maintenanceDetails.Implementation_Date__c
                : "-";
              console.log(
                "Implementation Date at Last: ",
                this.maintenanceDetails.Implementation_Date__c
              );
              window.scrollTo(0, 0);
            } catch (error) {
              console.error(
                "Error in processing dates or refreshing apex:",
                error
              );
              let err = JSON.stringify(error);
              ErrorLog({
                lwcName: "ccp2_MaintainHistory",
                errorLog: err,
                methodName: "handlesaveedittop"
              })
                .then(() => {
                  console.log("Error logged successfully in Salesforce");
                })
                .catch((loggingErr) => {
                  console.error(
                    "Failed to log error in Salesforce:",
                    loggingErr
                  );
                });
            }
          }
        }

        console.log(
          "Final Values are: ",
          JSON.stringify(this.maintenanceDetails)
        );
      } catch (error) {
        console.error("Error in handlesaveedittop function:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "handlesaveedittop"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      }
    }
  }

  finalUpdateMaintenance() {
    const JSONstring = JSON.stringify(this.updatedMaintenance);
    const ImagesJson = JSON.stringify(this.imagesCreatedId);
    console.log("imagess json", ImagesJson);
    console.log("main iddss", this.MaintenanceId);

    updateMaintenance({
      jsonInput: JSONstring
    })
      .then((result) => {
        console.log("result sa", result);
        this.updatedMaintenance = {};
        const todayD = new Date();
        this.selectedDate = null;
        this.selectedDay = null;
        this.year = todayD.getFullYear();
        this.myYear = undefined;
        this.month = todayD.getMonth() + 1;
        this.myMonth = undefined;
        this.myday = undefined;
        this.selectedDateToSend = null;
        console.log("emptied sch date");
        this.selectedDate2 = null;
        this.selectedDay2 = null;
        this.month2 = todayD.getMonth() + 1;
        this.year2 = todayD.getFullYear();

        if (this.MaintenanceType === "Scheduled") {
          console.log("changing for schedule");
          this.myYear2 = undefined;
          this.myMonth2 = undefined;
        } else {
          console.log("changing for implementatiin");
          this.myYear2 = undefined;
          this.myMonth2 = undefined;
        }
        // this.myYear2 = todayD.getFullYear();
        // this.myMonth2 = todayD.getMonth() + 1;

        this.myday2 = undefined;
        this.selectedDateToSend2 = null;
        console.log("emptied imp date");

        console.log("refresh dattta imp date");
        // if(this.iseditTopInfo === true){
        // refreshApex(this.wiredVehicleResultDetail);
        // }

        // window.scrollTo(0, 0);
      })
      .catch((error) => {
        console.log("error", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "finalupdateMaintenance"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });

    console.log(
      "callling up main",
      this.imagesCreatedId,
      ImagesJson,
      this.MaintenanceId
    );

    if (this.imagesCreatedId !== undefined) {
      if (this.imagesCreatedId.length !== 0) {
        updateMaintenanceImage({
          contentVersionIdsJson: ImagesJson,
          maintenanceId: this.MaintenanceId
        })
          .then((result) => {
            console.log("result imagesssssss", result);
            refreshApex(this.wiredVehicleResultDetail);
            // this.isEditBottomInfo = false;

            // window.scrollTo(0, 0);
          })
          .catch((error) => {
            console.log("error bottom", error);
            let err = JSON.stringify(error);
            ErrorLog({
              lwcName: "ccp2_MaintainHistory",
              errorLog: err,
              methodName: "finalupdatemaintenance"
            })
              .then(() => {
                console.log("Error logged successfully in Salesforce");
              })
              .catch((loggingErr) => {
                console.error("Failed to log error in Salesforce:", loggingErr);
              });
          });
      }
    }

    console.log("callling up images");

    this.imagesCreatedId = [];
    console.log("emptied up images");

    console.log("calling refreshh");
  }

  handleOk(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.multipleDest = false;
      const searchInput = this.template.querySelector(".InputsScheduleSearch");
      const recInput = this.template.querySelector(".InputsScheduleNosearch");
      const factInput = this.template.querySelector(".InputsSchedulebranch");
      const divforclass = this.template.querySelector(".selected-account");

      if (searchInput) {
        searchInput.classList.add("errorinput");
      } else {
        console.error("InputsScheduleTypeSearch not found.");
      }

      if (divforclass) {
        divforclass.classList.add("errorinput");
      } else {
        console.error("InputsScheduleTypeSearch not found.");
      }

      if (recInput) {
        recInput.classList.add("errorinput");
      } else {
        console.error("listScheduleTypeRec not found.");
      }

      if (factInput) {
        factInput.classList.add("errorinput");
      } else {
        console.error("listScheduleTypeFact not found.");
      }
    }
  }

  cancelPlan(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      console.log("inside cancel plan");
      this.cancelplanModal = true;
      console.log("inside cancel deleted");
    }
  }

  deletehistory(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      console.log("inside history delete");
      // this.deleteMaintenance();
      this.deleteHistoryModal = true;
      console.log("inside history deleted");
    }
  }

  deleteMaintenance() {
    const newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=maintenancelist`;
    window.history.replaceState({}, document.title, newUrl);
    deleteMaintenance({
      maintenanceId: this.MaintenanceId
    })
      .then((result) => {
        refreshApex(this.wiredVehicleResult);
        console.log("result delete", result);
      })
      .catch((error) => {
        console.log("error delete", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "deleteMaintenance"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  handledeleteplanNo(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.cancelplanModal = false;
    }
  }

  handledeleteplanYes(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.deleteMaintenance();
      this.cancelplanModal = false;
      this.showDetailPage = false;
      this.currentPage = 1;
      this.showListPage = true;
      this.showModalAndRefresh();
    }
  }

  showModalAndRefresh() {
    this.showModalRefreshDelete = true;
  }

  handledeleteHistoryNo(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.deleteHistoryModal = false;
    }
  }

  handledeleteHistoryYes(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.deleteMaintenance();
      this.deleteHistoryModal = false;
      this.showDetailPage = false;
      this.currentPage = 1;
      this.showListPage = true;
      this.showModalAndRefreshHistory();
    }
  }

  showModalAndRefreshHistory() {
    this.showModalRefreshDelete = true;
  }

  handlefinalclose(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.showModalRefreshDelete = false;
    }
  }

  get isDisabledPlan() {
    return (
      !this.selectedPicklistScheduleType ||
      !this.selectedPicklistfactoryType ||
      (!this.selectedDate && !this.maintenanceDetails.Schedule_Date__c) ||
      (!this.startDate5 && !this.endDate5) ||
      (this.startDate5 && !this.endDate5)
    );
  }
  get isDisabledHistory() {
    return (
      !this.selectedPicklistScheduleType ||
      !this.selectedPicklistfactoryType ||
      (!this.selectedDate2 && !this.maintenanceDetails.Implementation_Date__c)
    );
  }

  handlesearchCancel(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.showMore = false;
    }
  }

  get isImageLoad() {
    return !this.isloadingImages;
  }

  get mainImages() {
    return this.maintenanceDetails.ImageUrls.length;
  }

  //New Js Code:

  @track selectedDate5 = "";
  @track isCalendarOpen5 = false;
  @track isNextMonthDisabled5 = false;
  @track isPrevMonthDisabled5 = false;
  @track selectedDay5;
  @track myday5;
  @track myMonth5;
  @track myYear5;
  @track selectedDateRange5 = "";
  @track calendarDates5 = [];
  @track startDate5 = null;
  @track endDate5 = null;
  @track month5 = new Date().getMonth() + 1;
  @track year5 = new Date().getFullYear();
  @track startMonth5;
  @track startYear5;
  @track endMonth5;
  @track endYear5;

  @track isFirstTime = false;
  openCalendar5(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showPosterreal = true;
      this.isCalendarOpen = !this.isCalendarOpen;
      this.isCalendarOpen2 = false;
      this.showMyList = true;
      this.showMorelist = false;
      this.searchArrayaccount = [];
      this.showBranchlist = false;
      this.showlistfactoryType = false;
      this.showlistScheduleType = false;
      // Update month5 and year5 to reflect selected or current state
      if (this.month5 !== this.myMonth5 && this.myMonth5 !== undefined) {
        this.month5 = this.myMonth5;
      }
      if (this.year5 !== this.myYear5 && this.myYear5 !== undefined) {
        this.year5 = this.myYear5;
      }
      if (this.startDate5) {
        this.month5 = this.startDate5.month;
        this.year5 = this.startDate5.year;
      }

      this.isCalendarOpen5 = !this.isCalendarOpen5;
      console.log(
        "Start date: ",
        JSON.stringify(this.startDate5),
        "End Date: ",
        JSON.stringify(this.endDate5)
      );
      // Disable the "Previous" button for the current month/year
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      if (this.month5 == currentMonth && this.year5 == currentYear) {
        this.prevButtonDisabled = true;
      } else {
        this.prevButtonDisabled = false;
      }
      if (this.isCalendarOpen5) {
        this.goToNextMonth5();
        this.goToPreviousMonth5();
        // if (this.isFirstTime)

        this.populateCalendar5();
        this.highlightRange5();
      }
    }
  }

  handleInsideClick5(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
    }
  }
  isDateAfter5(date1, date2) {
    const d1 = new Date(date1.year, date1.month - 1, date1.day);
    const d2 = new Date(date2.year, date2.month - 1, date2.day);
    return d1 > d2;
  }

  @track selectedDateToSendStart;
  @track selectedDateToSendEnd;

  selectDate5(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const selectedDay5 = parseInt(event.target.textContent, 10);
      if (!this.startDate5) {
        this.endDate5 = null;
        this.startDate5 = {
          day: selectedDay5,
          month: this.month5,
          year: this.year5
        };
        this.startMonth5 = this.month5;
        this.startYear5 = this.year5;
      } else if (!this.endDate5) {
        this.endDate5 = {
          day: selectedDay5,
          month: this.month5,
          year: this.year5
        };
        this.endMonth5 = this.month5;
        this.endYear5 = this.year5;
        if (this.isDateAfter5(this.startDate5, this.endDate5)) {
          [this.startDate5, this.endDate5] = [this.endDate5, this.startDate5];
          [this.startMonth5, this.endMonth5] = [
            this.endMonth5,
            this.startMonth5
          ];
          [this.startYear5, this.endYear5] = [this.endYear5, this.startYear5];
        }

        if (this.startDate5) {
          this.selectedDateToSendStart = new Date(
            this.startDate5.year,
            this.startDate5.month - 1,
            this.startDate5.day
          );
          this.selectedDateToSendStart = this.formatDateToYYYYMMDD(
            this.selectedDateToSendStart
          );
        }

        if (this.endDate5) {
          this.selectedDateToSendEnd = new Date(
            this.endDate5.year,
            this.endDate5.month - 1,
            this.endDate5.day
          );
          this.selectedDateToSendEnd = this.formatDateToYYYYMMDD(
            this.selectedDateToSendEnd
          );
        }
        this.selectedDateRange5 = `${this.formatDate5(this.startDate5)} - ${this.formatDate5(this.endDate5)}`;
        this.isCalendarOpen5 = false;
      } else {
        this.startDate5 = {
          day: selectedDay5,
          month: this.month5,
          year: this.year5
        };
        this.startMonth5 = this.month5;
        this.startYear5 = this.year5;
        this.endDate5 = null;
        this.selectedDateRange5 = "";
      }
      this.myMonth5 = this.month5;
      this.myYear5 = this.year5;
      this.myday5 = this.selectedDay5;
      this.highlightRange5();
    }
  }

  @track wireCalled5 = false;

  parseDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return { year, month, day };
  }

  @track prevButtonDisabled = false;
  goToPreviousMonth5(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const today = new Date(); // Current date for comparison
      const currentMonth = today.getMonth() + 1; // Months are 0-indexed in JS
      const currentYear = today.getFullYear();
      console.log(
        "Comparison Values: ",
        `${this.year5} ${currentYear}`,
        `${this.month5} ${currentMonth}`
      );
      if (this.showPosterreal) {
        if (
          this.year5 > currentYear ||
          (this.year5 == currentYear && this.month5 > currentMonth)
        ) {
          this.month5--;
          this.selectedDay5 = null;

          if (this.month5 < 1) {
            this.month5 = 12;
            this.year5--;
          }
          if (this.month5 == currentMonth && this.year5 == currentYear) {
            this.prevButtonDisabled = true;
          }

          if (this.myMonth5 === this.month5 && this.myYear5 === this.year5) {
            this.selectedDay5 = this.myday5;
          }
          const selectedButtons = this.template.querySelectorAll(
            ".day-button5.selected5"
          );
          selectedButtons.forEach((button) =>
            button.classList.remove(
              "selected5",
              "in-range5",
              "startborder5",
              "endborder5",
              "in-range5-dis"
            )
          );
          this.populateCalendar5();
        } else {
          this.prevButtonDisabled = true;
        }
      } else {
        this.month5--;
        this.selectedDay5 = null;
        if (this.month5 < 1) {
          this.month5 = 12;
          this.year5--;
        }
        if (this.myMonth5 === this.month5 && this.myYear5 === this.year5) {
          this.selectedDay5 = this.myday5;
        }
        const selectedButtons = this.template.querySelectorAll(
          ".day-button5.selected5"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove(
            "selected5",
            "startborder5",
            "endborder5",
            "in-range5",
            "in-range5-dis"
          )
        );
        this.populateCalendar5();
      }
    }
  }

  goToNextMonth5(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.prevButtonDisabled = false;
      if (!this.isNextMonthDisabled5 && !this.showPosterreal) {
        this.month5++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button5.selected5"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove(
            "selected5",
            "in-range5",
            "startborder5",
            "endborder5",
            "in-range5-dis"
          )
        );
        this.selectedDay5 = null;
        if (this.month5 > 12) {
          this.month5 = 1;
          this.year5++;
        }
        if (this.myMonth5 === this.month5 && this.myYear5 === this.year5) {
          this.selectedDay5 = this.myday5;
        }
        this.populateCalendar5();
      } else if (this.showPosterreal) {
        this.month5++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button5.selected5"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove(
            "selected5",
            "in-range5",
            "startborder5",
            "endborder5",
            "in-range5-dis"
          )
        );
        this.selectedDay5 = null;
        if (this.month5 > 12) {
          this.month5 = 1;
          this.year5++;
        }
        if (this.myMonth5 === this.month5 && this.myYear5 === this.year5) {
          this.selectedDay5 = this.myday5;
        }
        this.populateCalendar5();
      }
    }
  }
  @track justCount = 0;
  populateCalendar5() {
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth() + 1;
    const todayYear = today.getFullYear();

    // Calculate the first day of the month and the total days in the current month
    const firstDayOfMonth = new Date(this.year5, this.month5 - 1, 1).getDay();
    const daysInMonth = new Date(this.year5, this.month5, 0).getDate();

    console.log(
      "Just Count",
      this.justCount++,
      this.month5,
      this.year5,
      firstDayOfMonth,
      daysInMonth,
      todayDate
    );

    this.calendarDates5 = [];
    let cnt = 0;

    // Calculate the total days in the previous month
    const prevMonthDays = new Date(
      this.month5 === 1 ? this.year5 - 1 : this.year5,
      this.month5 - 1 <= 0 ? 12 : this.month5 - 1,
      0
    ).getDate();

    // Fill empty slots at the beginning for alignment
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDates5.push({
        value: prevMonthDays - firstDayOfMonth + i + 1,
        className: "day-button5 disabled5",
        isEmpty: false,
        isDisabled: true,
        month: this.month5 === 1 ? 12 : this.month5 - 1,
        year: this.month5 === 1 ? this.year5 - 1 : this.year5,
        valuekey: cnt++,
        notcurr: true // Mark as not current month
      });
    }

    // Fill days for the selected month
    for (let i = 1; i <= daysInMonth; i++) {
      const isPastDate =
        this.year5 < todayYear ||
        (this.year5 === todayYear && this.month5 < todayMonth) ||
        (this.year5 === todayYear &&
          this.month5 === todayMonth &&
          i < todayDate);

      this.calendarDates5.push({
        value: i,
        className: isPastDate ? "day-button5 disabled5" : "day-button5",
        isEmpty: false,
        isDisabled: isPastDate,
        month: this.month5,
        year: this.year5,
        valuekey: cnt++,
        notcurr: false // Mark as current month
      });
    }

    // Fill empty slots at the end for alignment
    const remainingDays = (firstDayOfMonth + daysInMonth) % 7;
    for (let i = 1; i <= (remainingDays ? 7 - remainingDays : 0); i++) {
      this.calendarDates5.push({
        value: i,
        className: "day-button5 disabled5",
        isEmpty: false,
        isDisabled: true,
        month: this.month5 === 12 ? 1 : this.month5 + 1,
        year: this.month5 === 12 ? this.year5 + 1 : this.year5,
        valuekey: cnt++,
        notcurr: true // Mark as not current month
      });
    }

    // Highlight the range after populating the calendar
    this.highlightRange5();
  }

  highlightRange5() {
    console.log(
      "Highlight Ranges:",
      JSON.stringify(this.startDate5),
      JSON.stringify(this.endDate5)
    );

    const allDays = this.template.querySelectorAll(".day-button5");
    allDays.forEach((day) =>
      day.classList.remove(
        "selected5",
        "in-range5",
        "startborder5",
        "endborder5",
        "singleborder5",
        "in-range5-dis"
      )
    );

    if (this.startDate5 && this.startDate5.month == this.month5) {
      const startDay = this.template.querySelector(
        `[data-day="${Number(this.startDate5.day)}"][data-month="${Number(this.startDate5.month)}"][data-year="${Number(this.startDate5.year)}"]`
      );
      console.log("Start Date Query Selector: ", startDay);
      if (startDay) startDay.classList.add("selected5", "startborder5");
    }

    if (this.endDate5 && this.endDate5.month == this.month5) {
      const endDay = this.template.querySelector(
        `[data-day="${Number(this.endDate5.day)}"][data-month="${Number(this.endDate5.month)}"][data-year="${Number(this.endDate5.year)}"]`
      );
      if (endDay) endDay.classList.add("selected5", "endborder5");
    }

    if (this.startDate5 && this.endDate5) {
      this.calendarDates5.forEach((day) => {
        if (
          !day.isDisabled &&
          day.notcurr === false &&
          this.isWithinRange5(
            { day: day.value, month: day.month, year: day.year },
            this.startDate5,
            this.endDate5
          )
        ) {
          const dayElement = this.template.querySelector(
            `[data-day="${day.value}"][data-month="${day.month}"][data-year="${day.year}"]`
          );
          if (dayElement) dayElement.classList.add("in-range5");
        }
      });
    }

    if (this.startDate5 && this.endDate5) {
      this.calendarDates5.forEach((day) => {
        if (
          day.isDisabled &&
          day.notcurr === false &&
          this.isWithinRange5(
            { day: day.value, month: day.month, year: day.year },
            this.startDate5,
            this.endDate5
          )
        ) {
          const dayElement = this.template.querySelector(
            `[data-day="${day.value}"][data-month="${day.month}"][data-year="${day.year}"]`
          );
          if (dayElement) dayElement.classList.add("in-range5-dis");
        }
      });
    }
    // if (this.startDate5 && this.endDate5) {
    //   this.calendarDates5.forEach(day => {
    //     if (
    //       !day.isDisabled &&
    //       day.notcurr === false &&
    //       this.isWithinRange5(
    //         { day: day.value, month: day.month, year: day.year },
    //         this.startDate5,
    //         this.endDate5
    //       )
    //     ) {
    //       const dayElement = this.template.querySelector(
    //         `[data-day="${day.value}"][data-month="${day.month}"][data-year="${day.year}"]`
    //       );
    //       if (dayElement) dayElement.classList.add('in-range5');
    //     }
    //   });
    // }

    if (
      this.startDate5 &&
      JSON.stringify(this.startDate5) === JSON.stringify(this.endDate5)
    ) {
      const singleDay = this.template.querySelector(
        `[data-day="${this.startDate5.day}"][data-month="${this.startDate5.month}"][data-year="${this.startDate5.year}"]`
      );
      if (singleDay) {
        singleDay.classList.remove("startborder5", "endborder5");
        singleDay.classList.add("singleborder5");
      }
    }
  }

  formatJapaneseYear5(isoDate) {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    let reiwaYear;

    if (year === 2019) {
      return `平成31年 / 令和1年`;
    } else if (year > 2019) {
      reiwaYear = year - 2018;
      return `令和${reiwaYear}年`;
    } else {
      reiwaYear = 30 - (2018 - year);
      return `平成${reiwaYear}年`;
    }
  }

  convertToReiwaYear5(gregorianYear, month = 1, day = 1) {
    if (
      gregorianYear < 2019 ||
      (gregorianYear === 2019 && (month < 5 || (month === 5 && day < 1)))
    ) {
      return "無効な令和年";
    }
    const reiwaYear = gregorianYear - 2018;
    return reiwaYear === 1 ? `令和1年` : `令和${reiwaYear}年`;
  }

  get reiwaYear5() {
    return this.convertToReiwaYear5(this.year5, this.month5);
  }

  isWithinRange5(currentDate, startDate, endDate) {
    const current = new Date(
      currentDate.year,
      currentDate.month - 1,
      currentDate.day
    );
    const start = new Date(startDate.year, startDate.month - 1, startDate.day);
    const end = new Date(endDate.year, endDate.month - 1, endDate.day);
    return current >= start && current <= end;
  }

  formatDate5(date) {
    return `${date.year}年${String(date.month).padStart(2, "0")}月${String(date.day).padStart(2, "0")}日`;
  }

  nextyear5(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.isPrevDisabled2 = false;
      if (!this.isNextYearDisabled5 && !this.showPosterreal) {
        this.year5++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button5.selected5"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove(
            "selected5",
            "in-range5",
            "startborder5",
            "endborder5",
            "singleborder5",
            "in-range5-dis"
          )
        );
        this.selectedDay5 = null;
        if (this.myYear5 === this.year5) {
          this.selectedDay5 = this.myday5;
          this.month5 = this.myMonth5;
        }
        this.populateCalendar5();
      } else if (this.showPosterreal) {
        this.year5++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button5.selected5"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove(
            "selected5",
            "in-range5",
            "startborder5",
            "endborder5",
            "singleborder5",
            "in-range5-dis"
          )
        );
        this.selectedDay5 = null;
        if (this.myYear5 === this.year5) {
          this.selectedDay5 = this.myday5;
          this.month5 = this.myMonth5;
        }
        this.populateCalendar5();
      }
    }
  }

  getMonthLabel5(month) {
    const monthLabels = [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月"
    ];
    return monthLabels[month - 1];
  }

  get monthLabel5() {
    return this.getMonthLabel5(this.month5);
  }

  resetDate5(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.selectedDate5 = null;
      this.startDate5 = null;
      this.endDate5 = null;
      this.selectedDateRange5 = "";
      this.selectedDay5 = null;
      this.startMonth5 = null;
      this.endMonth5 = null;
      this.startYear5 = null;
      this.endYear5 = null;
      this.prevButtonDisabled = true;

      const todayD = new Date();
      this.year5 = todayD.getFullYear();
      this.myYear5 = todayD.getFullYear();
      this.month5 = todayD.getMonth() + 1;
      this.myMonth5 = todayD.getMonth() + 1;
      this.myday5 = undefined;

      const inputField = this.template.querySelector(".custom-input5");
      if (inputField) {
        inputField.value = "";
      }

      const allButtons = this.template.querySelectorAll(".day-button5");
      allButtons.forEach((button) => {
        button.classList.remove(
          "selected5",
          "in-range5",
          "startborder5",
          "endborder5",
          "singleborder5",
          "in-range5-dis"
        );
      });
      this.populateCalendar5();
    }
  }

  handleOutsideClick5(event) {
    const calendarPopup = this.template.querySelector(".calendar-popup5");
    const inputField = this.template.querySelector(".custom-input5");
    if (
      calendarPopup &&
      !calendarPopup.contains(event.target) &&
      !inputField.contains(event.target)
    ) {
      this.isCalendarOpen5 = false;
    }
  }
}
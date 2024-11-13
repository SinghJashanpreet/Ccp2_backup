/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api, track, wire } from "lwc";
import { createRecord } from "lightning/uiRecordApi";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { loadStyle } from "lightning/platformResourceLoader";
import getMaintenanceData from "@salesforce/apex/CCP2_Notification_Controller.getMaintenanceData";
import getMaintenanceDetails from "@salesforce/apex/CCP2_Notification_Controller.getMaintenanceDetails";
import updateMaintenance from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.updateMaintenance";
import deleteMaintenance from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.deleteMaintenance";
import getSearchAccount from "@salesforce/apex/CCP2_Notification_Controller.getAccountsByNamePattern";
import updateMaintenanceImage from "@salesforce/apex/CCP2_Notification_Controller.updateMaintenanceImage";

import CCP2_Resources from "@salesforce/resourceUrl/CCP2_Resources";
import homeintro from "@salesforce/resourceUrl/RichTextCSSEdit";
import getbranchList from "@salesforce/apex/CCP2_userData.BranchList";
import deletecontentversion from "@salesforce/apex/CCP2_vehcileImageUploader.deleteContentDocumentByVersionId";
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

export default class Ccp2_MaintenanceHistory extends LightningElement {
  emptyRecallDataIcon = EmptyRecallDataIcon;
  @api vehicleId;
  @track wiredVehicleResult;
  @track wiredVehicleResultDetail;
  @track maintainceData = [];
  @track maintenanceDetails = { ImageUrls : [] };
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

  @track showNormalSort1 = true;
  @track showNormalSort2 = false;
  @track showAscSort1 = false;
  @track showAscSort2 = false;
  @track showDescSort1 = false;
  @track showDescSort2 = true;
  @track sortingField = "Implementation_Date__c";
  @track sortingDirection = "DESC";

  @track currentImageUrl = "";

  dropdown = arrowicon;
  //rich text field
  @track isEditBottomInfo = false;
  // @track richTextVal = "";

  //image edit
  @track isalluploadedimages = false;
  @track imageList = [];
  @track uploadedImages = [];
  @track isloadingImages = true;
  @track showImages;

  //branch
  @track branchObj = "";
  //account
  @track accountObj;
  @track divforAccountAddress = false;

  //recieving destination
  @track destinationAccBranch = "";
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
  @track storedImplementationDate = null;


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

  get hasMaintainaceItems() {
    return this.maintainceData.length > 0;
  }

  connectedCallback() {
    this.selectedDate = this.maintenanceDetails.Implementation_Date__c || null;
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.dropdown})`
    );
    console.log("this.vehicleId in maintraine", this.vehicleId);
  }

  disconnectedCallback() {
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

  }

  renderedCallback() {
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
      this.handleOutsideClickBound = this.handleOutsideClickCalendar2.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound);
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
    this.wiredVehicleResult = result; // Store the wire result for refreshing
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
      this.showEmptyContiner = data.records.length === 0 ? true : false;
      this.maintainceData = data.records.map((elm) => {
        return {
          Id: elm.Id || "-",
          Name: elm.Name || "-",
          Service_Factory__c: elm.Service_Factory__c || "-",
          Service_Type__c: elm.Service_Type__c || "-",
          Ordered_Number__c: elm.Ordered_Number__c || "-",
          Schedule_Date__c:
            elm.Schedule_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate(elm.Schedule_Date__c) || "-",
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

  // getMaintenanceDetailsMethod(maintenanceId) {
  //   getMaintenanceDetails({ maintenanceId: maintenanceId })
  //     .then((data) => {
  //       if (data) {
  //         this.maintenanceDetailsApi = data;
  //         console.log("Retrieved maintenance data:", maintenanceId, data);
  //         let imagesArray = JSON.parse(data?.images) || [];
  //         this.showImages = imagesArray.length === 0 ? false : true;
  //         console.log("data of images2:- ", this.showImages);
  //         this.MaintenanceType = data.result[0].Maintenance_Type__c || "-";
  //         this.branchObj =  data.result[0].CCP2_Branch__r || "";
  //         this.accountObj =  data.result[0].Account__r || "";
  //         this.destinationNosearch = data.result[0].Recieving_Destination_noSearch__c || "";
  //         this.selectedPicklistScheduleType = data.result[0].Service_Type__c || "";
  //         this.selectedPicklistfactoryType = data.result[0].Service_Factory__c || "";
  //         this.richTextVal = data.result[0].Description_Rich_Text__c || "";

  //         this.maintenanceDetails = {
  //           Id: data.result[0].Id || "-",
  //           Implementation_Date__c:
  //             data.result[0].Implementation_Date__c === undefined
  //               ? "-"
  //               : this.formatJapaneseDate(
  //                   data.result[0].Implementation_Date__c
  //                 ) || "-",
  //           Recieving_Destination__c:
  //             data.result[0].Recieving_Destination__c === undefined ? '-' :
  //             data.result[0].Recieving_Destination__c || "-",
  //           Schedule_Date__c:
  //             data.result[0].Schedule_Date__c === undefined
  //               ? "-"
  //               : this.formatJapaneseDate(data.result[0].Schedule_Date__c) ||
  //                 "-",
  //           Service_Factory__c: data.result[0].Service_Factory__c || "-",
  //           Service_Type__c: data.result[0].Service_Type__c || "-",
  //           // Maintenance_Type__c: data.result[0].Maintenance_Type__c || "-",
  //           LastModifiedBy: data.result[0].LastModifiedBy.Name || "-",
  //           LastModifiedDate:
  //             data.result[0].LastModifiedDate === undefined
  //               ? "-"
  //               : this.formatJapaneseDate(
  //                   data.result[0].LastModifiedDate.split("T")[0]
  //                 ) || "-",
  //           Description_Rich_Text__c:
  //             data.result[0].Description_Rich_Text__c || "-",
  //           Recieving_Destination_noSearch__c : data.result[0].Recieving_Destination_noSearch__c || "-",
  //           Branch: data.result[0].CCP2_Branch__r || "-",
  //           // AccountId: data.result[0].Account__r.Id || "-",
  //           // AccountName: data.result[0].Account__r.Name || "-",
  //           ImageUrls: imagesArray.map((img) =>{
  //             return{
  //               recordId: img.id,
  //               fileName: img.fileName,
  //               fileURL: img.fileURL,
  //               Description: img.Description,
  //               filetype: img.filetype
  //             }
  //           })
  //         };
  //         console.log("main details",JSON.stringify(this.maintenanceDetails));
  //         console.log("main details type",JSON.stringify(this.branchObj));
  //         console.log("main details type",JSON.stringify(this.accountObj));
  //         console.log("main details type factt",this.selectedPicklistfactoryType);

  //         this.showDetailPageLoader = false;
  //       } else {
  //         console.warn(
  //           "No data returned from maintenance API for:",
  //           maintenanceId,
  //           data
  //         );
  //       }
  //     })
  //     .catch((err) => {
  //       console.error("Error retrieving maintenance data:", maintenanceId, err);
  //     });
  // }

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
      this.showImages = imagesArray.length === 0 ? false : true;
      console.log("data of images2:- ", this.showImages);
      this.MaintenanceType = data.result[0].Maintenance_Type__c || "-";
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
      this.storedScheduleDate = data.result[0].Schedule_Date__c === undefined ? null : data.result[0].Schedule_Date__c || null;
      this.storedImplementationDate = data.result[0].Implementation_Date__c === undefined ? null : data.result[0].Implementation_Date__c || null;

      this.maintenanceDetails = {
        Id: data.result[0].Id || "-",
        Implementation_Date__c:
          data.result[0].Implementation_Date__c === undefined
            ? "-"
            : this.formatJapaneseDate(data.result[0].Implementation_Date__c) ||
              "-",
        Implementation_Date__c2:
          data.result[0].Implementation_Date__c === undefined
            ? "-"
            : data.result[0].Implementation_Date__c || "-",
        Recieving_Destination__c:
          data.result[0].Recieving_Destination__c === undefined
            ? "-"
            : data.result[0].Recieving_Destination__c || "-",
        Schedule_Date__c:
          data.result[0].Schedule_Date__c === undefined
            ? "-"
            : this.formatJapaneseDate(data.result[0].Schedule_Date__c) || "-",
        Schedule_Date__c2:
          data.result[0].Schedule_Date__c === undefined
            ? "-"
            : data.result[0].Schedule_Date__c || "-",
        Service_Factory__c: data.result[0].Service_Factory__c || "-",
        Service_Type__c: data.result[0].Service_Type__c || "-",
        // Maintenance_Type__c: data.result[0].Maintenance_Type__c || "-",
        LastModifiedBy: data.result[0].LastModifiedBy.Name || "-",
        LastModifiedDate:
          data.result[0].LastModifiedDate === undefined
            ? "-"
            : this.formatJapaneseDate(
                data.result[0].LastModifiedDate.split("T")[0]
              ) || "-",
        Description_Rich_Text__c:
          data.result[0].Description_Rich_Text__c || "-",
        Recieving_Destination_noSearch__c:
          data.result[0].Recieving_Destination_noSearch__c || "",
        Branch: data.result[0].CCP2_Branch__r || "-",
        // AccountId: data.result[0].Account__r.Id || "-",
        // AccountName: data.result[0].Account__r.Name || "-",
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
      console.log("main details", JSON.stringify(this.maintenanceDetails));
      console.log("main details type", JSON.stringify(this.branchObj));
      console.log("main details type", JSON.stringify(this.accountObj));
      console.log("main details type factt", this.selectedPicklistfactoryType);
      this.showImages = this.maintenanceDetails.ImageUrls.length > 0;

      this.showDetailPageLoader = false;
    } else if (error) {
      console.error(
        "Error retrieving maintenance data:",
        this.MaintenanceId,
        error
      );
    }
  }

  handlePreviousPage2() {
    if (this.currentPage > 1) {
      // refreshApex(this.wiredVehicleResult);
      this.refreshData();
      this.prevGoing = true;
      this.currentPage -= 1;
      this.isPreviousDisabled2 = this.currentPage === 1;
      this.isNextDisabled2 = this.currentPage === this.totalPageCount2;
      this.updatePageButtons();
      this.updateVisiblePages();
    }
  }

  handleNextPage2() {
    if (this.totalPageCount2 > this.currentPage) {
      this.refreshData();
      // refreshApex(this.wiredVehicleResult);
      this.prevGoing = false;
      this.currentPage += 1;
      console.log("THIS is the current page in handle next", this.currentPage);
      this.isPreviousDisabled2 = this.currentPage === 1;
      this.isNextDisabled2 = this.currentPage === this.totalPageCount2;
      this.updatePageButtons();
      this.updateVisiblePages();
    }
  }

  pageCountClick2(event) {
    // refreshApex(this.wiredVehicleResult);
    this.refreshData();
    console.log(event.target.dataset.page);
    this.currentPage = Number(event.target.dataset.page);
    this.updatePageButtons();
    this.updateVisiblePages();
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
      this.showRightDots2 = element === this.totalPageCount2 ? false : true;
    });
  }

  formatJapaneseDate(isoDate) {
    if(isoDate == undefined){
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

  toggleListType(event) {
    event.stopPropagation();
    this.showListType = !this.showListType;
    this.showServiceType = false;
    this.showFactoryType = false;
  }
  toggleServiceType(event) {
    event.stopPropagation();
    this.showServiceType = !this.showServiceType;

    this.showListType = false;
    this.showFactoryType = false;
  }
  toggleFactory(event) {
    event.stopPropagation();
    this.showFactoryType = !this.showFactoryType;

    this.showListType = false;
    this.showServiceType = false;
  }

  toggleSort1() {
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
  toggleSort2() {
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

  handleInsideClick(event) {
    event.stopPropagation();
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
    this.currentPage = 1;
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
  //       this.showDescSort2 = true;
  //     } else if (this.notificationSortForQuery === "DESC") {
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

  toggleListToDetailUi(event) {
    refreshApex(this.wiredVehicleResultDetail);
    this.showListPage = false;
    this.showDetailPage = true;
    this.MaintenanceId = event.target.dataset.id;
    // this.getMaintenanceDetailsMethod(this.MaintenanceId);
    console.log("record id of maintance page:- ", event.target.dataset.id);
  }

  returnToList() {
    if (this.isEditBottomInfo || this.iseditTopInfo) {
      this.showBackEditmodal = true;
    } else {
      this.showListPage = true;
      this.showDetailPage = false;
      this.showDetailPageLoader = true;
      refreshApex(this.wiredVehicleResult);
    }
  }

  handleToggleZoomInImage(event) {
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

  onClose() {
    this.dispatchEvent(new CustomEvent("back"));
    console.log("goback2");
  }
  handleOpenNewMaintainHistory() {
    this.dispatchEvent(new CustomEvent("opennewmaintainhistory"));
  }

  editTopInfo() {
    this.iseditTopInfo = !this.iseditTopInfo;

    refreshApex(this.wiredVehicleResultDetail);

    if (this.maintenanceDetails.Service_Factory__c == "ふそう/自社 以外") {
      this.destinationAccBranch = this.accountObj.Name || "";
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
    }
    if (this.maintenanceDetails.Schedule_Date__c == "-") {
      this.maintenanceDetails.Schedule_Date__c = "";
    }
    if (this.maintenanceDetails.Implementation_Date__c == "-") {
      this.maintenanceDetails.Implementation_Date__c = "";
    }
    console.log("dest account branch", this.destinationAccBranch);
  }

  get ifHistory() {
    return this.MaintenanceType === "History";
  }

  handleEditRichtext() {
    this.isEditBottomInfo = true;
    console.log("inside rich edit");
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
  handleInsertImage() {
    // Prompt the user for an image URL
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
  handleRichTextChange(event) {
    this.richTextVal = event.target.value;
    console.log("rich text", this.richTextVal);
  }

  // handleFilesChange(event) {
  //   const files = event.target.files;
  //   const newImages = [];
  //   this.isalluploadedimages = true;

  //   if (this.maintenanceDetails.ImageUrls.length + files.length > 10) {
  //     this.dispatchEvent(
  //       new ShowToastEvent({
  //         message: "画像は最大10枚までアップロードできます。",
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

  // handleRemoveImage(event) {
  //   const recordId = event.target.dataset.id;
  //   this.deleteRecordIdsimg.push(recordId);
  //   console.log("delete record ids", JSON.stringify(this.deleteRecordIdsimg));
  //   this.isalluploadedimages = true;
  //   console.log("recid", recordId);
  //   if (recordId) {
  //     // this.isloadingImages = true;
  //     let temArr = this.maintenanceDetails.ImageUrls.filter((image) => {
  //       if (image.recordId === recordId) {
  //         image.isloadingImages = true;
  //       }
  //       return image.recordId !== recordId;
  //     });
  //     this.maintenanceDetails.ImageUrls =
  //       this.maintenanceDetails.ImageUrls.filter(
  //         (image) => image.recordId !== recordId
  //       );

  //     this.uploadedImages = this.uploadedImages.filter(
  //       (image) => image.recordId !== recordId
  //     );

  //     this.imagesCreatedId = this.imagesCreatedId.filter(
  //       (id) => id !== recordId
  //     );
  //     this.isloadingImages = false;
  //     this.isalluploadedimages = false;
  //   } else {
  //     console.error("Error: No valid record ID found for deletion.");
  //     this.isalluploadedimages = false;
  //   }
  // }

  handleFilesChange(event) {
    const files = event.target.files;
    const newImages = [];
    if (this.maintenanceDetails.ImageUrls.length + files.length > 10) {
      this.dispatchEvent(
        new ShowToastEvent({
          message: "画像は最大10枚までアップロードできます。",
          variant: "error"
        })
      );
      event.stopPropagation();
      this.template.querySelector('input[type="file"]').value = "";
      return;
    }
  
    const fileReadPromises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
  
      const isDuplicate = this.uploadedImages.some(
        (image) => image.name === file.name
      );
      if (isDuplicate) {
        this.dispatchEvent(
          new ShowToastEvent({
            message: `${file.name} 同じ名前のファイルがすでに存在します。`,
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
              halfName: file.name.substring(0, 8) + "..."
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
  
  handleRemoveImage(event) {
    const recordId = event.target.dataset.id;
    if (recordId) {
      this.maintenanceDetails.ImageUrls = this.maintenanceDetails.ImageUrls.filter(
        (image) => image.recordId !== recordId
      );
  
      this.uploadedImages = this.uploadedImages.filter(
        (image) => image.recordId !== recordId
      );
  
      this.showImages = this.maintenanceDetails.ImageUrls.length > 0; // Dynamically update showImages
    } else {
      console.error("Error: No valid record ID found for deletion.");
    }
  }


  deletecontentversion(recordId) {
    deletecontentversion({ contentVersionId: recordId })
      .then(() => {
        console.log("inside delete");
        this.maintenanceDetails.ImageUrls =
          this.maintenanceDetails.ImageUrls.filter(
            (image) => image.recordId !== recordId
          );

        console.log("below main details delete");

        this.uploadedImages = this.uploadedImages.filter(
          (image) => image.recordId !== recordId
        );
        console.log("below main uploaded delete");

        this.imagesCreatedId = this.imagesCreatedId.filter(
          (id) => id !== recordId
        );
        console.log("below imagescreated main uploaded delete");

        this.isloadingImages = false;
        this.isalluploadedimages = false;
      })
      .catch((error) => {
        this.isloadingImages = false;
        this.isalluploadedimages = false;
        console.error("Error deleting image:", error);
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
              this.dispatchEvent(
                new ShowToastEvent({
                  message: `Error uploading image "${image.fileName}": ${error}`,
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
        //     new ShowToastEvent({
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
      });
  }

  handleScheduleTypeChange(event) {
    // this.showerrorScheduleType = false;
    event.stopPropagation();
    this.showlistScheduleType = !this.showlistScheduleType;
  }

  handlePickListChange(event) {
    const selectedValue = event.target.dataset.idd;
    this.selectedPicklistScheduleType = selectedValue;
    this.showlistScheduleType = false;
    console.log("this.selected pick", this.selectedPicklistScheduleType);
    // this.updateMaintenanceData();
  }

  handlefactoryTypeChange(event) {
    event.stopPropagation();
    this.showlistfactoryType = !this.showlistfactoryType;
  }

  handlePickListChangefactory(event) {
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
    this.showlistfactoryType = false;
  }

  handleBranchListclick(event) {
    event.stopPropagation();
    this.showBranchlist = !this.showBranchlist;
    console.log("inside poen branch");
  }

  get isOwned() {
    return this.selectedPicklistfactoryType === "自社";
  }

  handleNone() {
    this.destinationAccBranch = "";
    this.destinationAccountBranchtosend = null;
    this.showBranchlist = false;
    // this.updateMaintenanceData();
  }

  handlebranchNameClick(event) {
    this.destinationAccBranch = event.target.dataset.namee;
    this.destinationAccountBranchtosend = event.target.dataset.idd;
    this.showBranchlist = !this.showBranchlist;
    console.log("this.dessss", this.destinationAccountBranch);
    console.log("branch name id", this.destinationAccountBranchtosend);
    // this.updateMaintenanceData();
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
            }
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
      });
  }

  get searchlistClass() {
    return (this.searchArrayaccount && this.searchArrayaccount.length > 0) ||
      (this.searchKey && !this.showMyList)
      ? "paddedContainerSearchList"
      : "paddedContainerSearchList empty";
  }

  handleAccountClick(event) {
    this.showMore = false;
    const accountName = event.target.dataset.namee;
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

  get searchKeyPresent() {
    return this.searchKey || this.destinationAccBranch;
  }

  handleRemovesearchKey() {
    // event.stopPropagation();
    this.searchKey = "";
    this.destinationAccBranch = "";
    this.destinationAccountBranchtosend = null;
    this.divforAccountAddress = false;
    this.readonlyaccount = false;
    this.searchaccounts = [];
    this.itemClicked = false;
    console.log("clicked", this.searchKey);
    // this.updateMaintenanceData();
  }

  backfromEdittop() {
    refreshApex(this.wiredVehicleResultDetail);
    this.iseditTopInfo = false;
    // this.selectedPicklistScheduleType = this.maintenanceDetails.Service_Type__c;
    // this.selectedPicklistfactoryType =
    //   this.maintenanceDetails.Service_Factory__c;
    // if (this.maintenanceDetails.Service_Factory__c == "ふそう/自社 以外") {
    //   this.destinationAccBranch = this.accountObj.Name || "";
    //   this.destinationAccountBranchtosend = this.accountObj.Id || null;
    //   this.destPostcode = this.accountObj.ShippingPostalCode || "";
    //   this.destMunc = this.accountObj.ShippingCity || "";
    //   this.destPref = this.accountObj.ShippingState || "";
    //   this.destStreet = this.accountObj.ShippingStreet || "";
    //   if (this.destinationAccBranch) {
    //     this.divforAccountAddress = true;
    //   } else {
    //     this.divforAccountAddress = false;
    //   }
    // } else {
    //   this.destinationAccBranch = this.branchObj.Name || "";
    // }
  }

  backfromEditbottom() {
    console.log("belw refreshh");
    this.isEditBottomInfo = false;
    // if(this.maintenanceDetails.Description_Rich_Text__c == "-"){
    //   this.richTextVal = "";
    // }else{
    //   this.richTextVal = this.maintenanceDetails.Description_Rich_Text__c;
    // }
    refreshApex(this.wiredVehicleResultDetail);
    this.imagesCreatedId.forEach((img) => {
      this.deletecontentversion(img);
      console.log("working delete");
    });

    // this.getMaintenanceDetailsMethod(this.MaintenanceId);
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

  handleCancelNo() {
    this.showBackEditmodal = false;
  }
  handleCancelYes() {
    refreshApex(this.wiredVehicleResult);
    this.showBackEditmodal = false;
    this.iseditTopInfo = false;
    this.isEditBottomInfo = false;
    this.showDetailPage = false;
    this.showListPage = true;
  }
  handlesaveeditbottom() {
    this.updateMaintenanceData();
    this.deleteRecordIdsimg.forEach((img) => {
      this.deletecontentversion(img);
      console.log("working delete");
    });
    this.isEditBottomInfo = false;
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


  openCalendarSchedule(event) {
    event.stopPropagation();
    this.showPosterreal = true;
    this.isCalendarOpen = !this.isCalendarOpen;
    this.showMyList = true;
    this.showMorelist = false;
    this.searchArrayaccount = [];
    this.showBranchlist = false;
    this.showlistfactoryType = false;
    this.showlistScheduleType = false;

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
        const isSelected = this.selectedDay && this.selectedDay == i;
        const buttonClass = isDisabled
          ? "day-button filled disabled"
          : isSelected
            ? "day-button filled selected"
            : "day-button filled";

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
        const isSelected = this.selectedDay && this.selectedDay == i;
        const buttonClass = isDisabled
          ? "day-button filled disabled"
          : isSelected
            ? "day-button filled selected"
            : "day-button filled";

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
    const selectedDay = event.target.textContent;

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
    console.log("selecrted to send reset",this.selectedDateToSend);

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
    event.stopPropagation();
    this.showPosterreal = false;
    this.isCalendarOpen2 = !this.isCalendarOpen2;
    // this.showMyList = true;
    // this.showMorelist = false;
    // this.searchArrayaccount = [];
    // this.showBranchlist = false;
    // this.showlistfactoryType = false;
    // this.showlistScheduleType = false;
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

    if (this.selectedDay2 !== this.myday2) {
      console.log("yes not same!!", this.selectedDay, this.myday);
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
        const buttonClass = isDisabled
          ? "day-button filled disabled"
          : isSelected
            ? "day-button filled selected"
            : "day-button filled";

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
        const buttonClass = isDisabled
          ? "day-button filled disabled"
          : isSelected
            ? "day-button filled selected"
            : "day-button filled";

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

  goToPreviousMonth2() {
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
      selectedButtons.forEach((button) => button.classList.remove("selected"));
      this.populateCalendar2();
    }
  }

  goToNextMonth2() {
    if (!this.isNextMonthDisabled2 && !this.showPosterreal) {
      this.month2++;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button.selected"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected"));
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
      selectedButtons.forEach((button) => button.classList.remove("selected"));
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
    // Use selectedDate if it exists, otherwise use the initial backend date
    return this.selectedDate2 || this.maintenanceDetails.Implementation_Date__c;
  }

  get displayDateSchedule() {
    return this.selectedDate || this.maintenanceDetails.Schedule_Date__c;
  }

  handleShowMoreCLick() {
    console.log("insdei show more");
    this.searchClassAccount2(this.searchKey);
    console.log("insdei show more2");
    // this.searchAccountError = false;
    // this.showMore=true;
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
    // this.updatedMaintenance = {};

    this.updatedMaintenance.maintenanceId = this.MaintenanceId;
    console.log("rich text", this.richTextVal);

    // this.updatedMaintenance.richText = this.richTextVal;
    // console.log("rich text",this.richTextVal);

    if (
      this.selectedPicklistScheduleType !==
      this.maintenanceDetails.Service_Type__c
    ) {
      this.updatedMaintenance.serviceType = this.selectedPicklistScheduleType;
    }
    if (
      this.selectedPicklistfactoryType !==
      this.maintenanceDetails.Service_Factory__c
    ) {
      this.updatedMaintenance.serviceFactory = this.selectedPicklistfactoryType;
    }

    if (
      this.destinationNosearch !==
      this.maintenanceDetails.Recieving_Destination_noSearch__c
    ) {
      this.updatedMaintenance.recievingDestinationNoSearch =
        this.destinationNosearch;
    }

    if (this.richTextVal !== this.maintenanceDetails.Description_Rich_Text__c) {
      this.updatedMaintenance.richText = this.richTextVal;
    }

    if(this.selectedDateToSend !== this.storedScheduleDate){
      if(this.selectedDateToSend !== null){
        this.updatedMaintenance.scheduleDate = this.selectedDateToSend;
      }
    }

    if(this.selectedDateToSend2 !== this.storedImplementationDate){
      if(this.selectedDateToSend2 !== null){
        this.updatedMaintenance.implementationDate = this.selectedDateToSend2;
      }
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

    console.log(
      "maintenance updatedd",
      JSON.stringify(this.updatedMaintenance)
    );
    this.finalUpdateMaintenance();
  }


  handlesaveedittop() {
    if (this.destinationAccBranch) {
      if (this.destinationNosearch) {
        this.multipleDest = true;
        console.log("inside no search");
      } else {
        console.log("update in handle save");
        this.updateMaintenanceData();

        this.iseditTopInfo = false;

        // this.template
        //   .querySelector(".listScheduleTypeRec")
        //   .classList.remove("error-input");
        // this.template
        //   .querySelector(".InputsScheduleTypeSearch")
        //   .classList.remove("error-input");
      }
    } else {
      // if (
      //   (this.searchAccountError &&
      //     this.searchKey &&
      //     !this.destinationAccountBranch) ||
      //   (!this.searchAccountError &&
      //     this.searchKey &&
      //     !this.destinationAccountBranch)
      // ) {
      //   console.log("in if.........");
      //   window.scrollTo(0, 0);
      // } else {
        this.updateMaintenanceData();

        // this.isStep1 = false;
        //   this.isStep2 = true;
        //   this.isStep3 = false;
        //   this.isStep4 = false;
        this.iseditTopInfo = false;
        window.scrollTo(0, 0);
      // }
    }
  }

  finalUpdateMaintenance() {
    const JSONstring = JSON.stringify(this.updatedMaintenance);
    const ImagesJson = JSON.stringify(this.imagesCreatedId);
    console.log("imagess json",ImagesJson);
    console.log("main iddss",this.MaintenanceId);

    updateMaintenance({
      jsonInput: JSONstring
    })
      .then((result) => {
        console.log("result", result);
        this.selectedDate2 = null;
        this.selectedDay2 = null;
        const todayD = new Date();
        this.year2 = todayD.getFullYear();
        this.myYear2 = todayD.getFullYear();
        this.month2 = todayD.getMonth() + 1;
        this.myMonth2 = todayD.getMonth() + 1;
        this.myday2 = undefined;
        this.selectedDateToSend2 = null;
        this.selectedDate = null;
        this.selectedDay = null;
        this.year = todayD.getFullYear();
        this.myYear = todayD.getFullYear();
        this.month = todayD.getMonth() + 1;
        this.myMonth = todayD.getMonth() + 1;
        this.myday = undefined;
        this.selectedDateToSend = null;
        this.imagesCreatedId = [];
        refreshApex(this.wiredVehicleResultDetail);
        this.iseditTopInfo = false;

        // window.scrollTo(0, 0);
      })
      .catch((error) => {
        console.log("error", error);
      });

      updateMaintenanceImage({
        contentVersionIdsJson: ImagesJson,
        maintenanceId: this.MaintenanceId
      })
      .then((result) => {
        console.log("result imagesssssss", result);
        refreshApex(this.wiredVehicleResultDetail);
        this.isEditBottomInfo = false;

        // window.scrollTo(0, 0);
      })
      .catch((error) => {
        console.log("error bottom", error);
      });

  }

  handleOk() {
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

  cancelPlan() {
    console.log("inside cancel plan");
    this.cancelplanModal = true;
    console.log("inside cancel deleted");
  }

  deletehistory() {
    console.log("inside history delete");
    // this.deleteMaintenance();
    this.deleteHistoryModal = true;
    console.log("inside history deleted");
  }

  deleteMaintenance() {
    deleteMaintenance({
      maintenanceId: this.MaintenanceId
    })
      .then((result) => {
        refreshApex(this.wiredVehicleResult);
        console.log("result delete", result);
      })
      .catch((error) => {
        console.log("error delete", error);
      });
  }

  handledeleteplanNo() {
    this.cancelplanModal = false;
  }

  handledeleteplanYes() {
    this.deleteMaintenance();
    this.cancelplanModal = false;
    this.showDetailPage = false;
    this.showListPage = true;
    this.showModalAndRefresh();
  }

  showModalAndRefresh() {
    this.showModalRefresh = true;
    setTimeout(() => {
      this.showModalRefresh = false;
    }, 2000);
  }

  handledeleteHistoryNo() {
    this.deleteHistoryModal = false;
  }

  handledeleteHistoryYes() {
    this.deleteMaintenance();
    this.deleteHistoryModal = false;
    this.showDetailPage = false;
    this.showListPage = true;
    this.showModalAndRefreshHistory();
  }

  showModalAndRefreshHistory() {
    this.showModalRefreshDelete = true;
    setTimeout(() => {
      this.showModalRefreshDelete = false;
    }, 2000);
  }

  get isDisabledPlan(){
    return !this.selectedPicklistScheduleType || !this.selectedPicklistfactoryType || (!this.selectedDate && !this.maintenanceDetails.Schedule_Date__c);
  }
  get isDisabledHistory(){
    return !this.selectedPicklistScheduleType || !this.selectedPicklistfactoryType || (!this.selectedDate2 && !this.maintenanceDetails.Implementation_Date__c);
  }

}
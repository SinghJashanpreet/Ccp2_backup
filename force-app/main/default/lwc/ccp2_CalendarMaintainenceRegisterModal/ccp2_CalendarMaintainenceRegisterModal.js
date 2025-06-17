import { LightningElement, wire, track, api } from 'lwc';
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { loadStyle } from 'lightning/platformResourceLoader';
import { refreshApex } from '@salesforce/apex';
import homeintro from '@salesforce/resourceUrl/RichtextCss';
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import getVehicleById from "@salesforce/apex/CCP2_VehicleDetailController.getVehicleById";
import getFusolist from "@salesforce/apex/CCP2_VehicleShakenController.returnFusoDetails";
import getbranchList from "@salesforce/apex/CCP2_userData.BranchList";
import deletecontentversion from "@salesforce/apex/CCP2_vehcileImageUploader.deleteContentDocumentByVersionId";
import createMaintenanceBook from "@salesforce/apex/CCP2_Notification_Controller.createMaintenanceBooking";
import getSearchAccount from "@salesforce/apex/CCP2_Notification_Controller.getAccountsByNamePattern";
import SERVICE_TYPE_FIELD from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Type__c";
import SERVICE_FACTORY_FIELD from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Factory__c";
import CONTENT_VERSION_OBJECT from "@salesforce/schema/ContentVersion";
import TITLE_FIELD from "@salesforce/schema/ContentVersion.Title";
import VERSION_DATA_FIELD from "@salesforce/schema/ContentVersion.VersionData";
import PATH_ON_CLIENT_FIELD from "@salesforce/schema/ContentVersion.PathOnClient";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import Languagei18n from "@salesforce/apex/CCP2_guestUserLanguage.guestuserLanguage";
import labelsInfo from "@salesforce/resourceUrl/ccp2_labels";
import FUSOShopLink from "@salesforce/label/c.FUSOShopLink";
import ECScope from "@salesforce/label/c.CCP2_EC_Scope";
import getExistingMaintenance from "@salesforce/apex/CCP2_Additional_Services.getExistingMaintenance";


const arrowicon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";
const nosearch =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/NoVehicles.png";

const poster1 = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Poster-Image-1.png';
const poster2 = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/next-poster.webp';
const component1Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp1.png';
const component2Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp2.png';
const component3Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp3.png';
const component4Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp4.png';
const component5Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp5.png';
const component6Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp6.png';
const FusoLogoBefore = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/logo-poster-before.png';
const FusoLogoAfter = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/logo-poster-after.png';

export default class Ccp2_CalendarMaintainenceRegisterModal extends LightningElement {
  @api vehicleId;
  dropdown = arrowicon;
  //FusoShop = "https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja&scope=openid&response_type=code&ui_locales=ja";
  FusoShop = FUSOShopLink;
  ECScope = ECScope;
  poster1 = poster1;
  poster2 = poster2;
  logobefore = FusoLogoBefore;
  logoafter = FusoLogoAfter;
  @track selectedDate2 = "";
  @track richInput;
  @track isCalendarOpen2 = false;
  @track isNextMonthDisabled2 = false;
  @track selectedDay2;
  @track myday2;
  @track myMonth2;
  @track myYear2;
  @track showPosterreal = false;
  @track selectedDateRange2 = '';
  @track calendarDates2 = [];
  @track startDate2 = null;
  @track endDate2 = null;
  @track month2 = new Date().getMonth() + 1;
  @track year2 = new Date().getFullYear();
  @track startMonth2;
  @track startYear2;
  @track endMonth2;
  @track endYear2;
  @track serviceTypeOptions = [];
  @track wiredFactoryPicklist;
  @track serviceFactoryOptions = [];
  @track serviceFactoryOptionsreset = [];
  @track selectedPicklistScheduleType = "";
  @track selectedPicklistfactoryType = "";
  @track destinationNosearch = "";
  @track destinationAccountBranch = "";
  @track destinationAccountBranchToShow = "";
  @track richTextVal = "";
  @track FinalMainLoader = false;
  @track multipleDest = false;
  @track showlistScheduleType = false;
  @track showlistfactoryType = false;
  @track isStep1 = true;
  @track isalluploadedimages = false;
  @track branchList = [];
  @track showBranchlist = false;
  @track photoModal = true;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  @track divforAccountAddress = false;
  @track showMorelist = false;
  @track exitModal = false;
  @track showMore = false;
  @track postCode = "";
  @track municipality = "";
  @track perfecturess = "";
  @track street = "";
  @track ownedSelected = true;
  @track otherSelected = false;
  @track branchDestinationSelected = "";
  @track searchaccounts = [];
  @track searchAccountError = false;
  @track itemClicked = false;
  @track errorSearch;
  @track searchKey = "";
  @track readonlyaccount = false;
  @track showPosterreal = false;
  @track showPoster1 = false;
  @track showPoster2 = false;
  @track myday;
  @track myMonth;
  @track myYear;

  vehicleImages = [
    { code: 'オイルフィルター', name: '602', imageUrl: component1Image },
    { code: 'エアフィルター', name: '601', imageUrl: component2Image },
    { code: '燃料フィルター', name: '603', imageUrl: component3Image },
    { code: 'ワイパーブレード', name: '840a', imageUrl: component4Image },
    { code: 'ワイパーゴム', name: '840b', imageUrl: component5Image },
    { code: 'ベルト', name: '571', imageUrl: component6Image }
  ];

  dropdown = arrowicon;
  nosearch = nosearch;
  @track vehicleDetails = {
    id: 10,
    name: "-",
    type: "-",
    mileage: "-",
    vehicleRegDate: "-",
    VehicleExpirationDate: "-",
    chassisnumber: "-",
    siebelAccountCode: "-",
    registrationNumber: "-",
    ModelNumber: " ",
    ModelName: " "
  };

  @track maintenanceHistory = {
    Implementation_Date__c: null,
    Ordered_Number__c: null,
    Recieving_Destination__c: null,
    Schedule_Date__c: null,
    Schedule_EndDate__c: null,
    Service_Factory__c: null,
    Service_Type__c: null,
    Vehicle__c: null,
    descriptionrichtext: null
  };

  @track showmoreArray = [];

  @track searchArrayaccount = [];
  labels2 = {};
  //image
  @track imageList = [];
  @track uploadedImages = [];
  @track isloadingImages = true;

  @track isCalendarOpen = false;
  @track selectedDate = null;
  @track selectedDateTosend = null;
  @track selectedDateToSendStart = null;
  @track selectedDateToSendEnd = null;
  @track year = new Date().getFullYear();
  @track month = new Date().getMonth() + 1;
  @track calendarDates = [];
  @track selectedDay; // To track the currently selected day
  @track isNextMonthDisabled = false;
  @track isPrevMonthDisabled = false;
  @track showcancelimageModal = false;
  //fuso
  @track BranchSearchList = true;
  @track AccountSearchList = false;
  @track FusoSearchList = false;
  @track itemClickedFuso = false;
  @track FusoKey = "";
  @track searchArrayFuso = [];
  @track showmoreofFuso = false;
  @track showmylistFuso = false;
  @track searchFuso = [];
  @track readonlyFuso = false;
  @track divforFusoAddress = false;
  @track searchFusoError = false;
  @track searchFusos = [];
  @track showmoreArray2 = [];
  @track destinationFuso = null;
  @track destinationFusotosend = "";
  @track addressfuso = "";
  @track cityfuso = "";

  @track imageEvent;
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
  validity = true;
  errorMessage;
  richTextSaved = "";
  selectMode = 'end';
  @track descValue = '';
  @track characterCount = 0;
  maxCharacterLimit = 1000;
  errorMessage = '';
  @track maxLength = 1000;

  @track maintainType = "";
  @track isHistory = false;


  get isError() {
    return (this.destinationNosearch && this.destinationAccountBranch) || this.searchAccountError || (this.destinationNosearch && this.searchKey)
  }

  get searchKeyPresent() {
    return this.searchKey;
  }

  @wire(getVehicleById, { vehicleId: "$vehicleId" })
  handleVehData({ data, error }) {
    console.log("data", data);
    if (data) {
      const vehicle = data[0] || {};
      console.log("vehicle", vehicle);
      this.vehicleDetails = {
        id: vehicle.Id || "-",
        name: vehicle.Vehicle_Name__c || "-",
        type: vehicle.Vehicle_Type__c || "-",
        chassisnumber: vehicle.Chassis_number__c || "-",
        siebelAccountCode: vehicle.Account__r.siebelAccountCode__c || "-",
        ModelNumber: vehicle.fullModel__c || " ",
        ModelName: vehicle.Model_Format_Name__c || " ",

      };
      console.log("vehicledetails", JSON.stringify(this.vehicleDetails));
      console.log("type is here", this.maintainType);
    } else {
      console.log("error from class", error);

    }
  }


  get reqFields() {
    // console.log("all values",this.selectedPicklistScheduleType, this.selectedPicklistfactoryType, this.selectedDateToSendStart, this.selectedDateToSendEnd, this.selectedDateToSend);
    return (
      !this.selectedPicklistScheduleType ||
      !this.selectedPicklistfactoryType ||
      (this.selectedPicklistfactoryType === "ふそう" && !this.destinationFuso) ||
      !(this.selectedDateToSend || this.selectedDateToSendEnd)
      || this.isalluploadedimages || this.searchFusoError
    );
  }
  get showmorelength() {
    return this.showmoreArray.length > 0;
  }
  get searchKeyPresentFuso() {
    return this.FusoKey || this.destinationFuso;
  }
  get searchlistClassFuso() {
    return (this.searchArrayFuso && this.searchArrayFuso.length > 0) || this.FusoKey && !this.showmylistFuso
      ? "paddedContainerSearchList"
      : "paddedContainerSearchList empty";
  }
  get era() {
    return this.getJapaneseEra(this.year);
  }
  get monthLabel() {
    return this.getMonthLabel(this.month);
  }
  get ownSelected() {
    return this.selectedPicklistfactoryType === "ふそう/自社 以外";
  }
  get isDisabled() {
    return !this.selectedPicklistfactoryType || this.selectedPicklistfactoryType === "ふそう";
  }
  get searchlistClass() {
    return (this.searchArrayaccount && this.searchArrayaccount.length > 0) || this.searchKey && !this.showMyList
      ? "paddedContainerSearchList"
      : "paddedContainerSearchList empty";
  }
  get Richtextn() {
    return this.richTextVal;
  }
  get Imgonly() {
    return this.imageList && this.imageList.length > 0;
  }
  get reiwaYear2() {
    return this.convertToReiwaYear2(this.year2, this.month2);
  }
  get monthLabel2() {
    return this.getMonthLabel2(this.month2);
  }
  get showmorelength2() {
    return this.showmoreArray2.length > 0;
  }
  connectedCallback() {
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.dropdown})`
    );
    window.addEventListener('click', this.handleOutsideClick2.bind(this));
    this.populateCalendar2();
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      this.loadLanguage();
    }
    this.highlightRange2();
    //   this.updateMaintenanceHistory();
    try {
      loadStyle(this, homeintro);
      console.log("Error Loaded Successfully ");
    } catch (e) {
      console.error("Error loading styling", e);
      let error = JSON.stringify(e);
      ErrorLog({
        lwcName: "ccp2_createHistoryMaintain",
        errorLog: error,
        methodName: "load the style",
        ViewName: "maintainence Register modal",
        InterfaceName: "Salesforce",
        EventName: "Data fetch",
        ModuleName: "Vehicle Maintainence Calendar"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
    if (!this.handleOutsideClickBound) {
      this.handleOutsideClickBound = this.handleOutsideClick.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound);
    }
    if (!this.handleOutsideClickBound2) {
      this.handleOutsideClickBound2 = this.handleOutsideClickBranch.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound2);
    }
    if (!this.handleOutsideClickBound3) {
      this.handleOutsideClickBound3 = this.handleOutsideClickFactory.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound3);
    }
    if (!this.handleOutsideClickBound4) {
      this.handleOutsideClickBound4 =
        this.handleOutsideClickCalendar.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound4);
    }
    if (!this.handleOutsideClickBound5) {
      this.handleOutsideClickBound5 = this.handleOutsideClickSearch.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound5);
    }
    if (!this.handleOutsideClickBound6) {
      this.handleOutsideClickBound6 = this.handleOutsideClickFuso.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound6);
    }
  }

  disconnectedCallback() {

    window.removeEventListener('click', this.handleOutsideClick2.bind(this));
    if (this.handleOutsideClickBound) {
      document.removeEventListener("click", this.handleOutsideClickBound);
      this.handleOutsideClickBound = null;
    }
    if (this.handleOutsideClickBound2) {
      document.removeEventListener("click", this.handleOutsideClickBound2);
      this.handleOutsideClickBound2 = null;
    }
    if (this.handleOutsideClickBound3) {
      document.removeEventListener("click", this.handleOutsideClickBound3);
      this.handleOutsideClickBound3 = null;
    }
    if (this.handleOutsideClickBound4) {
      document.removeEventListener("click", this.handleOutsideClickBound4);
      this.handleOutsideClickBound4 = null;
    }
    if (this.handleOutsideClickBound5) {
      document.removeEventListener("click", this.handleOutsideClickBound5);
      this.handleOutsideClickBound5 = null;
    }
    if (this.handleOutsideClickBound6) {
      document.removeEventListener("click", this.handleOutsideClickBound6);
      this.handleOutsideClickBound6 = null;
    }
  }

  handleOutsideClick(event) {
    const isClickInside = this.template
      .querySelector(".dropdown-type")
      .contains(event.target);
    if (!isClickInside) {
      this.showlistScheduleType = false;
    }
  }
  handleOutsideClick2(event) {
    const calendarPopup = this.template.querySelector('.calendar-popup2');
    const inputField = this.template.querySelector('.custom-input2');
    if (calendarPopup && !calendarPopup.contains(event.target) && !inputField.contains(event.target)) {
      this.isCalendarOpen2 = false;
    }
  }
  handleOutsideClickFuso(event) {
    const searchList = this.template.querySelector(
      ".paddedContainerSearchList"
    );
    const inputField = this.template.querySelector(".InputsScheduleTypeSearch");
    const isClickInside = searchList && searchList.contains(event.target);

    if (!isClickInside && !this.itemClickedFuso && this.FusoKey.length > 0) {
      this.searchArrayFuso = [];
      this.searchFusoError = true;
      this.showMorelistFuso = false;
      this.showmylistFuso = true;
      if (inputField) {
        inputField.classList.add("error-input");
      }
    } else {
      this.searchFusoError = false;
      if (inputField) {
        inputField.classList.remove("error-input");
      }
    }
  }

  handleOutsideClickBranch(event) {
    const isClickInside = this.template
      .querySelector(".destination-receive")
      .contains(event.target);
    if (!isClickInside) {
      this.showBranchlist = false;
    }
  }

  handleOutsideClickSearch(event) {
    const searchList = this.template.querySelector(
      ".paddedContainerSearchList"
    );
    const inputField = this.template.querySelector(".InputsScheduleTypeSearch2");
    const isClickInside = searchList && searchList.contains(event.target);

    if (!isClickInside && !this.itemClicked && this.searchKey.length > 0) {
      this.searchArrayaccount = [];
      this.searchAccountError = true;
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

  handleOutsideClickFactory(event) {
    const isClickInside = this.template
      .querySelector(".dropdown-type-factory")
      .contains(event.target);
    if (!isClickInside) {
      this.showlistfactoryType = false;
    }
  }

  handleOutsideClickCalendar(event) {
    const isClickInside = this.template
      .querySelector(".calendar-popup")
      .contains(event.target);
    if (!isClickInside) {
      this.isCalendarOpen = false;
    }
  }

  handleInsideClick(event) {
    event.stopPropagation();
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
      //console.log("serv type", this.serviceTypeOptions);
    } else if (error) {
      console.error("error", error);
      //   let err = JSON.stringify(error);
      //   ErrorLog({ lwcName: "ccp2_createHistoryMaintain", errorLog: err,methodName: "ServicePicklist" })
      //   .then(() => {
      //       console.log("Error logged successfully in Salesforce");
      //   })
      //   .catch((loggingErr) => {
      //       console.error("Failed to log error in Salesforce:", loggingErr);
      //   });
    }
  }
  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: SERVICE_FACTORY_FIELD
  })
  wiredServiceFactoryPicklist({ data, error }) {
    if (data) {
      console.log("selected date to sendddd", this.selectedDateToSend);
      this.serviceFactoryOptionsreset = data.values.map((item) => {
        return { label: item.label, value: item.value };
      });
      this.serviceFactoryOptions = data.values.map((item) => {
        return { label: item.label, value: item.value };
      });
      console.log("factory field", JSON.stringify(this.serviceFactoryOptions));
    } else if (error) {
      console.error("factory field", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_createHistoryMaintain", errorLog: err, methodName: "FactoryPicklist",
        ViewName: "maintainence Register modal",
        InterfaceName: "Salesforce",
        EventName: "Data fetch",
        ModuleName: "Vehicle Maintainence Calendar"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
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
  //i18next
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
          lwcName: "ccp2_createHistoryMaintain", errorLog: err, methodName: "loadLanguage",
          ViewName: "maintainence Register modal",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Vehicle Maintainence Calendar"
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
    fetch(`${labelsInfo}/infoCenter.json`)
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
          console.log("Create History Maintain Locale: ", userLocale);
          console.log("Create History Maintain Labels: ", this.labels2);
        });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_createHistoryMaintain", errorLog: err, methodName: "Load Labels",
          ViewName: "maintainence Register modal",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Vehicle Maintainence Calendar"
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
    if (this.Languagei18n === 'en_US') {
      console.log("working1");
      return "en";
    }
    else {
      console.log("working2");
      return "jp";
    }
  }

  handleScheduleTypeChange(event) {
    this.showerrorScheduleType = false;
    event.stopPropagation();
    this.showlistScheduleType = !this.showlistScheduleType;
    this.showBranchlist = false;
    this.showlistfactoryType = false;
    this.isCalendarOpen = false;
    this.isCalendarOpen2 = false;

    this.showMorelist = false;
    this.searchArrayaccount = [];
  }

  handlePickListChange(event) {
    const selectedValue = event.target.dataset.idd;
    this.selectedPicklistScheduleType = selectedValue;
    this.showlistScheduleType = false;
  }

  handlefactoryTypeChange(event) {
    event.stopPropagation();
    this.showlistfactoryType = !this.showlistfactoryType;
    this.showBranchlist = false;
    this.showlistScheduleType = false;
    this.isCalendarOpen = false;
    this.isCalendarOpen2 = false;

    this.showMorelist = false;
    this.searchArrayaccount = [];
  }

  handleDestinationType(event) {
    this.destinationNosearch = event.target.value;
    console.log("dest no search", this.destinationNosearch);
  }

  //search accounts
  handleBranchListclick(event) {
    event.stopPropagation();
    this.showBranchlist = !this.showBranchlist;
    this.showlistScheduleType = false;
    this.showlistfactoryType = false;
    this.isCalendarOpen = false;
    this.isCalendarOpen2 = false;
  }

  handlebranchNameClick(event) {
    this.destinationAccountBranchToShow = event.target.dataset.namee;
    this.destinationAccountBranch = event.target.dataset.idd;
    this.showBranchlist = !this.showBranchlist;
    this.showlistScheduleType = false;
    this.showlistfactoryType = false;
    this.isCalendarOpen = false;
    this.isCalendarOpen2 = false;
    console.log("this.dessss", this.destinationAccountBranch);
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
            ShippingPostalCode: item?.ShippingPostalCode ?? '',
            shippingAdd: {
              PostalCode: shippingAdd.postalCode || "",
              prefect: shippingAdd.state || "",
              municipality: shippingAdd.city || "",
              street: shippingAdd.street || ""
            },
            Address: ((item?.ShippingPostalCode ?? '') + '\u00A0\u00A0' + (shippingAdd?.state ?? '') + '' +(shippingAdd?.city ?? '') + '' +(shippingAdd?.street ?? '')).trim(),
            hasAddress: shippingAdd.postalCode || shippingAdd.state || shippingAdd.city || shippingAdd.street
          }
        })
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
          lwcName: "ccp2_createHistoryMaintain", errorLog: err, methodName: "searchClassAccount",
          ViewName: "maintainence Register modal",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Vehicle Maintainence Calendar"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
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
          }
        })
        console.log("showmore arrayyyyy", JSON.stringify(this.showmoreArray));
        console.log("searchaccounts search length", result.slice(0, 99));
        this.errorSearch = undefined;
        console.log("inside class");

        this.searchAccountError = false;
        this.showMore = true;
      })
      .catch((error) => {
        this.errorSearch = error.body.message;
        this.readonlyaccount = false;
        this.searchaccounts = undefined;
        console.error("searchClassAccount", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_createHistoryMaintain", errorLog: err, methodName: "searchClassAccount2",
          ViewName: "maintainence Register modal",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Vehicle Maintainence Calendar"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  handleAccountClick(event) {
    this.showMore = false;
    const accountName = event.target.dataset.namee;
    this.destinationAccountBranchToShow = event.target.dataset.namee;
    this.destinationAccountBranch = event.target.dataset.idd;
    this.postCode = event.target.dataset.postal || "";
    this.municipality = event.target.dataset.mun || "";
    this.perfecturess = event.target.dataset.prefect || "";
    this.street = event.target.dataset.street || "";
    console.log("post mun perft", this.postCode, this.municipality, this.perfecturess);
    this.searchKey = `${accountName} ${this.postCode} ${this.municipality} ${this.perfecturess} ${this.street}`;
    this.searchArrayaccount = [];
    this.itemClicked = true; // Set flag to true when an item is clicked
    this.readonlyaccount = true;
    this.searchAccountError = false;
    this.divforAccountAddress = true;
    this.showMyList = true;
    console.log("desti account", this.destinationAccountBranch);
  }
  handlesearchCancel() {
    this.showMore = false;
  }


  updateMaintenanceHistory() {
    let receivingDestinationBranch = "";
    let receivingDestinationAccount = "";
    let fusoName = "";
    let fusoAddress = "";
    console.log("main tain typpeeee", this.maintainType);

    // if (this.destinationAccountBranch) {
    //   receivingDestination = this.destinationAccountBranch;
    // } else if (this.destinationNosearch) {
    //   receivingDestination = this.destinationNosearch;
    // }

    if (this.selectedPicklistfactoryType === '自社') {
      receivingDestinationBranch = this.destinationAccountBranch;
    } else if (this.selectedPicklistfactoryType === 'ふそう/自社 以外') {
      receivingDestinationAccount = this.destinationAccountBranch;
    } else if (this.selectedPicklistfactoryType === 'ふそう') {
      receivingDestinationBranch = null;
      receivingDestinationAccount = null;
      this.showPoster2 = false;
      this.showPoster1 = true;
      this.destinationNosearch = "";
      fusoName = this.destinationFuso;
      fusoAddress = this.addressfuso + " " + this.cityfuso;
    }
    if (this.disablecalendar1 === false) {
      this.maintainType = "History";
      this.isHistory = true;
      this.maintenanceHistory = {
        Implementation_Date__c: this.selectedDateToSend,
        Service_Factory__c: this.selectedPicklistfactoryType,
        Service_Type__c: this.selectedPicklistScheduleType,
        Recieving_Destination_noSearch: this.destinationNosearch,
        Recieving_Destination_Account: receivingDestinationAccount,
        Recieving_Destination_Branch: receivingDestinationBranch,
        Vehicle__c: this.vehicleId,
        descriptionrichtext: this.richTextVal,
        Maintenance_Type__c: this.maintainType,
        Fuso_Address__c: fusoAddress,
        Fuso_Name__c: fusoName
      };
    } else {
      this.maintainType = "Scheduled";
      this.isHistory = false;
      this.maintenanceHistory = {
        Schedule_Date__c: this.selectedDateToSendStart,
        Schedule_EndDate__c: this.selectedDateToSendEnd,
        Service_Factory__c: this.selectedPicklistfactoryType,
        Service_Type__c: this.selectedPicklistScheduleType,
        Recieving_Destination_noSearch: this.destinationNosearch,
        Recieving_Destination_Account: receivingDestinationAccount,
        Recieving_Destination_Branch: receivingDestinationBranch,
        Vehicle__c: this.vehicleId,
        descriptionrichtext: this.richTextVal,
        Maintenance_Type__c: this.maintainType,
        Fuso_Address__c: fusoAddress,
        Fuso_Name__c: fusoName
      };
    }
    console.log("main histiry checkkkkkk", JSON.stringify(this.maintenanceHistory));
  }

  //calendar


  openCalendar(event) {
    event.stopPropagation();
    this.isCalendarOpen = !this.isCalendarOpen;
    this.showMyList = true;
    this.showMorelist = false;
    this.searchArrayaccount = [];
    this.showBranchlist = false;
    this.showlistfactoryType = false;
    this.showlistScheduleType = false;
    this.isCalendarOpen2 = false;
    // if (!this.selectedDay) {
    if (!this.myday) {
      const todayD = new Date();
      const nextDay = new Date(todayD);
      // nextDay.setDate(todayD.getDate() + 1);

      let nextMonth = nextDay.getMonth() + 1;
      let nextYear = nextDay.getFullYear();
      this.year = nextYear;
      this.myYear = nextYear;
      this.month = nextMonth;
      this.myMonth = nextMonth;
    }
    console.log("yes not same!!1", this.selectedDay, this.myday);
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

  onClose() {
    this.dispatchEvent(new CustomEvent("back"));
  }
  handleNone() {
    this.destinationAccountBranch = "";
    this.destinationAccountBranchToShow = "";
    this.showBranchlist = false;
  }
  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    console.log("before", value, " - length", value.length);
    if (value.length > maxLength) {
      event.target.blur();
    }
  }

  closeCalendar() {
    this.isCalendarOpen = false;
  }

  populateCalendar() {
    const today = new Date();
    let todayMonth = today.getMonth() + 1;
    let todayYear = today.getFullYear();

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

    // last modified by jashanpreet singh
    if((this.year >= todayYear) || (this.month > todayMonth && this.year === todayYear - 1)){
      this.isNextYearDisabled = true;
    } else{
      this.isNextYearDisabled = false;
    }
    if(this.month === todayMonth && this.year === todayYear){
      this.isNextMonthDisabled = true;
    } else{
      this.isNextMonthDisabled = false;
    }

    const nextMonth = new Date(this.year, this.month);
    const prevMonth = new Date(this.year, this.month - 1);
    this.isNextMonthDisabled = nextMonth > today;
    this.isPrevMonthDisabled = prevMonth < today;
    console.log("isnextmonth", this.isNextMonthDisabled);
    console.log("isPrevMonth", this.isPrevMonthDisabled);
  }
  @track disablecalendar1 = false;
  @track disablecalendar2 = false;
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
    this.disablecalendar2 = true;

    this.confirmDate();
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

  confirmDate() {
    if (this.selectedDay) {
      // Update the formatted `selectedDate` when confirm is clicked
      console.log("beforeee imp");
      this.selectedDate = `${this.year}年${this.month}月${this.selectedDay}日`;
      console.log("after imp")
      // refreshApex(this.wiredFactoryPicklist);
      // setTimeout(() => {
      //   refreshApex(this.wiredFactoryPicklist);
      // }, 1000);
      console.log("after imp 222")
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
      this.serviceFactoryOptions = this.serviceFactoryOptions.filter((ser) => ser.label !== "ふそう");
      if (this.selectedPicklistfactoryType === "ふそう") {
        this.selectedPicklistfactoryType = "";
        this.BranchSearchList = true;
        this.FusoSearchList = false;
        this.handleRemovesearchKeyFuso();
      }
    }
    this.isCalendarOpen = false;
  }

  resetDate() {
    this.selectedDate = null;
    this.selectedDay = null; // Clear the selected day
    const todayD = new Date();
    const nextDay = new Date(todayD);
    nextDay.setDate(todayD.getDate() + 1);

    let nextMonth = nextDay.getMonth() + 1;
    let nextYear = nextDay.getFullYear();
    this.year = nextYear;
    this.myYear = nextYear;
    this.month = nextMonth;
    this.myMonth = nextMonth;
    this.disablecalendar1 = false;
    this.disablecalendar2 = false;
    this.myday = undefined;
    const inputField = this.template.querySelector(".custom-input");
    inputField.value = "";
    this.selectedDateToSend = null;

    this.isNextYearDisabled = true;
    this.isNextMonthDisabled = true;
    // Reset the selected state of all buttons
    const selectedButtons = this.template.querySelectorAll(
      ".day-button.selected"
    );
    selectedButtons.forEach((button) => button.classList.remove("selected"));
    this.populateCalendar();
    this.serviceFactoryOptions = this.serviceFactoryOptionsreset;
  }

  goToPreviousMonth() {
    // if (this.showPosterreal) {
    //   if (!this.isPrevMonthDisabled) {
    //     this.month--;

    //     console.log("no this is what i wnat ", this.month, this.myMonth);
    //     this.selectedDay = null;

    //     if (this.month < 1) {
    //       this.month = 12;
    //       this.year--;
    //     }

    //     if (this.myMonth === this.month && this.myYear === this.year) {
    //       this.selectedDay = this.myday;
    //     }



    //     //this.selectedDate = null;
    //     const selectedButtons = this.template.querySelectorAll(
    //       ".day-button.selected"
    //     );
    //     selectedButtons.forEach((button) => button.classList.remove("selected"));
    //     this.populateCalendar();
    //   }
    // } else {
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

      const today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayYear = today.getFullYear();

      if (todayYear - 1 >=  this.year && todayMonth >= this.month) {
        this.isNextYearDisabled = false;
      }

    // }
  }

  // Navigate to the next month
  goToNextMonth() {
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

    const today = new Date();
    let todayMonth = today.getMonth() + 1;
    let todayYear = today.getFullYear();

    if (todayMonth === this.month && todayYear === this.year) {
      this.isNextYearDisabled = true;
    }

    /* Last Modified by Singh Jashanpreet */
    if (todayYear - 1 === this.year && todayMonth < this.month) {
      this.isNextYearDisabled = true;
    }
      // this.month++;
      // const selectedButtons = this.template.querySelectorAll(
      //   ".day-button.selected"
      // );
      // selectedButtons.forEach((button) => button.classList.remove("selected"));
      // this.selectedDay = null;
      // console.log("yes this is what i wnat 1", this.month, this.myMonth);
      // if (this.month > 12) {
      //   this.month = 1;
      //   this.year++;
      // }
      // if (this.myMonth === this.month && this.myYear === this.year) {
      //   console.log("yes this is what i wnat ", this.month, this.myMonth);
      //   this.selectedDay = this.myday;
      //   // this.selectedDate = null;
      // }
      // // this.selectedDay = null;
      // //this.selectedDate = null;
      // this.populateCalendar();
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

  prevYear(){
    this.isNextYearDisabled = false;
      this.year--;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button.selected"
      );
      selectedButtons.forEach((button) =>
        button.classList.remove(
          "selected",
          "in-range",
          "startborder",
          "endborder",
          "singleborder"
        )
      );
      // this.selectedDay = null;
      // if (this.myYear === this.year) {
      //   this.selectedDay = this.myday;
      //   this.month = this.myMonth;
      // }
      this.populateCalendar();
  }

  nextyear(){
    this.isPrevDisabled = false;
      this.isPrevYearDisabled = false;
  
        this.year++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button.selected"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove(
            "selected",
            "in-range",
            "startborder",
            "endborder",
            "singleborder"
          )
        );
        // this.selectedDay = null;
        // if (this.myYear === this.year) {
        //   this.selectedDay = this.myday;
        //   this.month = this.myMonth;
        // }
        this.populateCalendar();

      /* Last Modified by Singh Jashanpreet */
      const today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayYear = today.getFullYear();

      console.log(
        todayYear,
        " ",
        this.year,
        " ",
        todayMonth,
        " ",
        this.month,
        " ",
        this.isNextYearDisabled
      );
      if (todayYear <= this.year || (this.month > todayMonth && todayYear - 1 === this.year)) { //2025 - 
        this.isNextYearDisabled = true;
      }
      if(todayYear === this.year && this.month === todayMonth){
        this.isNextMonthDisabled = true;
        this.isNextYearDisabled = true;
      }
  }

  handlePickListChangefactory(event) {
    const selectedValue = event.target.dataset.idd;
    this.selectedPicklistfactoryType = selectedValue;
    if (selectedValue === "ふそう/自社 以外") {
      this.AccountSearchList = true;
      this.BranchSearchList = false;
      this.FusoSearchList = false;
      this.destinationAccountBranchtosend = null;
      this.handleRemovesearchKey();
      this.handleRemovesearchKeyFuso();
    }
    else if (selectedValue === "ふそう") {
      this.AccountSearchList = false;
      this.BranchSearchList = false;
      this.FusoSearchList = true;
      this.destinationAccountBranchtosend = null;
      this.handleRemovesearchKey();
      this.handleRemovesearchKeyFuso();
    }
    else {
      this.AccountSearchList = false;
      this.BranchSearchList = true;
      this.FusoSearchList = false;
      this.destinationAccountBranchtosend = null;
      this.handleRemovesearchKeyFuso();
      this.handleRemovesearchKey();
    }
    //this.handleRemovesearchKey();
    this.showlistfactoryType = false;
  }

  handleRemovesearchKey() {
    // event.stopPropagation();
    this.searchKey = "";
    this.destinationAccountBranch = "";
    this.destinationAccountBranchToShow = "";
    this.divforAccountAddress = false;
    this.readonlyaccount = false;
    this.searchaccounts = [];
    this.itemClicked = false;
    console.log("clicked", this.searchKey);
  }
  handleShowMoreCLick() {
    console.log("insdei show more");
    this.searchClassAccount2(this.searchKey);
    console.log("insdei show more2");
    // this.searchAccountError = false;
    // this.showMore=true;

  }


  handleRichTextChange(event) {
    const richText = event.target.value;
    const plainText = this.stripHTML(richText);

    if (plainText.length > this.maxCharacterLimit) {
      event.target.value = this.richTextVal;
      this.errorMessage = `Character limit of ${this.maxCharacterLimit} exceeded!`;
    } else {
      this.richTextVal = richText;
      this.characterCount = plainText.length;
      this.errorMessage = '';
    }
  }
  @track disableInput = false;

  handleFilesChange(event) {
    const files = event.target.files;
    const newImages = [];
    this.isalluploadedimages = true;
    this.disableInput = true;

    if (this.imageList.length + files.length > 10) {
      this.dispatchEvent(
        new ShowToastEvent({
          message: this.labels2.ccp2_ch_max_upload_images,
          variant: "error"
        })

      );
      this.isalluploadedimages = false;
      this.disableInput = false;
      event.stopPropagation();
      this.template.querySelector('input[type="file"]').value = "";
      return;
    }

    // this.isloadingImages = true;

    const fileReadPromises = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!validFileTypes.includes(file.type)) {
        let error = "test error";
        ErrorLog({
          lwcName: "ccp2_createHistoryMaintain", errorLog: error,
          methodName: "handleFilesChange",
          ViewName: "maintainence Register modal",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Vehicle Maintainence Calendar"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
            this.dispatchEvent(
              new ShowToastEvent({
                message: this.labels2.ccp2_ch_invalid_file_type,
                variant: "error"
              })
            );
            this.isalluploadedimages = false;
            this.disableInput = false;
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        this.dispatchEvent(
          new ShowToastEvent({
            message: this.labels2.ccp2_ch_file_size_exceeded,
            variant: "error"
          })
        );
        this.isalluploadedimages = false;
        this.disableInput = false;
        continue;
      }


      const isDuplicate = this.uploadedImages.some(image => image.name === file.name);
      console.log("workonduplicate", JSON.stringify(isDuplicate));
      if (isDuplicate) {
        //console.log(`Duplicate file detected: ${file.name}`);
        this.dispatchEvent(
          new ShowToastEvent({
            message: `${file.name} ${this.labels2.ccp2_ch_duplicate_file_name}`,
            variant: 'error',
          })
        );
        this.isalluploadedimages = false;
        this.disableInput = false;
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
              src: resizedImageData,
              name: file.name,
              halfName: file.name.substring(0, 8) + '...',
              isloadingImages: true
            };

            this.imageList.push(newImage);
            newImages.push(newImage);

            this.imageList = [...this.imageList];

            resolve();
          };
        };

        reader.readAsDataURL(file);
      });

      fileReadPromises.push(fileReadPromise);
    }

    Promise.all(fileReadPromises).then(() => {
      if (newImages.length > 0) {
        this.createContentVersionRecords(newImages);
      }
      // this.isloadingImages = false;
    });
    event.target.value = null;
  }
  handleRemoveImage(event) {
    const recordId = event.dataset.id;
    this.isalluploadedimages = true;
    console.log("recid", recordId);
    if (recordId) {
      // this.isloadingImages = true;
      let temArr = this.imageList.filter((image) => {
        if (image.recordId === recordId) {
          image.isloadingImages = true;
        }
        return image.recordId !== recordId;
      });
      deletecontentversion({ contentVersionId: recordId })
        .then(() => {

          this.imageList = this.imageList.filter(
            (image) => image.recordId !== recordId
          );
          this.uploadedImages = this.uploadedImages.filter(image => image.recordId !== recordId);
          this.imagesCreatedId = this.imagesCreatedId.filter(
            (id) => id !== recordId
          );

          this.template.querySelector('input[type="file"]').value = "";

          this.isloadingImages = false;
          this.isalluploadedimages = false;
        })
        .catch((error) => {
          this.isloadingImages = false;
          this.isalluploadedimages = false;
          console.error("Error deleting image:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_createHistoryMaintain", errorLog: err, methodName: "handleRemoveImage",
            ViewName: "maintainence Register modal",
            InterfaceName: "Salesforce",
            EventName: "Data fetch",
            ModuleName: "Vehicle Maintainence Calendar"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });
    } else {
      console.error("Error: No valid record ID found for deletion.");
      this.isalluploadedimages = false;
    }
  }
  createContentVersionRecords(newImages) {
    this.imagesCreatedId = this.imagesCreatedId || [];
    this.uploadedImages = this.uploadedImages || [];

    const uploadPromises = newImages
      .filter(
        (image) =>
          !this.uploadedImages.some((uploaded) => uploaded.name === image.name)
      )
      .map((image) => {
        const fields = {};
        fields[TITLE_FIELD.fieldApiName] = image.name;

        const base64String = image.src.includes("base64,")
          ? image.src.split("base64,")[1]
          : image.src;

        if (base64String.length > 0 && base64String.length <= 5242880) {
          fields[VERSION_DATA_FIELD.fieldApiName] = base64String;
          fields[PATH_ON_CLIENT_FIELD.fieldApiName] = image.name;

          return createRecord({
            apiName: CONTENT_VERSION_OBJECT.objectApiName,
            fields
          })
            .then((record) => {
              this.imagesCreatedId.push(record.id);

              this.uploadedImages.push(image);

              const imageToUpdate = this.imageList.find((img) => {
                if (img.id === image.id) {
                  img.isloadingImages = false;
                }
                return img.id === image.id;
              });
              if (imageToUpdate) {
                imageToUpdate.recordId = record.id;
                //console.log("sw2images",JSON.stringify(this.imageList));
              }
            })
            .catch((error) => {
              console.error("Error creating ContentVersion:", error);
              this.dispatchEvent(
                new ShowToastEvent({
                  message: `${this.labels2.ccp2_ce_error_uploading_image} "${image.name}": ${error}`,
                  variant: "error"
                })
              );
              let err = JSON.stringify(error);
              ErrorLog({
                lwcName: "ccp2_createHistoryMaintain", errorLog: err, methodName: "createContentVersionRecords",
                ViewName: "maintainence Register modal",
                InterfaceName: "Salesforce",
                EventName: "Data update",
                ModuleName: "Vehicle Maintainence Calendar"
              })
                .then(() => {
                  console.log("Error logged successfully in Salesforce");
                })
                .catch((loggingErr) => {
                  console.error("Failed to log error in Salesforce:", loggingErr);
                });
              this.isalluploadedimages = false;
              this.disableInput = false;
            });
        } else {
          console.error(
            "Invalid Base64 string or exceeds size limit for image:",
            image.name
          );
          this.isalluploadedimages = false;
          this.disableInput = false;
          return Promise.reject("Invalid Base64 string or size limit exceeded");
        }
      });

    Promise.all(uploadPromises)
      .then(() => {
        console.log("All new images uploaded:", this.imagesCreatedId);
        this.isloadingImages = false; // Stop the loader
        this.isalluploadedimages = false;
        this.disableInput = false;
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
        this.disableInput = false;
        console.error("Error uploading one or more images:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_createHistoryMaintain", errorLog: err, methodName: "createContentVersionRecords",
          ViewName: "maintainence Register modal",
          InterfaceName: "Salesforce",
          EventName: "Data update",
          ModuleName: "Vehicle Maintainence Calendar"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  opencancelimagemodal(event) {
    this.imageEvent = event.currentTarget;
    this.showcancelimageModal = true;
  }
  handleimageNo() {
    this.showcancelimageModal = false;
  }

  handleimageYes() {
    this.showcancelimageModal = false; // Close 
    this.handleRemoveImage(this.imageEvent); // Call the function
  }
  stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
  handleConfirmmodal() {
    this.exitModal = true;
  }
  openlink() {
    const stateData = {
      customerID: this.vehicleDetails.siebelAccountCode
    };
    //const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja`;
    const baseUrl = this.FusoShop;
    const scope = `&scope=openid&response_type=code&ui_locales=ja`;
    const stateString = encodeURIComponent(JSON.stringify(stateData));
    console.log(stateString);
    const url = `${baseUrl}&state=${stateString}${scope}`;
    console.log("urldev", url);
    window.open(url, '_blank');
    // window.open(this.FusoShop, '_blank');
  }
  handleconfirmNo() {
    this.exitModal = false;
  }

  @track isAlreadyHaveMaintenance = '';
  @track refreshToken = 1;
  handleclick1() {
    if (this.destinationAccountBranch) {
      if (this.destinationNosearch) {
        this.multipleDest = true;
        console.log("inside no search");
      } else {
        getExistingMaintenance({scheduleDate: this.selectedDateToSendStart,scheduleEndDate: this.selectedDateToSendEnd,vehicleId: this.vehicleId,serviceType: this.selectedPicklistScheduleType,refreshToken: this.refreshToken})

        .then((result) => {
          if(result){
            this.isAlreadyHaveMaintenance = result;
          }else{
            this.FinalMainLoader = true;
            if (this.selectedPicklistScheduleType === '一般整備') {
              this.showPoster1 = true;
            } else {
              this.showPoster2 = true;
            }
            this.updateMaintenanceHistory();
            console.log("json", this.maintenanceHistory);
            console.log("images", this.imagesCreatedId);
            this.finaldatapush();
            window.scrollTo(0, 0);
            this.template
              .querySelector(".listScheduleTypeRec")
              .classList.remove("error-input");
            this.template
              .querySelector(".InputsScheduleTypeSearch")
              .classList.remove("error-input");
          }
        })
        // this.FinalMainLoader = true;
        // if (this.selectedPicklistScheduleType === '一般整備') {
        //   this.showPoster1 = true;
        // } else {
        //   this.showPoster2 = true;
        // }
        // this.updateMaintenanceHistory();
        // console.log("json", this.maintenanceHistory);
        // console.log("images", this.imagesCreatedId);
        // this.finaldatapush();
        // window.scrollTo(0, 0);
        // this.template
        //   .querySelector(".listScheduleTypeRec")
        //   .classList.remove("error-input");
        // this.template
        //   .querySelector(".InputsScheduleTypeSearch")
        //   .classList.remove("error-input");
      }
    } else {
      if ((this.searchAccountError && this.searchKey && !this.destinationAccountBranch) || (!this.searchAccountError && this.searchKey && !this.destinationAccountBranch)) {
        console.log('in if.........');
        window.scrollTo(0, 0);
      } else {
        getExistingMaintenance({scheduleDate: this.selectedDateToSendStart,scheduleEndDate: this.selectedDateToSendEnd,vehicleId: this.vehicleId,serviceType: this.selectedPicklistScheduleType,refreshToken: this.refreshToken})

        .then((result) => {
          if(result){
            this.isAlreadyHaveMaintenance = result;
          }else{
            this.FinalMainLoader = true;
            if (this.selectedPicklistScheduleType === '一般整備') {
              this.showPoster1 = true;
            } else {
              this.showPoster2 = true;
            }
            this.updateMaintenanceHistory();
            this.finaldatapush();
            console.log("json", this.maintenanceHistory);
            console.log("images", this.imagesCreatedId);
          }
        
        })
        // this.FinalMainLoader = true;
        // if (this.selectedPicklistScheduleType === '一般整備') {
        //   this.showPoster1 = true;
        // } else {
        //   this.showPoster2 = true;
        // }
        // this.updateMaintenanceHistory();
        // this.finaldatapush();
        // console.log("json", this.maintenanceHistory);
        // console.log("images", this.imagesCreatedId);
      }
    }
    this.refreshToken++;
  }
  finaldatapush() {
    const JSONstring = JSON.stringify(this.maintenanceHistory);
    const ImagesJson = JSON.stringify(this.imagesCreatedId);
    console.log("json", JSONstring);
    console.log("images", ImagesJson);
    createMaintenanceBook({
      jsonInput: JSONstring,
      contentVersionIdsJson: ImagesJson
    })
      .then((result) => {
        console.log("result", result);
        this.FinalMainLoader = false;
        sessionStorage.removeItem("ongoingTransaction");
        this.isStep1 = false;
      })
      .catch((error) => {
        console.log("error", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_createHistoryMaintain",
          errorLog: err,
          methodName: "finaldatapush",
          ViewName: "maintainence Register modal",
          InterfaceName: "Salesforce",
          EventName: "Data update",
          ModuleName: "Vehicle Maintainence Calendar"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  openCalendar2(event) {
    event.stopPropagation();
    const today = new Date();
    let todayMonth = today.getMonth() + 1;
    let todayYear = today.getFullYear();

    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    let nextMonth = nextDay.getMonth() + 1;
    let nextYear = nextDay.getFullYear();
    if (!this.startDate) {
      console.log("Next date is: ", nextDay);
      this.month2 = nextMonth;
      this.year2 = nextYear;
    }
    this.showMyList = true;
    this.showMorelist = false;
    this.searchArrayaccount = [];
    this.showBranchlist = false;
    this.showlistfactoryType = false;
    this.showlistScheduleType = false;
    this.isCalendarOpen = false;

    console.log("Current YEar", this.year2, this.myYear2);
    if (this.month2 !== this.myMonth2 && this.myMonth2 !== undefined) {
      console.log("Coming Despite Undefined month;");
      this.month2 = this.myMonth2;
    }
    if (this.year2 !== this.myYear2 && this.myYear2 !== undefined) {
      console.log("Coming Despite Undefined Year:");
      this.year2 = this.myYear2;
    }
    if (this.startDate2) {
      this.month2 = this.startDate2.month;
      this.year2 = this.startDate2.year;
    }
    this.isCalendarOpen2 = !this.isCalendarOpen2;

    if (todayMonth === this.month2 && todayYear === this.year2) {
      this.isPrevDisabled2 = true;
      this.isPrevMonthDisabled = true;
    } else this.isPrevDisabled2 = false;

    /* Last Modified by Singh Jashanpreet */
    if (todayYear >= this.year2 && todayMonth > this.month2) {
      this.isPrevYearDisabled2 = true;
    }
    this.populateCalendar2();
  }

  handleInsideClick2(event) {
    event.stopPropagation();
  }
  isDateAfter2(date1, date2) {
    const d1 = new Date(date1.year, date1.month - 1, date1.day);
    const d2 = new Date(date2.year, date2.month - 1, date2.day);
    return d1 > d2;
  }

  selectDate2(event) {
    const selectedDay2 = parseInt(event.target.textContent, 10);
    if (!this.startDate2) {
      this.startDate2 = { day: selectedDay2, month: this.month2, year: this.year2 };
      console.log("Starting Date :", this.startDate2.year2);
      this.startMonth2 = this.month2;
      this.startYear2 = this.year2;
    } else if (!this.endDate2) {
      this.endDate2 = { day: selectedDay2, month: this.month2, year: this.year2 };
      this.endMonth2 = this.month2;
      this.endYear2 = this.year2
      if (this.isDateAfter2(this.startDate2, this.endDate2)) {
        [this.startDate2, this.endDate2] = [this.endDate2, this.startDate2];
        [this.startMonth2, this.endMonth2] = [this.endMonth2, this.startMonth2];
        [this.startYear2, this.endYear2] = [this.endYear2, this.startYear2];
      }

      this.selectedDateRange2 = `${this.formatDate2(this.startDate2)} - ${this.formatDate2(this.endDate2)}`;
      this.isCalendarOpen2 = false;
    } else {
      this.startDate2 = { day: selectedDay2, month: this.month2, year: this.year2 };
      this.startMonth2 = this.month2;
      this.startYear2 = this.year2;
      this.endDate2 = null;
      this.selectedDateRange2 = '';
    }
    if (this.startDate2) this.selectedDateToSendStart = new Date(this.startDate2.year, this.startDate2.month - 1, this.startDate2.day), this.selectedDateToSendStart = this.formatDateToYYYYMMDD(this.selectedDateToSendStart);
    if (this.endDate2) this.selectedDateToSendEnd = new Date(this.endDate2.year, this.endDate2.month - 1, this.endDate2.day), this.selectedDateToSendEnd = this.formatDateToYYYYMMDD(this.selectedDateToSendEnd);
    this.myMonth2 = this.month2;
    this.myYear2 = this.year2;
    this.myday2 = this.selectedDay2;
    this.disablecalendar1 = true;
    console.log("Sending Dates: ", this.selectedDateToSendStart, this.selectedDateToSendEnd);
    this.highlightRange2();
  }

  @track isPrevDisabled2 = false;

  goToPreviousMonth2() {
    const today = new Date();
    let todayMonth = today.getMonth() + 1;
    let todayYear = today.getFullYear();

    if (todayMonth === this.month2 && todayYear === this.year2) {
      this.isPrevDisabled2 = true;
    }
      this.month2--;
      this.selectedDay2 = null;
      if (this.month2 < 1) {
        this.month2 = 12;
        this.year2--;
      }
      if (this.myMonth2 === this.month2 && this.myYear2 === this.year2) {
        this.selectedDay2 = this.myday2;
      }
      const selectedButtons = this.template.querySelectorAll(
        ".day-button2.selected2"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected2", "startborder2", "endborder2", "in-range2"));
      this.populateCalendar2();
    if (todayMonth === this.month2 && todayYear === this.year2) {
      this.isPrevDisabled2 = true;
    }

    /* Last Modified by Singh Jashanpreet */
    if (todayYear + 1 === this.year2 && todayMonth > this.month2) {
      this.isPrevYearDisabled2 = true;
    }
  }

  goToNextMonth2() {
    this.isPrevDisabled2 = false;
    const today = new Date();
    let todayMonth = today.getMonth() + 1;
    let todayYear = today.getFullYear();

    this.month2++;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button2.selected2"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected2", "in-range2", "startborder2", "endborder2"));
      this.selectedDay2 = null;
      if (this.month2 > 12) {
        this.month2 = 1;
        this.year2++;
      }
      if (this.myMonth2 === this.month2 && this.myYear2 === this.year2) {
        this.selectedDay2 = this.myday2;
      }
      this.populateCalendar2();

        /* Last Modified by Singh Jashanpreet */
      if (todayYear + 1 <= this.year2 && todayMonth <= this.month2) {
        this.isPrevYearDisabled2 = false;
      }
  }

  populateCalendar2() {
    const today = new Date();
    let todayMonth = today.getMonth() + 1;
    let todayYear = today.getFullYear();


    const firstDayOfMonth = new Date(this.year2, this.month2 - 1, 1).getDay();
    const daysInMonth = new Date(this.year2, this.month2, 0).getDate();

    this.calendarDates2 = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDates2.push({
        value: '',
        className: "day-button2 empty2",
        isEmpty: true,
        isDisabled: true,
      });
    }
    console.log("Populate me year month: ", this.year2, this.month2);
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(this.year2, this.month2 - 1, i);
      const isDisabled = currentDate < today;
      this.calendarDates2.push({
        value: i,
        className: isDisabled ? 'day-button2 disabled2' : 'day-button2',
        isEmpty: false,
        isDisabled,
        month: this.month2,
        year: this.year2,
      });
    }
    this.highlightRange2();
    console.log("All Calendar Dates: ", this.calendarDates2);
    console.log("All stringified calendar dates: ", JSON.stringify(this.calendarDates2));
    // Last Modified by Singh Jashanpreet
    if((this.year2 <= todayYear) || (this.month2 < todayMonth && this.year2 === todayYear + 1)){
      this.isPrevYearDisabled2 = true;
    } else{
      this.isPrevYearDisabled2 = false;
    }
    if(this.month2 === todayMonth && this.year2 === todayYear){
      this.isPrevDisabled2 = true;
    } else{
      this.isPrevDisabled2 = false;
    }
  }

  // highlightRange2() {
  //   const allDays = this.template.querySelectorAll('.day-button2');
  //   allDays.forEach(day => day.classList.remove("selected2", "in-range2", "startborder2", "endborder2"));
  //   if (this.startDate2) {
  //     const startDay = this.template.querySelector(
  //       `[data-day="${this.startDate2.day}"][data-month="${this.startDate2.month}"][data-year="${this.startDate2.year}"]`
  //     );
  //     if (startDay) startDay.classList.add('selected2', 'startborder2');
  //   }
  //   if (this.endDate2) {
  //     const endDay = this.template.querySelector(
  //       `[data-day="${this.endDate2.day}"][data-month="${this.endDate2.month}"][data-year="${this.endDate2.year}"]`
  //     );
  //     if (endDay) endDay.classList.add('selected2', 'endborder2');
  //   }
  //   if (this.startDate2 && this.endDate2) {
  //     this.calendarDates2.forEach(day => {
  //       if (
  //         !day.isDisabled &&
  //         day.value &&
  //         this.isWithinRange2(
  //           { day: day.value, month: this.month2, year: this.year2 },
  //           this.startDate2,
  //           this.endDate2
  //         )
  //       ) {
  //         if (
  //           !(
  //             day.value === this.startDate2.day &&
  //             this.month2 === this.startDate2.month &&
  //             this.year2 === this.startDate2.year
  //           ) &&
  //           !(
  //             day.value === this.endDate2.day &&
  //             this.month2 === this.endDate2.month2 &&
  //             this.year2 === this.endDate2.year2
  //           )
  //         ) {
  //           const dayElement = this.template.querySelector(
  //             `[data-day="${day.value}"][data-month="${this.month2}"][data-year="${this.year2}"]`
  //           );
  //           if (dayElement) dayElement.classList.add('in-range2');
  //         }
  //       }
  //     });
  //   }

  //   if (this.startDate2 && JSON.stringify(this.startDate2) === JSON.stringify(this.endDate2)) {
  //     const dayElement = this.template.querySelector(
  //       `[data-day="${this.startDate2.day}"][data-month="${this.month2}"][data-year="${this.year2}"]`
  //     );
  //     if (dayElement) dayElement.classList.remove('startborder2', 'endborder2'), dayElement.classList.add('singleborder2');
  //   }
  // }
  highlightRange2() {
    const allDays = this.template.querySelectorAll('.day-button2');
    allDays.forEach(day => day.classList.remove("selected2", "in-range2", "startborder2", "endborder2"));
    if (this.startDate2) {
      const startDay = this.template.querySelector(
        `[data-day="${this.startDate2.day}"][data-month="${this.startDate2.month}"][data-year="${this.startDate2.year}"]`
      );
      if (startDay) startDay.classList.add('selected2', 'startborder2');
    }
    if (this.endDate2) {
      const endDay = this.template.querySelector(
        `[data-day="${this.endDate2.day}"][data-month="${this.endDate2.month}"][data-year="${this.endDate2.year}"]`
      );
      if (endDay) endDay.classList.add('selected2', 'endborder2');
    }
    if (this.startDate2 && this.endDate2) {
      this.calendarDates2.forEach(day => {
        if (
          !day.isDisabled &&
          day.value &&
          this.isWithinRange2(
            { day: day.value, month: this.month2, year: this.year2 },
            this.startDate2,
            this.endDate2
          )
        ) {

          console.log("HEre values: ", day.value, this.month2, this.year2, JSON.stringify(this.startDate2), JSON.stringify(this.endDate2));
          if (
            !(
              day.value === this.startDate2.day &&
              this.month2 === this.startDate2.month &&
              this.year2 === this.startDate2.year
            ) &&
            !(
              day.value === this.endDate2.day &&
              this.month2 === this.endDate2.month &&
              this.year2 === this.endDate2.year
            )
          ) {
            const dayElement = this.template.querySelector(
              `[data-day="${day.value}"][data-month="${this.month2}"][data-year="${this.year2}"]`
            );
            if (dayElement) dayElement.classList.add('in-range2');
          }
        }
      });
    }

    if (this.startDate2 && JSON.stringify(this.startDate2) === JSON.stringify(this.endDate2)) {
      const dayElement = this.template.querySelector(
        `[data-day="${this.startDate2.day}"][data-month="${this.month2}"][data-year="${this.year2}"]`
      );
      if (dayElement) dayElement.classList.remove('startborder2', 'endborder2'), dayElement.classList.add('singleborder2');
    }
  }

  formatJapaneseYear2(isoDate) {
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

  convertToReiwaYear2(gregorianYear, month = 1, day = 1) {
    if (gregorianYear < 2019 || (gregorianYear === 2019 && (month < 5 || (month === 5 && day < 1)))) {
      return "無効な令和年";
    }
    const reiwaYear = gregorianYear - 2018;
    return reiwaYear === 1 ? `令和1年` : `令和${reiwaYear}年`;
  }



  isWithinRange2(currentDate, startDate, endDate) {
    const current = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
    const start = new Date(startDate.year, startDate.month - 1, startDate.day);
    const end = new Date(endDate.year, endDate.month - 1, endDate.day);
    return current >= start && current <= end;
  }

  // formatDate2(date) {
  //   return `${date.year}年${String(date.month).padStart(2, '0')}月${String(date.day).padStart(2, '0')}日`;
  // }

  formatDate2(date) {
    return `${date.year}年${date.month}月${date.day}日`;
  }

  nextyear2() {
    //for schedule
      this.isPrevDisabled2 = false;
      this.isPrevYearDisabled2 = false;
  
        this.year2++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button2.selected2"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove(
            "selected2",
            "in-range2",
            "startborder2",
            "endborder2",
            "singleborder2"
          )
        );
        // this.selectedDay2 = null;
        // if (this.myYear2 === this.year2) {
        //   this.selectedDay2 = this.myday2;
        //   this.month2 = this.myMonth2;
        // }
        this.populateCalendar2();
    
    
    // this.isPrevDisabled2 = false;
    // if (!this.isNextYearDisabled2 && !this.showPosterreal) {
    //   this.year2++;
    //   const selectedButtons = this.template.querySelectorAll(
    //     ".day-button2.selected2"
    //   );
    //   selectedButtons.forEach((button) =>
    //     button.classList.remove("selected2", "in-range2", "startborder2", "endborder2", "singleborder2")
    //   );
    //   this.selectedDay2 = null;
    //   if (this.myYear2 === this.year2) {
    //     this.selectedDay2 = this.myday2;
    //     this.month2 = this.myMonth2;
    //   }
    //   this.populateCalendar2();
    // } else if (this.showPosterreal) {
    //   this.year2++;
    //   const selectedButtons = this.template.querySelectorAll(
    //     ".day-button2.selected2"
    //   );
    //   selectedButtons.forEach((button) =>
    //     button.classList.remove("selected2", "in-range2", "startborder2", "endborder2", "singleborder2")
    //   );
    //   this.selectedDay2 = null;
    //   if (this.myYear2 === this.year2) {
    //     this.selectedDay2 = this.myday2;
    //     this.month2 = this.myMonth2;
    //   }
    //   this.populateCalendar2();
    // }
  }

  @track isPrevYearDisabled2 = true;
  @track isNextYearDisabled = true;

  prevYear2() {
    //for schedule
      this.year2--;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button2.selected2"
      );
      selectedButtons.forEach((button) =>
        button.classList.remove(
          "selected2",
          "in-range2",
          "startborder2",
          "endborder2",
          "singleborder2"
        )
      );
      // this.selectedDay2 = null;
      // if (this.myYear2 === this.year2) {
      //   this.selectedDay2 = this.myday2;
      //   this.month2 = this.myMonth2;
      // }
      this.populateCalendar2();

      /* Last Modified by Singh Jashanpreet */
      const today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayYear = today.getFullYear();

      console.log(
        todayYear,
        " ",
        this.year2,
        " ",
        todayMonth,
        " ",
        this.month2,
        " ",
        this.isPrevYearDisabled2
      );
      if (todayYear >= this.year2 || (this.month2 < todayMonth && todayYear + 1 === this.year2)) { //2025 -
        this.isPrevYearDisabled2 = true;
      }
      if(todayYear === this.year2 && this.month2 === todayMonth){
        this.isPrevDisabled2 = true;
        this.isPrevYearDisabled2 = true;
      }
  }

  getMonthLabel2(month) {
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

  resetDate2() {
    this.selectedDate2 = null;
    this.startDate2 = null;
    this.endDate2 = null;
    this.selectedDateRange2 = '';
    this.selectedDay2 = null;
    this.startMonth2 = null;
    this.endMonth2 = null;
    this.startYear2 = null;
    this.endYear2 = null;
    this.selectedDateToSendEnd = null;
    this.selectedDateToSendStart = null;
    this.disablecalendar1 = false;
    this.disablecalendar2 = false;

    this.isPrevYearDisabled2 = true;
    this.isPrevDisabled2 = true;

    const todayD = new Date();
    const nextDay = new Date(todayD);
    nextDay.setDate(todayD.getDate() + 1);

    let nextMonth = nextDay.getMonth() + 1;
    let nextYear = nextDay.getFullYear();
    this.year2 = nextYear;
    this.myYear2 = nextYear;
    this.month2 = nextMonth;
    this.myMonth2 = nextMonth;
    this.myday2 = undefined;

    this.isPrevYearDisabled2 = true;

    const inputField = this.template.querySelector(".custom-input2");
    if (inputField) {
      inputField.value = "";
    }

    const allButtons = this.template.querySelectorAll(".day-button2");
    allButtons.forEach(button => {
      button.classList.remove("selected2", "in-range2", "startborder2", "endborder2", "singleborder2");
    });
    this.populateCalendar2();
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
  handleImageClick(event) {
    const VinNumber = this.vehicleDetails.chassisnumber;
    const SiebelCode = this.vehicleDetails.siebelAccountCode;
    const RegNo = this.vehicleDetails.registrationNumber;
    const ModelNo = this.vehicleDetails.ModelNumber;
    const ModelName = this.vehicleDetails.ModelName;
    const imageName = event.currentTarget.dataset.name || event.target.closest('.overlay').dataset.name;
    const stateData = {
      hinmoku: imageName,
      chassisNumber: VinNumber,
      customerID: SiebelCode,
      registrationNumber: RegNo,
      vehicleModelNumber: ModelNo,
      vehicleModelName: ModelName
    };
    //const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja/hinmoku-search`;
    const baseUrl = this.FusoShop + '/hinmoku-search';

    const scope = `&scope=` + this.ECScope;
    //const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://shop.mitsubishi-fuso.com/mftbc/ja/Open-Catalogue/c/1`;
    const stateString = encodeURIComponent(JSON.stringify(stateData));
    console.log(stateString);
    const url = `${baseUrl}&state=${stateString}${scope}`;
    console.log("urldev", url);
    window.open(url, '_blank');
  }
  handleOk() {
    this.multipleDest = false;
    const searchInput = this.template.querySelector(
      ".InputsScheduleTypeSearch"
    );
    const recInput = this.template.querySelector(".listScheduleTypeRec");
    const factInput = this.template.querySelector(".listScheduleTypeFact");
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
  handleSearchFuso(event) {
    event.stopPropagation();
    this.FusoKey = event.target.value;
    if (this.FusoKey.length === 0) {
      this.searchArrayFuso = [];
      this.showmoreofFuso = false;
    }
    this.showmylistFuso = false;
    // this.itemClicked = false;
    if (this.FusoKey.length >= 1) {
      this.showMorelistFuso = true;
      this.searchClassFuso(this.FusoKey);
    } else {
      this.searchFuso = [];
    }
  }

  searchClassFuso(param) {
    getFusolist({ fusoSearch: param })
      .then((result) => {
        console.log("data from search newwa", param);
        console.log("data from search ajw", result);
        console.log("data from search length", result.length);
        this.searchArrayFuso = result.map((item) => {
          const address = item.address__c || " ";
          const city = item.city__c || " ";
          return {
            id: item.Id,
            name: item.Name,
            prefectures: item?.prefecture__c,
            address: address,
            city: city,
            hasAddress: address || city
          }
        })
        console.log("data final", JSON.stringify(this.searchArrayFuso));
      })
      .catch((error) => {
        // this.errorSearch = error.body.message;
        // this.readonlyfuso = false;
        // this.searchaccounts = undefined;
        console.error("searchClassAccount", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_createHistoryMaintain",
          errorLog: err,
          methodName: "searchClassFuso",
          ViewName: "maintainence Register modal",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Vehicle Maintainence Calendar"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  handleFusoClick(event) {
    this.showmoreofFuso = false;
    const accountName = event.target.dataset.namee;
    //this.destinationAccountBranchToShow = event.target.dataset.namee;
    //this.destinationAccountBranch = event.target.dataset.namee;
    this.destinationFuso = event.target.dataset.namee;
    this.destinationFusotosend = event.target.dataset.idd;
    this.addressfuso = event.target.dataset.address || "";
    this.cityfuso = event.target.dataset.city || "";
    //console.log("post mun perft", this.postCode, this.municipality, this.perfecturess);
    this.FusoKey = `${accountName} ${this.addressfuso} ${this.cityfuso}`;
    this.searchArrayFuso = [];
    this.itemClickedFuso = true; // Set flag to true when an item is clicked
    this.readonlyFuso = true;
    this.searchFusoError = false;
    this.divforFusoAddress = true;
    this.showmylistFuso = true;
    console.log("desti Fuso", this.destinationFusotosend, this.destinationFuso, this.addressfuso, this.cityfuso);
  }

  searchClassFuso2(param) {
    getFusolist({ fusoSearch: param })
      .then((result) => {
        console.log("data from search newwa", param);
        console.log("data from search ajw", result);
        console.log("data from search length", result.length);
        this.showmoreArray2 = result.map((item) => {
          const address = item.address__c || " ";
          const city = item.city__c || " ";
          return {
            id: item.Id,
            name: item.Name,
            address: address,
            prefectures: item?.prefecture__c,
            city: city,
            hasAddress: address || city
          }
        })
        this.searchFusoError = false;
        this.showmoreofFuso = true;
        console.log("data final", JSON.stringify(this.showmoreArray2));
      })
      .catch((error) => {
        // this.errorSearch = error.body.message;
        // this.readonlyfuso = false;
        // this.searchaccounts = undefined;
        console.error("searchClassAccount", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_createHistoryMaintain", errorLog: err,
          methodName: "searchClassFuso",
          ViewName: "maintainence Register modal",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Vehicle Maintainence Calendar"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  handlesearchFuso2(event) {
    event.stopPropagation();
    this.divforFusoAddress = false;

    this.FusoKey = event.target.value;
    if (this.FusoKey.length >= 1) {
      this.searchClassFuso2(this.FusoKey);
    } else {
      this.showmoreArray2 = [];
    }

  }
  handlesearchCancel2() {
    this.showmoreofFuso = false;
  }

  handleRemovesearchKeyFuso() {
    // event.stopPropagation();
    this.FusoKey = "";
    this.destinationAccountBranch = null;
    this.destinationFuso = null;
    this.destinationAccountBranchToShow = "";
    this.destinationFusotosend = "";
    //this.accIdtoSend = "";
    this.divforFusoAddress = false;
    this.readonlyFuso = false;
    this.itemClickedFuso = false;
    console.log("clicked", this.FusoKey);
  }
  handleShowMoreCLickFuso() {
    console.log("insdei show more");
    this.searchClassFuso2(this.FusoKey);
    console.log("insdei show more2");
    // this.searchAccountError = false;
    // this.showMore=true;

  }

  get isFusoselected() {
    return this.selectedPicklistfactoryType === "ふそう"
  }

  backfromSameinsp(){
    this.isAlreadyHaveMaintenance = '';
  }

}
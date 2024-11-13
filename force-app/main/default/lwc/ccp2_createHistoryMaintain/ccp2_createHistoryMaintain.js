import { LightningElement, track, api, wire } from "lwc";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { createRecord } from "lightning/uiRecordApi";
import { loadStyle } from 'lightning/platformResourceLoader';
import homeintro from '@salesforce/resourceUrl/RichtextCss';
import getVehicleById from "@salesforce/apex/CCP2_VehicleDetailController.getVehicleById";
import getbranchList from "@salesforce/apex/CCP2_userData.BranchList";
import deletecontentversion from "@salesforce/apex/CCP2_vehcileImageUploader.deleteContentDocumentByVersionId";
import createMaintenanceBook from "@salesforce/apex/CCP2_Notification_Controller.createMaintenanceBooking";
import getSearchAccount from "@salesforce/apex/CCP2_Notification_Controller.getAccountsByNamePattern";
import SERVICE_TYPE_FIELD from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Type__c";
import SERVICE_FACTORY_FIELD from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Factory__c";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import CONTENT_VERSION_OBJECT from "@salesforce/schema/ContentVersion";
import TITLE_FIELD from "@salesforce/schema/ContentVersion.Title";
import VERSION_DATA_FIELD from "@salesforce/schema/ContentVersion.VersionData";
import PATH_ON_CLIENT_FIELD from "@salesforce/schema/ContentVersion.PathOnClient";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import Name from "@salesforce/schema/Account.Name";
import PostalCode from "@salesforce/schema/Asset.PostalCode";

const arrowicon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";

  const nosearch =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/NoVehicles.png";

    const  poster1 = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Poster-Image-1.png';
    const  poster2 = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Poster-Image-2.png';
    const component1Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp1.png';
    const component2Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp2.png';
    const component3Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp3.png';
    const component4Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp4.png';
    const component5Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp5.png';
    const component6Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp6.png';
    const FusoLogoBefore = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/logo-poster-before.png';
    const FusoLogoAfter = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/logo-poster-after.png';
export default class Ccp2_createHistoryMaintain extends LightningElement {
  @api maintainType;
  @track serviceTypeOptions = [];
  @track serviceFactoryOptions = [];
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
  @track isStep2 = false;
  @track isStep3 = false;
  @track isStep4 = false;
  FusoShop = "https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja&scope=openid&response_type=code&ui_locales=ja";
  poster1 = poster1;
  poster2 = poster2;
  logobefore = FusoLogoBefore;
  logoafter = FusoLogoAfter;
  @track isalluploadedimages = false;
  @track branchList = [];
  @track showBranchlist = false;
  @track photoModal = true;


  @track divforAccountAddress = false;
  @track showMorelist = false;
  @track exitModal = false;
  @track showMore = false;
  @track postCode = "";
  @track municipality = "";
  @track perfecturess = "";

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
    

  vehicleImages = [
        {code:'オイルフィルター', name: '602', imageUrl: component1Image},
        {code:'エアフィルター', name: '601', imageUrl: component2Image},
        {code:'燃料フィルター', name: '603', imageUrl: component3Image},
        {code:'ワイパーブレード', name: '840a', imageUrl: component4Image},
        {code:'ワイパーゴム', name: '840b', imageUrl: component5Image},
        {code:'ベルト', name: '571', imageUrl: component6Image}
     ];


  dropdown = arrowicon;
  nosearch = nosearch;
  @track vehicleDetails = {
    id: 10,
    name: "-",
    type: "-",
    mileage: "",
    vehicleRegDate: "-",
    VehicleExpirationDate: "-",
    chassisnumber:"-",
    siebelAccountCode:"-",
    registrationNumber: "-"
    
  };

  @track maintenanceHistory = {
    Implementation_Date__c: null,
    Ordered_Number__c: null,
    Recieving_Destination__c: null,
    Schedule_Date__c: null,
    Service_Factory__c: null,
    Service_Type__c: null,
    Vehicle__c: null,
    descriptionrichtext: null
  };

  @track showmoreArray = [];

  @track searchArrayaccount = [];

  //image
  @track imageList = [];
  @track uploadedImages = [];
  @track isloadingImages = true;

  @track isCalendarOpen = false;
  @track selectedDate = null;
  @track selectedDateTosend = null;
  @track year = new Date().getFullYear();
  @track month = new Date().getMonth() + 1;
  @track calendarDates = [];
  @track selectedDay; // To track the currently selected day
  @track isNextMonthDisabled = false;
  @track isPrevMonthDisabled = false;

  @api vehId;
  renderedCallback() {
    this.updateMaintenanceHistory();
    try {
      loadStyle(this, homeintro);
      console.log("Error Loaded Successfully ");
    } catch (e) {
        console.error("Error loading styling", e);
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
  }

  disconnectedCallback() {
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
  }

  @wire(getVehicleById, { vehicleId: "$vehId" })
  handleVehData({ data, error }) {
    console.log("data", data);
    if (data) {
      const vehicle = data[0] || {};
      this.vehicleDetails = {
        id: vehicle.Id || "-",
        name: vehicle.Vehicle_Name__c || "-",
        type: vehicle.Vehicle_Type__c || "-",
        chassisnumber:vehicle.Chassis_number__c || "-",
        siebelAccountCode:vehicle.Account__r.siebelAccountCode__c || "-",
        mileage: vehicle.Mileage__c,
        vehicleRegDate:
          this.formatJapaneseDate(
            vehicle.First_Registration_Date__c
          ) || "-",
        VehicleExpirationDate:
          this.formatJapaneseDate(vehicle.Vehicle_Expiration_Date__c) || "-",
        registrationNumber: vehicle.Registration_Number__c || "-"
      };
      if(this.maintainType === "Scheduled"){
        this.showPosterreal = true;
      }else{
        this.showPosterreal = false;
      }
      console.log("vehicledetails", JSON.stringify(this.vehicleDetails));
      console.log("type is here",this.maintainType);
    } else {
      console.log("error from class", error);
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

  connectedCallback() {
    this.populateCalendar();
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.dropdown})`
    );
    // this.template.addEventListener('keydown', this.handleKeyDown2.bind(this));
  }

  formatJapaneseDate(isoDate) {
    if (!isoDate || isNaN(Date.parse(isoDate))) {
      console.error("Invalid date:", isoDate);
      return "-";
    }
    const date = new Date(isoDate);

    // Extract the year, month, and day
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is zero-based
    const day = date.getDate();
    let reiwaYear;
    if (year === 2019) {
      if (month <= 4) {
        return `平成31年${month}月${day}日`;
      } else if (month > 4) {
        return `令和1年${month}月${day}日`;
      }
    } else if (year > 2019) {
      reiwaYear = year - 2018;
      return `令和${reiwaYear}年${month}月${day}日`;
    } else {
      reiwaYear = 30 - (2018 - year);
      return `平成${reiwaYear}年${month}月${day}日`;
    }
  }
  handleScheduleTypeChange(event) {
    this.showerrorScheduleType = false; // Clear error when dropdown is opened
    event.stopPropagation();
    this.showlistScheduleType = !this.showlistScheduleType;
    this.showBranchlist = false;
    this.showlistfactoryType = false;
    this.isCalendarOpen = false;
    this.showMorelist = false;
    this.searchArrayaccount = [];
  }

  handlefactoryTypeChange(event) {
    event.stopPropagation();
    this.destinationAccountBranch = "";
    this.searchKey = "";
    this.showlistfactoryType = !this.showlistfactoryType;
    this.showBranchlist = false;
    this.showlistScheduleType = false;
    this.isCalendarOpen = false;
    console.log("inside factory type");
    this.showMorelist = false;
    this.searchArrayaccount = [];
  }

  handleInsideClick(event) {
    event.stopPropagation();
  }

  handleOutsideClick(event) {
    const isClickInside = this.template
      .querySelector(".dropdown-type")
      .contains(event.target);
    if (!isClickInside) {
      this.showlistScheduleType = false;
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
    const inputField = this.template.querySelector(".InputsScheduleTypeSearch");
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

  handlePickListChange(event) {
    const selectedValue = event.target.dataset.idd;
    this.selectedPicklistScheduleType = selectedValue;
    this.showlistScheduleType = false;
    console.log("this.selected pick", this.selectedPicklistScheduleType);
  }

  handlePickListChangefactory(event) {
    const selectedValue = event.target.dataset.idd;
    this.selectedPicklistfactoryType = selectedValue;
    this.showlistfactoryType = false;
  }

  get ownSelected() {
    return this.selectedPicklistfactoryType === "ふそう/自社 以外";
  }

  handleclick1() {
    if (this.destinationAccountBranch) {
      if (this.destinationNosearch) {
        this.multipleDest = true;
        console.log("inside no search");
      } else {
        this.isStep1 = false;
        this.isStep2 = true;
        this.isStep3 = false;
        this.isStep4 = false;
        window.scrollTo(0, 0);
        this.template
          .querySelector(".listScheduleTypeRec")
          .classList.remove("error-input");
        this.template
          .querySelector(".InputsScheduleTypeSearch")
          .classList.remove("error-input");
      }
    } else {
        if((this.searchAccountError && this.searchKey && !this.destinationAccountBranch) || (!this.searchAccountError && this.searchKey && !this.destinationAccountBranch)){
         console.log('in if.........');
          window.scrollTo(0, 0);
      }else{
        this.isStep1 = false;
          this.isStep2 = true;
          this.isStep3 = false;
          this.isStep4 = false;
          window.scrollTo(0, 0);
      }
    }
  }

  get isError(){
    return (this.destinationNosearch && this.destinationAccountBranch) || this.searchAccountError || (this.destinationNosearch && this.searchKey)
  }

  get reqFields() {
    return (
      !this.selectedPicklistScheduleType ||
      !this.selectedPicklistfactoryType ||
      !this.selectedDateToSend
    );
  }

  handleclick2() {
    console.log("inside clik 2");
    this.updateMaintenanceHistory();
    if(this.selectedPicklistScheduleType === '一般整備'){
        this.showPoster1 = true;
    }else{
        this.showPoster2 = true;
    }
    this.isStep1 = false;
    this.isStep2 = false;
    this.isStep3 = true;
    this.isStep4 = false;
  }
  handleclick3() {
    this.FinalMainLoader = true;
    this.finaldatapush();
  }

  get era() {
    return this.getJapaneseEra(this.year);
  }

  get monthLabel() {
    return this.getMonthLabel(this.month);
  }

  @track myday;
  @track myMonth;
  @track myYear;
 
  openCalendar(event) {
    event.stopPropagation();
    this.isCalendarOpen = !this.isCalendarOpen;
    this.showMyList = true;
    this.showMorelist = false;
    this.searchArrayaccount = [];
    this.showBranchlist = false;
    this.showlistfactoryType = false;
    this.showlistScheduleType = false;
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
    console.log("goback");
    this.dispatchEvent(new CustomEvent("back"));
    console.log("goback2");
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

    if(!this.showPosterreal){
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
    }else{
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
    const prevMonth = new Date(this.year, this.month-1);
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
      if(this.showPosterreal){
        if(!this.isPrevMonthDisabled){
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
      }else{
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
      }else if(this.showPosterreal){
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

  handlebackclick2() {
    this.isStep2 = false;
    this.isStep1 = true;
    this.isStep3 = false;
    this.isStep4 = false;
  }

  handlebackclick3() {
    window.scrollTo(0, 0);
    this.isStep1 = false;
    this.isStep2 = true;
    this.isStep3 = false;
    this.isStep4 = false;
  }

  handleBranchListclick(event) {
    event.stopPropagation();
    this.showBranchlist = !this.showBranchlist;
    this.showlistScheduleType = false;
    this.showlistfactoryType = false;
    this.isCalendarOpen = false;
  }

  handlebranchNameClick(event) {
    this.destinationAccountBranchToShow = event.target.dataset.namee;
    this.destinationAccountBranch = event.target.dataset.idd;
    this.showBranchlist = !this.showBranchlist;
    console.log("this.dessss", this.destinationAccountBranch);
  }

  handleSearchAccount(event) {
    event.stopPropagation();
    this.searchKey = event.target.value;
    if(this.searchKey.length === 0){
      this.searchArrayaccount = [];
      this.showMore = false;
    }
    this.showMyList = false;
    // this.itemClicked = false;
    if (this.searchKey.length >= 1) {
      this.showMorelist = true;
      this.searchClassAccount(this.searchKey) ;     
    } else {
      this.searchaccounts = [];
    }
  }

  handlesearchAccount2(event){
    event.stopPropagation();
    this.divforAccountAddress = false;

    this.searchKey = event.target.value;
    if (this.searchKey.length >= 1) {
      this.searchClassAccount2(this.searchKey);
    }else{
      this.showmoreArray = [];
    }
    
  }


  searchClassAccount(account){
    getSearchAccount({ accSearch: account })
        .then((result) => {
          console.log("data from search para",account);
          console.log("data from search",result);
          console.log("data from search length",result.length);

          this.searchaccounts = result.slice(0,99);
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
            }
          })
          console.log("searchaccounts search length",result.slice(0,99));
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
  searchClassAccount2(account){
    getSearchAccount({ accSearch: account })
        .then((result) => {
          console.log("data from search para",account);
          console.log("data from search",result);
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
          console.log("showmore arrayyyyy",JSON.stringify(this.showmoreArray));
          console.log("searchaccounts search length",result.slice(0,99));
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
    console.log("post mun perft",this.postCode,this.municipality,this.perfecturess);
    this.searchKey = `${accountName} ${this.postCode} ${this.municipality} ${this.perfecturess}`;
    this.searchArrayaccount = [];
    this.itemClicked = true; // Set flag to true when an item is clicked
    this.readonlyaccount = true;
    this.searchAccountError = false;
    this.divforAccountAddress = true;
    this.showMyList = true;
    console.log("desti account", this.destinationAccountBranch);
  }

  handleDestinationType(event) {
    this.destinationNosearch = event.target.value;
    console.log("dest no search", this.destinationNosearch);
  }

  updateMaintenanceHistory() {
    let receivingDestinationBranch = "";
    let receivingDestinationAccount = "";

    // if (this.destinationAccountBranch) {
    //   receivingDestination = this.destinationAccountBranch;
    // } else if (this.destinationNosearch) {
    //   receivingDestination = this.destinationNosearch;
    // }

    if(this.selectedPicklistfactoryType === '自社'){
      receivingDestinationBranch = this.destinationAccountBranch;
    }else if(this.selectedPicklistfactoryType === 'ふそう/自社 以外'){
      receivingDestinationAccount = this.destinationAccountBranch;
    }

    if(!this.showPosterreal){
      this.maintenanceHistory = {
        Implementation_Date__c: this.selectedDateToSend,
        Service_Factory__c: this.selectedPicklistfactoryType,
        Service_Type__c: this.selectedPicklistScheduleType,
        Recieving_Destination_noSearch: this.destinationNosearch,
        Recieving_Destination_Account: receivingDestinationAccount,
        Recieving_Destination_Branch: receivingDestinationBranch,
        Vehicle__c: this.vehId,
        descriptionrichtext: this.richTextVal,
        Maintenance_Type__c:this.maintainType
      };
    }else{
      this.maintenanceHistory = {
        Schedule_Date__c: this.selectedDateToSend,
        Service_Factory__c: this.selectedPicklistfactoryType,
        Service_Type__c: this.selectedPicklistScheduleType,
        Recieving_Destination_noSearch: this.destinationNosearch,
        Recieving_Destination_Account: receivingDestinationAccount,
        Recieving_Destination_Branch: receivingDestinationBranch,
        Vehicle__c: this.vehId,
        descriptionrichtext: this.richTextVal,
        Maintenance_Type__c:this.maintainType
      };
    }
    console.log("main histiry checkkkkkk", JSON.stringify(this.maintenanceHistory));
  }
  //step2

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

  handleRichTextChange(event) {
    this.richTextVal = event.target.value;
  }

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

  // handleFilesChange(event) {
  //     const files = event.target.files;
  //    if(this.imageList.length + files.length > 10){
  //     this.dispatchEvent(
  //         new ShowToastEvent({
  //             // title: 'Error',
  //             message: 'You can upload up to 10 photos',
  //             variant: 'error',
  //         })
  //     );
  //     return;
  //    }

  // for (let i = 0; i < files.length; i++) {
  //     const file = files[i];
  //     console.log("d321",file);

  //     const isDuplicate = this.imageList.some(image => image.name === file.name);
  //     if (isDuplicate) {
  //         this.dispatchEvent(
  //             new ShowToastEvent({
  //                 message: `File with the name "${file.name}" already exists.`,
  //                 variant: 'error',
  //             })
  //         );
  //         continue; // Skip adding this file
  //     }

  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //         const img = new Image();
  //         img.src = reader.result;

  //         img.onload = () => {
  //             let width = img.width;
  //             let height = img.height;

  //             // Check if the image dimensions exceed the limits
  //             if (width > 3200 || height > 2800) {
  //                 // Calculate the new dimensions (scaling down by half)
  //                 width = width / 2;
  //                 height = height / 2;
  //             }

  //             // Create a canvas to resize the image
  //             const canvas = document.createElement('canvas');
  //             canvas.width = width;
  //             canvas.height = height;
  //             const ctx = canvas.getContext('2d');

  //             // Draw the resized image onto the canvas
  //             ctx.drawImage(img, 0, 0, width, height);

  //             // Get the resized image data
  //             const resizedImageData = canvas.toDataURL(file.type);

  //             // Push the image object into the imageList with the resized image data
  //             this.imageList.push({
  //                 id: file.name + i, // Unique ID for the image
  //                 src: resizedImageData,
  //                 name: file.name
  //             });

  //             // Use spread operator to create a new reference for reactivity
  //             this.imageList = [...this.imageList];

  //             console.log("Resized Image:", this.imageList);
  //         };
  //     };

  //     reader.readAsDataURL(file);
  // }
  // }
  // handleRemoveImage(event) {
  //     const imageId = event.target.dataset.id; // Get the ID of the image to remove
  //     this.imageList = this.imageList.filter(image => image.id !== imageId);
  //     this.template.querySelector('input[type="file"]').value = '';
  // }

  handleFilesChange(event) {
    const files = event.target.files;
    const newImages = [];
    this.isalluploadedimages = true;

    if (this.imageList.length + files.length > 10) {
      this.dispatchEvent(
        new ShowToastEvent({
          message: "画像は最大10枚までアップロードできます。",
          variant: "error"
        })
       
      );
      this.isalluploadedimages = false;
      event.stopPropagation();
      this.template.querySelector('input[type="file"]').value = "";
      return;
    }

    // this.isloadingImages = true;

    const fileReadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const isDuplicate = this.uploadedImages.some(image => image.name === file.name);
      console.log("workonduplicate",JSON.stringify(isDuplicate));
        if (isDuplicate) {
            //console.log(`Duplicate file detected: ${file.name}`);
            this.dispatchEvent(
                new ShowToastEvent({
                    message: `${file.name} 同じ名前のファイルがすでに存在します。`,
                    variant: 'error',
                })
            );
            this.isalluploadedimages = false;
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
  // handleRemoveImage(event) {
  //     const imageId = event.target.dataset.id; // Get the ID of the image to remove
  //     this.imageList = this.imageList.filter(image => image.id !== imageId);
  //     this.template.querySelector('input[type="file"]').value = '';
  // }
  handleRemoveImage(event) {
    const recordId = event.target.dataset.id;
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
        });
    } else {
      console.error("Error: No valid record ID found for deletion.");
      this.isalluploadedimages = false;
    }
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

  get RichImg() {
    return this.richTextVal || (this.imageList && this.imageList.length > 0);
  }

  // createContentVersionRecords() {
  //     this.imagesCreatedId = [];
  //     console.log("step1");

  //     // Create an array of promises for each image upload
  //     const uploadPromises = this.imageList.map(image => {
  //         return new Promise((resolve, reject) => {
  //             const fields = {};
  //             console.log("step2");
  //             fields[TITLE_FIELD.fieldApiName] = image.name; // Set the Title
  //             console.log("step3");

  //             // Check if src contains a data URL prefix and extract the Base64 string
  //             const base64String = image.src.includes('base64,') ?
  //                 image.src.split('base64,')[1] :
  //                 image.src;

  //             console.log("step4");

  //             // Ensure the base64String is valid (not too large, etc.)
  //             if (base64String.length > 0 && base64String.length <= 5242880) { // 5 MB limit
  //                 fields[VERSION_DATA_FIELD.fieldApiName] = base64String; // Base64 data of the image
  //                 fields[PATH_ON_CLIENT_FIELD.fieldApiName] = image.name; // Original file name
  //                 console.log("step5");

  //                 // Create the ContentVersion record
  //                 const recordInput = { apiName: CONTENT_VERSION_OBJECT.objectApiName, fields };
  //                 console.log("step5");

  //                 createRecord(recordInput)
  //                     .then((record) => {
  //                         console.log('ContentVersion created:', record.id);
  //                         this.imagesCreatedId.push(record.id);
  //                         resolve(); // Resolve the promise when the record is successfully created
  //                     })
  //                     .catch((error) => {
  //                         console.error('Error creating ContentVersion:', error);
  //                         reject(error); // Reject the promise in case of an error
  //                     });
  //             } else {
  //                 console.error('Invalid Base64 string or exceeds size limit for image:', image.name);
  //                 reject('Invalid Base64 string or size limit exceeded');
  //             }
  //         });
  //     });
  //     Promise.all(uploadPromises)
  //         .then(() => {
  //             console.log('All images uploaded:', this.imagesCreatedId);
  //             this.finaldatapush(); // Call the finalDataPush method after all uploads are done
  //         })
  //         .catch((error) => {
  //             console.error('Error uploading one or more images:', error);
  //         });
  // }
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
                  message: `Error uploading image "${image.name}": ${error}`,
                  variant: "error"
                })
              );
              this.isalluploadedimages = false;
            });
        } else {
          console.error(
            "Invalid Base64 string or exceeds size limit for image:",
            image.name
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


  finaldatapush() {
    const JSONstring = JSON.stringify(this.maintenanceHistory);
    const ImagesJson = JSON.stringify(this.imagesCreatedId);
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
        this.isStep2 = false;
        this.isStep3 = false;
        this.isStep4 = true;
        window.scrollTo(0, 0);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }

  handlegotoVehicleDetails() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      let addBranchUrl = baseUrl.split("/s/")[0] + "/s/vehiclemanagement";
      window.location.href = addBranchUrl;
    }
  }
  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

  get isDisabled() {
    return !this.selectedPicklistfactoryType;
  }

  get selectedDatefun() {
    return !this.selectedDay;
  }

  get searchlistClass() {
    return (this.searchArrayaccount && this.searchArrayaccount.length > 0) || this.searchKey && !this.showMyList
      ? "paddedContainerSearchList"
      : "paddedContainerSearchList empty";
  }

  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    console.log("before",value ," - length",value.length);
    if (value.length > maxLength) {
        event.target.blur();
    }
  }
  handleBeforeInput(event) {
    const maxLength = event.target.maxLength;
    
    const currentValue = event.target.value;
    const inputValue = event.data || ""; 



    if (currentValue.length + inputValue.length > maxLength) {
        event.preventDefault();
    }
}
//   handlevalchange(event) {
//     const maxLength = event.target.maxLength;
//     console.log("maxlength",maxLength);
//     let value = event.target.value;
//     console.log("entering Value",value);
//     const fullWidthCharRegex = /[\uFF01-\uFF60\uFFE0-\uFFE6]/g;

    
//     const fullWidthChars = value.match(fullWidthCharRegex) || [];
//     console.log("full width",fullWidthChars);

//     if (fullWidthChars.length > maxLength) {
//         event.target.value = value.substring(0,maxLength);
//         console.log("changed Value",event.target.value);
//     }
//     // if (value.length > maxLength) {
//     //     event.preventDefault();
        
//     //     value = value.substring(0, maxLength);
//     // }
// }

  get searchKeyPresent() {
    return this.searchKey;
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

  handleConfirmmodal() {
    if (this.isStep4 === true) {
      this.onClose();
    } else {
      this.exitModal = true;
    }
  }

  handleconfirmNo() {
    this.exitModal = false;
  }

  handleKeyDown(event) {
    // Prevent keydown events if an account is selected
    if (this.itemClicked) {
      event.preventDefault(); // Stop any key input (including backspace)
    }
  }
  handleShowMoreCLick(){
    console.log("insdei show more");
    this.searchClassAccount2(this.searchKey);
    console.log("insdei show more2");
    // this.searchAccountError = false;
    // this.showMore=true;
 
}
  handlesearchCancel(){
    this.showMore = false;
  }

  handleNone(){
    this.destinationAccountBranch = "";
    this.destinationAccountBranchToShow = "";
    this.showBranchlist = false;
  }

  handleremoveShowmore(event){
    event.stopPropagation();
    this.showMorelist = false;
  }

  get showmorelength(){
    return this.showmoreArray.length > 0;
  }

  openlink(){
    window.open(this.FusoShop, '_blank');
}
handleImageClick(event) {
    const VinNumber = this.vehicleDetails.chassisnumber;
    const SiebelCode= this.vehicleDetails.siebelAccountCode;
    const imageName = event.currentTarget.dataset.name || event.target.closest('.overlay').dataset.name;
    const stateData = {
        hinmoku: imageName,
        chassisNumber: VinNumber,
        customerID: SiebelCode
    };
    const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja/hinmoku-search`;
    const scope = `&scope=openid offline_access 4d21e801-db95-498f-8cc5-1363af53d834&response_type=code`;
    //const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://shop.mitsubishi-fuso.com/mftbc/ja/Open-Catalogue/c/1`;
    const stateString = encodeURIComponent(JSON.stringify(stateData));
    console.log(stateString);
    const url = `${baseUrl}&state=${stateString}${scope}`;
    console.log("urldev",url);
    window.open(url, '_blank');
}

//   isControlKey(event) {
//     // Allow navigation, backspace, delete, and select-all key commands
//     const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Control', 'Meta', 'Shift', 'Tab'];
//     return controlKeys.includes(event.key) || (event.ctrlKey || event.metaKey);
// }

// handleKeyDown2(event) {
//   const maxLength = 30;
//   const inputField = event.target;
  
//   // Check if input field's value length has reached max length
//   if (inputField.value.length >= maxLength && !this.isControlKey(event)) {
//       event.preventDefault(); // Block any further input
//   }
// }
}
import { LightningElement, wire, track } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getCalenderData from "@salesforce/apex/CCP2_CalendarController.getCalendarDataWeekly";
import labelsVehicle from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import VehicleLeaseAndYearsData from "@salesforce/apex/CCP2_DashboardController.dashBoardLeaseInfo";
import shakenRecall from "@salesforce/apex/CCP2_DashboardController.dashboardShakenRecallData";

const BACKGROUND_IMAGE_PC =
Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

const EmptyRecallDataIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Empty-recall.png";


export default class Ccp2_VehicleDashboard extends LightningElement {
  emptylistofvehicleImage = EmptyRecallDataIcon;
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  @track startDate = new Date();
  @track currentPage = 1;
  @track wiredCalVehResult;
  @track showWeeklyCalendar = false;
  @track vehicleStoredData = [];
  @track currentDates = [];
  @track currentYearMonth;
  @track vehicleNearExpCount = 0;
  @track vehicleNearExpCountToshow = false;
  @track showEmptyUi = false;
  @track totalVeh = 0;
  @track loadcarddata = true;
  @track myVeh = 0;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  @track Allcounts = {
      TotalVehicle: "-",
      ThreeMonthLease:"-",
      OneYearLease: "-",
      TotalLease: "-",
      AllVehicleType: "-",
      LargeVehicles: "-",
      MediumVehicles: "-",
      SmallVehicles: "-",
  };
  @track BranchCountsAll ={
      TotalBranchVehicles: "-",
      daysofexpiry:"-",
      expiryCount: "-",
      recallCount:"-",
      notificationStatus:"-",
      expiredVehiclesArray:[]
    };
  
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
          lwcName: "ccp2_VehicleDashboard",
          errorLog: err,
          methodName: "load labels"
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
    fetch(`${labelsVehicle}/labelsVehicle.json`)
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
        ErrorLog({ lwcName: "ccp2_VehicleDashboard", errorLog: err })
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
  }

  connectedCallback() {
    this.currentDates = this.populateDatesRange(this.startDate, 7);

    this.currentYearMonth = this.formatJapaneseDate(new Date());
    console.log('dates in connectedCakkBack :- ',this.currentDates);
  }

  get startDateObj() {
    console.log(this.startDate.toISOString().split("T")[0]);
    return this.startDate.toISOString().split("T")[0];
  }

  @wire(getCalenderData, {
    uiStartStr: "$startDateObj",
    page: "$currentPage"
  })
  handledata(result) {
    console.log("Calender params:- ", this.currentPage, " ", this.startDateObj);
    this.wiredCalVehResult = result;
    const { data, error } = result;
    if (data) {
      console.log("data of getCalenderData Tem:-", data);
      // this.totalPageCount2 = data.TotalPage;
      this.totalVeh = data.accountTotalVehicle;
      this.myVeh = data.userVehicleCount;

      this.vehicleNearExpCount = data.shakenCount;
      if(this.vehicleNearExpCount === 0){
        this.showEmptyUi = true;
      }
      if(this.vehicleNearExpCount > 4){
        this.vehicleNearExpCount = this.vehicleNearExpCount - 4;
        this.vehicleNearExpCountToshow = true;
      }
      // this.TotalRecallCount = data.vehicleRecallCount;
      this.vehicleStoredData = data.vehicles.map((elm) => {
        const ellipseRegNum = this.substringToProperLength(elm.Registration_Number__c,17);
        console.log("elips",ellipseRegNum);
        let dates = elm?.dates;
        return {
          ...elm,
          dates: dates,
          ellipseRegNum: ellipseRegNum
        };
      });
      this.showWeeklyCalendar = true;


      this.showCalendarLoader = false;
    } else if (error) {
      console.error(
        "Calender error params:- ",
        this.currentPage,
        " ",
        this.startDateObj,
        " ",
        error
      );
       let err = JSON.stringify(error);
      ErrorLog({ lwcName: "ccp2_VehicleDashboard", errorLog: err, methodName: "handledata" })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }
  @wire(VehicleLeaseAndYearsData)
  wiredVehicleData({ error, data }) {
      if (data) {
        this.Allcounts = {
          TotalVehicle: data.TotalVehicle,
          ThreeMonthLease: data.leaseCountThreeMonth,
          OneYearLease: data.leaseCountOneYear,
          TotalLease: data.totalLease,
          AllVehicleType: data.allVehicleType,
          LargeVehicles: data.largeVehicle,
          MediumVehicles: data.mediumVehicle,
          SmallVehicles: data.smallVehicle
        };
        this.loadcarddata = false;
          console.log('Vehicle Lease Data:',JSON.stringify(data)); 
      } else if (error) {
          console.error('Error fetching vehicle lease data:', error);
          ErrorLog({ lwcName: "ccp2_VehicleDashboard", errorLog: err, methodName: "leaseandYearsData" })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
          this.loadcarddata = false;
      }
  }
  @wire(shakenRecall)
  ShakenRecall({ error, data }) {
      if (data) {
        this.BranchCountsAll = {
          TotalBranchVehicles: data.totalVehicle,
          expiryCount: data.exprCount,
          daysofexpiry:data.userNotify,
          recallCount: data.recallVehicle,
          notificationStatus:data.userToggle,
          expiredVehiclesArray: data.exprVehicle.map((vehicle) => ({
            ...vehicle,
            expirationDate: this.formatJapaneseDatelease(vehicle.expirationDate),
            recallCreatedDate: this.formatJapaneseDatelease(vehicle.recallCreatedDate)
        }))
        };
       
          console.log('Vehicle shaken Data:',JSON.stringify(data)); 
          console.log('Vehicle shaken Data array:',JSON.stringify(this.BranchCountsAll.expiredVehiclesArray)); 
      } else if (error) {
          console.error('Error fetching vehicle lease data:', error);
          ErrorLog({ lwcName: "ccp2_VehicleDashboard", errorLog: err, methodName: "shakendata" })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
      }
  }

  formatJapaneseDatelease(isoDate) {
    if (isoDate === undefined) {
        return '';
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }

  populateDatesRange(startDate, days) {
    const dates = [];
    console.log("in populate range!");
    try {
      
        for (let i = 0; i < days; i++) {
          console.log("in populate range!");
          let date = new Date(startDate);
          date.setDate(date.getDate() + i);
          let classForBoxes =
            date.getDay() === 0 || date.getDay() === 6
              ? "Calender-tile-grey"
              : "Calender-tile-white";
              let topLogoCss =
              date.toDateString() === new Date().toDateString()
              ? "active-top-logos"
              : date.getDay() === 0 || date.getDay() === 6
                ? "top-logos-holiday"
                : "top-logos";
          let topDatesCss =
            date.toDateString() === new Date().toDateString()
              ? "active-top-days"
              : date.getDay() === 0 || date.getDay() === 6
                ? "top-days-holiday"
                : "top-days";

          dates.push({
            date: date.getDate(),
            japaneaseDate: this.formatJapaneseDate(date),
            normalDate: date?.toISOString()?.split("T")[0],
            day: this.getDaysJapanese(date.getDay()),
            classForBoxes: classForBoxes,
            topDatesCss: topDatesCss,
            topLogoCss: topLogoCss,
            dateObj: new Date(date)
          });
        }
      
    } catch (e) {
      console.log("in catch", e);
    }
    return dates;
  }

  formatJapaneseDate(isoDate) {
    if (isoDate === undefined) {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (this.showMonthlyCalendar) return `${year}年${month}月${day}日`;

    return `${year}年${month}月`;
  }

  getDaysJapanese(Day) {
    switch (Day) {
      case 0: {
        return "日";
      }
      case 1: {
        return "月";
      }
      case 2: {
        return "火";
      }
      case 3: {
        return "水";
      }
      case 4: {
        return "木";
      }
      case 5: {
        return "金";
      }
      case 6: {
        return "土";
      }
      default: {
        return "日";
      }
    }
  }


  gotoMonthlyCalender() {
    let baseUrl = window.location.href;
    let calLink;
    if (baseUrl.indexOf("/s/") !== -1) {
      calLink = baseUrl.split("/s/")[0] + "/s/vehicle-maintenance-calendar";
    }
    window.location.href = calLink;
  }

  get vehicleCoungreater(){
    console.log("veh count",this.vehicleNearExpCount > 4)
    return this.vehicleNearExpCount > 0
  }

  substringToProperLength(string, limit) {
    let tempString = "";
    let charCount = 0;
 
    for (let i = 0; i < string.length; i++) {
      const char = string.charAt(i);
      const charCode = string.charCodeAt(i);
 
      if (
        (charCode >= 0xff01 && charCode <= 0xff5e) ||
        (charCode >= 0xff61 && charCode <= 0xff9f) ||
        (charCode >= 0x3040 && charCode <= 0x309f) ||
        (charCode >= 0x30a0 && charCode <= 0x30ff) ||
        (charCode >= 0x4e00 && charCode <= 0x9fff)
      ) {
        charCount += 2;
      } else {
        charCount += 1;
      }
 
      if (charCount > limit) {
        break;
      }
      tempString += char;
    }
    return tempString + (charCount >= limit ? "..." : "");
  }

  gotovehicleListLease(){
    let url = `/s/vehiclemanagement?filter=lease`;
    window.location.href = url;
  }
  gotovehicleListYears(){
    let url = `/s/vehiclemanagement?filter=reg_difference`;
    window.location.href = url;
  }
  gotovehicleShakenExpiry(){
    let url = `/s/vehiclemanagement?filter=vehicle_expiry_notification`;
    window.location.href = url;
  }
  gotomaintainvehicle(event){
    let vehid = event.currentTarget.dataset.id;
    let url = `/s/vehiclemanagement?vehicleId=${vehid}&instance=maintenancelist`;
    window.location.href = url;
  }
  gotouserInfo(){
    let url = `/s/profile`;
    window.location.href = url;
  }
}
import { LightningElement, wire, track } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getCalenderData from "@salesforce/apex/CCP2_CalendarController.getCalendarDataWeekly";
import labelsVehicle from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import VehicleLeaseAndYearsData from "@salesforce/apex/CCP2_DashboardController.dashBoardLeaseInfo";
import shakenRecall from "@salesforce/apex/CCP2_DashboardController.dashboardShakenRecallData";
import getHolidayList from "@salesforce/apex/CCP2_CalendarController.getHolidayList";
// import Id from "@salesforce/user/Id";
// import getUserServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";


const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

const EmptyRecallDataIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Empty-recall.png";


export default class Ccp2_VehicleDashboard extends LightningElement {
  emptylistofvehicleImage = EmptyRecallDataIcon;
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  @track startDate = new Date();
  @track currentPage = 1;
  // @track uid = Id;
  // @track allServices = [];
  // @track hasVehicleManagement = true;
  @track wiredCalVehResult;
  @track showWeeklyCalendar = false;
  @track vehicleStoredData = [];
  @track holidaydata = [];
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
    ThreeMonthLease: "-",
    OneYearLease: "-",
    TotalLease: "-",
    AllVehicleType: "-",
    LargeVehicles: "-",
    MediumVehicles: "-",
    SmallVehicles: "-",
  };
  @track BranchCountsAll = {
    TotalBranchVehicles: "-",
    daysofexpiry: "-",
    expiryCount: "-",
    recallCount: "-",
    notificationStatus: "-",
    expiredVehiclesArray: []
  };

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
          lwcName: "ccp2_VehicleDashboard",
          errorLog: err,
          methodName: "load labels",
          ViewName: "Vehicle dashboard",
          InterfaceName: "CCP User Interface",
          EventName: "Loading language",
          ModuleName: "Vehicle dashboard"
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
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_VehicleDashboard",
          errorLog: err,
          methodName: "load labels",
          ViewName: "Vehicle dashboard",
          InterfaceName: "CCP User Interface",
          EventName: "Loading labels",
          ModuleName: "Vehicle dashboard"
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
  }

  connectedCallback() {
    this.fetchHolidayData();
    // this.fetchUserServices();
    this.currentDates = this.populateDatesRange(this.startDate, 7);

    this.currentYearMonth = this.formatJapaneseDate(new Date());
  }

  get startDateObj() {
    return this.startDate.toISOString().split("T")[0];
  }



  fetchHolidayData() {
    return getHolidayList()
      .then(result => {
        this.holidaydata = result.map(item => item.Holiday_Date__c);


        this.currentDates = this.populateDatesRange(this.startDate, 7);
      })
      .catch(error => {
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_VehicleMaintenanceCalendar",
          errorLog: err,
          methodName: "fetchHolidayData",
          ViewName: "Vehicle dashboard",
          InterfaceName: "CCP User Interface",
          EventName: "Fetching holiday data",
          ModuleName: "Vehicle dashboard"
        })
          .then(() => {

          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  // fetchUserServices() {
  //   getUserServices({ userId: this.uid, refresh: 0 })
  //     .then((data) => {
  //       if (data) {
  //         this.allServices = data;
  //         this.allServices.forEach((serv) => {
  //           if (serv.apiName === "FUSO_CCP_External_Vehicle_management") {
  //             this.hasVehicleManagement = serv.isActive;
  //             if (this.hasVehicleManagement === false) {
  //               let baseUrl = window.location.href;
  //               let Newurl;
  //               if (baseUrl.indexOf("/s/") !== -1) {
  //                 Newurl = baseUrl.split("/s/")[0] + "/s/error";
  //               }
  //               window.location.href = Newurl;
  //             }
  //           }
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("User Services Fetching error:", error);
  //     });
  // }

  @wire(getCalenderData, {
    uiStartStr: "$startDateObj",
    page: "$currentPage"
  })
  handledata(result) {
    this.wiredCalVehResult = result;
    const { data, error } = result;
    if (data) {
      // this.totalPageCount2 = data.TotalPage;
      this.totalVeh = data.accountTotalVehicle;
      this.myVeh = data.userVehicleCount;

      this.vehicleNearExpCount = data.shakenCount;
      if (this.vehicleNearExpCount === 0) {
        this.showEmptyUi = true;
      }
      if (this.vehicleNearExpCount > 4) {
        this.vehicleNearExpCount = this.vehicleNearExpCount - 4;
        this.vehicleNearExpCountToshow = true;
      }
      // this.TotalRecallCount = data.vehicleRecallCount;
      this.vehicleStoredData = data.vehicles.map((elm, itr) => {
        const ellipseRegNum = this.substringToProperLength(elm.Registration_Number__c, 16);
        let dates = elm?.dates.map((d, index) => {
          let serviceType = "";

          let classForBoxes = d.classForBoxes;
          if (itr === 0 && index === 0)
            classForBoxes = classForBoxes + " left-radius-top";
          else if (itr === 0 && index === 6)
            classForBoxes = classForBoxes + " rigth-radius-top";

          if (itr === data?.vehicles?.length - 1 && index === 0)
            classForBoxes = classForBoxes + " left-radius-bottom";
          else if (itr === data?.vehicles?.length - 1 && index === 6)
            classForBoxes = classForBoxes + " rigth-radius-bottom";


          let todayDateString = new Date();
          if (d.isStart || d.date === todayDateString.toISOString()?.split("T")[0]) {
            serviceType = d.serviceType;
          }
          return {
            ...d,
            serviceType: serviceType,
            classForBoxes: classForBoxes
          }
        });
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
      ErrorLog({
        lwcName: "ccp2_VehicleDashboard",
        errorLog: err,
        methodName: "handledata",
        ViewName: "Vehicle dashboard",
        InterfaceName: "CCP User Interface",
        EventName: "Fetching vehicle data",
        ModuleName: "Vehicle dashboard"
      })
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
    } else if (error) {
      console.error('Error fetching vehicle lease data:', error);
      ErrorLog({
        lwcName: "ccp2_VehicleDashboard",
        errorLog: err,
        methodName: "leaseandYearsData",
        ViewName: "Vehicle dashboard",
        InterfaceName: "CCP User Interface",
        EventName: "Vehicle data",
        ModuleName: "Vehicle dashboard"
      })
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
      console.log("data recall 1", data);
      this.BranchCountsAll = {
        TotalBranchVehicles: data.totalVehicle,
        expiryCount: data.exprCount,
        daysofexpiry: data.userNotify,
        recallCount: data.recallVehicle,
        notificationStatus: data.userToggle,
        expiredVehiclesArray: data.exprVehicle.map((vehicle) => ({
          ...vehicle,
          expirationDate: this.formatJapaneseDate3(vehicle.expirationDate),
          recallCreatedDate: this.formatJapaneseDatelease(vehicle.recallCreatedDate)
        }))
      };
      console.log("data recall 2", this.BranchCountsAll);
      console.log("data recall 3", JSON.stringify(this.BranchCountsAll));

    } else if (error) {
      console.error('Error fetching vehicle lease data:', error);
      ErrorLog({
        lwcName: "ccp2_VehicleDashboard",
        errorLog: err,
        methodName: "shakendata",
        ViewName: "Vehicle dashboard",
        InterfaceName: "CCP User Interface",
        EventName: "Shaken Recall data",
        ModuleName: "Vehicle dashboard"
      })
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
    try {

      for (let i = 0; i < days; i++) {
        let date = new Date(startDate);
        date.setDate(date.getDate() + i);
        let classForBoxes = "Calender-tile-white";
        // let topLogoCss =
        //   date.toDateString() === new Date().toDateString()
        //     ? "active-top-logos"
        //     : date.getDay() === 0 || date.getDay() === 6
        //       ? "top-logos-holiday"
        //       : "top-logos";
        // let topDatesCss =
        //   date.toDateString() === new Date().toDateString()
        //     ? "active-top-days"
        //     : date.getDay() === 0 || date.getDay() === 6
        //       ? "top-days-holiday"
        //       : "top-days";

        let formattedDate = date.toLocaleDateString("en-CA");

        // let isWeekend = date.getDay() === 0 || date.getDay() === 6;
        let isHoliday = this.holidaydata?.length > 0 && this.holidaydata.includes(formattedDate);
        let topLogoCss =
          date.toDateString() === new Date().toDateString()
            ? "active-top-logos"
            : isHoliday
              ? "top-logos-holiday"
              : "top-logos";
        let topDatesCss =
          date.toDateString() === new Date().toDateString()
            ? "active-top-days"
            : (isHoliday)
              ? "top-days-holiday-red"
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
      console.error("in catch", e);
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

  get vehicleCoungreater() {
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
    return tempString + (charCount > limit ? "..." : "");
  }

  gotovehicleListLease() {
    let url = `/s/vehiclemanagement?filter=lease`;
    window.location.href = url;
  }
  gotovehicleListYears() {
    let url = `/s/vehiclemanagement?filter=reg_difference`;
    window.location.href = url;
  }
  gotovehicleShakenExpiry() {
    let url = `/s/vehiclemanagement?filter=vehicle_expiry_notification`;
    window.location.href = url;
  }
  gotomaintainvehicle(event) {
    let vehid = event.currentTarget.dataset.id;
    let url = `/s/vehiclemanagement?vehicleId=${vehid}&instance=maintenancelist`;
    window.location.href = url;
  }
  gotouserInfo() {
    let url = `/s/profile`;
    window.location.href = url;
  }
  formatJapaneseDate3(isoDate) {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let eraName, eraYear;

    if (year > 2019 || (year === 2019 && month >= 5)) {
      eraName = '令和';
      eraYear = year - 2018;
    } else if (year > 1989 || (year === 1989 && month >= 1)) {
      eraName = '平成';
      eraYear = year - 1988;
    } else if (year > 1926 || (year === 1926 && month >= 12)) {
      eraName = '昭和';
      eraYear = year - 1925;
    } else if (year > 1912 || (year === 1912 && month >= 7)) {
      eraName = '大正';
      eraYear = year - 1911;
    } else if (year > 1868 || (year === 1868 && month >= 1)) {
      eraName = '明治';
      eraYear = year - 1867;
    } else {
      return 'Date is before the Meiji era, which is not supported.';
    }

    if (eraYear === 1) {
      eraYear = '元';
    }

    return `${eraName}${eraYear}年${month}月${day}日`;
  }
}
/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, wire } from "lwc";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getCalenderData3 from "@salesforce/apex/CCP2_Trial.getCalendarData2";
import MAINTENANCE_TYPE from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Type__c";
import MAINTENANCE_FACTORY from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Factory__c";
import VEHICLE_NAME from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Name__c";
import VEHICLE_TYPE from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Type__c";
import branchOptionsApi from "@salesforce/apex/ccp2_download_recall_controller.getBranchSelection";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

export default class Ccp2_TemCalendar extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  @track showMonthlyCalendar = true;
  @track showCalendarLoader = false;
  @track showVehicleModal = false;

  @track currentDates = [];
  @track startDate = new Date();
  @track endDate = new Date();

  @track vehicleStoredData = [];
  @track vehicleAndDatesData = [];
  @track vehicleNearExpCount = 0;
  @track wiredCalVehResult;
  @track maintainenceType = [];
  @track maintainenceFactory = [];
  @track yearPicklistArray = [];
  @track showyearsPickList = false;
  @track OtherArray = [
    { label: "すべて", selected: false },
    { label: "三菱ふそう工場休日を表示", selected: false },
    { label: "車検満了日を表示", selected: false }
  ];
  @track CalenderSwapsmall = false;
  @track colordetailsModal = false;
  @track ColorStrip = "green-strip";
  @track colorHeader = "green-color";

  @track currentPage = 1;

  connectedCallback() {
    // this.endDate.setDate(this.startDate.getDate() + 19);
    this.currentDates = this.populateDatesRange(this.startDate, 20);
    this.populateCalendar();
    document.addEventListener("click", this.handleOutsideClickE);
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClickE);
  }

  //   get endDateObj() {
  //     console.log(this.endDate.toISOString().split("T")[0]);
  //     return this.endDate.toISOString().split("T")[0];
  //   }
  get startDateObj() {
    console.log(this.startDate.toISOString().split("T")[0]);
    return this.startDate.toISOString().split("T")[0];
  }

  @wire(getCalenderData3, {
    uiStartStr: "$startDateObj",
    page: "$currentPage"
  })
  handledata3(result) {
    console.log("refreshed data:- ", result);
    this.wiredCalVehResult = result;
    const { data, error } = result;
    if (data) {
      console.log("this.selectDate for wire", this.startDateObj);
      console.log("data of getCalenderData Tem:-", data);
      this.vehicleNearExpCount = data.expiringVehicleCount;
      this.vehicleStoredData = data.vehicles.map((elm) => {
        let dates = elm?.dates.map((dateElm) => {
          let colorBox = "";
          if (dateElm?.maintenance[0]?.Schedule_Date__c !== null) {
            if (dateElm?.maintenance[0]?.Service_Factory__c === "自社")
              colorBox = "green-box";
            else if (
              dateElm?.maintenance[0]?.Service_Factory__c === "ふそう/自社 以外"
            ) {
              colorBox = "yellow-box";
            }
          }
          return { ...dateElm, cssClass: colorBox };
        });
        return {
          ...elm,
          dates: dates
        };
      });

      console.log(
        "data of getCalenderData after modification:-",
        this.vehicleStoredData
      );
      //   this.combineVehicleMaintainaceData();
      this.yearPicklistArray = this.generateYearMonthArray();
      this.showCalendarLoader = false;
    } else if (error) {
      console.error("Calender error ", error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: MAINTENANCE_TYPE
  })
  wiredServiceTypePicklist({ data, error }) {
    if (data) {
      this.maintainenceType = [
        {
          label: "すべて",
          value: "すべて",
          selected: false
        },
        ...data.values.map((item) => ({
          label: item.label,
          value: item.value,
          selected: false
        }))
      ];
    } else if (error) {
      console.error("serv type", error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: MAINTENANCE_FACTORY
  })
  wiredServiceFactoryPicklist({ data, error }) {
    if (data) {
      this.maintainenceFactory = [
        {
          label: "すべて",
          value: "すべて",
          selected: false
        },
        ...data.values.map((item) => ({
          label: item.label,
          value: item.value,
          selected: false
        }))
      ];
    } else if (error) {
      console.error("serv type", error);
    }
  }

  get jsonParameterForVehicleClass() {
    return JSON.stringify(this.finalFilterJson);
  }
  handleOutsideClickE = (event) => {
    const isClickInside = this.template
      .querySelector(".calendar-popup")
      .contains(event.target);
    if (!isClickInside) {
      this.isCalendarOpen = false;
    }
  };

  get currentStartDate() {
    return this.currentDates[0].japaneaseDate;
  }
  get currentEndDate() {
    if (this.showMonthlyCalendar && !this.showCalendarLoader)
      return this.currentDates[19].japaneaseDate;

    return this.currentDates[11].japaneaseDate;
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

  populateDatesRange(startDate, days) {
    const dates = [];
    console.log("in populate range!");
    try {
      if (this.showMonthlyCalendar === true) {
        for (let i = 0; i < days; i++) {
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
      }
    } catch (e) {
      console.log("in catch", e);
    }
    return dates;
  }

  @track pendingDates = 0;
  @track pendingVehicleDatesId;

  combineVehicleMaintainaceData() {
    // this.vehicleAndDatesData = this.vehicleStoredData.map((elm) => {
    //   //Calender-tile-grey
    //   let vehicle = elm.vehicle;
    //   let temStartDate = new Date(this.startDate);
    //   temStartDate.setDate(temStartDate.getDate() - 1);
    //   console.log("vehicle Next", elm);
    //   temStartDate = temStartDate?.toISOString()?.split("T")[0];
    //   let firstDayEvents = this.isScheduleAvailable(
    //     elm.maintenance,
    //     temStartDate
    //   );
    //   let eventsAvailableList = firstDayEvents;
    //   let isLongestEnded = true;
    //   let longestLength = 0;
    //   this.currentDates = this.currentDates.map((a) => {
    //     const now = new Date();
    //     now.setHours(0, 0, 0, 0);
    //     a?.dateObj.setHours(0, 0, 0, 0);
    //     let isContinue = false;
    //     let countOfMaintance = 0;
    //     let prevEventsAvailableList = eventsAvailableList;
    //     let serviceType = "";
    //     let cssClass = "";
    //     let width = "";
    //     let isMultiple = false;
    //     let isStart = false;
    //     let isEnd = false;
    //     let isMaintenanceAvailable = false;
    //     {
    //       eventsAvailableList = this.isScheduleAvailable(
    //         elm.maintenance,
    //         a.normalDate
    //       );
    //       console.log(a.date)
    //       eventsAvailableList.map((evnt) => {
    //         if (evnt.stDate) {
    //           let schTem = this.isScheduleAvailable(
    //             elm.maintenance,
    //             evnt.stDate
    //           );
    //           let uiStDate = new Date(this.currentDates[0].normalDate);
    //           let uiEndDate = new Date(this.currentDates[19].normalDate);
    //           let eventStDate = new Date(evnt.stDate);
    //           // console.log(
    //           //   'ssssssssssssssssssssss',schTem,'f',firstDayEvents,(schTem.length > 1 && eventsAvailableList.length > 1) && schTem[0].endDate === firstDayEvents[0].endDate
    //           // );
    //           // &&  schTem[0].endDate === firstDayEvents[0].endDate
    //           if (
    //             schTem.length > 1
    //             // && uiStDate <= eventStDate &&
    //             // eventStDate <= uiEndDate
    //           )
    //             isContinue = true;
    //         }
    //         return evnt;
    //       });
    //       // if((firstDayEvents.length && eventsAvailableList.length) && eventsAvailableList[0].endDate !== firstDayEvents[0].endDate){
    //       //   console.log('teeeeeeeee')
    //       //   isContinue = true;
    //       // }
    //       // if (eventsAvailableList.length && isContinue === false) {
    //       //   let stDate = new Date(eventsAvailableList[0].stDate);
    //       //   stDate.setHours(0, 0, 0, 0);
    //       //   let count = (a.dateObj - stDate) / (24 * 60 * 60 * 1000);
    //       //   let temDate = eventsAvailableList[0].stDate;
    //       //   for (let i = 0; i < count; i++) {
    //       //     let schTem = this.isScheduleAvailable(elm.maintenance, temDate);
    //       //     if (schTem.length > 1) {
    //       //       // isContinue = true;
    //       //       break;
    //       //     }
    //       //     // Convert `temDate` to a Date object if it's in string format
    //       //     let dateObj = new Date(temDate);
    //       //     // Increment the date by 1 day
    //       //     dateObj.setDate(dateObj.getDate() + 1);
    //       //     // Convert it back to `YYYY-MM-DD` format
    //       //     temDate = dateObj.toISOString().split("T")[0];
    //       //   }
    //       // }
    //       if (
    //         prevEventsAvailableList.length === 0 ||
    //         prevEventsAvailableList.every((prev) => prev.isEnd === true)
    //       ) {
    //         isContinue = false;
    //       }
    //       isMaintenanceAvailable = eventsAvailableList.length > 0;
    //       if (eventsAvailableList.length) {
    //         isStart = eventsAvailableList[0].isStart;
    //         isEnd = eventsAvailableList[0].isEnd;
    //         isMultiple = eventsAvailableList.length > 1;
    //         // isContinue = eventsAvailableList.length > 1;
    //         countOfMaintance = eventsAvailableList.length;
    //         if (eventsAvailableList[0].factory === "自社") {
    //           cssClass = "blue-box";
    //         } else if (eventsAvailableList[0].factory === "ふそう/自社 以外") {
    //           cssClass = "yellow-box";
    //         } else if (eventsAvailableList[0].factory === "history") {
    //           cssClass = "grey-box";
    //         }
    //         if ((isStart && isEnd) || (isStart && isMultiple)) {
    //           if (eventsAvailableList[0].type === "3か月点検") {
    //             serviceType = "3か月";
    //           } else if (eventsAvailableList[0].type === "一般整備") {
    //             serviceType = "一般";
    //           } else if (eventsAvailableList[0].type === "車検整備") {
    //             serviceType = "車検";
    //           } else if (eventsAvailableList[0].type === "6か月点検") {
    //             serviceType = "6か月";
    //           } else if (eventsAvailableList[0].type === "12か月点検") {
    //             serviceType = "12か月";
    //           } else {
    //             serviceType = "24か月";
    //           }
    //         } else if (isStart) {
    //           serviceType = eventsAvailableList[0].type;
    //         }
    //         if (isStart && isEnd)
    //           width = isStart = "width: calc(" + 100 + "% " + "- 6px);";
    //         else if (isStart)
    //           width = isStart =
    //             "width: calc(" +
    //             100 * 1 +
    //             "% + " +
    //             4 * 1 +
    //             "px - 6px); border-top-right-radius: 0px; border-bottom-right-radius: 0px; z-index:2;";
    //         else if (isEnd)
    //           width =
    //             "width: calc(" +
    //             100 * 1 +
    //             "% + " +
    //             4 * 1 +
    //             "px - 4px); left: 0px; border-top-right-radius: 5px; border-bottom-right-radius: 5px;";
    //         else
    //           width =
    //             "width: calc(" +
    //             100 * 1 +
    //             "% + " +
    //             4 * 1 +
    //             "px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;";
    //         if (isMultiple) {
    //           width = width + "height: calc(50% - 2px); font-size:11px;";
    //         }
    //         if (isContinue === false && isStart && !isEnd) {
    //           let stDate = new Date(eventsAvailableList[0].stDate);
    //           let endDate = new Date(eventsAvailableList[0].endDate);
    //           stDate.setHours(0, 0, 0, 0);
    //           endDate.setHours(0, 0, 0, 0);
    //           let count = (endDate - stDate) / (24 * 60 * 60 * 1000);
    //           isLongestEnded = false;
    //           longestLength = count;
    //         }
    //         else if (
    //           a.date === this.startDate.getDate() &&
    //           isContinue === false &&
    //           eventsAvailableList.length
    //           // && isLongestEnded
    //         ) {
    //           // console.log("first date2", a.date, this.startDate);
    //           let stDate = new Date(this.startDate);
    //           let endDate = new Date(eventsAvailableList[0].endDate);
    //           stDate.setHours(0, 0, 0, 0);
    //           endDate.setHours(0, 0, 0, 0);
    //           let count = (endDate - stDate) / (24 * 60 * 60 * 1000);
    //           isLongestEnded = false;
    //           longestLength = count;
    //         }
    //         else if (isLongestEnded === false) {
    //           longestLength = longestLength - 1;
    //           if (longestLength === 0) isLongestEnded = true;
    //           isContinue = false;
    //         }
    //         // if (
    //         //   a.date === this.startDate.getDate()
    //         //   // && isContinue === true
    //         //   && eventsAvailableList.length
    //         //   // && isLongestEnded
    //         // ) {
    //         //   console.log("first date2", a.date, this.startDate);
    //         //   let stDate = new Date(this.startDate);
    //         //   let endDate = new Date(eventsAvailableList[0].endDate);
    //         //   stDate.setHours(0, 0, 0, 0);
    //         //   endDate.setHours(0, 0, 0, 0);
    //         //   let count = (endDate - stDate) / (24 * 60 * 60 * 1000);
    //         //   isLongestEnded = false;
    //         //   longestLength = count;
    //         // }
    //         if (isContinue) {
    //           isMultiple = false;
    //           countOfMaintance = countOfMaintance + 1;
    //         }
    //       }
    //     }
    //     // else{
    //     //   // eventsAvailableList = this.isScheduleAvailable(
    //     //   //   elm.maintenance,
    //     //   //   a.normalDate,
    //     //   //   'Implementation'
    //     //   // );
    //     //   // isMaintenanceAvailable = eventsAvailableList.length > 0;
    //     // }
    //     return {
    //       ...a,
    //       isMaintenanceAvailable: isMaintenanceAvailable,
    //       serviceType: serviceType,
    //       cssClass: cssClass,
    //       width: width,
    //       countOfMaintance: countOfMaintance - 1,
    //       isStart: isStart,
    //       isMultiple: isMultiple,
    //       isContinue: isContinue
    //       // longestLength: longestLength,
    //       // isLongestEnded: isLongestEnded,
    //     };
    //   });
    //   return {
    //     ...vehicle,
    //     uiDates: this.currentDates,
    //     favIcon: elm.Favoruite_Vehicle__c
    //       ? "utility:favorite"
    //       : "utility:favorite_alt"
    //   };
    // });
  }

  //   isScheduleAvailable(maintanceData, date) {
  //     let listOfMaintanacesForDay = [];
  //     maintanceData.map((elm) => {
  //       if (elm?.maintenanceRecord.Maintenance_Type__c === "Scheduled") {
  //         if (elm.dates.includes(date)) {
  //           listOfMaintanacesForDay.push({
  //             type: elm?.maintenanceRecord.Service_Type__c,
  //             factory: elm?.maintenanceRecord.Service_Factory__c,
  //             stDate: elm?.maintenanceRecord.Schedule_Date__c,
  //             endDate: elm?.maintenanceRecord.Schedule_EndDate__c,
  //             isStart: elm?.maintenanceRecord.Schedule_Date__c === date,
  //             isEnd: elm?.maintenanceRecord.Schedule_EndDate__c === date
  //           });
  //         }
  //       } else {
  //         if (elm.dates.includes(date)) {
  //           listOfMaintanacesForDay.push({
  //             type: elm?.maintenanceRecord.Service_Type__c,
  //             factory: "history",
  //             stDate: elm?.maintenanceRecord.Implementation_Date__c,
  //             endDate: elm?.maintenanceRecord.Implementation_Date__c,
  //             isStart: elm?.maintenanceRecord.Implementation_Date__c === date,
  //             isEnd: elm?.maintenanceRecord.Implementation_Date__c === date
  //           });
  //         }
  //       }
  //       return elm;
  //     });
  //     // console.log(listOfMaintanacesForDay);
  //     return listOfMaintanacesForDay;
  //   }

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

  handleCalendarPrevClick() {
    if (this.showMonthlyCalendar === true) {
      console.log("this.startDate2", this.startDate);
      this.startDate.setDate(this.startDate.getDate() - 20);
      this.currentPage -= 1;

      setTimeout(() => {
        this.currentPage += 1;
      }, 0);

      this.currentDates = this.populateDatesRange(this.startDate, 20);
    }
  }

  handleCalendarNextClick() {
    if (this.showMonthlyCalendar === true) {
      this.startDate.setDate(this.startDate.getDate() + 20);
      console.log("this.startDate1", this.startDate);
      this.currentPage -= 1;

      setTimeout(() => {
        this.currentPage += 1;
      }, 0);
      this.currentDates = this.populateDatesRange(this.startDate, 20);
    }
  }

  handleCalendarResetClick() {
    if (this.showMonthlyCalendar === true) {
      this.startDate = new Date();
      this.currentDates = this.populateDatesRange(this.startDate, 20);
    }
  }

  CalendertoogleMain() {
    this.showCalendarLoader = true;
    this.showMonthlyCalendar = true;
    this.startDate = new Date();
    this.currentDates = this.populateDatesRange(this.startDate, 20);
    this.combineVehicleMaintainaceData();
    this.showCalendarLoader = false;
  }

  // calendertoogleAnnualy() {
  //   this.showCalendarLoader = true;
  //   this.showMonthlyCalendar = false;
  //   this.startDate = new Date();
  //   this.currentDates = this.populateDatesRange(this.startDate, 12);
  //   // this.combineVehicleMaintainaceData();
  //   this.showCalendarLoader = false;
  // }
  //modal of vehicle
  openMaintainVehicleModal() {
    this.showVehicleModal = true;
  }
  closeMaintainVehicleModal() {
    this.showVehicleModal = false;
  }
  calendertooglesmall() {
    this.CalenderSwapsmall = !this.CalenderSwapsmall;
  }
  openColorDetailModal() {
    this.colordetailsModal = true;
  }
  CloseColorDetailModal() {
    this.colordetailsModal = false;
  }
  //picklists
  @track showMaintainTypeSelection = false;
  @track showMaintainFactorySelection = false;
  @track showOthersSelection = false;
  @track showFilterModal = false;
  handleOutsideClickA = (event) => {
    const dataDropElement = this.template.querySelector(".mm-filter-dropdown");
    const listsElement = this.template.querySelector(
      ".mm-filter-dropdown-rows"
    );
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showMaintainTypeSelection = false;
    }
  };
  handleOutsideClickB = (event) => {
    const dataDropElement = this.template.querySelector(
      ".mm-filter-dropdown-2"
    );
    const listsElement = this.template.querySelector(
      ".mm-filter-dropdown-rows-2"
    );
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showMaintainFactorySelection = false;
    }
  };
  handleOutsideClickC = (event) => {
    const dataDropElement = this.template.querySelector(
      ".mm-filter-dropdown-3"
    );
    const listsElement = this.template.querySelector(
      ".mm-filter-dropdown-rows-3"
    );
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showOthersSelection = false;
    }
  };
  handleOutsideClickD = (event) => {
    const dataDropElement = this.template.querySelector(".searchlist");
    const listsElement = this.template.querySelector(".dropdown-item");
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showyearsPickList = false;
    }
  };

  toggleMaintainTypeSelection(event) {
    event.stopPropagation();
    this.showMaintainTypeSelection = !this.showMaintainTypeSelection;
    this.showMaintainFactorySelection = false;
    this.showOthersSelection = false;
  }
  toggleMaintainFactorySelection(event) {
    event.stopPropagation();
    this.showMaintainFactorySelection = !this.showMaintainFactorySelection;
    this.showMaintainTypeSelection = false;
    this.showOthersSelection = false;
  }
  toggleOthersSelection(event) {
    event.stopPropagation();
    this.showOthersSelection = !this.showOthersSelection;
    this.showMaintainTypeSelection = false;
    this.showMaintainFactorySelection = false;
  }
  FilterOpen() {
    this.showFilterModal = true;
    window.scrollTo(0, 0);
    document.body.style.setProperty("overflow", "hidden", "important");
    document.documentElement.style.setProperty(
      "overflow",
      "hidden",
      "important"
    );
  }
  FilterClose() {
    this.showFilterModal = false;
    document.body.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("overflow");
  }

  generateYearMonthArray() {
    const currentDate = new Date();
    const startYear = currentDate.getFullYear() - 2;
    const endYear = currentDate.getFullYear() + 2;
    const months = [...Array(12).keys()].map((m) => m + 1);

    const result = [];
    for (let year = startYear; year <= endYear; year++) {
      months.forEach((month) => {
        result.push({
          label: `${year}年${month}月`,
          value: `${year}-${month}`
        });
      });
    }
    return result;
  }
  toggleYearsDropdown(event) {
    event.stopPropagation();
    this.showyearsPickList = !this.showyearsPickList;
    this.showMaintainTypeSelection = false;
    this.showMaintainFactorySelection = false;
    this.showOthersSelection = false;
  }
  @track maintainvalue;
  handleMaintainTypeSelect(event) {
    event.stopPropagation();
    this.maintainvalue = event.target.value;
  }
  @track showbranchDropdown = false;
  @track branchOptions = [];
  @track vehicleNamesPicklistValues = [];
  @track vehicleTypesPicklistValues = [];
  @track vehicleTypeValue = "";
  @track showVehicleTypeDropdown = false;
  @track showVehicleNameDropdown = false;
  @track vehicleNameValue = "";

  branchOpen(event) {
    event.stopPropagation();
    this.showbranchDropdown = !this.showbranchDropdown;
  }
  @wire(branchOptionsApi)
  branchApiFun(result) {
    const { data, err } = result;
    if (data) {
      this.branchOptions = [
        { branchId: "すべて", branchName: "すべて", selected: false },
        ...data
      ];
      let lengthOfList = 0;
      lengthOfList = this.branchOptions.filter(
        (elm) => elm.selected === true && elm.branchId !== "すべて"
      ).length;
      this.branchesValue = lengthOfList === 0 ? "" : lengthOfList + "件選択中";
    } else if (err) {
      console.error("branchOptionsApi error: - ", err);
    }
  }
  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: VEHICLE_TYPE
  })
  wiredVehicleTypePicklistValues({ error, data }) {
    if (data) {
      this.vehicleTypesPicklistValues = [
        {
          label: "すべて",
          value: "すべて",
          selected: false
        },
        ...data.values.map((item) => ({
          label: item.label,
          value: item.value,
          selected: false
        }))
      ];
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }
  get statusofpills() {
    return this.CalenderPills && this.CalenderPills.length > 0;
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: VEHICLE_NAME
  })
  wiredVehicleNamePicklistValues({ error, data }) {
    if (data) {
      this.vehicleNamesPicklistValues = [
        {
          label: "すべて",
          value: "すべて",
          selected: false
        },
        ...data.values.map((item) => ({
          label: item.label,
          value: item.value,
          selected: false
        }))
      ];
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }
  toggleVehicleType(event) {
    event.stopPropagation();
    this.showVehicleTypeDropdown = !this.showVehicleTypeDropdown;
    this.showVehicleNameDropdown = false;
  }
  toggleVehicleName(event) {
    event.stopPropagation();
    this.showVehicleNameDropdown = !this.showVehicleNameDropdown;
    this.showVehicleTypeDropdown = false;
  }
  @track CalenderPills = [
    // {vehicleName:"Fuso"},
    // {vehicleName:"Volvo"},
    // {vehicleName:"Suzuki"},
    // {vehicleName:"Toyota"},
    // {vehicleName:"Mclaren"}
  ];
  removePill(event) {
    let remove = event.target.dataset.value;
    this.CalenderPills = this.CalenderPills.filter(
      (elm) => elm.vehicleName !== remove
    );
  }
  //calendar
  @track selectedDate = null;
  @track isCalendarOpen = false;
  @track isNextMonthDisabled = false;
  @track isPrevMonthDisabled = false;
  @track year = new Date().getFullYear();
  @track calendarDates = [];
  @track selectedDay;
  @track myday;
  @track month = new Date().getMonth() + 1;
  @track myMonth;
  @track myYear;
  @track showPosterreal = false;
  @track selectedDateTosend = null;

  openCalendar(event) {
    event.stopPropagation();
    this.isCalendarOpen = !this.isCalendarOpen;
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

  handleInsideClick(event) {
    event.stopPropagation();
  }

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

  get monthLabel() {
    return this.getMonthLabel(this.month);
  }

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

  get era() {
    return this.getJapaneseEra(this.year);
  }

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
        // const isDisabled = currentDate > today;
        const isDisabled = false;

        // Check if this date is the previously selected date
        const isSelected = this.selectedDay && this.selectedDay === i;
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
    // this.isNextMonthDisabled = nextMonth > today;
    // this.isPrevMonthDisabled = prevMonth < today;
    // console.log("isnextmonth", this.isNextMonthDisabled);
    // console.log("isPrevMonth", this.isPrevMonthDisabled);
  }

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
  //filter
  @track maintainvalue;
  @track finalVehicleTypeList = [];
  @track finalVehicleFactoryList = [];
  @track finalOthersList = [];
  @track finalBranchList = [];
  @track finalTypeList = [];
  @track finalVehicleNameList = [];
  @track vehicleFactoryValue;
  @track OthersValue;
  @track finalFilterJson = {};
  @track filterselectedJson = {};
  handleMaintainTypeSelect(event) {
    event.stopPropagation();
    const value = event.target.name;
    const isChecked = event.target.checked;

    let lengthOfList = 0;
    if (value === "すべて") {
      this.finalVehicleTypeList = [];
      this.maintainenceType = this.maintainenceType.map((elm) => {
        if (elm.label !== "すべて") {
          this.finalVehicleTypeList.push(elm.label);
        }
        return { ...elm, selected: isChecked };
      });
      if (!isChecked) {
        this.finalVehicleTypeList = [];
      }

      lengthOfList = this.finalVehicleTypeList.length;
    } else {
      this.maintainenceType = this.maintainenceType.map((elm) => {
        if (elm.label === value) {
          return { ...elm, selected: isChecked };
        }
        return elm;
      });
      if (isChecked) {
        if (!this.finalVehicleTypeList.includes(value)) {
          this.finalVehicleTypeList = [...this.finalVehicleTypeList, value];
        }
      } else {
        this.finalVehicleTypeList = this.finalVehicleTypeList.filter(
          (item) => item !== value
        );
      }
      let isAllSelected = this.maintainenceType
        .filter((elm) => elm.label !== "すべて")
        .every((item) => item.selected);
      this.maintainenceType = this.maintainenceType.map((elm) => {
        if (elm.label === "すべて") {
          return { ...elm, selected: isAllSelected };
        }
        return elm;
      });
      lengthOfList = this.maintainenceType.filter(
        (elm) => elm.selected === true && elm.label !== "すべて"
      ).length;
    }

    this.vehicleTypeValue = lengthOfList === 0 ? "" : lengthOfList + "件選択中";
    if (this.vehicleTypeValue.length) {
      this.finalFilterJson = {
        ...this.finalFilterJson,
        serviceType: this.finalVehicleTypeList
      };
      console.log("final", JSON.stringify(this.finalFilterJson));
    } else {
      // eslint-disable-next-line no-unused-vars
      const { finalVehicleTypeList, ...rest } = this.finalFilterJson;
      this.finalFilterJson = rest;
      console.log("final", JSON.stringify(this.finalFilterJson));
    }
  }
  handleMaintainFactorySelect(event) {
    event.stopPropagation();
    const value = event.target.name;
    const isChecked = event.target.checked;

    let lengthOfList = 0;
    if (value === "すべて") {
      this.finalVehicleFactoryList = [];
      this.maintainenceFactory = this.maintainenceFactory.map((elm) => {
        if (elm.label !== "すべて") {
          this.finalVehicleFactoryList.push(elm.label);
        }
        return { ...elm, selected: isChecked };
      });
      if (!isChecked) {
        this.finalVehicleFactoryList = [];
      }

      lengthOfList = this.finalVehicleFactoryList.length;
    } else {
      this.maintainenceFactory = this.maintainenceFactory.map((elm) => {
        if (elm.label === value) {
          return { ...elm, selected: isChecked };
        }
        return elm;
      });
      if (isChecked) {
        if (!this.finalVehicleFactoryList.includes(value)) {
          this.finalVehicleFactoryList = [
            ...this.finalVehicleFactoryList,
            value
          ];
        }
      } else {
        this.finalVehicleFactoryList = this.finalVehicleFactoryList.filter(
          (item) => item !== value
        );
      }
      let isAllSelected = this.maintainenceFactory
        .filter((elm) => elm.label !== "すべて")
        .every((item) => item.selected);
      this.maintainenceFactory = this.maintainenceFactory.map((elm) => {
        if (elm.label === "すべて") {
          return { ...elm, selected: isAllSelected };
        }
        return elm;
      });
      lengthOfList = this.maintainenceFactory.filter(
        (elm) => elm.selected === true && elm.label !== "すべて"
      ).length;
    }

    this.vehicleFactoryValue =
      lengthOfList === 0 ? "" : lengthOfList + "件選択中";
    if (this.vehicleFactoryValue.length) {
      this.finalFilterJson = {
        ...this.finalFilterJson,
        serviceFactory: this.finalVehicleFactoryList
      };
      console.log("final", JSON.stringify(this.finalFilterJson));
    } else {
      // eslint-disable-next-line no-unused-vars
      const { finalVehicleFactoryList, ...rest } = this.finalFilterJson;
      this.finalFilterJson = rest;
      console.log("final", this.finalFilterJson);
    }
  }
  handleOthersSelect(event) {
    event.stopPropagation();
    const value = event.target.name;
    const isChecked = event.target.checked;

    let lengthOfList = 0;
    if (value === "すべて") {
      this.finalOthersList = [];
      this.OtherArray = this.OtherArray.map((elm) => {
        if (elm.label !== "すべて") {
          this.finalOthersList.push(elm.label);
        }
        return { ...elm, selected: isChecked };
      });
      if (!isChecked) {
        this.finalOthersList = [];
      }

      lengthOfList = this.finalOthersList.length;
    } else {
      this.OtherArray = this.OtherArray.map((elm) => {
        if (elm.label === value) {
          return { ...elm, selected: isChecked };
        }
        return elm;
      });
      if (isChecked) {
        if (!this.finalOthersList.includes(value)) {
          this.finalOthersList = [...this.finalOthersList, value];
        }
      } else {
        this.finalOthersList = this.finalOthersList.filter(
          (item) => item !== value
        );
      }
      let isAllSelected = this.OtherArray.filter(
        (elm) => elm.label !== "すべて"
      ).every((item) => item.selected);
      this.OtherArray = this.OtherArray.map((elm) => {
        if (elm.label === "すべて") {
          return { ...elm, selected: isAllSelected };
        }
        return elm;
      });
      lengthOfList = this.OtherArray.filter(
        (elm) => elm.selected === true && elm.label !== "すべて"
      ).length;
    }

    this.OthersValue = lengthOfList === 0 ? "" : lengthOfList + "件選択中";
    if (this.finalOthersList.length) {
      if (this.finalOthersList.includes("三菱ふそう工場休日を表示")) {
        this.finalFilterJson = { ...this.finalFilterJson, fusoHoliday: "true" };
      } else {
        delete this.finalFilterJson.fusoHoliday;
      }

      if (this.finalOthersList.includes("車検満了日を表示")) {
        this.finalFilterJson = {
          ...this.finalFilterJson,
          shakenExpiryDates: "true"
        };
      } else {
        delete this.finalFilterJson.shakenExpiryDates;
      }
      console.log("final", JSON.stringify(this.finalFilterJson));
    } else {
      // eslint-disable-next-line no-unused-vars
      const { finalOthersList, ...rest } = this.finalFilterJson;
      this.finalFilterJson = rest;
      console.log("final", this.finalFilterJson);
    }
  }
  handleBranchSelect(event) {
    event.stopPropagation();
    const value = event.target.name;
    const isChecked = event.target.checked;

    let lengthOfList = 0;
    if (value === "すべて") {
      this.finalBranchList = [];
      this.branchOptions = this.branchOptions.map((elm) => {
        if (elm.branchId !== "すべて") {
          this.finalBranchList.push(elm.branchId);
        }
        return { ...elm, selected: isChecked };
      });
      if (!isChecked) {
        this.finalBranchList = [];
        delete this.filterselectedJson.brnIds;
        console.log(
          "deleted ones all",
          JSON.stringify(this.filterselectedJson)
        );
      }

      lengthOfList = this.finalBranchList.length;
    } else {
      this.branchOptions = this.branchOptions.map((elm) => {
        if (elm.branchId === value) {
          return { ...elm, selected: isChecked };
        }
        return elm;
      });
      if (isChecked) {
        if (!this.finalBranchList.includes(value)) {
          this.finalBranchList = [...this.finalBranchList, value];
        }
      } else {
        this.finalBranchList = this.finalBranchList.filter(
          (item) => item !== value
        );
      }
      let isAllSelected = this.branchOptions
        .filter((elm) => elm.branchId !== "すべて")
        .every((item) => item.selected);
      this.branchOptions = this.branchOptions.map((elm) => {
        if (elm.branchId === "すべて") {
          return { ...elm, selected: isAllSelected };
        }
        return elm;
      });
      lengthOfList = this.branchOptions.filter(
        (elm) => elm.selected === true && elm.branchId !== "すべて"
      ).length;
    }

    this.branchesValue = lengthOfList === 0 ? "" : lengthOfList + "件選択中";

    if (this.finalBranchList.length) {
      this.filterselectedJson = {
        ...this.filterselectedJson,
        brnIds: this.finalBranchList
      };
      console.log("final", JSON.stringify(this.filterselectedJson));
    } else {
      // eslint-disable-next-line no-unused-vars
      const { finalBranchList, ...rest } = this.filterselectedJson;
      this.filterselectedJson = rest;
      console.log("final", this.finalFilterJson);
    }
  }
  handleVehicleTypeSelect(event) {
    const value = event.target.name;
    const isChecked = event.target.checked;

    let lengthOfList = 0;
    if (value === "すべて") {
      this.finalTypeList = [];
      this.vehicleTypesPicklistValues = this.vehicleTypesPicklistValues.map(
        (elm) => {
          if (elm.label !== "すべて") {
            this.finalTypeList.push(elm.label);
          }
          return { ...elm, selected: isChecked };
        }
      );
      if (!isChecked) {
        this.finalTypeList = [];
      }

      lengthOfList = this.finalTypeList.length;
    } else {
      this.vehicleTypesPicklistValues = this.vehicleTypesPicklistValues.map(
        (elm) => {
          if (elm.label === value) {
            return { ...elm, selected: isChecked };
          }
          return elm;
        }
      );
      if (isChecked) {
        if (!this.finalTypeList.includes(value)) {
          this.finalTypeList = [...this.finalTypeList, value];
        }
      } else {
        this.finalTypeList = this.finalTypeList.filter(
          (item) => item !== value
        );
      }
      let isAllSelected = this.vehicleTypesPicklistValues
        .filter((elm) => elm.label !== "すべて")
        .every((item) => item.selected);
      this.vehicleTypesPicklistValues = this.vehicleTypesPicklistValues.map(
        (elm) => {
          if (elm.label === "すべて") {
            return { ...elm, selected: isAllSelected };
          }
          return elm;
        }
      );
      lengthOfList = this.vehicleTypesPicklistValues.filter(
        (elm) => elm.selected === true && elm.label !== "すべて"
      ).length;
    }

    this.vehicleTypeValue = lengthOfList === 0 ? "" : lengthOfList + "件選択中";
    if (this.finalTypeList.length) {
      this.filterselectedJson = {
        ...this.filterselectedJson,
        vehicleType: this.finalTypeList
      };
    } else {
      // eslint-disable-next-line no-unused-vars
      const { finalTypeList, ...rest } = this.filterselectedJson;
      this.filterselectedJson = rest;
    }
  }
  handleVehicleNameSelect(event) {
    event.stopPropagation();
    const value = event.target.name;
    const isChecked = event.target.checked;
    let lengthOfList = 0;
    if (value === "すべて") {
      this.finalVehicleNameList = [];
      this.vehicleNamesPicklistValues = this.vehicleNamesPicklistValues.map(
        (elm) => {
          if (elm.label !== "すべて") {
            this.finalVehicleNameList.push(elm.label);
          }
          return { ...elm, selected: isChecked };
        }
      );
      if (!isChecked) {
        this.finalVehicleNameList = [];
      }

      lengthOfList = this.finalVehicleNameList.length;
    } else {
      this.vehicleNamesPicklistValues = this.vehicleNamesPicklistValues.map(
        (elm) => {
          if (elm.label === value) {
            return { ...elm, selected: isChecked };
          }
          return elm;
        }
      );
      if (isChecked) {
        if (!this.finalVehicleNameList.includes(value)) {
          this.finalVehicleNameList = [...this.finalVehicleNameList, value];
        }
      } else {
        this.finalVehicleNameList = this.finalVehicleNameList.filter(
          (item) => item !== value
        );
      }
      let isAllSelected = this.vehicleNamesPicklistValues
        .filter((elm) => elm.label !== "すべて")
        .every((item) => item.selected);
      this.vehicleNamesPicklistValues = this.vehicleNamesPicklistValues.map(
        (elm) => {
          if (elm.label === "すべて") {
            return { ...elm, selected: isAllSelected };
          }
          return elm;
        }
      );

      lengthOfList = this.vehicleNamesPicklistValues.filter(
        (elm) => elm.selected === true && elm.label !== "すべて"
      ).length;
    }

    this.vehicleNameValue = lengthOfList === 0 ? "" : lengthOfList + "件選択中";
    if (this.finalVehicleNameList.length) {
      this.filterselectedJson = {
        ...this.filterselectedJson,
        vehicleName: this.finalVehicleNameList
      };
    } else {
      // eslint-disable-next-line no-unused-vars
      const { finalVehicleNameList, ...rest } = this.filterselectedJson;
      this.filterselectedJson = rest;
    }
  }
  handleFilterSave() {
    console.log("final", JSON.stringify(this.finalFilterJson));
    Object.keys(this.filterselectedJson).forEach((key) => {
      const selectedValues = this.filterselectedJson[key];
      console.log("q", JSON.stringify(selectedValues));
      if (selectedValues && selectedValues.length > 0) {
        this.finalFilterJson = {
          ...this.finalFilterJson,
          [key]: selectedValues
        };
        console.log("final2", JSON.stringify(this.finalFilterJson));
      } else {
        const { [key]: _, ...remainingFilters } = this.finalFilterJson;
        this.finalFilterJson = remainingFilters;
        console.log("finalREMAINING", JSON.stringify(this.finalFilterJson));
      }
    });
  }
  handleResetofFilter() {
    delete this.finalFilterJson.brnIds;
    delete this.finalFilterJson.vehicleType;
    delete this.finalFilterJson.vehicleName;
    this.finalBranchList = [];
    this.finalTypeList = [];
    this.finalVehicleNameList = [];
  }
}

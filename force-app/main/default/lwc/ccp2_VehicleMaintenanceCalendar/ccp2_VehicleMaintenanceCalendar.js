/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, wire } from "lwc";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
//import getCalenderData from "@salesforce/apex/CCP2_CalendarController.getCalendarData";
import vehicleModalData from "@salesforce/apex/CCP2_VehicleDetailController.vehicleDetail";
import MAINTENANCE_TYPE from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Type__c";
import MAINTENANCE_FACTORY from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Factory__c";
import VEHICLE_NAME from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Name__c";
import VEHICLE_TYPE from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Type__c";
import branchOptionsApi from "@salesforce/apex/ccp2_download_recall_controller.getBranchSelection";
import maintainenceModalData from "@salesforce/apex/CCP2_CalendarController.getMaintenanceByVehicleId";
import getCalenderData from "@salesforce/apex/CCP2_CalendarController.getCalendarDataWithFilter";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const EmptyRecallDataIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Empty-recall.png";

export default class Ccp2_VehicleMaintenanceCalendar extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  emptylistofvehicleImage = EmptyRecallDataIcon;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  @track showMonthlyCalendar = true;
  @track showCalendarLoader = false;
  @track showVehicleModal = false;
  @track vehiclesCount;
  @track FilterMaintainFactoryDot = false;
  @track FilterMaintainTypeDot = false;
  @track FilterOthersDot = false;

  @track currentDates = [];
  @track startDate = new Date();
  @track TotalRecallCount;

  @track vehicleStoredData = [];
  @track vehicleAndDatesData = [];
  @track showModalload = false;

  @track vehicleNearExpCount = 0;
  @track wiredCalVehResult;
  @track maintainenceType = [
    { label: "すべて", value: "すべて", selected: true },
    { label: "一般整備", value: "一般整備", selected: true },
    { label: "車検整備", value: "車検整備", selected: true },
    { label: "3か月点検", value: "3か月点検", selected: true },
    { label: "6か月点検", value: "6か月点検", selected: true },
    { label: "12か月点検", value: "12か月点検", selected: true },
    { label: "24か月点検", value: "24か月点検", selected: true }
  ];
  @track maintainenceFactory = [
    {
      label: "すべて",
      value: "すべて",
      selected: true,
      DivLegend1: false,
      DivLegend2: false
    },
    {
      label: "自社",
      value: "自社",
      selected: true,
      DivLegend1: true,
      DivLegend2: false
    },
    {
      label: "ふそう/自社 以外",
      value: "ふそう/自社 以外",
      selected: true,
      DivLegend2: true,
      DivLegend1: false
    }
  ];
  @track yearPicklistArray = [];
  @track showyearsPickList = false;
  @track OtherArray = [
    { label: "すべて", selected: true },
    { label: "三菱ふそう工場休日を表示", selected: true },
    { label: "車検満了日を表示", selected: true, showIcon: true }
  ];
  @track CalenderSwapsmall = false;
  @track colordetailsModal = false;
  @track ColorStrip = "green-strip";
  @track colorHeader = "green-color";

  @track currentPage = 1;

  @track isLoading = true;

  connectedCallback() {
    const today = new Date();

    // Two years before
    const twoYearsBefore = new Date(today);
    twoYearsBefore.setFullYear(today.getFullYear() - 2);

    // Two years after
    const twoYearsAfter = new Date(today);
    twoYearsAfter.setFullYear(today.getFullYear() + 2);
    twoYearsAfter.setDate(twoYearsAfter.getDate() - 19);
    // Assign values to global variables
    // Current Date
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth() + 1; // Month is 0-indexed
    this.currentDay = today.getDate();

    // Two Years Before
    this.beforeYear = twoYearsBefore.getFullYear();
    this.beforeMonth = twoYearsBefore.getMonth() + 1;
    this.beforeDay = twoYearsBefore.getDate();

    // Two Years After
    this.afterYear = twoYearsAfter.getFullYear();
    this.afterMonth = twoYearsAfter.getMonth() + 1;
    this.afterDay = twoYearsAfter.getDate();

    // Log Results
    this.wiredServiceTypePicklist();
    this.wiredServiceFactoryPicklist();
    this.wiredOtherPicklist();
    this.currentDates = this.populateDatesRange(this.startDate, 20);
    this.populateCalendar();
    this.updatePageButtons();
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClickA);
    document.removeEventListener("click", this.handleOutsideClickB);
    document.removeEventListener("click", this.handleOutsideClickC);
    document.removeEventListener("click", this.handleOutsideClickE);
    document.removeEventListener("click", this.handleOutsideClickF);
    document.removeEventListener("click", this.handleOutsideClickG);
    document.removeEventListener("click", this.handleOutsideClickH);
  }

  renderedCallback() {
    this.updatePageButtons();
    if (!this.outsideClickHandlerAdded1) {
      document.addEventListener("click", this.handleOutsideClickA.bind(this));
      this.outsideClickHandlerAdded1 = true;
    }
    if (!this.outsideClickHandlerAdded2) {
      document.addEventListener("click", this.handleOutsideClickB.bind(this));
      this.outsideClickHandlerAdded2 = true;
    }
    if (!this.outsideClickHandlerAdded3) {
      document.addEventListener("click", this.handleOutsideClickC.bind(this));
      this.outsideClickHandlerAdded3 = true;
    }
    if (!this.outsideClickHandlerAdded4) {
      document.addEventListener("click", this.handleOutsideClickE.bind(this));
      this.outsideClickHandlerAdded4 = true;
    }
    if (!this.outsideClickHandlerAdded5) {
      document.addEventListener("click", this.handleOutsideClickF.bind(this));
      this.outsideClickHandlerAdded5 = true;
    }
    if (!this.outsideClickHandlerAdded6) {
      document.addEventListener("click", this.handleOutsideClickG.bind(this));
      this.outsideClickHandlerAdded6 = true;
    }
    if (!this.outsideClickHandlerAdded7) {
      document.addEventListener("click", this.handleOutsideClickH.bind(this));
      this.outsideClickHandlerAdded7 = true;
    }
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
    }
  }

  @track picklist1Loader = true;
  @track picklist2Loader = true;

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
      });
  }

  getLocale() {
    console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === "en_US") {
      console.log("working1");
      return "en";
    }
    return "jp";
  }

  wiredServiceTypePicklist() {
    let isAllSelected = this.maintainenceType
      .filter((elm) => elm.label !== "すべて")
      .every((item) => item.selected);
    this.maintainenceType = this.maintainenceType.map((elm) => {
      if (elm.label === "すべて") {
        return { ...elm, selected: isAllSelected };
      }
      return elm;
    });
    this.finalVehicleTypeList = [];
    this.maintainenceType.map((elm) => {
      if (elm.label !== "すべて" && elm.selected === true) {
        this.finalVehicleTypeList.push(elm.label);
      }
      return elm;
    });

    this.finalFilterJson = {
      ...this.finalFilterJson,
      serviceType: this.finalVehicleTypeList
    };

    this.picklist1Loader = false;
  }

  wiredServiceFactoryPicklist() {
    let isAllSelected = this.maintainenceFactory
      .filter((elm) => elm.label !== "すべて")
      .every((item) => item.selected);
    this.maintainenceFactory = this.maintainenceFactory.map((elm) => {
      if (elm.label === "すべて") {
        return { ...elm, selected: isAllSelected };
      }
      return elm;
    });
    this.finalVehicleFactoryList = [];
    this.maintainenceFactory.map((elm) => {
      if (elm.label !== "すべて" && elm.selected === true) {
        this.finalVehicleFactoryList.push(elm.label);
      }
      return elm;
    });

    this.finalFilterJson = {
      ...this.finalFilterJson,
      serviceFactory: this.finalVehicleFactoryList
    };

    this.picklist2Loader = false;
  }
  wiredOtherPicklist() {
    this.finalFilterJson = {
      ...this.finalFilterJson,
      fusoHoliday: "true",
      shakenExpiryDates: "true"
    };
  }

  @wire(getCalenderData, {
    uiStartStr: "$startDateObj",
    page: "$currentPage",
    jsonInput: "$jsonParameterForVehicleClass"
  })
  handledata3(result) {
    console.log(
      "Calender params:- ",
      this.jsonParameterForVehicleClass,
      " ",
      this.currentPage,
      " ",
      this.startDateObj
    );
    this.wiredCalVehResult = result;
    const { data, error } = result;
    if (data) {
      console.log("data of getCalenderData Tem:-", data);
      this.totalPageCount2 = data.TotalPage;
      this.vehicleNearExpCount = data.expiringVehicleCount;
      this.vehiclesCount = data.vehicleCount;
      this.TotalRecallCount = data.vehicleRecallCount;
      this.vehicleStoredData = data.vehicles.map((elm) => {
        const ellipseRegNum = this.substringToProperLength(
          elm.Registration_Number__c,
          17
        );
        let dates = elm?.dates.map((dateElm, index) => {
          let serviceType = "";
          let temD = new Date(this.startDate);
          temD.setDate(temD.getDate() + 19);
          temD = temD.toLocaleDateString("en-CA");
          //console.log("temD", temD, dateElm?.date);

          if (
            (index + 1 < 20 && elm.dates[index + 1].isMultiple === true) ||
            (dateElm?.isStart && dateElm?.isEnd) ||
            dateElm?.date === temD
          ) {
            if (dateElm?.serviceType === "3か月点検") {
              serviceType = "3か月";
            } else if (dateElm?.serviceType === "一般整備") {
              serviceType = "一般";
            } else if (dateElm?.serviceType === "車検整備") {
              serviceType = "車検";
            } else if (dateElm?.serviceType === "6か月点検") {
              serviceType = "6か月";
            } else if (dateElm?.serviceType === "12か月点検") {
              serviceType = "12か月";
            } else if (dateElm?.serviceType === "24か月点検") {
              serviceType = "24か月";
            }
          } else if (dateElm?.isStart) {
            serviceType = dateElm?.serviceType;
          }

          return { ...dateElm, serviceType: serviceType };
          // return dateElm;
        });
        return {
          ...elm,
          dates: dates,
          ellipseRegNum: ellipseRegNum
        };
      });

      console.log(
        "data of getCalenderData after modification:-",
        this.vehicleStoredData
      );
      //   this.combineVehicleMaintainaceData();
      this.yearPicklistArray = this.generateYearMonthArray();

      // this.showCalendarLoader = false;
      this.updateVisiblePages();
      this.isLoading = false;
    } else if (error) {
      this.isLoading = false;
      console.error(
        "Calender error params:- ",
        this.jsonParameterForVehicleClass,
        " ",
        this.currentPage,
        " ",
        this.startDateObj,
        error
      );
    }
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

  populateDatesRange(startDate, days) {
    const dates = [];
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
            normalDate: date?.toLocaleDateString("en-CA"),
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

  get hasvehiclesandateItems() {
    return this.vehicleStoredData.length > 0;
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
  get startDateObj() {
    return this.startDate.toLocaleDateString("en-CA");
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
  @track isNormalMonthPrevDisabled = false;
  @track isNormalMonthNextDisabled = false;

  handleCalendarPrevClick() {
    this.isLoading = true;
    let temStDate = new Date(this.startDate);
    temStDate.setHours(0, 0, 0, 0);
    let temEndDate = new Date(temStDate);
    temEndDate.setHours(0, 0, 0, 0);
    temEndDate.setDate(temEndDate.getDate() + 19);
    let nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);
    this.isNormalMonthNextDisabled = false;
    nowDate.setFullYear(nowDate.getFullYear() - 2);

    let temStDateNext = new Date(temStDate);
    temStDateNext.setDate(temStDateNext.getDate() - 20);
    temStDateNext.setHours(0, 0, 0, 0);

    if (nowDate >= temStDateNext) {
      this.isNormalMonthPrevDisabled = true;
    }

    if (
      this.showMonthlyCalendar === true &&
      nowDate <= temStDate &&
      nowDate <= temEndDate
    ) {
      //console.log("this.endate2", this.endDate);
      this.startDate.setDate(this.startDate.getDate() - 20);
      this.currentPage -= 1;

      setTimeout(() => {
        this.currentPage += 1;
      }, 0);

      this.currentDates = this.populateDatesRange(this.startDate, 20);
    }
    console.log(
      "Prev Next: ",
      this.isNormalMonthPrevDisabled,
      this.isNormalMonthNextDisabled
    );
  }

  handleCalendarNextClick() {
    this.isLoading = true;
    let temStDate = new Date(this.startDate);
    temStDate.setHours(0, 0, 0, 0);
    let temEndDate = new Date(temStDate);
    temEndDate.setHours(0, 0, 0, 0);
    temEndDate.setDate(temEndDate.getDate() + 19);
    let nowDate = new Date();
    nowDate.setHours(0, 0, 0, 0);
    this.isNormalMonthPrevDisabled = false;
    nowDate.setFullYear(nowDate.getFullYear() + 2);

    let temStDateNext = new Date(temEndDate);
    temStDateNext.setDate(temStDateNext.getDate() + 40);
    temStDateNext.setHours(0, 0, 0, 0);
    console.log("Next Button: ", temStDate, " ", nowDate, " ", temEndDate);
    if (nowDate <= temStDateNext) {
      this.isNormalMonthNextDisabled = true;
    }
    if (
      this.showMonthlyCalendar === true &&
      nowDate >= temStDate &&
      nowDate >= temEndDate
    ) {
      this.startDate.setDate(this.startDate.getDate() + 20);
      console.log("this.startDate1", this.startDate);
      // console.log("this.endate1", this.endDate, this.currentPage);
      this.currentPage -= 1;

      setTimeout(() => {
        this.currentPage += 1;
      }, 0);
      this.currentDates = this.populateDatesRange(this.startDate, 20);
    }
    console.log(
      "Prev Next: ",
      this.isNormalMonthPrevDisabled,
      this.isNormalMonthNextDisabled
    );
  }

  handleCalendarResetClick() {
    if (this.showMonthlyCalendar === true) {
      this.startDate = new Date();
      this.currentPage -= 1;

      setTimeout(() => {
        this.currentPage += 1;
      }, 0);
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
  // @future
  // calendertoogleAnnualy() {
  //   this.showCalendarLoader = true;
  //   this.showMonthlyCalendar = false;
  //   this.startDate = new Date();
  //   this.currentDates = this.populateDatesRange(this.startDate, 12);
  //   // this.combineVehicleMaintainaceData();
  //   this.showCalendarLoader = false;
  // }
  //modal of vehicle
  closeMVehicleModal() {
    this.showVehicleModal = false;
  }
  calendertooglesmall() {
    this.CalenderSwapsmall = !this.CalenderSwapsmall;
  }
  // openColorDetailModal() {
  //   this.colordetailsModal = true;
  // }
  // CloseColorDetailModal() {
  //   this.colordetailsModal = false;
  // }
  //picklists
  @track showMaintainTypeSelection = false;
  @track showMaintainFactorySelection = false;
  @track showOthersSelection = false;
  @track showFilterModal = false;
  handleOutsideClickA = (event) => {
    const isClickInside = this.template
      .querySelector(".branch-selection-container")
      .contains(event.target);
    if (!isClickInside) {
      this.showMaintainTypeSelection = false;
    }
    // const dataDropElement = this.template.querySelector(".mm-filter-dropdown");
    // const listsElement = this.template.querySelector(
    //   ".mm-filter-dropdown-rows"
    // );
    // if (
    //   dataDropElement &&
    //   !dataDropElement.contains(event.target) &&
    //   listsElement &&
    //   !listsElement.contains(event.target)
    // ) {
    //   this.showMaintainTypeSelection = false;
    // }
  };
  handleOutsideClickB = (event) => {
    // const dataDropElement = this.template.querySelector(
    //   ".mm-filter-dropdown-2"
    // );
    // const listsElement = this.template.querySelector(
    //   ".mm-filter-dropdown-rows-2"
    // );
    // if (
    //   dataDropElement &&
    //   !dataDropElement.contains(event.target) &&
    //   listsElement &&
    //   !listsElement.contains(event.target)
    // ) {
    //   this.showMaintainFactorySelection = false;
    // }
    const isClickInside = this.template
      .querySelector(".branch-selection-container-2")
      .contains(event.target);
    if (!isClickInside) {
      this.showMaintainFactorySelection = false;
    }
  };
  handleOutsideClickC = (event) => {
    // const dataDropElement = this.template.querySelector(
    //   ".mm-filter-dropdown-3"
    // );
    // const listsElement = this.template.querySelector(
    //   ".mm-filter-dropdown-rows-3"
    // );
    // if (
    //   dataDropElement &&
    //   !dataDropElement.contains(event.target) &&
    //   listsElement &&
    //   !listsElement.contains(event.target)
    // ) {
    //   this.showOthersSelection = false;
    // }

    const isClickInside = this.template
      .querySelector(".branch-selection-container-3")
      .contains(event.target);
    if (!isClickInside) {
      this.showOthersSelection = false;
    }
  };
  handleOutsideClickD = (event) => {
    // const dataDropElement = this.template.querySelector(".searchlist");
    // const listsElement = this.template.querySelector(".dropdown-item");
    // if (
    //   dataDropElement &&
    //   !dataDropElement.contains(event.target) &&
    //   listsElement &&
    //   !listsElement.contains(event.target)
    // ) {
    //   this.showyearsPickList = false;
    // }
    const isClickInside = this.template
      .querySelector(".branch-selection-container-3")
      .contains(event.target);
    if (!isClickInside) {
      this.showyearsPickList = false;
    }
  };

  handleOutsideClickF = (event) => {
    const isClickInside = this.template
      .querySelector(".dropdown-container")
      .contains(event.target);
    if (!isClickInside) {
      this.showbranchDropdown = false;
    }
  };

  handleOutsideClickG = (event) => {
    const isClickInside = this.template
      .querySelector(".dropdown-container")
      .contains(event.target);
    if (!isClickInside) {
      this.showVehicleNameDropdown = false;
    }
  };

  handleOutsideClickH = (event) => {
    const isClickInside = this.template
      .querySelector(".dropdown-container")
      .contains(event.target);
    if (!isClickInside) {
      this.showVehicleTypeDropdown = false;
    }
  };

  toggleMaintainTypeSelection(event) {
    event.stopPropagation();
    this.showMaintainTypeSelection = !this.showMaintainTypeSelection;
    this.showMaintainFactorySelection = false;
    this.showOthersSelection = false;
    this.isCalendarOpen = false;
  }
  toggleMaintainFactorySelection(event) {
    event.stopPropagation();
    this.showMaintainFactorySelection = !this.showMaintainFactorySelection;
    this.showMaintainTypeSelection = false;
    this.showOthersSelection = false;
    this.isCalendarOpen = false;
  }
  toggleOthersSelection(event) {
    event.stopPropagation();
    this.showOthersSelection = !this.showOthersSelection;
    this.showMaintainTypeSelection = false;
    this.showMaintainFactorySelection = false;
    this.isCalendarOpen = false;
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
  @track showbranchDropdown = false;
  @track branchOptions = [];
  @track vehicleNamesPicklistValues = [];
  @track vehicleTypesPicklistValues = [];
  @track vehicleTypeValue = "";
  @track showVehicleTypeDropdown = false;
  @track showVehicleNameDropdown = false;
  @track vehicleNameValue = "";
  @track branchOptionsBackup = "";
  @track branchesValueBackup = "";

  branchOpen(event) {
    event.stopPropagation();
    this.showbranchDropdown = !this.showbranchDropdown;
    this.showVehicleNameDropdown = false;
    this.showVehicleNameDropdown = false;
  }
  @wire(branchOptionsApi)
  branchApiFun(result) {
    const { data, err } = result;
    if (data) {
      this.branchOptions = [
        { branchId: "すべて", branchName: "すべて", selected: false },
        ...data
      ];

      this.branchOptions.map((elm)=>{
        if(elm.selected === true && elm.branchId !== "すべて"){
          this.finalBranchList.push(elm.branchId);
        }
        return elm;
      });

      this.branchOptionsBackup = this.branchOptions;
      let lengthOfList = 0;
      lengthOfList = this.branchOptions.filter(
        (elm) => elm.selected === true && elm.branchId !== "すべて"
      ).length;
      this.branchesValue = lengthOfList === 0 ? "" : lengthOfList + "件選択中";
      this.branchesValueBackup = this.branchesValue;
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
    this.showbranchDropdown = false;
  }
  toggleVehicleName(event) {
    event.stopPropagation();
    this.showVehicleNameDropdown = !this.showVehicleNameDropdown;
    this.showVehicleTypeDropdown = false;
    this.showbranchDropdown = false;
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
  @track isNextYearDisabled = false;
  @track isNextMonthDisabledNow = false;

  openCalendar(event) {
    event.stopPropagation();
    this.isCalendarOpen = !this.isCalendarOpen;
    this.showMaintainTypeSelection = false;
    this.showMaintainFactorySelection = false;
    this.showOthersSelection = false;
    this.showFilterModal = false;
    if (this.myDay !== undefined && this.selectedDay !== this.myday) {
      this.selectedDay = this.myday;
    }
    if (this.month !== this.myMonth && this.myMonth !== undefined) {
      this.month = this.myMonth;
    }
    if (this.year !== this.myYear && this.myYear !== undefined) {
      this.year = this.myYear;
    }

    if (this.startDate) {
      this.myYear = this.startDate.getFullYear(); // Correctly gets the full year (e.g., 2024)
      this.myMonth = this.startDate.getMonth() + 1; // Add 1 to convert zero-based month to 1-based
      this.selectedDay = this.startDate.getDate();
    }
    this.month = this.startDate.getMonth() + 1;
    this.year = this.startDate.getFullYear();
    console.log(
      "Calendar Opening Vars: ",
      "this.month",
      this.month,
      "this.year",
      this.year
    );

    let populationNeeded = true;
    if (this.year <= this.beforeYear) {
      this.isYearDisabled = true;
      console.log("this.month this.beforeMonth", this.month, this.beforeMonth);
      if (this.month <= this.beforeMonth) {
        this.populateCalendar(this.year, this.month, this.beforeDay, 0);
        populationNeeded = false;
        this.isMonthDisabled = true;
      } else {
        this.isMonthDisabled = false;
      }
    } else {
      this.isYearDisabled = false;
      this.isMonthDisabled = false;
    }

    if (this.year >= this.afterYear) {
      this.isNextYearDisabled = true;

      if (this.month >= this.afterMonth) {
        this.populateCalendar(this.year, this.month, this.afterDay, 1);
        populationNeeded = false;
        this.isNextMonthDisabledNow = true;
      } else {
        this.isNextMonthDisabledNow = false;
      }
    } else {
      this.isNextYearDisabled = false;
      this.isNextMonthDisabledNow = false;
    }
    if (populationNeeded) this.populateCalendar();

    if (this.selectedDay) {
      const selectedButton = this.template.querySelector(
        `.day-button[data-day="${this.selectedDay}"]`
      );
      if (selectedButton) {
        selectedButton.classList.add("selected");
      }
    }
  }

  handleinsideclick(event) {
    event.stopPropagation();
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

  goToPreviousMonth() {
    if (this.showPosterreal) {
      if (!this.isPrevMonthDisabled) {
        this.month--;

        console.log("no this is what i wnat ", this.month, this.myMonth);
        // this.selectedDay = null;

        if (this.month < 1) {
          this.month = 12;
          this.year--;
          this.isNextYearDisabled = false;
        }
        this.isNextMonthDisabledNow = false;

        // if (this.myMonth === this.month && this.myYear === this.year) {
        //   this.selectedDay = this.myday;
        // }

        //this.selectedDate = null;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button.selected"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove("selected")
        );
        console.log(
          "Years: ",
          this.currentYear,
          this.month,
          this.year,
          this.beforeDay
        );
        if (this.year <= this.beforeYear) {
          this.isYearDisabled = true;
          if (this.month <= this.beforeMonth) {
            this.isMonthDisabled = true;
            this.populateCalendar(this.year, this.month, this.beforeDay, 0);
          } else {
            this.populateCalendar();
          }
        } else {
          this.isYearDisabled = false;
          this.isMonthDisabled = false;
          this.populateCalendar();
        }

        if (this.year >= this.afterYear) {
          this.isNextYearDisabled = true;
          if (this.month >= this.afterMonth) {
            this.isNextMonthDisabledNow = true;
            this.populateCalendar(this.year, this.month, this.afterDay, 1);
          } else {
            this.populateCalendar();
          }
        } else {
          this.populateCalendar();
          this.isNextYearDisabled = false;
          this.isNextMonthDisabledNow = false;
        }
      }
    } else {
      this.month--;

      console.log("no this is what i wnat ", this.month, this.myMonth);
      // this.selectedDay = null;

      if (this.month < 1) {
        this.month = 12;
        this.year--;
        this.isNextYearDisabled = false;
      }
      this.isNextMonthDisabledNow = false;

      // if (this.myMonth === this.month && this.myYear === this.year) {
      //   this.selectedDay = this.myday;
      // }

      //this.selectedDate = null;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button.selected"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected"));
      console.log(
        "Years: ",
        this.currentYear,
        this.month,
        this.year,
        this.beforeDay
      );
      if (this.year <= this.beforeYear) {
        this.isYearDisabled = true;
        if (this.month <= this.beforeMonth) {
          this.isMonthDisabled = true;
          this.populateCalendar(this.year, this.month, this.beforeDay, 0);
        } else this.populateCalendar();
      } else this.populateCalendar();

      // if (this.year >= this.afterYear) {
      //     this.isNextYearDisabled = true;
      //   if (this.month >= this.afterMonth) {

      //       this.populateCalendar(this.year, this.month, this.afterDay, 1);
      //     this.isNextMonthDisabledNow = true;
      //   } else {
      //     this.populateCalendar();
      //   }
      // } else this.populateCalendar();
    }
  }

  goToNextMonth() {
    if (!this.isNextMonthDisabled && !this.showPosterreal) {
      if (this.month >= 12) this.isYearDisabled = false;
      this.month++;
      this.isMonthDisabled = false;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button.selected"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected"));
      // this.selectedDay = null;
      console.log("yes this is what i wnat 1", this.month, this.myMonth);
      if (this.month > 12) {
        this.month = 1;
        this.year++;
      }
      // if (this.myMonth === this.month && this.myYear === this.year) {
      //   console.log("yes this is what i wnat ", this.month, this.myMonth);
      //   this.selectedDay = this.myday;
      //   // this.selectedDate = null;
      // }
      // this.selectedDay = null;
      //this.selectedDate = null;
      if (this.month == this.afterMonth && this.year >= this.afterYear) {
        this.populateCalendar(this.year, this.month, this.afterDay, 1);
        this.isNextMonthDisabledNow = true;
        this.isNextYearDisabled = true;
      } else {
        if (this.year == this.afterYear) this.isNextYearDisabled = true;
        this.populateCalendar();
      }
    } else if (this.showPosterreal) {
      this.month++;
      const selectedButtons = this.template.querySelectorAll(
        ".day-button.selected"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected"));
      // this.selectedDay = null;
      console.log("yes this is what i wnat 1", this.month, this.myMonth);
      if (this.month > 12) {
        this.month = 1;
        this.year++;
      }
      // if (this.myMonth === this.month && this.myYear === this.year) {
      //   console.log("yes this is what i wnat ", this.month, this.myMonth);
      //   this.selectedDay = this.myday;
      //   // this.selectedDate = null;
      // }
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
    this.isMonthDisabled = false;
    this.isYearDisabled = false;
    this.isNextYearDisabled = false;
    this.isNextMonthDisabledNow = false;
    this.month = todayD.getMonth() + 1;
    this.myMonth = todayD.getMonth() + 1;
    this.myday = undefined;
    const inputField = this.template.querySelector(".custom-input");
    inputField.value = "";
    this.selectedDateToSend = null;
    this.isNormalMonthNextDisabled = false;
    this.isNormalMonthPrevDisabled = false;

    // Reset the selected state of all buttons
    const selectedButtons = this.template.querySelectorAll(
      ".day-button.selected"
    );

    selectedButtons.forEach((button) => button.classList.remove("selected"));
    this.populateCalendar();

    this.handleCalendarResetClick();

    this.isCalendarOpen = false;
  }

  populateCalendar(year = -1, month = -1, day = -1, prev = -1) {
    if (year === -1) {
      const today = new Date();
      const firstDayOfMonth = new Date(this.year, this.month - 1, 1).getDay();
      const daysInMonth = new Date(this.year, this.month, 0).getDate();
      this.calendarDates = [];
      this.isNextMonthDisabled = false; // Reset flag for next month
      this.isPrevMonthDisabled = false; // Reset flag for prev month

      // Add empty slots for days before the 1st of the month
      console.log("Current Calendar Date: ", this.month, this.year);
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
          const isSelected =
            this.selectedDay &&
            this.year === this.myYear &&
            this.month === this.myMonth &&
            this.selectedDay === i;

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
          const isSelected =
            this.selectedDay &&
            this.year === this.myYear &&
            this.month === this.myMonth &&
            this.selectedDay === i;
          if (isSelected)
            console.log(
              "True Values 2: ",
              this.selectedDay,
              this.year,
              this.myYear,
              this.month,
              this.myMonth,
              i
            );
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
    } else if (prev === 0) {
      // Second case: Disable dates less than the day in the given year and month
      const currentDate = new Date(year, month - 1, day);
      const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
      const daysInMonth = new Date(year, month, 0).getDate();

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
        const currentDateForDay = new Date(year, month - 1, i);
        const isDisabled = currentDateForDay < currentDate; // Disable dates before the given day

        const isSelected =
          this.selectedDay &&
          this.year === this.myYear &&
          this.month === this.myMonth &&
          this.selectedDay === i;

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
    } else if (prev === 1) {
      let currentDate = new Date(year, month - 1, day);
      // currentDate.setDate(currentDate.getDate() - 20);
      // year = currentDate.getFullYear();
      // month = currentDate.getMonth() + 1;
      // day = currentDate.getDate();
      const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // First day of the month
      const daysInMonth = new Date(year, month, 0).getDate(); // Total number of days in the month

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

      // Loop through all days in the month
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDateForDay = new Date(year, month - 1, i);
        const isDisabled = currentDateForDay > currentDate; // Disable dates greater than the specified day

        const isSelected =
          this.selectedDay &&
          this.year === this.myYear &&
          this.month === this.myMonth &&
          this.selectedDay === i;

        const buttonClass = isDisabled
          ? "day-button filled disabled" // Disable button for dates after the specified day
          : isSelected
            ? "day-button filled selected" // Mark selected date
            : "day-button filled"; // Regular day button

        this.calendarDates.push({
          value: i,
          className: buttonClass,
          isEmpty: false,
          isDisabled
        });
      }
    }
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
    console.log("Selected Day: ", selectedDay);
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

    this.isCalendarOpen = false;
    this.confirmDate();
    console.log("Selected Date in small Calendar: ", this.selectedDate);
  }

  nextYear() {
    this.isMonthDisabled = false;
    this.isYearDisabled = false;
    this.year++;
    if (this.year >= this.afterYear) {
      if (this.month >= this.afterMonth) {
        this.month = this.afterMonth;
        this.populateCalendar(this.year, this.month, this.afterDay, 1);
        this.isNextMonthDisabledNow = true;
      } else this.populateCalendar();
      this.isNextYearDisabled = true;
    } else {
      this.isNextMonthDisabledNow = false;
      this.isNextYearDisabled = false;
      this.populateCalendar();
    }
  }

  @track isMonthDisabled = false;
  @track isYearDisabled = false;

  currentDay;
  currentMonth;
  currentYear;

  beforeDay;
  beforeMonth;
  beforeYear;

  afterDay;
  afterMonth;
  afterYear;
  prevYear() {
    this.isNextMonthDisabledNow = false;
    this.isNextYearDisabled = false;
    this.year--;
    if (this.year <= this.beforeYear) {
      if (this.month <= this.beforeMonth) {
        this.isMonthDisabled = true;
        this.month = this.beforeMonth;
        this.populateCalendar(this.year, this.month, this.beforeDay, 0);
      } else this.populateCalendar();
      this.isYearDisabled = true;
    } else {
      this.isYearDisabled = false;
      this.populateCalendar();
    }
  }

  confirmDate() {
    try {
      this.isLoading = true;
      if (this.selectedDay) {
        // Update the formatted `selectedDate` when confirm is clicked
        this.selectedDate = `${this.year}年${this.month}月${this.selectedDay}日`;
        this.myday = this.selectedDay;
        this.myMonth = this.month;
        this.myYear = this.year;
        let parsedDate = new Date(this.year, this.month - 1, this.selectedDay);
        console.log("Start Date is Before: ", this.startDate);
        this.startDate = parsedDate;
        console.log("Start Date is: ", this.startDate);
        console.log(
          "selectedDay: ",
          this.selectedDay,
          "month: ",
          this.month,
          "year: ",
          this.year
        );

        this.currentDates = this.populateDatesRange(this.startDate, 20);
        const selectedDateToSend = new Date(
          this.year,
          this.month - 1,
          this.selectedDay
        );

        this.selectedDateToSend = this.formatDateToYYYYMMDD(selectedDateToSend);
      }
      this.isCalendarOpen = false;
    } catch (e) {
      console.log("error in confirmDate: ", e);
    }
  }

  isDatesInRange() {
    console.log("In isDatesInRange!:-");
    console.log("start date in this:-", this.startDate);

    let temStDate = new Date(this.startDate);
    temStDate.setHours(0, 0, 0, 0);
    let temEndDate = new Date(temStDate);
    temEndDate.setHours(0, 0, 0, 0);
    temEndDate.setDate(temEndDate.getDate() + 19);

    let prevEndDate = new Date();
    prevEndDate.setHours(0, 0, 0, 0);
    prevEndDate.setFullYear(prevEndDate.getFullYear() - 2);

    let nextEndDate = new Date();
    nextEndDate.setHours(0, 0, 0, 0);
    nextEndDate.setFullYear(nextEndDate.getFullYear() + 2);

    // this.isNormalMonthNextDisabled = false;
    let temStDateNext = new Date(temStDate);
    temStDateNext.setDate(temStDateNext.getDate() - 20);
    temStDateNext.setHours(0, 0, 0, 0);

    if (nowDate >= temStDateNext) {
      this.isNormalMonthPrevDisabled = true;
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
  //filter
  @track maintainvalue;
  @track finalVehicleTypeList = [];
  @track finalVehicleFactoryList = [];
  @track finalOthersList = ["車検満了日を表示", "三菱ふそう工場休日を表示"];
  @track finalBranchList = [];
  @track finalTypeList = [];
  @track finalVehicleNameList = [];
  @track vehicleFactoryValue;
  @track OthersValue;
  @track finalFilterJson = {};
  @track filterselectedJson = {};
  handleMaintainTypeSelect(event) {
    event.stopPropagation();
    this.FilterMaintainTypeDot = true;
    const value = event.target.name;
    const isChecked = event.target.checked;
    this.isLoading = true;
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
        delete this.finalFilterJson.serviceType;
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
      const { serviceType, ...rest } = this.finalFilterJson;
      this.finalFilterJson = rest;
      console.log("final2", JSON.stringify(this.finalFilterJson));
    }
    console.log(
      "JSON Parameter for Vehicle Class: ",
      this.jsonParameterForVehicleClass
    );
  }
  handleMaintainFactorySelect(event) {
    event.stopPropagation();
    this.FilterMaintainFactoryDot = true;
    const value = event.target.name;
    const isChecked = event.target.checked;
    this.isLoading = true;
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
      const { serviceFactory, ...rest } = this.finalFilterJson;
      this.finalFilterJson = rest;
      console.log("final", this.finalFilterJson);
    }
  }
  handleOthersSelect(event) {
    event.stopPropagation();
    this.FilterOthersDot = true;
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
      const { shakenExpiryDates, fusoHoliday, ...rest } = this.finalFilterJson;
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
        this.filterselectedJson = {
          ...this.filterselectedJson,
          brnIds: []
        };
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
      console.log(
        "fina11111111111111111111111l",
        JSON.stringify(this.filterselectedJson)
      );
    } else {
      this.filterselectedJson = {
        ...this.filterselectedJson,
        brnIds: []
      };

      console.log("final22222222222222222222222", this.filterselectedJson);
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
      const { vehicleType, ...rest } = this.filterselectedJson;
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
      const { vehicleName, ...rest } = this.filterselectedJson;
      this.filterselectedJson = rest;
    }
  }
  get jsonParameterForVehicleClassWithoutString() {
    return this.finalFilterJson;
  }
  get isShowVehicleFilterPills() {
    return (
      this.jsonParameterForVehicleClassWithoutString.vehicleName ||
      this.jsonParameterForVehicleClassWithoutString.vehicleType ||
      this.jsonParameterForVehicleClassWithoutString.VehExp
    );
  }
  handleFilterSave() {
    console.log("final filter", JSON.stringify(this.filterselectedJson));
    console.log("final", JSON.stringify(this.finalFilterJson));
    if (Object.keys(this.filterselectedJson).length === 0) {
      const { vehicleType, vehicleName, ...remainingFilters } =
        this.finalFilterJson;
      this.finalFilterJson = remainingFilters;

      this.filterselectedJson = {};
    } else if (this.filterselectedJson?.vehicleName === undefined) {
      const { vehicleName, ...remainingFilters } = this.finalFilterJson;
      this.finalFilterJson = remainingFilters;
      if (this.filterselectedJson?.vehicleName === undefined) {
        let { vehicleName, ...remainingFilters2 } = this.filterselectedJson;
        this.filterselectedJson = remainingFilters2;
      }
    } else if (this.filterselectedJson?.vehicleType === undefined) {
      const { vehicleType, ...remainingFilters } = this.finalFilterJson;
      this.finalFilterJson = remainingFilters;

      if (this.filterselectedJson?.vehicleType === undefined) {
        let { vehicleType, ...remainingFilters2 } = this.filterselectedJson;
        this.filterselectedJson = remainingFilters2;
      }
    }

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
        if (key === "brnIds" && selectedValues.length === 0) {
          this.finalFilterJson = {
            ...this.finalFilterJson,
            [key]: []
          };
        } else {
          const { [key]: _, ...remainingFilters } = this.finalFilterJson;
          this.finalFilterJson = remainingFilters;
          console.log("finalREMAINING", JSON.stringify(this.finalFilterJson));
        }
      }
    });

    this.isLoading = true;
    this.FilterClose();
  }

  handleResetofFilter() {
    this.isLoading = true;
    delete this.finalFilterJson.brnIds;
    delete this.finalFilterJson.vehicleType;
    delete this.finalFilterJson.vehicleName;
    this.filterselectedJson = {};
    this.finalBranchList = [];
    this.finalTypeList = [];
    this.finalVehicleNameList = [];
    this.vehicleNameValue = "";
    this.vehicleTypeValue = "";
    this.vehicleTypesPicklistValues = this.vehicleTypesPicklistValues.map(
      (elm) => {
        return { ...elm, selected: false };
      }
    );
    this.vehicleNamesPicklistValues = this.vehicleNamesPicklistValues.map(
      (elm) => {
        return { ...elm, selected: false };
      }
    );

    this.Expflag = false;

    delete this.finalFilterJson.VehExp;
    const { VehExp, ...rest } = this.finalFilterJson;
    this.finalFilterJson = rest;

    this.branchOptions = this.branchOptionsBackup;
    this.branchesValue = this.branchesValueBackup;
    this.handleCalendarResetClick();
  }

  @track showVehicleModaldouble = false;
  @track vehicleModalobj = {
    RegistrationNumber: "-",
    CarName: "-",
    CarType: "-",
    branches: [],
    vehicleId: "-",
    DoorNumber: "-",
    displaybranches: "-"
  };

  openMaintainVehicleModal(event) {
    let vehid = event.currentTarget.dataset.vehicleId;
    let currdate = event.currentTarget.dataset.id;
    this.vehicleRegNumber = event.currentTarget.dataset.regNo;
    this.showModalload = true;
    this.fetchMaintainModal(vehid, currdate);
    console.log("ids", vehid, currdate);
    this.showVehicleModaldouble = true;
  }
  closeMaintainVehicleModal() {
    this.showVehicleModaldouble = false;
  }
  handleEventWithVehicleId(event) {
    const vehId = event.currentTarget.dataset.id;
    console.log("vehId", vehId);
    this.showModalload = true;
    this.fetchVehicleModalData(vehId);
    this.showVehicleModal = true;
  }
  fetchVehicleModalData(vehId) {
    vehicleModalData({ vehicleId: vehId })
      .then((data) => {
        if (data) {
          //this.vehiclModalData = data;
          console.log("Vehicle Modal Data: ", data);
          this.vehicleModalobj = {
            DoorNumber: data.Door_Number__c || "-",
            RegistrationNumber: data.Registration_Number__c || "-",
            CarName: data.Vehicle_Name__c || "-",
            CarType: data.Vehicle_Type__c || "-",
            vehicleId: data.Id || "-",
            branches: data.Branch_Vehicle_Junctions__r || []
          };
          const branchNames = this.vehicleModalobj.branches.map((branch) => {
            return branch.BranchName__c.length > 10
              ? branch.BranchName__c.slice(0, 6) + "..."
              : branch.BranchName__c;
          });

          if (branchNames.length > 2) {
            this.vehicleModalobj.displaybranches = `${branchNames[0]}・${branchNames[1]}等`;
          } else if (branchNames.length === 2) {
            this.vehicleModalobj.displaybranches = `${branchNames[0]}・${branchNames[1]}`;
          } else if (branchNames.length === 1) {
            this.vehicleModalobj.displaybranches = branchNames[0];
          } else {
            this.vehicleModalobj.displaybranches = "-";
          }
          this.showModalload = false;
        }
      })
      .catch((error) => {
        console.error("Error fetching vehicle modal data: ", error);
      });
  }
  //pagination
  @track showLeftDots2 = false;
  @track visiblePageCount2 = [1];
  @track showRightDots2 = false;
  @track totalPageCount2 = 1;
  @track prevGoing = false;
  @track isPreviousDisabled2 = false;
  @track isNextDisabled2 = false;

  handlePreviousPage2() {
    if (this.currentPage > 1) {
      // refreshApex(this.wiredVehicleResult);
      this.prevGoing = true;
      this.currentPage -= 1;
      this.isPreviousDisabled2 = this.currentPage === 1;
      this.isNextDisabled2 = this.currentPage === this.totalPageCount2;
      this.updatePageButtons();
      this.updateVisiblePages();
    }
  }
  pageCountClick2(event) {
    // refreshApex(this.wiredVehicleResult);
    console.log(event.target.dataset.page);
    this.currentPage = Number(event.target.dataset.page);
    this.updatePageButtons();
    this.updateVisiblePages();
  }

  updatePageButtons() {
    const buttons = this.template.querySelectorAll(".mm-page-button");
    buttons.forEach((button) => {
      const pageNum = Number(button.dataset.page);
      if (pageNum === this.currentPage) {
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
  handleNextPage2() {
    if (this.totalPageCount2 > this.currentPage) {
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
  get refreshpages() {
    return this.updatePageButtons();
  }

  //navigation of modal (vehicle modal )
  gotodetailsPage(event) {
    let vehid = event.currentTarget.dataset.id;
    let url = `/s/vehicle-details?vehicleId=${vehid}`;
    window.location.href = url;
  }
  gotoMaintainencePage(event) {
    let vehid = event.currentTarget.dataset.id;
    let url = `/s/vehicle-details?vehicleId=${vehid}&instance=schedule`;
    window.location.href = url;
  }
  gotoHistoryPage(event) {
    let vehid = event.currentTarget.dataset.id;
    let url = `/s/vehicle-details?vehicleId=${vehid}&instance=history`;
    window.location.href = url;
  }
  gotoMaintainDetail(event) {
    let vehid = event.currentTarget.dataset.id;
    let maintainId = event.currentTarget.dataset.type;
    console.log("de", maintainId);
    let url = `/s/vehicle-details?vehicleId=${vehid}&maintenanceId=${maintainId}&instance=maintenanceDetail`;
    window.location.href = url;
  }

  @track vehiclModalData = [];
  @track maintaincount;
  @track vehicleRegNumber;
  fetchMaintainModal(vehId, clickDateString) {
    maintainenceModalData({ vehicleId: vehId, clickDateStr: clickDateString })
      .then((data) => {
        if (data) {
          console.log("vehicle modal dataaaaaaa e54trhg", data);
          this.vehiclModalData = data.map((vehicle, index) => {
            let colorBox = "";
            let colorStrip = "";
            const isSchedule = vehicle.Maintenance_Type__c === "Scheduled";
            const datetopush = vehicle.Implementation_Date__c
              ? vehicle.Implementation_Date__c
              : vehicle.Schedule_Date__c;
            if (vehicle.Status__c === "Closed") {
              colorStrip = "grey-strip";
              colorBox = "grey-color";
            } else if (vehicle.Service_Factory__c === "ふそう/自社 以外") {
              colorBox = "yellow-color";
              colorStrip = "yellow-strip";
            } else if (vehicle.Service_Factory__c === "自社") {
              colorBox = "green-color";
              colorStrip = "green-strip";
            } else if (vehicle.Service_Factory__c === "ふそう") {
              colorBox = "blue-color";
              colorStrip = "blue-strip";
            }
            return {
              ...vehicle,
              number: index + 1,
              BoxColor: colorBox,
              BoxStrip: colorStrip,
              DateToShow: this.formatJapaneseDate(datetopush),
              isSchedule: isSchedule
            };
          });
          console.log("de11", JSON.stringify(this.vehiclModalData));
          this.maintaincount = data.length || 0;
          console.log("Vehicle maintain Modal Data: ", data);
          this.showModalload = false;
        }
      })
      .catch((error) => {
        console.error("Error fetching vehicle modal data: ", error);
      });
  }
  //@future
  // @track Expflag = false;
  // handleCheckboxChangeForPills(event) {
  //   const value = event.target.value;
  //   if (value === "VehExp") {
  //     this.Expflag = event.target.checked;
  //     if (event.target.checked) {
  //       this.filterselectedJson = {
  //         ...this.filterselectedJson,
  //         [value]: "true"
  //       };
  //     } else {
  //       delete this.filterselectedJson[value];
  //       const { VehExp, ...rest } = this.filterselectedJson;
  //       this.filterselectedJson = rest;
  //     }
  //     console.log("e3331", JSON.stringify(this.filterselectedJson));
  //   }
  // }
  formatJapaneseDate(isoDate) {
    if (isoDate == undefined) {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    //let reiwaYear;
    return `${year}年${month}月${day}日`;
    // const date = new Date(isoDate);
    // const year = date.getFullYear();
    // const month = date.getMonth() + 1;
    // const day = date.getDate();
    // let reiwaYear;
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
  removePillsfilter(event) {
    const key = event.target.dataset.key;
    console.log("key", key);
    const value = event.target.dataset.value;
    console.log("val", value);
    switch (key) {
      case "vehicleName": {
        this.vehicleNamesPicklistValues = this.vehicleNamesPicklistValues.map(
          (elm) => {
            if (elm.label === value) {
              return { ...elm, selected: false };
            } else if (elm.label === "すべて") {
              return { ...elm, selected: false };
            }
            return { ...elm };
          }
        );

        let lengthOfList = this.vehicleNamesPicklistValues.filter(
          (elm) => elm.selected === true && elm.label !== "すべて"
        ).length;

        this.finalVehicleNameList = this.finalVehicleNameList.filter(
          (item) => item !== value
        );

        this.vehicleNameValue =
          lengthOfList === 0 ? "" : lengthOfList + "件選択中";
        break;
      }
      case "vehicleType": {
        this.vehicleTypesPicklistValues = this.vehicleTypesPicklistValues.map(
          (elm) => {
            if (elm.label === value) {
              return { ...elm, selected: false };
            } else if (elm.label === "すべて") {
              return { ...elm, selected: false };
            }
            return { ...elm };
          }
        );

        let lengthOfList2 = this.vehicleTypesPicklistValues.filter(
          (elm) => elm.selected === true && elm.label !== "すべて"
        ).length;

        this.finalTypeList = this.finalTypeList.filter(
          (item) => item !== value
        );

        this.vehicleTypeValue =
          lengthOfList2 === 0 ? "" : lengthOfList2 + "件選択中";
        break;
      }
      default: {
        this.vehicleNameValue = "";
        this.finalVehicleNameList = [];
      }
    }
    this.finalFilterJson[key] = this.finalFilterJson[key].filter(
      (item) => item !== value
    );
    this.filterselectedJson[key] = this.filterselectedJson[key].filter(
      (item) => item !== value
    );
    if (this.finalFilterJson[key]?.length === 0) {
      delete this.finalFilterJson[key];
      delete this.filterselectedJson[key];
      switch (key) {
        case "vehicleName": {
          this.vehicleNameValue = "";
          this.finalVehicleNameList = [];

          this.vehicleNamesPicklistValues = this.vehicleNamesPicklistValues.map(
            (elm) => {
              return { ...elm, selected: false };
            }
          );
          break;
        }
        case "vehicleType": {
          this.vehicleTypeValue = "";
          this.finalTypeList = [];

          this.vehicleTypesPicklistValues = this.vehicleTypesPicklistValues.map(
            (elm) => {
              return { ...elm, selected: false };
            }
          );
          break;
        }
        default: {
          this.vehicleNameValue = "";
          this.finalVehicleNameList = [];
        }
      }
    }
    this.finalFilterJson = { ...this.finalFilterJson };
    this.filterselectedJson = { ...this.filterselectedJson };
  }

  get vehicleCountNo() {
    return this.vehiclesCount > 0;
  }

  get showEmptyUi() {
    return this.vehiclesCount === 0 && this.isLoading === false;
  }
}

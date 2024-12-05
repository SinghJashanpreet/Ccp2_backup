/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, wire } from "lwc";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getCalenderData from "@salesforce/apex/CCP2_CalendarController.getCalendarData";
import MAINTENANCE_TYPE from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Type__c";
import MAINTENANCE_FACTORY from "@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Factory__c";
import VEHICLE_NAME from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Name__c";
import VEHICLE_TYPE from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Type__c";
import branchOptionsApi from "@salesforce/apex/ccp2_download_recall_controller.getBranchSelection";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

export default class Ccp2_VehicleMaintenanceCalendar extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  @track showMonthlyCalendar = true;
  @track showCalendarLoader = false;
  @track showVehicleModal = false;

  @track currentDates = [];
  @track startDate = new Date();

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
    this.currentDates = this.populateDatesRange(this.startDate, 20);
    document.addEventListener("click", this.handleOutsideClickA);
    document.addEventListener("click", this.handleOutsideClickB);
    document.addEventListener("click", this.handleOutsideClickC);
    document.addEventListener("click", this.handleOutsideClickD);
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClickA);
    document.removeEventListener("click", this.handleOutsideClickB);
    document.removeEventListener("click", this.handleOutsideClickC);
    document.removeEventListener("click", this.handleOutsideClickD);
  }

  @wire(getCalenderData, { page: "$currentPage" }) handledata(result) {
    this.wiredCalVehResult = result;
    const { data, error } = result;

    if (data) {
      console.log("data of getCalenderData:-", data);
      this.vehicleNearExpCount = data.expiringVehicleCount;
      this.vehicleStoredData = data.vehicles;
      this.combineVehicleMaintainaceData();
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
      this.maintainenceType = data.values.map((item) => {
        return { label: item.label, value: item.value, selected: false };
      });
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
      this.maintainenceFactory = data.values.map((item) => {
        return { label: item.label, value: item.value, selected: false };
      });
    } else if (error) {
      console.error("serv type", error);
    }
  }

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
    if (this.showMonthlyCalendar === true) {
      for (let i = 0; i < days; i++) {
        let date = new Date(startDate);
        date.setDate(date.getDate() + i);
        let classForBoxes =
          date.getDay() === 0 || date.getDay() === 6
            ? "Calender-tile-grey"
            : "Calender-tile-white";
        // console.log('date = ', date, ' ', new Date() , date.toDateString() === new Date().toDateString(), ' ', date.toDateString() === new Date().toDateString())
        let topLogoCss =
          date.toDateString() === new Date().toDateString()
            ? "active-top-logos "
            : "top-logos";
        let topDatesCss =
          date.toDateString() === new Date().toDateString()
            ? "active-top-days"
            : "top-days";
        dates.push({
          date: date.getDate(),
          japaneaseDate: this.formatJapaneseDate(date),
          normalDate: date?.toISOString()?.split("T")[0],
          day: this.getDaysJapanese(date.getDay()),
          classForBoxes: classForBoxes,
          topDatesCss: topDatesCss,
          topLogoCss: topLogoCss
        });
      }
    } else {
      for (let i = 0; i < days; i++) {
        let date = new Date(startDate);
        date = new Date(
          date.getFullYear(),
          date.getMonth() + i,
          date.getDate()
        );
        let classForBoxes = "Calender-tile-white";
        //   date.getDay() === 0 || date.getDay() === 6
        //     ? "Calender-tile-grey"
        //     : "Calender-tile-white";
        // console.log('date = ', date, ' ', new Date() , date.toDateString() === new Date().toDateString(), ' ', date.toDateString() === new Date().toDateString())
        let topLogoCss =
          date.toDateString() === new Date().toDateString()
            ? "active-top-logos "
            : "top-logos";
        let topDatesCss =
          date.toDateString() === new Date().toDateString()
            ? "active-top-days"
            : "top-days";
        dates.push({
          date: date.getMonth() + 1,
          japaneaseDate: this.formatJapaneseDate(date),
          day: "月",
          normalDate: date?.toISOString()?.split("T")[0],
          classForBoxes: classForBoxes,
          topDatesCss: topDatesCss,
          topLogoCss: topLogoCss
        });
      }
    }
    return dates;
  }

  @track pendingDates = 0;
  @track pendingVehicleDatesId;

  combineVehicleMaintainaceData() {
    this.vehicleAndDatesData = this.vehicleStoredData.map((elm) => {
      //Calender-tile-grey
      let vehicle = elm.vehicle;
      let continues = false;

      console.log(
        "this.pendingDates at top",
        this.pendingDates,
        this.pendingVehicleDatesId,
        vehicle.Id
      );
      if (this.pendingDates > 0 && this.pendingVehicleDatesId === vehicle.Id) {
        continues = true;
      }

      this.currentDates = this.currentDates.map((a) => {
        let isMaintenanceAvailable = false;
        let cssClass = "";
        let serviceType = "";
        let width = "";
        if (this.showMonthlyCalendar) {
          let maintenance = elm.maintenance.map((b) => {
            if (b?.Schedule_Date__c === a.normalDate) {
              isMaintenanceAvailable = true;
              let startDateObj = new Date(b.Schedule_Date__c);
              let endDateObj = new Date(b.Schedule_EndDate__c);
              let uiEndDateEventStartDateDiff =
                (new Date(this.currentDates[19].normalDate) - startDateObj) /
                  (1000 * 60 * 60 * 24) +
                1;

              let numberOfDays = endDateObj
                ? (endDateObj - startDateObj) / (1000 * 60 * 60 * 24) + 1
                : 1;
              if (numberOfDays <= uiEndDateEventStartDateDiff)
                width =
                  "width: calc(" +
                  100 * numberOfDays +
                  "% + " +
                  4 * (numberOfDays - 1) +
                  "px - 6px)";
              else {
                width =
                  "width: calc(" +
                  100 * uiEndDateEventStartDateDiff +
                  "% + " +
                  4 * (uiEndDateEventStartDateDiff - 1) +
                  "px - 6px)";
                this.pendingDates = numberOfDays - uiEndDateEventStartDateDiff;
                this.pendingVehicleDatesId = vehicle.Id;
                console.log("this.pendingDates", this.pendingDates);
              }
              serviceType = b?.Service_Type__c || "";
              cssClass = "grey-box";
            }
            return b;
          });
        }
        return {
          ...a,
          isMaintenanceAvailable: isMaintenanceAvailable,
          serviceType: serviceType,
          cssClass: cssClass,
          width: width,
          continues: continues
        };
      });
      return {
        ...vehicle,
        // maintanceData: maintenance,
        uiDates: this.currentDates,
        favIcon: elm.Favoruite_Vehicle__c
          ? "utility:favorite"
          : "utility:favorite_alt"
      };
    });
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

  handleCalendarPrevClick() {
    if (this.showMonthlyCalendar === true) {
      this.startDate.setDate(this.startDate.getDate() - 20);
      this.currentDates = this.populateDatesRange(this.startDate, 20);
    } else {
      this.startDate = new Date(
        this.startDate.getFullYear() - 1,
        this.startDate.getMonth(),
        this.startDate.getDate()
      );
      this.currentDates = this.populateDatesRange(this.startDate, 12);
    }
    this.combineVehicleMaintainaceData();
  }

  handleCalendarNextClick() {
    if (this.showMonthlyCalendar === true) {
      this.startDate.setDate(this.startDate.getDate() + 20);
      this.currentDates = this.populateDatesRange(this.startDate, 20);
    } else {
      this.startDate = new Date(
        this.startDate.getFullYear() + 1,
        this.startDate.getMonth(),
        this.startDate.getDate()
      );
      this.currentDates = this.populateDatesRange(this.startDate, 12);
    }

    this.combineVehicleMaintainaceData();
  }

  handleCalendarResetClick() {
    if (this.showMonthlyCalendar === true) {
      this.startDate = new Date();
      this.currentDates = this.populateDatesRange(this.startDate, 20);
    } else {
      this.startDate = new Date();
      this.currentDates = this.populateDatesRange(this.startDate, 12);
    }
    this.combineVehicleMaintainaceData();
  }

  CalendertoogleMain() {
    this.showCalendarLoader = true;
    this.showMonthlyCalendar = true;
    this.startDate = new Date();
    this.currentDates = this.populateDatesRange(this.startDate, 20);
    this.combineVehicleMaintainaceData();
    this.showCalendarLoader = false;
  }

  calendertoogleAnnualy() {
    this.showCalendarLoader = true;
    this.showMonthlyCalendar = false;
    this.startDate = new Date();
    this.currentDates = this.populateDatesRange(this.startDate, 12);
    this.combineVehicleMaintainaceData();
    this.showCalendarLoader = false;
  }
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
  handleBranchSelect(event) {
    const branchId = event.target.name;
    const isChecked = event.target.checked;

    if (branchId === "すべて") {
      this.branchOptions = this.branchOptions.map((branch) => {
        return { ...branch, selected: isChecked };
      });
    } else {
      this.branchOptions = this.branchOptions.map((branch) => {
        if (branch.branchId === branchId) {
          return { ...branch, selected: isChecked };
        }
        return { ...branch };
      });

      const allBranchesSelected = this.branchOptions
        .filter((branch) => branch.branchId !== "すべて")
        .every((branch) => branch.selected);

      this.branchOptions = this.branchOptions.map((branch) => {
        if (branch.branchId === "すべて") {
          branch.selected = allBranchesSelected;
        }
        return branch;
      });
    }
  }
  handleVehicleTypeSelect(event) {
    const value = event.target.name;
    const isChecked = event.target.checked;

    let lengthOfList = 0;
    if (value === "すべて") {
      this.finalVehicleTypeList = [];
      this.vehicleTypesPicklistValues = this.vehicleTypesPicklistValues.map(
        (elm) => {
          if (elm.label !== "すべて") {
            this.finalVehicleTypeList.push(elm.label);
          }
          return { ...elm, selected: isChecked };
        }
      );
      if (!isChecked) {
        this.finalVehicleTypeList = [];
      }

      lengthOfList = this.finalVehicleTypeList.length;
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
        if (!this.finalVehicleTypeList.includes(value)) {
          this.finalVehicleTypeList = [...this.finalVehicleTypeList, value];
        }
      } else {
        this.finalVehicleTypeList = this.finalVehicleTypeList.filter(
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
  }
  toggleVehicleType(event) {
    event.stopPropagation();
    this.showVehicleTypeDropdown = !this.showVehicleTypeDropdown;
    this.showVehicleNameDropdown = false;
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
}

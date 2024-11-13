/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, wire } from "lwc";
import getVehicleData from "@salesforce/apex/CCP2_userData.userRegisteredVehicleListtest";
import getAllVehicleForDownload from "@salesforce/apex/ccp2_download_recall_controller.vehicleListforDownload";
import getFilterVehicleForDownload from "@salesforce/apex/ccp2_download_recall_controller.downloadVehicleWithFilter";
import totalPageCountApi from "@salesforce/apex/CCP2_userData.totalPageCount";
import branchOptionsApi from "@salesforce/apex/ccp2_download_recall_controller.getBranchSelection";
import seachVehicleDataApi from "@salesforce/apex/CCP2_VehicleDetailController.vehicleRegistrationNo";
import listBySearchVehicle from "@salesforce/apex/CCP2_VehicleDetailController.getVehicleOnSearch";
import CCP2_Resources from "@salesforce/resourceUrl/CCP2_Resources";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";

import { refreshApex } from "@salesforce/apex";

// delete vehicle apex
import deletevehicleinfomodal from "@salesforce/apex/ccp2_download_recall_controller.vehicleDetails";
import deletesavevehicle from "@salesforce/apex/ccp2_download_recall_controller.deleteAndRecoverVehicle";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import DELETE_STATUS from "@salesforce/schema/ccp2_Registered_Vehicle__c.Status__c";
import DELETE_REASON from "@salesforce/schema/ccp2_Registered_Vehicle__c.Reason__c";
import VEHICLE_NAME from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Name__c";
import VEHICLE_TYPE from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Type__c";

// import updateFavVehicleApi from "@salesforce/apex/CCP2_VehicleDetailController.updateFavVehicle";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import labelsVehicle from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const Filter =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/filter_alt.png";
const Sort = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/sort.png";
const Truckconnect =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/truckConnect.png";
const Deleteveh =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/delete_vehicle.png";
const download =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/file_download.png";
const AddVehicle =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/add_vehicle.png";
const TruckSampleImage =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/TruckSample.png";
const NoVehicleIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/NoVehicles.png";
const EmptyRecallDataIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/Empty-recall.png";

// delete icon
const dropdownImg =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";

export default class Ccp2_VehicleListNew extends LightningElement {
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  filtericon = Filter;
  DelVehIcon = Deleteveh;
  DownloadIcon = download;
  TruckconnectIcon = Truckconnect;
  SortIcon = Sort;
  addvehicleIcon = AddVehicle;
  truckSampleIcon = TruckSampleImage;
  noVehicleIcon = NoVehicleIcon;
  emptylistofvehicleImage = EmptyRecallDataIcon;

  @track emptydataofvehicles = false;
  @track modalStyle = "";
  @track searchDivClass = "search";
  @track searchInputClass = "search-box";
  @track showSearchError = false;

  dropdownImg = dropdownImg;
  vehicleData = [];
  CarModel = [];
  brandModel = [];
  offSetCount = 10;
  @track vehicleListApiData;
  @track isNextDisabled = true;
  @track isPreviousDisabled = true;
  @track showListOffSet = false;
  @track showVehicleListOrNoVehicle = true;
  @track showVehicleList = true;
  @track showVehicleDetails = false;
  @track vehicleId;
  @track favIconForDetailPage;
  @track showVehicleModal = false;
  @track showSpinner = true;
  @track showDownload = false;
  @track showDownloadPath = false;
  @track showSuccessDownload = false;
  @track isStarFilled;
  //today's date
  @track currentDate;

  @track searchVehicleRegDoorData = [];
  @track filteredSearchVehicleRegDoorData = [];
  @track filterSuggestions = "";
  @track filterSuggestionsToSend = "";

  @track showFilteredSuggestions = false;
  @track FilterFlag = false;
  @track AllFlag = true;
  @track DownloadName = "日付- カスタマーポータル車両リスト.csv";
  @track allVehiclesData = [];
  @track filterData = [];
  @track searchFilter = false;
  @track showonclickofmorefilter = false;

  // Pagination variables
  @track currentPagination = 10;
  @track totalPageForPagination = 5;
  @track totalPageCount = 1;
  @track currentPage = 1;
  @track showLeftDots = false;
  @track showRightDots = false;
  @track pageNumberCss = "page-button";
  @track currentPageNumberCss = "page-button cuurent-page";
  @track visiblePageCount = [1];
  @track prevGoing = false;
  @track TotalPageApiData;
  //filter modal variables
  @track showFilterModal = false;
  @track pinnedFilter = false;
  showVehicleNameDropdown = false;
  @track vehicleNameValue = "";
  finalVehicleNameList = [];
  showVehicleTypeDropdown = false;
  @track vehicleTypeValue = "";
  finalVehicleTypeList = [];
  @track deletedFlag = false;
  @track truckOnnectFlag = false;
  @track recallflag = false;
  @track showSortingModal = false;
  @track sortChecked = {
    RegDesc: false,
    RegAsc: false,
    ExpDesc: false,
    ExpAsc: false,
    MilDesc: false,
    MilAsc: false
  };
  @track sortSelectedValue = "Default";
  @track finalsortingValue = "Default";
  @track rangeOneValueSlider1 = 0;
  @track rangeTwoValueSlider1 = 100;
  @track rangeOneValueSlider2 = 0;
  @track rangeTwoValueSlider2 = 100;
  @track rangeOneValueSlider3 = 0;
  @track rangeTwoValueSlider3 = 100;
  @track rangeClass1 = "incl-range";
  @track rangeClass2 = "incl-range";
  @track rangeClass3 = "incl-range";

  isRangeDisabled1 = false;
  isRangeDisabled2 = false;
  isRangeDisabled3 = false;

  minValue = 0;
  maxValue = 100;

  // Define the cases for sliders with corresponding multipliers and steps
  sliderConfigs = {
    Slider1: {
      multiplier: 10000,
      step: 5
    },
    Slider2: {
      multiplier: 0.12,
      step: 8.33333333333
    },
    Slider3: {
      multiplier: 0.15,
      step: 6.66666666666
    }
  };

  // Track the individual values for each slider range in decimal
  rangeValues = {
    Slider1: { lower: 0.0, upper: 0.0 },
    Slider2: { lower: 0.0, upper: 0.0 },
    Slider3: { lower: 0.0, upper: 0.0 }
  };

  @track vehicleNamesPicklistValues;
  @track vehicleTypesPicklistValues;
  @track slider1check = false;
  @track slider2check = false;
  @track slider3check = false;

  vehicleBrachCount = 0;
  vehicleAccountCount = 0;
  @track ownedVehicleCount = 0;

  //TO STOP PAGINATION
  @track stopPaginationsearch = false;
  @track forcestopPagination = false;

  // delete variablesss
  @track currentlyOwnedVehiclesOnPage = [];
  @track totalbranchcountDel = "";
  @track showSelectAllButton = true;
  @track showDeselectAllButton = false;
  @track pageSelectionState = {};
  deletecheckboxoverfav = false;
  selectedVehiclesByPage = new Map();
  deletebuttonsall = false;
  @track deletestatus = false;
  @track cancelmodaldeletevehicle = false;
  @track currentlyown = true;
  @track deleteselectedVehicleIds = [];
  @track selectedVehicleStates = {};
  @track selectedall = false;
  @track isComplete = false;
  @track isSaveddelete = false;
  @track BranchesModal = false;
  @track isdeleteModalOpen = false;
  @track completeconfirmModal = false;
  @track openconfmodaldelete = false;
  @track currentPagedelete = 1;
  @track deletevehiclesPerPage = 1;
  @track vehicleDatadelete = [];
  @track formattedVehicles = [];
  @track statusArray = [];
  @track deletedvehiclerasondata = {};
  @track pageData = {};
  @track currentVehicledelete;
  @track isPrevDisableddelete = true;
  @track isNextDisableddelete = false;
  @track totalVehiclesdelete = 0;
  @track currentPageDisplaydelete = 1;
  @track currentPageClassdelete = "page-button";
  @track opendeletesystem = false;
  @track vehgoesdeletion = false;
  @track vehicledeletedescription = false;
  @track ShowStatusList = false;
  @track showModalsmall = false;
  @track showreasonofdeletelist = false;
  @track outsideClickHandlerAdded = false;
  @track allselectedDeleted = true;
  @track SelectedStatus = "保有中";
  @track selectedReason = "";
  @track deletedescription = "";
  @track StatusOptions = [];
  @track reasonOptions = [];
  @track showBranchSelection = false;
  @track branchOptions;
  @track branchDataToSendBack;

  finalFilterJson = {};
  @track finalFilterJsonForClass = {};

  //truckonnet URL
  truckonnetURL = "https://qa.truckonnect.jp";
  

  get jsonParameterForVehicleClass() {
    return JSON.stringify(this.finalFilterJsonForClass);
  }

  get jsonParameterForVehicleClassWithoutString() {
    return this.finalFilterJsonForClass;
  }

  get isMilageAbove() {
    return this.jsonParameterForVehicleClassWithoutString.Milage[1] === 1000001;
  }
  get isExpDiffAbove() {
    return this.jsonParameterForVehicleClassWithoutString.ExpDiff[1] === 13;
  }
  get isRegDiffAbove() {
    return this.jsonParameterForVehicleClassWithoutString.RegDiff[1] === 16;
  }

  get milageMin() {
    return this.jsonParameterForVehicleClassWithoutString.Milage[0];
  }

  get milageMax() {
    return this.jsonParameterForVehicleClassWithoutString.Milage[1] === 1000001
      ? 1000000
      : this.jsonParameterForVehicleClassWithoutString.Milage[1];
  }
  get expMin() {
    return this.jsonParameterForVehicleClassWithoutString.ExpDiff[0];
  }

  get expMax() {
    return this.jsonParameterForVehicleClassWithoutString.ExpDiff[1] === 13
      ? 12
      : this.jsonParameterForVehicleClassWithoutString.ExpDiff[1];
  }
  get regMin() {
    return this.jsonParameterForVehicleClassWithoutString.RegDiff[0];
  }

  get regMax() {
    return this.jsonParameterForVehicleClassWithoutString.RegDiff[1] === 16
      ? 15
      : this.jsonParameterForVehicleClassWithoutString.RegDiff[1];
  }

  get isShowVehicleFilterPills() {
    return (
      this.jsonParameterForVehicleClassWithoutString.finalVehicleNameList ||
      this.jsonParameterForVehicleClassWithoutString.finalVehicleTypeList ||
      this.jsonParameterForVehicleClassWithoutString.Delete ||
      this.jsonParameterForVehicleClassWithoutString.Recall ||
      this.jsonParameterForVehicleClassWithoutString.TruckKonnect ||
      this.jsonParameterForVehicleClassWithoutString.Milage ||
      this.jsonParameterForVehicleClassWithoutString.ExpDiff ||
      this.jsonParameterForVehicleClassWithoutString.RegDiff
    );
  }

  get showVehicleRecoverButton() {
    return this.ownedVehicleCount <= 0;
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant // possible values: 'success', 'error', 'warning', 'info'
    });
    this.dispatchEvent(event);
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
      this.isLanguageChangeDone = false;
    }
    this.updatePageButtons();
    this.updateCheckboxStates();
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener(
        "click",
        this.handleDeleteOutsideClick1.bind(this)
      );
      document.addEventListener(
        "click",
        this.handleDeleteOutsideClick2.bind(this)
      );
      this.outsideClickHandlerAdded = true;
    }

    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      this.outsideClickHandlerAdded = true;
    }
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener(
        "click",
        this.handleOutsideClicksorting.bind(this)
      );
      this.outsideClickHandlerAdded = true;
    }

    if (!this.outsideClickHandlerAdded2) {
      console.log("in render if");
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      this.outsideClickHandlerAdded2 = true;
    }
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClickdev.bind(this));
      this.outsideClickHandlerAdded = true;
    }
    if (!this.outsideClickHandlerAdded2) {
      document.addEventListener(
        "click",
        this.handleOutsideClick2dev.bind(this)
      );
      this.outsideClickHandlerAdded2 = true;
    }

    this.updateInclusiveRange(
      this.rangeOneValueSlider1,
      this.rangeTwoValueSlider1,
      "Slider1"
    );
    this.updateFloatingValues("Slider1");

    this.updateInclusiveRange(
      this.rangeOneValueSlider2,
      this.rangeTwoValueSlider2,
      "Slider2"
    );
    this.updateFloatingValues("Slider2");

    this.updateInclusiveRange(
      this.rangeOneValueSlider3,
      this.rangeTwoValueSlider3,
      "Slider3"
    );
    this.updateFloatingValues("Slider3");
  }

  handleOutsideClick2 = (event) => {
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
      this.showBranchSelection = false;
    }
  };

  @wire(getVehicleData, {
    Jsonfile: "$jsonParameterForVehicleClass",
    limitRange: "$currentPagination",
    pageNo: "$currentPage",
    Sorting: "$finalsortingValue",
    uiSearch: "$filterSuggestionsToSend"
  })
  Vehicledata(result) {
    this.vehicleListApiData = result;
    const { data, error } = result;
    if (data) {
      console.log("full vehicle wire data without objectify:- ", data);
      if (this.vehicleData.length === 0) {
        this.emptydataofvehicles = true;
        this.stopPaginationsearch = true;
      } else {
        this.emptydataofvehicles = false;
        this.stopPaginationsearch = false;
      }

      this.totalPageCount = data[0]?.totalPage;
      console.log("data[0]?.VehicleCountBranch", data[0]?.VehicleCountBranch);
      this.vehicleBrachCount =
        data[0]?.VehicleCountBranch === undefined
          ? 0
          : data[0]?.VehicleCountBranch;
      this.ownedVehicleCount = data[0]?.totalVehicleActiveCount || 0;
      this.updateVisiblePages();
      this.vehicleData = data.map((item) => {
        const { vehicle, branches, imageUrl } = item;

        // Map branch names
        let branchNames = branches.map((branch) => branch.Name);

        // Handle more than two branches
        if (branchNames.length > 2) {
          branchNames = `${branchNames.slice(0, 2).join("・")} 等`;
        } else {
          branchNames = branchNames.join("・");
        }

        let expDate = vehicle?.Vehicle_Expiration_Date__c
          ? this.formatJapaneseDate(vehicle.Vehicle_Expiration_Date__c)
          : "-";

        let Mileage = vehicle?.Mileage__c
          ? this.formatMileage(vehicle.Mileage__c)
          : "-";
        let showRecallM = false;
        if (vehicle?.CCP2_Recall_Status__c === "Not Completed") {
          showRecallM = true;
        }

        let starIcon =
          vehicle?.Favoruite_Vehicle__c === true
            ? "utility:favorite"
            : "utility:favorite_alt" || "utility:favorite_alt";
        let imageSrc = imageUrl.length === 0 ? this.truckSampleIcon : imageUrl;
        let deletestatusvehicle = vehicle.Status__c;
        let truckConnect =
          vehicle.Truck_Connect__c === 0 ? "" : vehicle.Truck_Connect__c;

        return {
          ...vehicle,
          statusDeleted: deletestatusvehicle === "Deleted",
          statusOwned: deletestatusvehicle === "CurrentlyOwned",
          starIcon,
          className: "card",
          isChecked: false,
          branchNames,
          imageSrc,
          showRecallM,
          expDate, // Store the concatenated branch names
          truckConnect,
          Mileage
        };
      });
      if (data.length === 0) {
        this.emptydataofvehicles = true;
        this.stopPaginationsearch = true;
      } else {
        this.emptydataofvehicles = false;
        this.stopPaginationsearch = false;
      }
      console.log("this.vehicleData in wire", JSON.stringify(this.vehicleData));
      this.showSpinner = false;
      this.currentlyOwnedVehiclesOnPage = data
        .filter((item) => item.vehicle.Status__c === "CurrentlyOwned")
        .map((item) => {
          const { vehicle } = item;
          return {
            ...vehicle,
            statusOwned: true
          };
        });
      this.updateButtonVisibility();
      this.updateVehicleClasses();
      // console.log("redata", data);
    } else if (error) {
      console.error(
        "Vehicle List Class Error, Parameter:-",
        this.jsonParameterForVehicleClass,
        this.filterSuggestionsToSend
      );
      console.error(error);
      this.showSpinner = true;
    }
  }

  @wire(totalPageCountApi, {
    limitRange: "$currentPagination",
    pageNo: "$currentPage",
    brnIds: "$branchDataToSendBack"
  })
  totalCountFun(result) {
    this.TotalPageApiData = result;
    const { data, err } = result;
    if (data) {
      console.log("total vehicle count: - ", data);
      // this.totalPageCount = data.totalPages;
      this.vehicleAccountCount = data.totalVehicleAccountCount;
      // this.vehicleBrachCount = data.totalVehicleUserCount;

      this.updateVisiblePages();
    } else if (err) {
      console.error("error: - ", err);
    }
  }
  @wire(branchOptionsApi)
  branchApiFun(result) {
    const { data, err } = result;
    if (data) {
      console.log("branches options data: - ", data);
      this.branchDataToSendBack = data
        .filter((elm) => {
          return elm.selected === true;
        })
        .map((b) => b.branchId);

      this.finalFilterJson = {
        ...this.finalFilterJson,
        brnIds: this.branchDataToSendBack
      };

      this.finalFilterJsonForClass = this.finalFilterJson;

      this.branchOptions = [
        { branchId: "すべて", branchName: "すべて", selected: false },
        ...data
      ];
    } else if (err) {
      console.error("branchOptionsApi error: - ", err);
    }
  }

  @wire(seachVehicleDataApi)
  searchDataFun({ data, err }) {
    if (data) {
      // console.log("Search APi Data", data);
      let temData = [];

      if (Array.isArray(data)) {
        data.forEach((elm) => {
          // Log each element to check if the Registration_Number__c exists
          // console.log("Element from data: ", elm);

          // Push registration_Number__c to temData if it exists
          if (elm?.Registration_Number__c) {
            // console.log(
            //   "Registration Number found: ",
            //   elm.Registration_Number__c
            // );
            temData.push(elm.Registration_Number__c);
          } else {
            console.log("No Registration Number found for element: ", elm);
          }
        });
      } 

      this.searchVehicleRegDoorData = temData;
      console.log(
        "Search Vehicle Door Data: ",
        JSON.stringify(this.searchVehicleRegDoorData)
      );

      console.log("search data merged: - ", temData);
    } else if (err) {
      console.error("Search APi Error: - ", err);
    }
  }

  listBySearchVehicle(regOrDoorNumberSearched) {
    listBySearchVehicle({ lastDigits: regOrDoorNumberSearched })
      .then((data) => {
        console.log("List By Search Vehicle Data: ", data);

        console.log(
          "List By Search Vehicle Data Stringified: ",
          JSON.stringify(data)
        );

        this.filterData = data.map((record) => {
          const { ...recordWithoutImageUrl } = record;

          return {
            ...recordWithoutImageUrl,

            branches: record.branches.map((branch) => branch.Name)
          };
        });

        console.log("filter", JSON.stringify(this.filterData));

        // Now map all vehicles and store in vehicleData

        this.vehicleData = data.map((record) => {
          const { vehicle, branches, imageUrl } = record;
          console.log("This.vehicle in listBySearch", this.vehicleData);
          // Map branch names for each vehicle

          let branchNames = branches.map((branch) => branch.Name);

          // Handle more than two branches

          if (branchNames.length > 2) {
            branchNames = `${branchNames.slice(0, 2).join("・")} 等`;
          } else {
            branchNames = branchNames.join("・");
          }

          // Format expiration date

          let expDate = vehicle?.Vehicle_Expiration_Date__c
            ? this.formatJapaneseDate(vehicle.Vehicle_Expiration_Date__c)
            : "-";

          // Set star icon based on vehicle's favorite status

          let starIcon =
            vehicle?.Favoruite_Vehicle__c === true
              ? "utility:favorite"
              : "utility:favorite_alt";

          // Set image source, use a sample icon if no image is available

          let imageSrc =
            imageUrl.length === 0 ? this.truckSampleIcon : imageUrl;
          let deletestatusvehicle = vehicle.Status__c;
          // Return each processed vehicle object

          return {
            ...vehicle,

            branchNames,

            starIcon,

            imageSrc,

            expDate,
            className: "card",
            isChecked: false,
            statusDeleted: deletestatusvehicle === "Deleted",
            statusOwned: deletestatusvehicle === "CurrentlyOwned"
          };
        });

        console.log(
          "Vehicle Data In List By Search: ",
          JSON.stringify(this.vehicleData)
        );

        this.showVehicleListOrNoVehicle = true;

        this.showSpinner = false;

        this.searchFilter = true;
      })

      .catch((err) => {
        console.error(err);
      });
  }

  // delete wire
  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: DELETE_STATUS
  })
  wiredServiceTypePicklist({ data, error }) {
    if (data) {
      this.StatusOptions = data.values.map((item) => {
        return { label: item.label, value: item.value };
      });
    } else if (error) {
      console.error(error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: DELETE_REASON
  })
  wiredServiceFactoryPicklist({ data, error }) {
    if (data) {
      this.reasonOptions = data.values.map((item) => {
        return { label: item.label, value: item.value };
      });
    } else if (error) {
      console.error(error);
    }
  }
  connectedCallback() {
    // this.initializePageSelectionState();
    const urlParams = new URLSearchParams(window.location.search).get('vehicleId');
    console.log("urlParams",urlParams);
    if(urlParams){
      console.log("urlParams2",urlParams);
      this.showVehicleList = false;
      this.showVehicleDetails = true;
      this.vehicleId = urlParams;
    }

    this.rangeValues.Slider1 = {
      lower: this.rangeOneValueSlider1,
      upper: this.rangeTwoValueSlider1
    };

    this.rangeValues.Slider2 = {
      lower: this.rangeOneValueSlider2,
      upper: this.rangeTwoValueSlider2
    };

    this.rangeValues.Slider3 = {
      lower: this.rangeOneValueSlider3,
      upper: this.rangeTwoValueSlider3
    };
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap";
    link.rel = "stylesheet";

    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.dropdownImg})`
    );
    document.head.appendChild(link);
    this.currentDate = this.getTodaysDate();
    document.addEventListener("click", this.handleOutsideClick);
    document.addEventListener("click", this.handleOutsideClick2);
    document.addEventListener("click", this.handleOutsideClickdev);
    document.addEventListener("click", this.handleOutsideClick2dev);
    document.addEventListener("click", this.handleOutsideClicksorting);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
    document.removeEventListener("click", this.handleOutsideClick2.bind(this));
    document.removeEventListener(
      "click",
      this.handleOutsideClicksorting.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleOutsideClickdev.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleOutsideClick2dev.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleDeleteOutsideClick1.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleDeleteOutsideClick2.bind(this)
    );
    this.rangeValues.Slider1 = {
      lower: this.rangeOneValueSlider1,
      upper: this.rangeTwoValueSlider1
    };

    this.rangeValues.Slider2 = {
      lower: this.rangeOneValueSlider2,
      upper: this.rangeTwoValueSlider2
    };

    this.rangeValues.Slider3 = {
      lower: this.rangeOneValueSlider3,
      upper: this.rangeTwoValueSlider3
    };
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
        // eslint-disable-next-line no-undef
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
            // eslint-disable-next-line no-undef
            this.labels2 = i18next.store.data[userLocale].translation;
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
      });
  }
  getLocale() {
    console.log("Lang 2", this.Languagei18n);
    if (this.Languagei18n === "en_US") {
      console.log("working1");
      return "en";
    } else {
      console.log("working2");
      return "jp";
    }
  }

  handlecardClick(event) {
    if (this.deletecheckboxoverfav) {
      const vehicleId = event.currentTarget.dataset.id;
      const checkbox = this.template.querySelector(
        `input[data-id="${vehicleId}"]`
      );

      if (checkbox) {
        const isChecked = checkbox.checked;
        checkbox.checked = !isChecked;

        this.selectedVehicleStates[vehicleId] = checkbox.checked;
        this.handleCheckboxChangeFromCard(vehicleId, checkbox.checked);
      }

      event.preventDefault();
      event.stopPropagation();
    } else {
      this.vehicleId = event.currentTarget.dataset.id;
      this.favIconForDetailPage = event.currentTarget.dataset.icon;
      console.log("Clicked Vehicle ID:", this.vehicleId);
      console.log("Clicked Vehicle icon:", this.favIconForDetailPage);

      this.showVehicleDetails = true;
      this.pinnedFilter = false;
      this.showVehicleList = false;
      window.scrollTo(0, 0);
    }
  }

  handleBack() {
    const prevUrl = document.referrer;
    const newUrl = '/s/vehiclemanagement';

    window.history.replaceState({}, document.title, newUrl);
    if(prevUrl.includes('vehiclemanagement')){
      window.history.back();
    }

    this.currentPagination = Number(this.currentPagination) + 1;
    setTimeout(() => {
      this.currentPagination = Number(this.currentPagination) - 1;
    }, 0);

    refreshApex(this.vehicleListApiData);
    this.currentPage = 1;
    this.showVehicleList = true;
    this.showVehicleDetails = false;
  }

  showVehicleRegistration() {
    this.showVehicleModal = !this.showVehicleModal;
  }
  handleCloseModal() {
    this.showVehicleModal = false;
  }
  handlemoveModal() {
    this.showVehicleList = false;
  }

  toggleStar(event) {
    event.stopPropagation();
  }

  togglePaginationList(event) {
    event.stopPropagation();
    if (this.showListOffSet === false) {
      // window.scrollTo(0, document.body.scrollHeight);
      const element = this.template.querySelector(".drop-down-container");
      element.scrollIntoView({ behavior: "smooth" });
    }

    this.showListOffSet = !this.showListOffSet;
  }

  clickOffSetElement(event) {
    this.currentPagination = event.target.dataset.offset;
    this.currentPage = 1;
    this.updatePageButtons();
    this.updateVisiblePages();
  }

  pageCountClick(event) {
    this.currentPage = Number(event.target.dataset.page);
    this.updateButtonVisibility();
    this.updatePageButtons();
    this.updateVehicleClasses();
    this.updateCheckboxStates();
  }

  updatePageButtons() {
    // console.log("in update pagination");
    const buttons = this.template.querySelectorAll(".page-button");
    buttons.forEach((button) => {
      const pageNum = Number(button.dataset.page);
      if (pageNum === this.currentPage) {
        // console.log("Current Page Number clicked: ", pageNum);
        button.classList.add("cuurent-page");
      } else {
        button.classList.remove("cuurent-page");
      }
    });

    this.isPreviousDisabled = this.currentPage === 1;

    this.isNextDisabled = this.currentPage === this.totalPageCount;
  }

  handlePreviousPage() {
    if (this.currentPage > 1) {
      this.prevGoing = true;
      this.currentPage -= 1;
      this.isPreviousDisabled = this.currentPage === 1;
      this.isNextDisabled = this.currentPage === this.totalPageCount;
      this.updatePageButtons();
    }
    this.updateCheckboxStates();
    this.updateVehicleClasses();
    this.updateButtonVisibility();
  }
  handleNextPage() {
    if (this.totalPageCount > this.currentPage) {
      this.prevGoing = false;
      this.currentPage += 1;
      console.log("THIS is the current page in handle next", this.currentPage);
      this.isPreviousDisabled = this.currentPage === 1;
      this.isNextDisabled = this.currentPage === this.totalPageCount;
      this.updatePageButtons();
    }
    this.updateCheckboxStates();
    this.updateVehicleClasses();
    this.updateButtonVisibility();
  }

  updateVisiblePages() {
    let startPage, endPage;

    if (this.currentPage <= 4) {
      startPage = 1;
      endPage = Math.min(4, this.totalPageCount);
    } else if (
      this.currentPage > 4 &&
      this.currentPage <= this.totalPageCount - 4
    ) {
      startPage = this.currentPage - 1;
      endPage = this.currentPage + 2;
    } else {
      startPage = this.totalPageCount - 3;
      endPage = this.totalPageCount;
    }

    this.visiblePageCount = [];
    for (let i = startPage; i <= endPage; i++) {
      this.visiblePageCount.push(i);
    }

    this.visiblePageCount.forEach((element) => {
      this.showRightDots = element === this.totalPageCount ? false : true;
    });
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
    return "-";
  }
  getTodaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = ("0" + (today.getMonth() + 1)).slice(-2);
    const day = ("0" + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  handleSuggestionInputChange(event) {
    this.handlevalchange(event);
    if (event.target.value === "") {
      this.currentPagination = Number(this.currentPagination) + 1;
      this.updateButtonVisibility();
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        this.currentPagination = Number(this.currentPagination) - 1;
      }, 0);
      this.filterData = [];
      this.filterSuggestionsToSend = "";
      this.searchFilter = false;
      console.log("filterednew", this.filterData);
      this.errorSearch = false;
      this.showSearchError = false;
      this.searchDivClass = "search";
      this.searchInputClass = "search-box";
      this.showVehicleListOrNoVehicle = true;
      // this.stopPaginationsearch = false;
      this.forcestopPagination = false;
    }

    this.showFilteredSuggestions =
      event.target.value?.length > 0 ? true : false;

    this.filterSuggestions = event.target.value.toLowerCase();
    console.log(
      "event.target.value",
      event.target.value,
      "showFilteredSuggestions",
      this.showFilteredSuggestions,
      "filterSuggestions",
      this.filterSuggestions
    );

    if (this.showFilteredSuggestions) {
      this.filteredSearchVehicleRegDoorData =
        this.searchVehicleRegDoorData.filter((elm) => {
          // Ensure that elm is a string and has at least 4 characters
          if (typeof elm === "string" && elm.length >= 4) {
            const lastFourDigits = elm.slice(-4).toLowerCase(); // Extract last 4 digits
            console.log("Last 4 digits:", lastFourDigits); // Debugging log
            return lastFourDigits.startsWith(this.filterSuggestions);
          }
          return false;
        });

      console.log(
        "Filtered by last 4 digits",
        JSON.stringify(this.filteredSearchVehicleRegDoorData)
      );
      // console.log("iF all 2 : ", JSON.stringify(this.searchVehicleRegDoorData));
    } else {
      console.log("else");
      this.filteredSearchVehicleRegDoorData = [];
    }
  }

  handlecloseclick() {
    this.filterSuggestions = "";
    this.searchDivClass = "search";
    this.searchInputClass = "search-box";
    this.showSearchError = false;
    this.errorSearch = false;
  }

  handleKeyDown(event) {
    if (event.key === "Enter") {
      this.searchDivClass = "search";
      this.searchInputClass = "search-box";
      this.errorSearch = false;
      this.showSearchError = false;
      // Log the value from the input
      let str = event.target?.value;
      console.log("Enter pressed Value: ", str, str.length);

      // Check if the input field is empty
      if (event.target?.value.trim() !== "") {
        if (str.length < 4 || !/^[0-9]*$/.test(str)) {
          this.searchDivClass = "invalid-input search";
          this.searchInputClass = "invalid-input2 search-box";
          this.errorSearch = true;
          this.showSearchError = true;
          console.log("Input length is less than 4, showing error toast");
          return;
        }
        this.stopPaginationsearch = true;
        this.forcestopPagination = true;
      } else {
        console.log("Input is empty, returning");
        return;
      }

      if (this.filterSuggestionsToSend !== event.target?.value) {
        this.showSpinner = true;
      }
      this.filterSuggestionsToSend = event.target?.value;
      this.currentPage = 1;
      // Hide the suggestion dropdown
      this.showFilteredSuggestions = false;
    }
  }

  handleSuggestionSelect() {
    this.showSpinner = true;
    // let last4dig = event.target.textContent.slice(-4);
    // this.listBySearchVehicle(event.target.textContent);
    this.showFilteredSuggestions = false;
  }

  // adjustDropdownPosition() {
  //   const dropdownContainer = this.template.querySelector(
  //     ".drop-down-container"
  //   );
  //   const dropdownList = this.template.querySelector(".drop-down-list");

  //   console.log("WHAT WE HAVE TO DROPDOWN:- ", dropdownContainer, dropdownList);
  //   const containerRect = dropdownContainer.getBoundingClientRect();
  //   const listHeight = dropdownList.offsetHeight;

  //   const spaceBelow = window.innerHeight - containerRect.bottom;
  //   const spaceAbove = containerRect.top;
  //   console.log("WHAT:- ", containerRect, listHeight, spaceBelow, spaceAbove);

  //   if (spaceBelow < listHeight && spaceAbove > listHeight) {
  //     console.log("IN IF :- ");
  //     dropdownList.style.bottom = "unset";
  //     dropdownList.style.top = "44px"; // Adjust the value based on your layout
  //   } else {
  //     console.log("IN ELSE :- ");
  //     dropdownList.style.top = "unset";
  //     dropdownList.style.bottom = "44px";
  //   }
  // }

  handleOutsideClick = (event) => {
    const dataDropElement = this.template.querySelector(".drop-down-container");
    const listsElement = this.template.querySelector(".drop-down-list");
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showListOffSet = false;
    }
  };

  get hasVehicles() {
    return this.vehicleAccountCount > 0;
  }

  //download feature
  //modal 1
  showDownloadModal() {
    this.showDownload = true;
    this.DownloadName = `${this.currentDate} - カスタマーポータル車両リスト.csv`;
  }
  closeDownload() {
    this.FilterFlag = false;
    this.AllFlag = true;
    this.showDownload = false;
  }
  MovetoRename() {
    if (this.AllFlag === true) {
      this.allApex();
    }
    if (this.FilterFlag === true) {
      this.allVehiclesData = [];
      this.downloadfiltervehicles();
    }
    this.showDownload = false;
    this.showDownloadPath = true;
  }
  closePathDownload() {
    this.DownloadName = `${this.currentDate} - カスタマーポータル車両リスト.csv`;
    this.FilterFlag = false;
    this.AllFlag = true;
    this.showDownloadPath = false;
  }
  finaldownload() {
    this.downloadCSVAll();
    this.showFinishTimeModal();
    this.showDownloadPath = false;
  }
  showFinishTimeModal() {
    this.showSuccessDownload = true;
    window.scrollTo(0, 0);
    setTimeout(() => {
      this.DownloadName = `${this.currentDate} - カスタマーポータル車両リスト.csv`;
      this.FilterFlag = false;
      this.AllFlag = true;
      this.showSuccessDownload = false;
    }, 2000);
  }
  FilterOption(event) {
    this.FilterFlag = event.target.checked;
    if (this.FilterFlag) {
      this.AllFlag = false;
    }
    console.log("de", this.allVehiclesData);
  }
  Alloption(event) {
    this.AllFlag = event.target.checked;
    if (this.AllFlag) {
      this.FilterFlag = false;
    }
  }
  allApex() {
    getAllVehicleForDownload()
      .then((result) => {
        this.allVehiclesData = [];
        this.allVehiclesData = result;
        console.log("All Vehicle Data:", JSON.stringify(result));
      })
      .catch((error) => {
        console.error("Error retrieving vehicle data:", error);
      });
  }
  downloadfiltervehicles() {
    const jsonFilter = this.jsonParameterForVehicleClass || "";
    const selectedSorting = this.finalsortingValue || "";
    const searchTerm = this.filterSuggestionsToSend || "";
    console.log("jsonfile", jsonFilter);
    console.log("sort", selectedSorting);
    console.log("search param", searchTerm);
    console.log("params");
    if (jsonFilter || selectedSorting || searchTerm) {
      getFilterVehicleForDownload({
        Jsonfile: jsonFilter,
        Sorting: selectedSorting,
        uiSearch: searchTerm
      })
        .then((result) => {
          this.allVehiclesData = result;
          console.log(
            "Filtered Vehicles Data dev:",
            JSON.stringify(this.allvehiclesData)
          );
        })
        .catch((error) => {
          console.error("Error fetching filtered vehicle data:", error);
        });
    } else {
      console.log("No filters applied.");
    }
  }

  downloadCSVAll() {
    if (this.allVehiclesData.length === 0) {
      console.error("No data available to download");
      return;
    }

    const headers = [
      "お客様管理名",
      "登録番号",
      "車台番号",
      "交付年月日",
      "車名",
      "自動車の種別",
      "車体の形状",
      "車両重量",
      "初度登録年月",
      "有効期間の満了する日",
      "走行距離",
      "燃料の種類",
      "自家用・事業用の別",
      "用途",
      "型式",
      //"ドアナンバー",
      "所属",
      '削除済み車両'
    ];

    const csvRows = this.allVehiclesData.map((record) => {
      const vehicle = record.vehicle;
      const branches = Array.isArray(record.branches)
        ? record.branches.join("・")
        : record.branches
          ? record.branches.name
          : "";

      return [
        vehicle.Vehicle_Number__c || "",
        vehicle.Registration_Number__c || "",
        vehicle.Chassis_number__c || "",
        vehicle.Delivery_Date__c || "",
        vehicle.Vehicle_Name__c || "",
        vehicle.Vehicle_Type__c || "",
        vehicle.Body_Shape__c || "",
        vehicle.vehicleWeight__c || "",
        vehicle.First_Registration_Date__c || "",
        vehicle.Vehicle_Expiration_Date__c || "",
        vehicle.Mileage__c || "",
        vehicle.Fuel_Type__c || "",
        vehicle.Private_Business_use__c || "",
        vehicle.Use__c || "",
        vehicle.fullModel__c || "",
        //vehicle.Door_Number__c || "",
        branches,
        vehicle.Status__c === 'CurrentlyOwned' ? ' ' : '削除済み' || ''
      ];
    });

    let csvContent = headers.join(",") + "\n";
    csvRows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });
    const BOM = "\uFEFF";
    csvContent = BOM + csvContent;

    if (this.DownloadName.endsWith(".csv")) {
      this.DownloadName = this.DownloadName.slice(0, -4);
    }

    const csvBase64 = btoa(unescape(encodeURIComponent(csvContent)));
    const link = document.createElement("a");
    link.href = "data:text/csv;base64," + csvBase64;
    link.download = `${this.DownloadName}.csv`;
    link.click();
    window.URL.revokeObjectURL(link.href);
    link.remove();
  }
  handleDownloadChange(event) {
    this.DownloadName = event.target.value;
  }
  //filter Modal
  openFilterModal() {
    if (this.pinnedFilter === false) {
      window.scrollTo(0, 0);
      this.showFilterModal = true;
      document.body.style.overflow = "hidden";
    } else {
      console.log("pinned is here");
    }
  }
  closeFilterModal() {
    this.showFilterModal = false;
    document.body.style.overflow = "";
  }
  pinnedModal() {
    this.pinnedFilter = true;
    this.showFilterModal = false;
    document.body.style.overflow = "";
  }
  pinnedtomodal() {
    this.showFilterModal = true;
    this.pinnedFilter = false;
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
  }
  pinnedWindowclose() {
    this.pinnedFilter = false;
  }

  handleVehicleNameSelect(event) {
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
        console.log(
          "this.finalVehicleNameList in ischeck",
          this.finalVehicleNameList
        );
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
      this.finalFilterJson = {
        ...this.finalFilterJson,
        finalVehicleNameList: this.finalVehicleNameList
      };
    } else {
      // eslint-disable-next-line no-unused-vars
      const { finalVehicleNameList, ...rest } = this.finalFilterJson;
      this.finalFilterJson = rest;
    }
    console.log(
      "this.finalVehicleNameList",
      JSON.stringify(this.finalVehicleNameList)
    );
  }
  toggleVehicleName(event) {
    event.stopPropagation();
    this.showVehicleNameDropdown = !this.showVehicleNameDropdown;
    this.showVehicleTypeDropdown = false;
  }
  handleinsideclick(event) {
    event.stopPropagation();
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
    if (this.vehicleTypeValue.length) {
      this.finalFilterJson = {
        ...this.finalFilterJson,
        finalVehicleTypeList: this.finalVehicleTypeList
      };
    } else {
      // eslint-disable-next-line no-unused-vars
      const { finalVehicleTypeList, ...rest } = this.finalFilterJson;
      this.finalFilterJson = rest;
    }
    console.log(
      "this.finalVehicleTypeList",
      JSON.stringify(this.finalVehicleTypeList),
      "this.finalVehicleNameList",
      JSON.stringify(this.finalVehicleNameList)
    );
  }
  toggleVehicleType(event) {
    event.stopPropagation();
    this.showVehicleTypeDropdown = !this.showVehicleTypeDropdown;
    this.showVehicleNameDropdown = false;
  }
  handleinsideclick2(event) {
    event.stopPropagation();
  }

  handleOutsideClickdev = (event) => {
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
      this.showVehicleNameDropdown = false;
    }
  };
  handleOutsideClicksorting = (event) => {
    const dataDropElement = this.template.querySelector(".sort-buttons");
    const listsElement = this.template.querySelector(
      ".sorting-radio-container"
    );
    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showSortingModal = false;
    }
  };

  handleOutsideClick2dev = (event) => {
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
      this.showVehicleTypeDropdown = false;
    }
  };

  // Handle checkbox change
  handleCheckboxChangeForPills(event) {
    const value = event.target.value;
    if (value === "Delete") {
      this.deletedFlag = event.target.checked;
      if (event.target.checked) {
        this.finalFilterJson = { ...this.finalFilterJson, [value]: "true" };
      } else {
        // eslint-disable-next-line no-unused-vars
        const { Delete, ...rest } = this.finalFilterJson;
        this.finalFilterJson = rest;
      }
    }else if(value === "Recall"){
      this.recallflag = event.target.checked;
      if (event.target.checked) {
        this.finalFilterJson = { ...this.finalFilterJson, [value]: "true" };
      } else {
        const { Recall, ...rest } = this.finalFilterJson;
        this.finalFilterJson = rest;
      }
    } else {
      this.truckOnnectFlag = event.target.checked;
      if (event.target.checked) {
        this.finalFilterJson = { ...this.finalFilterJson, [value]: "true" };
      } else {
        // eslint-disable-next-line no-unused-vars
        const { TruckKonnect, ...rest } = this.finalFilterJson;
        this.finalFilterJson = rest;
      }
    }
  }

  // Handle pill removal
  removePill(event) {
    this.deleteselectedVehicleIds = [];
    this.selectedVehicleStates = {};
    this.selectedVehiclesByPage.clear();
    this.updateButtonVisibility();
    const key = event.target.dataset.key;
    const value = event.target.dataset.value;

    if (key === "Milage" || key === "RegDiff" || key === "ExpDiff") {
      delete this.finalFilterJsonForClass[key];
      delete this.finalFilterJson[key];
      switch (key) {
        case "Milage": {
          this.rangeOneValueSlider1 = 0;
          this.rangeTwoValueSlider1 = 100;
          this.rangeValues.Slider1 = {
            lower: 0,
            upper: 100
          };
          this.slider1check = false;
          this.isRangeDisabled1 = false;
          this.rangeClass1 = "incl-range";
          break;
        }
        // eslint-disable-next-line no-fallthrough
        case "RegDiff": {
          this.rangeOneValueSlider3 = 0;
          this.rangeTwoValueSlider3 = 100;
          this.rangeValues.Slider3 = {
            lower: 0,
            upper: 100
          };
          this.slider3check = false;

          this.isRangeDisabled3 = false;
          this.rangeClass3 = "incl-range";
          break;
        }
        // eslint-disable-next-line no-fallthrough
        case "ExpDiff": {
          this.rangeOneValueSlider2 = 0;
          this.rangeTwoValueSlider2 = 100;
          this.rangeValues.Slider2 = {
            lower: 0,
            upper: 100
          };
          this.slider2check = false;
          this.isRangeDisabled2 = false;
          this.rangeClass2 = "incl-range";
          break;
        }
        // eslint-disable-next-line no-fallthrough
        default: {
          this.rangeValues.Slider1 = {
            lower: 0,
            upper: 100
          };
        }
      }
    } else if (key === "Delete") {
      this.deletedFlag = false;
      // eslint-disable-next-line no-unused-vars
      const { Delete: deleteMain, ...restClass } = this.finalFilterJsonForClass;
      this.finalFilterJsonForClass = restClass;
      // eslint-disable-next-line no-unused-vars
      const { Delete: deleteMain2, ...restMain } = this.finalFilterJson;
      this.finalFilterJson = restMain;
    } else if (key === "Recall") {
      this.recallflag = false;
      // eslint-disable-next-line no-unused-vars
      const { Recall: recallMain, ...restClass } = this.finalFilterJsonForClass;
      this.finalFilterJsonForClass = restClass;
      // eslint-disable-next-line no-unused-vars
      const { Recall: recallMain2, ...restMain } = this.finalFilterJson;
      this.finalFilterJson = restMain;
    }
     else if (key === "TruckKonnect") {
      this.truckOnnectFlag = false;
      // eslint-disable-next-line no-unused-vars
      const { TruckKonnect: Main, ...restClass } = this.finalFilterJsonForClass;
      this.finalFilterJsonForClass = restClass;
      // eslint-disable-next-line no-unused-vars
      const { TruckKonnect: Main2, ...restMain } = this.finalFilterJson;
      this.finalFilterJson = restMain;
    } else {
      this.finalFilterJsonForClass[key] = this.finalFilterJsonForClass[
        key
      ].filter((item) => item !== value);

      this.finalFilterJson[key] = this.finalFilterJson[key].filter(
        (item) => item !== value
      );

      switch (key) {
        case "finalVehicleNameList": {
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
        case "finalVehicleTypeList": {
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

          this.finalVehicleTypeList = this.finalVehicleTypeList.filter(
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
      if (this.finalFilterJsonForClass[key]?.length === 0) {
        delete this.finalFilterJsonForClass[key];
        delete this.finalFilterJson[key];
        switch (key) {
          case "finalVehicleNameList": {
            this.vehicleNameValue = "";
            this.finalVehicleNameList = [];

            this.vehicleNamesPicklistValues =
              this.vehicleNamesPicklistValues.map((elm) => {
                return { ...elm, selected: false };
              });
            break;
          }
          case "finalVehicleTypeList": {
            this.vehicleTypeValue = "";
            this.finalVehicleTypeList = [];

            this.vehicleTypesPicklistValues =
              this.vehicleTypesPicklistValues.map((elm) => {
                return { ...elm, selected: false };
              });
            break;
          }
          default: {
            this.vehicleNameValue = "";
            this.finalVehicleNameList = [];
          }
        }
      }
    }

    this.finalFilterJsonForClass = { ...this.finalFilterJsonForClass };

    this.updatePageButtons();
    this.updateVisiblePages();
    console.log(JSON.stringify(this.finalFilterJsonForClass));
  }
  //range filter
  handleRangeChange(event) {
    const id = event.target.dataset.id;
    const name = event.target.name;
    const value = parseFloat(event.target.value);

    const rangeOne = this.template.querySelector(
      `input[name="rangeOne"][data-id="${id}"]`
    );
    const rangeTwo = this.template.querySelector(
      `input[name="rangeTwo"][data-id="${id}"]`
    );

    console.log("parseFloat(rangeOne.value)", parseFloat(rangeOne.value));
    // console.log("parseFloat(rangeTwo.value)", parseFloat(rangeTwo.value));
    // Store the decimal values of the ranges for the corresponding slider
    this.rangeValues[id].lower = parseFloat(rangeOne.value);
    this.rangeValues[id].upper = parseFloat(rangeTwo.value);

    const multiplier = this.sliderConfigs[id].multiplier;

    let subtractor = 5;
    if (id === "Slider1") {
      subtractor = 5;
    } else if (id === "Slider2") {
      subtractor = 8.33333333333;
    } else {
      subtractor = 6.66666666666;
    }
    if (name === "rangeOne" && value >= parseFloat(rangeTwo.value)) {
      rangeOne.value = parseFloat(rangeTwo.value) - parseFloat(subtractor);
      this[`rangeOneValue${id}`] =
        parseFloat(rangeTwo.value) - parseFloat(subtractor);

      this.rangeValues[id].lower =
        parseFloat(rangeTwo.value) - parseFloat(subtractor);

      // eslint-disable-next-line no-useless-return
    } else if (name === "rangeTwo" && value <= parseFloat(rangeOne.value)) {
      rangeTwo.value = parseFloat(rangeOne.value) + parseFloat(subtractor);
      this[`rangeTwoValue${id}`] =
        parseFloat(rangeOne.value) + parseFloat(subtractor);

      this.rangeValues[id].upper =
        parseFloat(rangeOne.value) + parseFloat(subtractor);
      // eslint-disable-next-line no-useless-return
    }

    // eslint-disable-next-line no-else-return
    else {
      console.log("in valid case");
      if (name === "rangeOne") {
        this[`rangeOneValue${id}`] = value;
        this.rangeValues[id].lower = value;
      } else {
        this[`rangeTwoValue${id}`] = value;
        this.rangeValues[id].upper = value;
      }
      this.updateInclusiveRange(rangeOne.value, rangeTwo.value, id);
      this.updateFloatingValues(id);
    }

    if (id === "Slider1") {
      this.finalFilterJson = {
        ...this.finalFilterJson,
        Milage: [
          Number(Math.ceil(this.rangeValues[id].lower * multiplier).toFixed(0)),
          Number(Math.ceil(this.rangeValues[id].upper * multiplier).toFixed(0))
        ]
      };
    } else if (id === "Slider2") {
      this.finalFilterJson = {
        ...this.finalFilterJson,
        ExpDiff: [
          Number(Math.ceil(this.rangeValues[id].lower * multiplier).toFixed(0)),
          Number(Math.ceil(this.rangeValues[id].upper * multiplier).toFixed(0))
        ]
      };
    } else {
      this.finalFilterJson = {
        ...this.finalFilterJson,
        RegDiff: [
          Number(Math.ceil(this.rangeValues[id].lower * multiplier).toFixed(0)),
          Number(Math.ceil(this.rangeValues[id].upper * multiplier).toFixed(0))
        ]
      };
    }
  }

  updateInclusiveRange(rangeOne, rangeTwo, id) {
    const inclRange = this.template.querySelector(
      `.incl-range[data-id="${id}"]`
    );

    if (inclRange) {
      const width =
        rangeTwo === rangeOne
          ? "0%" // Handle case where the values are the same
          : `${((rangeTwo - rangeOne) / (this.maxValue - this.minValue)) * 100}%`;
      const left = `${(rangeOne / (this.maxValue - this.minValue)) * 100}%`;

      inclRange.style.width = width;
      inclRange.style.left = left;
    }
  }

  updateFloatingValues(id) {
    let suffix = "km";
    if (id === "Slider1") {
      suffix = "km";
    } else if (id === "Slider2") {
      suffix = "ヶ月";
    } else {
      suffix = "年";
    }
    const outputOne = this.template.querySelector(
      `.output.outputOne[data-id="${id}"]`
    );
    const outputTwo = this.template.querySelector(
      `.output.outputTwo[data-id="${id}"]`
    );

    if (outputOne && outputTwo) {
      const multiplier = this.sliderConfigs[id].multiplier;

      outputOne.textContent =
        this.formatCurrency(
          Math.ceil(this.rangeValues[id].lower * multiplier).toFixed(0)
        ) +
        " " +
        suffix;
      outputTwo.textContent =
        this.formatCurrency(
          Math.ceil(this.rangeValues[id].upper * multiplier).toFixed(0)
        ) +
        " " +
        suffix;

      outputOne.style.left = `${this.calculateLeft_left(this[`rangeOneValue${id}`])}%`;
      outputTwo.style.left = `${this.calculateLeft(this[`rangeTwoValue${id}`])}%`;
    }
  }

  formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0
    }).format(value);
  }

  calculateLeft(percentage) {
    return 0.9677 * percentage - 48.2735;
  }

  calculateLeft_left(percentage) {
    return 0.963 * percentage - 19.5;
  }

  //  filter wire
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
      console.log(
        "picklist value",
        JSON.stringify(this.vehicleNamesPicklistValues)
      );
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }
  handleResetofFilter() {
    this.rangeOneValueSlider1 = 0;
    this.rangeTwoValueSlider1 = 100;
    this.rangeValues.Slider1 = {
      lower: this.rangeOneValueSlider1,
      upper: this.rangeTwoValueSlider1
    };
    this.rangeOneValueSlider2 = 0;
    this.rangeTwoValueSlider2 = 100;
    this.rangeValues.Slider2 = {
      lower: this.rangeOneValueSlider2,
      upper: this.rangeTwoValueSlider2
    };
    this.rangeOneValueSlider3 = 0;
    this.rangeTwoValueSlider3 = 100;
    this.rangeValues.Slider3 = {
      lower: this.rangeOneValueSlider3,
      upper: this.rangeTwoValueSlider3
    };
    this.isRangeDisabled1 = false;
    this.isRangeDisabled2 = false;
    this.isRangeDisabled3 = false;
    this.rangeClass1 = "incl-range";
    this.rangeClass2 = "incl-range";
    this.rangeClass3 = "incl-range";

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
    delete this.finalFilterJson.finalVehicleNameList;
    delete this.finalFilterJson.finalVehicleTypeList;
    delete this.finalFilterJson.Delete;
    delete this.finalFilterJson.Recall;
    delete this.finalFilterJson.TruckKonnect;
    delete this.finalFilterJson.RegDiff;
    delete this.finalFilterJson.ExpDiff;
    delete this.finalFilterJson.Milage;
    this.vehicleNameValue = "";
    this.finalVehicleNameList = [];
    this.vehicleTypeValue = "";
    this.finalVehicleTypeList = [];
    this.deletedFlag = false;
    this.truckOnnectFlag = false;
    this.recallflag = false;
    this.slider1check = false;
    this.slider2check = false;
    this.slider3check = false;
    this.showFilterModal = false;
    document.body.style.overflow = "";
    this.finalFilterJsonForClass = this.finalFilterJson;
    this.currentPagination = Number(this.currentPagination) + 1;
    setTimeout(() => {
      this.currentPagination = Number(this.currentPagination) - 1;
    }, 0);
  }

  toggleDisable1() {
    this.isRangeDisabled1 = !this.isRangeDisabled1;

    if (this.isRangeDisabled1) {
      this.rangeClass1 = "disabled incl-range";
    } else {
      this.rangeClass1 = "incl-range";
    }
  }

  toggleDisable2() {
    this.isRangeDisabled2 = !this.isRangeDisabled2;

    if (this.isRangeDisabled2) {
      this.rangeClass2 = "disabled incl-range";
    } else {
      this.rangeClass2 = "incl-range";
    }
  }

  toggleDisable3() {
    this.isRangeDisabled3 = !this.isRangeDisabled3;

    if (this.isRangeDisabled3) {
      this.rangeClass3 = "disabled incl-range";
    } else {
      this.rangeClass3 = "incl-range";
    }
  }

  handleAllRangeSelected(event) {
    console.log("filterjson:", this.finalFilterJson);
    console.log("finalfinlterjson:", this.finalFilterJsonForClass);
    const checkboxId = event.target.dataset.id; // Get the data-id attribute to determine which checkbox
    let isCheckedd = event.target.checked;
    // Update the corresponding tracked variable based on the checkbox
    if (checkboxId === "checkboxslider1") {
      this.toggleDisable1();
      this.slider1check = event.target.checked; // Store true/false in slider1check
      if (isCheckedd) {
        this.rangeOneValueSlider1 = 0;
        this.rangeTwoValueSlider1 = 100;
        this.rangeValues.Slider1 = {
          lower: this.rangeOneValueSlider1,
          upper: this.rangeTwoValueSlider1
        };

        this.finalFilterJson = {
          ...this.finalFilterJson,
          Milage: [0, 1000001]
        };
      } else {
        // eslint-disable-next-line no-unused-vars
        const { Milage, ...rest } = this.finalFilterJson;
        this.finalFilterJson = rest;
      }
    } else if (checkboxId === "checkboxslider2") {
      this.toggleDisable2();
      this.slider2check = event.target.checked; // Store true/false in slider2check
      if (isCheckedd) {
        this.rangeOneValueSlider2 = 0;
        this.rangeTwoValueSlider2 = 100;
        this.rangeValues.Slider2 = {
          lower: this.rangeOneValueSlider2,
          upper: this.rangeTwoValueSlider2
        };

        this.finalFilterJson = {
          ...this.finalFilterJson,
          ExpDiff: [0, 13]
        };
      } else {
        // eslint-disable-next-line no-unused-vars
        const { ExpDiff, ...rest } = this.finalFilterJson;
        this.finalFilterJson = rest;
      }
    } else if (checkboxId === "checkboxslider3") {
      this.toggleDisable3();
      this.slider3check = event.target.checked; // Store true/false in slider3check
      if (isCheckedd) {
        this.rangeOneValueSlider3 = 0;
        this.rangeTwoValueSlider3 = 100;
        this.rangeValues.Slider3 = {
          lower: this.rangeOneValueSlider3,
          upper: this.rangeTwoValueSlider3
        };
        this.finalFilterJson = {
          ...this.finalFilterJson,
          RegDiff: [0, 16]
        };
      } else {
        // eslint-disable-next-line no-unused-vars
        const { RegDiff, ...rest } = this.finalFilterJson;
        this.finalFilterJson = rest;
      }
    }

    // Log to verify
    console.log("filterjson:2", this.finalFilterJson);
    console.log("finalfinlterjson:2", this.finalFilterJsonForClass);
  }

  // delete vehicle
  showdeletecheckboxes() {
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    ongoingTransactions.vehicleListDeleteTxn = true;

    sessionStorage.setItem(
      "ongoingTransaction",
      JSON.stringify(ongoingTransactions)
    );

    this.deletecheckboxoverfav = true;
    this.MainTemplateofbuttons = false;
    this.deletebuttonsall = true;
  }

  handlebackfromdelete() {
    sessionStorage.removeItem("ongoingTransaction");
    this.showDeselectAllButton = false;
    this.deleteselectedVehicleIds = [];
    this.selectedVehicleStates = {};
    this.selectedVehiclesByPage.clear();
    this.deletecheckboxoverfav = false;
    this.selectedall = false;
    this.deletebuttonsall = false;
    this.MainTemplateofbuttons = true;
    this.showSelectAllButton = true;
    this.updateVehicleClasses();
  }

  handledeleteselectall() {
    // const currentlyOwnedVehiclesOnPage = this.vehicleData.filter(
    //   (vehicle) => vehicle.statusOwned
    // );
    this.pageSelectionState[this.currentPage] = true;

    const selectedVehicleIdsOnPage = this.currentlyOwnedVehiclesOnPage.map(
      (vehicle) => vehicle.Id
    );

    this.selectedVehiclesByPage.set(this.currentPage, selectedVehicleIdsOnPage);

    selectedVehicleIdsOnPage.forEach((vehicleId) => {
      this.selectedVehicleStates[vehicleId] = true;
      if (!this.deleteselectedVehicleIds.includes(vehicleId)) {
        this.deleteselectedVehicleIds.push(vehicleId);
      }
    });
    console.log(
      "deleteselectedVehicleIds",
      JSON.stringify(this.deleteselectedVehicleIds)
    );

    this.updateVehicleClasses();
    this.updateCheckboxStates();
    this.updateButtonVisibility();
  }

  handledeleteDeselectall() {
    // const currentlyOwnedVehiclesOnPage = this.vehicleData.filter(
    //   (vehicle) => vehicle.statusOwned
    // );

    this.selectedVehiclesByPage.delete(this.currentPage);
    this.pageSelectionState[this.currentPage] = false;

    this.currentlyOwnedVehiclesOnPage.forEach((vehicle) => {
      this.selectedVehicleStates[vehicle.Id] = false;
      this.deleteselectedVehicleIds = this.deleteselectedVehicleIds.filter(
        (id) => id !== vehicle.Id
      );
    });

    this.updateVehicleClasses();
    this.updateCheckboxStates();
    this.updateButtonVisibility();
  }

  updateButtonVisibility() {
    // const currentlyOwnedVehiclesOnPage = this.vehicleData.filter(
    //   (vehicle) => vehicle.statusOwned
    // );
    const selectedVehicleIdsOnPage =
      this.selectedVehiclesByPage.get(this.currentPage) || [];
    const totalOwnedOnPage = this.currentlyOwnedVehiclesOnPage.length;

    console.log(
      "currentlyOwnedVehiclesOnPage",
      this.currentlyOwnedVehiclesOnPage
    );
    console.log("selectedVehicleIdsOnPage", selectedVehicleIdsOnPage);
    if (totalOwnedOnPage === 0) {
      this.showSelectAllButton = true;
      this.showDeselectAllButton = false;
    } else {
      this.showSelectAllButton =
        selectedVehicleIdsOnPage.length < totalOwnedOnPage;
      this.showDeselectAllButton =
        selectedVehicleIdsOnPage.length >= totalOwnedOnPage;
    }
  }

  initializePageSelectionState() {
    for (let i = 1; i <= this.totalPageCount; i++) {
      this.pageSelectionState[i] = false;
    }
  }

  handleCheckboxChange(event) {
    event.stopPropagation();
    const vehicleId = event.target.dataset.id;
    const isChecked = event.target.checked;

    this.selectedVehicleStates[vehicleId] = isChecked;
    this.updateVehicleClasses();
    this.updateButtonVisibility();
    this.handleCheckboxChangeFromCard(vehicleId, isChecked);
  }

  handleCheckboxChangeFromCard(vehicleId, isChecked) {
    if (isChecked) {
      if (!this.deleteselectedVehicleIds.includes(vehicleId)) {
        this.deleteselectedVehicleIds.push(vehicleId);
      }
    } else {
      this.deleteselectedVehicleIds = this.deleteselectedVehicleIds.filter(
        (id) => id !== vehicleId
      );
    }

    this.updateVehicleClasses();

    // const currentlyOwnedVehiclesOnPage = this.vehicleData.filter(
    //   (vehicle) => vehicle.statusOwned
    // );
    const totalOwnedOnPage = this.currentlyOwnedVehiclesOnPage.length;
    const totalSelectedOnPage = this.currentlyOwnedVehiclesOnPage.filter(
      (vehicle) => this.selectedVehicleStates[vehicle.Id]
    ).length;

    if (totalSelectedOnPage === totalOwnedOnPage) {
      this.pageSelectionState[this.currentPage] = true;
      this.selectedVehiclesByPage.set(
        this.currentPage,
        this.currentlyOwnedVehiclesOnPage.map((vehicle) => vehicle.Id)
      );
    } else {
      this.pageSelectionState[this.currentPage] = false;
      this.selectedVehiclesByPage.set(
        this.currentPage,
        this.currentlyOwnedVehiclesOnPage
          .filter((vehicle) => this.selectedVehicleStates[vehicle.Id])
          .map((vehicle) => vehicle.Id)
      );
    }

    this.updateCheckboxStates();
    this.updateButtonVisibility();
  }

  updateCheckboxStates() {
    const checkboxes = this.template.querySelectorAll(
      'input[type="checkbox"][name="delete"]'
    );
    checkboxes.forEach((checkbox) => {
      const vehicleId = checkbox.dataset.id;
      checkbox.checked = this.selectedVehicleStates[vehicleId] || false;
      checkbox.disabled = this.vehicleData.find(
        (veh) => veh.Id === vehicleId
      ).statusDeleted;
    });
  }

  updateVehicleClasses() {
    this.vehicleData = this.vehicleData.map((vehicle) => {
      const isSelected = this.deleteselectedVehicleIds.includes(vehicle.Id);
      return {
        ...vehicle,
        className: isSelected ? "card border-class" : "card",
        isChecked: isSelected
      };
    });
  }

  get isDeleteDisabled() {
    return this.deleteselectedVehicleIds.length === 0;
  }

  handledeleteopenmodal() {
    console.log(
      "del veh idddddddd in delete open modal",
      this.deleteselectedVehicleIds
    );
    deletevehicleinfomodal({ vehicleIds: this.deleteselectedVehicleIds })
      .then((result) => {
        console.log(
          "All Vehicle delete veh data Data exp date:",
          JSON.stringify(result)
        );

        this.formattedVehicles = [];
        this.statusArray = [];

        if (Array.isArray(result) && result.length > 0) {
          this.formattedVehicles = result.map((item) => {
            const vehicle = item.vehicle;
            const certificates = item.certificates || [];
            const branches = item.branches || [];
            let branchDisplay = "-";
            let morethanOneBranch = false;
            let onScreenBranchCount = 0;
            this.totalbranchcountDel = branches.length;
            if (branches.length > 0) {
              const firstBranchName = branches[0].Name;
              const abbreviatedBranchName =
                this.abbreviateName(firstBranchName);

              branchDisplay = abbreviatedBranchName;

              if (branches.length > 1) {
                morethanOneBranch = true;
                onScreenBranchCount = branches.length - 1;
              }
            }
            let certificateTitleCount = "-";
            const lengthOfTitle =
              certificates && certificates.length > 0
                ? certificates[0].length
                : 0;
            if (lengthOfTitle > 15) {
              certificateTitleCount =
                certificates[0].substring(0, 15) +
                "...など" +
                certificates.length +
                "枚";
            } else {
              certificateTitleCount =
                certificates[0] + "など" + certificates.length + "枚";
            }

            this.statusArray.push({
              vehicleId: vehicle.Id,
              status: vehicle.Status__c
            });

            return {
              ...vehicle,
              branches: branchDisplay,
              certificateTitleCount,
              totalbranchcountDel: this.totalbranchcountDel,
              allbranches: branches,
              branchReal: branches.length > 0 ? branches[0].Name : "-",
              morethanOneBranch: morethanOneBranch,
              onScreenBranchCount: onScreenBranchCount,
              Delivery_Date_del: this.formatJapaneseDate(
                vehicle.Delivery_Date__c
              ),
              Expdate_del: this.formatJapaneseDate(
                vehicle.Vehicle_Expiration_Date__c
              ),
              First_reg_del: this.formatJapaneseDate(
                vehicle.First_Registration_Date__c
              )
            };
          });
        } else {
          console.error("No vehicle data found.");
        }

        console.log(
          "Formatted vehicle dates:",
          JSON.stringify(this.formattedVehicles)
        );

        this.totalVehiclesdelete = this.formattedVehicles.length;

        if (this.totalVehiclesdelete > 0) {
          this.showPage(0);
          this.isdeleteModalOpen = true;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
  closeModaldelete() {
    this.isdeleteModalOpen = false;
  }
  abbreviateName(name, maxLength = 11) {
    if (name && name.length > maxLength) {
      return `${name.slice(0, 5)}...`;
    }
    return name;
  }
  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    if (value.length > maxLength) {
      event.target.value = value.substring(0, maxLength);
    }
  }
  branchopen() {
    this.BranchesModal = true;
  }
  branchClose() {
    this.BranchesModal = false;
  }
  showPage(pageIndex) {
    this.currentPagedelete = pageIndex;
    this.currentVehicledelete = this.formattedVehicles[pageIndex];
    this.currentPageDisplaydelete = pageIndex + 1;
    this.isPrevDisableddelete = this.currentPagedelete === 0;
    this.isNextDisableddelete =
      this.currentPagedelete === this.totalVehiclesdelete - 1;

    if (this.pageData[pageIndex]) {
      this.SelectedStatus = this.pageData[pageIndex].SelectedStatus || "保有中";
      this.selectedReason = this.pageData[pageIndex].selectedReason || "";
      this.deletedescription = this.pageData[pageIndex].deletedescription || "";
      this.vehgoesdeletion = this.pageData[pageIndex].vehgoesdeletion || false;
      this.vehicledeletedescription =
        this.pageData[pageIndex].vehicledeletedescription || false;
      this.allselectedDeleted =
        this.pageData[pageIndex].allselectedDeleted || false;
    } else {
      this.resetFields();
    }
  }

  nextPage() {
    if (this.isSaveddelete === false) {
      this.openconfmodaldelete = true;
      return;
    }
    if (this.currentPagedelete < this.totalVehiclesdelete - 1) {
      this.showPage(this.currentPagedelete + 1);
    }
  }
  prevPage() {
    if (!this.selectedReason) {
      this.pageData[this.currentPagedelete] = {
        SelectedStatus: "保有中",
        selectedReason: "",
        deletedescription: "",
        vehgoesdeletion: false,
        vehicledeletedescription: false,
        allselectedDeleted: true
      };
    }
    if (this.selectedReason === "その他" && !this.deletedescription) {
      this.pageData[this.currentPagedelete] = {
        SelectedStatus: "保有中",
        selectedReason: "",
        deletedescription: "",
        vehgoesdeletion: false,
        vehicledeletedescription: false,
        allselectedDeleted: true
      };
    }
    if (this.currentPagedelete > 0) {
      this.showPage(this.currentPagedelete - 1);
    }
  }
  totalvehicleDelete() {
    return this.isNextDisableddelete;
  }
  handledeletemodalcancel() {
    this.isdeleteModalOpen = false;
  }
  canceldeleteveh() {
    this.cancelmodaldeletevehicle = true;
  }

  OpenStatusList(event) {
    event.stopPropagation();
    this.ShowStatusList = !this.ShowStatusList;
  }
  OpenreasonList(event) {
    event.stopPropagation();
    this.showreasonofdeletelist = !this.showreasonofdeletelist;
  }
  handleInsideClick(event) {
    event.stopPropagation();
  }

  resetFields() {
    this.SelectedStatus = "保有中";
    this.selectedReason = "";
    this.deletedescription = "";
    this.vehgoesdeletion = false;
    this.vehicledeletedescription = false;
    this.allselectedDeleted = true;
  }

  handleStatusSelect(event) {
    this.SelectedStatus = event.target.dataset.idd;
    this.ShowStatusList = false;

    if (this.SelectedStatus === "削除済み") {
      this.vehgoesdeletion = true;
      this.allselectedDeleted = false;
    } else {
      this.vehgoesdeletion = false;
      this.vehicledeletedescription = false;
      this.allselectedDeleted = true;
      this.selectedReason = "";
    }

    this.updatePageData();
  }

  handleReasonSelect(event) {
    this.selectedReason = event.target.dataset.idd;
    this.showreasonofdeletelist = false;

    if (this.selectedReason === "その他") {
      this.vehicledeletedescription = true;
      this.allselectedDeleted = false;
    } else {
      this.vehicledeletedescription = false;
      this.allselectedDeleted = this.selectedReason !== null;
    }

    this.updatePageData();
  }

  handledeletedescription(event) {
    this.handlevalchange(event);
    this.deletedescription = event.target.value;
    if (this.deletedescription && this.deletedescription.trim() !== "") {
      this.allselectedDeleted = true;
    } else {
      this.allselectedDeleted = false;
    }

    this.updatePageData();
  }

  updatePageData() {
    this.pageData[this.currentPagedelete] = {
      SelectedStatus: this.SelectedStatus,
      selectedReason: this.selectedReason,
      deletedescription: this.deletedescription,
      vehgoesdeletion: this.vehgoesdeletion,
      vehicledeletedescription: this.vehicledeletedescription,
      allselectedDeleted: this.allselectedDeleted
    };
  }

  finaldeleteveh(event) {
    const vehicleId = event.currentTarget.dataset.id;
    this.isComplete = true;
    this.isSaveddelete = true;
    this.allselectedDeleted = false;
    this.openconfmodaldelete = false;
    this.pageData[this.currentPagedelete] = {
      SelectedStatus: this.SelectedStatus,
      selectedReason: this.selectedReason,
      deletedescription: this.deletedescription,
      vehgoesdeletion: this.vehgoesdeletion,
      vehicledeletedescription: this.vehicledeletedescription,
      allselectedDeleted: this.allselectedDeleted
    };

    const selectedOption = this.StatusOptions.find(
      (option) => option.label === this.SelectedStatus
    );
    const selectedstatusvalue = selectedOption.value;
    const selectedReason = this?.reasonOptions?.find(
      (option) => option.label === this.selectedReason
    );
    const selectedReasonvalue = selectedReason?.value;
    if (selectedstatusvalue) {
      this.statusArray = this.statusArray || [];
      const vehicleIndex = this.statusArray.findIndex(
        (statusObj) => statusObj.vehicleId === vehicleId
      );
      if (vehicleIndex !== -1) {
        this.statusArray[vehicleIndex].status = selectedstatusvalue;
      } else {
        this.statusArray.push({
          vehicleId: vehicleId,
          status: selectedstatusvalue
        });
      }
    }
    deletesavevehicle({
      vehicleId: vehicleId,
      status: selectedstatusvalue,
      reason: selectedReasonvalue,
      Description: this.deletedescription
    })
      .then((result) => {
        console.log("inside delete save", result);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  showModalAndRefresh() {
    this.showModalsmall = true;
    setTimeout(() => {
      this.showModalsmall = false;
    }, 2000);
  }

  handleComplatedelete() {
    if (!this.statusArray || !Array.isArray(this.statusArray)) {
      console.error("Error: statusArray is not defined or is not an array.");
      return;
    }
    let hasOwnedVehicle = false;
    let hasDeletedVehicle = false;
    for (let i = 0; i < this.statusArray.length; i++) {
      const status = this.statusArray[i].status;
      console.log(`Vehicle status at index ${i}:`, status);

      if (status && status.trim() === "CurrentlyOwned") {
        hasOwnedVehicle = true;
        break;
      }
      if (status && status.trim() === "Deleted") {
        hasDeletedVehicle = true;
      }
    }

    if (hasOwnedVehicle) {
      this.completeconfirmModal = true;
    } else {
      this.isdeleteModalOpen = false;
      this.selectedall = false;
      this.isSaveddelete = false;
      this.pageData = [];
      this.SelectedStatus = "保有中";
      this.isComplete = false;
      this.selectedReason = "";
      this.deletedescription = "";
      this.vehicledeletedescription = false;
      this.vehgoesdeletion = false;
      this.completeconfirmModal = false;
      this.deleteselectedVehicleIds = [];
      this.selectedVehicleStates = {};
      this.deletebuttonsall = false;
      this.MainTemplateofbuttons = true;
      this.selectedVehiclesByPage.clear();
      this.deletecheckboxoverfav = false;
      this.showSelectAllButton = true;
      this.showDeselectAllButton = false;
      this.updateButtonVisibility();
      if (hasDeletedVehicle) {
        this.showModalAndRefresh();
      }
      refreshApex(this.vehicleListApiData);
    }
  }

  handlecompleteyes() {
    // this.showModalAndRefresh();
    sessionStorage.removeItem("ongoingTransaction");
    this.selectedVehicleStates = {};
    this.deleteselectedVehicleIds = [];
    this.SelectedStatus = "保有中";
    this.selectedVehiclesByPage.clear();
    this.pageData = [];
    this.isSaveddelete = false;
    this.isComplete = false;
    this.showSelectAllButton = true;
    this.showDeselectAllButton = false;
    this.selectedReason = "";
    this.deletedescription = "";
    this.vehicledeletedescription = false;
    this.vehgoesdeletion = false;
    this.selectedall = false;
    this.isdeleteModalOpen = false;
    this.completeconfirmModal = false;
    this.deletebuttonsall = false;
    this.MainTemplateofbuttons = true;
    this.deletecheckboxoverfav = false;
    let hasDeletedVehicle = false;
    for (let i = 0; i < this.statusArray.length; i++) {
      const status = this.statusArray[i].status;
      console.log(`Vehicle status at index ${i}:`, status);
      if (status && status.trim() === "Deleted") {
        hasDeletedVehicle = true;
      }
    }
    if (hasDeletedVehicle) {
      this.showModalAndRefresh();
    }
    refreshApex(this.vehicleListApiData);
    this.updateButtonVisibility();
    this.updateVehicleClasses();
  }

  handlecompleteno() {
    this.completeconfirmModal = false;
  }

  handleDeleteOutsideClick1 = (event) => {
    const dataDropElement = this.template.querySelector(
      ".Delete-vehicle-picklists"
    );
    const listsElement = this.template.querySelector(".l1");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.ShowStatusList = false;
    }
  };
  handleDeleteOutsideClick2 = (event) => {
    const dataDropElement = this.template.querySelector(
      ".Delete-vehicle-picklists"
    );
    const listsElement = this.template.querySelector(".l2");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showreasonofdeletelist = false;
    }
  };

  handlecanceldelete() {
    this.openconfmodaldelete = false;
    // this.cancelmodaldeletevehicle = true;
  }

  handlecanceldeleteno() {
    this.cancelmodaldeletevehicle = false;
  }
  handlecanceldeleteyes() {
    this.SelectedStatus = "保有中";
    this.selectedReason = "";
    this.deletedescription = "";
    this.vehicledeletedescription = false;
    this.vehgoesdeletion = false;
    this.allselectedDeleted = true;
    this.pageData = [];
    this.isdeleteModalOpen = false;
    this.cancelmodaldeletevehicle = false;
  }
  handleyesnextdelete() {
    this.openconfmodaldelete = false;
    if (!this.selectedReason) {
      this.pageData[this.currentPagedelete] = {
        SelectedStatus: "保有中",
        selectedReason: "",
        deletedescription: "",
        vehgoesdeletion: false,
        vehicledeletedescription: false,
        allselectedDeleted: true
      };
    }
    if (this.selectedReason === "その他" && !this.deletedescription) {
      this.pageData[this.currentPagedelete] = {
        SelectedStatus: "保有中",
        selectedReason: "",
        deletedescription: "",
        vehgoesdeletion: false,
        vehicledeletedescription: false,
        allselectedDeleted: true
      };
    }
    if (this.currentPagedelete < this.totalVehiclesdelete - 1) {
      this.showPage(this.currentPagedelete + 1);
    }
  }

  /*branch selection drop down*/
  toggleBrachSelection(event) {
    event.stopPropagation();
    this.showSortingModal = false;
    this.showBranchSelection = !this.showBranchSelection;
  }

  handleBranchSelect(event) {
    this.currentPage = 1;
    const branchId = event.target.name;
    const isChecked = event.target.checked;
    console.log("at start");

    this.deleteselectedVehicleIds = [];
    this.selectedVehicleStates = {};
    this.selectedVehiclesByPage.clear();
    this.updateButtonVisibility();
    if (branchId === "すべて") {
      this.branchOptions = this.branchOptions.map((branch) => {
        return { ...branch, selected: isChecked };
      });
      console.log("in if", this.branchOptions);
    } else {
      console.log("in else");
      this.branchOptions = this.branchOptions.map((branch) => {
        if (branch.branchId === branchId) {
          return { ...branch, selected: isChecked };
        }
        return { ...branch };
      });
      console.log("in else 1");

      const allBranchesSelected = this.branchOptions
        .filter((branch) => branch.branchId !== "すべて")
        .every((branch) => branch.selected);
      console.log("in else 2");

      this.branchOptions = this.branchOptions.map((branch) => {
        if (branch.branchId === "すべて") {
          branch.selected = allBranchesSelected;
        }
        return branch;
      });
      console.log("in else 3");
    }
    console.log("at end");
    this.branchDataToSendBack = this.branchOptions
      .filter((elm) => elm.selected === true && elm.branchId !== "すべて")
      .map((elm) => elm.branchId);

    this.finalFilterJson = {
      ...this.finalFilterJson,
      brnIds: this.branchDataToSendBack
    };

    this.finalFilterJsonForClass = {
      ...this.finalFilterJsonForClass,
      brnIds: this.branchDataToSendBack
    };
    // this.finalFilterJsonForClass = this.finalFilterJson;
    console.log(
      "data of branches to send back for list updation:- ",
      JSON.stringify(this.branchDataToSendBack)
    );
  }

  handleFilterSave() {
    this.showFilterModal = false;
    this.deleteselectedVehicleIds = [];
    this.selectedVehicleStates = {};
    this.selectedVehiclesByPage.clear();
    this.updateButtonVisibility();
    Object.keys(this.sortChecked).forEach((key) => {
      this.sortChecked[key] = false;
    });
    console.log("in final save", this.showFilterModal);

    // this.selectedPillsForList = this.finalFilterJson;
    document.body.style.overflow = "";
    this.finalFilterJsonForClass = this.finalFilterJson;
    this.currentPagination = Number(this.currentPagination) + 1;
    setTimeout(() => {
      this.currentPagination = Number(this.currentPagination) - 1;
    }, 0);
    console.log(JSON.stringify(this.finalFilterJson));
    console.log(
      "finalFilterJsonForClass",
      JSON.stringify(this.finalFilterJsonForClass)
    );
  }

  //sorting
  tooglesortmodal(event) {
    event.stopPropagation();
    this.showBranchSelection = false;
    this.showSortingModal = !this.showSortingModal;
  }
  handleSortChange(event) {
    this.sortSelectedValue = event.target.value;
    // eslint-disable-next-line guard-for-in
    for (let key in this.sortChecked) {
      if (key !== event.target.value) this.sortChecked[key] = false;
      else this.sortChecked[key] = event.target.checked;
    }
  }

  resetSortofvehicles() {
    this.sortSelectedValue = "Default";
    this.finalsortingValue = "Default";
    // eslint-disable-next-line guard-for-in
    for (let key in this.sortChecked) {
      this.sortChecked[key] = false;
    }
    this.template.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.checked = false;
    });
    this.updateButtonVisibility();
    this.showSortingModal = false;
  }
  FinalSorttoSend() {
    this.finalsortingValue = this.sortSelectedValue;
    this.updateButtonVisibility();
    this.showSortingModal = false;
  }
  showvehiclelistbottomicons() {
    this.showonclickofmorefilter = !this.showonclickofmorefilter;
  }

  // truckonnect link open
  redirectTruckonnet(event) {
    event.stopPropagation();
    window.open(this.truckonnetURL, "_blank");
  }
  //recover
  @track Recoverbuttonsall = false;
  @track MainTemplateofbuttons = true;

  openRecoverDelete() {
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    ongoingTransactions.vehicleListRecoverTxn = true;

    sessionStorage.setItem(
      "ongoingTransaction",
      JSON.stringify(ongoingTransactions)
    );

    this.MainTemplateofbuttons = false;
    this.Recoverbuttonsall = true;
  }
  CloseRecoverDelete() {
    sessionStorage.removeItem("ongoingTransaction");
    this.Recoverbuttonsall = false;
    this.MainTemplateofbuttons = true;
  }

  formatMileage(mileage) {
    return mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
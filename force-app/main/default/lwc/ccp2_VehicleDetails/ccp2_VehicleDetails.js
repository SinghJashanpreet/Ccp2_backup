/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, wire, track, api } from "lwc";
import { refreshApex } from "@salesforce/apex";
//import getVehicleById from "@salesforce/apex/CCP2_VehicleDetailController.getVehicleById";
import getVehicleByIdNew from "@salesforce/apex/CCP2_VehicleDetailController.vehicleDetail";
import leaseInformation from "@salesforce/apex/CCP2_Notification_Controller.leaseInfo";
import truckconnectDetails from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.truckconnectDetails";
import branchOptionsApi from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.getVehicleBranch";
import updateeditinfo from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.updateVehicle";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import DataCloudMaintenanceCreation from "@salesforce/apex/CCP2_MaintenanceBookingProcessor.processMaintenanceBookings";

//import MaintainenceLeaseInfo from "@salesforce/apex/CCP2_Notification_Controller.maintenanceLeaseInfo";
import getImagesAsBase64 from "@salesforce/apex/VehicleImageService.getImagesAsBase64";
// import getMarketMeasureApi from "@salesforce/apex/ccp2_download_recall_controller.recallinfo";
import getMarketMeasureParamsApi from "@salesforce/apex/ccp2_download_recall_controller.recallinfoNew";
import deleteAndRecovervehicle from "@salesforce/apex/ccp2_download_recall_controller.deleteAndRecoverVehicle";
import vehicleBranchName from "@salesforce/apex/CCP2_VehicleDetailController.vehicleBranchName";
//import getVehicleCertificates from "@salesforce/apex/CCP2_VehicleDetailController.vehicleImageCountTitle";
import updateFavVehicleApi from "@salesforce/apex/CCP2_VehicleDetailController.updateFavVehicle";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import DELETE_STATUS from "@salesforce/schema/ccp2_Registered_Vehicle__c.Status__c";
import DELETE_REASON from "@salesforce/schema/ccp2_Registered_Vehicle__c.Reason__c";
// import truckonnectLogo from "@salesforce/resourceUrl/CCP2_Truckonnect";
import CCP2_Resources from "@salesforce/resourceUrl/CCP2_Resources";
import labelsVehicle from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import getAllServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import Id from "@salesforce/user/Id";

import getUserServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import createLeaseDetail from "@salesforce/apex/CCP2_Additional_Services.createOtherLease";

const editIcon = CCP2_Resources + "/CCP2_Resources/Vehicle/write.png";
const dropdownImg = CCP2_Resources + "/CCP2_Resources/Common/arrow_under.png";
const TruckSampleImage =
  CCP2_Resources + "/CCP2_Resources/Vehicle/TruckSample.png";
const vehicleIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/delete_vehicle.png";
const downloadIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/file_download.png";
const EmptyRecallDataIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/Empty-recall.png";
const Arrowgrey =
  CCP2_Resources + "/CCP2_Resources/Vehicle/arrow_under-grey.png";
const TruckConnectDetailIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/TruckConnectDetails.png";

export default class Ccp2_VehicleDetails extends LightningElement {
  Arrowdisabled = Arrowgrey;
  TKIcon = TruckConnectDetailIcon;
  @track uid = Id;
  @track vehicleChessisNumberForHistory;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;

  @track vehicleByIdLoader = false;
  @track showEmptyContiner = false;
  @track vehicleidforpictures = "";
  @track showTKwarnMessage = false;
  @track uid = Id;

  @track allServices = [];
  @track hasVehicleManagement = true;
  // @track hasVehicles = true;
  @api vehicleIcons;
  @api vehicleId;
  @track showVehicleDetails = true;
  @track isdoornumberempty = false;
  @track branchOptions = [];
  @track truckConnectData = {
    Contractstartdate: "-",
    ContractEnddate: "-",
    Contractdetails: "-",
    AutomaticUpdates: "-"
  };
  truckSampleIcon = TruckSampleImage;
  @track vehidnew = "";
  @track statusofvehicle = "";
  @track showCostManagement = false;
  @track maintainlistactive = false;
  @track showMaintainList = false;
  @track clickedtab = "";
  @track showvehDetails = true;
  @track showRecallMessage = false;
  @track isExpiringSoon = false;
  @track showvehDetailsDeleted = false;
  @track showMaintainencePage = false;
  @track showLeaseInformation = false;
  @track showTruckConnectList = false;
  @track MaintainTypeRecord = "";
  @track BranchesModal = false;
  @track morethanOneBranch = true;
  @track showone = true;
  @track showMainvehiclebuttons = true;
  @track noreasonisselected = true;
  @track classVehicleDetails = "underline-button-black";
  @track classMarketMeasure = "underline-button";
  @track classTruckConnectMain = "underline-button";
  @track ClassLeaseInformation = "underline-button";

  @track classCostManagement = "";
  @track classMaintainList = "underline-button";
  @track vehId = "";
  dropdown = dropdownImg;
  @track uploadImageCss = "upload-image";
  @track currentDate = "";
  @track marketMeasureData = [];
  @track marketMeasureDataTem = [];
  @track wiredVehicleResult = [];
  @track recallCatFilter = {
    selectAll: true,
    option1: true,
    option2: true,
    option3: true
  };
  @track implementationFilter = {
    selectAll: true,
    option1: true,
    option2: true,
    option3: true
  };
  emptyRecallDataIcon = EmptyRecallDataIcon;
  @track isModalOpen = false;
  @track showRecallCategoryDropdown = false;
  @track showImplementationDropdown = false;
  //download feature
  @track openDownloadModal = false;
  @track ShowSuccessDownload = false;
  @track downloadbranch = [];
  @track downloadvehicles = {};
  @track DownloadNameValue = "日付- カスタマーポータル車両リスト";

  @track uploadImageCss = "upload-image";
  @track uploadImagesArray = [];
  @track showsuretoeditModal = false;
  @track isModalOpen = false;
  @track noImagesAvailable = false;
  @track imagesAval = false;
  editIcon = editIcon;
  vehicleIcon = vehicleIcon;
  downloadIcon = downloadIcon;
  isStarFilled = false;
  @track certificateTitleCount = "-";
  @track Branches = [];
  @track isImageModalOpen = true;
  @track imagesAvailable = true;
  @track LeaseInfoActive = false;
  @track currentImageIndex = 0;
  @track showgobacktolist = false;
  @track showgobacktolistTabs = false;
  @track isLastPage = true;
  @track isFirstPage = true;
  @track totalPages = 1;
  @track currentChassisNumber;
  @track allImages;
  @track uploadCertImagesArray = this.allCertificates || null;
  @track vehicelInfoId;
  @track categoryFilerListForQuery = [
    "リコール",
    "サービス キャンペーン",
    "改善対策"
  ];
  @track implementationStatusFilerListForQuery = [
    "未実施",
    "一部実施済み",
    "実施済み"
  ];
  @track finalSort;
  @track renovationSortForQuery = "";
  @track notificationSortForQuery = "DESC";
  @track vehicleIdForQuery = this.vehicleId;
  // @track finalQuery =
  //   `SELECT  ccp2_recallCategory__c, ccp2_implementationStatus__c,
  //      notificationDate__c, renovationDate__c, controlNumber__c, recallSubject__c
  //       FROM recallInfo__c `;

  @track innerContainerLoader = false;

  @track showNormalSortIcon1 = true;
  @track showErrorMileageModal = false;
  @track showDescSortIcon1 = false;
  @track showAscSortIcon1 = false;
  @track showNormalSortIcon2 = false;
  @track showDescSortIcon2 = true;
  @track showAscSortIcon2 = false;

  //delete vehicle variables
  @track opendeletesystem = false;
  @track openDeleteModal = false;
  @track cancelmodaldeletevehicle = false;

  @track ShowStatusList = false;
  @track showreasonofdeletelist = false;
  @track allselectedDeleted = true;
  @track ShowSuccessDelete = false;
  @track SelectedStatus = "";
  @track selectedReason = "";
  @track deletedescription = "";
  @track StatusOptions = [];
  @track reasonOptions = [];

  // truckLogoUrl = truckonnectLogo;

  truckonnetURL = "https://qa.truckonnect.jp";

  // outsideClickHandlerAdded = false;
  // @api showVehicle;
  @track vehicleByIdData = {
    id: 100,
    name: "-",
    type: "-",
    carBodyShape: "-",
    chassisNumber: "-",
    doorNumber: "-",
    firstRegistrationDate: "-",
    Favourite: "-",
    typeOfFuel: "-",
    mileage: "-",
    Newmileage: "-",
    newDoor: "-",
    doorEllipse: "-",
    branch: "-",
    branch2: "",
    branch3: "",
    branchCount: "-",
    branchReal: "-",
    branchReal2: "",
    branchReal3: "",
    OnScreenBranchCount: "-",
    privateBusinessUse: "-",
    vehicleNumber: "-",
    affiliation: "-",
    vehicleInspectionCertificateIssueDate: "-",
    vehicleInspectionImage: "-",
    purpose: "-",
    model: "-",
    vehicleWeigth: "-",
    registerationNumber: "-",
    expirationDate: "-",
    devileryDate: "-",
    branchInfo: []
  };

  @track isDoorNumberCancel = false;
  @track isMileageCancel = false;
  @track isBranchCancel = false;
  @track ShowSuccessRecover = false;
  @track nextBtnCss = "next-btn1";

  @track allServices = [];
  @track hasDTFSA = false;

  //sorting dates variable tk
  @track startDateSortForQuery = "DESC";
  @track showdefaultIconStartDate = false;
  @track showascIconStartDate = false;
  @track showdscIconStartDate = true;

  @track enddateSortForQuery = "";
  @track showdefaultIconEndDate = true;
  @track showascIconEndDate = false;
  @track showdscIconEndDate = false;
  @track recallModal = false;

  @track catRecallPicklist = [
    {
      label: "リコール"
    },
    {
      label: "サービス キャンペーン"
    },
    {
      label: "改善対策"
    }
  ];

  @track implemenRecallPicklist = [
    {
      label: "未実施"
    },
    {
      label: "サービス 一部実施済み"
    },
    {
      label: "実施済み"
    }
  ];
  @track catDropdown = false;
  @track impstatusDropdown = false;

  @track recallCategoryselected = "";
  @track recallImpstatusSelected = "";

  @track deleteConfirm = false;

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

  @track isCalendarOpen2L1 = false;
  @track myday2L1;
  @track myMonth2L1;
  @track myYear2L1;
  @track selectedDay2L1; // To track the currently selected day
  @track month2L1 = new Date().getMonth() + 1;
  @track year2L1 = new Date().getFullYear();
  @track calendarDates2L1 = [];
  @track selectedDateToSend2L1 = null;
  @track selectedDate2L1 = null;

  @track isNextMonthDisabled2L1 = false;
  @track isPrevMonthDisabled2L1 = false;


  @track isCalendarOpen2R2 = false;
  @track selectedDate2R2 = null;
  @track selectedDateToSend2R2 = null;
  @track year2R2 = new Date().getFullYear();
  @track month2R2 = new Date().getMonth() + 1;
  @track calendarDates2R2 = [];
  @track selectedDay2R2; // To track the currently selected day
  @track isNextMonthDisabled2R2 = false;
  @track isPrevMonthDisabled2R2 = false;
  @track showPosterreal = false;
  @track myday2R2;
  @track myMonth2R2;
  @track myYear2R2;


  @track inputRecallData = {
    inputClassification: "",
    inputImpStatus: "",
    inputImpDate: "",
    inputRecallSubject: "",
    inputNotifDate: "",
    inputManagementNum: "",
    inputMemo: ""
  };


  get isweightValid() {
    return this.vehicleByIdData.vehicleWeigth !== "-";
  }

  get isgrossweightValid() {
    return this.vehicleByIdData.grossWeigth !== "-";
  }

  get ispayloadweightValid() {
    return this.vehicleByIdData.maxpayLoad !== "-";
  }

  updateFavVehicle(vehId, favBool, favIconName) {
    updateFavVehicleApi({ vehicleId: vehId, favVehicle: favBool })
      .then(() => {
        if (favIconName === "utility:favorite") {
          console.log(
            "Vehicle Favourite icon updated!!1",
            this.vehicleByIdData
          );
          this.vehicleByIdData.Favourite = "utility:favorite_alt";
          console.log(
            "Vehicle Favourite icon updated!!2",
            this.vehicleByIdData
          );
        } else {
          console.log(
            "Vehicle Favourite icon updated!!3",
            this.vehicleByIdData
          );
          this.vehicleByIdData.Favourite = "utility:favorite";
          console.log(
            "Vehicle Favourite icon updated!!4",
            this.vehicleByIdData
          );
        }
      })
      .catch((err) => {
        console.log("Vehicle Favourite icon updated!!", vehId, favBool);
        console.error(err);
        let error = JSON.stringify(err);
        ErrorLog({
          lwcName: "ccp2_vehicleDetails",
          errorLog: error,
          methodName: "FAV ICON CLASS",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data fetch",
          ModuleName: "VehicleManagement"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

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
          lwcName: "ccp2_vehicleDetails",
          errorLog: err,
          methodName: "load labels",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data fetch",
          ModuleName: "VehicleManagement"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  fetchUserServices() {
    getUserServices({ userId: this.uid, refresh: 0 })
      .then((data) => {
        if (data) {
          this.allServices = data;
          this.allServices.forEach((serv) => {
            if (serv.apiName === "FUSO_CCP_External_Vehicle_management") {
              this.hasVehicleManagement = serv.isActive;
              if (this.hasVehicleManagement === false) {
                let baseUrl = window.location.href;
                let Newurl;
                if (baseUrl.indexOf("/s/") !== -1) {
                  Newurl = baseUrl.split("/s/")[0] + "/s/error";
                }
                window.location.href = Newurl;
              }
            }
          });
        }
      })
      .catch((error) => {
        console.error("User Services Fetching error:", error);
      });
  }

  handleProcessMaintenanceBookings() {
    console.log(
      "this.vehicleId in data cloud : -",
      this.vehicleId,
      this.innerContainerLoader
    );
    DataCloudMaintenanceCreation({ vehicleId: this.vehicleId })
      .then((result) => {
        console.log("Data received FROM DATACLOUD:", result);
        this.innerContainerLoader = false;
      })
      .then(() => {
        let newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=maintenancelist`;
        window.history.replaceState({}, document.title, newUrl);
        const maintainhistoryquery = this.template.querySelector(
          "c-ccp2-_-maintenance-history"
        );
        if (maintainhistoryquery) {
          maintainhistoryquery.returnToList();
        }
        this.showMaintainList = true;
        this.closeBranchedit();
        this.closemileageedit();
        this.showVehicleDetails = false;
        this.showTruckConnectList = false;
        this.maintainlistactive = true;
        this.showCostManagement = false;
        this.showMarketMeasure = false;
        this.showLeaseInformation = false;
        this.isAllSelected = true;
        this.isVehicleSelected = false;
        this.LeaseInfoActive = false;
        this.classVehicleDetails = "underline-button";
        this.classCostManagement = "";
        this.classMaintainList = "underline-button-black";
        this.classMarketMeasure = "underline-button";
        this.ClassLeaseInformation = "underline-button";
        this.classTruckConnectMain = "underline-button";
      })
      .catch((error) => {
        // this.error = error;
        console.error("Error received DATACLOUD:", error);
        // Handle the error as needed
      });
  }

  //Delete Picklists
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
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_vehicleDetails",
        errorLog: err,
        methodName: "service type picklist",
        ViewName: "Vehicle Details",
        InterfaceName: "CCP User Interface",
        EventName: "Data fetch",
        ModuleName: "VehicleManagement"
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
    fieldApiName: DELETE_REASON
  })
  wiredServiceFactoryPicklist({ data, error }) {
    if (data) {
      this.reasonOptions = data.values.map((item) => {
        return { label: item.label, value: item.value };
      });
    } else if (error) {
      console.error(error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_vehicleDetails",
        errorLog: err,
        methodName: "service factory",
        ViewName: "Vehicle Details",
        InterfaceName: "CCP User Interface",
        EventName: "Data fetch",
        ModuleName: "VehicleManagement"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }
  //delete picklist
  @wire(getVehicleByIdNew, { vehicleId: "$vehicleId" }) handledata(result) {
    this.wiredVehicleResult = result; // Store the wire result for refreshing
    console.log("wiredveh", JSON.stringify(this.wiredVehicleResult));

    console.log("resultttt of owreeee", result);
    const { data, error } = result;

    if (data) {
      console.log("geting from vehicle by Id: ", this.vehicleId);
      console.log("geting from vehicle by Id api: ", JSON.stringify(data));
      this.leaseFlag1yr = data.LeaseFlag;
      this.showTKwarnMessage = data.truckConnect;
      console.log("lease flaggggggg", this.leaseFlag1yr);

      this.vehidnew = this.vehicleId;
      this.vehId = this.vehicleId;

      this.vehicelInfoId = data.vehicle?.Vehicle_Info_Id__c;
      this.vehicleChessisNumberForHistory = data.vehicle?.Chassis_number__c;
      if (data.length !== 0) {
        let obj = {
          id: data.vehicle?.Id === undefined ? "-" : data.vehicle?.Id,
          name:
            data.vehicle?.Sub_Brand_Name__c === undefined
              ? "-"
              : data.vehicle?.Sub_Brand_Name__c,
          type:
            data.vehicle?.Vehicle_Type__c === undefined
              ? "-"
              : data.vehicle?.Vehicle_Type__c,
          Favourite: !this.vehicleIcons
            ? data.vehicle?.Favoruite_Vehicle__c === true
              ? "utility:favorite"
              : "utility:favorite_alt"
            : this.vehicleIcons,
          carBodyShape:
            data.vehicle?.Body_Shape_Text__c === undefined
              ? "-"
              : data.vehicle?.Body_Shape_Text__c,
          chassisNumber:
            data.vehicle?.Chassis_number__c === undefined
              ? "-"
              : data.vehicle?.Chassis_number__c,
          doorNumber:
            data.vehicle?.Door_Number__c === undefined
              ? "-"
              : data.vehicle?.Door_Number__c,
          newDoor:
            data.vehicle?.Door_Number__c === undefined
              ? "-"
              : data.vehicle?.Door_Number__c,
          doorEllipse:
            data.vehicle?.Door_Number__c === undefined
              ? "-"
              : data.vehicle.Door_Number__c.length > 16
                ? data.vehicle.Door_Number__c.substring(0, 8) + "..."
                : data.vehicle.Door_Number__c,
          firstRegistrationDate:
            data.vehicle?.First_Registration_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate2(
                  data.vehicle?.First_Registration_Date__c
                ), // Apply Japanese date formatting

          typeOfFuel:
            data.vehicle?.Fuel_Type_Text__c === undefined
              ? "-"
              : data.vehicle?.Fuel_Type_Text__c,
          mileage:
            this.formatMileage(data.vehicle?.Mileage__c) === undefined
              ? "-"
              : this.formatMileage(data.vehicle?.Mileage__c),
          Newmileage:
            this.formatMileage(data.vehicle?.Mileage__c) === undefined
              ? "-"
              : this.formatMileage(data.vehicle?.Mileage__c),
          privateBusinessUse:
            data.vehicle?.Private_Business_Text__c === undefined
              ? "-"
              : data.vehicle?.Private_Business_Text__c,
          vehicleNumber:
            data.vehicle?.Vehicle_Number__c === undefined
              ? "-"
              : data.vehicle?.Vehicle_Number__c,
          affiliation:
            data.vehicle?.affiliation === undefined
              ? "-"
              : data.vehicle?.affiliation,
          vehicleWeigth:
            this.formatMileage(data.vehicle?.vehicleWeight__c) === undefined
              ? "-"
              : this.formatMileage(data.vehicle?.vehicleWeight__c),
          grossWeigth:
            this.formatMileage(data.vehicle?.VehicleGrossWeight__c) ===
            undefined
              ? "-"
              : this.formatMileage(data.vehicle?.VehicleGrossWeight__c),
          maxpayLoad:
            this.formatMileage(data.vehicle?.Payload__c) === undefined
              ? "-"
              : this.formatMileage(data.vehicle?.Payload__c),
          vehSize:
            data.vehicle?.Reg_Vehicle_Size__c === undefined
              ? "-"
              : data.vehicle?.Reg_Vehicle_Size__c,
          model:
            data.vehicle?.fullModel__c === undefined
              ? "-"
              : data.vehicle?.fullModel__c,
          purpose:
            data.vehicle?.Use_Text__c === undefined
              ? "-"
              : data.vehicle?.Use_Text__c,
          vehicleInspectionImage:
            data.vehicle?.vehicleInspectionImage === undefined
              ? "-"
              : data.vehicle?.vehicleInspectionImage,
          vehicleInspectionCertificateIssueDate:
            data.vehicle?.vehicleInspectionCertificateIssueDate === undefined
              ? "-"
              : this.formatJapaneseDate(
                  data.vehicle?.vehicleInspectionCertificateIssueDate
                ), // Apply Japanese date formatting
          registerationNumber:
            data.vehicle?.Registration_Number__c === undefined
              ? "-"
              : data.vehicle?.Registration_Number__c,
          expirationDate:
            data.vehicle?.Vehicle_Expiration_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate3(
                  data.vehicle?.Vehicle_Expiration_Date__c
                ),
          devileryDate:
            data.vehicle?.Delivery_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate3(data.vehicle?.Delivery_Date__c),
          truckConnect:
            data.vehicle?.Truck_Connect__c === 0
              ? ""
              : data.vehicle?.Truck_Connect__c,
          vehicleInfoId:
            data.vehicle?.Vehicle_Info_Id__c ?? '',
          branchInfo:
            data.vehicle?.Branch_Vehicle_Junctions__r?.length === 0
              ? []
              : data.vehicle?.Branch_Vehicle_Junctions__r
        };
        console.log("object geting from vehicle by Id api: ", obj);
        this.vehicleByIdData = obj;
        this.currentChassisNumber =
          data.vehicle?.Chassis_number__c === undefined
            ? ""
            : data.vehicle?.Chassis_number__c;
        const vehicle = data.vehicle;
        this.downloadvehicles = {
          Vehicle_Number__c: vehicle.Vehicle_Number__c || "",
          Registration_Number__c: vehicle.Registration_Number__c || "",
          Chassis_number__c: vehicle.Chassis_number__c || "",
          Delivery_Date__c: vehicle.Delivery_Date__c || "",
          Vehicle_Name__c: vehicle.Vehicle_Name__c || "",
          Vehicle_Type__c: vehicle.Vehicle_Type__c || "",
          Body_Shape__c: vehicle.Body_Shape_Text__c || "",
          vehicleWeight__c: vehicle.vehicleWeight__c || "",
          First_Registration_Date__c: vehicle.First_Registration_Date__c || "",
          Vehicle_Expiration_Date__c: vehicle.Vehicle_Expiration_Date__c || "",
          Mileage__c: vehicle.Mileage__c || "",
          Fuel_Type__c: vehicle.Fuel_Type_Text__c || "",
          Private_Business_use__c: vehicle.Private_Business_Text__c || "",
          Use__c: vehicle.Use_Text__c || "",
          fullModel__c: vehicle.fullModel__c || "",
          Door_Number__c: vehicle.Door_Number__c || "",
          Status__c: vehicle.Status__c || "",
          vehicleSize__c: vehicle.Reg_Vehicle_Size__c || "",
          grossWeigth__c: vehicle.VehicleGrossWeight__c || "",
          MaxPayload__c: vehicle.Payload__c || ""
        };
        console.log("downloaded", JSON.stringify(this.downloadvehicles));
        this.statusofvehicle = data.vehicle?.Status__c;
        if (this.wiredVehicleResult.data.vehicle?.Status__c === "Deleted") {
          this.showvehDetailsDeleted = true;
          this.showvehDetails = false;
          this.SelectedStatus = this.StatusOptions[1].label;
          const matchedReason = this.reasonOptions.find(
            (option) => option.value === data.vehicle?.Reason__c
          );
          this.selectedReason = matchedReason ? matchedReason.label : undefined;
          if (data.vehicle?.Description__c) {
            this.vehicledeletedescriptionRecover = true;
            this.deletedescription = data.vehicle?.Description__c;
          } else {
            this.vehicledeletedescriptionRecover = false;
            this.deletedescription = "";
          }
        } else {
          this.showvehDetails = true;
          this.showvehDetailsDeleted = false;
          if (this.vehicleByIdData.truckConnect == true) {
            this.loadTKData(
              this.startDateSortForQuery,
              this.enddateSortForQuery
            );
            console.log("Tk flag in If", this.vehicleByIdData.truckConnect);
          }
          //this.SelectedStatus = this.StatusOptions[0].label;
        }
        const status = data.vehicle?.CCP2_Recall_Status__c;
        console.log("obisu", status);
        if (status === "Not Completed") {
          console.log("working status of dev");
          this.showRecallMessage = true;
        } else {
          console.log("working status of dev if");
          this.showRecallMessage = false;
        }
        this.isExpiringSoon = data.vehicle?.isExpiringSoon
          ? data.vehicle?.isExpiringSoon
          : false;
        this.loadbranches(this.vehicleByIdData.branchInfo);
        //this.fetchVehicleCertificates();
      }
    } else if (error) {
      // handle error
      console.error("geting from vehicle by Id api: ", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_vehicleDetails",
        errorLog: err,
        methodName: "Main Class data",
        ViewName: "Vehicle Details",
        InterfaceName: "CCP User Interface",
        EventName: "Data fetch",
        ModuleName: "VehicleManagement"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  get showalert() {
    return this.isExpiringSoon || this.showRecallMessage;
  }
  // @wire(getVehicleByIdNew, { vehicleId: "$vehicleId" }) handledataNew(result) {
  //   // this.wiredVehicleResult = result; // Store the wire result for refreshing

  //   const { data, error } = result;

  //   if (data) {
  //     console.log("wiredvehNew", JSON.stringify(data));

  //   } else if (error) {
  //     // handle error
  //     console.error("geting from vehicle by Id api New: ", error);
  //   }
  // }
  @wire(getAllServices, { userId: "$uid", refresh: 0 })
  handlePerm({ data, error }) {
    if (data) {
      this.allServices = data;
      this.allServices.forEach((serv) => {
        if (serv.apiName === "FUSO_CCP_External_Financial_service") {
          this.hasDTFSA = serv.isActive;
        }
      });
    } else {
      console.log("error in perm", error);
    }
  }

  @track branchData;
  loadbranches(data) {
    // this.branchData = vehicleBranchName({ vehicleId: this.vehicleId })
    //   .then((data) => {
    console.log("Getting Branch from vehicle by Id: ", this.vehicleId);
    console.log(
      "Getting Branch from vehicle by Id API: ",
      JSON.stringify(data)
    );

    this.vehId = this.vehicleId;
    console.log(
      "Getting Branch from vehicle by Id API2: ",
      data,
      "data.length",
      data.length
    );
    if (data.length !== 0) {
      console.log(
        "Getting Branch from vehicle by Id API3: ",
        data,
        "data.length",
        data.length
      );
      this.Branches = data;
      if (this.Branches.length <= 3) {
        this.morethanOneBranch = false;
      } else {
        this.morethanOneBranch = true;
      }
      this.vehicleByIdData.branchReal = this.Branches[0].BranchName__c;
      if (this.Branches[1])
        this.vehicleByIdData.branchReal2 = this.Branches[1].BranchName__c;
      if (this.Branches[2])
        this.vehicleByIdData.branchReal3 = this.Branches[2].BranchName__c;
      // if (this.Branches[3]) this.vehicleByIdData.branchReal4 = this.Branches[3].BranchName__c;

      this.vehicleByIdData.branch =
        this.abbreviateName(this.Branches[0].BranchName__c) || "-";
      if (this.Branches[1])
        this.vehicleByIdData.branch2 =
          this.abbreviateName(this.Branches[1].BranchName__c) || "-";
      if (this.Branches[2])
        this.vehicleByIdData.branch3 =
          this.abbreviateName(this.Branches[2].BranchName__c) || "-";
      // if (this.Branches[3]) this.vehicleByIdData.branch4 =
      //   this.abbreviateName(this.Branches[3].BranchName__c) || "-";

      this.vehicleByIdData.branchCount = this.Branches.length;
      this.vehicleByIdData.OnScreenBranchCount =
        this.vehicleByIdData.branchCount > 3
          ? this.vehicleByIdData.branchCount - 3
          : 0;
      this.Branches = data.map((branch) => ({
        ...branch,
        originalName: branch.BranchName__c,
        BranchName__c:
          branch.BranchName__c.length > 11
            ? this.abbreviateName2(branch.BranchName__c)
            : branch.BranchName__c,
        siebelAccountCode__c: branch?.siebelAccountCode__c || "未登録",
        formattedBranchCode: branch?.Branch_Code__c
          ? branch.Branch_Code__c.toString().padStart(3, "0")
          : ""
      }));
      console.log(
        "Branch assigned to vehicleByIdData.branch: ",
        this.vehicleByIdData.branch
      );
      if (data.length > 0) {
        data.forEach((branch) => {
          console.log("Download values: ", JSON.stringify(branch));
          this.downloadbranch.push(branch.BranchName__c);
        });
      }
      // console.log("Branch data from API: ", JSON.stringify(this.Branches));
    } else {
      this.vehicleByIdData.branch = "-";
      this.vehicleByIdData.branch2 = "";
      this.vehicleByIdData.branch3 = "";
      // this.vehicleByIdData.branch4 = "";
      this.vehicleByIdData.branchCount = " ";
      this.morethanOneBranch = false;
      console.log("No branches found, setting branch to '-'.");
    }
    // })
    // .catch((error) => {
    //   console.error("Error getting Branch from vehicle by Id API: ", error);
    // });
  }

  isFullWidth(name) {
    if (!name) return false; // Handle empty or undefined input
    for (const char of name) {
      if (char.charCodeAt(0) <= 255) {
        return false; // Found a half-width character
      }
    }
    return true; // All characters are full-width
  }

  abbreviateName2(name) {
    return this.isFullWidth(name)
      ? name.length <= 10
        ? name
        : name.slice(0, 10) + "..."
      : name.length <= 20
        ? name
        : name.slice(0, 20) + "...";
  }

  abbreviateName3(name) {
    return this.isFullWidth(name)
      ? name.length <= 17
        ? name
        : name.slice(0, 17) + "..."
      : name.length <= 20
        ? name
        : name.slice(0, 20) + "...";
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

  abbreviateName(name, maxLength = 11) {
    console.log("Name is: ", name);
    if (name && name.length > maxLength) {
      return `${name.slice(0, 5)}...`;
    }
    return name;
  }

  @track originalbranchoptions = [];
  @track temBranchoptions = [];

  @wire(branchOptionsApi, { vehicleId: "$vehicleId" })
  branchApiFun(result) {
    this.originalbranchoptions = result;
    const { data, err } = result;
    if (data) {
      console.log("branches options data: - ", data);
      let lengthOfList = 0;
      data.map((a) => {
        if (a.selected === true) {
          lengthOfList++;
        }
        return a;
      });
      this.vehicleNameValue =
        lengthOfList === 0 ? "" : lengthOfList + "件選択中";
      this.branchOptions = [
        { branchId: "すべて", branchName: "すべて", selected: false },
        ...data
      ];

      let isAllSelected = this.branchOptions
        .filter((elm) => elm.branchName !== "すべて")
        .every((item) => item.selected);
      this.branchOptions = this.branchOptions.map((elm) => {
        if (elm.branchName === "すべて") {
          return { ...elm, selected: isAllSelected };
        }
        return elm;
      });

      this.temBranchoptions = this.branchOptions;
      console.log("options all branches", JSON.stringify(this.branchOptions));
    } else if (err) {
      console.error("branchOptionsApi error: - ", err);
      let error = JSON.stringify(err);
      ErrorLog({
        lwcName: "ccp2_vehicleDetails",
        errorLog: error,
        methodName: "branch error",
        ViewName: "Vehicle Details",
        InterfaceName: "CCP User Interface",
        EventName: "Data fetch",
        ModuleName: "VehicleManagement"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @track allCertificates = [];
  @track vehicleByIdLoader2 = false;
  wiredImagesResult;

  @wire(getImagesAsBase64, { chassisNumber: "$currentChassisNumber" })
  handleImages(result) {
    console.log(
      "enter in image get class with chessis-",
      this.currentChassisNumber,
      result
    );
    this.wiredImagesResult = result;
    const { data, error } = result;

    console.log("Chassis Number for Image", this.currentChassisNumber);
    console.log("Main image data to send to modal for Image", data);
    this.vehicleByIdLoader2 = true;
    this.vehicleByIdLoader3 = true;
    this.imagesAvailable = false;
    this.certificatesAvailable = false;

    if (data === "No image found") {
      this.allImages = [];
      this.imagesAvailable = false;

      this.allCertificates = [];
      this.certificatesAvailable = false;

      this.vehicleByIdLoader2 = false;
      this.vehicleByIdLoader3 = false;

      console.log("Getting Empty images from backend!!");
    } else {
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          console.log("Parsed Data", parsedData);

          // Handle Images
          if (
            Array.isArray(parsedData.Images) &&
            parsedData.Images.length > 0
          ) {
            this.allImages = parsedData.Images;
            this.totalPages = parsedData.Images.length;
            this.imagesAvailable = true;
          } else {
            this.allImages = [];
            this.imagesAvailable = false;
          }

          // Handle Certificates
          if (
            Array.isArray(parsedData.Certificates) &&
            parsedData.Certificates.length > 0
          ) {
            this.allCertificates = parsedData.Certificates;
            this.certificatesAvailable = true;
          } else {
            this.allCertificates = [];
            this.certificatesAvailable = false;
          }
        } catch (e) {
          console.error("Error parsing data:", e);
          this.imagesAvailable = false;
          this.certificatesAvailable = false;
        } finally {
          this.vehicleByIdLoader2 = false;
          this.vehicleByIdLoader3 = false;
          this.isLastPage = this.currentImageIndex === this.totalPages - 1;
        }
      } else if (error) {
        this.imagesAvailable = false;
        this.certificatesAvailable = false;
        this.vehicleByIdLoader2 = false;
        this.vehicleByIdLoader3 = false;
        console.error(
          "Error getting data from vehicle by Chassis Number API: ",
          error
        );
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_vehicleDetails",
          errorLog: err,
          methodName: "Images Data",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data fetch",
          ModuleName: "VehicleManagement"
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

  offsetOnMarketMeasure() {
    const itemsPerPage = 5;
    const startIndex = (this.currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    let temArrMM = this.marketMeasureDataTem.slice(startIndex, endIndex);
    this.marketMeasureData = [...temArrMM];
    this.updateVisiblePages();
    console.log("this.marketMeasureData para", this.currentPage, endIndex);
    console.log("this.marketMeasureData", JSON.stringify(temArrMM));
  }

  getTodaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = ("0" + (today.getMonth() + 1)).slice(-2);
    const day = ("0" + today.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // fetchMarketMeasureFun(query) {
  //   getMarketMeasureApi({ queryDetail: query })
  //     .then((data) => {
  //       try {
  //         console.log("getMarketData query", query, data);
  //         this.totalPageCount2 = Math.ceil(data.length / 5);
  //         this.marketMeasureDataTem = data.map((elm) => {
  //           return {
  //             Id: elm?.Id || "-",
  //             controlNumber__c: elm?.controlNumber__c || "-",
  //             implementationStatus__c: elm?.ccp2_implementationStatus__c || "-",
  //             notificationDate__c:
  //               elm?.notificationDate__c !== undefined
  //                 ? this.formatJapaneseDate(elm?.notificationDate__c)
  //                 : "-",
  //             recallCategory__c: elm?.ccp2_recallCategory__c || "-",
  //             recallSubject__c: elm?.recallSubject__c || "-",
  //             renovationDate__c:
  //               elm?.renovationDate__c !== undefined
  //                 ? this.formatJapaneseDate(elm?.renovationDate__c)
  //                 : "-",
  //             trClassName:
  //               elm.ccp2_implementationStatus__c === "実施済み"
  //                 ? "grey-row"
  //                 : ""
  //           };
  //         });
  //         this.marketMeasureData = this.marketMeasureDataTem;
  //         if (data.length === 0) {
  //           this.showEmptyContiner = true;
  //         } else {
  //           this.showEmptyContiner = false;
  //         }
  //         this.offsetOnMarketMeasure();
  //         this.innerContainerLoader = false;
  //         this.showMarketMeasure = true;

  //         const tdElements = this.template.querySelectorAll(".tdClass");
  //         console.log("sw", tdElements);

  //         // Loop through all selected elements
  //         tdElements.forEach((td) => {
  //           console.log("td.textContent");
  //           console.log(td.textContent);
  //         });

  //         console.log("itms", tdElements);
  //       } catch (e) {
  //         console.log(this.finalQuery);
  //         console.error("Error getMarketData query:", e);
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(this.finalQuery);
  //       console.error("getMarketData query", err);
  //     });
  // }
  fetchMarketMeasureFun() {
    getMarketMeasureParamsApi({
      chassisNumber: this.vehicleChessisNumberForHistory,
      categoryFilter: this.categoryFilerListForQuery,
      implementationFilter: this.implementationStatusFilerListForQuery,
      sorting: this.finalSort
    })
      .then((data) => {
        try {
          console.log("data and len", data);
          console.log(
            "final params for without sql:- ",
            "this.categoryFilerListForQuery",
            JSON.stringify(this.categoryFilerListForQuery),
            "this.implementationStatusFilerListForQuery",
            JSON.stringify(this.implementationStatusFilerListForQuery),
            "finalSort",
            this.finalSort,
            "vehicleChessisNumberForHistory",
            this.vehicleChessisNumberForHistory
          );

          console.log("getMarketData without sql", data);
          this.totalPageCount2 = Math.ceil(data.length / 5);
          this.marketMeasureDataTem = data.map((elm) => {
            return {
              Id: elm?.Id || "-",
              controlNumber__c: elm?.controlNumber__c || "-",
              implementationStatus__c: elm?.ccp2_implementationStatus__c || "-",
              notificationDate__c:
                elm?.notificationDate__c !== undefined
                  ? this.formatJapaneseDate(elm?.notificationDate__c)
                  : "-",
              recallCategory__c: elm?.ccp2_recallCategory__c || "-",
              recallSubject__c: elm?.recallSubject__c || "-",
              recallSubjectTrimmed: elm?.recallSubject__c
                ? // ? this.abbreviateName3(elm.recallSubject__c)
                  this.substringToProperLength(elm.recallSubject__c, 25)
                : "-",
              renovationDate__c:
                elm?.renovationDate__c !== undefined
                  ? this.formatJapaneseDate(elm?.renovationDate__c)
                  : "-",
              trClassName:
                elm.ccp2_implementationStatus__c === "実施済み"
                  ? "grey-row"
                  : ""
            };
          });
          this.marketMeasureData = this.marketMeasureDataTem;
          if (data.length === 0) {
            this.showEmptyContiner = true;
          } else {
            this.showEmptyContiner = false;
          }
          this.offsetOnMarketMeasure();
          this.innerContainerLoader = false;
          this.showMarketMeasure = true;

          const tdElements = this.template.querySelectorAll(".tdClass");
          console.log("sw", tdElements);

          // Loop through all selected elements
          tdElements.forEach((td) => {
            console.log("td.textContent");
            console.log(td.textContent);
          });

          console.log("itms", tdElements);
        } catch (e) {
          console.error(
            "final params for without sql1:- ",
            "this.categoryFilerListForQuery",
            JSON.stringify(this.categoryFilerListForQuery),
            "this.implementationStatusFilerListForQuery",
            JSON.stringify(this.implementationStatusFilerListForQuery),
            "finalSort",
            this.finalSort,
            "vehicleChessisNumberForHistory",
            this.vehicleChessisNumberForHistory
          );
          let err = JSON.stringify(e);
          ErrorLog({
            lwcName: "ccp2_vehicleDetails",
            errorLog: err,
            methodName: "Market MEasures data",
            ViewName: "Vehicle Details",
            InterfaceName: "CCP User Interface",
            EventName: "Data fetch",
            ModuleName: "VehicleManagement"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });

          console.error("Error getMarketData without sql:", e);
        }
      })
      .catch((err) => {
        console.error(
          "final params for without sql2:- ",
          "this.categoryFilerListForQuery",
          JSON.stringify(this.categoryFilerListForQuery),
          "this.implementationStatusFilerListForQuery",
          JSON.stringify(this.implementationStatusFilerListForQuery),
          "finalSort",
          this.finalSort,
          "vehicleChessisNumberForHistory",
          this.vehicleChessisNumberForHistory
        );

        console.error("getMarketData without sql", err);
        let error = JSON.stringify(err);
        ErrorLog({
          lwcName: "ccp2_vehicleDetails",
          errorLog: error,
          methodName: "fetch recall data",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data fetch",
          ModuleName: "VehicleManagement"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  formatBranchNumber(branchCount) {
    let count = branchCount;
    if (branchCount != null) {
      if (count < 100) {
        return `00${count}`;
      } else if (count >= 100 && count < 1000) {
        return `0${count}`;
      }
    }
    return `${count}`;
  }

  @api openModalWithImages(imageData) {
    if (Array.isArray(imageData) && imageData.length > 0) {
      this.uploadImagesArray = imageData.map((image) => ({
        fileName: image.fileName,
        fileURL: image.fileURL
      }));
      this.noImagesAvailable = false;
    } else {
      this.uploadImagesArray = [];
      this.noImagesAvailable = true;
    }
    this.uploadImageCss =
      this.uploadImagesArray.length === 1
        ? "upload-image one-element"
        : "upload-image";

    this.isModalOpen = true;
  }

  handleCloseModal() {
    this.isModalOpen = false;
  }

  handleCertificateClick() {
    if (
      Array.isArray(this.allCertificates) &&
      this.allCertificates.length > 0
    ) {
      this.uploadImagesArray = this.allCertificates.map((certificate) => {
        let processedImageName = certificate.fileName;

        if (certificate.fileName.length > 7) {
          processedImageName = `${certificate.fileName.slice(0, 3)}...${certificate.fileName.slice(-5)}`;
        }

        return {
          fileName: certificate.fileName,
          fileURL: certificate.fileURL,
          ProcessedFileName: processedImageName
        };
      });
      this.imagesAval = true;
    } else {
      this.uploadImagesArray = [];
      this.imagesAval = false;
    }
    this.isModalOpen = true;
  }
  handleOutsideClickBranch(event) {
    const isClickInside = this.template
      .querySelector(".dropdown-input-container")
      .contains(event.target);
    if (!isClickInside) {
      this.showbranchNameDropdown = false;
    }
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
    }
    this.isLastPage = this.currentImageIndex === this.totalPages - 1;
    this.isFirstPage = this.currentImageIndex === 0;

    if (!this.outsideClickHandlerAdded) {
      console.log("in render if");
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      document.addEventListener(
        "click",
        this.handleDeleteOutsideClick1.bind(this)
      );
      document.addEventListener(
        "click",
        this.handleDeleteOutsideClick2.bind(this)
      );
      document.addEventListener(
        "click",
        this.handleDeleteOutsideClickLeaseInsurancePicklist.bind(this)
      );
      this.outsideClickHandlerAdded = true;
    }
    if (!this.outsideClickHandlerAdded) {
      console.log("in render if");
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      this.outsideClickHandlerAdded = true;
    }
    if (!this.handleOutsideClickBound3) {
      this.handleOutsideClickBound = this.handleOutsideClickBranch.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound);
    }

    this.updatePageButtons();
  }

  connectedCallback() {
    //this.fetchUserServices();
    const urlParamsInstance = new URLSearchParams(window.location.search).get(
      "instance"
    );
    const urlParams = new URLSearchParams(window.location.search).get(
      "vehicleId"
    );

    if (urlParams) {
      if (urlParamsInstance === "recall") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showMarketMeasureFun();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      } else if (urlParamsInstance === "maintenanceDetail") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showMaintainListFun2();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      } else if (urlParamsInstance === "maintenancelist") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showMaintainListFun();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      } else if (urlParamsInstance === "lease") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showLeaseInformationFun();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      } else if (urlParamsInstance === "truckonnect") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showTruckConnectFun();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      } else if (urlParamsInstance === "details") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showVehicleDetailFun();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      } else if (urlParamsInstance === "history") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showMaintainListFun2();
          this.openMaintainenceHistory();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      } else if (urlParamsInstance === "schedule") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showMaintainListFun2();
          this.openNewMaintainHistory();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      }
    }

    this.isFirstPage = this.currentImageIndex === 0;
    document.addEventListener("click", this.handleOutsideClick);
    document.addEventListener("click", this.handleOutsideClick2);
    this.isLastPage = true;
    console.log(
      `%cThis is green text connected ${this.vehicleIcons}' , 'color: green;`
    );
    this.vehicleByIdData.Favourite = this.vehicleIcons;
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.dropdown})`
    );
    this.template.host.style.setProperty(
      "--dropdown-icon-disabled",
      `url(${this.Arrowdisabled})`
    );
    this.currentDate = this.getTodaysDate();
    this.ismileagenull();
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
            console.log("labels2", this.labels2);
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_vehicleDetails",
          errorLog: err,
          methodName: "load labels",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data fetch",
          ModuleName: "VehicleManagement"
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

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
    document.removeEventListener("click", this.handleOutsideClick2.bind(this));
    document.removeEventListener(
      "click",
      this.handleOutsideClickBranch.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleDeleteOutsideClick1.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleDeleteOutsideClick2.bind(this)
    );
    document.removeEventListener(
      "click",
      this.handleDeleteOutsideClickLeaseInsurancePicklist.bind(this)
    );
  }
  get checkstatusofvehicle() {
    if (this.statusofvehicle == "Deleted") {
      this.showvehDetailsDeleted = true;
      this.showvehDetails = false;
    } else {
      this.showvehDetails = true;
      this.showvehDetailsDeleted = false;
    }
  }

  get visibleDots() {
    const totalDots = this.allImages.length;
    const maxVisibleDots = 6;
    let start = Math.max(
      0,
      this.currentImageIndex - Math.floor(maxVisibleDots / 2)
    );
    let end = start + maxVisibleDots;

    if (end > totalDots) {
      end = totalDots;
      start = Math.max(0, end - maxVisibleDots);
    }

    return this.allImages.slice(start, end).map((img, index) => {
      return {
        key: img.fileName,
        class:
          start + index === this.currentImageIndex
            ? "image-dot active"
            : "image-dot"
      };
    });
  }

  handleDownloadImage(event) {
    // Get the image URL and name from the data attributes of the clicked SVG
    let imageUrl = event.target.getAttribute("data-url");
    let imageName = event.target.getAttribute("data-name");
    if (imageUrl && imageName) {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageName; // Set the file name for the download

      // Append the link to the body and trigger the click event
      document.body.appendChild(link);
      link.click();

      // Remove the link from the body
      document.body.removeChild(link);
    } else {
      console.error("Image URL or name not found.");
    }
  }

  // Simulate fetching or assigning images (replace this with your actual data-fetching logic)
  populateImages() {
    const fetchedImages = [
      { fileName: "Image1", fileURL: "data:image/jpeg;base64,..." },
      { fileName: "Image2", fileURL: "data:image/jpeg;base64,..." },
      { fileName: "Image3", fileURL: "data:image/jpeg;base64,..." }
    ];

    if (Array.isArray(fetchedImages) && fetchedImages.length > 0) {
      this.allImages = fetchedImages.map((image) => ({
        fileName: image.fileName,
        fileURL: image.fileURL
      }));
      this.imagesAvailable = true;
    } else {
      this.allImages = [];
      this.imagesAvailable = false;
    }
  }

  get currentImage() {
    return this.allImages[this.currentImageIndex];
  }

  get isPreviousDisabled() {
    return this.currentImageIndex === 0;
  }

  get isNextDisabled() {
    return this.currentImageIndex === this.allImages.length - 1;
  }

  showPreviousImage() {
    if (this.currentImageIndex > 0) {
      this.isFirstPage = false;
      this.currentImageIndex -= 1;
    }
  }

  showNextImage() {
    if (this.currentImageIndex < this.allImages.length - 1) {
      this.currentImageIndex += 1;
    }
  }

  // fetchVehicleCertificates() {
  //   getVehicleCertificates({ vehicleId: this.vehicleId })
  //     .then((data) => {
  //       const lengthOfTitle = data.titles ? data.titles[0].length : 0;
  //       if (lengthOfTitle > 15) {
  //         this.certificateTitleCount = data.titles
  //           ? data.titles[0].substring(0, 15) + "...など" + data.count + "枚"
  //           : "-";
  //       } else {
  //         this.certificateTitleCount = data.titles
  //           ? data.titles[0] + "など" + data.count + "枚"
  //           : "-";
  //       }
  //       this.vehicleByIdLoader = false;
  //     })
  //     .catch((error) => {
  //       this.certificateTitleCount = "-";
  //       console.error("Fetching from vehicle Certificate API: ", error);
  //       this.vehicleByIdLoader = false;
  //       let err = JSON.stringify(error);
  //       ErrorLog({ lwcName: "ccp2_vehicleDetails", errorLog: err })
  //         .then(() => {
  //           console.log("Error logged successfully in Salesforce");
  //         })
  //         .catch((loggingErr) => {
  //           console.error("Failed to log error in Salesforce:", loggingErr);
  //         });
  //     });
  // }

  showVehicleDetailFun() {
    const newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=details`;
    window.history.replaceState({}, document.title, newUrl);
    this.showVehicleDetails = true;
    this.showMaintainList = false;
    this.showCostManagement = false;
    this.showMarketMeasure = false;
    this.showLeaseInformation = false;
    this.isAllSelected = true;
    this.isVehicleSelected = false;
    this.maintainlistactive = false;
    this.showTruckConnectList = false;
    this.LeaseInfoActive = false;
    this.innerContainerLoader = false;
    this.classVehicleDetails = "underline-button-black";
    this.classCostManagement = "";
    this.classMaintainList = "underline-button";
    this.classMarketMeasure = "underline-button";
    this.ClassLeaseInformation = "underline-button";
    this.classTruckConnectMain = "underline-button";
  }
  showMarketMeasureFun() {
    // if (
    //   this.editmileage === true ||
    //   this.editbranches === true
    // ) {
    //   this.clickedtab = "MarketMeasure";
    //   //this.showgobacktolistTabs = true;
    // }else{
    const newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=recall`;
    window.history.replaceState({}, document.title, newUrl);
    this.closeBranchedit();
    this.closemileageedit();
    this.updateFinalQuery();
    this.showVehicleDetails = false;
    this.showMaintainList = false;
    this.showCostManagement = false;
    this.showLeaseInformation = false;
    this.showTruckConnectList = false;
    this.isAllSelected = true;
    this.isVehicleSelected = false;
    this.maintainlistactive = false;
    this.LeaseInfoActive = false;
    this.classVehicleDetails = "underline-button";
    this.classCostManagement = "";
    this.classMaintainList = "underline-button";
    this.classMarketMeasure = "underline-button-black";
    this.ClassLeaseInformation = "underline-button";
    this.classTruckConnectMain = "underline-button";
  }
  showLeaseInformationFun() {
    // if (
    //   this.editmileage === true ||
    //   this.editbranches === true
    // ) {
    //   this.clickedtab = "leaseinfo";
    //   this.showgobacktolistTabs = true;
    // }else{
    const newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=lease`;
    window.history.replaceState({}, document.title, newUrl);
    this.closeBranchedit();
    this.closemileageedit();
    this.loadleasedata();
    this.showVehicleDetails = false;
    this.showMaintainList = false;
    this.showCostManagement = false;
    this.showMarketMeasure = false;
    this.showTruckConnectList = false;
    this.showLeaseInformation = true;
    this.maintainlistactive = false;
    this.LeaseInfoActive = true;
    this.classVehicleDetails = "underline-button";
    this.classMaintainList = "underline-button";
    this.classMarketMeasure = "underline-button";
    this.ClassLeaseInformation = "underline-button-black";
    this.classTruckConnectMain = "underline-button";
  }
  showCostManagementFun() {
    // if (
    //   this.editmileage === true ||
    //   this.editbranches === true
    // ) {
    //   this.clickedtab = "CostManagement";
    //   this.showgobacktolistTabs = true;
    // }else{
    this.closeBranchedit();
    this.closemileageedit();
    this.showVehicleDetails = false;
    this.showMaintainList = false;
    this.showCostManagement = true;
    this.showMarketMeasure = false;
    this.showLeaseInformation = false;
    this.showTruckConnectList = false;
    this.isAllSelected = true;
    this.isVehicleSelected = false;
    this.maintainlistactive = false;
    this.LeaseInfoActive = false;
    this.classVehicleDetails = "";
    this.classCostManagement = "underline";
    this.classMaintainList = "";
    this.ClassLeaseInformation = "underline-button";
    this.classTruckConnectMain = "underline-button";
  }
  showTruckConnectFun() {
    // if (
    //   this.editmileage === true ||
    //   this.editbranches === true
    // ) {
    //   this.clickedtab = "truckconnect";
    //   this.showgobacktolistTabs = true;
    // }else{
    const newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=truckonnect`;
    window.history.replaceState({}, document.title, newUrl);
    this.closeBranchedit();
    console.log("here1");
    this.closemileageedit();
    console.log("here2");
    this.loadTKData(this.startDateSortForQuery, this.enddateSortForQuery)
      .then(() => {
        this.showVehicleDetails = false;
        this.showMaintainList = false;
        this.showCostManagement = false;
        this.showMarketMeasure = false;
        this.showLeaseInformation = false;
        this.isAllSelected = true;
        this.showTruckConnectList = true;
        this.isVehicleSelected = false;
        this.maintainlistactive = false;
        this.LeaseInfoActive = false;
        this.classVehicleDetails = "underline-button";
        this.classCostManagement = "underline";
        this.classMaintainList = "underline-button";
        this.ClassLeaseInformation = "underline-button";
        this.classTruckConnectMain = "underline-button-black";
        console.log("TruckConnect Data Loaded Successfully");
        // You can perform additional actions here
      })
      .catch((error) => {
        console.error("Error in Loading TruckConnect Data:", error);
        // Handle errors here
      });
    console.log("here3");
  }

  showMaintainListFun() {
    this.innerContainerLoader = true;
    this.handleProcessMaintenanceBookings();
  }
  showMaintainListFun2() {
    this.closeBranchedit();
    this.closemileageedit();
    this.showVehicleDetails = false;
    this.showMaintainList = true;
    this.showTruckConnectList = false;
    this.maintainlistactive = true;
    this.showCostManagement = false;
    this.showMarketMeasure = false;
    this.showLeaseInformation = false;
    this.isAllSelected = true;
    this.isVehicleSelected = false;
    this.LeaseInfoActive = false;
    this.classVehicleDetails = "underline-button";
    this.classCostManagement = "";
    this.classMaintainList = "underline-button-black";
    this.classMarketMeasure = "underline-button";
    this.ClassLeaseInformation = "underline-button";
    this.classTruckConnectMain = "underline-button";
  }

  closeDetailPage() {
    if (
      this.editDoorNumber === true ||
      this.editmileage === true ||
      this.editbranches === true
    ) {
      this.showgobacktolist = true;
    } else {
      this.dispatchEvent(new CustomEvent("back"));
    }
  }
  closeGobackmodal() {
    this.showgobacktolist = false;
  }
  closeGobackmodalTabs() {
    this.showgobacktolistTabs = false;
  }
  gotobacklist() {
    this.dispatchEvent(new CustomEvent("back"));
  }
  gotobacklistTabs() {
    this.closeBranchedit();
    this.closemileageedit();
    if (this.clickedtab === "MarketMeasure") {
      this.showMarketMeasureFun();
      this.showgobacktolistTabs = false;
    }
    if (this.clickedtab === "leaseinfo") {
      this.showLeaseInformationFun();
      this.showgobacktolistTabs = false;
    }
    if (this.clickedtab === "CostManagement") {
      this.showCostManagementFun();
      this.showgobacktolistTabs = false;
    }
    if (this.clickedtab === "truckconnect") {
      this.showTruckConnectFun();
      this.showgobacktolistTabs = false;
    }
    if (this.clickedtab === "MaintainList") {
      this.showMaintainListFun();
      this.showgobacktolistTabs = false;
    }
  }

  toggleStar(event) {
    let boolFav;
    if (event.target.iconName === "utility:favorite") {
      boolFav = false;
    } else {
      boolFav = true;
    }
    this.updateFavVehicle(
      event.target.dataset.vehicleId,
      boolFav,
      event.target.iconName
    );
  }

  gotoMaintainencePage() {
    this.showMaintainencePage = true;
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    ongoingTransactions.vehicleDetailMaintancePageTxn = true;

    sessionStorage.setItem(
      "ongoingTransaction",
      JSON.stringify(ongoingTransactions)
    );
    this.showvehDetails = false;
    window.scrollTo(0, 0);
  }

  formatMileage(mileage) {
    if (mileage === null || mileage === undefined || mileage === 0) {
      return mileage;
    }
    return mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

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

  formatJapaneseDate2(isoDate) {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let reiwaYear;
    if (year === 2019) {
      if (month <= 4) {
        return `平成31年${month}月`;
      } else {
        return `令和1年${month}月`;
      }
    } else if (year > 2019) {
      reiwaYear = year - 2018;
      return `令和${reiwaYear}年${month}月`;
    } else {
      reiwaYear = 30 - (2018 - year);
      return `平成${reiwaYear}年${month}月`;
    }
  }

  formatJapaneseDate3(isoDate) {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let eraName, eraYear;

    if (year > 2019 || (year === 2019 && month >= 5)) {
      eraName = "令和";
      eraYear = year - 2018;
    } else if (year > 1989 || (year === 1989 && month >= 1)) {
      eraName = "平成";
      eraYear = year - 1988;
    } else if (year > 1926 || (year === 1926 && month >= 12)) {
      eraName = "昭和";
      eraYear = year - 1925;
    } else if (year > 1912 || (year === 1912 && month >= 7)) {
      eraName = "大正";
      eraYear = year - 1911;
    } else if (year > 1868 || (year === 1868 && month >= 1)) {
      eraName = "明治";
      eraYear = year - 1867;
    } else {
      return "Date is before the Meiji era, which is not supported.";
    }

    if (eraYear === 1) {
      eraYear = "元";
    }

    return `${eraName}${eraYear}年${month}月${day}日`;
  }

  handleOutsideClick = (event) => {
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
      this.showImplementationDropdown = false;
    }
  };

  handleOutsideClick2 = (event) => {
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
      this.showRecallCategoryDropdown = false;
    }
  };
  //delete handler
  handleDeleteOutsideClick1 = (event) => {
    const dataDropElement = this.template.querySelector(
      ".Delete-vehicle-picklists-container"
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
      ".Delete-vehicle-picklists-container"
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
  handleDeleteOutsideClickLeaseInsurancePicklist = (event) => {
    const dataDropElement = this.template.querySelector(".input-recall-main");
    const listsElement = this.template.querySelector(".l3");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showLeaseInsurancePickList = false;
    }
  };

  handlebackhere() {
    this.showvehDetails = true;
    this.showMaintainencePage = false;
    sessionStorage.removeItem("ongoingTransaction");
    window.scrollTo(0, 0);
  }

  branchopen() {
    this.BranchesModal = true;
  }
  branchClose() {
    this.BranchesModal = false;
  }

  ToggleFirstDropDown(event) {
    event.stopPropagation();
    this.showRecallCategoryDropdown = !this.showRecallCategoryDropdown;
    this.showImplementationDropdown = false;
  }
  ToggleSecondDropDown(event) {
    event.stopPropagation();
    this.showImplementationDropdown = !this.showImplementationDropdown;
    this.showRecallCategoryDropdown = false;
  }

  handleinsideclick(event) {
    event.stopPropagation();
  }

  handleRecallCategoryChangeAll(event) {
    this.currentPage = 1;
    this.recallCatFilter.selectAll = event.target.checked;
    this.recallCatFilter.option1 = this.recallCatFilter.selectAll;
    this.recallCatFilter.option2 = this.recallCatFilter.selectAll;
    this.recallCatFilter.option3 = this.recallCatFilter.selectAll;

    if (event.target.checked) {
      this.categoryFilerListForQuery = [];
      this.categoryFilerListForQuery.push("リコール");
      this.categoryFilerListForQuery.push("サービス キャンペーン");
      this.categoryFilerListForQuery.push("改善対策");
      this.updateFinalQuery();
    } else {
      this.categoryFilerListForQuery = ["Nothing to show"];
      this.updateFinalQuery();
    }
  }

  handleRecallCategoryChange(event) {
    this.currentPage = 1;
    const option = event.target.name.toLowerCase().replace(" ", "");

    this.recallCatFilter[option] = event.target.checked;
    this.recallCatFilter.selectAll =
      this.recallCatFilter.option1 &&
      this.recallCatFilter.option2 &&
      this.recallCatFilter.option3;

    if (!event.target.checked) {
      this.recallCatFilter.selectAll = false;
    }

    let recallArray = [];
    for (const [key, value] of Object.entries(this.recallCatFilter)) {
      if (key === "option1" && value === true) {
        recallArray.push("リコール");
      } else if (key === "option2" && value === true) {
        recallArray.push("サービス キャンペーン");
      } else if (key === "option3" && value === true) {
        recallArray.push("改善対策");
      }
    }
    if (recallArray.length === 0) {
      this.categoryFilerListForQuery = ["Nothing to show"];
    } else this.categoryFilerListForQuery = [...recallArray];

    this.updateFinalQuery();
  }

  handleImplementationChangeAll(event) {
    this.currentPage = 1;
    this.implementationFilter.selectAll = event.target.checked;

    this.implementationFilter.option1 = this.implementationFilter.selectAll;
    this.implementationFilter.option2 = this.implementationFilter.selectAll;
    this.implementationFilter.option3 = this.implementationFilter.selectAll;

    if (event.target.checked) {
      this.implementationStatusFilerListForQuery = [];

      this.implementationStatusFilerListForQuery.push("未実施");

      this.implementationStatusFilerListForQuery.push("一部実施済み");
      this.implementationStatusFilerListForQuery.push("実施済み");
    } else {
      this.implementationStatusFilerListForQuery = ["Nothing to show"];
      this.updateFinalQuery();
    }
    this.updateFinalQuery();
  }

  handleImplementationChange(event) {
    this.currentPage = 1;
    const option = event.target.name.toLowerCase().replace(" ", "");
    this.implementationFilter[option] = event.target.checked;
    this.implementationFilter.selectAll =
      this.implementationFilter.option1 &&
      this.implementationFilter.option2 &&
      this.implementationFilter.option3;

    if (!event.target.checked) {
      this.implementationFilter.selectAll = false;
    }

    let recallArray = [];
    for (const [key, value] of Object.entries(this.implementationFilter)) {
      if (key === "option1" && value === true) {
        recallArray.push("未実施");
      } else if (key === "option2" && value === true) {
        recallArray.push("一部実施済み");
      } else if (key === "option3" && value === true) {
        recallArray.push("実施済み");
      }
    }

    if (recallArray.length === 0) {
      this.implementationStatusFilerListForQuery = ["Nothing to show"];
    } else this.implementationStatusFilerListForQuery = [...recallArray];

    this.updateFinalQuery();
  }

  updateFinalQuery() {
    this.innerContainerLoader = true;
    // let categoryFilter = this.categoryFilerListForQuery
    //   .map((category) => `'${category}'`)
    //   .join(", ");
    // let implementationFilter = this.implementationStatusFilerListForQuery
    //   .map((category) => `'${category}'`)
    //   .join(", ");

    let orderByQuery = "";
    // if (
    //   this.renovationSortForQuery !== "" &&
    //   this.notificationSortForQuery !== ""
    // ) {
    //   orderByQuery = `renovationDate__c ${this.renovationSortForQuery}, notificationDate__c ${this.notificationSortForQuery}`;
    // } else
    if (this.renovationSortForQuery !== "") {
      orderByQuery = `renovationDate__c ${this.renovationSortForQuery}`;
    } else if (this.notificationSortForQuery !== "") {
      orderByQuery = `notificationDate__c ${this.notificationSortForQuery}`;
    } else {
      orderByQuery = `CreatedDate DESC`;
    }
    // if (
    //   this.renovationSortForQuery !== "" &&
    //   this.notificationSortForQuery !== ""
    // ) {
    //   orderByQuery = `ORDER BY renovationDate__c ${this.renovationSortForQuery}, notificationDate__c ${this.notificationSortForQuery}`;
    // } else if (this.renovationSortForQuery !== "") {
    //   orderByQuery = `ORDER BY renovationDate__c ${this.renovationSortForQuery}`;
    // } else if (this.notificationSortForQuery !== "") {
    //   orderByQuery = `ORDER BY notificationDate__c ${this.notificationSortForQuery}`;
    // } else {
    //   orderByQuery = `ORDER BY CreatedDate DESC`;
    // }

    this.finalSort = orderByQuery;
    // let query = `SELECT ccp2_recallCategory__c, ccp2_implementationStatus__c, notificationDate__c, renovationDate__c, controlNumber__c, recallSubject__c
    // FROM recallInfo__c where ccp2_recallCategory__c IN (${categoryFilter}) AND ccp2_implementationStatus__c IN (${implementationFilter}) AND crmVehicle__c = '${this.vehicelInfoId}'
    // ${orderByQuery}`;

    // this.finalQuery = query;
    this.fetchMarketMeasureFun();
    // this.fetchMarketMeasureFun(query);
  }

  /*Sorting Handling*/
  handleSortNotificationDate() {
    this.currentPage = 1;
    this.renovationSortForQuery = "";
    if (this.notificationSortForQuery === "") {
      this.notificationSortForQuery = "ASC";

      this.renovationSortForQuery = "";
      this.showAscSortIcon1 = false;
      this.showNormalSortIcon1 = true;
      this.showDescSortIcon1 = false;

      this.showAscSortIcon2 = true;
      this.showNormalSortIcon2 = false;
      this.showDescSortIcon2 = false;
    } else if (this.notificationSortForQuery === "ASC") {
      this.notificationSortForQuery = "DESC";

      this.renovationSortForQuery = "";
      this.showAscSortIcon1 = false;
      this.showNormalSortIcon1 = true;
      this.showDescSortIcon1 = false;

      this.showAscSortIcon2 = false;
      this.showNormalSortIcon2 = false;
      this.showDescSortIcon2 = true;
    } else if (this.notificationSortForQuery === "DESC") {
      this.notificationSortForQuery = "ASC";

      this.renovationSortForQuery = "";
      this.showAscSortIcon1 = false;
      this.showNormalSortIcon1 = true;
      this.showDescSortIcon1 = false;

      this.showAscSortIcon2 = true;
      this.showNormalSortIcon2 = false;
      this.showDescSortIcon2 = false;
    }
    this.updateFinalQuery();
  }

  handleSortImplementationDate() {
    this.currentPage = 1;
    this.notificationSortForQuery = "";
    if (this.renovationSortForQuery === "") {
      this.renovationSortForQuery = "ASC";

      this.notificationSortForQuery = "";
      this.showAscSortIcon2 = false;
      this.showNormalSortIcon2 = true;
      this.showDescSortIcon2 = false;

      this.showAscSortIcon1 = true;
      this.showNormalSortIcon1 = false;
      this.showDescSortIcon1 = false;
    } else if (this.renovationSortForQuery === "ASC") {
      this.renovationSortForQuery = "DESC";

      this.notificationSortForQuery = "";
      this.showAscSortIcon2 = false;
      this.showNormalSortIcon2 = true;
      this.showDescSortIcon2 = false;

      this.showAscSortIcon1 = false;
      this.showNormalSortIcon1 = false;
      this.showDescSortIcon1 = true;
    } else if (this.renovationSortForQuery === "DESC") {
      this.renovationSortForQuery = "ASC";

      this.notificationSortForQuery = "";
      this.showAscSortIcon2 = false;
      this.showNormalSortIcon2 = true;
      this.showDescSortIcon2 = false;

      this.showAscSortIcon1 = true;
      this.showNormalSortIcon1 = false;
      this.showDescSortIcon1 = false;
    }
    this.updateFinalQuery();
  }

  /* pagination of drop down */
  @track showLeftDots2 = false;
  @track visiblePageCount2 = [1];
  @track showRightDots2 = false;
  @track currentPage = 1;
  @track totalPageCount2;
  @track prevGoing = false;
  @track isPreviousDisabled2 = false;
  @track isNextDisabled2 = false;

  get hasVehicles2() {
    return this.marketMeasureData.length > 0 && this.showMarketMeasure;
  }

  gotoregistrationPage() {
    let baseUrl = window.location.href;
    let regurl = "";
    if (baseUrl.indexOf("/s/") !== -1) {
      regurl = baseUrl.split("/s/")[0] + "/s/vehicle-registration";
    }
    window.location.href = regurl;
  }

  handlePreviousPage2() {
    if (this.currentPage > 1) {
      this.prevGoing = true;
      this.currentPage -= 1;
      this.isPreviousDisabled2 = this.currentPage === 1;
      this.isNextDisabled2 = this.currentPage === this.totalPageCount2;
      this.offsetOnMarketMeasure();
      this.updatePageButtons();
    }
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

  openEditDoorModal() {
    this.isDoorNumberCancel = true;
  }

  closeEditDoorModal() {
    this.isDoorNumberCancel = false;
  }

  handleNextPage2() {
    if (this.totalPageCount2 > this.currentPage) {
      this.prevGoing = false;
      this.currentPage += 1;
      this.isPreviousDisabled2 = this.currentPage === 1;
      this.isNextDisabled2 = this.currentPage === this.totalPageCount2;
      this.offsetOnMarketMeasure();
      this.updatePageButtons();
    }
  }

  pageCountClick2(event) {
    this.currentPage = Number(event.target.dataset.page);
    this.offsetOnMarketMeasure();
    this.updatePageButtons();
  }

  updateVisiblePages() {
    let startPage, endPage;

    if (this.totalPageCount2 === 5) {
      startPage = 1;
      endPage = Math.min(5, this.totalPageCount2);
    } else {
      if (this.currentPage <= 4) {
        startPage = 1;
        endPage = Math.min(4, this.totalPageCount2);
      } else if (
        this.currentPage > 4 &&
        this.currentPage <= this.totalPageCount2 - 4
      ) {
        startPage = this.currentPage - 1;
        endPage = this.currentPage + 1;
      } else {
        startPage = this.totalPageCount2 - 3;
        endPage = this.totalPageCount2;
      }
    }

    this.visiblePageCount2 = [];
    for (let i = startPage; i <= endPage; i++) {
      this.visiblePageCount2.push(i);
    }

    this.visiblePageCount2.forEach((element) => {
      this.showRightDots2 = element === this.totalPageCount2 ? false : true;
    });

    this.showLeftDots2 = this.visiblePageCount2[0] === 1 ? false : true;
  }

  //downlaod feature
  openDownloadModalfunction() {
    this.DownloadNameValue = `${this.currentDate} - カスタマーポータル車両リスト`;
    this.openDownloadModal = true;
  }
  closeDownloadModal() {
    this.DownloadNameValue = `${this.currentDate} - カスタマーポータル車両リスト`;
    this.openDownloadModal = false;
  }
  handleDownloadChange(event) {
    this.DownloadNameValue = event.target.value;
  }
  finaldownload() {
    this.downloadCSVAll();
    this.showFinishTimeModal();
    this.openDownloadModal = false;
  }
  showFinishTimeModal() {
    this.ShowSuccessDownload = true;
    window.scrollTo(0, 0);
  }
  closesuccessdownload() {
    this.DownloadNameValue = `${this.currentDate} - カスタマーポータル車両リスト`;
    this.ShowSuccessDownload = false;
  }
  downloadCSVAll() {
    // if (this.allVehiclesData.length === 0) {
    //   console.error("No data available to download");
    //   return;
    // }
    const vehiclesD = this.downloadvehicles;
    const branchesD = this.downloadbranch;

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
      "所属",
      "削除済み車両",
      "サイズ",
      "車両総重量",
      "最大積載量"
    ];
    const allBranches = branchesD.join("・");

    let csvContent = headers.join(",") + "\n";

    const csvRow = [
      vehiclesD.Door_Number__c,
      vehiclesD.Registration_Number__c,
      vehiclesD.Chassis_number__c,
      vehiclesD.Delivery_Date__c,
      vehiclesD.Vehicle_Name__c,
      vehiclesD.Vehicle_Type__c,
      vehiclesD.Body_Shape__c,
      vehiclesD.vehicleWeight__c,
      vehiclesD.First_Registration_Date__c,
      vehiclesD.Vehicle_Expiration_Date__c,
      vehiclesD.Mileage__c || 0,
      vehiclesD.Fuel_Type__c,
      vehiclesD.Private_Business_use__c,
      vehiclesD.Use__c,
      vehiclesD.fullModel__c,
      allBranches,
      vehiclesD.Status__c === "CurrentlyOwned" ? " " : "削除済み" || "",
      vehiclesD.vehicleSize__c,
      vehiclesD.grossWeigth__c,
      vehiclesD.MaxPayload__c
    ];

    csvContent += csvRow.join(",") + "\n";
    let BOM = "\uFEFF";
    csvContent = BOM + csvContent;

    if (this.DownloadNameValue.endsWith(".csv")) {
      this.DownloadNameValue = this.DownloadNameValue.slice(0, -4);
    }

    const csvBase64 = btoa(unescape(encodeURIComponent(csvContent)));
    const link = document.createElement("a");
    link.href = "data:text/csv;base64," + csvBase64;
    link.download = `${this.DownloadNameValue}.csv`;
    link.click();
    window.URL.revokeObjectURL(link.href);
    link.remove();
  }

  //delete vehicle functions
  opendeleteModals() {
    if (this.opendeletesystem === false) {
      this.openDeleteModal = true;
    } else {
    }
  }
  closeDeleteModal() {
    this.openDeleteModal = false;
    this.cancelmodaldeletevehicle = false;
    this.noreasonisselected = true;
    this.selectedReason = "";
    this.deletedescription = "";
  }
  closedeleteconfirmations() {
    this.cancelmodaldeletevehicle = false;
  }
  opendeleteconfirmations() {
    this.cancelmodaldeletevehicle = true;
  }

  opendeletesystems() {
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    ongoingTransactions.vehicleDetailDeleteTxn = true;

    sessionStorage.setItem(
      "ongoingTransaction",
      JSON.stringify(ongoingTransactions)
    );

    this.opendeletesystem = true;
    this.showMainvehiclebuttons = false;
    this.openDeleteModal = false;
  }

  canceldeleteveh() {
    sessionStorage.removeItem("ongoingTransaction");
    this.opendeletesystem = false;
    this.SelectedStatus = this.StatusOptions[0].label;
    this.selectedReason = "";
    this.deletedescription = "";
    this.showMainvehiclebuttons = true;
  }
  finaldeleteveh() {
    // if (this.SelectedStatus === this.StatusOptions[0].label) {
    //   this.gotodeleteNull();
    //   console.log("calledrecovery");
    // } else {
    this.gotodelete();
    sessionStorage.removeItem("ongoingTransaction");
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

  handleOkDelete() {
    this.ShowSuccessDelete = false;
  }

  showFinishTimeModalDelete() {
    this.ShowSuccessDelete = true;
    window.scrollTo(0, 0);
    setTimeout(() => {
      this.selectedReason = "";
      this.deletedescription = "";
      this.SelectedStatus = "";
      this.showRecoverReason = true;
      this.openRecoversystem = false;
      refreshApex(this.wiredVehicleResult);
      this.vehicledeletedescription = false;
      this.opendeletesystem = false;
      this.showMainvehiclebuttons = true;
      // this.ShowSuccessDelete = false;
    }, 2000);
  }
  // showFinishTimeModalNormal() {
  //   this.ShowSuccessDelete = true;
  //   window.scrollTo(0, 0);
  //   setTimeout(() => {
  //     refreshApex(this.wiredVehicleResult);
  //     this.ShowSuccessDelete = false;
  //     this.opendeletesystem = false;
  //     this.showMainvehiclebuttons = true;
  //   }, 2000);
  // }
  // handleStatusSelect(event) {
  //   this.SelectedStatus = event.target.dataset.idd;
  //   this.ShowStatusList = false;
  //   if (this.SelectedStatus == "削除済み") {
  //     this.allselectedDeleted = false;
  //   } else {
  //     th
  //     this.vehicledeletedescription = false;
  //     this.allselectedDeleted = true;
  //     this.selectedReason = "";
  //     this.deletedescription = "";
  //     this.vehicledeletedescriptionRecover = false;
  //   }
  // }
  handleReasonSelect(event) {
    this.selectedReason = event.target.dataset.idd;
    this.showreasonofdeletelist = false;
    if (this.selectedReason !== null) {
      this.noreasonisselected = false;
    }
    // if (this.selectedReason == "その他") {
    //   this.vehicledeletedescription = true;
    //   this.allselectedDeleted = false;
    // } else {
    //   this.deletedescription = "";
    //   this.vehicledeletedescription = false;
    //   if (this.selectedReason !== null) {
    //     this.allselectedDeleted = true;
    //   } else {
    //     this.allselectedDeleted = false;
    //   }
    // }
  }
  handledeletedescription(event) {
    this.deletedescription = event.target.value;
    this.handlevalchange(event);
    // if (this.deletedescription !== null) {
    //   this.allselectedDeleted = true;
    // }
    // if (this.deletedescription == "") {
    //   this.allselectedDeleted = false;
    // }
  }

  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    if (value.length > maxLength) {
      event.target.blur();
    }
  }

  gotodelete() {
    this.SelectedStatus = this.StatusOptions[1].label;
    const selectedOption = this.StatusOptions.find(
      (option) => option.label === this.SelectedStatus
    );
    const selectedReason = this.reasonOptions.find(
      (option) => option.label === this.selectedReason
    );
    const selectedstatusvalue = selectedOption.value;
    const selectedReasonvalue = selectedReason.value;
    // console.log("selectedstatus",selectedstatusvalue);
    // console.log("sel reason",selectedReasonvalue);
    // console.log("desc",this.deletedescription);
    deleteAndRecovervehicle({
      vehicleId: this.vehicleId,
      status: selectedstatusvalue,
      reason: selectedReasonvalue,
      Description: this.deletedescription
    })
      .then((result) => {
        this.cancelmodaldeletevehicle = false;
        this.openDeleteModal = false;
        this.showVehicleDetailFun();
        this.showFinishTimeModalDelete();
      })
      .catch((error) => {
        console.error("Error:", error);
        this.showErrorMessage("An error occurred during deletion.");
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_vehicleDetails",
          errorLog: err,
          methodName: "deleteandrecovervehicle",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data update",
          ModuleName: "VehicleManagement"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  // gotodeleteNull() {
  //   const selectedOption = this.StatusOptions.find(
  //     (option) => option.label === this.SelectedStatus
  //   );
  //   // const selectedReason = this.reasonOptions.find(option => option.label === this.selectedReason);
  //   const selectedstatusvalue = selectedOption.value;
  //   // const selectedReasonvalue = selectedReason.value;
  //   console.log("selectedstatus", selectedstatusvalue);
  //   // console.log("sel reason",selectedReasonvalue);
  //   // console.log("desc",this.deletedescription);
  //   deleteAndRecovervehicle({
  //     vehicleId: this.vehicleId,
  //     status: selectedstatusvalue,
  //     reason: this.selectedReason,
  //     Description: this.deletedescription
  //   })
  //     .then((result) => {
  //       console.log(result);
  //       this.showFinishTimeModalNormal();
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //       this.showErrorMessage("An error occurred during deletion.");
  //     });
  // }

  //truckonnet redirection
  redirectTruckonnet(event) {
    event.stopPropagation();
    window.open(this.truckonnetURL, "_blank");
  }
  //recover vehicles
  @track openRecoversystem = false;
  @track vehicledeletedescriptionRecover = false;
  @track showRecoverReason = true;
  @track cancelmodalrecovervehicle = false;

  openrecoversystems() {
    this.openRecoversystem = true;

    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    ongoingTransactions.vehicleDetailDeleteTxn = true;

    sessionStorage.setItem(
      "ongoingTransaction",
      JSON.stringify(ongoingTransactions)
    );
  }
  closerecoversystems() {
    this.openRecoversystem = false;
    this.SelectedStatus = this.StatusOptions[1].label;
    this.vehicledeletedescriptionRecover = true;
    this.showRecoverReason = true;
    sessionStorage.removeItem("ongoingTransaction");
  }
  finalRecoverveh() {
    this.gotoRecover();
    sessionStorage.removeItem("ongoingTransaction");
  }
  closerecoveringModal() {
    this.cancelmodalrecovervehicle = false;
  }
  openrecoveringModal() {
    this.cancelmodalrecovervehicle = true;
  }
  handleStatusSelectRecover(event) {
    this.SelectedStatus = event.target.dataset.idd;
    this.ShowStatusList = false;
    if (this.SelectedStatus == "削除済み") {
      if (this.deletedescription !== null && this.deletedescription !== "") {
        this.vehicledeletedescriptionRecover = true;
      } else {
        this.vehicledeletedescriptionRecover = false;
      }
      this.showRecoverReason = true;
    } else {
      this.showRecoverReason = false;
      this.vehicledeletedescriptionRecover = false;
    }
  }
  gotoRecover() {
    this.SelectedStatus = this.StatusOptions[0].label;
    const selectedOption = this.StatusOptions.find(
      (option) => option.label === this.SelectedStatus
    );
    const selectedstatusvalue = selectedOption.value;
    this.selectedReason = "";
    this.deletedescription = "";
    deleteAndRecovervehicle({
      vehicleId: this.vehicleId,
      status: selectedstatusvalue,
      reason: this.selectedReason,
      Description: this.deletedescription
    })
      .then((result) => {
        this.cancelmodalrecovervehicle = false;
        this.ShowSuccessRecover = true;
        this.showFinishTimeModalRecover();
      })
      .catch((error) => {
        this.cancelmodalrecovervehicle = false;
        console.error("Error:", error);
        this.showErrorMessage("An error occurred during deletion.");
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_VehicleDetails",
          errorLog: err,
          methodName: "deleteandrecovervehicle",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data update",
          ModuleName: "VehicleManagement"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  showNormalFinishWithNochange() {
    this.ShowSuccessDelete = true;
    window.scrollTo(0, 0);
    // setTimeout(() => {
    //   this.ShowSuccessDelete = false;
    // }, 2000);
  }

  closeRecoverModal() {
    this.ShowSuccessRecover = false;
  }

  showFinishTimeModalRecover() {
    window.scrollTo(0, 0);
    this.selectedReason = "";
    this.deletedescription = "";
    this.SelectedStatus = "";
    this.noreasonisselected = true;
    refreshApex(this.wiredVehicleResult);
    this.vehicledeletedescription = false;
    this.vehgoesdeletion = false;
    this.openRecoversystem = false;
    this.opendeletesystem = false;
    // this.ShowSuccessRecover = false;
  }

  //lease
  @track isAllSelected = true;
  @track isVehicleSelected = false;
  @track leaseisempty = false;
  @track showLeaseMemo = false;
  @track leaseFlag1yr = false;
  @track maintainleaseisempty = false;
  @track leaseloader = true;
  @track leasedata = {
    ContractNumber: "",
    ContractName: "",
    ContractExpirationdate: "",
    ContractYears: "",
    MonthlyLeaseFee: "",
    VoluntaryInsurance: ""
  };
  @track maintainenceleasedata = {
    MaintainContractNumber: "",
    Contractmenu: "",
    ContractStartdate: "",
    ContractExpirationdate: ""
  };
  goToDTFSA() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      let addBranchUrl = baseUrl.split("/s/")[0] + "/s/dtfsa-docs";
      window.location.href = addBranchUrl;
    }
  }
  @track refreshToken = 10;
  loadleasedata() { 
  ++this.refreshToken;
    leaseInformation({ vehicleId: this.vehicleId, refresh: this.refreshToken })
      .then((result) => {
        console.log("result for lease : -", result);
        this.showLeaseMemo = (result?.memoFlag || result?.LeaseFlag) ?? false;
        if (result?.LeaseFlag) {
          this.leaseisempty = false;
          this.leaseloader = false;
         
          this.leasedata = {
            ContractNumber: result.contractNumber_nv__c ?? "-",
            Memo: result.Memo ?? "入力してください",
            MemoForEdit: result.Memo ?? "",
            memoColor: result.Memo ? '' : 'color: #bbb',
            otherLease: result.otherLease ?? false,
            LeaseFlag: result.LeaseFlag ?? false,
            memoFlag: result.memoFlag ?? false,
            CompanyName: result.CompanyName
              ? this.substringToProperLength(result.CompanyName, 32)
              : "-",
            CompanyNameFull: result.CompanyName ?? "-",
            ContractName: result.contractorName__c ?? "-",
            ContractExpirationdate: result.expirationDate__c
              ? this.formatJapaneseDate(result.expirationDate__c)
              : "-",
            ContractExpirationdateNormal: result.expirationDate__c ?? null,
            ContractExpirationdateNormalTem: result.expirationDate__c ?? null,
            ContractYears: result.datefronInitialRegistrationDate__c
              ? result.datefronInitialRegistrationDate__c + "年"
              : "-",
            MonthlyLeaseFee: this.formatCurrency(
              result.monthlyLeaseWithoutTax__c
            ),
            VoluntaryInsurance: result.voluntaryInsuranceIncluded__c
              ? "あり"
              : "なし" || "-"
          };
        } else {
          this.leaseisempty = true;
          this.leaseloader = false;
        }
      })
      .catch((error) => {
        console.error("Error fetching lease data:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_VehicleDetails",
          errorLog: err,
          methodName: "loadleasedata",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data fetch",
          ModuleName: "VehicleManagement"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  //   handleAllclick(){
  //     this.isAllSelected = true;
  //     this.isVehicleSelected = false;
  //   }

  //   handleVehicleClick(){
  //       this.isAllSelected = false;
  //       this.isVehicleSelected = true;
  //   }

  //   get allSelectedClass(){
  //     return this.isAllSelected ? 'border-right-black' : '';
  // }

  //   get vehicleSelectedClass(){
  //       return this.isVehicleSelected ? 'border-right-black' : '';
  //   }
  //   get allSelectedLabel(){
  //     return this.isAllSelected ? 'text-right-black' : '';
  // }

  //   get vehicleSelectedLabel(){
  //       return this.isVehicleSelected ? 'text-right-black' : '';
  //   }

  formatCurrency(value) {
    if (value === null || value === undefined) {
      return "-";
    }
    const formattedNumber = value
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `¥ ${formattedNumber}`;
  }
  //vehicleMaintainenceHistory
  @track openvehicleMaintainencehistory = false;

  openMaintainenceHistory() {
    window.scrollTo(0, 0);
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    ongoingTransactions.manintainenceRegisterationTxn = true;

    sessionStorage.setItem(
      "ongoingTransaction",
      JSON.stringify(ongoingTransactions)
    );
    this.MaintainTypeRecord = "History";
    this.openvehicleMaintainencehistory = true;
    this.showvehDetails = false;
  }
  openNewMaintainHistory() {
    window.scrollTo(0, 0);
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    ongoingTransactions.manintainenceRegisterationTxn = true;

    sessionStorage.setItem(
      "ongoingTransaction",
      JSON.stringify(ongoingTransactions)
    );
    this.MaintainTypeRecord = "Scheduled";
    this.openvehicleMaintainencehistory = true;
    this.showvehDetails = false;
  }
  closeMaintainenceHistory() {
    window.scrollTo(0, 0);
    sessionStorage.removeItem("ongoingTransaction");
    this.openvehicleMaintainencehistory = false;
    this.showvehDetails = true;
    this.showMaintainListFun();
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      const childComponent = this.template.querySelector(
        "c-ccp2-_-maintenance-history"
      );
      if (childComponent) {
        childComponent.refreshData();
      }
    }, 1);
  }
  @track editbranches = false;
  @track editmileage = false;
  @track editDoorNumber = false;

  closeerrormileage() {
    this.showErrorMileageModal = false;
  }

  ismileagenull() {
    return this.nullMileage || this.vehicleByIdData.Newmileage === ""
      ? true
      : false;
  }

  newmileageback = "";
  openmileageedit() {
    this.vehicleByIdData.Newmileage = this.formatNumberWithCommas(
      this.vehicleByIdData.Newmileage
    );
    this.newmileageback = this.vehicleByIdData.Newmileage;
    this.editmileage = true;
  }
  closemileageedit() {
    if (this.vehicleByIdData.Newmileage > 0) {
      this.vehicleByIdData.Newmileage =
        this.vehicleByIdData.mileage && this.vehicleByIdData.mileage > "0"
          ? String(this.vehicleByIdData.mileage).replace(/,/g, "")
          : "0";
    }
    // console.log(
    //   "this.vehicleByIdData.mileage",
    //   this.vehicleByIdData.mileage.replace(/,/g, "")
    // );
    this.editmileage = false;
    this.nullMileage = false;
    this.nextBtnCss = "next-btn1";
  }
  openBranchedit() {
    this.editbranches = true;

    this.temBranchoptions = this.branchOptions;
  }

  closeBranchedit() {
    // refreshApex(this.originalbranchoptions);
    let lengthOfList = 0;

    this.branchOptions = this.temBranchoptions.map((a) => {
      if (a.selected === true && a.branchName !== "すべて") {
        lengthOfList++;
      }
      return a;
    });
    // let isAllSelected = this.branchOptions
    //   .filter((elm) => elm.branchName !== "すべて")
    //   .every((item) => item.selected);

    // this.branchOptions.unshift({
    //   branchId: "すべて",
    //   branchName: "すべて",
    //   selected: isAllSelected
    // });

    this.vehicleNameValue = lengthOfList === 0 ? "" : lengthOfList + "件選択中";

    console.log("after bo", this.branchOptions);
    console.log("after bo tem", this.temBranchoptions);

    this.editbranches = false;
    this.isallbranchesnull = false;
  }
  // handleKeyDown(event) {
  //   if (event.key === '-') {
  //     event.preventDefault();
  //   }
  // }

  handlemileageInput(event) {
    // console.log('in input')
    let input = event.target.value;
    console.log("value of input chnged by oninput", input);
    const onlyDigitsRegex = /^[0-9,]*$/;
    if (!onlyDigitsRegex.test(input)) {
      event.target.blur();
    }
    input = input.replace(/[^0-9]/g, "");
    console.log("value of input chnged by oninput1", input);
    //console.log('in input1', input)
    if (input === "") {
      console.log("input change1", input);
      this.vehicleByIdData.Newmileage = "";
      this.nullMileage = true;
      this.nextBtnCss = "next-btn1-disable";
      // this.ismileagenull();
    } else {
      console.log("value of input chnged by oninput2", input);
      //console.log('input change2', input);

      if (!input.startsWith("0")) {
        this.nullMileage = false;
        this.nextBtnCss = "next-btn1";
      }
      // this.ismileagenull();
    }
    if (input.startsWith("0")) {
      console.log("value of input chnged by oninput3", input);
      input = input.slice(1);

      if (input === "") {
        this.nullMileage = true;
        this.nextBtnCss = "next-btn1-disable";
      }
    }
    //console.log('in input2', input)
    // if (input.length > 8) {
    //   console.log('value of input chnged by oninput4', input)
    //   input = input.slice(0, 8);
    // }
    if (/^0+$/.test(input)) {
      console.log("value of input chnged by oninput5", input);
      input = "";
      if (input === "") {
        this.nullMileage = true;
        this.nextBtnCss = "next-btn1-disable";
      }
    }
    // console.log('in input3', input)
    if (input.length >= 4) {
      console.log("value of input chnged by oninput6", input);
      input = this.formatNumberWithCommas(input);
    } else {
      console.log("value of input chnged by oninput7", input);
      input = input.replace(",", "");
      if (input === "") {
        this.nullMileage = true;
        this.nextBtnCss = "next-btn1-disable";
      }
    }
    console.log("value of input chnged by oninput8", input);
    event.target.value = input;
    this.vehicleByIdData.Newmileage = input;
  }

  handleInputChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    if (name === "editMileage") {
      console.log(
        "value of mileage chnged by onchnge",
        this.vehicleByIdData.Newmileage
      );
      this.vehicleByIdData.Newmileage = value;
    } else if (name === "doorNumber") {
      this.vehicleByIdData.doorNumber = value;
    } else {
    }
  }
  handleDoorNumberInput(event) {
    // if (!this.isComposing) {
    //     let inputValue = event.target.value;

    //     if ([...inputValue].length > 15) {
    //         inputValue = [...inputValue].slice(0, 15).join('');
    //         event.target.value = inputValue;
    //     }

    //     this.vehicleByIdData.doorNumber = inputValue;
    //     this.isdoornumberempty = inputValue === "";
    // }
    this.vehicleByIdData.doorNumber = event.target.value;
    this.isdoornumberempty = event.target.value === "";
    this.handlevalchange(event);
  }

  startComposition(event) {
    this.isComposing = true;
  }

  endComposition(event) {
    this.isComposing = false;
    this.handleDoorNumberInput(event); // Process the final input
  }

  SaveMileagefield(event) {
    //yet to complete
    const payload = {
      vehicleId: this.vehicleId,
      Mileage__c: this.vehicleByIdData.Newmileage.replace(/,/g, "")
    };
    console.log("devil payload", JSON.stringify(payload));
    this.vehicleByIdData.mileage = this.vehicleByIdData.Newmileage;
    this.updateeditinformation(payload);
    this.editmileage = false;
  }
  handlemileageBlur(event) {
    let input = event.target.value;
    if (input) {
      event.target.value = this.formatNumberWithCommas(input); // Add commas on blur
    }
  }
  formatNumberWithCommas(number) {
    if (number === 0) {
      return number.toString();
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  handlemileageFocus(event) {
    event.target.value = event.target.value.replace(/,/g, ""); // Remove commas on focus
  }
  Savebranchfield() {
    //yet to complete
    this.isallbranchesnull = this.branchOptions.every(
      (branch) => !branch.selected
    );
    let branchIdsToSend = this.branchOptions
      .filter((a) => {
        return a.selected === true && a.branchId !== "すべて";
      })
      .map((b) => {
        return b.branchId;
      });
    const payload = {
      vehicleId: this.vehicleId,
      BranchId: branchIdsToSend
    };
    console.log("branches", payload);
    this.updateeditinformation(payload);
    this.editbranches = false;
  }
  SaveDoorNumberfield() {
    //yet to complete
    const specialCharPattern =
      /[^\u3040-\u30FF\u4E00-\u9FFF\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5Aa-zA-Z0-9\s]/;
    if (specialCharPattern.test(this.vehicleByIdData.doorNumber)) {
      this.showErrorMileageModal = true;
      return;
    } else {
      this.showErrorMileageModal = false;

      const payload = {
        vehicleId: this.vehicleId,
        Door_Number__c: this.vehicleByIdData.doorNumber
      };
      this.updateeditinformation(payload);
      this.editDoorNumber = false;
    }
  }

  opendoornumberdit() {
    this.editDoorNumber = true;
  }
  closedoornumberdit() {
    this.vehicleByIdData.doorNumber = this.vehicleByIdData.newDoor;
    this.editDoorNumber = false;
    this.isdoornumberempty = false;
  }
  @track showUploadModal = false;
  openimageeditmodal() {
    this.vehicleidforpictures = this.vehicleId;
    this.showUploadModal = true;
  }
  closeupload() {
    console.log("close modal called!");
    this.vehicleByIdLoader2 = true;
    // refreshApex(this.wiredImagesResult);
    setTimeout(() => {
      refreshApex(this.wiredImagesResult);
      console.log("done1");
    }, 1000);
    //  setTimeout(() => {
    //   refreshApex(this.wiredImagesResult);
    // }, 2000);
    setTimeout(() => {
      this.vehicleByIdLoader2 = false;
    }, 2500);
    window.scrollTo(0, 0);
    window.scrollTo(0, 0);
    this.showUploadModal = false;
  }
  //branch
  @track showbranchNameDropdown = false;
  @track vehicleNameValue = "";
  @track vehicleNamesPicklistValues;
  @track finalVehicleNameList = [];
  @track isallbranchesnull = false;

  togglebranchdropdown(event) {
    event.stopPropagation();
    this.showbranchNameDropdown = !this.showbranchNameDropdown;
  }
  handleVehicleNameSelect(event) {
    const value = event.target.name;
    const isChecked = event.target.checked;
    let lengthOfList = 0;
    if (value === "すべて") {
      this.finalVehicleNameList = [];
      this.branchOptions = this.branchOptions.map((elm) => {
        if (elm.branchName !== "すべて") {
          this.finalVehicleNameList.push(elm.branchName);
        }
        return { ...elm, selected: isChecked };
      });
      if (!isChecked) {
        console.log(
          "this.finalVehicleNameList in ischeck",
          this.finalVehicleNameList
        );
        this.finalVehicleNameList = [];
      }

      lengthOfList = this.finalVehicleNameList.length;
    } else {
      this.branchOptions = this.branchOptions.map((elm) => {
        if (elm.branchName === value) {
          return { ...elm, selected: isChecked };
        }
        return elm;
      });
      if (isChecked) {
        if (!this.finalVehicleNameList.includes(value)) {
          this.finalVehicleNameList = [...this.finalVehicleNameList, value];
        }
      } else {
        this.finalVehicleNameList = this.finalVehicleNameList.filter(
          (item) => item !== value
        );
      }
      let isAllSelected = this.branchOptions
        .filter((elm) => elm.branchName !== "すべて")
        .every((item) => item.selected);
      this.branchOptions = this.branchOptions.map((elm) => {
        if (elm.branchName === "すべて") {
          return { ...elm, selected: isAllSelected };
        }
        return elm;
      });

      lengthOfList = this.branchOptions.filter(
        (elm) => elm.selected === true && elm.branchName !== "すべて"
      ).length;
    }

    this.vehicleNameValue = lengthOfList === 0 ? "" : lengthOfList + "件選択中";
    this.isallbranchesnull = this.branchOptions.every(
      (branch) => !branch.selected
    );
    console.log(
      "BRanch Options to be Updated: ",
      JSON.stringify(this.finalVehicleNameList)
    );
  }
  updateeditinformation(payload) {
    let stringJson = JSON.stringify(payload);
    console.log("final", stringJson);
    updateeditinfo({ jsonInput: stringJson })
      .then((result) => {
        // Handle successful update
        refreshApex(this.wiredVehicleResult);
        // this.loadbranches();
        console.log("Vehicle information updated successfully:", result);
      })
      .catch((error) => {
        // Handle errors
        console.error("Error updating vehicle information:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_VehicleDetails",
          errorLog: err,
          methodName: "updateeditinformation",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data update",
          ModuleName: "VehicleManagement"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  //tk
  // loadTKData() {
  //   //console.log(this.vehicleId);
  //   truckconnectDetails({ vehicleId: this.vehicleId })
  //     .then((data) => {
  //       if (data) {
  //         console.log("vehicleTKData",JSON.stringify(data));
  //         // const startDate = data[0].subscriptionStartTime__c
  //         //   ? new Date(data[0].subscriptionStartTime__c)
  //         //   : null;
  //         this.truckConnectData = data.truckConnectRecords.map((record) => {
  //           if (record.isExpiringSoon) {
  //             this.showTKwarnMessage = true;
  //           }
  //           return {
  //               Id: record.Id,
  //               VehicleId: data.vehicleId,
  //               ContractStartDate: record.subscriptionStartTime__c
  //                   ? this.formatJapaneseDate(record.subscriptionStartTime__c)
  //                   : "-",
  //               ContractEndDate: record.subscriptionEndTime__c
  //                   ? this.formatJapaneseDate(record.subscriptionEndTime__c)
  //                   : "-",
  //               ContractDetails: record.packageNameJp__c
  //                   ? record.packageNameJp__c
  //                   : "-",
  //               AutomaticUpdates: record.isAutoRenewal__c ? "あり" : "なし",
  //               showTKwarnMessage: record.isExpiringSoon || false
  //           };
  //       });
  //         console.log("TK Data:", JSON.stringify(this.truckConnectData));
  //         // this.truckConnectData = {
  //         //   Contractstartdate: data[0].subscriptionStartTime__c
  //         //     ? this.formatJapaneseDate(data[0].subscriptionStartTime__c)
  //         //     : "-",
  //         //   ContractEnddate: data[0].subscriptionEndTime__c
  //         //     ? this.formatJapaneseDate(data[0].subscriptionEndTime__c)
  //         //     : "-",
  //         //   Contractdetails: data[0].packageNameJp__c
  //         //     ? data[0].packageNameJp__c
  //         //     : "-",
  //         //   AutomaticUpdates: data[0].isAutoRenewal__c ? "あり" : "なし" || "-"
  //         // };
  //         // if (startDate && endDate) {
  //         //   const timeDiff = endDate - startDate;
  //         //   const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
  //         //   this.showTKwarnMessage = dayDiff < 30;
  //         //   console.log("flag", this.showTKwarnMessage);
  //         // } else {
  //         //   this.showTKwarnMessage = false;
  //         // }
  //       } else {
  //         console.warn("No data found for the provided vehicle ID");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching Truck Connect Details:", error);
  //       let err = JSON.stringify(error);
  //       ErrorLog({
  //         lwcName: "ccp2_VehicleDetails",
  //         errorLog: err,
  //         methodName: "loadTKData",
  //         ViewName: "Vehicle Details",
  //         InterfaceName: "CCP User Interface",
  //         EventName: "Data fetch",
  //         ModuleName: "VehicleManagement"
  //       })
  //         .then(() => {
  //           console.log("Error logged successfully in Salesforce");
  //         })
  //         .catch((loggingErr) => {
  //           console.error("Failed to log error in Salesforce:", loggingErr);
  //         });
  //     });
  // }

  loadTKData(subStartDT, subEndDT) {
    return truckconnectDetails({
      vehicleId: this.vehicleId,
      subStartDT: subStartDT,
      subEndDT: subEndDT
    })
      .then((data) => {
        if (data) {
          console.log(
            "vehicleTKData, subStartDT,subEndDT",
            JSON.stringify(data),
            subStartDT,
            subEndDT
          );
          this.truckConnectData = data.truckConnectRecords.map((record) => {
            return {
              Id: record.Id,
              VehicleId: data.vehicleId,
              ContractStartDate: record.subscriptionStartTime__c
                ? this.formatJapaneseDate(record.subscriptionStartTime__c)
                : "-",
              ContractEndDate: record.subscriptionEndTime__c
                ? this.formatJapaneseDate(record.subscriptionEndTime__c)
                : "-",
              ContractDetails: record.packageNameJp__c
                ? record.packageNameJp__c
                : "-",
              AutomaticUpdates: record.isAutoRenewal__c ? "あり" : "なし",
              showTKwarnMessage: record.isExpiringSoon || false,
              expiredTruck: record.Expired || false
            };
          });
          console.log("TK Data:", JSON.stringify(this.truckConnectData));
        } else {
          console.warn("No data found for the provided vehicle ID");
        }
      })
      .catch((error) => {
        console.error("Error fetching Truck Connect Details:", error);
        let err = JSON.stringify(error);
        return ErrorLog({
          lwcName: "ccp2_VehicleDetails",
          errorLog: err,
          methodName: "loadTKData",
          ViewName: "Vehicle Details",
          InterfaceName: "CCP User Interface",
          EventName: "Data fetch",
          ModuleName: "VehicleManagement"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  @track clickedflag = "";
  CloseModalSureEdit() {
    this.showsuretoeditModal = false;
  }
  finalChecktoChange() {
    if (this.clickedflag === "mileage") {
      this.vehicleByIdData.Newmileage = this.newmileageback;
      this.closemileageedit();
      this.CloseModalSureEdit();
    } else if (this.clickedflag === "doornumber") {
      this.closedoornumberdit();
      this.CloseModalSureEdit();
    } else if (this.clickedflag === "branches") {
      console.log("JSON Stringify: ", JSON.stringify(this.branchOptions));
      this.closeBranchedit();
      this.CloseModalSureEdit();
    }
  }
  openmileagecancelmodal(event) {
    if (this.vehicleByIdData.Newmileage !== this.vehicleByIdData.mileage) {
      this.showsuretoeditModal = true;
      this.clickedflag = event.currentTarget.dataset.name;
      console.log("Clicked Flag", this.clickedflag);
    } else {
      this.closemileageedit();
    }
  }
  opendoorcancelmodal(event) {
    if (this.vehicleByIdData.newDoor !== this.vehicleByIdData.doorNumber) {
      this.showsuretoeditModal = true;
      this.clickedflag = event.currentTarget.dataset.name;
      console.log("Clicked Flag", this.clickedflag);
    } else {
      this.closedoornumberdit();
    }
  }
  openbranchcancelmodal(event) {
    console.log("end branch 1", JSON.stringify(this.branchOptions));
    console.log("end branch 2", JSON.stringify(this.temBranchoptions));
    console.log(
      "end branch 3",
      JSON.stringify(this.branchOptions) ===
        JSON.stringify(this.temBranchoptions)
    );
    if (
      JSON.stringify(this.branchOptions) !==
      JSON.stringify(this.temBranchoptions)
    ) {
      this.showsuretoeditModal = true;
      this.clickedflag = event.currentTarget.dataset.name;
      console.log("Clicked Flag", this.clickedflag);
    } else {
      this.closeBranchedit();
    }
  }

  // @track startDateSortForQuery = "Default";
  // @track showdefaultIconStartDate = true;
  // @track showascIconStartDate = false;
  // @track showdscIconStartDate = false;

  // @track enddateSortForQuery = "";
  // @track showdefaultIconEndDate = true;
  // @track showascIconEndDate = false;
  // @track showdscIconEndDate = false;

  handlesortconStartdate(event) {
    event.stopPropagation();
    this.enddateSortForQuery = "";
    if (this.startDateSortForQuery === "") {
      this.startDateSortForQuery = "ASC";

      this.enddateSortForQuery = "";
      this.showascIconStartDate = true;
      this.showdefaultIconStartDate = false;
      this.showdscIconStartDate = false;

      this.showascIconEndDate = false;
      this.showdefaultIconEndDate = true;
      this.showdscIconEndDate = false;
    } else if (this.startDateSortForQuery === "ASC") {
      this.startDateSortForQuery = "DESC";

      this.enddateSortForQuery = "";
      this.showascIconStartDate = false;
      this.showdefaultIconStartDate = false;
      this.showdscIconStartDate = true;

      this.showascIconEndDate = false;
      this.showdefaultIconEndDate = true;
      this.showdscIconEndDate = false;
    } else if (this.startDateSortForQuery === "DESC") {
      this.startDateSortForQuery = "ASC";

      this.enddateSortForQuery = "";
      this.showascIconStartDate = true;
      this.showdefaultIconStartDate = false;
      this.showdscIconStartDate = false;

      this.showascIconEndDate = false;
      this.showdefaultIconEndDate = true;
      this.showdscIconEndDate = false;
    }
    console.log(
      "start date sort asc default desc starttt",
      this.showascIconStartDate,
      this.showdefaultIconStartDate,
      this.showdscIconStartDate
    );
    console.log(
      "end date sort asc default desc startttt",
      this.showascIconEndDate,
      this.showdefaultIconEndDate,
      this.showdscIconEndDate
    );
    console.log(
      "startDateSortForQuery enddateSortForQuery startttt",
      this.startDateSortForQuery,
      this.enddateSortForQuery
    );
    this.loadTKData(this.startDateSortForQuery, this.enddateSortForQuery);
  }

  handlesortconEnddate(event) {
    event.stopPropagation();
    this.startDateSortForQuery = "";
    if (this.enddateSortForQuery === "") {
      this.enddateSortForQuery = "ASC";

      this.startDateSortForQuery = "";
      this.showascIconEndDate = true;
      this.showdefaultIconEndDate = false;
      this.showdscIconEndDate = false;

      this.showascIconStartDate = false;
      this.showdefaultIconStartDate = true;
      this.showdscIconStartDate = false;
    } else if (this.enddateSortForQuery === "ASC") {
      this.enddateSortForQuery = "DESC";

      this.startDateSortForQuery = "";
      this.showascIconEndDate = false;
      this.showdefaultIconEndDate = false;
      this.showdscIconEndDate = true;

      this.showascIconStartDate = false;
      this.showdefaultIconStartDate = true;
      this.showdscIconStartDate = false;
    } else if (this.enddateSortForQuery === "DESC") {
      this.enddateSortForQuery = "ASC";

      this.startDateSortForQuery = "";
      this.showascIconEndDate = true;
      this.showdefaultIconEndDate = false;
      this.showdscIconEndDate = false;

      this.showascIconStartDate = false;
      this.showdefaultIconStartDate = true;
      this.showdscIconStartDate = false;
    }
    console.log(
      "start date sort asc default desc endddd",
      this.showascIconStartDate,
      this.showdefaultIconStartDate,
      this.showdscIconStartDate
    );
    console.log(
      "end date sort asc default desc enddd",
      this.showascIconEndDate,
      this.showdefaultIconEndDate,
      this.showdscIconEndDate
    );
    console.log(
      "startDateSortForQuery enddateSortForQuery enddd",
      this.startDateSortForQuery,
      this.enddateSortForQuery
    );
    this.loadTKData(this.startDateSortForQuery, this.enddateSortForQuery);
  }

  handleCreaterecall(event) {
        event.stopPropagation();
    const name = event.target.dataset.name;
    if (name === "Cancel") {
      // this.inputLeaseData = {
      //   inputCompanyName: this.leasedata.CompanyName,
      //   inputContractNumber: this.leasedata.ContractNumber,
      //   inputContractName: this.leasedata.ContractName,
      //   inputContractExpDate: this.leasedata.ContractExpirationdate,
      //   inputContractYear: this.leasedata.ContractYears,
      //   inputMonthlyLeaseFee: this.leasedata.MonthlyLeaseFee,
      //   inputVoluntryInsurance: this.leasedata.VoluntaryInsurance,
      //   inputMemo: this.leasedata.Memo
      // };
      this.inputRecallData = {
        inputClassification: "",
        inputImpStatus: "",
        inputImpDate: "",
        inputRecallSubject: "",
        inputNotifDate: "",
        inputManagementNum: "",
        inputMemo: ""
      };

    } else if (name === "Create") {
      this.inputRecallData = {
        inputClassification: "",
        inputImpStatus: "",
        inputImpDate: "",
        inputRecallSubject: "",
        inputNotifDate: "",
        inputManagementNum: "",
        inputMemo: ""
      };

      // this.leasedata.ContractExpirationdateNormal = null;
      
      this.createModeOfRecallCreateModal = true;
    } else if (name === "Edit") {
      // this.leasedata.ContractExpirationdateNormal = this.leasedata.ContractExpirationdateNormalTem;
      this.createModeOfRecallCreateModal = false;
    }

    this.recallModal = !this.recallModal;
    this.isCalendarOpen2 = false;
    this.isCalendarOpen2R2 = false;
  }

  @track showLeaseDeleteConfirmationModal = false;
  @track showLeaseInsurancePickList = false;
  handleLeaseDeleteConfirmationModal(event) {
    console.log("delete is called!");
    this.showLeaseDeleteConfirmationModal =
      !this.showLeaseDeleteConfirmationModal;
  }

    handleLeaseDeleteConfirmationModalYes(event) {
    this.inputLeaseData = {
        Id:  this.vehicleByIdData.vehicleInfoId,
        inputCompanyName: "",
        inputContractNumber: "",
        inputContractName: "",
        inputContractExpDate: null,
        inputContractYear: null,
        inputMonthlyLeaseFee: null,
        inputVoluntryInsurance: null
      };
 
    console.log("inputLeaseData", this.inputLeaseData);
 
    createLeaseDetail({ jsonInput: JSON.stringify(this.inputLeaseData)})
    .then((result) => {
      this.loadleasedata();
        console.log("Lease created Success!");
        // if (result) console.log("Lease created Success!");
      })
      .catch((error) => {
        console.error("createLeaseDetail error", error);
      });
     
      this.showLeaseDeleteConfirmationModal = false;
  }
 

  @track showCreateLeaseModal = false;
  @track createModeOfLeaseCreateModal = false;
  @track createModeOfRecallCreateModal = false;
  handleCreateLeaseModal(event) {
    event.stopPropagation();
    const name = event.target.dataset.name;
    if (name === "Cancel") {
      this.inputLeaseData = {
        inputCompanyName: this.leasedata.CompanyName,
        inputContractNumber: this.leasedata.ContractNumber,
        inputContractName: this.leasedata.ContractName,
        inputContractExpDate: this.leasedata.ContractExpirationdate,
        inputContractYear: this.leasedata.ContractYears,
        inputMonthlyLeaseFee: this.leasedata.MonthlyLeaseFee,
        inputVoluntryInsurance: this.leasedata.VoluntaryInsurance,
        inputMemo: this.leasedata.MemoForEdit
      };
    } else if (name === "Create") {
      this.inputLeaseData = {
        inputCompanyName: "",
        inputContractNumber: "",
        inputContractName: "",
        inputContractExpDate: "",
        inputContractYear: "",
        inputMonthlyLeaseFee: "",
        inputVoluntryInsurance: "",
        inputMemo: ""
      };

      this.leasedata.ContractExpirationdateNormal = null;
      
      this.createModeOfLeaseCreateModal = true;
    } else if (name === "Edit") {
      this.leasedata.ContractExpirationdateNormal = this.leasedata.ContractExpirationdateNormalTem;
      if(this.leasedata.ContractExpirationdateNormal){
        let temDate = new Date(this.leasedata.ContractExpirationdateNormal);
        this.selectedDate2L1 =  `${temDate.getFullYear()}年${temDate.getMonth() + 1}月${temDate.getDate()}日`;
        console.log('editing time date in calendar : ', this.selectedDate2L1);
      }

      this.inputLeaseData = {
        inputCompanyName: this.leasedata.CompanyName,
        inputContractNumber: this.leasedata.ContractNumber,
        inputContractName: this.leasedata.ContractName,
        inputContractExpDate: this.leasedata.ContractExpirationdateNormal,
        inputContractYear: this.leasedata.ContractYears,
        inputMonthlyLeaseFee: this.leasedata.MonthlyLeaseFee,
        inputVoluntryInsurance: this.leasedata.VoluntaryInsurance,
        inputMemo: this.leasedata.MemoForEdit
      };
      this.createModeOfLeaseCreateModal = false;
    }

    console.log("this.showCreateLeaseModal", this.showCreateLeaseModal, name);
    this.showCreateLeaseModal = !this.showCreateLeaseModal;
    this.isCalendarOpen2L1 = false;
  }

  @track inputLeaseData = {
    inputCompanyName: "",
    inputContractNumber: "",
    inputContractName: "",
    inputContractExpDate: "",
    inputContractYear: "",
    inputMonthlyLeaseFee: "",
    inputVoluntryInsurance: "",
    inputMemo: ""
  };

  get isSaveLeaseButtonDisable() {
    return (
      this.inputLeaseData.inputCompanyName === "" ||
      this.inputLeaseData.inputContractExpDate === "" ||
      this.inputLeaseData.inputContractYear === ""
    );
  }

  handleLeaseInsurancePicklistValueSelect(event) {
    event.stopPropagation();
    this.showLeaseInsurancePickList = !this.showLeaseInsurancePickList;
    this.inputLeaseData.inputVoluntryInsurance = event.target.dataset.name;
  }

  handleLeaseCreateInputChange(event) {
    this.handlevalchange(event);
    console.log("event Name", event.target.name);
    const name = event.target.name;
    const value = event.target.value;

    if (name === "inputVoluntryInsurance") {
      event.stopPropagation();
      this.showLeaseInsurancePickList = !this.showLeaseInsurancePickList;
      return;
    }
    this.inputLeaseData[name] = value;
    console.log("input lease data", this.inputLeaseData);
  }

  handleRecallCreateInputChange(event){
    this.handlevalchange(event);
    console.log("event Name", event.target.name);
    const name = event.target.name;
    const value = event.target.value;

    this.inputRecallData[name] = value;
    console.log("input recall data", this.inputRecallData);
  }

  @track showMemoEditUi = false;
  handleLeaseMemoEditUi() {
    this.showMemoEditUi = !this.showMemoEditUi;
  }

  handleLeaseSave(event) {
    this.inputLeaseData.Id = this.vehicleByIdData.vehicleInfoId;
    console.log("inputLeaseData", this.inputLeaseData);
    if(!this.createModeOfLeaseCreateModal){
       this.inputLeaseData.inputContractYear = this.inputLeaseData.inputContractYear.replace('年', '');
       this.inputLeaseData.inputMonthlyLeaseFee = this.inputLeaseData.inputMonthlyLeaseFee.replace('¥ ', '');
    }
    createLeaseDetail({ jsonInput: JSON.stringify(this.inputLeaseData)})
      .then((result) => {
        this.loadleasedata();
        console.log("Lease created Success!");
        // if (result) console.log("Lease created Success!");
      })
      .catch((error) => {
        console.error("createLeaseDetail error", error);
      });
    this.isCalendarOpen2L1 = false;
    this.showCreateLeaseModal = false;
  }
  handleLeaseMemoSave(event) {
    let inputTemForMemo = {
      Id : this.vehicleByIdData.vehicleInfoId,
      inputMemo: this.inputLeaseData.MemoForEdit
    }
   
    console.log("inputTemForMemo", inputTemForMemo);
    createLeaseDetail({ jsonInput: JSON.stringify(inputTemForMemo)})
      .then((result) => {
        this.loadleasedata();
        console.log("Lease created Success!");
        // if (result) console.log("Lease created Success!");
      })
      .catch((error) => {
        console.error("createLeaseDetail error", error);
      });

    this.showMemoEditUi = false;
  }

  handlebackRecallCreate() {
    this.recallModal = false;
  }

  handleCategoryRecall() {
    this.catDropdown = !this.catDropdown;
  }

  handleRecallcategSel(event) {
    this.recallCategoryselected = event.currentTarget.dataset.value;
    this.catDropdown = false;
    this.inputRecallData.inputClassification = this.recallCategoryselected;
    console.log("recallCategoryselected", this.recallCategoryselected);
  }

  handleImpstatusRecall() {
    this.impstatusDropdown = !this.impstatusDropdown;
  }

  handleRecallstatusSel(event) {
    this.recallImpstatusSelected = event.currentTarget.dataset.value;
    this.impstatusDropdown = false;
    this.inputRecallData.inputImpStatus = this.recallImpstatusSelected;
    console.log("recallstatuss", this.recallImpstatusSelected, event);
  }

  /* Recall Calendar 1 here */
  openCalendarImplementation(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showPosterreal = false;
      this.isCalendarOpen2 = !this.isCalendarOpen2;
      // this.isCalendarOpen = false;
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
      // if (temD === null && !this.selectedDay2) {
      if (temD === null && !this.myday2) {
        let t = new Date();
        this.myMonth2 = t.getMonth() + 1;
        this.myYear2 = t.getFullYear();
      }

      if (this.selectedDay2 !== this.myday2) {
        // console.log("yes not same!!", this.selectedDay, this.myday);
        this.selectedDay2 = this.myday2;
      }
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
    let todayMonth = today.getMonth() + 1;
    let todayYear = today.getFullYear();
    if (
      this.year2 >= todayYear ||
      (this.month2 > todayMonth && this.year2 === todayYear - 1)
    ) {
      this.isNextYearDisabled2 = true;
    } else {
      this.isNextYearDisabled2 = false;
    }
    if (this.month2 === todayMonth && this.year2 === todayYear) {
      this.isNextMonthDisabled2 = true;
    } else {
      this.isNextMonthDisabled2 = false;
    }

    const nextMonth = new Date(this.year2, this.month2);
    const prevMonth = new Date(this.year2, this.month2 - 1);
    this.isNextMonthDisabled2 = nextMonth > today;
    this.isPrevMonthDisabled2 = prevMonth < today;
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
      const inputField = this.template.querySelector(".input-recall");
      inputField.value = this.selectedDate2;

      const selectedDateToSend = new Date(
        this.year2,
        this.month2 - 1,
        this.selectedDay2
      );
      this.selectedDateToSend2 = this.formatDateToYYYYMMDD(selectedDateToSend);
      // this.serviceFactoryOptions = this.serviceFactoryOptions.filter(
      //   (ser) => ser.label !== "ふそう"
      // );
      // if (this.selectedPicklistfactoryType === "ふそう") {
      //   this.selectedPicklistfactoryType = "";
      //   this.BranchSearchList = true;
      //   this.FusoSearchList = false;
      //   this.handleRemovesearchKeyFuso();
      // }
      this.inputRecallData.inputImpDate = this.selectedDateToSend2;
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
    const inputField = this.template.querySelector(".input-recall");
    inputField.value = "";
    this.selectedDateToSend2 = null;
    // this.maintenanceDetails.Implementation_Date__c = null;
    // this.maintenanceDetails.Implementation_Date__c2 = null;

    // Reset the selected state of all buttons
    const selectedButtons = this.template.querySelectorAll(
      ".day-button.selected"
    );
    selectedButtons.forEach((button) => button.classList.remove("selected"));
    this.populateCalendar2();
    this.serviceFactoryOptions = this.serviceFactoryOptionsreset;

    this.isNextYearDisabled2 = true;
    this.isNextMonthDisabled2 = true;
  }

  goToPreviousMonth2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (this.showPosterreal) {
        if (!this.isPrevMonthDisabled2) {
          this.month2--;
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

      const today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayYear = today.getFullYear();

      if (todayYear - 1 >= this.year2 && todayMonth >= this.month2) {
        this.isNextYearDisabled2 = false;
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
        if (this.month2 > 12) {
          this.month2 = 1;
          this.year2++;
        }
        if (this.myMonth2 === this.month2 && this.myYear2 === this.year2) {
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
        if (this.month2 > 12) {
          this.month2 = 1;
          this.year2++;
        }
        if (this.myMonth2 === this.month2 && this.myYear2 === this.year2) {
          this.selectedDay2 = this.myday2;
          // this.selectedDate = null;
        }
        // this.selectedDay = null;
        //this.selectedDate = null;
        this.populateCalendar2();
      }

      const today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayYear = today.getFullYear();

      if (todayMonth === this.month2 && todayYear === this.year2) {
        this.isNextYearDisabled2 = true;
      }

      /* Last Modified by Singh Jashanpreet */
      if (todayYear - 1 === this.year2 && todayMonth < this.month2) {
        this.isNextYearDisabled2 = true;
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
    return monthLabels[month - 1];
  }

  get displayDate() {
    if (this.selectedDate2) {
      return this.selectedDate2 === "-" ? "" : this.selectedDate2;
    }

    // if (this.maintenanceDetails.Implementation_Date__c) {
    //   return this.maintenanceDetails.Implementation_Date__c === "-"
    //     ? ""
    //     : this.maintenanceDetails.Implementation_Date__c;
    // }

    return "";
  }

  get monthLabel2() {
    return this.getMonthLabel(this.month2);
  }

  get era2() {
    return this.getJapaneseEra(this.year2);
  }

  prevYear2() {
    //for history
    this.isNextYearDisabled2 = false;
    this.year2--;
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
    // this.selectedDay2 = null;
    // if (this.myYear2 === this.year2) {
    //   this.selectedDay2 = this.myday2;
    //   this.month2 = this.myMonth2;
    // }
    this.populateCalendar2();
  }

  nextyear2() {
    //for history
    // this.isPrevDisabled = false;
    // this.isPrevYearDisabled = false;

    this.year2++;
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
    //this.selectedDay2 = null;
    // if (this.myYear === this.year) {
    //   this.selectedDay = this.myday;
    //   this.month = this.myMonth;
    // }
    this.populateCalendar2();

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
      this.isNextYearDisabled2
    );
    //isNextMonthDisabled2
    //isNextYearDisabled2
    if (
      todayYear <= this.year2 ||
      (this.month2 > todayMonth && todayYear - 1 === this.year2)
    ) {
      //2025 -
      this.isNextYearDisabled2 = true;
    }
    if (todayYear === this.year2 && this.month2 === todayMonth) {
      this.isNextMonthDisabled2 = true;
      this.isNextYearDisabled2 = true;
    }
  }


   /* Recall Calendar 2 here */
  openCalendarImplementationR2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      // this.showPosterreal = false;
      this.isCalendarOpen2R2 = !this.isCalendarOpen2R2;
      // this.isCalendarOpen = false;
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
      if (!this.myday2R2 && temD) this.myday2R2 = temD.getDate();
      if (!this.myMonth2R2 && temD) this.myMonth2R2 = temD.getMonth() + 1;
      if (!this.myYear2R2 && temD) this.myYear2R2 = temD.getFullYear();
      // if (temD === null && !this.selectedDay2) {
      if (temD === null && !this.myday2R2) {
        let t = new Date();
        this.myMonth2R2 = t.getMonth() + 1;
        this.myYear2R2 = t.getFullYear();
      }

      if (this.selectedDay2R2 !== this.myday2R2) {
        // console.log("yes not same!!", this.selectedDay, this.myday);
        this.selectedDay2R2 = this.myday2R2;
      }
      if (this.month2R2 !== this.myMonth2R2 && this.myMonth2R2 !== undefined) {
        this.month2R2 = this.myMonth2R2;
      }
      if (this.year2R2 !== this.myYear2R2 && this.myYear2R2 !== undefined) {
        this.year2R2 = this.myYear2R2;
      }

      this.populateCalendar2R2();

      if (this.selectedDay2R2) {
        const selectedButton = this.template.querySelector(
          `.day-button[data-day="${this.selectedDay2R2}"]`
        );
        if (selectedButton) {
          selectedButton.classList.add("selected");
        }
      }
    }
  }

  closeCalendar2R2() {
    this.isCalendarOpen2R2 = false;
  }

  populateCalendar2R2() {
    const today = new Date();
    const firstDayOfMonth = new Date(this.year2R2, this.month2R2 - 1, 1).getDay(); // Day of the week for 1st of the month
    const daysInMonth = new Date(this.year2R2, this.month2R2, 0).getDate(); // Number of days in the month

    // Initialize calendarDates array
    this.calendarDates2R2 = [];
    this.isNextMonthDisabled2R2 = false; // Reset flag for next month
    this.isPrevMonthDisabled2R2 = false; // Reset flag for prev month

    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDates2R2.push({
        value: "",
        className: "day-button empty",
        isEmpty: true,
        isDisabled: true
      });
    }

    if (!this.showPosterreal) {
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(this.year2R2, this.month2R2 - 1, i); // JS date function has months indexed from 0-11
        const isDisabled = currentDate > today;

        // Check if this date is the previously selected date
        const isSelected = this.selectedDay2R2 && this.selectedDay2R2 == i;
        let buttonClass = "day-button filled";

        if (isDisabled) {
          buttonClass += " disabled";
        } else if (isSelected) {
          buttonClass += " selected";
        }

        this.calendarDates2R2.push({
          value: i,
          className: buttonClass,
          isEmpty: false,
          isDisabled
        });
      }
    } else {
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(this.year2R2, this.month2R2 - 1, i); // JS date function has months indexed from 0-11
        const isDisabled = currentDate < today;

        // Check if this date is the previously selected date
        const isSelected = this.selectedDay2R2 && this.selectedDay2R2 == i;
        let buttonClass = "day-button filled";

        if (isDisabled) {
          buttonClass += " disabled";
        } else if (isSelected) {
          buttonClass += " selected";
        }

        this.calendarDates2R2.push({
          value: i,
          className: buttonClass,
          isEmpty: false,
          isDisabled
        });
      }
    }
    let todayMonth = today.getMonth() + 1;
    let todayYear = today.getFullYear();
    if((this.year2R2 >= todayYear) || (this.month2R2 > todayMonth && this.year2R2 === todayYear - 1)){
      this.isNextYearDisabled2R2 = true;
    } else{
      this.isNextYearDisabled2R2 = false;
    }
    if(this.month2R2 === todayMonth && this.year2R2 === todayYear){
      this.isNextMonthDisabled2R2 = true;
    } else{
      this.isNextMonthDisabled2R2 = false;
    }

    const nextMonth = new Date(this.year2R2, this.month2R2);
    const prevMonth = new Date(this.year2R2, this.month2R2 - 1);
    this.isNextMonthDisabled2R2 = nextMonth > today;
    this.isPrevMonthDisabled2R2 = prevMonth < today;
  }

  selectDate2R2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const selectedDay = event.target.textContent;

      // Remove 'selected' class from the previously selected day
      if (this.selectedDay2R2) {
        const previouslySelected =
          this.template.querySelector(`.day-button.selected`);
        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
        }
      }

      // Set the selected day if it's not disabled
      if (selectedDay && !event.target.disabled) {
        this.selectedDay2R2 = selectedDay;
        const currentButton = event.target;
        currentButton.classList.add("selected"); // Mark this button as selected

        // Update only `selectedDateToSend`, not `selectedDate` yet
      }

      this.confirmDate2R2();
    }
  }

  confirmDate2R2() {
    if (this.selectedDay2R2) {
      // Update the formatted `selectedDate` when confirm is clicked
      this.selectedDate2R2 = `${this.year2R2}年${this.month2R2}月${this.selectedDay2R2}日`;
      this.myday2R2 = this.selectedDay2R2;
      this.myMonth2R2 = this.month2R2;
      this.myYear2R2 = this.year2R2;
      // Update the input field with the selected date
      const inputField = this.template.querySelector(".input-recall");
      inputField.value = this.selectedDate2R2;

      const selectedDateToSend = new Date(
        this.year2R2,
        this.month2R2 - 1,
        this.selectedDay2R2
      );
      this.selectedDateToSend2R2 = this.formatDateToYYYYMMDD(selectedDateToSend);
      // this.serviceFactoryOptions = this.serviceFactoryOptions.filter(
      //   (ser) => ser.label !== "ふそう"
      // );
      // if (this.selectedPicklistfactoryType === "ふそう") {
      //   this.selectedPicklistfactoryType = "";
      //   this.BranchSearchList = true;
      //   this.FusoSearchList = false;
      //   this.handleRemovesearchKeyFuso();
      // }
      this.inputRecallData.inputNotifDate = this.selectedDateToSend2R2;
    }
    this.isCalendarOpen2R2 = false;
  }

  resetDate2R2() {
    this.selectedDate2R2 = null;
    this.selectedDay2R2 = null; // Clear the selected day
    const todayD = new Date();
    this.year2R2 = todayD.getFullYear();
    this.myYear2R2 = todayD.getFullYear();
    this.month2R2 = todayD.getMonth() + 1;
    this.myMonth2R2 = todayD.getMonth() + 1;
    this.myday2R2 = undefined;
    const inputField = this.template.querySelector(".custom-input");
    inputField.value = "";
    this.selectedDateToSend2R2 = null;
    // this.maintenanceDetails.Implementation_Date__c = null;
    // this.maintenanceDetails.Implementation_Date__c2 = null;

    // Reset the selected state of all buttons
    const selectedButtons = this.template.querySelectorAll(
      ".day-button.selected"
    );
    selectedButtons.forEach((button) => button.classList.remove("selected"));
    this.populateCalendar2R2();
    // this.serviceFactoryOptions = this.serviceFactoryOptionsreset;

    this.isNextYearDisabled2R2 = true;
    this.isNextMonthDisabled2R2 = true;
  }

  goToPreviousMonth2R2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (this.showPosterreal) {
        if (!this.isPrevMonthDisabled2R2) {
          this.month2R2--;
          this.selectedDay2R2 = null;

          if (this.month2R2 < 1) {
            this.month2R2 = 12;
            this.year2R2--;
          }

          if (this.myMonth2R2 === this.month2R2 && this.myYear2R2 === this.year2R2) {
            this.selectedDay2R2 = this.myday2R2;
          }

          //this.selectedDate = null;
          const selectedButtons = this.template.querySelectorAll(
            ".day-button.selected"
          );
          selectedButtons.forEach((button) =>
            button.classList.remove("selected")
          );
          this.populateCalendar2R2();
        }
      } else {
        this.month2R2--;
        this.selectedDay2R2 = null;

        if (this.month2R2 < 1) {
          this.month2R2 = 12;
          this.year2R2--;
        }

        if (this.myMonth2R2 === this.month2R2 && this.myYear2R2 === this.year2R2) {
          this.selectedDay2R2 = this.myday2R2;
        }

        //this.selectedDate = null;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button.selected"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove("selected")
        );
        this.populateCalendar2R2();
      }

      const today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayYear = today.getFullYear();

      if (todayYear - 1 >=  this.year2R2 && todayMonth >= this.month2R2) {
        this.isNextYearDisabled2R2 = false;
      }
    }
  }

  goToNextMonth2R2(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (!this.isNextMonthDisabled2R2 && !this.showPosterreal) {
        this.month2R2++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button.selected"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove("selected")
        );
        this.selectedDay2R2 = null;
        if (this.month2R2 > 12) {
          this.month2R2 = 1;
          this.year2R2++;
        }
        if (this.myMonth2R2 === this.month2R2 && this.myYear2R2 === this.year2R2) {
          this.selectedDay2 = this.myday2;
          // this.selectedDate = null;
        }
        // this.selectedDay = null;
        //this.selectedDate = null;
        this.populateCalendar2R2();
      } else if (this.showPosterreal) {
        this.month2R2++;
        const selectedButtons = this.template.querySelectorAll(
          ".day-button.selected"
        );
        selectedButtons.forEach((button) =>
          button.classList.remove("selected")
        );
        this.selectedDay2R2 = null;
        if (this.month2R2 > 12) {
          this.month2R2 = 1;
          this.year2R2++;
        }
        if (this.myMonth2R2 === this.month2R2 && this.myYear2R2 === this.year2R2) {
          this.selectedDay2R2 = this.myday2R2;
          // this.selectedDate = null;
        }
        // this.selectedDay = null;
        //this.selectedDate = null;
        this.populateCalendar2R2();
      }

      const today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayYear = today.getFullYear();

      if (todayMonth === this.month2R2 && todayYear === this.year2R2) {
        this.isNextYearDisabled2R2 = true;
      }

      /* Last Modified by Singh Jashanpreet */
      if (todayYear - 1 === this.year2R2 && todayMonth < this.month2R2) {
        this.isNextYearDisabled2R2 = true;
      }
    }
  }

  get displayDateR2() {
    if (this.selectedDate2R2) {
      return this.selectedDate2R2 === "-" ? "" : this.selectedDate2R2;
    }

    // if (this.maintenanceDetails.Implementation_Date__c) {
    //   return this.maintenanceDetails.Implementation_Date__c === "-"
    //     ? ""
    //     : this.maintenanceDetails.Implementation_Date__c;
    // }

    return "";
  }

  get monthLabel2R2() {
    return this.getMonthLabel(this.month2R2);
  }

  get era2R2() {
    return this.getJapaneseEra(this.year2R2);
  }

    prevYear2R2() {
    //for history
      this.isNextYearDisabled2R2 = false;
      this.year2R2--;
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
      // this.selectedDay2 = null;
      // if (this.myYear2 === this.year2) {
      //   this.selectedDay2 = this.myday2;
      //   this.month2 = this.myMonth2;
      // }
      this.populateCalendar2R2();
  }

  nextyear2R2() {
    //for history
      // this.isPrevDisabled = false;
      // this.isPrevYearDisabled = false;

      this.year2R2++;
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
      //this.selectedDay2 = null;
      // if (this.myYear === this.year) {
      //   this.selectedDay = this.myday;
      //   this.month = this.myMonth;
      // }
      this.populateCalendar2R2();

      /* Last Modified by Singh Jashanpreet */
      const today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayYear = today.getFullYear();

      console.log(
        todayYear,
        " ",
        this.yearR2,
        " ",
        todayMonthR2,
        " ",
        this.isNextYearDisabled2R2
      );
        //isNextMonthDisabled2
  //isNextYearDisabled2
      if (
        todayYear <= this.year2R2 ||
        (this.month2R2 > todayMonth && todayYear - 1 === this.year2R2)
      ) {
        //2025 -
        this.isNextYearDisabled2R2 = true;
      }
      if (todayYear === this.year2R2 && this.month2R2 === todayMonth) {
        this.isNextMonthDisabled2R2 = true;
        this.isNextYearDisabled2R2 = true;
      }
  }




  /* Lease Calendar here */
  openCalendarImplementationL1(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.isCalendarOpen2L1 = !this.isCalendarOpen2L1;

      let temD = this.leasedata?.ContractExpirationdateNormal
        ? new Date(this.leasedata?.ContractExpirationdateNormal)
        : null;

      if(this.createModeOfLeaseCreateModal){
        temD = null;
      }
      if (!this.myday2L1 && temD) this.myday2L1 = temD.getDate();
      if (!this.myMonth2L1 && temD) this.myMonth2L1 = temD.getMonth() + 1;
      if (!this.myYear2L1 && temD) this.myYear2L1 = temD.getFullYear();

      if (temD === null && !this.myday2L1) {
        let t = new Date();
        this.myMonth2L1 = t.getMonth() + 1;
        this.myYear2L1 = t.getFullYear();
      }

      if (this.selectedDay2L1 !== this.myday2L1) {
        this.selectedDay2L1 = this.myday2L1;
      }
      if (this.month2L1 !== this.myMonth2L1 && this.myMonth2L1 !== undefined) {
        this.month2L1 = this.myMonth2L1;
      }
      if (this.year2L1 !== this.myYear2L1 && this.myYear2L1 !== undefined) {
        this.year2L1 = this.myYear2L1;
      }

      this.populateCalendar2L1();

      console.log(
        "this.selectedDay2L1this.selectedDay2L1",
        this.selectedDay2L1
      );
      if (this.selectedDay2L1) {
        const selectedButton = this.template.querySelector(
          `.day-buttonL1[data-day="${this.selectedDay2L1}"]`
        );
        console.log("is selectedbutton enter");
        console.log("is selectedbutton", selectedButton);
        if (selectedButton) {
          selectedButton.classList.add("selected");
        }
      }
    }
  }

  closeCalendar2L1() {
    this.isCalendarOpen2L1 = false;
  }

  populateCalendar2L1() {
    const today = new Date();
    const firstDayOfMonth = new Date(
      this.year2L1,
      this.month2L1 - 1,
      1
    ).getDay(); // Day of the week for 1st of the month
    const daysInMonth = new Date(this.year2L1, this.month2L1, 0).getDate(); // Number of days in the month

    // Initialize calendarDates array
    this.calendarDates2L1 = [];

    // this.isNextMonthDisabled2 = false; // Reset flag for next month
    // this.isPrevMonthDisabled2 = false; // Reset flag for prev month

    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.calendarDates2L1.push({
        value: "",
        className: "day-buttonL1 empty",
        isEmpty: true,
        isDisabled: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(this.year2L1, this.month2L1 - 1, i); // JS date function has months indexed from 0-11
      // const isDisabled = currentDate > today;

      // Check if this date is the previously selected date
      const isSelected = this.selectedDay2L1 && this.selectedDay2L1 == i;
      let buttonClass = "day-buttonL1 filled";

      if (isSelected) {
        buttonClass += " selected";
      }

      this.calendarDates2L1.push({
        value: i,
        className: buttonClass,
        isEmpty: false,
        isDisabled: false
      });
    }

    let todayMonth = today.getMonth() + 1;
    let todayYear = today.getFullYear();
    // if((this.year2L1 >= todayYear) || (this.month2L1 > todayMonth && this.year2L1 === todayYear - 1)){
    //   this.isNextYearDisabled2 = true;
    // } else{
    //   this.isNextYearDisabled2 = false;
    // }
    // if(this.month2L1 === todayMonth && this.year2L1 === todayYear){
    //   this.isNextMonthDisabled2 = true;
    // } else{
    //   this.isNextMonthDisabled2 = false;
    // }

    // const nextMonth = new Date(this.year2L1, this.month2L1);
    // const prevMonth = new Date(this.year2L1, this.month2L1 - 1);
    // this.isNextMonthDisabled2 = nextMonth > today;
    // this.isPrevMonthDisabled2 = prevMonth < today;
  }

  selectDate2L1(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      const selectedDay = event.target.textContent;

      // Remove 'selected' class from the previously selected day
      if (this.selectedDay2L1) {
        const previouslySelected = this.template.querySelector(
          `.day-buttonL1.selected`
        );
        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
        }
      }

      // Set the selected day if it's not disabled
      if (selectedDay && !event.target.disabled) {
        this.selectedDay2L1 = selectedDay;
        const currentButton = event.target;
        currentButton.classList.add("selected"); // Mark this button as selected

        // Update only `selectedDateToSend`, not `selectedDate` yet
      }

      this.confirmDate2L1();
    }
  }

  confirmDate2L1() {
    if (this.selectedDay2L1) {
      // Update the formatted `selectedDate` when confirm is clicked
      this.selectedDate2L1 = `${this.year2L1}年${this.month2L1}月${this.selectedDay2L1}日`;
      this.myday2L1 = this.selectedDay2L1;
      this.myMonth2L1 = this.month2L1;
      this.myYear2L1 = this.year2L1;
      // Update the input field with the selected date
      const inputField = this.template.querySelector(".input-recall");
      inputField.value = this.selectedDate2L1;

      const selectedDateToSend = new Date(
        this.year2L1,
        this.month2L1 - 1,
        this.selectedDay2L1
      );
      this.selectedDateToSend2L1 =
        this.formatDateToYYYYMMDD(selectedDateToSend);

      this.inputLeaseData.inputContractExpDate = this.selectedDateToSend2L1;
    }
    this.isCalendarOpen2L1 = false;
  }

  resetDate2L1() {
    this.selectedDate2L1 = null;
    this.selectedDay2L1 = null; // Clear the selected day
    this.inputLeaseData.inputContractExpDate = "";
    const todayD = new Date();
    this.year2L1 = todayD.getFullYear();
    this.myYear2L1 = todayD.getFullYear();
    this.month2L1 = todayD.getMonth() + 1;
    this.myMonth2L1 = todayD.getMonth() + 1;
    this.myday2L1 = undefined;
    const inputField = this.template.querySelector(".input-recall");
    inputField.value = "";
    this.selectedDateToSend2L1 = null;
    // this.maintenanceDetails.Implementation_Date__c = null;
    // this.maintenanceDetails.Implementation_Date__c2 = null;

    // Reset the selected state of all buttons
    const selectedButtons = this.template.querySelectorAll(
      ".day-buttonL1.selected"
    );
    console.log("selectedButtons for reset", selectedButtons);
    selectedButtons.forEach((button) => button.classList.remove("selected"));
    this.populateCalendar2L1();
    // this.serviceFactoryOptions = this.serviceFactoryOptionsreset;

    // this.isNextYearDisabled2 = true;
    // this.isNextMonthDisabled2 = true;
  }

  goToPreviousMonth2L1(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      // if (!this.isPrevMonthDisabled2) {
      this.month2L1--;
      this.selectedDay2L1 = null;

      if (this.month2L1 < 1) {
        this.month2L1 = 12;
        this.year2L1--;
      }

      if (
        this.myMonth2L1 === this.month2L1 &&
        this.myYear2L1 === this.year2L1
      ) {
        this.selectedDay2L1 = this.myday2L1;
      }

      //this.selectedDate = null;
      const selectedButtons = this.template.querySelectorAll(
        ".day-buttonL1.selected"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected"));
      this.populateCalendar2L1();
      // }

      // const today = new Date();
      // let todayMonth = today.getMonth() + 1;
      // let todayYear = today.getFullYear();

      // if (todayYear - 1 >=  this.year2L1 && todayMonth >= this.month2L1) {
      //   this.isNextYearDisabled2 = false;
      // }
    }
  }

  goToNextMonth2L1(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      this.month2L1++;
      const selectedButtons = this.template.querySelectorAll(
        ".day-buttonL1.selected"
      );
      selectedButtons.forEach((button) => button.classList.remove("selected"));
      this.selectedDay2L1 = null;
      if (this.month2L1 > 12) {
        this.month2L1 = 1;
        this.year2L1++;
      }
      if (
        this.myMonth2L1 === this.month2L1 &&
        this.myYear2L1 === this.year2L1
      ) {
        this.selectedDay2L1 = this.myday2L1;
        // this.selectedDate = null;
      }
      // this.selectedDay = null;
      //this.selectedDate = null;
      this.populateCalendar2L1();

      const today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayYear = today.getFullYear();

      // if (todayMonth === this.month2L1 && todayYear === this.year2L1) {
      //   this.isNextYearDisabled2 = true;
      // }

      // /* Last Modified by Singh Jashanpreet */
      // if (todayYear - 1 === this.year2L1 && todayMonth < this.month2L1) {
      //   this.isNextYearDisabled2 = true;
      // }
    }
  }

  get displayDateL1() {
    if (this.selectedDate2L1) {
      return this.selectedDate2L1 === "-" ? "" : this.selectedDate2L1;
    }

    // if (this.maintenanceDetails.Implementation_Date__c) {
    //   return this.maintenanceDetails.Implementation_Date__c === "-"
    //     ? ""
    //     : this.maintenanceDetails.Implementation_Date__c;
    // }

    return "";
  }

  get monthLabel2L1() {
    return this.getMonthLabel(this.month2L1);
  }

  get era2L1() {
    return this.getJapaneseEra(this.year2L1);
  }

  prevYear2L1() {
    //for history
    // this.isNextYearDisabled2 = false;
    this.year2L1--;
    const selectedButtons = this.template.querySelectorAll(
      ".day-buttonL1.selected"
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
    this.selectedDay2L1 = null;
    if (this.myYear2L1 === this.year2L1) {
      this.selectedDay2L1 = this.myday2L1;
      this.month2L1 = this.myMonth2L1;
    }
    this.populateCalendar2L1();
  }

  nextyear2L1() {
    //for history
    // this.isPrevDisabled = false;
    // this.isPrevYearDisabled = false;

    this.year2L1++;
    const selectedButtons = this.template.querySelectorAll(
      ".day-buttonL1.selected"
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
    this.selectedDay2L1 = null;
    if (this.myYear2L1 === this.year2L1) {
      this.selectedDay2L1 = this.myday2L1;
      this.month2L1 = this.myMonth2L1;
    }
    this.populateCalendar2L1();

    //     /* Last Modified by Singh Jashanpreet */
    //     const today = new Date();
    //     let todayMonth = today.getMonth() + 1;
    //     let todayYear = today.getFullYear();

    //     console.log(
    //       todayYear,
    //       " ",
    //       this.year,
    //       " ",
    //       todayMonth,
    //       " ",
    //       this.month,
    //       " ",
    //       this.isNextYearDisabled2
    //     );
    //       //isNextMonthDisabled2
    // //isNextYearDisabled2
    //     if (
    //       todayYear <= this.year2L1 ||
    //       (this.month2L1 > todayMonth && todayYear - 1 === this.year2L1)
    //     ) {
    //       //2025 -
    //       this.isNextYearDisabled2 = true;
    //     }
    //     if (todayYear === this.year2L1 && this.month2L1 === todayMonth) {
    //       this.isNextMonthDisabled2 = true;
    //       this.isNextYearDisabled2 = true;
    //     }
  }
}
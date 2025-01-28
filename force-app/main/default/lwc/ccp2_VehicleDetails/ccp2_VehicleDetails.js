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

//import MaintainenceLeaseInfo from "@salesforce/apex/CCP2_Notification_Controller.maintenanceLeaseInfo";
import getImagesAsBase64 from "@salesforce/apex/VehicleImageService.getImagesAsBase64";
// import getMarketMeasureApi from "@salesforce/apex/ccp2_download_recall_controller.recallinfo";
import getMarketMeasureParamsApi from "@salesforce/apex/ccp2_download_recall_controller.recallinfoNew";
import deleteAndRecovervehicle from "@salesforce/apex/ccp2_download_recall_controller.deleteAndRecoverVehicle";
import vehicleBranchName from "@salesforce/apex/CCP2_VehicleDetailController.vehicleBranchName";
import getVehicleCertificates from "@salesforce/apex/CCP2_VehicleDetailController.vehicleImageCountTitle";
import updateFavVehicleApi from "@salesforce/apex/CCP2_VehicleDetailController.updateFavVehicle";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import DELETE_STATUS from "@salesforce/schema/ccp2_Registered_Vehicle__c.Status__c";
import DELETE_REASON from "@salesforce/schema/ccp2_Registered_Vehicle__c.Reason__c";
import truckonnectLogo from "@salesforce/resourceUrl/CCP2_Truckonnect";
import CCP2_Resources from "@salesforce/resourceUrl/CCP2_Resources";
import labelsVehicle from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";

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
  @track vehicleChessisNumberForHistory;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;

  @track vehicleByIdLoader = true;
  @track showEmptyContiner = false;
  @track vehicleidforpictures = "";
  @track showTKwarnMessage = false;
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
  @track DownloadNameValue = "日付- カスタマーポータル車両リスト.csv";

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

  truckLogoUrl = truckonnectLogo;

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

  @track nextBtnCss = "next-btn1";

  get isweightValid() {
    return this.vehicleByIdData.vehicleWeigth !== '-';
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
          methodName: "FAV ICON CLASS"
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
        methodName: "service type picklist"
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
        methodName: "service factory"
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

    const { data, error } = result;

    if (data) {
      console.log("geting from vehicle by Id: ", this.vehicleId);
      console.log("geting from vehicle by Id api: ", JSON.stringify(data));
      this.vehidnew = this.vehicleId;
      this.vehId = this.vehicleId;

      this.vehicelInfoId = data?.Vehicle_Info_Id__c;
      this.vehicleChessisNumberForHistory = data?.Chassis_number__c;
      if (data.length !== 0) {
        let obj = {
          id: data?.Id === undefined ? "-" : data?.Id,
          name:
            data?.Vehicle_Name__c === undefined ? "-" : data?.Vehicle_Name__c,
          type:
            data?.Vehicle_Type__c === undefined ? "-" : data?.Vehicle_Type__c,
          Favourite: !this.vehicleIcons
            ? data?.Favoruite_Vehicle__c === true
              ? "utility:favorite"
              : "utility:favorite_alt"
            : this.vehicleIcons,
          carBodyShape:
            data?.Body_Shape__c === undefined ? "-" : data?.Body_Shape__c,
          chassisNumber:
            data?.Chassis_number__c === undefined
              ? "-"
              : data?.Chassis_number__c,
          doorNumber:
            data?.Door_Number__c === undefined ? "-" : data?.Door_Number__c,
          newDoor:
            data?.Door_Number__c === undefined ? "-" : data?.Door_Number__c,
          doorEllipse:
            data?.Door_Number__c === undefined
              ? "-"
              : data.Door_Number__c.length > 16
                ? data.Door_Number__c.substring(0, 8) + "..."
                : data.Door_Number__c,
          firstRegistrationDate:
            data?.First_Registration_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate2(data?.First_Registration_Date__c), // Apply Japanese date formatting

          typeOfFuel:
            data?.Fuel_Type__c === undefined ? "-" : data?.Fuel_Type__c,
          mileage:
            this.formatMileage(data?.Mileage__c) === undefined
              ? "-"
              : this.formatMileage(data?.Mileage__c),
          Newmileage:
            this.formatMileage(data?.Mileage__c) === undefined
              ? "-"
              : this.formatMileage(data?.Mileage__c),
          privateBusinessUse:
            data?.Private_Business_use__c === undefined
              ? "-"
              : data?.Private_Business_use__c,
          vehicleNumber:
            data?.Vehicle_Number__c === undefined
              ? "-"
              : data?.Vehicle_Number__c,
          affiliation:
            data?.affiliation === undefined ? "-" : data?.affiliation,
          vehicleWeigth:
            this.formatMileage(data?.vehicleWeight__c) === undefined
              ? "-"
              : this.formatMileage(data?.vehicleWeight__c),
          model: data?.fullModel__c === undefined ? "-" : data?.fullModel__c,
          purpose: data?.Use__c === undefined ? "-" : data?.Use__c,
          vehicleInspectionImage:
            data?.vehicleInspectionImage === undefined
              ? "-"
              : data?.vehicleInspectionImage,
          vehicleInspectionCertificateIssueDate:
            data?.vehicleInspectionCertificateIssueDate === undefined
              ? "-"
              : this.formatJapaneseDate(
                data?.vehicleInspectionCertificateIssueDate
              ), // Apply Japanese date formatting
          registerationNumber:
            data?.Registration_Number__c === undefined
              ? "-"
              : data?.Registration_Number__c,
          expirationDate:
            data?.Vehicle_Expiration_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate(data?.Vehicle_Expiration_Date__c),
          devileryDate:
            data?.Delivery_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate(data?.Delivery_Date__c),
          truckConnect:
            data?.Truck_Connect__c === 0 ? "" : data?.Truck_Connect__c,
          branchInfo:
            data?.Branch_Vehicle_Junctions__r?.length === 0
              ? []
              : data?.Branch_Vehicle_Junctions__r
        };
        console.log("object geting from vehicle by Id api: ", obj);
        this.vehicleByIdData = obj;
        this.currentChassisNumber =
          data?.Chassis_number__c === undefined ? "" : data?.Chassis_number__c;
        const vehicle = data;
        this.downloadvehicles = {
          Vehicle_Number__c: vehicle.Vehicle_Number__c || "",
          Registration_Number__c: vehicle.Registration_Number__c || "",
          Chassis_number__c: vehicle.Chassis_number__c || "",
          Delivery_Date__c: vehicle.Delivery_Date__c || "",
          Vehicle_Name__c: vehicle.Vehicle_Name__c || "",
          Vehicle_Type__c: vehicle.Vehicle_Type__c || "",
          Body_Shape__c: vehicle.Body_Shape__c || "",
          vehicleWeight__c: vehicle.vehicleWeight__c || "",
          First_Registration_Date__c: vehicle.First_Registration_Date__c || "",
          Vehicle_Expiration_Date__c: vehicle.Vehicle_Expiration_Date__c || "",
          Mileage__c: vehicle.Mileage__c || "",
          Fuel_Type__c: vehicle.Fuel_Type__c || "",
          Private_Business_use__c: vehicle.Private_Business_use__c || "",
          Use__c: vehicle.Use__c || "",
          fullModel__c: vehicle.fullModel__c || "",
          Door_Number__c: vehicle.Door_Number__c || "",
          Status__c: vehicle.Status__c || ""
        };
        this.statusofvehicle = data?.Status__c;
        if (this.wiredVehicleResult.data?.Status__c === "Deleted") {
          this.showvehDetailsDeleted = true;
          this.showvehDetails = false;
          this.SelectedStatus = this.StatusOptions[1].label;
          const matchedReason = this.reasonOptions.find(
            (option) => option.value === data?.Reason__c
          );
          this.selectedReason = matchedReason ? matchedReason.label : undefined;
          if (data?.Description__c) {
            this.vehicledeletedescriptionRecover = true;
            this.deletedescription = data?.Description__c;
          } else {
            this.vehicledeletedescriptionRecover = false;
            this.deletedescription = "";
          }
        } else {
          this.showvehDetails = true;
          this.showvehDetailsDeleted = false;
          if (this.vehicleByIdData.truckConnect == true) {
            this.loadTKData();
            console.log("Tk flag in If", this.vehicleByIdData.truckConnect);
          }
          //this.SelectedStatus = this.StatusOptions[0].label;
        }
        const status = data?.CCP2_Recall_Status__c;
        console.log("obisu", status);
        if (status === "Not Completed") {
          console.log("working status of dev");
          this.showRecallMessage = true;
        } else {
          console.log("working status of dev if");
          this.showRecallMessage = false;
        }
        this.loadbranches(this.vehicleByIdData.branchInfo);
        this.fetchVehicleCertificates();
      }
    } else if (error) {
      // handle error
      console.error("geting from vehicle by Id api: ", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_vehicleDetails",
        errorLog: err,
        methodName: "Main Class data"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
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
      if (this.Branches[1]) this.vehicleByIdData.branchReal2 = this.Branches[1].BranchName__c;
      if (this.Branches[2]) this.vehicleByIdData.branchReal3 = this.Branches[2].BranchName__c;
      // if (this.Branches[3]) this.vehicleByIdData.branchReal4 = this.Branches[3].BranchName__c;
      this.Branches.forEach((branch) => {
        // Check if branch.Branch_Code__c is present (not null or undefined)
        if (branch.Branch_Code__c) {
          const branchNumberStr = branch.Branch_Code__c.toString(); // Convert to string

          // Extract the first and last characters
          const firstDigit = branchNumberStr.charAt(0);
          const lastDigit = branchNumberStr.charAt(branchNumberStr.length - 1);

          // Check if both first and last digits are between 0 and 9
          if (
            firstDigit >= "0" &&
            firstDigit <= "9" &&
            lastDigit >= "0" &&
            lastDigit <= "9"
          ) {
            this.showone = true;
          } else {
            this.showone = false;
          }
        } else {
          // Handle case where Branch_Code__c is missing or not a valid number
          this.showone = false; // or any other logic you'd like
        }
      });
      this.vehicleByIdData.branch =
        this.abbreviateName(this.Branches[0].BranchName__c) || "-";
      if (this.Branches[1]) this.vehicleByIdData.branch2 =
        this.abbreviateName(this.Branches[1].BranchName__c) || "-";
      if (this.Branches[2]) this.vehicleByIdData.branch3 =
        this.abbreviateName(this.Branches[2].BranchName__c) || "-";
      // if (this.Branches[3]) this.vehicleByIdData.branch4 =
      //   this.abbreviateName(this.Branches[3].BranchName__c) || "-";

      this.vehicleByIdData.branchCount = this.Branches.length;
      this.vehicleByIdData.OnScreenBranchCount =
        this.vehicleByIdData.branchCount > 3 ? this.vehicleByIdData.branchCount - 3 : 0;
      this.Branches = data.map((branch) => ({
        ...branch,
        originalName: branch.BranchName__c,
        BranchName__c:
          branch.BranchName__c.length > 11
            ? this.abbreviateName2(branch.BranchName__c)
            : branch.BranchName__c,
        siebelAccountCode__c: branch.siebelAccountCode__c
      }));
      console.log(
        "Branch assigned to vehicleByIdData.branch: ",
        this.vehicleByIdData.branch
      );
      if (data.length > 0) {
        data.forEach((branch) => {
          this.downloadbranch.push(branch.Name);
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
        methodName: "branch error"
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
          methodName: "Images Data"
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
                ? this.abbreviateName3(elm.recallSubject__c)
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
            methodName: "Market MEasures data"
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
        ErrorLog({ lwcName: "ccp2_vehicleDetails", errorLog: error })
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
      }
      else if (urlParamsInstance === "maintenanceDetail") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showMaintainListFun2();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      }
      else if (urlParamsInstance === "maintenancelist") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showMaintainListFun();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      }
      else if (urlParamsInstance === "lease") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showLeaseInformationFun();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      }
      else if (urlParamsInstance === "truckonnect") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showTruckConnectFun();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      }
      else if (urlParamsInstance === "details") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showVehicleDetailFun();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      }
      else if (urlParamsInstance === "history") {
        let intervalId = setInterval(() => {
          console.log("interval stared");
          this.showMaintainListFun2();
          this.openMaintainenceHistory();
          if (this.vehicelInfoId) {
            console.log("interval completed");
            clearInterval(intervalId);
          }
        }, 1000);
      }
      else if (urlParamsInstance === "schedule") {
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
            console.log("Delete Detail User Locale: ", userLocale);
            console.log("Delete Detail User Labels: ", this.labels2);
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_vehicleDetails", errorLog: err })
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

  fetchVehicleCertificates() {
    getVehicleCertificates({ vehicleId: this.vehicleId })
      .then((data) => {
        const lengthOfTitle = data.titles ? data.titles[0].length : 0;
        if (lengthOfTitle > 15) {
          this.certificateTitleCount = data.titles
            ? data.titles[0].substring(0, 15) + "...など" + data.count + "枚"
            : "-";
        } else {
          this.certificateTitleCount = data.titles
            ? data.titles[0] + "など" + data.count + "枚"
            : "-";
        }
        this.vehicleByIdLoader = false;
      })
      .catch((error) => {
        this.certificateTitleCount = "-";
        console.error("Fetching from vehicle Certificate API: ", error);
        this.vehicleByIdLoader = false;
        let err = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_vehicleDetails", errorLog: err })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  dothis() {
    console.log("dothis function called");
  }

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
    this.closemileageedit();
    this.loadTKData();
    this.showVehicleDetails = false;
    this.showMaintainList = false;
    this.showCostManagement = false;
    this.showMarketMeasure = false;
    this.showLeaseInformation = false;
    this.showTruckConnectList = true;
    this.isAllSelected = true;
    this.isVehicleSelected = false;
    this.maintainlistactive = false;
    this.LeaseInfoActive = false;
    this.classVehicleDetails = "underline-button";
    this.classCostManagement = "underline";
    this.classMaintainList = "underline-button";
    this.ClassLeaseInformation = "underline-button";
    this.classTruckConnectMain = "underline-button-black";
  }

  showMaintainListFun() {
    let newUrl = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=maintenancelist`;
    window.history.replaceState({}, document.title, newUrl);
    const maintainhistoryquery = this.template.querySelector('c-ccp2-_-maintenance-history');
    if (maintainhistoryquery) {
      maintainhistoryquery.returnToList();
    }
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

  handlebackhere() {
    console.log("calledbydev");
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
    console.log("inside handle click");
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

    console.log(JSON.stringify(this.recallCatFilter));
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
    console.log("recallArray category", JSON.stringify(recallArray));
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
      console.log(`${key}: ${value}`);
    }

    if (recallArray.length === 0) {
      this.implementationStatusFilerListForQuery = ["Nothing to show"];
    } else this.implementationStatusFilerListForQuery = [...recallArray];

    this.updateFinalQuery();
    console.log("recallArray implementation", JSON.stringify(recallArray));
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
    console.log("notification sort", this.notificationSortForQuery);
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
    console.log("implementation sort", this.renovationSortForQuery);
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
      console.log("THIS is the current page in handle next", this.currentPage);
      this.isPreviousDisabled2 = this.currentPage === 1;
      this.isNextDisabled2 = this.currentPage === this.totalPageCount2;
      this.offsetOnMarketMeasure();
      this.updatePageButtons();
    }
  }

  pageCountClick2(event) {
    console.log(event.target.dataset.page);
    this.currentPage = Number(event.target.dataset.page);
    this.offsetOnMarketMeasure();
    this.updatePageButtons();
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

  //downlaod feature
  openDownloadModalfunction() {
    this.DownloadNameValue = `${this.currentDate} - カスタマーポータル車両リスト.csv`;
    this.openDownloadModal = true;
    console.log("forprintdata", JSON.stringify(this.downloadvehicles));
    console.log("forprintdata2", JSON.stringify(this.downloadbranch));
  }
  closeDownloadModal() {
    this.DownloadNameValue = `${this.currentDate} - カスタマーポータル車両リスト.csv`;
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
    this.DownloadNameValue = `${this.currentDate} - カスタマーポータル車両リスト.csv`;
    this.ShowSuccessDownload = false;
  }
  downloadCSVAll() {
    // if (this.allVehiclesData.length === 0) {
    //   console.error("No data available to download");
    //   return;
    // }
    console.log("eorkdev", this.allVehiclesData);
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
      // "ドアナンバー",
      "所属",
      "削除済み車両"
    ];
    console.log("statusdev");
    const allBranches = branchesD.join("・");

    let csvContent = headers.join(",") + "\n";

    const csvRow = [
      vehiclesD.Vehicle_Number__c,
      vehiclesD.Registration_Number__c,
      vehiclesD.Chassis_number__c,
      vehiclesD.Delivery_Date__c,
      vehiclesD.Vehicle_Name__c,
      vehiclesD.Vehicle_Type__c,
      vehiclesD.Body_Shape__c,
      vehiclesD.vehicleWeight__c,
      vehiclesD.First_Registration_Date__c,
      vehiclesD.Vehicle_Expiration_Date__c,
      vehiclesD.Mileage__c,
      vehiclesD.Fuel_Type__c,
      vehiclesD.Private_Business_use__c,
      vehiclesD.Use__c,
      vehiclesD.fullModel__c,
      // vehiclesD.Door_Number__c,
      allBranches,
      vehiclesD.Status__c === "CurrentlyOwned" ? " " : "削除済み" || ""
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
      console.log("already on window");
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
    console.log("callednormal");
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
      console.log("oep");
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
    console.log(
      "the values",
      this.deletedescription,
      this.selectedReason,
      this.SelectedStatus
    );
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
        console.log(result);
        this.cancelmodaldeletevehicle = false;
        this.openDeleteModal = false;
        this.showVehicleDetailFun();
        this.showFinishTimeModalDelete();
      })
      .catch((error) => {
        console.error("Error:", error);
        this.showErrorMessage("An error occurred during deletion.");
        let err = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_vehicleDetails", errorLog: err, methodName: "deleteandrecovervehicle" })
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
        console.log(result);
        this.cancelmodalrecovervehicle = false;
        this.ShowSuccessRecover = true;
        this.showFinishTimeModalRecover();
      })
      .catch((error) => {
        this.cancelmodalrecovervehicle = false;
        console.error("Error:", error);
        this.showErrorMessage("An error occurred during deletion.");
        let err = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_VehicleDetails", errorLog: err, methodName: "deleteandrecovervehicle" })
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
    setTimeout(() => {
      this.selectedReason = "";
      this.deletedescription = "";
      this.SelectedStatus = "";
      this.noreasonisselected = true;
      refreshApex(this.wiredVehicleResult);
      console.log("changes", JSON.stringify(this.wiredVehicleResult));
      console.log("a", this.selectedReason);
      this.vehicledeletedescription = false;
      this.vehgoesdeletion = false;
      this.openRecoversystem = false;
      this.opendeletesystem = false;
      // this.ShowSuccessRecover = false;
    }, 2000);
  }

  //lease
  @track isAllSelected = true;
  @track isVehicleSelected = false;
  @track leaseisempty = false;
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
  loadleasedata() {
    leaseInformation({ vehicleId: this.vehicleId })
      .then((result) => {
        console.log("result", result);
        if (result.length === 0) {
          console.log("result", result);
          this.leaseisempty = true;
          this.leaseloader = false;
        } else {
          this.leaseisempty = false;
          if (
            !result[0].contractNumber_nv__c &&
            !result[0].contractorName__c &&
            !result[0].datefronInitialRegistrationDate__c &&
            !result[0].expirationDate__c &&
            !result[0].monthlyLeaseWithoutTax__c &&
            !result[0].voluntaryInsuranceIncluded__c
          ) {
            this.leaseisempty = true;
            this.leaseloader = false;
          } else {
            this.leaseisempty = false;
          }
          this.leasedata = {
            ContractNumber: result[0].contractNumber_nv__c || "-",
            ContractName: result[0].contractorName__c || "-",
            ContractExpirationdate: result[0].expirationDate__c
              ? this.formatJapaneseDate(result[0].expirationDate__c)
              : "-",
            ContractYears: result[0].datefronInitialRegistrationDate__c
              ? result[0].datefronInitialRegistrationDate__c + "年"
              : "-",
            MonthlyLeaseFee: this.formatCurrency(
              result[0].monthlyLeaseWithoutTax__c
            ),
            VoluntaryInsurance: result[0].voluntaryInsuranceIncluded__c
              ? "あり"
              : "なし" || "-"
          };
          console.log("Lease data:", JSON.stringify(this.leasedata));
          this.leaseloader = false;
        }
      })
      .catch((error) => {
        console.error("Error fetching lease data:", error);
        let err = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_VehicleDetails", errorLog: err, methodName: "loadleasedata" })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });

    // MaintainenceLeaseInfo({ vehicleId: this.vehicleId })
    //     .then(result => {
    //       if (!result[0].contractNumber__c && !result[0].maintenanceContractMenu__c &&
    //         !result[0].contractStart__c && !result[0].contractEnd__c) {
    //         this.maintainleaseisempty = true;
    //         this.leaseloader = false;
    //       } else {
    //         this.maintainleaseisempty = false;
    //       }
    //         this.maintainenceleasedata = {
    //           MaintainContractNumber: result[0].contractNumber__c || '-',
    //           Contractmenu: result[0].maintenanceContractMenu__c || '-',
    //           ContractStartdate: result[0].contractStart__c ? this.formatJapaneseDate(result[0].contractStart__c.substring(0, 10)) : '-',
    //           ContractExpirationdate: result[0].contractEnd__c ? this.formatJapaneseDate(result[0].contractEnd__c.substring(0, 10)) : '-'
    //         };
    //         console.log('Maintenance lease data:', JSON.stringify(this.maintainenceleasedata));
    //         this.leaseloader = false;
    //     })
    //     .catch(error => {
    //         console.error('Error fetching maintenance lease data:', error);
    //     });
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

    console.log("calling refresh method from parent comp2!!!");
    sessionStorage.removeItem("ongoingTransaction");
    this.openvehicleMaintainencehistory = false;
    this.showvehDetails = true;
    this.showMaintainListFun();
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    setTimeout(() => {
      console.log("calling refresh method from parent comp3!!!");
      const childComponent = this.template.querySelector(
        "c-ccp2-_-maintenance-history"
      );
      if (childComponent) {
        console.log("calling refresh method from parent comp!!!");
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
    console.log("this.nullMileage", this.nullMileage);
    console.log(
      "this.vehicleByIdData.Newmileage",
      this.vehicleByIdData.Newmileage
    );
    return this.nullMileage || this.vehicleByIdData.Newmileage === ""
      ? true
      : false;
  }

  openmileageedit() {
    this.vehicleByIdData.Newmileage = this.formatNumberWithCommas(
      this.vehicleByIdData.Newmileage
    );
    this.editmileage = true;
  }
  closemileageedit() {
    console.log(
      "this.vehicleByIdData.Newmileage",
      this.vehicleByIdData.Newmileage
    );
    this.vehicleByIdData.Newmileage = this.vehicleByIdData.mileage.replace(
      /,/g,
      ""
    );
    console.log(
      "this.vehicleByIdData.mileage",
      this.vehicleByIdData.mileage.replace(/,/g, "")
    );
    this.editmileage = false;
    this.nullMileage = false;
    this.nextBtnCss = "next-btn1";
  }
  openBranchedit() {
    this.editbranches = true;

    this.temBranchoptions = this.branchOptions;
    console.log("tem branches on open", this.temBranchoptions);
  }

  closeBranchedit() {
    // refreshApex(this.originalbranchoptions);
    console.log("before bo", this.branchOptions);

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
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    }, 1400);
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
        ErrorLog({ lwcName: "ccp2_VehicleDetails", errorLog: err, methodName: "updateeditinformation" })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  //tk
  loadTKData() {
    //console.log(this.vehicleId);
    truckconnectDetails({ vehicleId: this.vehicleId })
      .then((data) => {
        if (data) {
          // const startDate = data[0].subscriptionStartTime__c
          //   ? new Date(data[0].subscriptionStartTime__c)
          //   : null;
          const today = new Date();
          const endDate = data[0].subscriptionEndTime__c
            ? new Date(data[0].subscriptionEndTime__c)
            : null;
          console.log("endateo", endDate);
          console.log("TK Data:", data);
          this.truckConnectData = {
            Contractstartdate: data[0].subscriptionStartTime__c
              ? this.formatJapaneseDate(data[0].subscriptionStartTime__c)
              : "-",
            ContractEnddate: data[0].subscriptionEndTime__c
              ? this.formatJapaneseDate(data[0].subscriptionEndTime__c)
              : "-",
            Contractdetails: data[0].packageNameJp__c
              ? data[0].packageNameJp__c
              : "-",
            AutomaticUpdates: data[0].isAutoRenewal__c ? "あり" : "なし" || "-"
          };
          // if (startDate && endDate) {
          //   const timeDiff = endDate - startDate;
          //   const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
          //   this.showTKwarnMessage = dayDiff < 30;
          //   console.log("flag", this.showTKwarnMessage);
          // } else {
          //   this.showTKwarnMessage = false;
          // }
          if (endDate) {
            const currentDate = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
            const lastDate = new Date(
              endDate.getFullYear(),
              endDate.getMonth(),
              endDate.getDate()
            );
            console.log("current", currentDate);
            console.log("last", lastDate);

            const oneMonthBeforeEndDate = new Date(lastDate);
            oneMonthBeforeEndDate.setMonth(lastDate.getMonth() - 1);
            //console.log("onebefore",oneMonthBeforeEndDate);
            console.log("onebeforeend", oneMonthBeforeEndDate);

            this.showTKwarnMessage =
              currentDate >= oneMonthBeforeEndDate && currentDate <= lastDate;
            console.log("flag", this.showTKwarnMessage);
          } else {
            this.showTKwarnMessage = false;
          }
        } else {
          console.warn("No data found for the provided vehicle ID");
        }
      })
      .catch((error) => {
        console.error("Error fetching Truck Connect Details:", error);
        let err = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_VehicleDetails", errorLog: err, methodName: "loadTKData" })
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
}
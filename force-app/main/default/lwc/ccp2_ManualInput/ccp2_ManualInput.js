// KT
// Array:-
// vehicleInfo: array of chassis number
// Formdata: object shown on frontend for current page
// vehicleList: array of all formdatas according to inputs
// bigData: array of all formdatasa as of vehicleList but mergeoned which is going to class
// currentVehicles: coming from backend for certain Vehicle_StaticResource

// Variable:-
// currentPage: index of current page
// totalpages: total number of chassis number or records

// Methods:-
// currentVehicle: fun to return the backend vehicle data for current page
import { LightningElement, track, wire, api } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getfields from "@salesforce/apex/CCP2_VehicleManagment.vehicleNotRegistered";
import registervehicle from "@salesforce/apex/CCP2_VehicleManagment.insertRegisteredVehicles";
import getAllDataForRegisteredVechicleByChessisNumber from "@salesforce/apex/CCP2_VehicleManagment.vehicleinput"; //chassisNumber
import getImagesFromApiViaChessisNumber from "@salesforce/apex/VehicleImageService.getImagesAsBase64"; //chassisNumber
import branchList from "@salesforce/apex/CCP2_VehicleManagment.branchList";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import BODY_SHAPE_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Body_Shape__c";
import CAR_NAME_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Name__c";
import VEHICLE_TYPE_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Type__c";
import USE_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Use__c";
import FUEL_TYPE_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Fuel_Type__c";
import PRIVATE_BUSINESS_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Private_Business_use__c";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.png";
const DASH = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/dash.png";
const UPLPIC =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/upload-manual.png";
const TRUCKPIC =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/truck-man-input.png";
const arrowicon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";

export default class Ccp2backgroundTemplate extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  backgroundImageStyle = `background-image: url(${BACKGROUND_IMAGE_PC});`;
  dashpic = DASH;
  uplpic = UPLPIC;
  truckpic = TRUCKPIC;
  _resourcesLoaded = false;
  @track finalCompletionButtonCss = "searchbutton btn buttontxt2";
  @track uploadText1 = "アップロード";
  @track uploadText2 = "アップロード";
  @track uploadDivCss1 = "input-field-img no-scrollbar";
  @track uploadDivCss2 = "input-field-img no-scrollbar";
  @track formBodyCss = "form-body";
  @track uploadIconToggle1 = true;
  @track uploadIconToggle2 = true;
  @track addVehiclePage = true;
  @track Step1 = true;
  @track fileUpload = true;
  @track showconfModal = false;
  @track showUploadModal = false;
  @track showUploadCModal = false;
  @track showfinalModal = false;
  @track showPlaceholder = true;
  @track showlist = false;
  @track selectedVehicleId = "";
  @track currentChessisNumber = "";
  @track deletedBranchIds = [];
  @track showlistCarName = false;
  @track showlistfuelType = false;
  @track showlisttypeOfVehicle = false;
  @track showlistbodyShape = false;
  @track showlistprivateOrBusinessUse = false;
  @track showlistuse = false;

  @track selectedPicklistCarName = "";
  @track selectedPicklisttypeOfVehicle = "";
  @track selectedPicklistuse = "";
  @track selectedPicklistprivateOrBusinessUse = "";
  @track selectedPicklistbodyShape = "";
  @track selectedPicklistfuelType = "";
  outsideClickHandlerAdded = false;

  @track disbsave = true;
  @track hasVehicles = true;
  @track isOpen = false;
  @track selectedOption = {};
  @track showRegisteredVehicles = false;
  @api vehicleInfo = [];
  @track totalPages = 50;
  @track currentPage = 1;
  @track lastPageNumberTillSavedToBackend = 1;
  @track vehicleList = []; // Array to store formdata for each page
  @track LastPageFormData;
  @track tempFormData;
  @track formdata = this.initializeFormData();
  @track updatedformdata = this.initializeFormDataBig();
  @track bigdata = [];
  @track currentVehicles = [];
  @track uploadimagedata = [];
  @track uploadcertificatedata = [];
  @track inputs = [
    {
      id: 1,
      part1: "",
      part2: ""
    }
  ]; // Array to store input data
  imgdrop = arrowicon;

  @track firstUploadedImageName = "";
  @track firstUplaodedCertificateName = "";
  @track countOfUploadedImage = 0;
  @track countOfUplaodedCertificate = 0;

  @track presentChassisNumbers = [];
  @track missingChassisNumbers = [];
  @track commonChassisNumbers = [];
  @track branches = [];
  @track imageDataToSendBack = null;
  @track certificateDataToSendBack = null;

  placeholder = "Select an option";

  bodyShapeOptions = [];
  privateOrBusinessOptions = [];
  @track selectedbranches = [];
  carNameOptions = [];
  vehicleTypeOptions = [];
  useOptions = [];
  fuelTypeOptions = [];
  @track formLoader = false;

  @track imageIdsForClass = [];
  @track certificateIdsForClass = [];
  @track showexitModal = false;
  @track dateofIss = "";
  @track dateofReg = "";
  @track expData = "";

  @track dateOfExpiration = "";

  tempImageDataToSend;
  tempCertificateDataToSend;
  tempFirstImageName;
  tempFirstCertificateName;
  tempCertificateCount;
  tempImageCount;
  tempUploadDivCss1;
  tempUploadText1;
  tempUploadUploadIconToggle1;
  tempUploadDivCss2;
  tempUploadText2;
  tempUploadUploadIconToggle2;

  errorMileage = "";
  errorMileageCss = "hide-error";
  errorModel = "";
  errorModelCss = "hide-error";
  errorCurb = "";
  errorCurbCss = "hide-error";
  errorDoor = "";
  errorDoorCss = "hide-error";
  errorLogin = "";
  errorLoginCss = "hide-error";
  errorlogin1div = "input-field1";
  errorlogin2div = "input-field2";
  errorlogin3div = "input-field3";
  errorlogin4div = "input-field4";
  errorModelDiv = "input-field-modal";
  errorMileageDiv = "input-field-mil";
  errorCurbDiv = "input-field-mil";
  errorDoorDiv = "input-field";

  connectedCallback() {
    this.updatePagination();
    this.template.host.style.setProperty(
      "--upload-icon",
      `url(${this.uplpic})`
    );
    requestAnimationFrame(() => {
      this.addCustomStyles();
    });

    if (this.isLastPage) {
      this.finalCompletionButtonCss = "searchbutton btn buttontxt2 red";
    } else {
      this.finalCompletionButtonCss = "searchbutton btn buttontxt2";
    }

    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.imgdrop})`
    );
    requestAnimationFrame(() => {
      this.addCustomStyles();
    });

    this.updateFormData();
  }

  renderedCallback() {
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      document.addEventListener("click", this.handleOutsideClick3.bind(this));
      document.addEventListener("click", this.handleOutsideClick4.bind(this));
      document.addEventListener("click", this.handleOutsideClick5.bind(this));
      document.addEventListener("click", this.handleOutsideClick6.bind(this));
      document.addEventListener("click", this.handleOutsideClick7.bind(this));
      document.addEventListener("click", this.handleOutsideClick8.bind(this));
      this.outsideClickHandlerAdded = true;
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick2.bind(this));
    document.removeEventListener("click", this.handleOutsideClick3.bind(this));
    document.removeEventListener("click", this.handleOutsideClick4.bind(this));
    document.removeEventListener("click", this.handleOutsideClick5.bind(this));
    document.removeEventListener("click", this.handleOutsideClick6.bind(this));
    document.removeEventListener("click", this.handleOutsideClick7.bind(this));
    document.removeEventListener("click", this.handleOutsideClick8.bind(this));
  }

  /*All api call methods*/
  @wire(getfields, { chassisNumbers: "$vehicleInfo" })
  fun({ data, error }) {
    if (data) {
      this.currentVehicles = data.VehicleInfo;
      this.updateFormData(); // Update form data when data is received
    } else if (error) {
      console.error("getfields from vehicleinfo", error);
    }
  }

  @wire(branchList)
  branchs({ data, error }) {
    if (data) {
      this.branches = data.map((branches) => {
        return { label: branches.Name, value: branches.Id };
      });
      this.updateFormData();
    } else if (error) {
      console.error("error", error);
    }
  }

  getAllDataForRegisteredVechicleByChessisNumber() {
    getAllDataForRegisteredVechicleByChessisNumber({
      carPlatformNumber: this.currentChessisNumber
    })
      .then((result) => {
        this.formLoader = true;
        this.LastPageFormData = this.formdata;
        let registrationNumber =
          result[0]?.vehicle?.Registration_Number__c || "";
        let loginNum = registrationNumber.split("-");
        let loginNumberPart1 = loginNum[0];
        let loginNumberPart2 = loginNum[1];
        let loginNumberPart3 = loginNum[2];
        let loginNumberPart4 = loginNum[3];

        let fullModel = result[0]?.vehicle?.fullModel__c || "";
        let modelNum = fullModel.split("-");
        let model1 = modelNum[0];
        let model2 = modelNum[1];

        let chassisNumber = result[0]?.vehicle?.Chassis_number__c || "";
        let chassisNum = chassisNumber.split("-");
        let chassisNumberPart1 = chassisNum[0];
        let chassisNumberPart2 = chassisNum[1];

        this.formdata.carPlatformNoPart2 = chassisNumberPart2 || "";
        this.formdata.carPlatformNoPart1 = chassisNumberPart1 || "";
        this.formdata.model1 = model1 || "";
        this.formdata.model2 = model2 || "";
        this.formdata.loginNumberPart1 = loginNumberPart1 || "";
        this.formdata.loginNumberPart2 = loginNumberPart2 || "";
        this.formdata.loginNumberPart3 = loginNumberPart3 || "";
        this.formdata.loginNumberPart4 = loginNumberPart4 || "";
        this.formdata.vehicleNumber =
          result[0]?.vehicle?.Vehicle_Number__c || "";
        this.formdata.doorNumber = result[0]?.vehicle?.Door_Number__c || "";
        this.formdata.typeOfVehicle = result[0]?.vehicle?.Vehicle_Type__c || "";
        this.formdata.mileage = result[0]?.vehicle?.Mileage__c || "";
        this.formdata.use = result[0]?.vehicle?.Use__c || "";
        this.formdata.privateOrBusinessUse =
          result[0]?.vehicle?.Private_Business_use__c || "";
        this.formdata.curbWeight = result[0]?.vehicle?.vehicleWeight__c || "";
        this.formdata.expirationDate =
          result[0]?.vehicle?.Vehicle_Expiration_Date__c || "";
        this.formdata.initialRegistrationDate =
          result[0]?.vehicle?.First_Registration_Date__c || "";
        this.formdata.carName = result[0]?.vehicle?.Vehicle_Name__c || "";
        this.formdata.dateOfIssuance =
          result[0]?.vehicle?.Delivery_Date__c || "";
        this.formdata.bodyShape = result[0]?.vehicle?.Body_Shape__c || "";
        this.formdata.fuelType = result[0]?.vehicle?.Fuel_Type__c || "";
        this.formdata.affiliation = result[0]?.branches?.map((elm) => ({
          label: elm.Name,
          value: elm.Id
        }));

        this.selectedPicklistCarName = this.formdata.carName;
        this.selectedPicklistbodyShape = this.formdata.bodyShape;
        this.selectedPicklistfuelType = this.formdata.fuelType;
        this.selectedPicklistprivateOrBusinessUse =
          this.formdata.privateOrBusinessUse;
        this.selectedPicklisttypeOfVehicle = this.formdata.typeOfVehicle;
        this.selectedPicklistuse = this.formdata.use;

        this.selectedbranches = this.formdata.affiliation;
        this.formLoader = false;
      })
      .catch((err) => {
        console.error("getAllDataForRegisteredVechicleByChessisNumber", err);
        this.showToasts("エラー", "もう一度試してください", "error");
        window.scrollTo(0, 0);
      });
  }

  getImagesFromApiViaChessisNumber() {
    getImagesFromApiViaChessisNumber({
      chassisNumber: this.currentChessisNumber
    })
      .then((result) => {
        result = JSON.parse(result);
        this.imageDataToSendBack = result.Images;
        this.certificateDataToSendBack = result.Certificates;

        if (result.Certificates.length != 0) {
          this.firstUplaodedCertificateName =
            this.certificateDataToSendBack[0].fileName;

          this.countOfUplaodedCertificate =
            this.certificateDataToSendBack.length;

          if (this.countOfUplaodedCertificate == 1) {
            this.uploadDivCss1 = "input-field-img left-align no-scrollbar";
            this.uploadText1 = this.firstUplaodedCertificateName;
            this.uploadIconToggle1 = false;
          } else if (this.countOfUplaodedCertificate >= 2) {
            this.uploadDivCss1 = "input-field-img left-align no-scrollbar";
            this.uploadText1 =
              this.firstUplaodedCertificateName +
              "など" +
              this.countOfUplaodedCertificate +
              "枚";
            this.uploadIconToggle1 = false;
          } else {
            this.uploadDivCss1 = "input-field-img no-scrollbar";
            this.uploadText1 = "アップロード";
            this.uploadIconToggle1 = true;
          }
        } else {
          this.firstUplaodedCertificateName = "";
          this.countOfUplaodedCertificate = 0;
          this.uploadDivCss1 = "input-field-img no-scrollbar";
          this.uploadText1 = "アップロード";
          this.uploadIconToggle1 = true;
        }

        if (result.Images.length != 0) {
          this.firstUploadedImageName = this.imageDataToSendBack[0].fileName;
          this.countOfUploadedImage = this.imageDataToSendBack.length;

          if (this.countOfUploadedImage == 1) {
            this.uploadDivCss2 = "input-field-img left-align no-scrollbar";
            this.uploadText2 = this.firstUploadedImageName;
            this.uploadIconToggle2 = false;
          } else if (this.countOfUploadedImage >= 2) {
            this.uploadDivCss2 = "input-field-img left-align no-scrollbar";
            this.uploadText2 =
              this.firstUploadedImageName +
              "など" +
              this.countOfUploadedImage +
              "枚";
            this.uploadIconToggle2 = false;
          } else {
            this.uploadDivCss2 = "input-field-img no-scrollbar";
            this.uploadText2 = "アップロード";
            this.uploadIconToggle2 = true;
          }
        } else {
          this.firstUploadedImageName = "";
          this.countOfUploadedImage = 0;
          this.uploadDivCss2 = "input-field-img no-scrollbar";
          this.uploadText2 = "アップロード";
          this.uploadIconToggle2 = true;
        }

        this.formLoader = false;
      })
      .catch((err) => {
        console.error("getImagesFromApiViaChessisNumber4", err);
        this.showToasts("エラー", "もう一度試してください", "error");
        window.scrollTo(0, 0);
      });
  }
  /*All api call methods*/

  /*Picklist values fetched*/
  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: BODY_SHAPE_FIELD
  })
  wiredBodyPicklistValues({ error, data }) {
    if (data) {
      this.bodyShapeOptions = data.values.map((item) => ({
        label: item.label,
        value: item.value
      }));
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: PRIVATE_BUSINESS_FIELD
  })
  wiredPrivatePicklistValues({ error, data }) {
    if (data) {
      console.log("this.privateOrBusinessOptions", data);
      this.privateOrBusinessOptions = data.values.map((item) => ({
        label: item.label,
        value: item.value
      }));
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: CAR_NAME_FIELD
  })
  wiredCarPicklistValues({ error, data }) {
    if (data) {
      this.carNameOptions = data.values.map((item) => ({
        label: item.label,
        value: item.value
      }));
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: VEHICLE_TYPE_FIELD
  })
  wiredTypePicklistValues({ error, data }) {
    if (data) {
      this.vehicleTypeOptions = data.values.map((item) => ({
        label: item.label,
        value: item.value
      }));
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: USE_FIELD
  })
  wiredUsePicklistValues({ error, data }) {
    if (data) {
      this.useOptions = data.values.map((item) => ({
        label: item.label,
        value: item.value
      }));
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: FUEL_TYPE_FIELD
  })
  wiredFuelTypePicklistValues({ error, data }) {
    if (data) {
      console.log("Fuel Type Values: ", data.values);
      this.fuelTypeOptions = data.values.map((item) => ({
        label: item.label,
        value: item.value
      }));
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }
  /*Picklist values fetched*/

  /*Branch methods*/
  handlevehChange(event) {
    event.stopPropagation();
    this.showlist = !this.showlist;
    if (this.vehicles.length === 0) {
      this.showlist = false;
    }
  }

  handleBranchSelect(event) {
    this.selectedVehicleId = event.currentTarget.dataset.id;
    this.handleBranchChange();
  }

  showexit() {
    this.commonChassisNumbers = this.vehicleInfo.slice(
      0,
      this.lastPageNumberTillSavedToBackend - 1
    );
    this.missingChassisNumbers = this.vehicleInfo.slice(
      this.lastPageNumberTillSavedToBackend - 1,
      this.totalPages
    );
    this.showexitModal = true;
  }

  Closeexit() {
    this.showexitModal = false;
  }

  handleBranchChange() {
    let selectedVehicle = "";
    for (let i = 0; i < this.branches.length; i++) {
      if (this.branches[i].value === this.selectedVehicleId) {
        selectedVehicle = this.branches[i];
        this.branches = this.branches.filter(
          (veh) => veh.value !== this.selectedVehicleId
        );
        break;
      }
    }
    if (selectedVehicle) {
      this.selectedbranches.push({
        value: selectedVehicle.value,
        label: selectedVehicle.label
      });

      let selectedbranchesIds = this.selectedbranches.map((elm) => elm.value);
      this.formdata.affiliation = selectedbranchesIds;
      console.log("selectedbranchesIds", JSON.stringify(selectedbranchesIds));
      console.log("formdata", JSON.stringify(this.formdata));
    }
    this.selectedVehicleId = null;
    if (this.branches.length === 0) {
      this.showlist = false;
    }
  }

  get hasVehicles2() {
    return this.selectedbranches.length > 0;
  }

  handleDeleteBranch(event) {
    const branchId = event.currentTarget.dataset.id;
    console.log("ok");

    // Find the deleted branch from branch array
    const deletedBranchFromBranchArray = this.selectedbranches.find(
      (branch) => branch.value === branchId
    );
    console.log("ok2");
    if (deletedBranchFromBranchArray) {
      this.branches = [
        ...this.branches,
        {
          label: deletedBranchFromBranchArray.label,
          value: deletedBranchFromBranchArray.value
        }
      ];
      console.log("ok3");
    }

    // Push the deleted branch ID to deletedBranchIds array
    this.deletedBranchIds.push(branchId);
    console.log("ok4");
    // console.log("newe2",JSON.stringify(this.deletedBranchIds));

    // Remove the branch from branch array
    this.selectedbranches = this.selectedbranches.filter(
      (branch) => branch.value !== branchId
    );

    let selectedbranchesIds = this.selectedbranches.map((elm) => elm.value);
    this.formdata.affiliation = selectedbranchesIds;
    console.log("selectedbranchesIds", JSON.stringify(selectedbranchesIds));
    console.log("formdata", JSON.stringify(this.formdata));
    console.log("ok5");

    // console.log("newe2",JSON.stringify(this.branch));

    // Add the deleted branch back to another array if needed

    // Clear the selected branch ID
    branchId = "";
  }
  /*Branch methods*/

  /*Picklist Methods*/
  handleCarNameChange(event) {
    event.stopPropagation();
    this.showlist = false;
    this.showlistfuelType = false;
    this.showlisttypeOfVehicle = false;
    this.showlistbodyShape = false;
    this.showlistprivateOrBusinessUse = false;
    this.showlistuse = false;
    this.showlistCarName = !this.showlistCarName;
  }
  handlefuelTypeChange(event) {
    event.stopPropagation();
    this.showlist = false;
    this.showlistCarName = false;
    this.showlisttypeOfVehicle = false;
    this.showlistbodyShape = false;
    this.showlistprivateOrBusinessUse = false;
    this.showlistuse = false;
    this.showlistfuelType = !this.showlistfuelType;
  }
  handletypeOfVehicleChange(event) {
    event.stopPropagation();
    this.showlist = false;
    this.showlistCarName = false;
    this.showlistfuelType = false;
    this.showlistbodyShape = false;
    this.showlistprivateOrBusinessUse = false;
    this.showlistuse = false;
    this.showlisttypeOfVehicle = !this.showlisttypeOfVehicle;
  }
  handleuseChange(event) {
    event.stopPropagation();
    this.showlist = false;
    this.showlistCarName = false;
    this.showlistfuelType = false;
    this.showlisttypeOfVehicle = false;
    this.showlistbodyShape = false;
    this.showlistprivateOrBusinessUse = false;
    this.showlistuse = !this.showlistuse;
  }
  handleprivateOrBusinessUseChange(event) {
    event.stopPropagation();
    this.showlist = false;
    this.showlistCarName = false;
    this.showlistfuelType = false;
    this.showlisttypeOfVehicle = false;
    this.showlistbodyShape = false;
    this.showlistuse = false;
    this.showlistprivateOrBusinessUse = !this.showlistprivateOrBusinessUse;
  }
  handlebodyShapeChange(event) {
    event.stopPropagation();
    this.showlist = false;
    this.showlistCarName = false;
    this.showlistfuelType = false;
    this.showlisttypeOfVehicle = false;
    this.showlistprivateOrBusinessUse = false;
    this.showlistuse = false;
    this.showlistbodyShape = !this.showlistbodyShape;
  }
  handleOutsideClick2 = (event) => {
    const dataDropElement = this.template.querySelector(".Inputs12");
    const listsElement = this.template.querySelector(".lists");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlist = false;
    }
  };

  handleOutsideClick3 = (event) => {
    const dataDropElement = this.template.querySelector(".InputsCarName");
    console.log("3eew", dataDropElement);
    const listsElement = this.template.querySelector(".listCarName");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlistCarName = false;
    }
  };

  handleOutsideClick4 = (event) => {
    const dataDropElement = this.template.querySelector(".dropdownfuel");
    console.log("3eew1", dataDropElement);
    const listsElement = this.template.querySelector(".listfueltype");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlistfuelType = false;
    }
  };

  handleOutsideClick5 = (event) => {
    const dataDropElement = this.template.querySelector(".Inputstypeofvehicle");
    console.log("3eewsjw", dataDropElement);
    if (
      (dataDropElement && !dataDropElement.contains(event.target)) ||
      (listsElement && !listsElement.contains(event.target))
    ) {
      this.showlisttypeOfVehicle = false;
    }
  };

  handleOutsideClick6 = (event) => {
    const dataDropElement = this.template.querySelector(".Inputsbodyshape");
    console.log("3eewslksl2", dataDropElement);
    const listsElement = this.template.querySelector(".listbodyshape");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlistbodyShape = false;
    }
  };

  handleOutsideClick7 = (event) => {
    const dataDropElement = this.template.querySelector(
      ".Inputsprivateorbussiness"
    );
    console.log("3eewkjsjkd2", dataDropElement);
    const listsElement = this.template.querySelector(
      ".listprivateOrBusinessUse"
    );

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlistprivateOrBusinessUse = false;
      console.log("working on console");
    }
  };

  handleOutsideClick8 = (event) => {
    const dataDropElement = this.template.querySelector(".Inputsuse");
    console.log("dsjdk3ew", dataDropElement);
    const listsElement = this.template.querySelector(".listuse");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlistuse = false;
    }
  };

  closeAllLists = () => {
    this.showlist = false;
    this.showlistCarName = false;
    this.showlistfuelType = false;
    this.showlisttypeOfVehicle = false;
    this.showlistbodyShape = false;
    this.showlistprivateOrBusinessUse = false;
    this.showlistuse = false;
  };

  handleInsideClick(event) {
    event.stopPropagation();
  }
  /*Picklist Methods*/

  /*html css methods*/
  get dropdownClass() {
    return this.isOpen ? "slds-dropdown slds-dropdown_fluid" : "slds-hide";
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option) {
    this.selectedOption = option;
    this.isOpen = false;
  }

  getOptionClass(option) {
    return option.value === this.selectedOption.value ? "slds-is-selected" : "";
  }
  /*html css methods*/

  /*FormData methods methods*/
  initializeFormData() {
    return {
      images: [],
      certimages: [],
      vehicleNumber: "",
      carPlatformNoPart1: "",
      carPlatformNoPart2: "",
      loginNumberPart1: "",
      loginNumberPart2: "",
      loginNumberPart3: "",
      loginNumberPart4: "",
      model1: "",
      model2: "",
      dateOfIssuance: "",
      privateOrBusinessUse: "", // Default to private
      initialRegistrationDate: "",
      //   carBodyShape: "",
      expirationDate: "",
      affiliation: ["a1VIo0000000A16MAE"],
      fuelType: "",
      use: "",
      carName: "",
      mileage: "",
      curbWeight: "",
      typeOfVehicle: "",
      doorNumber: ""
      //   worklocation: ""
    };
  }

  get isLastPage() {
    return this.currentPage === this.totalPages;
  }

  get isFirstPage() {
    return this.currentPage === 1;
  }

  get isPageDataSavedToBackend() {
    return this.currentPage >= this.lastPageNumberTillSavedToBackend;
  }

  get disableSaveButton() {
    let isTrue = this.areRequiredFieldsPresent();
    console.log("Is True: ", isTrue);
    return this.currentPage < this.lastPageNumberTillSavedToBackend || !isTrue;
  }

  areRequiredFieldsPresent() {
    if (
      !this.formdata.loginNumberPart1 ||
      !this.formdata.loginNumberPart2 ||
      !this.formdata.loginNumberPart3 ||
      !this.formdata.loginNumberPart4 ||
      !this.formdata.dateOfIssuance ||
      !this.formdata.initialRegistrationDate ||
      !this.formdata.expirationDate ||
      !this.formdata.carName ||
      !this.formdata.typeOfVehicle ||
      !this.formdata.model1 ||
      !this.formdata.model2 ||
      !this.formdata.privateOrBusinessUse ||
      !this.formdata.bodyShape ||
      !this.formdata.fuelType ||
      !this.formdata.use ||
      !this.formdata.mileage ||
      !this.formdata.curbWeight ||
      (this.selectedbranches && this.selectedbranches.length === 0) ||
      this.certificateDataToSendBack == null ||
      this.certificateDataToSendBack.length === 0
    ) {
      return false;
    }
    return true;
  }

  initializeFormDataBig() {
    return {
      vehicleNumber: "",
      carPlatformNo: "",
      loginNumber: "",
      model: "",
      dateOfIssuance: "",
      privateOrBusinessUse: "", // Default to private
      initialRegistrationDate: "",
      //   carBodyShape: "",
      expirationDate: "",
      affiliation: [],
      fuelType: "",
      use: "",
      carName: "",
      mileage: "",
      curbWeight: "",
      typeOfVehicle: "",
      doorNumber: "",
      //   worklocation: "",
      images: [],
      certimages: []
    };
  }

  handleInputChangeLoginNumber(event) {
    const part = event.target.dataset.part;
    const value = event.target.value;

    if (part === "part1") {
      this.formdata.loginNumberPart1 = value;
    } else if (part === "part2") {
      this.formdata.loginNumberPart2 = value;
    } else if (part === "part3") {
      this.formdata.loginNumberPart3 = value;
    } else if (part === "part4") {
      this.formdata.loginNumberPart4 = value;
    }
    this.saveFormData();
  }

  handleInputChange(event) {
    const { name, value } = event.target;
    if (name === "affiliation") {
      // Split the value by comma or any other delimiter
      const affiliations = value.split(",").map((item) => item.trim());
      this.formdata.affiliation = affiliations;
    } else if (
      name === "dateOfIssuance" ||
      name === "expirationDate" ||
      name === "initialRegistrationDate"
    ) {
      this.formdata[name] = value; // Directly update date fields
    } else if (
      name === "privateOrBusinessUse" ||
      name === "use" ||
      name === "carName" ||
      name === "typeOfVehicle" ||
      name === "fuelType"
    ) {
      this.formdata[name] = value;
    } else {
      this.formdata[name] = value; // Update other fields using spread syntax
    }
    console.log("this.formdata", JSON.stringify(this.formdata));
    this.saveFormData();
  }

  handlePickListChange(event) {
    const name = event.target.dataset.namee;
    const value = event.target.dataset.idd;
    console.log("name, value", name, value);
    if (name === "carName") {
      this.formdata[name] = value;
      this.selectedPicklistCarName = value;
      this.showlistCarName = false;
      this.handleCarNameChange();
    } else if (name === "typeOfVehicle") {
      this.formdata[name] = value;
      this.selectedPicklisttypeOfVehicle = value;
      this.showlisttypeOfVehicle = false;
      this.handletypeOfVehicleChange();
    } else if (name === "fuelType") {
      this.formdata[name] = value;
      this.selectedPicklistfuelType = value;
      this.showlistfuelType = false;
      this.handlefuelTypeChange();
    } else if (name === "use") {
      this.formdata[name] = value;
      this.selectedPicklistuse = value;
      this.showlistuse = false;
      this.handleuseChange();
    } else if (name === "privateOrBusinessUse") {
      this.formdata[name] = value;
      this.showlistprivateOrBusinessUse = false;
      this.selectedPicklistprivateOrBusinessUse = value;
      this.handleprivateOrBusinessUseChange();
    } else if (name === "bodyShape") {
      this.formdata[name] = value;
      this.selectedPicklistbodyShape = value;
      this.showlistbodyShape = false;
      this.handlebodyShapeChange();
    }
  }

  get currentVehicle() {
    // Safeguard against undefined currentVehicles or out-of-bounds currentPage
    if (
      this.currentVehicles.length > 0 &&
      this.currentPage > 0 &&
      this.currentPage <= this.currentVehicles.length
    ) {
      return this.currentVehicles[this.currentPage - 1];
    }
    return null;
  }

  updatePagination() {
    this.totalPages = this.vehicleInfo.length || 1;
    this.initializeVehicleList(); // Initialize the vehicleList based on totalPages
    this.initializeBigData(); // Initialize the bigdata based on totalPages
  }

  initializeVehicleList() {
    this.vehicleList = Array.from({ length: this.totalPages }, () =>
      this.initializeFormData()
    );
  }

  initializeBigData() {
    this.bigdata = Array.from({ length: this.totalPages }, () =>
      this.initializeFormDataBig()
    );
  }

  updateFormData() {
    const vehicleFromList = this.vehicleList[this.currentPage - 1];
    const currentVehicle = this.currentVehicle;

    // Initialize form data with default values
    this.formdata = this.initializeFormData();

    if (vehicleFromList && vehicleFromList.vehicleNumber) {
      // Update form data from vehicleList if it exists
      this.formdata = { ...vehicleFromList };

      this.currentChessisNumber = (
        vehicleFromList.carPlatformNoPart1.trim() +
        "-" +
        vehicleFromList.carPlatformNoPart2.trim()
      ).trim();

      console.log(
        "this.currentChessisNumber when made from array",
        this.currentChessisNumber,
        " ",
        this.currentChessisNumber.length
      );
    } else if (currentVehicle) {
      this.currentChessisNumber = currentVehicle.carPlatformNo__c.trim();
      console.log(
        "this.currentChessisNumber when made from class",
        this.currentChessisNumber,
        " ",
        this.currentChessisNumber.length
      );

      // Remove hyphen
      const carPlatformNoWithoutHyphen =
        currentVehicle.carPlatformNo__c.replace("-", "");

      // Split into two parts: first 5 characters and the rest
      let partBefore = carPlatformNoWithoutHyphen.substring(0, 5); // first 5 characters
      let partAfter = carPlatformNoWithoutHyphen.substring(5); // rest of the characters
      partAfter = partAfter.padStart(7, "0");

      const fullmodel = currentVehicle.fullModel__c
        ? currentVehicle.fullModel__c.split("-")
        : ["", ""];
      const m1 = fullmodel[0]; // "part1"
      const m2 = fullmodel[1]; // "part2"

      this.formdata = {
        vehicleNumber: "",
        carPlatformNoPart1: partBefore || "",
        carPlatformNoPart2: partAfter || "",
        loginNumberPart1: currentVehicle.loginNumberPart1 || "",
        loginNumberPart2: currentVehicle.loginNumberPart2 || "",
        loginNumberPart3: currentVehicle.loginNumberPart3 || "",
        loginNumberPart4: currentVehicle.loginNumberPart4 || "",
        model1: m1 || "",
        model2: m2 || "",
        dateOfIssuance: "",
        initialRegistrationDate:
          currentVehicle.initialRegistrationDate__c || "",
        expirationDate: currentVehicle.expiringDateofEffectivePeriod__c || "",
        affiliation: [],
        fuelType: "",
        use: "",
        carName: "",
        mileage: currentVehicle.mileage__c || "",
        curbWeight: currentVehicle.vehicleWeight__c || "", // Correctly update curbWeight
        typeOfVehicle: "",
        doorNumber: "",
        bodyShape: "",
        privateOrBusinessUse: ""
      };
    } else {
      // No data available, set form data to default values
      this.formdata = this.initializeFormData();
    }
    console.log("this.currentChessisNumber", this.currentChessisNumber);
  }

  formatDate(dateStr) {
    if (dateStr) {
      const parts = dateStr.split("/");

      // Extracting the parts of the date
      const year = parseInt(parts[0].replace("R", "")) + 2000; // Adjust for Japanese calendar
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);

      // Format the date to yyyy-mm-dd for input type="date"
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    return "";
  }

  resetFormData() {
    this.formdata = this.initializeFormData();
  }

  resetFormDataBig() {
    this.updatedformdata = this.initializeFormDataBig();
  }

  saveFormData() {
    this.vehicleList[this.currentPage - 1] = { ...this.formdata };
    this.updateBigDataFromFormData();
  }

  updateBigDataFromFormData() {
    let formDatass = this.vehicleList[this.currentPage - 1];
    if (formDatass) {
      const concatenatedData = {
        certimages: this.formdata.certimages,
        images: this.formdata.images,
        vehicleNumber: this.formdata.vehicleNumber,
        carPlatformNo: `${formDatass.carPlatformNoPart1}-${formDatass.carPlatformNoPart2}`,
        loginNumber: `${formDatass.loginNumberPart1}-${formDatass.loginNumberPart2}-${formDatass.loginNumberPart3}-${formDatass.loginNumberPart4}`,
        model: `${formDatass.model1}-${formDatass.model2}`,
        dateOfIssuance:
          formDatass.dateOfIssuance ||
          this.vehicleInfo[this.currentPage - 1].dateOfIssuance ||
          "2024-01-01",
        privateOrBusinessUse: formDatass.privateOrBusinessUse,
        initialRegistrationDate:
          formDatass.initialRegistrationDate || "2024-01-01",
        expirationDate: formDatass.expirationDate || "2024-01-01",
        affiliation: formDatass.affiliation,
        fuelType: formDatass.fuelType,
        use: formDatass.use,
        carName: formDatass.carName,
        mileage: formDatass.mileage,
        curbWeight: formDatass.curbWeight,
        typeOfVehicle: formDatass.typeOfVehicle,
        doorNumber: formDatass.doorNumber
        // worklocation: formDatass.worklocation
      };
      this.bigdata[this.currentPage - 1] = concatenatedData;
    }
  }

  handlePrevious() {
    console.log("%cin previous", "color: green");
    if (this.currentPage === this.lastPageNumberTillSavedToBackend) {
      console.log("%cin prv when its last vehicel", "color: green");
      this.tempFormData = this.formdata;
      this.tempImageDataToSend = this.imageDataToSendBack;
      this.tempCertificateDataToSend = this.certificateDataToSendBack;
      this.tempFirstImageName = this.firstUploadedImageName;
      this.tempFirstCertificateName = this.firstUplaodedCertificateName;
      this.tempCertificateCount = this.countOfUplaodedCertificate;
      this.tempImageCount = this.countOfUploadedImage;
      this.tempUploadDivCss1 = this.uploadDivCss1;
      this.tempUploadText1 = this.uploadText1;
      this.tempUploadUploadIconToggle1 = this.uploadIconToggle1;
      this.tempUploadDivCss2 = this.uploadDivCss2;
      this.tempUploadText2 = this.uploadText2;
      this.tempUploadUploadIconToggle2 = this.uploadIconToggle2;
      
      this.tempBranches = this.branches;
      this.tempSelectedBranches = this.selectedbranches;
    }
    
    if (this.currentPage > 1) {
      // this.saveFormData();
      this.currentPage -= 1;
      this.updateFormData();
      this.formBodyCss =
        this.currentPage >= this.lastPageNumberTillSavedToBackend
        ? "form-body"
        : "form-body disable-editing";
        
        if (this.currentPage < this.lastPageNumberTillSavedToBackend) {
          console.log("%cin prv when getting data from class", "color: green");
          this.formLoader = true;
          this.getImagesFromApiViaChessisNumber();
          this.getAllDataForRegisteredVechicleByChessisNumber();
        } else {
        console.log("%cin prv when putting data from saveed one", "color: green");
        this.formdata = this.tempFormData;
        
        this.imageDataToSendBack = this.tempImageDataToSend;
        this.certificateDataToSendBack = this.tempCertificateDataToSend;
        this.firstUploadedImageName = this.tempFirstImageName;
        this.firstUplaodedCertificateName = this.tempFirstCertificateName;
        this.countOfUplaodedCertificate = this.tempCertificateCount;
        this.countOfUploadedImage = this.tempImageCount;
        this.uploadDivCss1 = this.tempUploadDivCss1;
        this.uploadText1 = this.tempUploadText1;
        this.uploadIconToggle1 = this.tempUploadUploadIconToggle1;
        this.uploadDivCss2 = this.tempUploadDivCss2;
        this.uploadText2 = this.tempUploadText2;
        this.uploadIconToggle2 = this.tempUploadUploadIconToggle2;
      }
    }
  }

  handleNext() {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.updateFormData();
      this.formBodyCss =
        this.currentPage >= this.lastPageNumberTillSavedToBackend
          ? "form-body"
          : "form-body disable-editing";

      if (this.isLastPage) {
        this.finalCompletionButtonCss = "searchbutton btn buttontxt2 red";
      } else {
        this.finalCompletionButtonCss = "searchbutton btn buttontxt2";
      }
      
      if (this.currentPage < this.lastPageNumberTillSavedToBackend) {
        console.log("%cin next when putting data from class", "color: green");
        this.formLoader = true;
        this.getImagesFromApiViaChessisNumber();
        this.getAllDataForRegisteredVechicleByChessisNumber();
      } else {
        console.log("%cin next when putting data from saveed one", "color: green");
        this.formdata = this.tempFormData;

        this.imageDataToSendBack = this.tempImageDataToSend;
        this.certificateDataToSendBack = this.tempCertificateDataToSend;
        this.firstUploadedImageName = this.tempFirstImageName;
        this.firstUplaodedCertificateName = this.tempFirstCertificateName;
        this.countOfUplaodedCertificate = this.tempCertificateCount;
        this.countOfUploadedImage = this.tempImageCount;
        this.uploadDivCss1 = this.tempUploadDivCss1;
        this.uploadText1 = this.tempUploadText1;
        this.uploadIconToggle1 = this.tempUploadUploadIconToggle1;
        this.uploadDivCss2 = this.tempUploadDivCss2;
        this.uploadText2 = this.tempUploadText2;
        this.uploadIconToggle2 = this.tempUploadUploadIconToggle2;

        this.selectedPicklistCarName = this.formdata.carName;
        this.selectedPicklistbodyShape = this.formdata.bodyShape;
        this.selectedPicklistfuelType = this.formdata.fuelType;
        this.selectedPicklistprivateOrBusinessUse =
          this.formdata.privateOrBusinessUse;
        this.selectedPicklisttypeOfVehicle = this.formdata.typeOfVehicle;
        this.selectedPicklistuse = this.formdata.use;

        this.branches = this.tempBranches;
        this.selectedbranches = this.tempSelectedBranches;

       
        console.log("this.firstUploadedImageName", this.firstUploadedImageName);
        console.log(
          "this.firstUplaodedCertificateName",
          this.firstUplaodedCertificateName
        );
      }
    }
  }

  handleSaveData(event) {
    // Save the current form data
    this.resetErrorCss();
    let isValid = this.validateFormData();
    if (!isValid) {
      return;
    }

    let selectedAffilation = this.template.querySelector(
      '[name="affiliation"]'
    );

    if (
      selectedAffilation != null &&
      selectedAffilation.value !== "選択してください"
    ) {
      selectedAffilation.value = "選択してください";
    }
    let selectedCarName = this.template.querySelector('[name="carName"]');

    if (
      selectedCarName != null &&
      selectedCarName.value !== "選択してください"
    ) {
      selectedCarName.value = "選択してください";
    }
    let selectedVehicleType = this.template.querySelector(
      '[name="typeOfVehicle"]'
    );

    if (
      selectedVehicleType != null &&
      selectedVehicleType.value !== "選択してください"
    ) {
      selectedVehicleType.value = "選択してください";
    }
    let selectedPrivateUse = this.template.querySelector(
      '[name="privateOrBusinessUse"]'
    );

    if (
      selectedPrivateUse != null &&
      selectedPrivateUse.value !== "選択してください"
    ) {
      selectedPrivateUse.value = "選択してください";
    }
    let selectedFuelType = this.template.querySelector('[name="fuelType"]');

    if (
      selectedFuelType != null &&
      selectedFuelType.value !== "選択してください"
    ) {
      selectedFuelType.value = "選択してください";
    }
    let selectedUse = this.template.querySelector('[name="use"]');

    if (selectedUse != null && selectedUse.value !== "選択してください") {
      selectedUse.value = "選択してください";
    }
    let selectedBodyShape = this.template.querySelector('[name="bodyShape"]');

    if (
      selectedBodyShape != null &&
      selectedBodyShape.value !== "選択してください"
    ) {
      selectedBodyShape.value = "選択してください";
    }

    this.formLoader = true;
    window.scrollTo(0, 0);

    this.finalSave(event);
  }

  finalSave(ev) {
    if (ev.target.name === "completion-button") {
      this.formLoader = false;

      if (this.totalPages === 1 || this.currentPage === this.totalPages) {
        this.showRegisteredVehicles = true;
        this.Step1 = false;
      } else {
        this.showfinalModal = true;

        this.commonChassisNumbers = this.vehicleInfo.slice(
          0,
          this.lastPageNumberTillSavedToBackend
        );
        this.missingChassisNumbers = this.vehicleInfo.slice(
          this.lastPageNumberTillSavedToBackend,
          this.totalPages
        );
      }
    }

    let mergeImageArray = this.certificateDataToSendBack;
    if (this.imageDataToSendBack != null) {
      mergeImageArray = this.certificateDataToSendBack.concat(
        this.imageDataToSendBack
      );
    }
    console.log("mergeImageArray", JSON.stringify(mergeImageArray));

    let certData = this.certificateIdsForClass;
    if (this.imageIdsForClass != null) {
      certData = this.certificateIdsForClass.concat(this.imageIdsForClass);
    }

    let finalListOfFormDataToSend = [];
    finalListOfFormDataToSend.push(this.formdata);

    this.handleSaveToServer(
      JSON.stringify(finalListOfFormDataToSend),
      JSON.stringify(certData)
    );
  }

  toastIt(value) {
    this.showToasts("エラー", `${value} は必須です`, "error");
    return false;
  }

  toastCustom(message) {
    return false;
  }

  resetErrorCss() {
    // this.errorVehicleNumberCss = ""
    this.errorMileageCss = "hide-error";
    this.errorModelCss = "hide-error";
    // this.errorModel2Css = "hide-error";
    this.errorLoginCss = "hide-error";
    this.errorCurbCss = "hide-error";
    this.errorDoorCss = "hide-error";
    this.errorModelDiv = "input-field-modal";
    // this.errorModel2Div = "input-field-modal";
    this.errorMileageDiv = "input-field-mil";
    this.errorCurbDiv = "input-field-mil";
    this.errorDoorDiv = "input-field";
    this.errorlogin1div = "input-field1";
    this.errorlogin2div = "input-field2";
    this.errorlogin3div = "input-field3";
    this.errorlogin4div = "input-field4";
  }

  validateFormData() {
    let isValid = true;
    const regexJapanese = /^[一-龠ぁ-ゔァ-ヴー々〆〤ヶ]+$/; // Any Japanese characters including Kanji, Hiragana, Katakana, and special characters
    const regexNumbers = /^\d+$/; // Only digits  
    const regexNumbers1 =/^\d+・*$/;
 // Only digits  
    // let cleanedString = this.formdata.loginNumberPart4.replace(/\・+$/, '');

    if (
      !this.formdata.loginNumberPart1 ||
      !this.formdata.loginNumberPart2 ||
      !this.formdata.loginNumberPart3 ||
      !this.formdata.loginNumberPart4
    ) {
      this.toastIt("ログイン番号");
      isValid = false;
    } else if(!regexJapanese.test(this.formdata.loginNumberPart1) ||
              !regexJapanese.test(this.formdata.loginNumberPart3) ||
              !regexNumbers.test(this.formdata.loginNumberPart2) ||
              !regexNumbers1.test(this.formdata.loginNumberPart4)
          ) {
            this.errorlogin1div = "input-field1 invalid-input";
            this.errorlogin2div = "input-field2 invalid-input";
            this.errorlogin3div = "input-field3 invalid-input";
            this.errorlogin4div = "input-field4 invalid-input";
        this.errorLogin = "正しい登録番号を入力してください";
        this.errorLoginCss = "show-error";
        console.log("errorLoginCss: ",this.errorLoginCss);
        this.toastCustom("Registration Number Wrong");
        isValid = false;
      } else {
      this.formdata.loginNumberPart1 = this.formdata.loginNumberPart1
        .replace(/\s+/g, "")
        .toUpperCase();
      this.formdata.loginNumberPart2 = this.formdata.loginNumberPart2
        .replace(/\s+/g, "")
        .toUpperCase()
        .padStart(3, "0");
      this.formdata.loginNumberPart3 = this.formdata.loginNumberPart3
        .replace(/\s+/g, "")
        .toUpperCase();
      this.formdata.loginNumberPart4 = this.formdata.loginNumberPart4
        .replace(/\s+/g, "")
        .toUpperCase()
        .padEnd(4, "・");
    }

    if (!this.formdata.dateOfIssuance) {
      console.log("Date Of Issuance: ", this.formdata.dateOfIssuance);
      this.toastIt("交付年月日");
      isValid = false;
    }
    if (!this.formdata.initialRegistrationDate) {
      this.toastIt("初回登録日");
      isValid = false;
    }
    if (!this.formdata.expirationDate) {
      console.log("Expiration Date Here", this.formdata.expirationDate);
      this.toastIt("有効期限");
      isValid = false;
    }
    if (this.selectedbranches && this.selectedbranches.length === 0) {
      this.toastIt("所属");
      isValid = false;
    }
    if (!this.formdata.carName) {
      this.toastIt("車名");
      isValid = false;
    }
    if (!this.formdata.typeOfVehicle) {
      this.toastIt("車両タイプ");
      isValid = false;
    }
    if (
      this.certificateDataToSendBack == null ||
      this.certificateDataToSendBack.length === 0
    ) {
      this.toastIt("証明書の画像");
      isValid = false;
    }
    if (!this.formdata.model1 || !this.formdata.model2) {
      this.toastIt("モデル");
      isValid = false;
    } else {
      this.formdata.model2 = this.formdata.model2
        .replace(/\s+/g, "")
        .toUpperCase();

      if (
        /[^0-9A-Z]/.test(this.formdata.model2) ||
        /[^0-9A-Za-z]/.test(this.formdata.model1)
      ) {
        this.errorModelDiv = "input-field-modal invalid-input";
        this.errorModel = "英数字のみを入力してください。";
        this.errorModelCss = "show-error";
        this.toastCustom("英数字のみを入力してください。");
        isValid = false;
      }

      this.formdata.model2 = this.formdata.model2.padStart(7, "0");
    }
    if (!this.formdata.privateOrBusinessUse) {
      this.toastIt("私用または業務用");
      isValid = false;
    }
    if (!this.formdata.bodyShape) {
      this.toastIt("車体の形状");
      isValid = false;
    }
    if (!this.formdata.fuelType) {
      this.toastIt("燃料タイプ");
      isValid = false;
    }
    if (!this.formdata.use) {
      this.toastIt("使用目的");
      isValid = false;
    }
    if (!this.formdata.mileage) {
      this.errorMileageDiv = "input-field-mil invalid-input";
      this.errorMileage = "this is required mileage";
      this.errorMileageCss = "show-error";
      this.toastIt("走行距離");
      isValid = false;
    } else {
      if (!/^\d+$/.test(this.formdata.mileage)) {
        this.errorMileageDiv = "input-field-mil invalid-input";
        this.errorMileage = "数字のみを入力してください。";
        this.errorMileageCss = "show-error";
        this.toastCustom("数字のみを入力してください。");
        isValid = false;
      }

      if (/^0/.test(this.formdata.mileage)) {
        this.errorMileageDiv = "input-field-mil invalid-input";
        this.errorMileage = "走行距離は0から始まることはできません。";
        this.errorMileageCss = "show-error";
        this.toastCustom("走行距離は0から始まることはできません。");
        isValid = false;
      }
    }
    if (
      this.formdata.curbWeight === null ||
      this.formdata.curbWeight === "" ||
      this.formdata.curbWeight.length === 0
    ) {
      this.toastIt("車両重量");
      isValid = false;
    } else {
      if (!/^\d+$/.test(this.formdata.curbWeight)) {
        this.errorCurbDiv = "input-field-mil invalid-input";
        this.errorCurb = "数字のみを入力してください。。";
        this.errorCurbCss = "show-error";
        this.toastCustom("数字のみを入力してください。。");
        isValid = false;
      }

      if (/^0/.test(this.formdata.curbWeight)) {
        this.errorCurbDiv = "input-field-mil invalid-input";
        this.errorCurb = "車両重量は 0 から始めることはできません。";
        this.errorCurbCss = "show-error";
        this.toastCustom("車両重量は 0 から始めることはできません。");
        isValid = false;
      }
    }
    const regexdoor = /^[\dA-Za-z一-龠ぁ-ゔァ-ヴー々〆〤ヶ]+$/;
    if (
      this.formdata.doorNumber !== null &&
      this.formdata.doorNumber !== "" &&
      this.formdata.doorNumber.length !== 0
    ) {
      if (!regexdoor.test(this.formdata.doorNumber)) {
        this.errorDoorDiv = "input-field invalid-input";
        this.errorDoor = "ドア番号には英数字を入力してください。";
        this.errorDoorCss = "show-error";
        this.toastCustom("ドア番号には英数字を入力してください。");
        isValid = false;
      }
    }
    if (!isValid)
      this.showToasts("エラー", "有効な値を入力してください", "error");
    return isValid;
  }

  handleSaveToServer(jsonInput, jsonStrings) {
    console.log("register vehicle class data send", jsonInput, jsonStrings);
    // Make sure bigdata is not empty before calling the server
    registervehicle({
      jsonInput: jsonInput,
      contentVersionIdsJson: jsonStrings
    })
      .then((result) => {
        //just go to next page
        if (this.currentPage < this.totalPages) {
          this.currentPage += 1; // Increment the current page
          this.updateFormData(); // Update the form for the next page
          this.lastPageNumberTillSavedToBackend += 1;
          console.log(
            "lastPageNumberTillSavedToBackend",
            this.lastPageNumberTillSavedToBackend
          );
        }

        this.formBodyCss =
          this.currentPage >= this.lastPageNumberTillSavedToBackend
            ? "form-body"
            : "form-body disable-editing";

        //just space management u know
        this.imageDataToSendBack = null;
        this.certificateDataToSendBack = null;
        this.certificateIdsForClass = [];
        this.imageIdsForClass = [];
        this.countOfUplaodedCertificate = 0;
        this.countOfUploadedImage = 0;
        this.firstUplaodedCertificateName = "";
        this.firstUploadedImageName = "";

        this.uploadText1 = "アップロード";
        this.uploadText2 = "アップロード";
        this.uploadDivCss1 = "input-field-img no-scrollbar";
        this.uploadDivCss2 = "input-field-img no-scrollbar";
        this.uploadIconToggle1 = true;
        this.uploadIconToggle2 = true;

        this.selectedPicklistCarName = "";
        this.selectedPicklistbodyShape = "";
        this.selectedPicklistfuelType = "";
        this.selectedPicklistprivateOrBusinessUse = "";
        this.selectedPicklisttypeOfVehicle = "";
        this.selectedPicklistuse = "";

        console.log("this.branches before", JSON.stringify(this.branches));
        console.log(
          "this.selectedbranches before",
          JSON.stringify(this.selectedbranches)
        );
        this.branches.push(...this.selectedbranches);
        this.selectedbranches = [];
        console.log("this.branches after", JSON.stringify(this.branches));

        this.formLoader = false;
      })
      .catch((error) => {
        console.error(
          "error by register vehicle class data send",
          jsonInput,
          jsonStrings
        );
        console.error("error by register vehicle class", error);
        this.showToasts("エラー", "もう一度試してください", "error");
        window.scrollTo(0, 0);
      });
  }
  /*FormData methods methods*/

  /*Image methods*/
  imageCurrent = this.formdata;
  fileName = "";
  opencertmodal() {
    this.showUploadCModal = true;
  }

  getimagedata(event) {
    this.uploadimagedata = event.detail;
    this.imageDataToSendBack = event.detail;

    if (this.uploadimagedata.length === 0) {
      this.firstUploadedImageName = "";
      this.countOfUploadedImage = event.detail.length;
      console.log(this.countOfUploadedImage);
    } else {
      this.firstUploadedImageName = event.detail[0].fileName;
      this.countOfUploadedImage = event.detail.length;
      console.log(this.countOfUploadedImage);
    }

    if (this.countOfUploadedImage == 1) {
      this.uploadDivCss2 = "input-field-img left-align no-scrollbar";
      this.uploadText2 = this.firstUploadedImageName;
      this.uploadIconToggle2 = false;
    } else if (this.countOfUploadedImage >= 2) {
      this.uploadDivCss2 = "input-field-img left-align no-scrollbar";
      this.uploadText2 =
        this.firstUploadedImageName + "など" + this.countOfUploadedImage + "枚";
      this.uploadIconToggle2 = false;
    } else {
      this.uploadDivCss2 = "input-field-img no-scrollbar";
      this.uploadText2 = "アップロード";
      this.uploadIconToggle2 = true;
    }
  }

  getimagecertdata(event) {
    this.uploadimagedata = event.detail;
    this.certificateDataToSendBack = event.detail;

    if (this.uploadimagedata.length === 0) {
      this.firstUplaodedCertificateName = "";
      console.log(
        "this.firstUplaodedCertificateName",
        this.firstUplaodedCertificateName
      );
      console.log("this.firstUplaodedCertificateName2", event.detail);
      this.countOfUplaodedCertificate = event.detail.length;
      console.log(this.countOfUplaodedCertificate);
    } else {
      this.firstUplaodedCertificateName = event.detail[0].fileName;
      console.log(
        "this.firstUplaodedCertificateName",
        this.firstUplaodedCertificateName
      );
      console.log("this.firstUplaodedCertificateName2", event.detail);
      this.countOfUplaodedCertificate = event.detail.length;
      console.log(this.countOfUplaodedCertificate);
    }

    if (this.countOfUplaodedCertificate == 1) {
      this.uploadDivCss1 = "input-field-img left-align no-scrollbar";
      this.uploadText1 = this.firstUplaodedCertificateName;
      this.uploadIconToggle1 = false;
    } else if (this.countOfUplaodedCertificate >= 2) {
      this.uploadDivCss1 = "input-field-img left-align no-scrollbar";
      this.uploadText1 =
        this.firstUplaodedCertificateName +
        "など" +
        this.countOfUplaodedCertificate +
        "枚";
      this.uploadIconToggle1 = false;
    } else {
      this.uploadDivCss1 = "input-field-img no-scrollbar";
      this.uploadText1 = "アップロード";
      this.uploadIconToggle1 = true;
    }
  }

  getImageIdsForClass(event) {
    this.imageIdsForClass = event.detail;
    console.log("this.imageIdsForClass", JSON.stringify(this.imageIdsForClass));
  }

  getCertificateIdsForClass(event) {
    this.certificateIdsForClass = event.detail;
    console.log(
      "this.certificateIdsForClass",
      JSON.stringify(this.certificateIdsForClass)
    );
  }

  closeupload() {
    this.showUploadModal = false;
  }

  closecertficate() {
    this.showUploadCModal = false;
  }

  showupload() {
    this.showUploadModal = true;
  }
  /*Image methods*/

  handle2Next() {
    this.showconfModal = true;
  }

  handleNo() {
    this.addVehiclePage = true;
    this.showconfModal = false;
  }

  closesure() {
    this.showfinalModal = false;
  }

  addInputFields() {
    // Push a new object with unique ID for each new input set
    this.inputs.push({
      id: this.inputs.length + 1, // Unique ID for each entry
      part1: "",
      part2: ""
    });
  }

  addCustomStyles() {
    const style = document.createElement("style");
    style.innerText = `
            .file-upload-input {
                display: none;
            }
            .file-upload-label {
                display: inline-block;
                background-color: blue;
                color: white;
                padding: 8px 16px;
                cursor: pointer;
            }
            .upload-icon::before {
                content: '';
                background: var(--upload-icon) no-repeat center center;
                background-size: contain;
                width: 24px;
                height: 24px;
                display: inline-block;
                margin-right: 8px;
            }
        `;
    this.template
      .querySelector('lightning-input[data-id="file-upload"]')
      .appendChild(style);
  }

  showToasts(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

  handleShowRegisteredVehiclesFinalScreem() {
    this.showRegisteredVehicles = true;
    this.Step1 = false;
    this.showfinalModal = false;
  }

  handleClick() {
    window.location.reload();
  }

  handleInputCheck(event) {
    const input = event.target;
    input.value = input.value.replace(/[^\d０-９]/g, '').slice(0,6);
  }
  handleInputJapanese(event) {
    const input = event.target;
    // Allow Japanese Kanji, Hiragana, Katakana, and spaces (Furigana typically includes Hiragana and Katakana)
    input.value = input.value.replace(/[^\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF\uFF66-\uFF9D]/g, '');
}

}
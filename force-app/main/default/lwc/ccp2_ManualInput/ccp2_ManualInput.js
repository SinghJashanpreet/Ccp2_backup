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

/*Changes From Here*/
import { getPicklistValues } from "lightning/uiObjectInfoApi";

import BODY_SHAPE_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Body_Shape__c";
import CAR_NAME_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Name__c";
import VEHICLE_TYPE_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Vehicle_Type__c";
import USE_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Use__c";
import FUEL_TYPE_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Fuel_Type__c";
import PRIVATE_BUSINESS_FIELD from "@salesforce/schema/ccp2_Registered_Vehicle__c.Private_Business_use__c";
/*Changes Till Here */

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
  @track uploadDivCss1 = "input-field-img";
  @track uploadDivCss2 = "input-field-img";
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
  placeholder = "Select an option";
  /*Changes From Here */
  bodyShapeOptions = [];
  privateOrBusinessOptions = [];
  @track selectedbranches = [];
  carNameOptions = [];
  vehicleTypeOptions = [];
  useOptions = [];
  fuelTypeOptions = [];
  @track formLoader = false;

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
      // this.branches = data.map(branches => {
      //     return { label: branches.Name, value: branches.Id };});
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
      // this.branches = data.map(branches => {
      //     return { label: branches.Name, value: branches.Id };});
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
      // this.branches = data.map(branches => {
      //     return { label: branches.Name, value: branches.Id };});
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }

  handlevehChange(event) {
    event.stopPropagation();
    this.showlist = !this.showlist;
    if (this.vehicles.length === 0) {
      this.showlist = false;
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
      // this.branches = data.map(branches => {
      //     return { label: branches.Name, value: branches.Id };});
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
      // this.branches = data.map(branches => {
      //     return { label: branches.Name, value: branches.Id };});
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
      // this.branches = data.map(branches => {
      //     return { label: branches.Name, value: branches.Id };});
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
    }
  }
  handleBranchSelect(event) {
    this.selectedVehicleId = event.currentTarget.dataset.id;
    this.handleBranchChange();
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
  handleCarNameChange() {
    this.showlistCarName = !this.showlistCarName;
  }
  handlefuelTypeChange() {
    this.showlistfuelType = !this.showlistfuelType;
  }
  handletypeOfVehicleChange() {
    this.showlisttypeOfVehicle = !this.showlisttypeOfVehicle;
  }
  handleuseChange() {
    this.showlistuse = !this.showlistuse;
  }
  handleprivateOrBusinessUseChange() {
    this.showlistprivateOrBusinessUse = !this.showlistprivateOrBusinessUse;
  }
  handlebodyShapeChange() {
    this.showlistbodyShape = !this.showlistbodyShape;
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
          label: deletedBranchFromBranchArray.Name,
          value: deletedBranchFromBranchArray.Id
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

  @wire(getfields, { chassisNumbers: "$vehicleInfo" })
  fun({ data, error }) {
    if (data) {
      this.currentVehicles = data.VehicleInfo;
      this.updateFormData(); // Update form data when data is received
    } else if (error) {
      console.error("getfields from vehicleinfo", error);
    }
  }

  getAllDataForRegisteredVechicleByChessisNumber() {
    getAllDataForRegisteredVechicleByChessisNumber({
      carPlatformNumber: this.currentChessisNumber
    })
      .then((result) => {
        this.formLoader = true;
        // result = JSON.parse(result);
        console.log("getAllDataForRegisteredVechicleByChessisNumber", result);

        this.LastPageFormData = this.formdata;
        console.log("LastPageFormData", this.LastPageFormData);

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

        console.log("Checking if Working after class", this.formdata);
        this.formLoader = false;
      })
      .catch((err) => {
        console.error("getAllDataForRegisteredVechicleByChessisNumber", err);
      });
  }

  getImagesFromApiViaChessisNumber() {
    getImagesFromApiViaChessisNumber({
      chassisNumber: this.currentChessisNumber
      // chassisNumber: "HY674-658H8934"
    })
      .then((result) => {
        console.log("getImagesFromApiViaChessisNumber1", result);
        result = JSON.parse(result);
        console.log("getImagesFromApiViaChessisNumber2", result);
        this.imageDataToSendBack = result.Images;
        this.certificateDataToSendBack = result.Certificates;

        if (result.Certificates.length != 0) {
          this.firstUplaodedCertificateName =
            this.certificateDataToSendBack[0].fileName;
          console.log(
            "this.firstUplaodedCertificateName",
            this.firstUplaodedCertificateName
          );

          this.countOfUplaodedCertificate =
            this.certificateDataToSendBack.length;
          console.log(this.countOfUplaodedCertificate);

          if (this.countOfUplaodedCertificate == 1) {
            this.uploadDivCss1 = "input-field-img left-align";
            this.uploadText1 = this.firstUplaodedCertificateName;
            this.uploadIconToggle1 = false;
          } else if (this.countOfUplaodedCertificate >= 2) {
            this.uploadDivCss1 = "input-field-img left-align";
            this.uploadText1 =
              this.firstUplaodedCertificateName +
              "など" +
              this.countOfUplaodedCertificate +
              "枚";
            this.uploadIconToggle1 = false;
          } else {
            this.uploadDivCss1 = "input-field-img";
            this.uploadText1 = "アップロード";
            this.uploadIconToggle1 = true;
          }
        } else {
          this.firstUplaodedCertificateName = "";
          this.countOfUplaodedCertificate = 0;
          this.uploadDivCss1 = "input-field-img";
          this.uploadText1 = "アップロード";
          this.uploadIconToggle1 = true;
        }

        if (result.Images.length != 0) {
          this.firstUploadedImageName = this.imageDataToSendBack[0].fileName;
          this.countOfUploadedImage = this.imageDataToSendBack.length;
          console.log(this.countOfUploadedImage);

          if (this.countOfUploadedImage == 1) {
            this.uploadDivCss2 = "input-field-img left-align";
            this.uploadText2 = this.firstUploadedImageName;
            this.uploadIconToggle2 = false;
          } else if (this.countOfUploadedImage >= 2) {
            this.uploadDivCss2 = "input-field-img left-align";
            this.uploadText2 =
              this.firstUploadedImageName +
              "など" +
              this.countOfUploadedImage +
              "枚";
            this.uploadIconToggle2 = false;
          } else {
            this.uploadDivCss2 = "input-field-img";
            this.uploadText2 = "アップロード";
            this.uploadIconToggle2 = true;
          }
        } else {
          this.firstUploadedImageName = "";
          this.countOfUploadedImage = 0;
          this.uploadDivCss2 = "input-field-img";
          this.uploadText2 = "アップロード";
          this.uploadIconToggle2 = true;
        }

        this.formLoader = false;
      })
      .catch((err) => {
        console.error("getImagesFromApiViaChessisNumber4", err);
        this.showToasts("Error", err.body.message, "error");
        window.scrollTo(0, 0);
      });
  }

  @wire(branchList)
  branchs({ data, error }) {
    if (data) {
      this.branches = data.map((branches) => {
        return { label: branches.Name, value: branches.Id };
      });
      this.updateFormData(); // Update form data when data is received
    } else if (error) {
      // console.error("error", error);
    }
  }

  /*Changes Till HEre */

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
    // this.validateFormData();
  }

  // renderedCallback(){
  //   this.setSelectOpacity();
  // }

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
    return this.currentPage < this.lastPageNumberTillSavedToBackend;
  }
  showupload() {
    this.showUploadModal = true;
  }

  imageCurrent = this.formdata;

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

  //   handleInputChangeModel(event) {
  //     const type = event.target.dataset.types;
  //     const value = event.target.value;

  //     if (type == "part1") {
  //       this.formdata.model1 = value;
  //     } else if (type == "part2") {
  //       this.formdata.model2 = value;
  //     }
  //     this.saveFormData();
  //   }

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
      //   if (name === "dateOfIssuance") this.dateofIss = value;
      //   if (name === "RegistrationDate") this.dateofReg = value;
      //   if (name === "ExpirationDate") this.expData = value;
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
      this.handleCarNameChange();
    } else if (name === "typeOfVehicle") {
      this.formdata[name] = value;
      this.selectedPicklisttypeOfVehicle = value;
      this.handletypeOfVehicleChange();
    } else if (name === "fuelType") {
      this.formdata[name] = value;
      this.selectedPicklistfuelType = value;
      this.handlefuelTypeChange();
    } else if (name === "use") {
      this.formdata[name] = value;
      this.selectedPicklistuse = value;
      this.handleuseChange();
    } else if (name === "privateOrBusinessUse") {
      this.formdata[name] = value;
      this.selectedPicklistprivateOrBusinessUse = value;
      this.handleprivateOrBusinessUseChange();
    } else if (name === "bodyShape") {
      this.formdata[name] = value;
      this.selectedPicklistbodyShape = value;
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
      // Update form data from currentVehicle if vehicleList is empty or invalid
      this.currentChessisNumber = currentVehicle.carPlatformNo__c.trim();
      console.log(
        "this.currentChessisNumber when made from class",
        this.currentChessisNumber,
        " ",
        this.currentChessisNumber.length
      );
      const parts = currentVehicle.carPlatformNo__c
        ? currentVehicle.carPlatformNo__c.split("-")
        : ["", ""];
      const partBefore = parts[0]; // "part1"
      const partAfter = parts[1]; // "part2"

      const fullmodel = currentVehicle.fullModel__c
        ? currentVehicle.fullModel__c.split("-")
        : ["", ""];
      const m1 = fullmodel[0]; // "part1"
      const m2 = fullmodel[1]; // "part2"

      // if()
      // const registerationNumber = currentVehicle.registrationNumberSequence__c ?
      // currentVehicle.registrationNumberSequence__c.split()

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
        // carBodyShape: currentVehicle.carBodyShape || "",
        expirationDate: currentVehicle.expiringDateofEffectivePeriod__c || "",
        affiliation: [],
        fuelType: "",
        use: "",
        carName: "",
        mileage: currentVehicle.mileage__c || "",
        curbWeight: currentVehicle.vehicleWeight__c || "", // Correctly update curbWeight
        typeOfVehicle: "",
        doorNumber: "",
        bodyShape: ""
      };
    } else {
      // No data available, set form data to default values
      this.formdata = this.initializeFormData();
      // this.currentVehicleId = ""; // Reset if no vehicle
    }
    console.log("this.currentChessisNumber", this.currentChessisNumber);
  }

  formatDate(dateStr) {
    if (dateStr) {
      // Example dateStr format: "R3/6/1"
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
    // this.updateFormData();
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
        // carBodyShape: formDatass.carBodyShape,
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
    if (this.currentPage === this.lastPageNumberTillSavedToBackend) {
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
        this.formLoader = true;
        this.getImagesFromApiViaChessisNumber();
        this.getAllDataForRegisteredVechicleByChessisNumber();
      } else {
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

      // this.currentChessisNumber = this.currentChessisNumber;
    }
  }

  handleNext() {
    if (this.currentPage < this.totalPages) {
      // this.saveFormData();
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
        this.formLoader = true;
        this.getImagesFromApiViaChessisNumber();
        this.getAllDataForRegisteredVechicleByChessisNumber();
      } else {
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
      }
    }
  }

  @track dateofIss = "";
  @track dateofReg = "";
  @track expData = "";

  @track dateOfExpiration = "";

  //   handleDateChange(event) {
  //     const { name, value } = event.target;
  //     this.dateOfExpiration = value;
  //     // this.formdata = { ...this.formdata, [name]: value };
  //     // this.saveFormData();
  //   }

  handleInputClick() {
    this.template.querySelector('input[type="file"]').click();
  }

  fileName = "";

  //   handleFileChange(event) {
  //     const file = event.target.files[0];
  //     if (file) {
  //       this.fileName = file.name;
  //     }
  //   }

  handle2Next() {
    this.showconfModal = true;
  }

  handleNo() {
    this.addVehiclePage = true;
    this.showconfModal = false;
  }

  @track inputs = [
    {
      id: 1,
      part1: "",
      part2: ""
    }
  ]; // Array to store input data

  addInputFields() {
    // Push a new object with unique ID for each new input set
    this.inputs.push({
      id: this.inputs.length + 1, // Unique ID for each entry
      part1: "",
      part2: ""
    });
  }

  opencertmodal() {
    this.showUploadCModal = true;
  }

  getimagedata(event) {
    this.uploadimagedata = event.detail;
    this.imageDataToSendBack = event.detail;

    this.firstUploadedImageName = event.detail[0].fileName;
    this.countOfUploadedImage = event.detail.length;
    console.log(this.countOfUploadedImage);

    if (this.countOfUploadedImage == 1) {
      this.uploadDivCss2 = "input-field-img left-align";
      this.uploadText2 = this.firstUploadedImageName;
      this.uploadIconToggle2 = false;
    } else if (this.countOfUploadedImage >= 2) {
      this.uploadDivCss2 = "input-field-img left-align";
      this.uploadText2 =
        this.firstUploadedImageName + "など" + this.countOfUploadedImage + "枚";
      this.uploadIconToggle2 = false;
    } else {
      this.uploadDivCss2 = "input-field-img";
      this.uploadText2 = "アップロード";
      this.uploadIconToggle2 = true;
    }

    // Assuming you want to store the image data in formdata
    // if (!this.formdata.images) {
    //   this.formdata.images = [];
    // }
    // this.formdata.images = [...event.detail];
    // console.log("this.formdata after image", JSON.stringify(this.formdata));
    // this.saveFormData();
    // this.saveFormData();
  }
  getimagecertdata(event) {
    this.uploadimagedata = event.detail;
    this.certificateDataToSendBack = event.detail;

    this.firstUplaodedCertificateName = event.detail[0].fileName;
    console.log(
      "this.firstUplaodedCertificateName",
      this.firstUplaodedCertificateName
    );
    console.log("this.firstUplaodedCertificateName2", event.detail);
    this.countOfUplaodedCertificate = event.detail.length;
    console.log(this.countOfUplaodedCertificate);

    if (this.countOfUplaodedCertificate == 1) {
      this.uploadDivCss1 = "input-field-img left-align";
      this.uploadText1 = this.firstUplaodedCertificateName;
      this.uploadIconToggle1 = false;
    } else if (this.countOfUplaodedCertificate >= 2) {
      this.uploadDivCss1 = "input-field-img left-align";
      this.uploadText1 =
        this.firstUplaodedCertificateName +
        "など" +
        this.countOfUplaodedCertificate +
        "枚";
      this.uploadIconToggle1 = false;
    } else {
      this.uploadDivCss1 = "input-field-img";
      this.uploadText1 = "アップロード";
      this.uploadIconToggle1 = true;
    }
    // // Assuming you want to store the image data in formdata
    // if (!this.formdata.certimages) {
    //   this.formdata.certimages = [];
    // }
    // this.formdata.certimages = [...event.detail];
    // console.log(
    //   "this.formdata after certificate",
    //   JSON.stringify(this.formdata)
    // );
    // this.saveFormData();

    // this.saveFormData();
  }

  // getimagecertdata(event){
  //     this.uploadcertificatedata = event.detail;

  closeupload() {
    this.showUploadModal = false;
  }
  closecertficate() {
    this.showUploadCModal = false;
  }

  handleSaveData(event) {
    // Save the current form data
    let isValid = this.validateFormData();
    if (!isValid) {
      return;
    }

    // console.log(
    //   "finalListOfFormDataToSend",
    //   JSON.stringify(finalListOfFormDataToSend)
    // );

    let selectedAffilation = this.template.querySelector(
      '[name="affiliation"]'
    );
    // console.log("selectedAffilation", selectedAffilation);
    if (
      selectedAffilation != null &&
      selectedAffilation.value !== "選択してください"
    ) {
      selectedAffilation.value = "選択してください";
    }
    let selectedCarName = this.template.querySelector('[name="carName"]');
    // console.log("selectedAffilation", selectedAffilation);
    if (
      selectedCarName != null &&
      selectedCarName.value !== "選択してください"
    ) {
      selectedCarName.value = "選択してください";
    }
    let selectedVehicleType = this.template.querySelector(
      '[name="typeOfVehicle"]'
    );
    // console.log("selectedAffilation", selectedAffilation);
    if (
      selectedVehicleType != null &&
      selectedVehicleType.value !== "選択してください"
    ) {
      selectedVehicleType.value = "選択してください";
    }
    let selectedPrivateUse = this.template.querySelector(
      '[name="privateOrBusinessUse"]'
    );
    // console.log("selectedAffilation", selectedAffilation);
    if (
      selectedPrivateUse != null &&
      selectedPrivateUse.value !== "選択してください"
    ) {
      selectedPrivateUse.value = "選択してください";
    }
    let selectedFuelType = this.template.querySelector('[name="fuelType"]');
    // console.log("selectedAffilation", selectedAffilation);
    if (
      selectedFuelType != null &&
      selectedFuelType.value !== "選択してください"
    ) {
      selectedFuelType.value = "選択してください";
    }
    let selectedUse = this.template.querySelector('[name="use"]');
    // console.log("selectedAffilation", selectedAffilation);
    if (selectedUse != null && selectedUse.value !== "選択してください") {
      selectedUse.value = "選択してください";
    }
    let selectedBodyShape = this.template.querySelector('[name="bodyShape"]');
    // console.log("selectedAffilation", selectedAffilation);
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
    // console.log("name", ev.target.name);
    if (ev.target.name === "completion-button") {
      this.formLoader = false;
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

    let mergeImageArray = this.certificateDataToSendBack;
    if (this.imageDataToSendBack != null) {
      mergeImageArray = this.certificateDataToSendBack.concat(
        this.imageDataToSendBack
      );
    }
    console.log("mergeImageArray", JSON.stringify(mergeImageArray));
    let finalListOfFormDataToSend = [];
    finalListOfFormDataToSend.push(this.formdata);

    this.handleSaveToServer(
      JSON.stringify(finalListOfFormDataToSend),
      JSON.stringify(mergeImageArray)
    );

    // Add final save logic here, like saving to the server
    // this.compareChassisNumbers();
    // this.showfinalModal = true;
  }

  closesure() {
    this.showfinalModal = false;
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

  // nextButtonCSS() {
  //     let nextButton = this.template.querySelector('[name="nextButton"]');
  //     // if the two terms not check, the next button is disable
  //     if (nextButton != null) {
  //       if (this.termServiceChecked && this.termDataChecked) {
  //         nextButton.className = "primary_nextbtn--m";
  //       } else {
  //         nextButton.className = "primary_nextbtn--m disabled";
  //       }
  //     }
  //   }

  toastIt(value) {
    this.showToasts("Error", `${value} is required`, "error");
    return false;
  }
  toastCustom(message) {
    this.showToasts("Error", `${message}`, "error");
    return false;
  }

  validateFormData() {
    console.log("For Validation: ", JSON.stringify(this.formdata));
    if (
      !this.formdata.loginNumberPart1 ||
      !this.formdata.loginNumberPart2 ||
      !this.formdata.loginNumberPart3 ||
      !this.formdata.loginNumberPart4
    ) {
      return this.toastIt("login number");
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
      return this.toastIt("dateOfIssuance");
    }
    if (!this.formdata.initialRegistrationDate) {
      return this.toastIt("initialRegistrationDate");
    }
    if (this.selectedbranches && this.selectedbranches.length === 0) {
      return this.toastIt("affiliation");
    }
    if (!this.formdata.carName) {
      return this.toastIt("Car Name");
    }
    if (!this.formdata.typeOfVehicle) {
      return this.toastIt("Vehicle Type");
    }
    if (this.certificateDataToSendBack == null) {
      return this.toastIt("Certificate Image");
    }
    if (!this.formdata.model1 || !this.formdata.model2) {
      return this.toastIt("Model");
    } else {
      this.formdata.model2 = this.formdata.model2
        .replace(/\s+/g, "")
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, "")
        .padStart(7, "0");
    }
    if (!this.formdata.privateOrBusinessUse) {
      return this.toastIt("Private or Business Use");
    }
    if (!this.formdata.bodyShape) {
      return this.toastIt("Body Shape");
    }
    if (!this.formdata.fuelType) {
      return this.toastIt("Fuel Type");
    }
    if (!this.formdata.use) {
      return this.toastIt("Use");
    }
    if (!this.formdata.mileage) {
      return this.toastIt("Mileage");
    } else {
      if (!/^\d+$/.test(this.formdata.mileage)) {
        return this.toastCustom("Mileage must contain numbers only.");
      }

      if (/^0/.test(this.formdata.mileage)) {
        return this.toastCustom("Mileage cannot start with 0.");
      }
    }
    if (this.formdata.curbWeight !== null) {
      // if (!/^\d{1,4}$/.test(this.formdata.curbWeight)) {
      // return this.toastCustom("Curb weight must be up to 4 digits.");
      // }
      if (/^0/.test(this.formdata.curbWeight)) {
        return this.toastCustom("Curb weight cannot start with 0.");
      }
    }

    // Validate doorNumber
    // if (this.formdata.doorNumber !== null) {
    //   if (!/^\d{10}$/.test(this.formdata.doorNumber)) {
    // 	return this.toastCustom("Door number must be exactly 10 digits.");
    //   }
    // }

    return true;
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
      this.showlistCarName = false;
      this.showlistfuelType = false;
      this.showlisttypeOfVehicle = false;
      this.showlistbodyShape = false;
      this.showlistprivateOrBusinessUse = false;
      this.showlistuse = false;
    }
  };
  handleOutsideClick3 = (event) => {
    const dataDropElement = this.template.querySelector(".Inputs1");
    const listsElement = this.template.querySelector(".lists");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlistCarName = false;
      this.showlistfuelType = false;
      this.showlisttypeOfVehicle = false;
      this.showlistbodyShape = false;
      this.showlistprivateOrBusinessUse = false;
      this.showlistuse = false;
    }
  };

  renderedCallback() {
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      document.addEventListener("click", this.handleOutsideClick3.bind(this));
      this.outsideClickHandlerAdded = true;
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
  }
  handleInsideClick(event) {
    event.stopPropagation();
  }

  handleSaveToServer(jsonInput, jsonStrings) {
    console.log(
      "register vehicle class data send",
      jsonInput,
      jsonStrings
    );
    // Make sure bigdata is not empty before calling the server
    registervehicle({ jsonInput: jsonInput, jsonStrings: jsonStrings })
      .then((result) => {
        this.showToasts(
          "Success",
          "Data has been successfully saved.",
          "success"
        );

        //just go to next page
        if (this.currentPage < this.totalPages) {
          this.currentPage += 1; // Increment the current page
          this.updateFormData(); // Update the form for the next page
        }

        this.lastPageNumberTillSavedToBackend += 1;
        console.log(
          "lastPageNumberTillSavedToBackend",
          this.lastPageNumberTillSavedToBackend
        );

        this.formBodyCss =
          this.currentPage >= this.lastPageNumberTillSavedToBackend
            ? "form-body"
            : "form-body disable-editing";

        //just space management u know
        this.imageDataToSendBack = null;
        this.certificateDataToSendBack = null;
        this.countOfUplaodedCertificate = 0;
        this.countOfUploadedImage = 0;
        this.firstUplaodedCertificateName = "";
        this.firstUploadedImageName = "";

        this.uploadText1 = "アップロード";
        this.uploadText2 = "アップロード";
        this.uploadDivCss1 = "input-field-img";
        this.uploadDivCss2 = "input-field-img";
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
        // Handle the error response
        console.error(
          "error by register vehicle class data send",
          jsonInput,
          jsonStrings
        );
        console.error("error by register vehicle class", error);
        this.showToasts("Error", error.body.message, "error");
        window.scrollTo(0, 0);
      });
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
}

import { LightningElement, wire, track, api } from "lwc";
import getVehicleById from "@salesforce/apex/CCP2_VehicleDetailController.getVehicleById";
import getVehicleCertificates from "@salesforce/apex/CCP2_VehicleDetailController.vehicleImageCountTitle";
import truckonnectLogo from "@salesforce/resourceUrl/CCP2_Truckonnect";
import CCP2_Resources from "@salesforce/resourceUrl/CCP2_Resources";
import CCP2_ScheduleRegistration from "@salesforce/label/c.CCP2_ScheduleRegistration";
import CCP2_ExpenseRegistration from "@salesforce/label/c.CCP2_ExpenseRegistration";
import CCP2_CarName from "@salesforce/label/c.CCP2_CarName";
import CCP2_CarModel from "@salesforce/label/c.CCP2_CarModel";
import CCP2_Maker from "@salesforce/label/c.CCP2_Maker";
import CCP2_Capacity from "@salesforce/label/c.CCP2_Capacity";
import CCP2_Displacement from "@salesforce/label/c.CCP2_Displacement";
import CCP2_Plate from "@salesforce/label/c.CCP2_Plate";
import CCP2_Year from "@salesforce/label/c.CCP2_Year";
import CCP2_Mileage from "@salesforce/label/c.CCP2_Mileage";
import CCP2_Edit from "@salesforce/label/c.CCP2_Edit";
import CCP2_Mark from "@salesforce/label/c.CCP2_Mark";
import CCP2_VehicleDetails from "@salesforce/label/c.CCP2_VehicleDetails";
import CCP2_MaintenanceList from "@salesforce/label/c.CCP2_MaintenanceList";
import CCP2_ExpenseManagement from "@salesforce/label/c.CCP2_ExpenseManagement";
import CCP2_ChassisInformation from "@salesforce/label/c.CCP2_ChassisInformation";
import CCP2_LoadingPlatformInformation from "@salesforce/label/c.CCP2_LoadingPlatformInformation";
import CCP2_PartsInformation from "@salesforce/label/c.CCP2_PartsInformation";
import CCP2_LeaseInformation from "@salesforce/label/c.CCP2_LeaseInformation";
import CCP2_CommonCarName from "@salesforce/label/c.CCP2_CommonCarName";
import CCP2_BodyColor from "@salesforce/label/c.CCP2_BodyColor";
import CCP2_ChassisNumber from "@salesforce/label/c.CCP2_ChassisNumber";
import CCP2_CurrentParkingSpot from "@salesforce/label/c.CCP2_CurrentParkingSpot";
import CCP2_NoxPMRegulations from "@salesforce/label/c.CCP2_NoxPMRegulations";
import CCP2_VehicleModel from "@salesforce/label/c.CCP2_VehicleModel";
import CCP2_LastVehicleInspectionDate from "@salesforce/label/c.CCP2_LastVehicleInspectionDate";
import CCP2_DeliveryDay from "@salesforce/label/c.CCP2_DeliveryDay";
import CCP2_DriversLicence from "@salesforce/label/c.CCP2_DriversLicence";
import CCP2_FirstYearRegistrationDate from "@salesforce/label/c.CCP2_FirstYearRegistrationDate";
import CCP2_BodyMaker from "@salesforce/label/c.CCP2_BodyMaker";
import CCP2_BodyInternalDimmension from "@salesforce/label/c.CCP2_BodyInternalDimmension";
import CCP2_BodyShape from "@salesforce/label/c.CCP2_BodyShape";
import CCP2_MaximumLoadingCapacity from "@salesforce/label/c.CCP2_MaximumLoadingCapacity";
import CCP2_BodyMounting from "@salesforce/label/c.CCP2_BodyMounting";
import CCP2_Download from "@salesforce/label/c.CCP2_Download";
import CCP2_Print from "@salesforce/label/c.CCP2_Print";

const editIcon = CCP2_Resources + "/CCP2_Resources/Vehicle/write.png";
const vehicleIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/delete-vehicle.png";
const downloadIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/file_download.png";

export default class Ccp2_VehicleDetails extends LightningElement {
  @track vehicleByIdLoader = true;
  @api vehicleId;
  @track showVehicleDetails = true;
  @track showCostManagement = false;
  @track showMaintainList = false;
  @track classVehicleDetails = "";
  @track classCostManagement = "";
  @track classMaintainList = "";
  editIcon = editIcon;
  vehicleIcon = vehicleIcon;
  downloadIcon = downloadIcon;
  isStarFilled = false;
  @track certificateTitleCount = "-";

  truckLogoUrl = truckonnectLogo;
  // @api showVehicle;
  @track vehicleByIdData = {
    id: 100,
    name: "-",
    type: "-",
    carBodyShape: "-",
    chassisNumber: "-",
    doorNumber: "-",
    firstRegistrationDate: "-",
    typeOfFuel: "-",
    mileage: "-",
    privateBusinessUse: "-",
    vehicleNumber: "-",
    affiliation: "-",
    vehicleInspectionCertificateIssueDate: "-",
    vehicleInspectionImage: "-",
    purpose: "-",
    model: "-",
    vehicleWeigth: "-",
    registerationNumber: "-"
  };

  label = {
    CCP2_ScheduleRegistration: CCP2_ScheduleRegistration,
    CCP2_ExpenseRegistration: CCP2_ExpenseRegistration,
    CCP2_CarName: CCP2_CarName,
    CCP2_CarModel: CCP2_CarModel,
    CCP2_Maker: CCP2_Maker,
    CCP2_Capacity: CCP2_Capacity,
    CCP2_Displacement: CCP2_Displacement,
    CCP2_Plate: CCP2_Plate,
    CCP2_Year: CCP2_Year,
    CCP2_Mileage: CCP2_Mileage,
    CCP2_Edit: CCP2_Edit,
    CCP2_Mark: CCP2_Mark,
    CCP2_VehicleDetails: CCP2_VehicleDetails,
    CCP2_MaintenanceList: CCP2_MaintenanceList,
    CCP2_ExpenseManagement: CCP2_ExpenseManagement,
    CCP2_ChassisInformation: CCP2_ChassisInformation,
    CCP2_LoadingPlatformInformation: CCP2_LoadingPlatformInformation,
    CCP2_PartsInformation: CCP2_PartsInformation,
    CCP2_LeaseInformation: CCP2_LeaseInformation,
    CCP2_CommonCarName: CCP2_CommonCarName,
    CCP2_BodyColor: CCP2_BodyColor,
    CCP2_ChassisNumber: CCP2_ChassisNumber,
    CCP2_CurrentParkingSpot: CCP2_CurrentParkingSpot,
    CCP2_NoxPMRegulations: CCP2_NoxPMRegulations,
    CCP2_VehicleModel: CCP2_VehicleModel,
    CCP2_LastVehicleInspectionDate: CCP2_LastVehicleInspectionDate,
    CCP2_DeliveryDay: CCP2_DeliveryDay,
    CCP2_DriversLicence: CCP2_DriversLicence,
    CCP2_FirstYearRegistrationDate: CCP2_FirstYearRegistrationDate,
    CCP2_BodyMaker: CCP2_BodyMaker,
    CCP2_BodyInternalDimmension: CCP2_BodyInternalDimmension,
    CCP2_BodyShape: CCP2_BodyShape,
    CCP2_MaximumLoadingCapacity: CCP2_MaximumLoadingCapacity,
    CCP2_BodyMounting: CCP2_BodyMounting,
    CCP2_Download: CCP2_Download,
    CCP2_Print: CCP2_Print
  };

  @wire(getVehicleById, { vehicleId: "$vehicleId" }) handledata({
    data,
    error
  }) {
    if (data) {
      console.log("geting from vehicle by Id: ", this.vehicleId);
      console.log("geting from vehicle by Id api: ", data);
      if (data.length !== 0) {
        let obj = {
          id: data[0].Id === undefined ? "-" : data[0].Id,
          name:
            data[0].Vehicle_Name__c === undefined
              ? "-"
              : data[0].Vehicle_Name__c,
          type:
            data[0].Vehicle_Type__c === undefined
              ? "-"
              : data[0].Vehicle_Type__c,
          carBodyShape:
            data[0].Body_Shape__c === undefined ? "-" : data[0].Body_Shape__c,
          chassisNumber:
            data[0].Chassis_number__c === undefined
              ? "-"
              : data[0].Chassis_number__c,
          doorNumber:
            data[0].Door_Number__c === undefined ? "-" : data[0].Door_Number__c,
          firstRegistrationDate:
            data[0].First_Registration_Date__c === undefined
              ? "-"
              : data[0].First_Registration_Date__c,
          typeOfFuel:
            data[0].Fuel_Type__c === undefined ? "-" : data[0].Fuel_Type__c,
          mileage: data[0].Mileage__c === undefined ? "-" : data[0].Mileage__c,
          privateBusinessUse:
            data[0].Private_Business_use__c === undefined
              ? "-"
              : data[0].Private_Business_use__c,
          vehicleNumber:
            data[0].Vehicle_Number__c === undefined
              ? "-"
              : data[0].Vehicle_Number__c,
          affiliation:
            data[0].affiliation === undefined ? "-" : data[0].affiliation,
          vehicleWeigth:
            data[0].vehicleWeight__c === undefined
              ? "-"
              : data[0].vehicleWeight__c,
          model:
            data[0].fullModel__c === undefined ? "-" : data[0].fullModel__c,
          purpose: data[0].Use__c === undefined ? "-" : data[0].Use__c,
          vehicleInspectionImage:
            data[0].vehicleInspectionImage === undefined
              ? "-"
              : data[0].vehicleInspectionImage,
          vehicleInspectionCertificateIssueDate:
            data[0].vehicleInspectionCertificateIssueDate === undefined
              ? "-"
              : data[0].vehicleInspectionCertificateIssueDate,
          registerationNumber:
            data[0].Registration_Number__c === undefined
              ? "-"
              : data[0].Registration_Number__c
        };
        console.log("object geting from vehicle by Id api: ", obj);
        this.vehicleByIdData = obj;

        this.fetchVehicleCertificates();
      }
    } else if (error) {
      // handle error
      console.error("geting from vehicle by Id api: ", error);
    }
  }
  // @wire(getVehicleCertificates, { vehicleId: "$vehicleId" }) handledata2({
  //   data,
  //   error
  // }) {
  //   if (data) {
  //     const lengthOfTitle = data.titles ? data.titles[0].length : 0;
  //     if (lengthOfTitle > 15) {
  //       this.certificateTitleCount = data.titles
  //         ? data.titles[0].substring(0, 15) + "...など" + data.count + "枚"
  //         : "-";
  //     } else {
  //       this.certificateTitleCount = data.titles
  //         ? data.titles[0] + "など" + data.count + "枚"
  //         : "-";
  //     }
  //     console.log("geting from vehicle Certificate api: ", data);
  //   } else if (error) {
  //     // handle error
  //     this.certificateTitleCount = "-";
  //     console.error("geting from vehicle Certificate api: ", error);
  //   }
  // }

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

        console.log("Fetching from vehicle Certificate API: ", data);
        this.vehicleByIdLoader = false;
      })
      .catch((error) => {
        this.certificateTitleCount = "-";
        console.error("Fetching from vehicle Certificate API: ", error);
        this.vehicleByIdLoader = false;
      });
  }

  dothis() {
    console.log("dothis function called");
  }

  showVehicleDetailFun() {
    this.showVehicleDetails = true;
    this.showMaintainList = false;
    this.showCostManagement = false;
    this.classVehicleDetails = "underline";
    this.classCostManagement = "";
    this.classMaintainList = "";
  }
  showCostManagementFun() {
    this.showVehicleDetails = false;
    this.showMaintainList = false;
    this.showCostManagement = true;
    this.classVehicleDetails = "";
    this.classCostManagement = "underline";
    this.classMaintainList = "";
  }
  showMaintainListFun() {
    this.showVehicleDetails = false;
    this.showMaintainList = true;
    this.showCostManagement = false;
    this.classVehicleDetails = "";
    this.classCostManagement = "";
    this.classMaintainList = "underline";
  }

  closeDetailPage() {
    this.dispatchEvent(new CustomEvent("back"));
  }

  get starIcon() {
    return this.isStarFilled ? "utility:favorite" : "utility:favorite_alt";
  }

  toggleStar() {
    this.isStarFilled = !this.isStarFilled;
  }

  // not in use
}

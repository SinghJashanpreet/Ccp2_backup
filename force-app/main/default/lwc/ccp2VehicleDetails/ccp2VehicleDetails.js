import { LightningElement, wire, track, api } from 'lwc';
import getVehicleById from '@salesforce/apex/CCP2_VehicleDetailController.getVehicleById';
import truckonnectLogo from '@salesforce/resourceUrl/CCP2_Truckonnect';
import CCP2_ScheduleRegistration from '@salesforce/label/c.CCP2_ScheduleRegistration';
import CCP2_ExpenseRegistration from '@salesforce/label/c.CCP2_ExpenseRegistration';
import CCP2_CarName from '@salesforce/label/c.CCP2_CarName';
import CCP2_CarModel from '@salesforce/label/c.CCP2_CarModel';
import CCP2_Maker from '@salesforce/label/c.CCP2_Maker';
import CCP2_Capacity from '@salesforce/label/c.CCP2_Capacity';
import CCP2_Displacement from '@salesforce/label/c.CCP2_Displacement';
import CCP2_Plate from '@salesforce/label/c.CCP2_Plate';
import CCP2_Year from '@salesforce/label/c.CCP2_Year';
import CCP2_Mileage from '@salesforce/label/c.CCP2_Mileage';
import CCP2_Edit from '@salesforce/label/c.CCP2_Edit';
import CCP2_Mark from '@salesforce/label/c.CCP2_Mark';
import CCP2_VehicleDetails from '@salesforce/label/c.CCP2_VehicleDetails';
import CCP2_MaintenanceList from '@salesforce/label/c.CCP2_MaintenanceList';
import CCP2_ExpenseManagement from '@salesforce/label/c.CCP2_ExpenseManagement';
import CCP2_ChassisInformation from '@salesforce/label/c.CCP2_ChassisInformation';
import CCP2_LoadingPlatformInformation from '@salesforce/label/c.CCP2_LoadingPlatformInformation';
import CCP2_PartsInformation from '@salesforce/label/c.CCP2_PartsInformation';
import CCP2_LeaseInformation from '@salesforce/label/c.CCP2_LeaseInformation';
import CCP2_CommonCarName from '@salesforce/label/c.CCP2_CommonCarName';
import CCP2_BodyColor from '@salesforce/label/c.CCP2_BodyColor';
import CCP2_ChassisNumber from '@salesforce/label/c.CCP2_ChassisNumber';
import CCP2_CurrentParkingSpot from '@salesforce/label/c.CCP2_CurrentParkingSpot';
import CCP2_NoxPMRegulations from '@salesforce/label/c.CCP2_NoxPMRegulations';
import CCP2_VehicleModel from '@salesforce/label/c.CCP2_VehicleModel';
import CCP2_LastVehicleInspectionDate from '@salesforce/label/c.CCP2_LastVehicleInspectionDate';
import CCP2_DeliveryDay from '@salesforce/label/c.CCP2_DeliveryDay';
import CCP2_DriversLicence from '@salesforce/label/c.CCP2_DriversLicence';
import CCP2_FirstYearRegistrationDate from '@salesforce/label/c.CCP2_FirstYearRegistrationDate';
import CCP2_BodyMaker from '@salesforce/label/c.CCP2_BodyMaker';
import CCP2_BodyInternalDimmension from '@salesforce/label/c.CCP2_BodyInternalDimmension';
import CCP2_BodyShape from '@salesforce/label/c.CCP2_BodyShape';
import CCP2_MaximumLoadingCapacity from '@salesforce/label/c.CCP2_MaximumLoadingCapacity';
import CCP2_BodyMounting from '@salesforce/label/c.CCP2_BodyMounting';
import CCP2_Download from '@salesforce/label/c.CCP2_Download';
import CCP2_Print from '@salesforce/label/c.CCP2_Print';

export default class Ccp2_vehicleDetails extends LightningElement {
    @track vehicleByIdLoader = true;
    @api vehicleId;
    @track showVehicleDetails = true
    @track showCostManagement = false
    @track showMaintainList = false
    @track classVehicleDetails = ''
    @track classCostManagement = ''
    @track classMaintainList = ''

    truckLogoUrl = truckonnectLogo;
    // @api showVehicle;
    @track vehicleByIdData = {
        id: 100,
        name: 100,
        vehicleBrand: 100,
        type: 100,
        registerYear: 100,
        mileage: 100,
        vinNumber: 100,
        carFormat: 100,
        lastDate: 100,
        bodymaker: 100,
        bodyShape: 100,
        initialDate: 100,
        initialRegistrationDate: 100
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


    @wire(getVehicleById, { vehicleId: '$vehicleId' }) handledata({ data, error }) {
        if (data) {
            console.log('geting from vehicle by Id api: ', data);
            if (data.length != 0) {
                let obj = {
                    id: data[0].Id == undefined ? 'null' : data[0].Id,
                    name: data[0].Name == undefined ? 'null' : data[0].Name,
                    vehicleBrand: data[0].vehicleBrandName__c == undefined ? 'null' : data[0].vehicleBrandName__c,
                    type: data[0].type__c == undefined ? 'null' : data[0].type__c,
                    registerYear: data[0].Registration_Year__c == undefined ? 'null' : data[0].Registration_Year__c,
                    mileage: data[0].mileage__c == undefined ? 'null' : data[0].mileage__c,
                    vinNumber: data[0].chassisNumberVIN__c == undefined ? 'null' : data[0].chassisNumberVIN__c,
                    carFormat: data[0].CarModelFormatName__c == undefined ? 'null' : data[0].CarModelFormatName__c,
                    lastDate: data[0].lastArrivalDateTime__c == undefined ? 'null' : data[0].lastArrivalDateTime__c,
                    bodymaker: data[0].BodyMakerNo__c == undefined ? 'null' : data[0].BodyMakerNo__c,
                    bodyShape: data[0].bodyShape__c == undefined ? 'null' : data[0].bodyShape__c,
                    initialDate: data[0].DatefronInitialRegistrationDate__c == undefined ? 'null' : data[0].DatefronInitialRegistrationDate__c,
                    initialRegistrationDate: data[0].initialRegistrationOfJapaneseCalender__c == undefined ? 'null' : data[0].initialRegistrationOfJapaneseCalender__c
                }
                console.log('object geting from vehicle by Id api: ', obj);
                this.vehicleByIdData = obj;
                this.vehicleByIdLoader = false;
            }
        } else if (error) {
            // handle error
            console.error('geting from vehicle by Id api: ', error)
        }
    }

    dothis() {
        console.log('dothis function called');
    }

    showVehicleDetailFun(){
        this.showVehicleDetails = true;
        this.showMaintainList = false;
        this.showCostManagement = false;
        this.classVehicleDetails = 'underline'
        this.classCostManagement = ''
        this.classMaintainList = ''
    }
    showCostManagementFun(){
        this.showVehicleDetails = false;
        this.showMaintainList = false;
        this.showCostManagement = true;
        this.classVehicleDetails = ''
        this.classCostManagement = 'underline'
        this.classMaintainList = ''
    }
    showMaintainListFun(){
        this.showVehicleDetails = false;
        this.showMaintainList = true;
        this.showCostManagement = false;
        this.classVehicleDetails = ''
        this.classCostManagement = ''
        this.classMaintainList = 'underline'
    }

    closeDetailPage() {
        this.dispatchEvent(new CustomEvent('back'));
    }
}
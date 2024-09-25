import { LightningElement, wire, track, api } from "lwc";
import getVehicleById from "@salesforce/apex/CCP2_VehicleDetailController.getVehicleById";
import getImagesAsBase64 from "@salesforce/apex/VehicleImageService.getImagesAsBase64";
import getMarketMeasureApi from "@salesforce/apex/ccp2_download_recall_controller.recallinfo";
import getTotalPageCountMarketMeasureApi from "@salesforce/apex/ccp2_download_recall_controller.recallPageCount";
import vehicleBranchName from "@salesforce/apex/CCP2_VehicleDetailController.vehicleBranchName";
import getVehicleCertificates from "@salesforce/apex/CCP2_VehicleDetailController.vehicleImageCountTitle";
import updateFavVehicleApi from "@salesforce/apex/CCP2_VehicleDetailController.updateFavVehicle";
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
  CCP2_Resources + "/CCP2_Resources/Vehicle/delete_vehicle.png";
const downloadIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/file_download.png";
const EmptyRecallDataIcon =
  CCP2_Resources + "/CCP2_Resources/Vehicle/Empty-recall.png";

export default class Ccp2_VehicleDetails extends LightningElement {
  @track vehicleByIdLoader = true;
  @track showEmptyContiner = false;
  // @track hasVehicles = true;
  @api vehicleIcons;
  @api vehicleId;
  @track showVehicleDetails = true;
  @track showCostManagement = false;
  @track showMaintainList = false;
  @track showvehDetails = true;
  @track showMaintainencePage = false;
  @track BranchesModal = false;
  @track morethanOneBranch = true;
  @track showone = true;
  @track classVehicleDetails = "underline-button-black";
  @track classMarketMeasure = "underline-button";
  @track classCostManagement = "";
  @track classMaintainList = "";
  @track vehId = "";
  @track uploadImageCss = "upload-image";
  @track currentDate = "";
  @track marketMeasureData = [];
  @track marketMeasureDataTem = [];
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
  @track currentImageIndex = 0;
  @track isLastPage = true;
  @track isFirstPage = true;
  @track totalPages = 1;
  @api currentChassisNumber;
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
  @track renovationSortForQuery = "";
  @track notificationSortForQuery = "";
  @track vehicleIdForQuery = this.vehicleId;
  @track finalQuery =
    `SELECT  ccp2_recallCategory__c, ccp2_implementationStatus__c, 
       notificationDate__c, renovationDate__c, controlNumber__c, recallSubject__c 
        FROM recallInfo__c `;

  @track innerContainerLoader = false;

  @track showNormalSortIcon1 = true;
  @track showDescSortIcon1 = false;
  @track showAscSortIcon1 = false;
  @track showNormalSortIcon2 = true;
  @track showDescSortIcon2 = false;
  @track showAscSortIcon2 = false;

  truckLogoUrl = truckonnectLogo;
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
    branch: "-",
    branchCount: "-",
    branchReal: "-",
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
    devileryDate: "-"
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

  updateFavVehicle(vehId, favBool, favIconName) {
    updateFavVehicleApi({ vehicleId: vehId, favVehicle: favBool })
      .then(() => {
        console.log("Vehicle Favourite icon updated!!");
        if (favIconName === "utility:favorite") {
          this.vehicleByIdData.Favourite = "utility:favorite_alt";
        } else {
          this.vehicleByIdData.Favourite = "utility:favorite";
        }
      })
      .catch((err) => {
        console.log("Vehicle Favourite icon updated!!", vehId, favBool);
        console.error(err);
      });
  }

  @wire(getVehicleById, { vehicleId: "$vehicleId" }) handledata({
    data,
    error
  }) {
    if (data) {
      console.log("geting from vehicle by Id: ", this.vehicleId);
      console.log("geting from vehicle by Id api: ", JSON.stringify(data));
      this.vehId = this.vehicleId;

      this.vehicelInfoId = data[0].Vehicle_Info_Id__c;
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
          Favourite: this.vehicleIcons,
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
              : this.formatJapaneseDate(data[0].First_Registration_Date__c), // Apply Japanese date formatting

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
              : this.formatJapaneseDate(
                  data[0].vehicleInspectionCertificateIssueDate
                ), // Apply Japanese date formatting
          registerationNumber:
            data[0].Registration_Number__c === undefined
              ? "-"
              : data[0].Registration_Number__c,
          expirationDate:
            data[0].Vehicle_Expiration_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate(data[0].Vehicle_Expiration_Date__c),
          devileryDate:
            data[0].Delivery_Date__c === undefined
              ? "-"
              : this.formatJapaneseDate(data[0].Delivery_Date__c)
        };
        console.log("object geting from vehicle by Id api: ", obj);
        this.vehicleByIdData = obj;
        this.currentChassisNumber =
          data[0].Chassis_number__c === undefined
            ? ""
            : data[0].Chassis_number__c;
        const vehicle = data[0];
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
          Door_Number__c: vehicle.Door_Number__c || ""
        };
        this.loadbranches();
        this.fetchVehicleCertificates();
      }
    } else if (error) {
      // handle error
      console.error("geting from vehicle by Id api: ", error);
    }
  }
  // @wire(getTotalPageCountMarketMeasureApi, { vehicleId: "$vehicleId" })
  // totalMarketCountFun({ data, error }) {
  //   if (data) {
  //     console.log("getTotalPageCountMarketMeasureApi: ", data);
  //     this.totalPageCount2 = data;
  //     this.updateVisiblePages();
  //   } else if (error) {
  //     console.error("getTotalPageCountMarketMeasureApi: ", error);
  //   }
  // }

  loadbranches() {
    vehicleBranchName({ vehicleId: this.vehicleId })
      .then((data) => {
        console.log("Getting Branch from vehicle by Id: ", this.vehicleId);
        console.log(
          "Getting Branch from vehicle by Id API: ",
          JSON.stringify(data)
        );

        this.vehId = this.vehicleId;
        if (data.length !== 0) {
          this.Branches = data;
          if (this.Branches.length == 1) {
            this.morethanOneBranch = false;
          }
          this.vehicleByIdData.branchReal = this.Branches[0].Name;
          this.Branches.forEach((branch) => {
            const branchNumberStr = branch.Branch_Code__c.toString(); // Convert branchno to string

            // Extract the first and last characters
            const firstDigit = branchNumberStr.charAt(0);
            const lastDigit = branchNumberStr.charAt(
              branchNumberStr.length - 1
            );

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
          });
          this.vehicleByIdData.branch =
            this.abbreviateName(this.Branches[0].Name) || "-";

          this.vehicleByIdData.branchCount = this.Branches.length;
          this.vehicleByIdData.OnScreenBranchCount =
            this.vehicleByIdData.branchCount - 1;
          this.Branches = data.map((branch) => ({
            ...branch,
            originalName: branch.Name,
            Name:
              branch.Name.length > 11
                ? `${branch.Name.slice(0, 7)}...`
                : branch.Name,
            originalMinicipalities: branch.Minicipalities__c,
            Minicipalities__c:
              branch.Minicipalities__c && branch.Minicipalities__c.length > 11
                ? `${branch.Minicipalities__c.slice(0, 7)}...`
                : branch.Minicipalities__c
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
          this.vehicleByIdData.branchCount = " ";
          this.morethanOneBranch = false;
          console.log("No branches found, setting branch to '-'.");
        }
      })
      .catch((error) => {
        console.error("Error getting Branch from vehicle by Id API: ", error);
      });
  }
  abbreviateName(name, maxLength = 11) {
    if (name && name.length > maxLength) {
      return `${name.slice(0, 5)}...`;
    }
    return name;
  }

  @track allCertificates = [];
  @track vehicleByIdLoader2 = false;

  @wire(getImagesAsBase64, { chassisNumber: "$currentChassisNumber" })
  handleImages({ data, error }) {
    console.log("Chassis Number for Image", this.currentChassisNumber);

    // Start loaders
    this.vehicleByIdLoader2 = true;
    this.vehicleByIdLoader3 = true;
    this.imagesAvailable = false;
    this.certificatesAvailable = false;

    if (data) {
      try {
        data = JSON.parse(data);
        console.log("Parsed Data", data);

        // Handle Images
        if (Array.isArray(data.Images) && data.Images.length > 0) {
          this.allImages = data.Images;
          this.totalPages = data.Images.length;
          console.log("Total Pages: ", this.totalPages);
          this.imagesAvailable = true; // Images are available
        } else {
          this.allImages = [];
          this.imagesAvailable = false; // No images available
        }

        // Handle Certificates
        if (Array.isArray(data.Certificates) && data.Certificates.length > 0) {
          this.allCertificates = data.Certificates;
          this.certificatesAvailable = true; // Certificates are available
        } else {
          this.allCertificates = [];
          this.certificatesAvailable = false; // No certificates available
        }
      } catch (e) {
        console.error("Error parsing data:", e);
        this.imagesAvailable = false;
        this.certificatesAvailable = false;
      } finally {
        this.vehicleByIdLoader2 = false; // Images loading complete
        this.vehicleByIdLoader3 = false; // Certificates loading complete
        this.isLastPage = this.currentImageIndex === this.totalPages - 1;
      }
    } else if (error) {
      // handle error
      this.imagesAvailable = false;
      this.certificatesAvailable = false;
      this.vehicleByIdLoader2 = false; // Images loading complete with error
      this.vehicleByIdLoader3 = false; // Certificates loading complete with error
      console.error(
        "Error getting data from vehicle by Chassis Number API: ",
        error
      );
    }
  }

  offsetOnMarketMeasure() {
    const itemsPerPage = 10;
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
    return `${day}-${month}-${year}`;
  }

  fetchMarketMeasureFun(query) {
    getMarketMeasureApi({ queryDetail: query })
      .then((data) => {
        try {
          console.log("getMarketData query", query, data);
          this.totalPageCount2 = Math.ceil(data.length / 10);
          this.marketMeasureDataTem = data.map((elm) => {
            return {
              Id: elm?.Id || "-",
              controlNumber__c: elm?.controlNumber__c || "-",
              implementationStatus__c: elm?.ccp2_implementationStatus__c || "-",
              notificationDate__c: elm?.notificationDate__c || "-",
              recallCategory__c: elm?.ccp2_recallCategory__c || "-",
              recallSubject__c: elm?.recallSubject__c || "-",
              renovationDate__c: elm?.renovationDate__c || "-",
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
        } catch (e) {
          console.log(this.finalQuery);
          console.error("Error getMarketData query:", e);
        }
      })
      .catch((err) => {
        console.log(this.finalQuery);
        console.error("getMarketData query", err);
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

  renderedCallback() {
    this.vehicleByIdData.Favourite = this.vehicleIcons;
    this.isLastPage = this.currentImageIndex === this.totalPages - 1;
    this.isFirstPage = this.currentImageIndex === 0;

    if (!this.outsideClickHandlerAdded) {
      console.log("in render if");
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      this.outsideClickHandlerAdded = true;
    }
    if (!this.outsideClickHandlerAdded) {
      console.log("in render if");
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      this.outsideClickHandlerAdded = true;
    }

    this.updatePageButtons();
  }

  connectedCallback() {
    this.isFirstPage = this.currentImageIndex === 0;
    document.addEventListener("click", this.handleOutsideClick);
    document.addEventListener("click", this.handleOutsideClick2);
    this.isLastPage = true;
    console.log(
      `%cThis is green text connected ${this.vehicleIcons}' , 'color: green;`
    );
    this.vehicleByIdData.Favourite = this.vehicleIcons;
    this.currentDate = this.getTodaysDate();
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
    document.removeEventListener("click", this.handleOutsideClick2.bind(this));
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
      });
  }

  dothis() {
    console.log("dothis function called");
  }

  showVehicleDetailFun() {
    this.showVehicleDetails = true;
    this.innerContainerLoader = false;
    this.showMaintainList = false;
    this.showCostManagement = false;
    this.showMarketMeasure = false;
    this.classVehicleDetails = "underline-button-black";
    this.classCostManagement = "";
    this.classMaintainList = "";
    this.classMarketMeasure = "underline-button";
  }
  showMarketMeasureFun() {
    this.updateFinalQuery();
    this.showVehicleDetails = false;
    this.showMaintainList = false;
    this.showCostManagement = false;
    this.classVehicleDetails = "underline-button";
    this.classMarketMeasure = "underline-button-black";
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
    this.showvehDetails = false;
    window.scrollTo(0, 0);
  }

  formatJapaneseDate(isoDate) {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
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
    return isoDate;
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

  handlebackhere() {
    console.log("calledbydev");
    this.showvehDetails = true;
    this.showMaintainencePage = false;
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
    let categoryFilter = this.categoryFilerListForQuery
      .map((category) => `'${category}'`)
      .join(", ");
    let implementationFilter = this.implementationStatusFilerListForQuery
      .map((category) => `'${category}'`)
      .join(", ");

    let orderByQuery = "";
    if (
      this.renovationSortForQuery !== "" &&
      this.notificationSortForQuery !== ""
    ) {
      orderByQuery = `ORDER BY renovationDate__c ${this.renovationSortForQuery}, notificationDate__c ${this.notificationSortForQuery}`;
    } else if (this.renovationSortForQuery !== "") {
      orderByQuery = `ORDER BY renovationDate__c ${this.renovationSortForQuery}`;
    } else if (this.notificationSortForQuery !== "") {
      orderByQuery = `ORDER BY notificationDate__c ${this.notificationSortForQuery}`;
    } else {
      orderByQuery = `ORDER BY CreatedDate DESC`;
    }

    let query = `SELECT ccp2_recallCategory__c, ccp2_implementationStatus__c, notificationDate__c, renovationDate__c, controlNumber__c, recallSubject__c
    FROM recallInfo__c where ccp2_recallCategory__c IN (${categoryFilter}) AND ccp2_implementationStatus__c IN (${implementationFilter}) AND crmVehicle__c = '${this.vehicelInfoId}' 
    ${orderByQuery}`;

    this.finalQuery = query;
    this.fetchMarketMeasureFun(query);
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
    setTimeout(() => {
      this.DownloadNameValue = `${this.currentDate} - カスタマーポータル車両リスト.csv`;
      this.ShowSuccessDownload = false;
    }, 2000);
  }
  downloadCSVAll() {
    // if (this.allVehiclesData.length === 0) {
    //   console.error("No data available to download");
    //   return;
    // }
    console.log("eorkdev");
    const vehiclesD = this.downloadvehicles;
    const branchesD = this.downloadbranch;

    const headers = [
      "車両番号",
      "登録番号",
      "車台番号",
      "交付年月日",
      "車名",
      "自動車の種別",
      "車体形状",
      "車両重量",
      "初度登録年月日",
      "有効期間の満了日",
      "走行距離",
      "燃料の種類",
      "自家用・事業用の別",
      "用途",
      "型式",
      "ドアナンバー",
      "所属"
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
      vehiclesD.Door_Number__c,
      allBranches
    ];

    csvContent += csvRow.join(",") + "\n";
    console.log("eorkdevn2");
    let BOM = "\uFEFF";
    console.log("eorkdevn3");
    csvContent = BOM + csvContent;
    console.log("eorkdev4");

    const csvBase64 = btoa(unescape(encodeURIComponent(csvContent)));
    console.log("eorkdev5");
    const link = document.createElement("a");
    console.log("eorkdev6");
    link.href = "data:text/csv;base64," + csvBase64;
    console.log("eorkdev7");
    link.download = `${this.DownloadNameValue}.csv`;
    console.log("eorkdev8");
    link.click();
    console.log("eorkdev9");
    window.URL.revokeObjectURL(link.href);
    console.log("eorkdev10");
    link.remove();
    console.log("eorkdev11");
  }
}

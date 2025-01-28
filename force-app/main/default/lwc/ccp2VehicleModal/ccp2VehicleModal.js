import { LightningElement, track } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import labelsVehicle from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

const ManualIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Manual_Reg.png";
const CSVIcon = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/CSV_Reg.png";
const ElecIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Electronic_Reg.png";
const AddIcon = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/AddIcons.png";

export default class Ccp2VehicleModal extends LightningElement {
  @track Languagei18n = "jp";
  @track isLanguageChangeDone = true;
  @track showVehicleModal = true;
  @track showManualRegistration = false;
  @track optVehicles = [];
  @track originaloptveh = [];
  @track searchResults = [];
  @track showlist = false;

  @track inputs = [
    {
      id: 1,
      part1: "",
      part2: "",
      chassisNumber: "",
      validInput: true,
      showlist: false
    }
  ];
  @track registeredVehicles = [];
  @track vehicleInfo = [];
  @track fullModal = true;

  @track searchdisenable = "searchbuttoninput btn";
  @track input1there = true;
  @track inputthere = false;
  //next nav
  @track RegVehicle = false;
  @track VehicleInfo = false;
  @track Bothcase = false;
  @track nodata = false;
  @track Results = false;
  @track showregvehicle = false;
  @track filteredregisteredChassis = [];
  @track showsure = false;
  @track suretoclose = false;

  fuseInitialized = false;
  fuse;

  //Images
  ManualRegImg = ManualIcon;
  CSVRegImg = CSVIcon;
  ElecRegImg = ElecIcon;
  addButton = AddIcon;

  vehicleRegistrationUrl;

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
          lwcName: "ccp2VehicleModal",
          errorLog: err,
          methodName: "Load Language"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }


  connectedCallback() {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      this.vehicleRegistrationUrl =
        baseUrl.split("/s/")[0] + "/s/vehicle-registration";
    }
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
        ErrorLog({
          lwcName: "ccp2VehicleModal",
          errorLog: err,
          methodName: "Load Labels"
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
    console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === "en_US") {
      console.log("working1");
      return "en";
    } 
      return "jp";
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
    }
    document.addEventListener("click", this.handleOutsideClick);
  }

 
  onClose() {
    const closeEvent = new CustomEvent("closemodal");
    this.dispatchEvent(closeEvent);
  }

  openVehicleRegistration() {
    window.location.href = this.vehicleRegistrationUrl;
  }
}
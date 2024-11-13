import { LightningElement,api, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import SERVICE_TYPE_FIELD from '@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Type__c';
import SERVICE_FACTORY_FIELD from '@salesforce/schema/CCP2_Maintenance_Booking__c.Service_Factory__c';
import CloseButtonImg from '@salesforce/resourceUrl/CloseButton';
import Vehicle_StaticResource from '@salesforce/resourceUrl/CCP2_Resources';
import getVehicleById from "@salesforce/apex/CCP2_VehicleDetailController.getVehicleById";
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";


const  step1img = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/vehStep1.png';
const  step2img = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/vehStep2.png';
const  step3img = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/vehStep3.png';
const  step4img = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/vehStep4.png';
const  dropdownImg = Vehicle_StaticResource + '/CCP2_Resources/Common/arrow_under.png';
const  poster1 = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Poster-Image-1.png';
const  poster2 = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Poster-Image-2.png';
const component1Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp1.png';
const component2Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp2.png';
const component3Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp3.png';
const component4Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp4.png';
const component5Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp5.png';
const component6Image = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/Comp6.png';
const FusoLogoBefore = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/logo-poster-before.png';
const FusoLogoAfter = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/logo-poster-after.png';
import labelsVehicle from '@salesforce/resourceUrl/ccp2_labels';
import i18nextStaticResource from '@salesforce/resourceUrl/i18next';

export default class Ccp2VehicleMaintainenceForm extends LightningElement {
      @track Languagei18n = '';
  @track isLanguageChangeDone = true;
    @api vehId;
    @track showlistPlaceOfImplementation = false;
    @track selectedPicklistPlaceofImplementation = '';
    @track showlistScheduleType = false;
    @track selectedPicklistScheduleType= '';
    @track showCancelModal = false;
    @track mainTemplate = true;
    @track Step1 = true;
    @track step2 = false;
     @track step3 = false;
     @track step4 = false;
     @track showKm = false
     @track maintainencedetail = true;
     outsideClickHandlerAdded = false;
     VehicleMaintainceStep1 = step1img;
     VehicleMaintainceStep2 = step2img;
     VehicleMaintainceStep3 = step3img;
     VehicleMaintainceStep4 = step4img;
     dropdown = dropdownImg;
     poster1 = poster1;
     poster2 = poster2;
     logobefore = FusoLogoBefore;
     logoafter = FusoLogoAfter;
     FusoShop = "https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja&scope=openid&response_type=code&ui_locales=ja";
      // FusoShop = "https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://shop.mitsubishi-fuso.com/mftbc/ja&scope=openid&response_type=code&ui_locales=ja";
    
     branchError = false;
     branchErrorText;
     @track showerrorbranch = false;
     @track showerrorbranchNull = false;
     @track showerrorScheduleType = false;
     @track buttonActive = false;
     @track showPoster1 = false;
     @track showPoster2 = false;
     @track serviceTypeOptions = []; 
     @track serviceFactoryOptions = []; 

     vehicleImages = [
        {code:'オイルフィルター', name: '602', imageUrl: component1Image},
        {code:'エアフィルター', name: '601', imageUrl: component2Image},
        {code:'燃料フィルター', name: '603', imageUrl: component3Image},
        {code:'ワイパーブレード', name: '840a', imageUrl: component4Image},
        {code:'ワイパーゴム', name: '840b', imageUrl: component5Image},
        {code:'ベルト', name: '571', imageUrl: component6Image}
     ];

     @track vehicleByIdData = {
        
        id: 10,
        name: "-",
        type: "-",
        accountName: "-",
        chassisnumber:"-",
        siebelAccountCode:"-",
      
        mileage: "-",
        vehicleNumber: "-",

        vehicleInspectionCertificateIssueDate: "-",
   
        vehicleWeigth: "-",
        VehicleInspectionCertificateExpirationDate: "-",
        registrationNumber: "-"
      };
    


    CloseButton = CloseButtonImg;


   connectedCallback(){
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    // document.addEventListener('click', this.handleOutsideClick);
    this.template.host.style.setProperty(
        "--dropdown-icon",
        `url(${this.dropdown})`
      );
      this.shouldShowListNew();
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
    .then(response => response.json())
    .then(data => {
        const userLocale = this.getLocale(); // Method to determine user locale (e.g., 'en', 'jp')
        
        // Initialize i18next with the fetched labels
        i18next.init({
            lng: userLocale,
            resources: {
                [userLocale]: {
                    translation: data[userLocale]
                }
            }
        }).then(() => {
            this.labels2 = i18next.store.data[userLocale].translation;
            console.log("Delete Detail User Locale: ", userLocale);
            console.log("Delete Detail User Labels: ", this.labels2);
        });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
      });

}
getLocale() {
    console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === 'en_US'){
      console.log("working1");
      return "en";
    }
    else{
      console.log("working2");
      return "jp";
    }
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
        });
}

    @wire(getPicklistValues, { recordTypeId: "012000000000000AAA",fieldApiName: SERVICE_TYPE_FIELD })
    wiredServiceTypePicklist({ data, error }) {
        if (data) {
            this.serviceTypeOptions = data.values.map(item => {
                return { label: item.label, value: item.value };
            });
            console.log("l1",this.serviceTypeOptions);
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getPicklistValues, {recordTypeId: "012000000000000AAA", fieldApiName: SERVICE_FACTORY_FIELD })
    wiredServiceFactoryPicklist({ data, error }) {
        if (data) {
            this.serviceFactoryOptions = data.values.map(item => {
                return { label: item.label, value: item.value };
            });
            console.log("l2",this.serviceFactoryOptions);
        } else if (error) {
            console.error(error);
        }
    }


   goback(){
    this.maintainencedetail = false;
    window.scrollTo(0,0);
   }

 renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
    this.loadLanguage();
    }
    // Attach click event to close dropdown on outside click
    if (!this.handleOutsideClickBound) {
        this.handleOutsideClickBound = this.handleOutsideClick.bind(this);
        document.addEventListener('click', this.handleOutsideClickBound);
    }
}

   disconnectedCallback() {
    if (this.handleOutsideClickBound) {
        document.removeEventListener('click', this.handleOutsideClickBound);
        this.handleOutsideClickBound = null;
    }
}
 

   // Toggle dropdown visibility
   handlePlaceofImplementationChange(event) {
    this.showerrorbranchNull = false; // Clear error when dropdown is opened

    event.stopPropagation();

       this.showlistPlaceOfImplementation = !this.showlistPlaceOfImplementation;
       this.showlistScheduleType = false;
   }

   // Handle picklist item selection
   handlePickListChange(event) {
       const selectedValue = event.target.dataset.idd;
       this.selectedPicklistPlaceofImplementation = selectedValue;
    //    console.log("val2",this.selectedPicklistPlaceofImplementation);
       this.showlistPlaceOfImplementation = false;
    //    console.log("a213");
       this.shouldShowListNew();
   }

   // Handle clicks outside the dropdown to close it
   handleInsideClick(event) {
       // Prevent closing if clicking inside the dropdown
    //    if (event.target.closest('.listPlaceOfImplemenation')) return;
    //    this.showlistPlaceOfImplementation = false;
    event.stopPropagation();
   }

// Toggle dropdown visibility
handleScheduleTypeChange(event) {
    this.showerrorScheduleType = false; // Clear error when dropdown is opened

    event.stopPropagation();
    this.showlistScheduleType = !this.showlistScheduleType;
    this.showlistPlaceOfImplementation = false;
}
shouldShowListNew() {
    if (this.selectedPicklistScheduleType && this.selectedPicklistPlaceofImplementation) {
        this.buttonActive = true;
    } else {
        this.buttonActive = false;
    }
    return this.buttonActive;

}

// Handle picklist item selection
handlePickListChange2(event) {
    const selectedValue = event.target.dataset.idd;
    this.selectedPicklistScheduleType = selectedValue;
    this.showlistScheduleType = false; 
    this.shouldShowListNew();
}

handleInsideClick(event) {
    event.stopPropagation();
}
showCancelModalFunction(){
    this.showCancelModal = true;
}
handleNo(){
    this.mainTemplate = true;
    this.showCancelModal = false;


}

// GoToStep2(){
//     const branchInput = this.template.querySelector('input[name="PlaceOfImplementation"]');
//     const scheduleTypeInput = this.template.querySelector('input[name="ScheduleType"]');
//     this.showerrorScheduleType = false;
//     this.showerrorbranchNull = false;
   
// if (!scheduleTypeInput.value && !branchInput.value ) {
//         branchInput.classList.add('invalid-input'); // Add error styling

//     scheduleTypeInput.classList.add('invalid-input'); // Add error styling
//       this.showerrorScheduleType = true;  // Show error message for schedule type input
//       this.showerrorbranchNull = true; 
//           window.scrollTo(0, 0);  // Scroll to the top if needed
//     isValid = false;  // Set isValid to false
// } else {
//     branchInput.classList.remove('invalid-input');  // Remove error styling if valid
//     this.showerrorbranchNull = false;  // Hide error message for branch input
//     scheduleTypeInput.classList.remove('invalid-input');  // Remove error styling if valid
//     this.showerrorScheduleType = false;  // Hide error message for schedule type input
// }
   
//     // Proceed to step 2 if there are no errors
//     this.step2 = true;
//     this.Step1 = false;
// }
GoToStep2() {
    this.step2 = true;
    this.Step1 = false;
    window.scrollTo(0,0);
}

GoBackToStep1(){
    this.Step1 = true;
    this.step2 = false;
    window.scrollTo(0,0);
}
showToast(title, message, variant) {
    const event = new ShowToastEvent({
        title: title,
        message: message,
        variant: variant // 'success', 'error', 'info', 'warning'
    });
    this.dispatchEvent(event);
}
GoToStep3(){
    this.step3= true;
    this.step2 = false;
    window.scrollTo(0,0);
}
GoBackToStep2(){
    this.step3 = false;
    this.step2 = true;
    this.step1 = false;
    window.scrollTo(0,0);
}
GoToStep4(){
     sessionStorage.removeItem("ongoingTransaction");
    this.createMaintenanceBooking();
}
lastcall(){
    this.step3 = false;
    this.step2 = false;
    this.step1 = false;
    if(this.selectedPicklistScheduleType === '一般整備'){
        this.showPoster1 = true;
    }else{
        this.showPoster2 = true;
    }
    this.step4 = true;
    window.scrollTo(0,0);
}

@wire(getVehicleById, { vehicleId: '$vehId' })
    handleData({ data, error }) {
        if (data) {
            console.log('Fetching vehicle by Id:', this.vehId);
            console.log('Vehicle data:', data);

            const vehicle = data[0] || {};

            this.vehicleByIdData = {
                id: vehicle.Id || '-',
                name: vehicle.Vehicle_Name__c || '-',
                type: vehicle.Vehicle_Type__c || '-',
                accountName:vehicle.Account__r.Name,
                chassisnumber:vehicle.Chassis_number__c,
                siebelAccountCode:vehicle.Account__r.siebelAccountCode__c,

                typeOfFuel: vehicle.Fuel_Type__c || '-',
                mileage: vehicle.Mileage__c || '-',
               
                vehicleNumber: vehicle.Vehicle_Number__c || '-',
                VehicleInspectionCertificateExpirationDate: this.formatJapaneseDate(vehicle.Vehicle_Expiration_Date__c) || '-',           
                vehicleInspectionCertificateIssueDate: vehicle.vehicleInspectionCertificateIssueDate || '-',
                registrationNumber: vehicle.Registration_Number__c || '-'
            };
            if(this.vehicleByIdData.mileage !== null && this.vehicleByIdData.mileage !== '-'){
                this.showKm = true;
            }

            console.log('Updated vehicle data:', this.vehicleByIdData);
        } else if (error) {
            console.error('Error fetching vehicle data:', error);
        }
    }
 
    handleOutsideClick(event) {
        const isClickInside = this.template.querySelector('.Combox-input-wr').contains(event.target);
        if (!isClickInside) {
            this.showlistPlaceOfImplementation = false;
            this.showlistScheduleType = false;
        }
    }
 

    // handleOutsideClick = (event) => {
    //     const dataDropElement = this.template.querySelector('.InputsScheduleType');
    //     const listsElement = this.template.querySelector('.listScheduleType');

    //     if (
    //         dataDropElement &&
    //         !dataDropElement.contains(event.target) &&
    //         listsElement &&
    //         !listsElement.contains(event.target)
    //     ) {
    //         this.showlistScheduleType = false;
    //         this.showlistPlaceOfImplementation = false;
    //         console.log("Clicked outside");
    //     }
    // };

    // handleInsideClick(event) {
    //     event.stopPropagation();
    // }
   
    // renderedCallback() {
    //     if (!this.outsideClickHandlerAdded) {
    //         document.addEventListener('click', this.handleOutsideClick);
    //         this.outsideClickHandlerAdded = true;
    //     }
    // }

    // disconnectedCallback() {
    //     document.removeEventListener('click', this.handleOutsideClick);
    // }
    handleYes(){
        this.showCancelModal = false;
      
    }
    onClose(){
        console.log("goback");
        this.dispatchEvent(new CustomEvent("back"));
        console.log("goback2");
    }
    openlink(){
        window.open(this.FusoShop, '_blank');
    }
    handleImageClick(event) {
        const VinNumber = this.vehicleByIdData.chassisnumber;
        const SiebelCode= this.vehicleByIdData.siebelAccountCode;
        const imageName = event.currentTarget.dataset.name || event.target.closest('.overlay').dataset.name;
        const stateData = {
            hinmoku: imageName,
            chassisNumber: VinNumber,
            customerID: SiebelCode
        };
        const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja/hinmoku-search`;
        const scope = `&scope=openid offline_access 4d21e801-db95-498f-8cc5-1363af53d834&response_type=code`;
        //const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://shop.mitsubishi-fuso.com/mftbc/ja/Open-Catalogue/c/1`;
        const stateString = encodeURIComponent(JSON.stringify(stateData));
        console.log(stateString);
        const url = `${baseUrl}&state=${stateString}${scope}`;
        console.log("urldev",url);
        window.open(url, '_blank');
    }
    formatJapaneseDate(isoDate) {
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
    }
    //creating record in the backend
    createMaintenanceBooking() {
        const fields = {};
        fields['Vehicle__c'] = this.vehId;
        fields['Service_Type__c'] = this.selectedPicklistScheduleType;
        fields['Service_Factory__c'] = this.selectedPicklistPlaceofImplementation;
        // console.log("dec",fields);

        const recordInput = { apiName: 'CCP2_Maintenance_Booking__c', fields };

        createRecord(recordInput)
            .then((record) => {
               console.log("successfully done",record);
              this.lastcall();
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    }
  }
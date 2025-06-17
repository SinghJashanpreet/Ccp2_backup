import { LightningElement, track, wire } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import accData from "@salesforce/apex/CCP2_Additional_Services.getAccountDetails";
import allAccosiatedAcc from "@salesforce/apex/CCP2_Additional_Services.getAllAssociatedAccounts";
import createInvoice from "@salesforce/apex/CCP2_Additional_Services.createInvoiceGroup";
import getLatestTermsUrls from '@salesforce/apex/CCP_RegisterAdminUserCtrl.getLatestTermsUrls';


const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const einv =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Inovice-illustration.webp";
const dtfsa =
  Vehicle_StaticResource + "/CCP2_Resources/Common/dtfsa-illustration.webp";
const vehicle =
  Vehicle_StaticResource + "/CCP2_Resources/Common/vehicle-illustration.webp";
const EmptyRecallDataIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Empty-recall.png";
export default class Ccp2_applicationServices extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  einv = einv;
  vehicle = vehicle;
  dtfsa = dtfsa;
  EmptyRecallDataIcon = EmptyRecallDataIcon

  @track accType = '';
  @track siebelCode = "";
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  @track isDtfsa = false;
  @track isEinv = false;
  @track isVeh = false;

  @track invmain = true;
  @track step1inv = false;
  @track step2inv = false;
  @track step3inv = false;

  @track vehmain = true;
  @track step1veh = false;

  @track dtfsamain = true;
  @track step1dtfsa = false;
  @track step2dtfsa = false;
  @track step3dtfsa = false;

  @track isChecked1 = false;
  @track isCheckeddtfsa = false;

  @track termsUrls = {}; 

  @track regNumPlaceName = '';
  @track regNumClassificationNumber = '';
  @track regNumHiragana = '';
  @track regNumSerialNumber = '';
  @track registrationNumber = '';

  @track regNumPlaceNameError = '';
  @track regNumClassificationNumberError = '';
  @track regNumHiraganaError = '';
  @track regNumSerialNumberError = '';

  @track regNumPlaceNamecssclass = 'regNumPlaceNamecss';
  @track regNumClassificationNumbercssclass = 'regNumClassificationNumbercss';
  @track regNumHiraganacssclass = 'regNumHiraganacss';
  @track regNumSerialNumberclass = 'regNumSerialNumbercss';

  @track isAccmodal = false;

  @track accounts = [];

  @wire(accData)
  wiredAccData({ error, data }) {
    if (data) {
      console.log("data", data);
      this.siebelCode = data.siebelAccountCode__c;
    }else{
      console.error("error in siebel code",error);
    }
  }

  @wire(allAccosiatedAcc)
  handleAccountsData({data,error}){
    if(data){
      console.log("dataa",data);
      this.accounts = data.map((acc) => ({
        Id: acc.Id,
        customName: acc?.Name || '-',
        customNum: acc?.siebelAccountCode__c  || '-',
        Address: ((acc?.ShippingPostalCode ?? '')+ '\u00A0\u00A0' + (acc.ShippingAddress?.state ?? '') + '' +(acc.ShippingAddress?.city ?? '') + '' +(acc.ShippingAddress?.street ?? '')).trim(),
        canApply: acc.HasInvoiceGroup || false,
        isChecked: false
      }));
      console.log("this.accounts",JSON.stringify(this.accounts));
    }else{
      console.error("error in wire",error);
    }
  }

  loadLanguage() {
    Languagei18n() // Assuming getLanguageI18n is the apex method that fetches the language.
      .then((data) => {
        this.Languagei18n = data;
        return this.loadI18nextLibrary(); // Return the promise for chaining
      })
      .then(() => {
        return this.loadLabels(); // Load labels after i18next is ready
      })
      .then(() => {
        // Check language change status
      })
      .catch((error) => {
        console.error("Error loading language or labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "Load Language",
          ViewName: "Vehicle Maintainence",
          InterfaceName: "CCP User Interface",
          EventName: "Data update",
          ModuleName: "VehicleMaintenance"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
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
    fetch(`${labelsUser}/labelsAdditionalServ.json`)
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
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_MaintainHistory",
          errorLog: err,
          methodName: "Load Labels",
          ViewName: "Vehicle Maintainence",
          InterfaceName: "CCP User Interface",
          EventName: "Data fetch",
          ModuleName: "VehicleMaintenance"
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
    } 
      return "jp";
  }

  fetchTermsUrls() {
    getLatestTermsUrls()
        .then(data => {
            console.log("Latest Terms Data:", JSON.stringify(data));

            this.termsUrls = {
                CCP: {
                    id: data?.CCP?.Id || null,
                    url: `/resource/${data?.CCP?.pdf_Url}` || null
                },
                DTFSA: {
                    id: data?.DTFSA?.Id || null,
                    url: `/resource/${data?.DTFSA?.pdf_Url}` || null
                },
                EInvoice: {
                    id: data?.["E-Invoice"]?.Id || null,
                    url: `/resource/${data?.["E-Invoice"]?.pdf_Url}` || null
                }
            };

            console.log("Processed Terms Data:", JSON.stringify(this.termsUrls));
        })
        .catch(error => {
            console.error('Error fetching Latest Terms Data:', error);
        });
  }

  createInvoice(accids,type,regNum){
    createInvoice({ accIds: accids,permissionName: type,regNum: regNum })
    .then((result) => {
      console.log("in result",result, "accids", accids, 'type', type, 'regNum', regNum);
    })
    .catch((error) => {
      console.error('Error creating invoice:', error, "accids", accids, 'type', type, 'regNum', regNum);
    })
  }

  connectedCallback(){
    const urlParamInstance = new URLSearchParams(window.location.search).get(
      "instance"
    );

    if(urlParamInstance === 'e-invoice'){
      this.isEinv = true;
      this.isVeh = false;
      this.isDtfsa = false;
    }else if(urlParamInstance === 'dtfsa'){
      this.isEinv = false;
      this.isVeh = false;
      this.isDtfsa = true;
    }else{
      this.isEinv = false;
      this.isVeh = true;
      this.isDtfsa = false;
    }
    this.fetchTermsUrls();

  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      this.loadLanguage();
    }
  }

  handlestep1inv() {
    this.step1inv = true;
    this.invmain = false;
    window.scrollTo(0,0);
  }

  handlebackstep1inv() {
    this.accids = [];
    this.accounts = this.accounts.map(acc => { 
      return {
        ...acc,
        isChecked: false
      };
    });
    this.isChecked1 = false;
    this.step1inv = false;
    this.invmain = true;
    window.scrollTo(0,0);
  }

  handlestep2inv(){
    this.step2inv = true;
    this.step1inv = false;
    window.scrollTo(0,0);
  }

  handleCheckboxChange1(event) {
    this.isChecked1 = event.target.checked;
    console.log("this.ischecked",this.isChecked1)
  }

  get checkedInv(){
    return !this.isChecked1;
  }

  handlestep3inv(event) {
    const selectedIds = this.accids.map(acc => acc.id);
    this.accType = event.target.dataset.type;
    console.log("idssss",selectedIds);
    console.log("idssss typeee",this.accType);
    this.createInvoice(selectedIds,this.accType,this.registrationNumber);
    this.step2inv = false;
    this.step3inv = true;
    window.scrollTo(0,0);
  }

  handlebackstep2inv() {
    this.step2inv = false;
    this.step1inv = true;
    window.scrollTo(0,0);
  }

  navigateToHome() {
    let baseUrl = window.location.href;
    let homeUrl;
    if (baseUrl.indexOf("/s/") != -1) {
      homeUrl = baseUrl.split("/s/")[0];
    }
    window.location.href = homeUrl;
  }

  navigateInquiry(){
    let baseUrl = window.location.href;
    let homeUrl;
    if (baseUrl.indexOf("/s/") != -1) {
      homeUrl = baseUrl.split("/s/")[0];
    }
    window.location.href = homeUrl + "/s/inquiry";
  }

  handlestep1veh(){
    this.vehmain = false;
    this.step1veh = true;
    this.createInvoice(this.accids,'Vehicle',this.registrationNumber);
    window.scrollTo(0,0);
  }

  handlenextstep1dtfsa(){
    window.scrollTo(0,0);
    this.dtfsamain = false;
    this.step1dtfsa = true;
  }

  handleInputChange(event) {
    const field = event.target.dataset.id;
    const value = event.target.value;

    switch (field) {
      case 'regNumPlaceName':
          this.regNumPlaceName = value;
          break;
      case 'regNumClassificationNumber':
          this.regNumClassificationNumber = value;
          break;
      case 'regNumHiragana':
          this.regNumHiragana = value;
          break;
      case 'regNumSerialNumber':
          this.regNumSerialNumber = value;
          break;
      default:
          break;
    }
  }

  @track hasError = false;
  @track finalError = '';

  handlestep2dtfsa() {
    const onlyAlphanumeric  = /^[a-zA-Z0-9]*$/; // 半角英数字のみのバリデーション用正規表現
    const specialCharacters = /[-!@#$%^&*()_+={}[\]:;"'<>,.?/\\|`~]/;

    // Reset error messages first
    this.regNumPlaceNameError = '';
    this.regNumClassificationNumberError = '';
    this.regNumHiraganaError = '';
    this.regNumSerialNumberError = '';
    this.finalError = '';

    this.hasError = false;

    if (specialCharacters.test(this.regNumPlaceName)) {
        this.regNumPlaceNameError = '入力内容に誤りがあります。内容をご確認ください。';
        this.regNumPlaceNamecssclass = 'regNumPlaceNamecss error-div';
        this.hasError = true;
        window.scrollTo(0,0);
    }else{
      this.regNumPlaceNamecssclass = 'regNumPlaceNamecss';
      this.regNumPlaceNameError = '';
    }

    if (!onlyAlphanumeric.test(this.regNumClassificationNumber)) {
        this.regNumClassificationNumberError = '入力内容に誤りがあります。内容をご確認ください。';
        this.regNumClassificationNumbercssclass = 'regNumClassificationNumbercss error-div';
        this.hasError = true;
        window.scrollTo(0,0);
    }else{
      this.regNumClassificationNumbercssclass = 'regNumClassificationNumbercss';
      this.regNumPlaceNameError = '';
    }

    if (specialCharacters.test(this.regNumHiragana)) {
        this.regNumHiraganaError = '入力内容に誤りがあります。内容をご確認ください。';
        this.regNumHiraganacssclass = 'regNumHiraganacss error-div'
        this.hasError = true;
        window.scrollTo(0,0);
    }else{
      this.regNumHiraganacssclass = 'regNumHiraganacss'
      this.regNumPlaceNameError = '';
    }

    if (!onlyAlphanumeric.test(this.regNumSerialNumber)) {
        this.regNumSerialNumberError = '入力内容に誤りがあります。内容をご確認ください。';
        this.regNumSerialNumberclass = 'regNumSerialNumbercss error-div';
        this.hasError = true;
        window.scrollTo(0,0);
    }else{
      this.regNumSerialNumberclass = 'regNumSerialNumbercss';
      this.regNumPlaceNameError = '';
    }

    // Only proceed to next step if there are no errors
    if (!this.hasError) {
        this.registrationNumber = this.regNumPlaceName + this.regNumClassificationNumber + this.regNumHiragana + this.regNumSerialNumber;
        this.step1dtfsa = false;
        this.step2dtfsa = true;
    }
    else{
      this.finalError = '入力内容に誤りがあります。内容をご確認ください。';
      window.scrollTo(0,0);
    }
  }

  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    console.log("before", value, " - length", value.length);
    if (value.length > maxLength) {
      event.target.blur();
    }
  }

  handleCheckboxChangedtfsa(event){
      this.isCheckeddtfsa = event.target.checked;
  }

  get nextdtfsa(){
    return !this.isCheckeddtfsa || (!this.regNumPlaceName || !this.regNumClassificationNumber || !this.regNumHiragana || !this.regNumSerialNumber);
  }

  handlebackstep1dtfsa(){
    window.scrollTo(0,0);
    this.step1dtfsa = false;
    this.dtfsamain = true;
    this.isCheckeddtfsa = false;
    this.regNumSerialNumber = '';
    this.regNumHiragana = '';
    this.regNumClassificationNumber = '';
    this.regNumPlaceName = '';
    this.finalError = '';
    this.hasError = false;
    this.regNumPlaceNameError = '';
    this.regNumClassificationNumberError = '';
    this.regNumHiraganaError = '';
    this.regNumSerialNumberError = '';
    this.regNumPlaceNamecssclass = 'regNumPlaceNamecss';
    this.regNumClassificationNumbercssclass = 'regNumClassificationNumbercss';
    this.regNumHiraganacssclass = 'regNumHiraganacss';
    this.regNumSerialNumberclass = 'regNumSerialNumbercss';
    this.registrationNumber = ''
  }

  handlebackstep2dtfsa(){
    this.step2dtfsa = false;
    this.step1dtfsa = true;
    window.scrollTo(0,0);
  }

  handlestep3dtfsa(event){
    this.accType = event.target.dataset.type;
    this.step2dtfsa = false;
    this.step3dtfsa = true;
    this.createInvoice(this.accids,this.accType,this.registrationNumber);
    console.log("accids TYPEEE DTFSAAAA",this.accids,this.accType,this.registrationNumber);
    window.scrollTo(0,0);
  }

  handleAccModal(){
    this.isAccmodal = true;
  }

  @track accids = [];
  handleAccountselection(event){
    const isChecked = event.target.checked;
    const accId = event.target.dataset.id;
    this.accounts = this.accounts.map(acc => {
    if (acc.Id === accId) {
      return { ...acc, isChecked: isChecked };
    }
    return acc;
    });
  }



handleFinalaccs(event) {
  this.accids = this.accounts
    .filter(acc => acc.isChecked)
    .map(acc => {
      return {
        id: acc.Id,
        siebel: acc.customNum
      }
    });
    this.isAccmodal = false;
    console.log('Selected Accounts:', JSON.stringify(this.accids));
  // Use accids as needed
  }

  handlecancelAcc(){
    this.isAccmodal = false;
    const selectedIds = this.accids.map(acc => acc.id);

    this.accounts = this.accounts.map(acc => {
      return {
        ...acc,
        isChecked: selectedIds.includes(acc.id)
      };
    });
  }

  get accLen(){
    return this.accounts.length;
  }

  get showAcc(){
    return this.accids.length;
  }

  get accSel(){
    return  !this.accounts.find((elm) => elm.isChecked === true);
  }
  
  handleremoveAcc(event){
     const idd = event.target.dataset.id;
    this.accids = this.accids.filter(acc => acc.id !== idd);
 
    this.accounts = this.accounts.map(acc => {
      let isCheck = acc.Id === idd ? false : acc.isChecked;
 
      return {
        ...acc,
        isChecked: isCheck
      };
    });
  }

  handleCloseNo(){
    this.isAccmodal = false;
  }

}
import { LightningElement, track, wire } from 'lwc';
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getBasicInfo from "@salesforce/apex/CCP2_userController.userBasicInfo";
import { getRecord } from "lightning/uiRecordApi";
import CONTACT_ID_FIELD from "@salesforce/schema/User.ContactId";
import Id from "@salesforce/user/Id";
import getbranchdetails from "@salesforce/apex/CCP2_userData.UnAssociatedBranch";
import updateUser from "@salesforce/apex/CCP2_userController.updateRecords"
import getUsers from "@salesforce/apex/CCP2_userController.adminUser";
import oldnewadmin from "@salesforce/apex/CCP2_userController.createAdmin";
import assignpermset from "@salesforce/apex/CCP2_userController.createAdminPermission";

import checkUserEmail from "@salesforce/apex/CCP_AddUserCtrl.checkUserEmail";
import { ShowToastEvent } from "lightning/platformShowToastEvent";


import branchContactAdd from "@salesforce/apex/CCP2_userController.branchContactAdd";
import branchContactDelete from "@salesforce/apex/CCP2_userController.branchContactDelete";
import branchdetails from "@salesforce/apex/CCP2_userData.userBranchDtl";


import labelsBasic from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import checkManagerUser from "@salesforce/apex/CCP_HeaderController.checkManagerUser";
import getUserAllServicesList from "@salesforce/apex/CCP2_userController.uiPermissionList";
import CCP2_Notification_Days_Upper_Limit from "@salesforce/label/c.CCP2_Notification_Days_Upper_Limit";
import CCP2_Notification_Days_Lower_Limit from "@salesforce/label/c.CCP2_Notification_Days_Lower_Limit";



const truck1 = Vehicle_StaticResource + "/CCP2_Resources/User/truckImg1.webp";
const truck2 = Vehicle_StaticResource + "/CCP2_Resources/User/truckImg2.webp";
const truck3 = Vehicle_StaticResource + "/CCP2_Resources/User/truckImg3.webp";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const arrowicon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";

export default class Ccp2_newStruct extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  contactId;
  userId = Id;

  showchangeAdmin = false;
  showBasicinfo = true;
  showconfModal = false;
  showstep1 = false;
  showstep3 = false;
  @track showlist = false;
  @track deletedBranchIds = [];
  @track originalUserList = [];
  @track emailError = false;
  @track isformvalid = true;
  @track ErrorText = "";
  @track emailerrorText = "";
  @track cellPhoneErrorText = "";
  @track telephoneErrorText = "";
  @track Fnameerror = "";
  @track Lnameerror = "";
  @track Fkanaerror = "";
  @track Lkanaerror = "";
  @track BranchesArray = [];
  @track initialmail = "";
  @track allBranchesData = {
    firstbranch: "",
    firstbranchreal: "",
    onscreenbranchcount: 0,
  };
  @track brcount;
  @track morethanonebranch = false;

  truckpic1 = truck1;
  truckpic2 = truck2;
  truckpic3 = truck3;
  @track branchData = [];
  @track branch = [];
  // @track allUserLoader = false;
  @track showcancelModaledit = false;
  @track showstep2 = false;
  @track showcanceledit = false;
  @track showagreeModal = false;
  @track showeditscreen = false;
  @track showcancelModal = false;
  @track agreeChange = false;
  @track fullwidthnum = false;
  @track isDropdownOpen = false;
  @track selectedValue = "";
  @track selectedId = "";
  @track userList = [];
  @track branchoptions = [];
  @track formDataArray = [];
  selectedUserId = "";
  userconselectId = "";
  @track formData = {};
  @track userInfo = {
    id: null,
    firstName: null,
    lastName: null,
    firstNameKana: null,
    lastNameKana: null,
    email: null,
    accountname: null,
    siebelAccountCode: null,
    MobilePhone: null,
    Department: null,
    Employee_Code: null,
    Phone: null,
    firstNameKana__c: null,
    lastNameKana__c: null,
    Title: null,
    EmployeeCode: null
  };
  @track error;
  @track branchfromjunction = [];
  @track originalbranchfromjunction = [];
  @track newusershow = false;
  selectedContactId;
  contactData;
  @track workdayStart = "";
  @track startwork = "";
  @track endwork = "";
  @track startholiday = "";
  @track endholiday = "";
  @track workdayEnd = "";
  @track holidayStart = "";
  @track holidayEnd = "";

  @track Languagei18n = "";
  @track isLanguageChangeDone = true;

  @track showModal = false;
  @track searchTerm = "";
  @track placeholdershow = true;
  refreshTokenInt = 0;
  refreshTokenInt2 = 10;
  imgdrop = arrowicon;
  contactClassFirstName = "";
  workError = "";
  contactholidayend = "";
  contactholidaystart = "";
  contactworkdayend = "";
  contactworkdaystart = "";
  contactClassBranch = "Inputs12 icon";
  contactClassRecordInput = "";
  contactClassRecordRadio = "records-notif-input";
  contactClassSelectedDate = "dropdown-header-date icon2";
  contactClassLastName = "";
  contactClassFKanaName = "";
  contactClassLKanaName = "";
  contactClassEmail = "";
  contactClassTelephone = "";
  contactClassCellPhone = "";

  @track InputFirstName = "";
  @track InputLastName = "";
  @track InputFKanaName = "";
  @track InputLKanaName = "";
  @track InputEmail = "";
  @track InputTelephone = "";
  @track InputCellPhone = "";
  @track InputEmpCode = "";
  @track InputDepartment = "";
  @track InputPost = "";
  @track dropdownStartOpen = false;
  @track dropdownStartOpenholi = false;
  @track dropdownEndOpen = false;
  @track dropdownEndOpenholi = false;

  workdayStartOptions = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
  workdayEndOptions = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
  holidayStartOptions = Array.from({ length: 24 }, (_, i) => i);
  holidayEndOptions = Array.from({ length: 24 }, (_, i) => i);

  userDetailData = {
    id: null,
    firstName: null,
    lastName: null,
    firstNameKana: null,
    lastNameKana: null,
    email: null,
    accountname: null,
    siebelAccountCode: null,
    MobilePhone: null,
    Department: null,
    Employee_Code: null,
    Phone: null,
    firstNameKana__c: null,
    lastNameKana__c: null,
    Title: null,
    EmployeeCode: null
  };

  //generaluser
  @track generalUser = false;
  @track servicesArray = [];


  //notification offff
  @track notifiOff = true;
  @track lowerNotiflimit = Number(CCP2_Notification_Days_Lower_Limit);
  @track upperNotiflimit = Number(CCP2_Notification_Days_Upper_Limit);
  @track inputNumVal = CCP2_Notification_Days_Lower_Limit;
  @track numerrorVal = "";
  @track notificationDateSelection = "";
  @track notificationDateSelectiontoDisp = "";
  @track isNotifDropdownOpen = false;
  @track selectedNotifDate = "";
  @track selectedNotifDatetoDisp = "";
  @track isNotifOnorOff = "";
  @track isNotifError = false;
  
  @track showServiceModal = false;
  
  @track isNotifOnorOffinv = "";
  @track isNotifOnorOffdtfsa = "";
  @track notifiOffinv = false;
  @track notifiOffdtfsa = false;


  @track services = [
    { id: 0, label: 'service A' },
    { id: 1, label: 'service B' },
    { id: 2, label: 'service C' },
    { id: 3, label: 'service D' }
  ];

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
      })
      .catch((error) => {
        console.error("Error loading language or labels: ", error);
        ErrorLog({
          lwcName: "ccp_UserProfile",
          errorLog: error,
          methodName: "Languagei18n",
          ViewName: "Basic Information",
          InterfaceName: "Salesforce",
          EventName: "Load language",
          ModuleName: "Basic information"
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
    fetch(`${labelsBasic}/labelsBasicInfo.json`)
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
          lwcName: "ccp2_UserProfile",
          errorLog: err,
          methodName: "Load Labels",
          ViewName: "Basic Information",
          InterfaceName: "Salesforce",
          EventName: "Load labels",
          ModuleName: "Basic information"
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

  get styleOfEinvoiceContainer(){
    if(this.isVehicleService)
      return 'border-radius: 0px; border-top: 1px solid var(--Gray-line, #d9d9d9); padding: 16px 16px;'
    
     return 'border-radius: 0px; padding: 16px 16px;'
  }
  get styleOfEinvoiceContainer2(){
    if(this.isVehicleService)
      return 'border-radius: 0px; border-top: 1px solid var(--Gray-line, #d9d9d9);'
    
     return 'border-radius: 0px;'
  }
  get styleOfDtfsaContainer(){
    if(this.isEinvoicePermission || this.isVehicleService)
      return 'border-radius: 0px; border-top: 1px solid var(--Gray-line, #d9d9d9);'
    
     return 'border-radius: 0px;'
  }
  get styleOfDtfsaContainer2(){
    if(this.isEinvoicePermission || this.isVehicleService)
      return 'border-radius: 0px; border-top: 1px solid var(--Gray-line, #d9d9d9); padding: 16px 16px; padding-bottom: 0;'
    
     return 'border-radius: 0px; padding: 16px 16px; padding-bottom: 0;'
  }

  get isVehicleService(){
    return this.servicesArray.includes("車両管理");
  }

  connectedCallback() {
    this.checkManagerUser();
    // this.originalUserList = [...this.userList];
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.imgdrop})`
    );
  }

  handleOutsideClicknotif = (event) => {
    const dataDropElement = this.template.querySelector(".dropdown-list-date");

    if (dataDropElement && !dataDropElement.contains(event.target)) {
      this.isNotifDropdownOpen = false;
    }
  };

  handleOutsideClick = (event) => {
    const dataDropElement = this.template.querySelector(".dataDrop");
    const listsElement = this.template.querySelector(".lists");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlist = false;
    }
    if (!this.template.querySelector(".dropdown").contains(event.target)) {
      this.isDropdownOpen = false;
      document.removeEventListener("click", this.handleOutsideClick);
    }
  };

  handleOutsideClick2 = (event) => {
    // Check if the click was inside the dropdown, using `this.template.contains`
    if (!this.template.contains(event.target)) {
      this.dropdownStartOpen = false;
      this.dropdownEndOpen = false;
    }
    if (!this.template.contains(event.target)) {
      this.dropdownStartOpenholi = false;
      this.dropdownEndOpenholi = false;
    }
  };

  @wire(getUsers)
  Unassouser({ data, error }) {
    if (data) {
      this.userList = data.map((Contact) => {
        return { label: Contact.Name, value: Contact.Id };
      });
      this.originalUserList = [...this.userList];
    } else if (error) {
      console.error("error,unassociated user", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_UserProfile",
        errorLog: err,
        methodName: "unassouser"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @wire(getRecord, {
    recordId: "$userId",
    fields: [CONTACT_ID_FIELD]
  })
  userRecord({ error, data }) {
    if (data) {
      this.contactId = data.fields.ContactId.value;
    } else if (error) {
      console.error("Error fetching user record:", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_UserProfile",
        errorLog: err,
        methodName: "userRecord",
        ViewName: "Basic Information",
        InterfaceName: "Salesforce",
        EventName: "Fetching contact id og logged in user",
        ModuleName: "Basic information"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @wire(getBasicInfo, { ContactId: "$contactId", refresh: "$refreshTokenInt" })
  fetUserInfo({ data, error }) {
    if (data) {
      console.log("data of basicinfo", data);
      this.userDetailData = {
        accountname: data.AccountName == null ? "-" : data.AccountName,
        firstName: data.FirstName == null ? "-" : data.FirstName,
        lastName: data.LastName == null ? "-" : data.LastName,
        firstNameKana: data.FirstNameKana == null ? "-" : data.FirstNameKana,
        lastNameKana: data.LastNameKana == null ? "-" : data.LastNameKana,
        siebelAccountCode:
          data.AccountSiebelAccountCode == null
            ? "未登録"
            : data.AccountSiebelAccountCode,
        id: data.Id == null ? "-" : data.Id,
        email: data.Email == null ? "-" : data.Email,
        Abbemail: data.Email == null ? "-" : data.Email.length > 16 ? data.Email.substring(0, 16) + "..."
          : data.Email,
        MobilePhone: data.MobilePhone == null ? "-" : data.MobilePhone,
        Department: data.Department == null ? "-" : data.Department,
        Employee_Code: data.EmployeeCode == null ? "-" : data.EmployeeCode,
        Phone: data.Phone == null ? "-" : data.Phone,
        Title: data.Title == null ? "-" : data.Title,
        Branchs: data.BranchNames.length > 0 ? data.BranchNames : ["-"],
        Branchs2: data.BranchNames.length > 0 ? data.BranchNames : ["-"],
        isNotifOnorOff: data.CCP2_Notification_Toggle__c == null ? "オフ" : data.CCP2_Notification_Toggle__c,//オン
        eInvoiceEmail: data.eInvoiceEmail == null ? "オフ" : data.eInvoiceEmail === true ? 'オン' : 'オフ',
        LeaseEmail: data.LeaseEmail == null ? "オフ" : data.LeaseEmail === true ? 'オン' : 'オフ',
        notificationDateSelection: data.CCP2_Notification_Option__c == null ? "" : data.CCP2_Notification_Option__c,
        inputNumVal: data.CCP2_Notify_Exp_Duration__c == null ? this.lowerNotiflimit : data.CCP2_Notify_Exp_Duration__c,
        selectedNotifDate: data.CCP2_Notify_Selected_Date__c == null ? "" : data.CCP2_Notify_Selected_Date__c
      };

      // notifiOffdtfsa notifiOffinv

      this.notifiOffinv = data.eInvoiceEmail == null ? true : data.eInvoiceEmail === true ? false : true;
      this.notifiOffdtfsa = data.LeaseEmail == null ? true : data.LeaseEmail === true ? false : true;


      if (this.userDetailData.Branchs.length > 0) {
        this.allBranchesData = {
          firstbranch: this.userDetailData.Branchs[0].Name, // Display name
          firstbranchreal: this.userDetailData.Branchs[0].Name, // Tooltip title
          onscreenbranchcount: this.userDetailData.Branchs.length - 1
        };

        this.morethanonebranch = this.userDetailData.Branchs.length > 1;
        this.BranchesArray = JSON.parse(JSON.stringify(data.BranchNames));;
        console.log("BranchesArray", JSON.stringify(this.BranchesArray));
        this.BranchesArray.forEach((branch) => {
          if (branch.Branch_Code__c) {
            let prefix = "";
            if (branch.Branch_Code__c !== undefined && branch.Branch_Code__c !== null) {
              if (branch.Branch_Code__c >= 0 && branch.Branch_Code__c <= 9) {
                prefix = "00";
              } else if (branch.Branch_Code__c >= 10 && branch.Branch_Code__c <= 99) {
                prefix = "0";
              } else {
                prefix = " ";
              }
            }
            branch.Branch_Code__c = prefix + branch.Branch_Code__c;
            if (branch.Account__r && branch.Account__r.siebelAccountCode__c) {
              branch.Account__r.siebelAccountCode__c = branch.Account__r.siebelAccountCode__c || "未登録";
            } else {
              branch.Account__r.siebelAccountCode__c = "未登録"; // Assign default value if missing
            }
          } else {
            // Handle case where Branch_Code__c is missing or not a valid number
            this.showone = false; // or any other logic you'd like
          }
        });

      }
      // the time field return the milliseconds so the time need divided by 3600000
      this.isNotifOnorOff = data.CCP2_Notification_Toggle__c == null ? "" : data.CCP2_Notification_Toggle__c;
      this.notificationDateSelection = data.CCP2_Notification_Option__c == null ? "" : data.CCP2_Notification_Option__c;
      this.selectedNotifDate = data.CCP2_Notify_Selected_Date__c == null ? "" : data.CCP2_Notify_Selected_Date__c;
      this.inputNumVal = data.CCP2_Notify_Exp_Duration__c == null ? this.lowerNotiflimit : data.CCP2_Notify_Exp_Duration__c;

      if (this.selectedNotifDate == "1") {
        this.selectedNotifDatetoDisp = "毎月1日";
      }
      if (this.selectedNotifDate == "15") {
        this.selectedNotifDatetoDisp = "毎月15日";
      }
      if (this.isNotifOnorOff === "オン") {
        this.notifiOff = false;
      } else {
        this.notifiOff = true;
      }

      if (this.notificationDateSelection === "NotifySelectedDate") {
        this.notificationDateSelectiontoDisp = "特定の日に該当の車両をまとめて通知する";
      } else {
        this.notificationDateSelectiontoDisp = "各車両ごとに通知する";
      }
      this.workdayStart =
        data.MostLikelyWeekdayStartTimesForAppoint == null
          ? ""
          : this.getTime(data.MostLikelyWeekdayStartTimesForAppoint);
      this.startwork =
        data.MostLikelyWeekdayStartTimesForAppoint == null
          ? "-"
          : this.getTime(data.MostLikelyWeekdayStartTimesForAppoint);
      this.workdayEnd =
        data.MostLikelyWeekdayEndTimesForAppoint == null
          ? ""
          : this.getTime(data.MostLikelyWeekdayEndTimesForAppoint);
      this.endwork =
        data.MostLikelyWeekdayEndTimesForAppoint == null
          ? "-"
          : this.getTime(data.MostLikelyWeekdayEndTimesForAppoint);

      this.holidayStart =
        data.MostLikelyHolidayStartTimesForAppoint == null
          ? ""
          : this.getTime(data.MostLikelyHolidayStartTimesForAppoint);
      this.startholiday =
        data.MostLikelyHolidayStartTimesForAppoint == null
          ? "-"
          : this.getTime(data.MostLikelyHolidayStartTimesForAppoint);
      this.holidayEnd =
        data.MostLikelyHolidayEndTimesForAppoint == null
          ? ""
          : this.getTime(data.MostLikelyHolidayEndTimesForAppoint);
      this.endholiday =
        data.MostLikelyHolidayEndTimesForAppoint == null
          ? "-"
          : this.getTime(data.MostLikelyHolidayEndTimesForAppoint);
      this.InputFirstName = data.FirstName == null ? "" : data.FirstName;
      this.InputLastName = data.LastName == null ? "" : data.LastName;
      this.InputFKanaName =
        data.FirstNameKana == null ? "" : data.FirstNameKana;
      this.InputLKanaName = data.LastNameKana == null ? "" : data.LastNameKana;
      this.InputDepartment = data.Department == null ? "" : data.Department;
      this.InputEmail = data.Email == null ? "" : data.Email;
      this.initialmail = data.Email == null ? "" : data.Email;
      this.InputEmpCode = data.EmployeeCode == null ? "" : data.EmployeeCode;
      this.InputCellPhone = data.MobilePhone == null ? "" : data.MobilePhone;
      this.InputPost = data.Title == null ? "" : data.Title;
      this.InputTelephone = data.Phone == null ? "" : data.Phone;
      if (this.InputCellPhone === "-") {
        this.InputCellPhone = "";
      }
      if (this.InputTelephone === "-") {
        this.InputTelephone = "";
      }
      if (this.InputEmpCode === "-") {
        this.InputEmpCode = "";
      }
      if (this.InputDepartment === "-") {
        this.InputDepartment = "";
      }
      if (this.InputPost === "-") {
        this.InputPost = "";
      }
    } else if (error) {
      console.error("error,userrrsss", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_UserProfile",
        errorLog: err,
        methodName: "fetUserInfo",
        ViewName: "Basic Information",
        InterfaceName: "Salesforce",
        EventName: "Fetching user information",
        ModuleName: "Basic information"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @track isDtfsaPermission = true;
  @track isEinvoicePermission = true;


  @wire(getUserAllServicesList, { userId: '$userId', refresh: '$refreshTokenInt' })
  servicesFun({ data, error }) {
    if (data) {
      const serviceOrder = [
        "車両管理",
        "部整月次請求書（電子版）",
        "FUSOリース",
      ];

      this.servicesArray = serviceOrder.filter((service) =>
        data.find((item) => item === service)
      );

      if(data.includes("FUSOリース"))
        this.isDtfsaPermission = true;
      else 
        this.isDtfsaPermission = false;

      if(data.includes("部整月次請求書（電子版）"))
        this.isEinvoicePermission = true;
      else 
        this.isEinvoicePermission = false;



    } else {
      console.error("services error", error);
    }
  }

  @wire(getbranchdetails, { contactId: "$contactId" }) wiredBranches({
    data,
    error
  }) {
    if (data) {
      this.branchoptions = data.map((vehicle) => {
        return { label: vehicle.Name, value: vehicle.Id };
      });
    } else if (error) {
      console.error(error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_UserProfile",
        errorLog: err,
        methodName: "getBranchDetails",
        ViewName: "Basic Information",
        InterfaceName: "Salesforce",
        EventName: "Fetching branch details",
        ModuleName: "Basic information"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }


  @wire(branchdetails, {
    User: "$contactId",
    refresh: "$refreshTokenInt2"
  })
  wiredbranches2({ data, error }) {
    if (data) {
      this.originalbranchfromjunction = data.map((branch) => ({
        Name: branch.Name,
        Id: branch.Id
      }));
      this.branchfromjunction = data.map((branch) => ({
        Name: branch.Name,
        Id: branch.Id
      }));
    } else {
      console.error("error in fetching branches from new", error);
    }
  }


  fetchUserInfo() {
    if (this.selectedUserId) {
      getBasicInfo({ ContactId: this.selectedUserId })
        .then((result) => {
          this.userInfo = {
            accountname: result.AccountName == null ? "-" : result.AccountName,
            firstName: result.FirstName == null ? "-" : result.FirstName,
            lastName: result.LastName == null ? "-" : result.LastName,
            firstNameKana:
              result.FirstNameKana == null ? "-" : result.FirstNameKana,
            lastNameKana:
              result.LastNameKana == null ? "-" : result.LastNameKana,
            siebelAccountCode:
              result.AccountSiebelAccountCode == null
                ? "未登録"
                : result.AccountSiebelAccountCode,
            id: result.Id == null ? "-" : result.Id,
            email: result.Email == null ? "-" : result.Email,
            MobilePhone: result.MobilePhone == null ? "-" : result.MobilePhone,
            Department: result.Department == null ? "-" : result.Department,
            Employee_Code:
              result.EmployeeCode == null ? "-" : result.EmployeeCode,
            Phone: result.Phone == null ? "-" : result.Phone,
            Title: result.Title == null ? "-" : result.Title,
            Branchs: result.BranchNames.length > 0 ? result.BranchNames : ["-"]
            // Branchs: result.BranchNames == undefined ? [{Name:'-'}] : result.BranchNames
          };
          this.error = undefined;
        })
        .catch((error) => {
          this.error = error;
          ErrorLog({
            lwcName: "ccp_UserProfile",
            errorLog: error,
            methodName: "fetchUserInfo",
            ViewName: "Basic Information",
            InterfaceName: "Salesforce",
            EventName: "Fetching user information",
            ModuleName: "Basic information"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
          console.error("error in selected user", error);
          this.userInfo = undefined;
        });
    }
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      this.loadLanguage();
    }
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      this.outsideClickHandlerAdded = true;
    }
    if (!this.outsideClickHandlerAdded2) {
      document.addEventListener("click", this.handleOutsideClicknotif.bind(this));
      this.outsideClickHandlerAdded2 = true;
    }
    if (!this.outsideClickHandlerAdded3) {
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      this.outsideClickHandlerAdded3 = true;
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
    document.removeEventListener("click", this.handleOutsideClick2);
    document.removeEventListener("click", this.handleOutsideClicknotif);
  }

  @track branchesModal = false;
  @track showone = false;
  branchopen() {
    this.branchesModal = true;
  }
  branchClose() {
    this.branchesModal = false;
  }

  getTime(timeValue) {
    let time;
    if (timeValue != null) {
      if (timeValue / 3600000 < 10) {
        time = "0" + timeValue / 3600000;
      } else {
        time = (timeValue / 3600000).toString();
      }
    } else {
      time = null;
    }
    return time;
  }

  checkManagerUser() {
    checkManagerUser()
      .then((result) => {
        this.showcanceledit = result;
      })
      .catch((error) => {
        ErrorLog({
          lwcName: "ccp_UserProfile",
          errorLog: error,
          methodName: "checkManagerUser",
          ViewName: "Basic Information",
          InterfaceName: "Salesforce",
          EventName: "Check manager user",
          ModuleName: "Basic information"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
        this.errors = JSON.stringify(error);
        console.error("checkManagerUser errors:" + JSON.stringify(error));
      });
  }


  get notificationBlock() {
    return this.isNotifOnorOff === "オン";
  }
  get notificationMessage() {
    return `車検満了日まで${this.inputNumVal}日以内となった場合に通知する`;
  }

  get notificationOption() {
    return this.notificationDateSelectiontoDisp === "特定の日に該当の車両をまとめて通知する"
  }

  get selectedNotifdate() {
    return `毎月${this.selectedNotifDate}日に該当の車両をまとめて通知する`
  }

  get isNotifyWhenExpSelected() {
    return this.notificationDateSelection === 'NotifyWhenExp';
  }

  get isNotifySelectedDateSelected() {
    return this.notificationDateSelection === 'NotifySelectedDate';
  }

  handleEdit() {
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    ongoingTransactions.ProfileEditTxn = true;

    sessionStorage.setItem(
      "ongoingTransaction",
      JSON.stringify(ongoingTransactions)
    );

    // this.close();
    this.branch = [];
    this.deletedBranchIds = [];
    this.showeditscreen = true;
    // if(this.workdayStart == '-'){
    //   this.workdayStart = '';
    //   console.log("inside work day",this.workdayStart);
    // }
    // if(this.workdayEnd == '-'){
    //   this.workdayEnd = '';
    // }
    // if(this.holidayStart == '-'){
    //   this.holidayStart = '';
    // }
    // if(this.holidayEnd == '-'){
    //   this.holidayEnd = '';
    // }
    this.refreshTokenInt = ++this.refreshTokenInt;
    this.showBasicinfo = false;
  }

  get workdayStartDisplay() {
    return this.workdayStart !== "" ? this.workdayStart : "";
  }

  get workdayEndDisplay() {
    return this.workdayEnd !== "" ? this.workdayEnd : "";
  }

  get holidayStartDisplay() {
    return this.holidayStart !== "" ? this.holidayStart : "";
  }

  get holidayEndDisplay() {
    return this.holidayEnd !== "" ? this.holidayEnd : "";
  }

  get dropdownStartClass() {
    return this.dropdownStartOpen
      ? "dropdown-open dropdown-div"
      : "dropdown-close";
  }

  get dropdownStartClassholi() {
    return this.dropdownStartOpenholi
      ? "dropdown-open dropdown-div"
      : "dropdown-close";
  }


  toggleDropdownStart(event) {
    this.dropdownStartOpen = !this.dropdownStartOpen;
    this.dropdownEndOpen = false;
    this.dropdownEndOpenholi = false;
    this.dropdownStartOpenholi = false;
    event.stopPropagation();
  }

  toggleDropdownStartholi(event) {
    this.dropdownStartOpenholi = !this.dropdownStartOpen;
    this.dropdownEndOpenholi = false;
    this.dropdownStartOpen = false;
    this.dropdownEndOpen = false;
    event.stopPropagation();
  }

  toggleDropdownEndholi(event) {
    this.dropdownEndOpenholi = !this.dropdownEndOpenholi;
    this.dropdownStartOpenholi = false;
    this.dropdownEndOpen = false;
    this.dropdownStartOpen = false;
    event.stopPropagation();
  }

  toggleDropdownEnd(event) {
    this.dropdownEndOpen = !this.dropdownEndOpen;
    this.dropdownStartOpen = false;
    this.dropdownStartOpenholi = false;
    this.dropdownEndOpenholi = false;
    event.stopPropagation();
  }

  get dropdownEndClass() {
    return this.dropdownEndOpen
      ? "dropdown-open dropdown-div"
      : "dropdown-close";
  }
  get dropdownEndClassholi() {
    return this.dropdownEndOpenholi
      ? "dropdown-open dropdown-div"
      : "dropdown-close";
  }

  handleWorkdayStartChange(event) {
    const selectedValue = event.target.dataset.value;
    this.workdayStart = parseInt(selectedValue, 10);
    this.dropdownStartOpen = false;
    this.saveTimeValue("平日s", selectedValue);
  }

  handleHolidayStartChange(event) {
    const selectedValue = event.target.dataset.value;
    this.holidayStart = parseInt(selectedValue, 10);
    this.dropdownStartOpenholi = false;
    this.saveTimeValue("土日祝s", selectedValue);
  }

  handleHolidayEndChange(event) {
    const selectedValue = event.target.dataset.value;
    this.holidayEnd = parseInt(selectedValue, 10);
    this.dropdownEndOpenholi = false;
    this.saveTimeValue("土日祝e", selectedValue);
  }
  handleWorkdayEndChange(event) {
    const selectedValue = event.target.dataset.value;
    this.workdayEnd = parseInt(selectedValue, 10);
    this.dropdownEndOpen = false;
    this.saveTimeValue("平日e", selectedValue);
  }

  saveTimeValue(field, value) {
    let milliseconds = parseFloat(value) * 60 * 60 * 1000;
    if (!this.formData) {
      this.formData = {};
    }
    this.formData[field] = milliseconds;
  }

  handleInputChange(event) {
    const field = event.target.dataset.field;
    const input = event.target;
    if (field) {
      let value = event.target.value;

      let displayValue = value;

      const onlyDigitsRegex = /^[0-9０-９]*$/;

      // if (field === "電話番号" || field === "携帯番号") {
      //     // Check if the value contains only allowed characters
      //     if (!onlyDigitsRegex.test(value)) {
      //         // If not, remove invalid characters
      //         value = value.replace(/[^0-9０-９]/g, '');
      //     }
      // }

      // if (field === "平日s" || field === "平日e" || field === "土日祝s" || field === "土日祝e") {
      //     value = isNaN(value) || value === '' ? 0 : parseFloat(value) * 60 * 60 * 1000;
      //     if (isNaN(value)) {
      //         console.error("Invalid value for field:", field);
      //         return;
      //     }
      // }

      switch (field) {
        case "姓":
          this.InputLastName = displayValue;
          // this.contactClassLastName = this.InputLastName ? "" : "invalid-input";
          break;
        case "名":
          this.InputFirstName = displayValue;
          // this.contactClassFirstName = this.InputFirstName ? "" : "invalid-input";
          break;
        case "姓（フリガナ）":
          this.InputLKanaName = displayValue;
          // this.contactClassLKanaName = this.InputLKanaName ? "" : "invalid-input";
          break;
        case "名（フリガナ）":
          this.InputFKanaName = displayValue;
          // this.contactClassFKanaName = this.InputFKanaName ? "" : "invalid-input";
          break;
        case "部署":
          this.InputDepartment = displayValue;
          break;
        case "役職":
          this.InputPost = displayValue;
          break;
        case "社員番号":
          this.InputEmpCode = displayValue;
          break;
        case "メールアドレス":
          this.InputEmail = displayValue;
          // this.contactClassEmail = this.InputEmail ? "" : "invalid-input";

          break;
        case "電話番号":
          // const onlyNumber = /^[0-9]*$/;
          if (!onlyDigitsRegex.test(input.value)) {
            event.target.blur();
          }
          const cleanedPhone = input.value.replace(/[^0-9]/g, '');
          input.value = cleanedPhone;
          // let isOk = displayValue.length > 0 && onlyNumber.test(displayValue);
          this.InputTelephone = input.value;
          break;
        case "携帯番号":
          // const onlyNumberCell = /^[0-9]*$/;
          if (!onlyDigitsRegex.test(input.value)) {
            event.target.blur();
          }
          const cleanedPhone2 = input.value.replace(/[^0-9]/g, '');
          input.value = cleanedPhone2;
          this.InputCellPhone = input.value;
          break;
        // case "平日s":
        //     this.workdayStart = displayValue;
        //     break;
        // case "平日e":
        //     this.workdayEnd = displayValue;
        //     break;
        // case "土日祝s":
        //     this.holidayStart = displayValue;
        //     break;
        // case "土日祝e":
        //     this.holidayEnd = displayValue;
        //     break;
        default:
          console.warn("Unhandled field:", field);
      }

      if (!this.formData) {
        this.formData = {};
      }
      this.formData[field] = value; // Store converted value
    }

    // const field = event.target.dataset.field;
    // if (field) {
    //   let value = event.target.value;
    //   if (field === "平日s" || field === "平日e" || field === "土日祝s" || field === "土日祝e") {
    //     value = parseFloat(value) * 60 * 60 * 1000; // hours to milliseconds
    // }
    //   if (field == "姓") {
    //       this.InputLastName = event.target.value;
    //       this.contactClassLastName = this.InputLastName ? "" : "invalid-input";
    //     } else if (field == "名") {
    //       this.InputFirstName = event.target.value;
    //       this.contactClassFirstName = this.InputFirstName
    //         ? ""
    //         : "invalid-input";
    //     } else if (field == "姓（フリガナ）") {
    //       this.InputLKanaName = event.target.value;
    //       this.contactClassLKanaName = this.InputLKanaName
    //         ? ""
    //         : "invalid-input";
    //     } else if (field == "名（フリガナ）") {
    //       this.InputFKanaName = event.target.value;
    //       this.contactClassFKanaName = this.InputFKanaName
    //         ? ""
    //         : "invalid-input";}
    //     } else if (field == "部署") {
    //       this.InputDepartment = event.target.value;
    //     } else if (field == "役職") {
    //       this.InputPost = event.target.value;
    //     } else if (field == "社員番号") {
    //       this.InputEmpCode = event.target.value;
    //     } else if (field == "メールアドレス") {
    //       this.InputEmail = event.target.value;
    //       this.contactClassEmail = this.InputEmail ? "" : "invalid-input";
    //     } else if (field == "電話番号") {
    //       const onlyNumber = /^[0-9]*$/;
    //       const input = event.target;
    //       let isOk =
    //         input.value.length > 0 && onlyNumber.test(input.value)
    //           ? true
    //           : false;
    //       this.InputTelephone = input.value;

    //       this.contactClassTelephone = isOk == true ? "" : "invalid-input";
    //     } else if (field == "携帯番号") {
    //       const onlyNumber = /^[0-9]*$/;
    //       const input = event.target;
    //       let isOk =
    //         input.value.length > 0 && onlyNumber.test(input.value)
    //           ? true
    //           : false;
    //     this.InputCellPhone = input.value;

    //       this.contactClassCellPhone = isOk == true ? "" : "invalid-input";
    //     }else if(field == "平日s"){
    //       this.workdayStart = value;
    //     }else if(field == "平日e"){
    //       this.workdayEnd = value;
    //     }else if(field == "土日祝s"){
    //       this.holidayStart = value;
    //     }else if(field == "土日祝e"){
    //       this.holidayEnd = value;
    //     }

    //     this.formData[field] = event.target.value;
    //     console.log("form data",JSON.stringify(this.formData));
  }

  handleNotificationOn(event) {
    const field = event.target.dataset.fieldd;
    this.isNotifOnorOff = event.target.dataset.valuee;
    this.formData[field] = this.isNotifOnorOff;
    const defaultField = '通知対象'; // Replace with the actual field name
    if (!this.formData[defaultField]) {
      this.formData[defaultField] = this.inputNumVal;
    }
    this.notifiOff = false;
  }

  handleNotificationOff(event) {
    const field = event.target.dataset.field;
    this.isNotifOnorOff = event.target.dataset.value;
    this.formData[field] = this.isNotifOnorOff;
    this.inputNumVal = this.lowerNotiflimit;
    this.numerrorVal = false;
    this.isNotifError = false;
    this.contactClassRecordInput = "";
    this.notificationDateSelection = "";
    this.selectedNotifDate = "";
    this.selectedNotifDatetoDisp = "";
    if (this.isNotifOnorOff === "オフ") {
      for (const key in this.formData) {
        if (
          key === "通知対象" || key === "通知日" || key === "特定の日に該当の車両をまとめて通知する"
        ) {
          delete this.formData[key];
        }
      }
      // this.selectedNotifDate = "";
    }

    this.notifiOff = true;
  }

  handleNotificationOn(event) {
    const field = event.target.dataset.fieldd;
    this.isNotifOnorOff = event.target.dataset.valuee;
    this.formData[field] = this.isNotifOnorOff;
    const defaultField = '通知対象'; // Replace with the actual field name
    if (!this.formData[defaultField]) {
      this.formData[defaultField] = this.inputNumVal;
    }
    this.notifiOff = false;
  }
  handleNotificationOff(event) {
    const field = event.target.dataset.field;
    this.isNotifOnorOff = event.target.dataset.value;
    this.formData[field] = this.isNotifOnorOff;
    this.inputNumVal = this.lowerNotiflimit;
    this.numerrorVal = false;
    this.isNotifError = false;
    this.contactClassRecordInput = "";
    this.notificationDateSelection = "";
    this.selectedNotifDate = "";
    this.selectedNotifDatetoDisp = "";
    if (this.isNotifOnorOff === "オフ") {
      for (const key in this.formData) {
        if (
          key === "通知対象" || key === "通知日" || key === "特定の日に該当の車両をまとめて通知する"
        ) {
          delete this.formData[key];
        }
      }
      // this.selectedNotifDate = "";
    }

    this.notifiOff = true;
  }


  handleNotificationOninv(event){
    const field = event.target.dataset.fieldd;
    this.isNotifOnorOffinv = event.target.dataset.valuee;
    this.formData["EmailEinvoice"] = this.isNotifOnorOffinv;
    this.userDetailData.eInvoiceEmail = 'オン';
    this.notifiOffinv = false;
  }
  
  handleNotificationOffinv(event){
    const field = event.target.dataset.field;
    this.isNotifOnorOffinv = event.target.dataset.value;
    this.formData["EmailEinvoice"] = this.isNotifOnorOffinv;
    this.userDetailData.eInvoiceEmail = 'オフ';
    this.notifiOffinv = true;
  }
  
  
  handleNotificationOndtfsa(event){
    this.isNotifOnorOffdtfsa = event.target.dataset.valuee;
    this.formData["EmailDtfsa"] = this.isNotifOnorOffdtfsa;
    this.userDetailData.LeaseEmail = 'オン';
    this.notifiOffdtfsa = false;
  }
  
  handleNotificationOffdtfsa(event){
    this.isNotifOnorOffdtfsa = event.target.dataset.value;
    this.formData["EmailDtfsa"] = this.isNotifOnorOffdtfsa;
    this.userDetailData.LeaseEmail = 'オフ';
    this.notifiOffdtfsa = true;
  }


  handleNumberChange(event) {
    const field = event.target.dataset.field;
    if (event.target.value.length > 3) {
      event.target.value = this.inputNumVal;
      return;
    };
    this.inputNumVal = event.target.value;
    this.inputNumVal = this.inputNumVal.replace(/[^\x30-\x39]/g, '');
    if (this.inputNumVal.length > 3) {
      this.inputNumVal = this.inputNumVal.slice(0, 3);
    }
    const numericValue = parseInt(this.inputNumVal, 10);
    this.numerrorVal = "";
    if (numericValue < this.lowerNotiflimit || numericValue > this.upperNotiflimit) {
      this.numerrorVal = "*"+this.lowerNotiflimit+"日~"+this.upperNotiflimit+"日の期間内でのみ設定が可能です。";
      return;
    }
    this.formData[field] = this.inputNumVal;
    console.log("form data",JSON.stringify(this.formData));
  }

  handleNotificationSelection(event) {
    const field = event.target.dataset.field;
    this.notificationDateSelection = event.target.value;
    this.formData[field] = this.notificationDateSelection;
    if (this.notificationDateSelection === "NotifyWhenExp") {
      for (const key in this.formData) {
        if (
          key === "特定の日に該当の車両をまとめて通知する"
        ) {
          delete this.formData[key];
        }
      }
      this.selectedNotifDate = "";
      this.selectedNotifDatetoDisp = "";
      this.contactClassSelectedDate = "dropdown-header-date icon2";
    }
  }

  get notifPicklist() {
    return this.notificationDateSelection === "NotifySelectedDate"
  }

  toggleStartDropdown(event) {
    event.stopPropagation();
    this.isNotifDropdownOpen = !this.isNotifDropdownOpen;
  }

  handleNotificationdateClick(event) {
    const field = event.target.dataset.field;
    this.selectedNotifDate = event.target.dataset.value;
    this.selectedNotifDatetoDisp = event.target.dataset.name;
    this.isNotifDropdownOpen = false;
    this.formData[field] = this.selectedNotifDate;
  }

  handleInsideClick(event) {
    event.stopPropagation();
  }

  get placeholderNotification() {
    return this.selectedNotifDate
  }

  get notificationBlock() {
    return this.isNotifOnorOff === "オン";
  }

  get notificationMessage() {
    return `車検満了日まで${this.inputNumVal}日以内となった場合に通知する`;
  }

  get notificationOption() {
    return this.notificationDateSelectiontoDisp === "特定の日に該当の車両をまとめて通知する"
  }

  get selectedNotifdate() {
    return `毎月${this.selectedNotifDate}日に該当の車両をまとめて通知する`
  }

  get isNotifyWhenExpSelected() {
    return this.notificationDateSelection === 'NotifyWhenExp';
  }

  get isNotifySelectedDateSelected() {
    return this.notificationDateSelection === 'NotifySelectedDate';
  }

  get NotificationError() {
    return this.isNotifError
  }

  handleRedRadioClick(event) {
    // Remove the error state and mark the radio button as selected
    this.isNotifError = false;
    const field = event.target.dataset.field;
    this.notificationDateSelection = event.target.value;

    this.formData[field] = this.notificationDateSelection;

    // if(this.notifPicklist === false){
    //   this.selectedNotifDate = "";
    //   this.selectedNotifDatetoDisp = "";
    // }

    // this.isNotifyWhenExpSelected = true;
    // Trigger onchange event manually if required
    // const inputElement = event.target;
    // const changeEvent = new CustomEvent('change', {
    //     detail: { value: inputElement.value }
    // });
    // inputElement.dispatchEvent(changeEvent);
  }


  saveFormData() {
    let onlyNumber = /^[0-9０-９]*$/;
    let emailPattern = /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"[^"]*")@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(\[IPv6:[0-9a-fA-F:]+\]|\[[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\])$/;

    let isFormValid = true; // Flag to track overall form validity
    const fullWidthDigitsRegex = /[０-９]/;
    let japanesePattern = /[\u3040-\u30FF\u4E00-\u9FFF]/;
    // Reset all error messages and CSS classes
    this.contactClassFirstName = "";
    this.contactholidayend = "";
    this.contactholidaystart = "";
    this.contactworkdayend = "";
    this.contactworkdaystart = "";
    this.workError = "";
    this.Fnameerror = "";
    this.contactClassLastName = "";
    this.contactClassSelectedDate = "dropdown-header-date icon2";
    this.Lnameerror = "";
    this.contactClassFKanaName = "";
    this.Fkanaerror = "";
    this.contactClassLKanaName = "";
    this.Lkanaerror = "";
    this.contactClassBranch = "Inputs12 icon";
    this.contactClassRecordInput = "";
    // this.contactClassRecordRadio = "records-notif-radio";
    this.ErrorText = "";
    this.contactClassEmail = "";
    this.emailerrorText = "";
    this.contactClassCellPhone = "";
    this.contactClassTelephone = "";
    this.cellPhoneErrorText = "";
    this.telephoneErrorText = "";

    if (this.InputFirstName == "") {
      this.contactClassFirstName = "invalid-input";
      this.Fnameerror = this.labels2.ccp_up_firstNameInputRequired8;
      isFormValid = false;
      window.scrollTo(0, 0);
      this.handleError();
    }
    if (this.InputLastName == "") {
      this.contactClassLastName = "invalid-input";
      this.Lnameerror = this.labels2.ccp_up_lastNameInputRequired8;
      isFormValid = false;
      window.scrollTo(0, 0);
      this.handleError();
    }
    if (this.InputFKanaName == "") {
      this.contactClassFKanaName = "invalid-input";
      this.Fkanaerror = this.labels2.ccp_up_firstNameInputRequired8;
      isFormValid = false;
      window.scrollTo(0, 0);
      this.handleError();
    }
    if (this.InputLKanaName == "") {
      this.contactClassLKanaName = "invalid-input";
      this.Lkanaerror = this.labels2.ccp_up_lastNameInputRequired8;
      isFormValid = false;
      window.scrollTo(0, 0);
      this.handleError();
    }

    if (this.branchfromjunction.length == 0 && this.branch.length == 0) {
      this.ErrorText = this.labels2.ccp_up_selectAffiliation8;
      this.contactClassBranch = "Inputs12 icon invalid-input";
      window.scrollTo(0, 0);
      isFormValid = false;
      this.handleError();
    }
    if (this.isNotifOnorOff == "オン") {
      if (this.inputNumVal == "") {
        this.contactClassRecordInput = "invalid-input";
        window.scrollTo(0, 0);
        isFormValid = false;
        this.handleError();
      }

      if (this.inputNumVal < this.lowerNotiflimit || this.inputNumVal > this.upperNotiflimit) {
        // this.numerrorVal = "*60日~120日の間しかできません。";
        this.numerrorVal = "*"+this.lowerNotiflimit+"日~"+this.upperNotiflimit+"日の期間内でのみ設定が可能です。";
        window.scrollTo(0, 0);
        this.contactClassRecordInput = "invalid-input";
        isFormValid = false;
      }
      if (this.notificationDateSelection == "") {
        // this.contactClassRecordRadio = "records-notif-radio invalid-input";
        window.scrollTo(0, 0);
        isFormValid = false;
        this.handleError();
      }
      if (this.notificationDateSelection == "NotifySelectedDate" && this.selectedNotifDate == "") {
        // this.contactClassRecordRadio = "records-notif-radio invalid-input";
        this.contactClassSelectedDate = "dropdown-header-date icon2 invalid-input";
        isFormValid = false;
        window.scrollTo(0, 0);
        this.handleError();
      }
    }

    if (this.isNotifOnorOff == "オン" && this.notificationDateSelection == "") {
      this.isNotifError = true;
      window.scrollTo(0, 0);
    }

    if (this.InputEmail === "") {
      this.contactClassEmail = "invalid-input";
      this.emailerrorText = this.labels2.ccp_up_enterEmail8;
      isFormValid = false;
      window.scrollTo(0, 0);
      this.handleError();
    } else if (!emailPattern.test(this.InputEmail)) {
      this.contactClassEmail = "invalid-input";
      this.emailerrorText = this.labels2.ccp_up_invalidEmailFormat8;
      window.scrollTo(0, 0);
      isFormValid = false;
      window.scrollTo(0, 0);
    } else if (japanesePattern.test(this.InputEmail)) {
      this.contactClassEmail = "invalid-input";
      window.scrollTo(0, 0);
      this.emailerrorText = this.labels2.ccp_up_invalidEmailFormat8;
      isFormValid = false;
      window.scrollTo(0, 0);
    }
    const emailValidationPromise = new Promise((resolve, reject) => {
      if (this.InputEmail !== this.initialmail) {
        checkUserEmail({ email: this.InputEmail })
          .then((data) => {
            if (data && data[0] === "true") {
              this.contactClassEmail = "invalid-input";
              this.emailerrorText = this.labels2.ccp_up_emailAlreadyUsed8;
              window.scrollTo(0, 0);
              isFormValid = false;
              window.scrollTo(0, 0);
            }
            resolve();
          })
          .catch((error) => {
            console.error("Error checking email:", error);
            this.emailerrorText = this.labels2.ccp_up_emailValidationError8;
            this.contactClassEmail = "invalid-input";
            isFormValid = false;
            ErrorLog({
              lwcName: "ccp_UserProfile",
              errorLog: error,
              methodName: "SaveFormData",
              ViewName: "Edit Basic Information",
              InterfaceName: "Salesforce",
              EventName: "Updating user information",
              ModuleName: "Basic information"
            })
              .then(() => {
                console.log("Error logged successfully in Salesforce");
              })
              .catch((loggingErr) => {
                console.error("Failed to log error in Salesforce:", loggingErr);
              });
            window.scrollTo(0, 0);
            reject();
          });
      } else {
        resolve();
      }
    });

    if (this.InputTelephone === "" && this.InputCellPhone === "") {
      this.cellPhoneErrorText = this.labels2.ccp2_up_enterPhoneOrMobile8;
      this.contactClassCellPhone = "invalid-input";
      this.contactClassTelephone = "invalid-input";
      this.handleError();
      window.scrollTo(0, 0);
      isFormValid = false;
    } else if (
      this.InputTelephone === "" &&
      !onlyNumber.test(this.InputCellPhone)
    ) {
      this.contactClassCellPhone = "invalid-input";
      this.telephoneErrorText = this.labels2.ccp2_up_phoneMobileHalfWidth8;
      window.scrollTo(0, 0);
      isFormValid = false;
    } else if (
      this.InputCellPhone === "" &&
      !onlyNumber.test(this.InputTelephone)
    ) {
      this.contactClassTelephone = "invalid-input";
      this.cellPhoneErrorText = this.labels2.ccp2_up_phoneMobileHalfWidth8;
      window.scrollTo(0, 0);
      isFormValid = false;
    } else if (
      this.InputTelephone !== "" &&
      this.InputCellPhone !== "" &&
      (!onlyNumber.test(this.InputTelephone) ||
        !onlyNumber.test(this.InputCellPhone))
    ) {
      this.contactClassTelephone = "invalid-input";
      this.contactClassCellPhone = "invalid-input";
      this.cellPhoneErrorText = this.labels2.ccp2_um_phoneMobileHalfWidth8;
      window.scrollTo(0, 0);
      isFormValid = false;
    }

    // If form is valid, proceed with the form submission
    emailValidationPromise.then(() => {
      if (isFormValid) {
        this.formDataArray = [];
        this.formData["ContactId"] = this.contactId;
        this.formDataArray.push(this.formData);
        let filteredData = JSON.stringify(this.formDataArray);

        const asyncFunction = async () => {
          try {
            this.showeditscreen = false;
            // this.isLoading = true;
            // this.allUserLoader = true;
            this.showBasicinfo = false;
            this.showBasicinfo = true;
            // this.open();
            window.scrollTo(0, 0);

            await this.updateUser(filteredData);
            await this.branchdeleteAdd();

            this.refreshTokenInt = ++this.refreshTokenInt;
            this.refreshTokenInt2 = ++this.refreshTokenInt2;

            this.branch = [];
            this.showModalAndRefresh();
            setTimeout(async () => {
              this.refreshTokenInt = ++this.refreshTokenInt;
              this.refreshTokenInt2 = ++this.refreshTokenInt2;
              // this.isLoading = false;
              // this.allUserLoader = false;
              this.showBasicinfo = true;
            }, 2000);
            sessionStorage.removeItem("ongoingTransaction");
          } catch (error) {
            ErrorLog({
              lwcName: "ccp_UserProfile",
              errorLog: error,
              methodName: "emailvalidationpromise",
              ViewName: "Edit Basic Information",
              InterfaceName: "Salesforce",
              EventName: "emailvalidationpromise updating user information",
              ModuleName: "Basic information"
            })
              .then(() => {
                console.log("Error logged successfully in Salesforce");
              })
              .catch((loggingErr) => {
                console.error("Failed to log error in Salesforce:", loggingErr);
              });
            console.error("Error updating user:", error);
            this.handleValidationError();
          }
        };

        asyncFunction();
      } else {
        // Display all accumulated errors
        // this.handleError();
      }
    });


  }

  selectbranchId;
  branchDataForClass;
  branchError = false;
  branchErrorText;

  //  get isAllBranchSelected() {
  //     return this.branchoptions.every(item => item.selected);
  //   }

  //   get filteredbranch() {
  //     if (!this.searchTerm) {
  //       return this.branchoptions;
  //     }
  //     return this.branchoptions.filter((veh) => {
  //       return veh.label.toLowerCase().includes(this.searchTerm);
  //     });
  //   }

  //   get countofbranch() {
  //     if (this.branch.length === this.branchoptions.length) {
  //       return "すべて"; // All selected
  //     }
  //     return this.branch.length > 0 ? `${this.branch.length}件選択中` : "";
  //   }

  //   handlebranChange(event) {
  //     event.stopPropagation();
  //     this.showlist = !this.showlist;
  //     if (this.branchoptions.length == 0) {
  //       this.showlist = false;
  //       console.log("inside false branch opts")
  //     }
  //     console.log("branchoption", this.branchoptions.length)
  //   }

  //   handleInsideClick(event) {
  //     event.stopPropagation();
  //   }

  //   handleAllBranchSelect(event) {
  //     const isChecked = event.target.checked; // Get checked state from event

  //     // Update all branches' selected status
  //     this.branchoptions = this.branchoptions.map(b => ({ ...b, selected: isChecked }));

  //     // Update branch lists based on selection
  //     this.branch = isChecked ? this.branchoptions.map(b => ({ Id: b.value, Name: b.label })) : [];
  //     this.branchDataForClass = isChecked ? this.branchoptions.map(b => b.label) : [];

  //     // Ensure UI updates
  //     this.branchoptions = [...this.branchoptions];
  //   }

  //   handleBranchSelect(event) {
  //     if (this.branchoptions.length == 1) {
  //       this.showlist = false;
  //       console.log("inside false branch opts")
  //     }
  //     this.selectbranchId = event.currentTarget.dataset.id;
  //     console.log("selected b id", JSON.stringify(this.selectbranchId));
  //     this.handlebranchChange();
  //     this.isAllBranchSelected = this.countofbranch === this.branchoptions.length;
  //     this.branchoptions = [...this.branchoptions];
  //     this.updateAllCheckboxUI();
  //     console.log("UPdated values are: ", this.isAllBranchSelected, JSON.stringify(this.branchoptions));

  //   }
  //   updateAllCheckboxUI() {
  //     let allCheckbox = this.template.querySelector('input[name="all"]');
  //     if (allCheckbox) {
  //       allCheckbox.checked = this.isAllBranchSelected;
  //     }
  //   }

  //   handlebranchChange() {
  //     let selectedBranch = null;

  //     // Find the selected branch in options
  //     for (let i = 0; i < this.branchoptions.length; i++) {
  //       if (this.branchoptions[i].value === this.selectbranchId) {
  //         selectedBranch = this.branchoptions[i];
  //         break;
  //       }
  //     }

  //     if (selectedBranch) {
  //       console.log("Selected Branch Before Toggle:", JSON.stringify(selectedBranch));

  //       // Ensure this.branch and this.branchDataForClass exist
  //       if (!this.branch) this.branch = [];
  //       if (!this.branchDataForClass) this.branchDataForClass = [];

  //       // Check if branch is already selected
  //       let existingIndex = this.branch.findIndex(b => b.Id === selectedBranch.value);

  //       if (existingIndex !== -1) {
  //         // **Unselect (Remove from arrays)**
  //         this.branch.splice(existingIndex, 1);
  //         this.branchDataForClass = this.branchDataForClass.filter(label => label !== selectedBranch.label);
  //         selectedBranch.selected = false;
  //         console.log("Branch Unselected:", selectedBranch.label);
  //       } else {
  //         // **Select (Add to arrays)**
  //         this.branch.push({
  //           Id: selectedBranch.value,
  //           Name: selectedBranch.label
  //         });
  //         this.branchDataForClass.push(selectedBranch.label);
  //         selectedBranch.selected = true;
  //         console.log("Branch Selected:", selectedBranch.label);
  //       }

  //       // Ensure reactivity is maintained
  //       this.branchoptions = [...this.branchoptions];
  //     }

  //     this.selectbranchId = null; // Reset selected branch ID

  //     // Check if the branch options are empty
  //     this.showlist = this.branchoptions.length > 0;
  //   }

  handleError() {
    // const evt = new ShowToastEvent({
    //   title: this.labels2.ccp_up_error8,
    //   message: this.labels2.ccp_up_requiredField8,
    //   variant: "Error"
    // });
    // this.dispatchEvent(evt);
  }
  handleValidationError() {
    // const evt = new ShowToastEvent({
    //   title: this.labels2.ccp_up_error8,
    //   message: this.labels2.ccp_up_enterValidValue8,
    //   variant: "Error"
    // });
    // this.dispatchEvent(evt);
  }

  updateUser(formDataArray) {
    console.log('formDataArray for update user data : - ', formDataArray);
    // Return the promise from updateUser function
    return new Promise((resolve, reject) => {

      const BranchIdsToAdd = this.branch.map((bran) => bran.Id);
      updateUser({ uiFieldJson: formDataArray, branches: BranchIdsToAdd })
        .then((result) => {
          resolve(result); // Resolve the promise on success
        })
        .catch((error) => {
          ErrorLog({
            lwcName: "ccp_UserProfile",
            errorLog: error,
            methodName: "updateuser",
            ViewName: "Edit Basic Information",
            InterfaceName: "Salesforce",
            EventName: "update user",
            ModuleName: "Basic information"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
          console.error("update User error:" + JSON.stringify(error));
          reject(error); // Reject the promise on error
        });
    });
  }
  showModalAndRefresh() {
    this.showModal = true;
  }

  handleOk() {
    this.showModal = false;
  }
  handleCancelMembership() {
    this.showServiceModal = true;
  }

  handleNomodal2() {
    this.showServiceModal = false;
  }

  handleYesmodal2() {
    // const optout = window.location.href;
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      let NotificationCentreUrl =
        baseUrl.split("/s/")[0] + "/s/optout";
      window.location.href = NotificationCentreUrl;
    }
  }
  handleCanceledit() {
    this.showcancelModaledit = true;
  }
  handleNoCanceledit() {
    this.showcancelModaledit = false;
  }
  handleYesCanceledit() {
    // this.open();
    // this.reloadPage();
    window.scrollTo(0, 0);
    this.showcancelModaledit = false;
    this.showeditscreen = false;
    this.formData = {};
    this.isNotifOnorOff = this.userDetailData.isNotifOnorOff;
    this.notificationDateSelection = this.userDetailData.notificationDateSelection;
    this.inputNumVal = this.userDetailData.inputNumVal ? this.userDetailData.inputNumVal : this.lowerNotiflimit;
    this.contactClassFirstName = "";
    this.contactholidayend = "";
    this.contactholidaystart = "";
    this.contactworkdayend = "";
    this.contactworkdaystart = "";
    this.workError = "";
    this.Fnameerror = "";
    this.contactClassLastName = "";
    this.contactClassSelectedDate = "dropdown-header-date icon2";
    this.Lnameerror = "";
    this.contactClassFKanaName = "";
    this.Fkanaerror = "";
    this.branch.forEach(morevehicle => {
      this.branchoptions.push({ label: morevehicle.Name, value: morevehicle.Id });
    });
    this.branch = [];
    this.originalbranchfromjunction.forEach(originalContact => {
      const isContactInList = this.branchfromjunction.some(contact => contact.Id === originalContact.Id && contact.Name === originalContact.Name);
      if (!isContactInList) {
        this.branchfromjunction.push({ Name: originalContact.Name, Id: originalContact.Id });
      }
    });
    this.compareAndRemoveCommonValues();
    this.contactClassLKanaName = "";
    this.Lkanaerror = "";
    this.contactClassBranch = "Inputs12 icon";
    this.contactClassRecordInput = "";
    // this.contactClassRecordRadio = "records-notif-radio";
    this.ErrorText = "";
    this.contactClassEmail = "";
    this.emailerrorText = "";
    this.contactClassCellPhone = "";
    this.contactClassTelephone = "";
    this.cellPhoneErrorText = "";
    this.telephoneErrorText = "";
    this.numerrorVal = false;
    this.isNotifError = false;
    this.contactClassRecordInput = "";
    this.showBasicinfo = true;
    sessionStorage.removeItem("ongoingTransaction");
  }

  compareAndRemoveCommonValues() {
    const filteredVehicles = [];

    // Filter vehicles by checking against optcontacts
    for (let vehicle of this.branchoptions) {
      let isCommon = false;
      for (let contact of this.branchfromjunction) {
        if (vehicle.label === contact.Name && vehicle.value === contact.Id) {
          isCommon = true;
          break;
        }
      }
      if (!isCommon) {
        filteredVehicles.push(vehicle);
      }
    }

    // Update the arrays with filtered data
    this.branchoptions = filteredVehicles;
    // this.optcontacts = filteredContacts;
  }


  handlebranChange(event) {
    event.stopPropagation();
    this.showlist = !this.showlist;
    if (this.branchoptions.length == 0) {
      this.showlist = false;
    }
  }
  handleInsideClick(event) {
    event.stopPropagation();
  }
  handleSearch(event) {
    this.searchTerm = event.target.value.toLowerCase();
  }
  get filteredbranch() {
    if (!this.searchTerm) {
      return this.branchoptions;
    }
    return this.branchoptions.filter((veh) => {
      return veh.label.toLowerCase().includes(this.searchTerm);
    });
  }

  handleBranchSelect(event) {
    if (this.branchoptions.length == 1) {
      this.showlist = false;
    }
    this.selectbranchId = event.currentTarget.dataset.id;
    this.handlebranchChange();
  }

  handleDeleteBranch(event) {
    const vehicleId = event.currentTarget.dataset.id;
    const deletedVehicleFromVehicleArray = this.branch.find(
      (veh) => veh.Id === vehicleId
    );
    if (deletedVehicleFromVehicleArray) {
      this.branchoptions = [
        ...this.branchoptions,
        {
          label: deletedVehicleFromVehicleArray.Name,
          value: deletedVehicleFromVehicleArray.Id
        }
      ];
    }

    const deletedVehicleFromMoreVehiclesArray = this.branchfromjunction.find(
      (veh) => veh.Id === vehicleId
    );
    if (
      deletedVehicleFromMoreVehiclesArray &&
      !deletedVehicleFromVehicleArray
    ) {
      this.branchoptions = [
        ...this.branchoptions,
        {
          label: deletedVehicleFromMoreVehiclesArray.Name,
          value: deletedVehicleFromMoreVehiclesArray.Id
        }
      ];
    }

    this.deletedBranchIds.push(vehicleId);

    this.branch = this.branch.filter((veh) => veh.Id !== vehicleId);

    this.branchfromjunction = this.branchfromjunction.filter(
      (veh) => veh.Id !== vehicleId
    );
    this.selectbranchId = "";
  }

  handlebranchChange() {
    let selectedBranch = "";
    for (let i = 0; i < this.branchoptions.length; i++) {
      if (this.branchoptions[i].value === this.selectbranchId) {
        selectedBranch = this.branchoptions[i];
        this.branchoptions = this.branchoptions.filter(
          (bran) => bran.value !== this.selectbranchId
        );
        break;
      }
    }
    if (selectedBranch) {
      this.branch.push({
        Id: selectedBranch.value,
        Name: selectedBranch.label
      });
      this.branchDataForClass.push(selectedBranch.label);
    }
    this.selectbranchId = null;
    if (this.branchoptions.length == 0) {
      this.showlist = false;
    }
  }

  branchdeleteAdd() {
    if (this.deletedBranchIds.length > 0) {
      branchContactDelete({
        contactId: this.contactId,
        branchesToDelete: this.deletedBranchIds
      });
    }
    if (this.branch.length > 0) {
      const branIdsToAdd = this.branch.map((vehicle) => vehicle.Id);
      branchContactAdd({
        contactId: this.contactId,
        branchesToAdd: branIdsToAdd
      });
    }
  }

  handleYes() {
    this.showconfModal = false;
    this.showBasicinfo = false;
    this.showchangeAdmin = true;
    this.showstep1 = true;

    // Reset the selected user and value
    this.selectedUserId = "";
    this.selectedValue = "";
    this.newusershow = false;

    // Reopen the dropdown with the original user list and reset userList
    this.isDropdownOpen = true;
    // Assuming you have an original user list to reset to, otherwise store it somewhere
    this.userList = [...this.originalUserList];
    this.close();
  }
  handleNo() {
    this.showBasicinfo = true;
    this.showconfModal = false;
  }

  handleYesCancel() {
    // this.reloadPage();
    window.scrollTo(0, 0);
    this.selectedUserId = "";
    this.newusershow = false;
    // this.open();
    this.showcancelModal = false;
    this.showchangeAdmin = false;
    this.showBasicinfo = true;
    this.userList = [...this.originalUserList];
    sessionStorage.removeItem("ongoingTransaction");
  }


  handleagreeyes() {
    this.showagreeModal = false;
    this.showchangeAdmin = true;
  }

  handlelastbutton() {
    // this.showchangeAdmin = false;
    // this.showstep3 = false;
    // this.open();
    // this.reloadPage();
    this.navigateToHome();
    // this.showBasicinfo = true;
  }


  navigateToHome() {
    let baseUrl = window.location.href;
    let homeUrl;
    if (baseUrl.indexOf("/s/") != -1) {
      homeUrl = baseUrl.split("/s/")[0] + "/s/profile";
    }
    window.location.href = homeUrl;
  }

  navigateToHome2() {
    let baseUrl = window.location.href;
    let homeUrl;
    if (baseUrl.indexOf("/s/") != -1) {
      homeUrl = baseUrl.split("/s/")[0] + "/s/";
    }
    window.location.href = homeUrl;
  }


  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    if (value.length > maxLength) {
      // event.target.value = value.substring(0, maxLength);
      event.target.blur();
    }
  }


  handleInputValidation(event) {
    this.handlevalchange(event);
    const field = event.target.dataset.field;
    if (field === "電話番号" || field === "携帯番号") {
      let value = event.target.value;
      const onlyDigitsRegex = /^[0-9０-９]*$/;

      if (!onlyDigitsRegex.test(value)) {
        value = value.replace(/[^0-9０-９]/g, "");
      }

      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      event.target.value = value;
    }
  }

  handlenext() {
    if (this.agreeChange && this.selectedUserId != "") {
      window.scrollTo(0, 0);
      this.showstep2 = true;
      this.showstep1 = false;
    }
    if (!this.agreeChange) {
      if (this.selectedUserId == "") {
        // const toastEvent = new ShowToastEvent({
        //   title: this.labels2.ccp_up_error8,
        //   message: this.labels2.ccp_up_selectNewAdmin8,
        //   variant: "error"
        // });
        // this.dispatchEvent(toastEvent);
      } else {
        this.showagreeModal = true;
      }
    }
    if (this.selectedUserId == "" && this.agreeChange) {
      if (this.selectedUserId == "") {
        // const toastEvent = new ShowToastEvent({
        //   title: this.labels2.ccp_up_error8,
        //   message: this.labels2.ccp_up_selectNewAdmin8,
        //   variant: "error"
        // });
        // this.dispatchEvent(toastEvent);
      }
    }
  }

  handleprev() {
    window.scrollTo(0, 0);
    this.showstep1 = true;
    this.agreeChange = false;
    this.showstep2 = false;
  }

  toggleDropdown(event) {
    // if(this.userList.length != 0){
    //     this.isDropdownOpen = !this.isDropdownOpen;
    // }
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.userList.length == 0) {
      this.isDropdownOpen = false;
    }

    if (this.isDropdownOpen) {
      // Add event listener to close the dropdown when clicking outside
      document.addEventListener("click", this.handleOutsideClick);
    } else {
      // Remove event listener when dropdown is closed
      document.removeEventListener("click", this.handleOutsideClick);
    }
  }

  handleChange(event) {
    this.selectedUserId = event.currentTarget.dataset.id;
    const selectedUser = this.userList.find(
      (user) => user.value === this.selectedUserId
    );
    if (selectedUser) {
      this.selectedValue = selectedUser.label;
      this.selectedId = selectedUser.value;

      this.userList = this.userList.filter(
        (user) => user.value !== this.selectedUserId
      );
    }
    this.isDropdownOpen = false;
    this.fetchUserInfo();
    this.newusershow = true;
  }

  handleNoCancel() {
    this.showcancelModal = false;
  }
  handlecancel() {
    this.showcancelModal = true;
    // this.selectedUserId = '';
    // this.newusershow = false;
  }

  handleCheckboxChange(event) {
    let checkName = event.target.name;
    let isChecked = event.target.checked;
    if (checkName == "agreechange") {
      this.agreeChange = isChecked;
    }
  }

  handlenext2() {
    sessionStorage.removeItem("ongoingTransaction");
    window.scrollTo(0, 0);

    console.log("old user id, neww user", this.contactId, this.selectedUserId)

    assignpermset({ conId: this.selectedUserId })
      .then(result => {
      }
      ).catch(error => {
        console.error("assign perm error", error);
      });

    oldnewadmin({ oldAdmin: this.contactId, newAdmin: this.selectedUserId })
      .then(result => { }
      ).catch(error => {
        console.error(error);
      });

    this.showstep2 = false;
    this.showstep3 = true;
  }

  handlechangeadmin() {
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    ongoingTransactions.changeAdminTxn = true;

    sessionStorage.setItem(
      "ongoingTransaction",
      JSON.stringify(ongoingTransactions)
    );

    this.showconfModal = true;
  }

  get branchPlaceholder() {
    return this.branchfromjunction.length === 0 && this.branch.length === 0;
  }


  get servlen() {
    return this.servicesArray.length === 0;
  }

}
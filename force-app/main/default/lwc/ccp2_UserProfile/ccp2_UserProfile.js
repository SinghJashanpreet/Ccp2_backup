import { LightningElement,track,wire } from 'lwc';
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getBasicInfo from "@salesforce/apex/CCP2_userController.userBasicInfo";
import { getRecord } from "lightning/uiRecordApi";
import CONTACT_ID_FIELD from "@salesforce/schema/User.ContactId";
import Id from "@salesforce/user/Id";
import getbranchdetails from "@salesforce/apex/CCP2_userData.UnAssociatedBranch";

import labelsBasic from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import checkManagerUser from "@salesforce/apex/CCP_HeaderController.checkManagerUser";
import getUserAllServicesList from "@salesforce/apex/CCP2_userController.uiPermissionList";



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
    @track initialmail = "";


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
    contactClassRecordRadio = "records-notif-radio";
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
    @track inputNumVal = "60";
    @track numerrorVal = "";
    @track notificationDateSelection = "";
    @track notificationDateSelectiontoDisp = "";
    @track isNotifDropdownOpen = false;
    @track selectedNotifDate = "";
    @track selectedNotifDatetoDisp = "";
    @track isNotifOnorOff = "";
    @track isNotifError = false;




    @track services = [
        { id:0, label: 'service A'},
        { id:1, label: 'service B'},
        { id:2, label: 'service C'},
        { id:3, label: 'service D'}
    ];

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
            ErrorLog({ lwcName: "ccp_UserProfile", errorLog: error, methodName: "Languagei18n" })
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
            console.log("User Profile Locale: ", userLocale);
            console.log("User Profile Labels: ", this.labels2);
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
      ErrorLog({ lwcName: "ccp2_UserProfile", errorLog: err, methodName: "Load Labels" })
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

  connectedCallback() {
    this.checkManagerUser();
    // this.originalUserList = [...this.userList];
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.imgdrop})`
    );
  }


    @wire(getRecord, {
    recordId: "$userId",
    fields: [CONTACT_ID_FIELD]
    })
    userRecord({ error, data }) {
      if (data) {
        this.contactId = data.fields.ContactId.value;
        console.log("Contact ID adminnnnnnnn:", this.contactId);
      } else if (error) {
        console.error("Error fetching user record:", error);
        let err = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_UserProfile", errorLog: err, methodName: "userRecord" })
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
        console.log("users updated data",data);
        this.userDetailData = {
          accountname: data.AccountName == null ? "-" : data.AccountName,
          firstName: data.FirstName == null ? "-" : data.FirstName,
          lastName: data.LastName == null ? "-" : data.LastName,
          firstNameKana: data.FirstNameKana == null ? "-" : data.FirstNameKana,
          lastNameKana: data.LastNameKana == null ? "-" : data.LastNameKana,
          siebelAccountCode:
            data.AccountSiebelAccountCode == null
              ? "-"
              : data.AccountSiebelAccountCode,
          id: data.Id == null ? "-" : data.Id,
          email: data.Email == null ? "-" : data.Email,
          Abbemail: data.Email == null ? "-" : data.Email.length > 16 ? data.Email.substring(0, 16)+ "..."
          : data.Email,
          MobilePhone: data.MobilePhone == null ? "-" : data.MobilePhone,
          Department: data.Department == null ? "-" : data.Department,
          Employee_Code: data.EmployeeCode == null ? "-" : data.EmployeeCode,
          Phone: data.Phone == null ? "-" : data.Phone,
          Title: data.Title == null ? "-" : data.Title,
          Branchs: data.BranchNames.length > 0 ? data.BranchNames : ["-"],
          isNotifOnorOff: data.CCP2_Notification_Toggle__c == null ? "オフ" : data.CCP2_Notification_Toggle__c,
          notificationDateSelection: data.CCP2_Notification_Option__c == null ? "" : data.CCP2_Notification_Option__c,
          inputNumVal: data.CCP2_Notify_Exp_Duration__c == null ? "60" : data.CCP2_Notify_Exp_Duration__c,
          selectedNotifDate: data.CCP2_Notify_Selected_Date__c == null ? "" : data.CCP2_Notify_Selected_Date__c
        };
        console.log("userrrrhelllooooodata", this.userDetailData);
        // the time field return the milliseconds so the time need divided by 3600000
        this.isNotifOnorOff = data.CCP2_Notification_Toggle__c == null ? "" : data.CCP2_Notification_Toggle__c;
        this.notificationDateSelection = data.CCP2_Notification_Option__c == null ? "" : data.CCP2_Notification_Option__c;
        this.selectedNotifDate = data.CCP2_Notify_Selected_Date__c == null ? "" : data.CCP2_Notify_Selected_Date__c;
        this.inputNumVal = data.CCP2_Notify_Exp_Duration__c == null ? "60" : data.CCP2_Notify_Exp_Duration__c;
  
        if(this.selectedNotifDate == "1"){
          this.selectedNotifDatetoDisp = "毎月1日";
        }
        if(this.selectedNotifDate == "15"){
          this.selectedNotifDatetoDisp = "毎月15日";
        }
  
        console.log("userrrrhelllooooodata", this.isNotifOnorOff, this.notificationDateSelection, this.selectedNotifDate, this.inputNumVal,JSON.stringify(this.userDetailData));
  
        if(this.isNotifOnorOff === "オン"){
          this.notifiOff = false;
        }else{
          this.notifiOff = true;
        }
  
        if(this.notificationDateSelection === "NotifySelectedDate"){
          this.notificationDateSelectiontoDisp = "特定の日に該当の車両をまとめて通知する";
        }else{
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
        console.log(
          "math floor in save week start",
          data.MostLikelyWeekdayStartTimesForAppoint
        );
        console.log("start start inside user user", this.workdayStart);
        this.workdayEnd =
          data.MostLikelyWeekdayEndTimesForAppoint == null
            ? ""
            : this.getTime(data.MostLikelyWeekdayEndTimesForAppoint);
        this.endwork =
          data.MostLikelyWeekdayEndTimesForAppoint == null
            ? "-"
            : this.getTime(data.MostLikelyWeekdayEndTimesForAppoint);
        console.log(
          "math floor in save week end",
          data.MostLikelyWeekdayEndTimesForAppoint
        );
        console.log("end week start inside user user", this.workdayEnd);
        this.holidayStart =
          data.MostLikelyHolidayStartTimesForAppoint == null
            ? ""
            : this.getTime(data.MostLikelyHolidayStartTimesForAppoint);
        this.startholiday =
          data.MostLikelyHolidayStartTimesForAppoint == null
            ? "-"
            : this.getTime(data.MostLikelyHolidayStartTimesForAppoint);
        console.log(
          "math floor in save holi start",
          data.MostLikelyHolidayStartTimesForAppoint
        );
        console.log("start holi start inside user user", this.holidayStart);
        this.holidayEnd =
          data.MostLikelyHolidayEndTimesForAppoint == null
            ? ""
            : this.getTime(data.MostLikelyHolidayEndTimesForAppoint);
        this.endholiday =
          data.MostLikelyHolidayEndTimesForAppoint == null
            ? "-"
            : this.getTime(data.MostLikelyHolidayEndTimesForAppoint);
        console.log(
          "math floor in save holi end",
          data.MostLikelyHolidayEndTimesForAppoint
        );
        console.log("end holi inside user user", this.holidayEnd);
  
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
        console.log("mob dattaaaa", this.InputCellPhone, this.InputTelephone);
        console.log("empppp codee", this.InputEmpCode);
  
        if (this.InputCellPhone === "-") {
          console.log("inside of handle edit");
          this.InputCellPhone = "";
        }
        if (this.InputTelephone === "-") {
          console.log("inside of handle edit");
          this.InputTelephone = "";
        }
        if (this.InputEmpCode === "-") {
          console.log("inside of handle edit");
          this.InputEmpCode = "";
        }
        if (this.InputDepartment === "-") {
          console.log("inside of handle edit");
          this.InputDepartment = "";
        }
        if (this.InputPost === "-") {
          this.InputPost = "";
        }
      } else if (error) {
        console.log("error,userrrsss", error);
        let err = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_UserProfile", errorLog: err, methodName: "fetUserInfo" })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      }
    }

    @wire(getUserAllServicesList, {userId: '$userId', refresh: '$refreshTokenInt'})
      services({data,error}){
        if(data){
          console.log("services dataaaaa",data)
          const serviceOrder = [
            "車両管理",
            "部整月次請求書（電子版）",
            "金融サービス",
            "車検入庫予約",
            "基本サービス（ふそうショップ）",
            "費用管理"
          ];
    
          this.servicesArray = serviceOrder.map((service) =>
            data.find((item) => item === service)
          );
          console.log("services dataaaaa in array",this.servicesArray)
        }else{
          console.log("services error",error);
        }
      }

    renderedCallback() {
      if (this.isLanguageChangeDone) {
        console.log("Working 1");
        this.loadLanguage();
      }
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
            console.log("checkManagerUser result: ", result);
            this.showcanceledit = result;
          })
          .catch((error) => {
                    ErrorLog({ lwcName: "ccp_UserProfile", errorLog: error, methodName: "checkManagerUser" })
            .then(() => {
                console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
                console.error("Failed to log error in Salesforce:", loggingErr);
            });
            this.errors = JSON.stringify(error);
            console.log("checkManagerUser errors:" + JSON.stringify(error));
          });
      }


      get notificationBlock(){
        return this.isNotifOnorOff === "オン";
      }
      get notificationMessage() {
        return `車検満了日まで${this.inputNumVal}日以内となった場合に通知する`;
      }
    
      get notificationOption(){
        return this.notificationDateSelectiontoDisp === "特定の日に該当の車両をまとめて通知する"
      }
    
      get selectedNotifdate(){
        return `毎月${this.selectedNotifDate}日に該当の車両をまとめて通知する`
      }
    
      get isNotifyWhenExpSelected() {
        return this.notificationDateSelection === 'NotifyWhenExp';
      }
    
      get isNotifySelectedDateSelected() {
          return this.notificationDateSelection === 'NotifySelectedDate';
      }
}
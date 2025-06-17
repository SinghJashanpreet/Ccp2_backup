import { LightningElement, track, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import { updateRecord } from "lightning/uiRecordApi";
import FLAG_FIELD from "@salesforce/schema/CCP2_Notification__c.Seen_Flag__c";
import ADMIN_FIELD from "@salesforce/schema/Contact.canManageMember__c";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getLogoutURL from "@salesforce/apex/CCP_HeaderController.getLogoutURL";
import insertRecord from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.insertData";
import insertRecordLists from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.insertDatalist";
import basePath from "@salesforce/community/basePath";
import checkManagerUser from "@salesforce/apex/CCP_HeaderController.checkManagerUser";
import Languagei18n from "@salesforce/apex/CCP2_guestUserLanguage.guestuserLanguage";
import returnNotificationData from "@salesforce/apex/CCP2_Notification_Controller.fullReturnNotificationData";
// import tempdata from "@salesforce/apex/CCP2_Notification_Controller.tempMethod";
import fullReturnNotificationDataCount from "@salesforce/apex/CCP2_Notification_Controller.unseenFlag";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

import getAllServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import Id from "@salesforce/user/Id";
import { getRecord } from "lightning/uiRecordApi";
import checkGuestUser from "@salesforce/apex/CCP_HeaderController.checkGuestUserAndTerms";
import getLoginURL from "@salesforce/apex/CCP_HeaderController.getLoginURL";
import labelsBranch from "@salesforce/resourceUrl/ccp2_labels";
import CCP2_resource_Label from "@salesforce/label/c.CCP2_resource_Label";
import INDUSTRY_FIELD from "@salesforce/schema/Account.Industry";
import registerAdminUserRedirect from "@salesforce/apex/CCP_HeaderController.registerAdminUserRedirect";
import fetchEInvoiceInfoByUserId from "@salesforce/apex/CCP_HomeCtrl.fetchEInvoiceInfoByUserId";

const FIELDS = [INDUSTRY_FIELD];

// import {
//   subscribe,
//   unsubscribe,
//   onError,
//   setDebugFlag,
//   isEmpEnabled
// } from "lightning/empApi";
import { loadScript } from "lightning/platformResourceLoader";
// import cometdlwc from "@salesforce/resourceUrl/cometd";

import Description from "@salesforce/schema/Account.Description";

// import {
//   subscribe,
//   unsubscribe,
//   onError,
//   setDebugFlag
// } from "lightning/empApi";
//import { subscribe, unsubscribe, onError } from 'lightning/empApi';
const Logo = Vehicle_StaticResource + "/CCP2_Resources/Common/Header_Logo.png";
const UserIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/CCP2_Icon1.png";
const MessageIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/CCP_Icon2.png";
const QuesIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/CCP2_Icon3.png";
const shoplink = Vehicle_StaticResource + "/CCP2_Resources/Common/Outlink.png";
const tncCustomlabel = CCP2_resource_Label;

export default class Ccp2_FusoHeader extends LightningElement {
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  @track showTxnModal = false;
  @track guestNotification = false;
  @track scrollend = false;
  subscription = {};
  channelName = "/event/CCP_Notification__e";
  FusoLogo = Logo;
  UserIcon = UserIcon;
  MessageIcon = MessageIcon;
  QuesIcon = QuesIcon;
  link = shoplink;
  amIGuestUser = true;
  //user list variables
  @track showUserList = false;
  @track vehicleId = "";
  @track showInfo = true;
  @track UserManagment = true;
  @track BranchManagment = true;
  @track IsUserLogin = true;

  //notifications Variables
  @track showNotificationModal = false;
  @track notificationloop = false;
  @track hasVehicle = false;
  @track hasEinvoice = false;
  @track hasNews = false;
  @track hasTerms = false;
  @track emptyallnotifications = false;
  @track hasDuplicate = false;
  @track notificationdisableoncenter = false;
  @track AllCount;
  @track RecallCount;
  @track NewsCount;
  @track TermsCount;
  @track DtfsaCount;
  @track scrollbuttonneed = false;
  @track EinoviceCount;
  @track counttrue = false;
  @track recalltrue = false;
  @track Einvoicetrue = false;
  @track Dtfsatrue = false;
  @track Newstrue = false;
  @track Termstrue = false;
  wiredNotificationResult;
  wiredIndustryDataResult;

  //selected tags
  @track isAllSelected = true;
  @track isVehicleSelected = false;
  @track isFinanceSelected = false;
  @track isEInvoiceSelected = false;
  @track isNewsSelected = false;
  @track isTermsSelected = false;

  @track notificationdata = [];

  FusoShop =
    "https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://jsapps.c3sf1r8zlh-daimlertr2-s1-public.model-t.cc.commerce.ondemand.com/mftbc/ja&scope=openid&response_type=code&ui_locales=ja";

  @track uid = Id;
  loginLink;

  //labels
  labels2 = {};

  //links variables
  homeUrl;
  faqUrl;
  UserManagementUrl;
  addBranchUrl;
  vehicleListUrl;
  vehicleCalenderUrl;
  DashboardUrl;
  profileUrl;
  requestBookUrl;
  einvoiceUrl;
  dtfsaUrl;
  enquiryUrl;
  faqUrl;
  notificationCentreUrl;
  intervalId;

  directBook = false;
  eInvoice = false;
  vehicleList = false;

  channelName = "/event/CCP_Notification__e";

  subscription = {};
  @track hasNewData = false;

  get isNavigationDisabled() {
    return sessionStorage.getItem("ongoingTransaction").length > 0;
  }

  clickedHrefUrl = "";

  //temp
  @track eventReceived = false;
  @track eventData;

  // subscription = {};

  // @track recordId = '001Io000006APXPIA4'; // Record ID (001Io000006APXPIA4)
  @track industry; // To store the value of the Industry field
  @track industryback;

  //  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  //  account({ error, data }) {
  //      if (data) {
  //        this.industryback = this.industry;
  //          this.industry = data.fields.Industry.value;
  //          if(this.industry !== this.industryback){
  //            this.hasNewData = true;
  //          }else{
  //            this.hasNewData = false;
  //          }
  //          console.log("de",this.industy);
  //      } else if (error) {
  //          console.error('Error retrieving record:', error);
  //      }
  //  }

  @track isShowModal1 = false;

  @wire(fullReturnNotificationDataCount)
  wiredIndustryData(result) {
    this.wiredIndustryDataResult = result;

    const { data, error } = result;
    if (data) {
      console.log("data count", data);
      this.industryback = this.industry;
      this.industry = data;

      if (this.industry !== this.industryback) {
        this.hasNewData = true;
      } else {
        this.hasNewData = false;
      }
      if (this.industry < 1) {
        this.hasNewData = false;
      }

      console.log("Industry data:", this.industry);
    } else if (error) {
      console.error("Error fetching industry data:", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_FusoHeader",
        errorLog: err,
        methodName: "WiredIndustryData",
        ViewName: "FusoHeader",
        InterfaceName: "Salesforce",
        EventName: "Data fetch",
        ModuleName: "Header"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }
  // @wire(tempdata)
  // wiredtempData(result) {
  //   const { data, error } = result;
  //   if (data) {
  //     console.log("data temp of veh", data);
  //     console.log("data temp of veh json", JSON.stringify(data));

  //   } else if (error) {
  //     console.error("Error fetching temp data:", error);
  //     let err = JSON.stringify(error);
  //     ErrorLog({
  //       lwcName: "ccp2_FusoHeader",
  //       errorLog: err,
  //       methodName: "WiredIndustryData"
  //     })
  //       .then(() => {
  //         console.log("Error logged successfully in Salesforce");
  //       })
  //       .catch((loggingErr) => {
  //         console.error("Failed to log error in Salesforce:", loggingErr);
  //       });
  //   }
  // }

  //  fetchRecordData() {
  //   // Manually call getRecord using Promises
  //   getRecord({ recordId: this.recordId, fields: FIELDS })
  //       .then((data) => {
  //           this.industryback = this.industry; // Store the previous value
  //           this.industry = data.fields.Industry.value; // Update to the new value

  //           // Check if the new value is different from the previous one
  //           this.hasNewData = this.industry !== this.industryback;
  //           console.log("Fetched Industry in renderedCallback:", this.industry);
  //       })
  //       .catch((error) => {
  //           console.error('Error retrieving record:', error);
  //       });
  // }

  @track newdatapresent = true;

  @wire(returnNotificationData)
  wiredNotificationData(result) {
    this.wiredNotificationResult = result;
    const { error, data } = result;
    if (data) {
      console.log("nresult", JSON.stringify(data));
      if (data.All.length === 0) {
        this.newdatapresent = false;
        this.hasNewData = false;
      } else {
        this.newdatapresent = true;
        this.hasNewData = true;
      }
      if (this.notificationdata.All === 0) {
        this.hasNewData = false;
      }
      this.notificationdata = JSON.parse(JSON.stringify(data));
      if (
        !this.notificationdata.All ||
        this.notificationdata.All.length === 0
      ) {
        this.hasNewData = false;
      }
      //console.log("mew",JSON.stringify(this.notificationdata));
      //       const newNotification = {
      //         id: "a1cIo0000008me0IAA",
      //         vehicleNumber: "車両-209-の-2121",
      //         Date: "2024/10/29",
      //         Description: "リース契約の書類がアップロードされました",
      //         Type: "dtfsa",
      //         vehicleId: "a1aIo000000GwoXIAS"
      //     };
      //     const newNotification2 = {
      //       id: "a1cIo0000008me0IAAL",
      //       vehicleNumber: "車両-209-の-2121",
      //       Date: "2024/10/29",
      //       Description: "１０月の請求書アップロードされました。",
      //       Type: "Invoice",
      //       vehicleId: "a1aIo000000GwoXIAS"
      //   };
      //   const newNotification3 = {
      //     id: "a1cIo0000008me0IAQ",
      //     vehicleNumber: "車両-209-の-2121",
      //     Date: "2024/10/29",
      //     Description: "１０月の請求書アップロードされました。",
      //     Type: "Invoice",
      //     vehicleId: "a1aIo000000GwoXIAS"
      // };
      //     this.notificationdata.push(newNotification,newNotification2,newNotification3);

      // //console.log(
      //   "Notification data in JSON 2",
      //   JSON.stringify(this.notificationdata)
      // );

      console.log("nresult2", this.notificationdata);

      this.notificationdata.Other.sort((a, b) => {
        // Convert both dates to a standard Date object
        const dateA = new Date(a.Date.replace(/\//g, "-"));
        const dateB = new Date(b.Date.replace(/\//g, "-"));

        return dateB - dateA; // Sort in descending order (latest first)
      });

      console.log("nresul3", this.notificationdata);
      this.handleallcardstoshow();
    } else if (error) {
      console.error("Error fetching Notification Data:", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_FusoHeader",
        errorLog: err,
        methodName: "WiredNotificationData",
        ViewName: "FusoHeader",
        InterfaceName: "Salesforce",
        EventName: "Data fetch",
        ModuleName: "Header"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @track isFaqListOpen = false;

  handleFaqListOpen(event) {
    event.stopPropagation();
    console.log("Clicking Question Mark: ", this.isFaqListOpen);
    this.isFaqListOpen = !this.isFaqListOpen;
    this.showVehicleList = false;
    this.showUserList = false;
    this.showNotificationModal = false;
  }

  handleEnquiryClick(event) {
    console.log("enquiry:- ", event.target.dataset.name);
    event.preventDefault();
    this.logoutClick = false;
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    let isAnyTrue = false;
    if (Object.keys(ongoingTransactions).length !== 0) {
      for (const key in ongoingTransactions) {
        if (ongoingTransactions[key] === true) {
          isAnyTrue = true;
          break;
        }
      }
    }

    this.clickedHrefUrl = event.currentTarget.getAttribute("href");
    if (!isAnyTrue) {
      if (this.clickedHrefUrl) {
        window.location.href = this.clickedHrefUrl;
      }
    } else {
      this.showTxnModal = true;
    }
  }

  async handleLinkClick(event) {
    console.log("notification:- ", event.target.dataset.name);
    event.preventDefault();
    this.logoutClick = false;
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};
    //console.log("ongoingTransactions", ongoingTransactions);

    let isAnyTrue = false;
    if (Object.keys(ongoingTransactions).length === 0) {
      //console.log("get nothing");
    } else {
      for (const key in ongoingTransactions) {
        if (ongoingTransactions[key] === true) {
          isAnyTrue = true;
          //console.log("getting a true from obj");
        }
      }
    }

    // if(event.target.dataset.name === 'notification'){
    //   if(isAnyTrue){
    //     this.showTxnModal = true;
    //     this.notificationTxn = true;
    //     this.notificationEvent = event;
    //   }else{
    //     this.notificationTxn = false;
    //     this.openNotificationModal(event);
    //   }
    // }

    // eInvoice のリンクの場合のみ処理を追加
    if (event.target.dataset.name === "eInvoice") {
      try {
        const result = await fetchEInvoiceInfoByUserId();
        console.log(result);

        if (result) {
          // eInvoiceが有効な場合は画面遷移
          window.location.href = this.einvoiceUrl;
        } else {
          // eInvoiceが無効な場合はモーダルを表示
          this.isShowModal1 = true;
          console.log(this.isShowModal1);
        }
      } catch (error) {
        console.error("Error fetching eInvoice info:", error);
        // エラー発生時の処理（例: エラーメッセージの表示）
      }
      return; // 以降の処理は実行しない
    }

    this.clickedHrefUrl = event.currentTarget.getAttribute("href");
    if (!isAnyTrue) {
      if (this.clickedHrefUrl) {
        window.location.href = this.clickedHrefUrl;
      }
    } else {
      this.showTxnModal = true;
    }
  }

  hideModalBox() {
    this.isShowModal1 = false;
  }

  txnNo() {
    this.showTxnModal = false;
    this.notificationTxn = false;
  }

  txnYes() {
    if (this.clickedHrefUrl && !this.logoutClick) {
      sessionStorage.removeItem("ongoingTransaction");
      window.location.href = this.clickedHrefUrl;
    } else if (this.logoutClick) {
      getLogoutURL()
        .then(async (result) => {
          const sitePrefix = basePath.replace(/\/s$/i, "");
          // document.cookie.split(";").forEach((c) => {
          //   document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
          // });
          const defLogoutURL = sitePrefix + "/secur/logout.jsp";
          if (result) {
            await fetch(defLogoutURL);
            window.location.replace(defLogoutURL);
          } else {
            window.location.replace(defLogoutURL);
          }
        })
        .catch((error) => {
          this.errors = JSON.stringify(error);
          console.error("getLogoutURL errors:" + JSON.stringify(error));
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "getLogoutURL",
            ViewName: "FusoHeader",
            InterfaceName: "Salesforce",
            EventName: "Data fetch",
            ModuleName: "Header"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });
    } else if (this.notificationTxn) {
      // sessionStorage.removeItem("ongoingTransaction");
      updateRecord(this.recordInput2)
        .then(() => {
          this.notificationdata = this.notificationdata.All.filter(
            (notification) => notification.id !== id
          );
          this.notificationdata = this.notificationdata.Other.filter(
            (notification) => notification.id !== id
          );
        })
        .catch((error) => {
          console.error("Error updating record:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "updateRecord",
            ViewName: "FusoHeader",
            InterfaceName: "Salesforce",
            EventName: "Data update",
            ModuleName: "Header"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });

      let url = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=recall`;
      window.location.href = url;
    }
  }

  loadLanguage() {
    Languagei18n()
      .then((data) => {
        this.Languagei18n = data;
        //console.log("lang Method", data, this.Languagei18n);
        return this.loadI18nextLibrary(); // Return the promise for chaining
      })
      .then(() => {
        return this.loadLabels(); // Load labels after i18next is ready
      })
      .then(() => {
        //console.log("Upload Label: Header", this.isLanguageChangeDone); // Check language change status
      })
      .catch((error) => {
        console.error("Error loading language or labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoHeader",
          errorLog: err,
          methodName: "LoadLanguage",
          ViewName: "FusoHeader",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Header"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  checkManagerUser() {
    checkManagerUser()
      .then((result) => {
        this.UserManagment = result;
        this.BranchManagment = result;
      })
      .catch((error) => {
        this.errors = JSON.stringify(error);
        console.error("checkManagerUser errors:" + JSON.stringify(error));
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoHeader",
          errorLog: err,
          methodName: "checkManagerUser",
          ViewName: "FusoHeader",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Header"
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

  loadLabels() {
    fetch(`${labelsBranch}/labelsHeaderFooter.json`)
      .then((response) => response.json())
      .then((data) => {
        const userLocale = this.getLocale(); // Method to determine user locale (e.g., 'en', 'jp')
        // Initialize i18next with the fetched labels
        // eslint-disable-next-line no-undef
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
            //console.log("User Locale: Header", userLocale);
            //console.log("User Labels: Header", this.labels2);
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoHeader",
          errorLog: err,
          methodName: "Load Labels",
          ViewName: "FusoHeader",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Header"
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
    //console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === "en_US") {
      //console.log("working1");
      return "en";
    }
    return "jp";
  }

  // Singh Jashanpreet Modified Last
  loadCheckGuestUser() {
    checkGuestUser().then((result) => {
      console.log("guest and tnc check", result);
      //Redirection logic for real time response
      if (result.agreeTnC === false) {
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split("/s/")[0] + "/s/";
        console.log("base url ", baseUrl);
        if (
          currentUrl !== baseUrl &&
          !currentUrl.includes("/registerAdminUser") &&
          !currentUrl.includes("/mftbcUsageTerms") &&
          !currentUrl.includes("/inquiry")
        ) {
          console.log("Extra parameters detected in URL, reloading window...");
          window.location.href = baseUrl;
        }
      }
      if (result.GuestUser === true || result.agreeTnC === false) {
        this.guestNotification = true;
        getLoginURL().then((result2) => {
          //console.log("this.loginLink", result2);
          this.loginLink = result2;
        });
      } else {
        this.amIGuestUser = result.GuestUser;
        this.guestNotification = false;
        this.checkManagerUser();
      }
    });
  }

  //リダイレクト処理
  registerRedirect() {
    // Apexメソッドを呼び出してリダイレクトURLを取得
    registerAdminUserRedirect()
      .then((result) => {
        console.log("registerAdminUserRedirect", result);
        if (result) {
          // リダイレクトURLが取得できた場合
          window.location.href = result; // 取得したURLにリダイレクト
        }
      })
      .catch((error) => {
        console.error("Error occurred while handling redirect:", error);
      });
  }
  timeZone;
  region;
  connectedCallback() {
    // 現在のURLを取得
    const currentUrl = window.location.pathname;
    // 申込フォーム画面またはお問い合わせフォームではない場合
    if (
      currentUrl !== "/s/registerAdminUser" &&
      currentUrl !== "/s/inquiry" &&
      currentUrl !== "/s/mftbcUsageTerms"
    ) {
      console.log("Top page detected. Executing redirect...");
      this.registerRedirect(); // リダイレクト処理を呼び出す
    } else {
      console.log("Not a top page. Skipping redirect...");
    }
    this.loadCheckGuestUser();
    this.region = Intl.DateTimeFormat().resolvedOptions().locale;
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    this.getAllUrl();
    getAllServices({ userId: this.uid, refresh: 0 })
      .then((res) => {
        res.forEach((elm) => {
          if (elm.apiName === "FUSO_CCP_External_Financial_service") {
            this.directBook = elm.isActive;
          } else if (elm.apiName === "E_invoice") {
            this.eInvoice = elm.isActive;
          } else if (elm.apiName === "FUSO_CCP_External_Vehicle_management") {
            this.vehicleList = elm.isActive;
          }
          if (this.directBook === false && this.eInvoice === false) {
            this.scrollbuttonneed = false;
          } else {
            this.scrollbuttonneed = true;
          }
        });
      })
      .catch((error) => {
        this.errors = JSON.stringify(error);
        console.error("checkManagerUser errors:" + JSON.stringify(error));
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoHeader",
          errorLog: err,
          methodName: "getAllServices",
          ViewName: "FusoHeader",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "Header"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  //links for href

  getAllUrl() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      this.directBookingUrl = baseUrl.split("/s/")[0] + "/s/directBooking";
      this.vehicleListUrl = baseUrl.split("/s/")[0] + "/s/vehiclemanagement";
      this.vehicleCalenderUrl =
        baseUrl.split("/s/")[0] + "/s/vehicle-maintenance-calendar";
      this.DashboardUrl = baseUrl.split("/s/")[0] + "/s/vehicle-dashboard";
      this.notificationsUrl = baseUrl.split("/s/")[0] + "/s/notifications";
      this.requestBookUrl = baseUrl.split("/s/")[0] + "/s/requestBook";
      this.einvoiceUrl = baseUrl.split("/s/")[0] + "/s/einvoice";
      this.profileUrl = baseUrl.split("/s/")[0] + "/s/profile";
      this.addUserUrl = baseUrl.split("/s/")[0] + "/s/addUser";
      this.UserManagementUrl = baseUrl.split("/s/")[0] + "/s/usermanagement";
      this.addBranchUrl = baseUrl.split("/s/")[0] + "/s/branchmangement";
      this.inquiryUrl = baseUrl.split("/s/")[0] + "/s/inquiry";
      this.faqUrl = baseUrl.split("/s/")[0] + "/faq/s/";
      this.homeUrl = baseUrl.split("/s/")[0] + "/s/";
      this.dtfsaUrl = baseUrl.split("/s/")[0] + "/s/dtfsa-docs";
      this.enquiryUrl = baseUrl.split("/s/")[0] + "/s/inquiry";
      this.faqUrl = baseUrl.split("/s/")[0] + "/s/faq";
      this.notificationCentreUrl =
        baseUrl.split("/s/")[0] + "/s/notification-centre";
    }
  }

  openuserlist(event) {
    event.stopPropagation();
    this.showVehicleList = false;
    this.showUserList = !this.showUserList;
    this.isFaqListOpen = false;
    this.showNotificationModal = false;
    document.body.style.overflow = "";
  }

  //LOGOUT
  handleLogout() {
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    let isAnyTrue = false;
    if (Object.keys(ongoingTransactions).length === 0) {
      // console.log("get nothing");
    } else {
      for (const key in ongoingTransactions) {
        if (ongoingTransactions[key] === true) {
          isAnyTrue = true;
          //console.log("getting a true from obj");
        }
      }
    }

    if (!isAnyTrue) {
      getLogoutURL()
        .then(async (result) => {
          console.log("heree1", result);
          const sitePrefix = basePath.replace(/\/s$/i, "");
          const defLogoutURL = sitePrefix + "/secur/logout.jsp";
          if (result) {
            await fetch(defLogoutURL);
            console.log("heree");
            window.location.replace(defLogoutURL);
          } else {
            console.log("heree2");
            window.location.replace(defLogoutURL);
          }
          // window.location.href = defLogoutURL;
          // setTimeout(() => {
          //   window.location.href = 'https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/b2c_1a_signup_signin/oauth2/v2.0/logout';
          // }, 3000);
        })
        .catch((error) => {
          this.errors = JSON.stringify(error);
          console.error("getLogoutURL errors:" + JSON.stringify(error));
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "getLogoutURL",
            ViewName: "FusoHeader",
            InterfaceName: "Salesforce",
            EventName: "Data fetch",
            ModuleName: "Header"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });
    } else {
      this.logoutClick = true;
      this.showTxnModal = true;
    }
  }

  handleOutsideClick = (event) => {
    const dataDropElement = this.template.querySelector(".user");
    const listsElement = this.template.querySelector(".lists");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showUserList = false;
    }
  };
  handleOutsideClickNewone = (event) => {
    const dataDropElement = this.template.querySelector(".newdev");
    const listsElement = this.template.querySelector(".lists-vehicle");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showVehicleList = false;
    }
  };
  handleOutsideClick2 = (event) => {
    const dataDropElement = this.template.querySelector(".Notifications");
    const listsElement = this.template.querySelector(
      ".modal-window-Notification-Modal"
    );

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.isAllSelected = true;
      this.isEInvoiceSelected = false;
      this.isFinanceSelected = false;
      this.isVehicleSelected = false;
      this.showNotificationModal = false;
      this.scrollend = false;
      this.isNewsSelected = false;
      this.isTermsSelected = false;
      document.body.style.overflow = "";
    }
  };

  handleOutsideClick3 = (event) => {
    const dataDropElement = this.template.querySelector(".more");
    const listsElement = this.template.querySelector(".lists2");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      //console.log("Triggered Faq Outside: ");
      this.isFaqListOpen = false;
      document.body.style.overflow = "";
    }
  };

  renderedCallback() {
    //this.fetchIndustryData();
    if (this.isLanguageChangeDone) {
      //console.log("Working 1");
      this.loadLanguage();
    }
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      document.addEventListener("click", this.handleOutsideClick3.bind(this));
      document.addEventListener(
        "click",
        this.handleOutsideClickNewone.bind(this)
      );
      this.outsideClickHandlerAdded = true;
    }
    let allLinks = this.template.querySelectorAll("a");
    let vehickeLink = this.template.querySelector(".newdev");
    let activeLinkName = window.location.href;

    if (
      activeLinkName?.includes("vehiclemanagement") ||
      activeLinkName?.includes("vehicle-maintenance-calendar") ||
      activeLinkName?.includes("vehicle-dashboard") ||
      activeLinkName?.includes("vehicle-details")
    ) {
      vehickeLink?.classList.add("active");
    }

    allLinks?.forEach((elm) => {
      const linkId = elm.dataset?.id;
      if (activeLinkName === linkId) {
        elm.classList.add("active");
      } else if (
        activeLinkName.includes("/s/vehicle-details") &&
        linkId.includes("/s/vehiclemanagement")
      ) {
        elm.classList.add("active");
      }
    });

    this.startDataRefresh();
    // if (this.notificationdata.All.length === 0) {
    //   this.hasNewData = false;
    // }
  }

  refreshData() {
    refreshApex(this.wiredNotificationResult).then(() => {
      // console.log("Data refreshed:", JSON.stringify(this.notificationdata));
    });
  }
  refreshData2() {
    refreshApex(this.wiredNotificationResult).then(() => {
      // this.showNotificationModal = true;
      // document.body.style.overflow = "hidden";
      //console.log("Data refreshed:", JSON.stringify(this.notificationdata));
    });
  }

  startDataRefresh() {
    this.refreshInterval = setInterval(() => {
      refreshApex(this.wiredIndustryDataResult).then(() => {
        // console.log("Data refreshed count:", JSON.stringify(this.industry));
      });
    }, 12000);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
    document.removeEventListener("click", this.handleOutsideClick2.bind(this));
    document.removeEventListener("click", this.handleOutsideClick3.bind(this));
    document.removeEventListener(
      "click",
      this.handleOutsideClickNewone.bind(this)
    );
    // this.handleUnsubscribe();
    // this.handleUnsubscribe();
  }
  //notification modal
  openNotificationModal(event) {
    // console.log("notification:- ", event.target);
    // console.log("notification1:- ", event.target.dataset.name);
    this.refreshData();
    event.stopPropagation();
    // console.log("notification2:- ", event.target.dataset.name);
    this.showNotificationModal = true;
    this.showUserList = false;
    this.isFaqListOpen = false;
    document.body.style.overflow = "hidden";
  }

  closeNotificationModal() {
    this.isAllSelected = true;
    this.isEInvoiceSelected = false;
    this.isFinanceSelected = false;
    this.isNewsSelected = false;
    this.isTermsSelected = false;
    this.isVehicleSelected = false;
    this.scrollend = false;
    this.showNotificationModal = false;
    document.body.style.overflow = "";
  }
  // handleallcardstoshow() {
  //   this.notificationdata.forEach((notification) => {
  //     notification["a"] = false;
  //     notification["b"] = false;
  //     notification["c"] = false;
  //     //console.log("workife");
  //     notification["d"] = false;
  //     notification["e"] = false;
  //     const formattedDate = this.formatJapaneseDate(notification.Date);
  //     notification.Date = formattedDate;
  //     if (notification.newsDescription) {
  //       notification.newsDescription = this.convertRichTextToPlainText(
  //         notification.newsDescription
  //       );
  //       notification.newsDescription = this.substringToProperLength(
  //         notification.newsDescription,
  //         70
  //       );
  //     }
  //     if (notification.Description) {
  //       notification.Description = this.substringToProperLength(
  //         notification.Description,
  //         70
  //       );
  //     }
  //     if (notification.newsTitle) {
  //       notification["newsTitleMain"] = notification.newsTitle || "";
  //       notification.newsTitle = this.substringToProperLength(
  //         notification.newsTitle,
  //         12
  //       );
  //     }
  //     //console.log("Formatted Date:", formattedDate);
  //     switch (notification.Type) {
  //       case "VehicleExp":
  //         notification.a = true;
  //         break;
  //       case "Recall":
  //         notification.b = true;
  //         break;
  //       case "eInvoice":
  //         notification.c = true;
  //         break;
  //       case "dtfsa":
  //         notification.d = true;
  //         break;
  //       case "News":
  //         notification.e = true;
  //         break;
  //       default:
  //         break;
  //     }
  //   });
  //   this.AllCount = this.notificationdata.length || 0;
  //   this.RecallCount =
  //   this.notificationdata.filter(
  //   (notification) => notification.Type === "Recall" || notification.Type === "VehicleExp"
  //   ).length || 0;;
  //   this.EinoviceCount =
  //     this.notificationdata.filter(
  //       (notification) => notification.Type === "eInvoice"
  //     ).length || 0;
  //   this.DtfsaCount =
  //     this.notificationdata.filter(
  //       (notification) => notification.Type === "dtfsa"
  //     ).length || 0;
  //   this.NewsCount =
  //     this.notificationdata.filter(
  //       (notification) => notification.Type === "News"
  //     ).length || 0;

  //   this.counttrue = this.AllCount > 0 ? true : false;
  //   this.recalltrue = this.RecallCount > 0 ? true : false;
  //   this.Einvoicetrue = this.EinoviceCount > 0 ? true : false;
  //   this.Dtfsatrue = this.DtfsaCount > 0 ? true : false;
  //   this.Newstrue = this.NewsCount > 0 ? true : false;

  //   this.AllCount = this.AllCount > 9 ? "9+" : this.AllCount;
  //   this.RecallCount = this.RecallCount > 9 ? "9+" : this.RecallCount;
  //   this.EinoviceCount = this.EinoviceCount > 9 ? "9+" : this.EinoviceCount;
  //   this.DtfsaCount = this.DtfsaCount > 9 ? "9+" : this.DtfsaCount;
  //   this.NewsCount = this.NewsCount > 9 ? "9+" : this.NewsCount;
  //   // console.log("all the data",this.AllCount, this.RecallCount, this.EinoviceCount, this.DtfsaCount, this.NewsCount);

  //   this.hasVehicle = this.notificationdata.some(
  //     (notification) =>  notification.a || notification.b
  //   );
  //   this.hasEinvoice = this.notificationdata.some(
  //     (notification) => notification.c
  //   );
  //   this.hasDuplicate = this.notificationdata.some(
  //     (notification) => notification.d
  //   );
  //   this.hasNews = this.notificationdata.some((notification) => notification.e);

  //   if (this.notificationdata.length == 0) {
  //     this.emptyallnotifications = true;
  //     //console.log("done");
  //   } else {
  //     this.emptyallnotifications = false;
  //     //console.log("no done");
  //   }
  // }
  handleallcardstoshow() {
    const processData = (data) => {
      data.forEach((notification) => {
        notification["a"] = false;
        notification["b"] = false;
        notification["c"] = false;
        notification["d"] = false;
        notification["e"] = false;
        notification["f"] = false;

        // Format Date
        const formattedDate = this.formatJapaneseDate(notification.Date);
        notification.Date = formattedDate;

        // Process newsDescription
        if (notification.newsDescription) {
          notification.newsDescription = this.convertRichTextToPlainText(
            notification.newsDescription
          );
          notification["FullNewsDescription"] =
            this.convertRichTextToPlainText(notification.newsDescription) || "";
          if (notification.Type !== "VehicleExp") {
            // console.log("coming inside if: ", notification.Type);
            notification.newsDescription = this.substringToProperLength(
              notification.newsDescription,
              128
            );
          }
        }
        // Process Description
        if (notification.Description) {
          notification["FullDescription"] = notification.Description || "";
          if (notification.Type === "dtfsa") {
            notification.FullDescription = notification.Description.replaceAll(
              ",",
              "、"
            );
            notification.Description = notification.Description.replaceAll(
              ",",
              "、"
            );
          }
          notification.Description = this.substringToProperLength(
            notification.Description,
            100
          );
        }
        if (
          this.notificationdata.Other &&
          this.notificationdata.Other.length > 0
        ) {
          this.notificationdata.Other.sort(
            (a, b) => new Date(b.Date) - new Date(a.Date)
          );
        }
        // Process newsTitle
        if (notification.newsTitle) {
          notification["newsTitleMain"] = notification.newsTitle || "";
          notification.newsTitle = this.substringToProperLength(
            notification.newsTitle,
            23
          );
        }

        // Set flags based on Type
        let listOfData = [];
        switch (notification.Type) {
          case "VehicleExp":
            notification.a = true;

            listOfData = notification.newsDescription?.split(",") || [];
            notification.showSecondLineOfDotList = listOfData.length;
            notification.firstDotData = listOfData.length ? listOfData[0] : "";
            notification.showDots = listOfData.length > 1;

            break;
          case "Recall":
            notification.b = true;

            listOfData = notification.vehicleNumber;
            notification.showSecondLineOfDotList = listOfData.length;
            notification.firstDotData = listOfData.length ? listOfData : "";
            notification.showDots = false;

            break;
          case "eInvoice":
            notification.c = true;
            // if(notification.NotificationCreatedDate){
            //   notification.Date = this.formatJapaneseDate(notification.NotificationCreatedDate);
            // }else{
            //   notification.Date = notification.Date;
            // }
            break;
          case "dtfsa":
            notification.d = true;

            listOfData = notification.DocType?.split(",") || [];
            notification.showSecondLineOfDotList = listOfData.length;
            notification.firstDotData = listOfData.length ? listOfData[0] : "";
            notification.showDots = listOfData.length > 1;

            // if(notification.NotificationCreatedDate){
            //   notification.Date = this.formatJapaneseDate(notification.NotificationCreatedDate);
            // }else{
            //   notification.Date = notification.Date;
            // }
            // console.log("date of dtfsa", notification.Date);
            if (notification.CorrectFlag__c === "1") {
              notification.title = "FUSOリース書類再発行のお知らせ";
            } else {
              notification.title = "FUSOリース書類発行のお知らせ";
            }
            break;
          case "News":
            notification.e = true;
            break;
          case "Terms":
            notification.f = true;
            break;
          default:
            break;
        }
      });
      console.log("nresultfinal", this.notificationdata);
      //  console.log(
      //     "others Notifications",
      //     JSON.stringify(this.notificationdata.Other)
      //   );
    };

    // Process Other and All categories
    if (this.notificationdata.Other) {
      processData(this.notificationdata.Other);
    }
    if (this.notificationdata.All) {
      processData(this.notificationdata.All);
    }

    // Calculate counts and update flags
    this.AllCount = this.notificationdata.All?.length || 0;
    let recallc =
      this.notificationdata.Other?.filter(
        (notification) => notification.Type === "Recall"
      ).length || 0;
    let VehicleExpC =
      this.notificationdata.Other?.filter(
        (notification) => notification.Type === "VehicleExp"
      ).length || 0;
    this.RecallCount = recallc + VehicleExpC;
    this.EinoviceCount =
      this.notificationdata.Other?.filter(
        (notification) => notification.Type === "eInvoice"
      ).length || 0;
    this.DtfsaCount =
      this.notificationdata.Other?.filter(
        (notification) => notification.Type === "dtfsa"
      ).length || 0;
    this.NewsCount =
      this.notificationdata.Other?.filter(
        (notification) => notification.Type === "News"
      ).length || 0;
    this.TermsCount =
      this.notificationdata.Other?.filter(
        (notification) => notification.Type === "Terms"
      ).length || 0;

    // console.log("all count", this.AllCount);
    // console.log("recall count", this.RecallCount);
    // console.log("vehicle count", this.EinoviceCount);
    // console.log("news count", this.NewsCount);
    // console.log("dtfsa count", this.DtfsaCount);

    this.counttrue = this.AllCount > 0;
    this.recalltrue = this.RecallCount > 0;
    this.Einvoicetrue = this.EinoviceCount > 0;
    this.Dtfsatrue = this.DtfsaCount > 0;
    this.Newstrue = this.NewsCount > 0;
    this.Termstrue = this.TermsCount > 0;

    // Adjust counts for display
    this.AllCount = this.AllCount > 9 ? "9+" : this.AllCount;
    this.RecallCount = this.RecallCount > 9 ? "9+" : this.RecallCount;
    this.EinoviceCount = this.EinoviceCount > 9 ? "9+" : this.EinoviceCount;
    this.DtfsaCount = this.DtfsaCount > 9 ? "9+" : this.DtfsaCount;
    this.NewsCount = this.NewsCount > 9 ? "9+" : this.NewsCount;
    this.TermsCount = this.TermsCount > 9 ? "9+" : this.TermsCount;

    // Check flags for Other and All
    const allNotifications = [
      ...(this.notificationdata?.Other || []),
      ...(this.notificationdata?.All || [])
    ];

    this.hasVehicle = allNotifications.some(
      (notification) => notification.a || notification.b
    );
    this.hasEinvoice = allNotifications.some((notification) => notification.c);
    this.hasDuplicate = allNotifications.some((notification) => notification.d);
    this.hasNews = allNotifications.some((notification) => notification.e);
    this.hasTerms = allNotifications.some((notification) => notification.f);

    // Check if notifications are empty
    this.emptyallnotifications = allNotifications.length === 0;
    // console.log(
    //   "new data of notifications",
    //   JSON.stringify(this.notificationdata)
    // );
  }

  // goToNotificationCenter() {
  //   let baseUrl = window.location.href;
  //   if (baseUrl.indexOf("/s/") !== -1) {
  //     let NotificationCentreUrl =
  //       baseUrl.split("/s/")[0] + "/s/notification-centre";
  //     window.location.href = NotificationCentreUrl;
  //   }
  // }
  handleInsideclick(event) {
    event.stopPropagation();
  }
  convertRichTextToPlainText(richText) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = richText;
    return tempDiv.textContent || tempDiv.innerText || "";
  }

  handleAllselected() {
    this.isAllSelected = true;
    this.isVehicleSelected = false;
    this.isEInvoiceSelected = false;
    this.isFinanceSelected = false;
    this.isNewsSelected = false;
    this.isTermsSelected = false;
  }

  handleVehicleselected() {
    this.isAllSelected = false;
    this.isVehicleSelected = true;
    this.isEInvoiceSelected = false;
    this.isFinanceSelected = false;
    this.isNewsSelected = false;
    this.isTermsSelected = false;
  }

  handleEInvoiceselected() {
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isEInvoiceSelected = true;
    this.isFinanceSelected = false;
    this.isNewsSelected = false;
    this.isTermsSelected = false;
  }

  handleDTFSAselected() {
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isEInvoiceSelected = false;
    this.isFinanceSelected = true;
    this.isNewsSelected = false;
    this.isTermsSelected = false;
  }
  handleNewsselected() {
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isEInvoiceSelected = false;
    this.isFinanceSelected = false;
    this.isNewsSelected = true;
    this.isTermsSelected = false;
  }
  handleTermsselected() {
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isEInvoiceSelected = false;
    this.isFinanceSelected = false;
    this.isNewsSelected = false;
    this.isTermsSelected = true;
  }

  get Allselected() {
    return this.isAllSelected ? "text-right-red" : "";
  }

  get vehicleSelected() {
    return this.isVehicleSelected ? "text-right-red" : "";
  }

  get EInvoiceSelected() {
    return this.isEInvoiceSelected ? "text-right-red" : "";
  }

  get financeSelected() {
    return this.isFinanceSelected ? "text-right-red" : "";
  }
  get NewsSelected() {
    return this.isNewsSelected ? "text-right-red" : "";
  }
  get TermsSelected() {
    return this.isTermsSelected ? "text-right-red" : "";
  }
  clickonchecked(event) {
    const notificationCard = event.target.closest(".notification-card");
    const id = notificationCard ? notificationCard.dataset.id : null;
    const type = notificationCard ? notificationCard.dataset.type : null;
    // console.log("d32", type);

    if (id) {
      insertRecord({ notificationId: id, notificationType: type })
        .then(() => {
          //console.log(`Record ${id} updated: flag__c set to true.`);
          this.refreshData();
          this.notificationdata = this.notificationdata.All.filter(
            (notification) => notification.id !== id
          );
          this.notificationdata = this.notificationdata.Other.filter(
            (notification) => notification.id !== id
          );
          if (this.notificationdata.All === 0) {
            this.hasNewData = false;
          }
        })
        .catch((error) => {
          console.error("Error updating record:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "clickonchecked",
            ViewName: "FusoHeader",
            InterfaceName: "Salesforce",
            EventName: "Data update",
            ModuleName: "Header"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });
    }
    //console.log(
    //   "Updated notification data:",
    //   JSON.stringify(this.notificationdata)
    // )

    this.hasVehicle = this.notificationdata.All.some(
      (notification) => notification.b
    );
    this.hasEinvoice = this.notificationdata.All.some(
      (notification) => notification.c
    );
    this.hasDuplicate = this.notificationdata.All.some(
      (notification) => notification.d
    );
    this.hasNews = this.notificationdata.All.some(
      (notification) => notification.e
    );
    this.hasTerms = this.notificationdata.All.some(
      (notification) => notification.f
    );
    if (this.notificationdata.length == 0) {
      this.emptyallnotifications = true;
      //console.log("done");
    } else {
      this.emptyallnotifications = false;
      //console.log("no done");
    }
  }
  // clickoncheckedNews(event) {
  //   const notificationCard = event.target.closest(".notification-card");
  //   const id = notificationCard ? notificationCard.dataset.id : null;
  //   console.log("d3", id);

  //   if (id) {
  //     insertRecordNews({notificationId: id})
  //       .then(() => {
  //         //console.log(`Record ${id} updated: flag__c set to true.`);
  //         this.notificationdata = this.notificationdata.filter(
  //           (notification) => notification.id !== id
  //         );
  //         this.refreshData();
  //       })
  //       .catch((error) => {
  //         console.error("Error updating record:", error);
  //       });

  //     if (this.notificationdata === 0) {
  //       this.hasNewData = false;
  //     }

  //   }
  //   //console.log(
  //   //   "Updated notification data:",
  //   //   JSON.stringify(this.notificationdata)
  //   // )

  //   this.hasVehicle = this.notificationdata.some(
  //     (notification) => notification.b
  //   );
  //   this.hasEinvoice = this.notificationdata.some(
  //     (notification) => notification.c
  //   );
  //   this.hasDuplicate = this.notificationdata.some(
  //     (notification) => notification.d
  //   );
  //   this.hasNews = this.notificationdata.some(
  //     (notification) => notification.e
  //   );
  //   if (this.notificationdata.length == 0) {
  //     this.emptyallnotifications = true;
  //     //console.log("done");
  //   } else {
  //     this.emptyallnotifications = false;
  //     //console.log("no done");
  //   }
  // }
  GotoDetailsPage(event) {
    const vehicleDetailElement = event.target.dataset.vehid;
    console.log("veh", vehicleDetailElement);
    if (vehicleDetailElement) {
      const vehicleIdMain = event.target.dataset.vehid;
      this.vehicleId = vehicleIdMain;
      // console.log("this", JSON.stringify(this.notificationdata));
      const matchingNotification = this.notificationdata.All.find(
        (notification) => notification.vehicleId === this.vehicleId
      );
      // console.log("match", matchingNotification.id);
      // console.log("working id ", this.vehicleId);
      let recId = matchingNotification.id;
      let type = "Recall";

      insertRecord({ notificationId: recId, notificationType: type })
        .then(() => {
          let url = `/s/vehicle-details?vehicleId=${this.vehicleId}&instance=recall`;
          window.location.href = url;
        })
        .catch((error) => {
          console.error("Error updating record:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "insertRecord",
            ViewName: "FusoHeader",
            InterfaceName: "Salesforce",
            EventName: "Data update",
            ModuleName: "Header"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });

      let url = `/s/vehiclemanagement?vehicleId=${this.vehicleId}&instance=recall`;
      window.location.href = url;
    } else {
      console.error("Vehicle detail element not found");
    }
  }
  GotoListPage(event) {
    const recId = event.target.dataset.id;
    // console.log("ts", recId);
    let type = "vehicleExp";

    insertRecord({ notificationId: recId, notificationType: type })
      .then(() => {
        let url = `/s/vehiclemanagement?filter=vehicle_expiry_notification`;
        window.location.href = url;
      })
      .catch((error) => {
        console.error("Error updating record:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoHeader",
          errorLog: err,
          methodName: "insertRecord",
          ViewName: "FusoHeader",
          InterfaceName: "Salesforce",
          EventName: "Data update",
          ModuleName: "Header"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  Gotodtfsa(event) {
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    let isAnyTrue = false;
    if (Object.keys(ongoingTransactions).length === 0) {
      // console.log("get nothing");
    } else {
      for (const key in ongoingTransactions) {
        if (ongoingTransactions[key] === true) {
          isAnyTrue = true;
          //console.log("getting a true from obj");
        }
      }
    }

    if (isAnyTrue) {
      const notificationCard = event.currentTarget;
      const id = notificationCard ? notificationCard.dataset.id : null;
      console.log("id: ", id);
      const type = notificationCard ? notificationCard.dataset.type : null;
      // console.log("d32", type);

      insertRecord({ notificationId: id, notificationType: type })
        .then(() => {
          //console.log(`Record ${id} updated: flag__c set to true.`);
          let urlofdtfsa = this.dtfsaUrl + "?instance=" + id;
          window.location.href = urlofdtfsa;
        })
        .catch((error) => {
          console.error("Error updating record:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "gotodtfsa",
            ViewName: "FusoHeader",
            InterfaceName: "Salesforce",
            EventName: "Data update",
            ModuleName: "Header"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });

      this.showTxnModal = true;
      this.notificationTxn = true;
    } else {
      const notificationCard = event.target;
      const id = notificationCard ? notificationCard.dataset.id : null;
      const type = notificationCard ? notificationCard.dataset.type : null;
      //console.log("d32", type);

      insertRecord({ notificationId: id, notificationType: type })
        .then(() => {
          //console.log(`Record ${id} updated: flag__c set to true.`);
          window.location.href = this.dtfsaUrl + "?instance=" + id;
        })
        .catch((error) => {
          console.error("Error updating record:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "gotodtfsa",
            ViewName: "FusoHeader",
            InterfaceName: "Salesforce",
            EventName: "Data update",
            ModuleName: "Header"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });
    }
  }
  GotoEinovice(event) {
    let ongoingTransactions =
      JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

    let isAnyTrue = false;
    if (Object.keys(ongoingTransactions).length === 0) {
      // console.log("get nothing");
    } else {
      for (const key in ongoingTransactions) {
        if (ongoingTransactions[key] === true) {
          isAnyTrue = true;
          //console.log("getting a true from obj");
        }
      }
    }

    if (isAnyTrue) {
      const notificationCard = event.currentTarget;
      console.log("d32", id);
      const id = notificationCard ? notificationCard.dataset.id : null;
      const type = notificationCard ? notificationCard.dataset.type : null;
      console.log("d32", id);

      insertRecord({ notificationId: id, notificationType: type })
        .then(() => {
          //console.log(`Record ${id} updated: flag__c set to true.`);
          window.location.href = this.einvoiceUrl;
        })
        .catch((error) => {
          console.error("Error updating record:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "gotodtfsa",
            ViewName: "FusoHeader",
            InterfaceName: "Salesforce",
            EventName: "Data update",
            ModuleName: "Header"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });
      this.showTxnModal = true;
      this.notificationTxn = true;
    } else {
      const notificationCard = event.target;
      const id = notificationCard ? notificationCard.dataset.id : null;
      const type = notificationCard ? notificationCard.dataset.type : null;
      // console.log("d32", type);

      insertRecord({ notificationId: id, notificationType: type })
        .then(() => {
          //console.log(`Record ${id} updated: flag__c set to true.`);
          window.location.href = this.einvoiceUrl;
        })
        .catch((error) => {
          console.error("Error updating record:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "gotodtfsa",
            ViewName: "FusoHeader",
            InterfaceName: "Salesforce",
            EventName: "Data update",
            ModuleName: "Header"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });
    }
  }
  formatJapaneseDate(isoDate) {
    // const date = new Date(isoDate);
    // const year = date.getFullYear();
    // const month = date.getMonth() + 1;
    // const day = date.getDate();
    // let reiwaYear;
    // if (year === 2019) {
    //   if (month <= 4) {
    //     return `平成31年${month}月${day}日`;
    //   } else if (month > 4) {
    //     return `令和1年${month}月${day}日`;
    //   }
    // } else if (year > 2019) {
    //   reiwaYear = year - 2018;
    //   return `令和${reiwaYear}年${month}月${day}日`;
    // } else {
    //   reiwaYear = 30 - (2018 - year);
    //   return `平成${reiwaYear}年${month}月${day}日`;
    // }
    // return isoDate;
    if (isoDate == undefined) {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let reiwaYear;
    return `${year}年${month}月${day}日`;
  }

  // clickoncheckedhardcoded(event) {
  //   const notificationCard = event.target.closest(".notification-card");
  //   const id = notificationCard ? notificationCard.dataset.id : null;
  //   //console.log("d3", id);
  //     this.notificationdata = this.notificationdata.filter(
  //       (notification) => notification.id !== id
  //     );
  //     if (this.notificationdata === 0) {
  //       this.hasNewData = false;
  //     }
  //   this.hasVehicle = this.notificationdata.some(
  //     (notification) => notification.b
  //   );
  //   this.hasEinvoice = this.notificationdata.some(
  //     (notification) => notification.c
  //   );
  //   this.hasDuplicate = this.notificationdata.some(
  //     (notification) => notification.d
  //   );
  //   if (this.notificationdata.length == 0) {
  //     this.emptyallnotifications = true;
  //     //console.log("done");
  //   } else {
  //     this.emptyallnotifications = false;
  //     //console.log("no done");
  //   }
  // }
  scrollToEnd() {
    const notificationHeader = this.template.querySelector(".AccessToNot");
    // console.log("waqt", notificationHeader.innerHTML);

    if (notificationHeader) {
      if (this.scrollend === false) {
        notificationHeader.scrollLeft = notificationHeader.scrollWidth;
        this.scrollend = true;
      } else {
        notificationHeader.scrollLeft = 0;
        this.scrollend = false;
      }
      //  console.log("in if");
    } else {
      console.error("Notification-header element not found");
    }
  }

  substringToProperLength(string, limit) {
    let tempString = "";
    let charCount = 0;

    for (let i = 0; i < string.length; i++) {
      const char = string.charAt(i);
      const charCode = string.charCodeAt(i);

      if (
        (charCode >= 0xff01 && charCode <= 0xff5e) ||
        (charCode >= 0xff61 && charCode <= 0xff9f) ||
        (charCode >= 0x3040 && charCode <= 0x309f) ||
        (charCode >= 0x30a0 && charCode <= 0x30ff) ||
        (charCode >= 0x4e00 && charCode <= 0x9fff) ||
        charCode === 12290 ||
        charCode === 12289
      ) {
        charCount += 2;
      } else {
        charCount += 1;
      }

      if (charCount >= limit) {
        break;
      }
      // if (
      //   charCount > limit &&
      //   ((charCode >= 0x3040 && charCode <= 0x9fff) ||
      //     (charCode >= 0xff01 && charCode <= 0xff5e))
      // ) {
      //   break;
      // }
      tempString += char;
    }
    return tempString + (charCount >= limit ? "..." : "");
  }

  @track showVehicleList = false;
  toggleVehicleManagementList(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      event.stopPropagation();
      this.showUserList = false;
      this.isFaqListOpen = false;
      this.showVehicleList = !this.showVehicleList;
    }
  }
  clickOnAllcheck() {
    //  console.log("databef", JSON.stringify(this.notificationdata));
    const notificationsAll = this.notificationdata.All.map((notification) => ({
      recordId: notification.id,
      Type: notification.Type
    }));
    const notificationsOthers = this.notificationdata.Other.map(
      (notification) => ({
        recordId: notification.id,
        Type: notification.Type
      })
    );
    const combinedNotifications = [
      ...new Set([...notificationsAll, ...notificationsOthers])
    ];
    //const combinedNotifications = [...notificationsAll, ...notificationsOthers];
    //console.log('combinedNotifications',combinedNotifications);
    // const uniqueNotifications = Array.from(
    //     new Map(combinedNotifications.map(notification => [notification.recordId, notification])).values()
    // );
    let sendtoall = JSON.stringify(combinedNotifications);
    console.log("no", combinedNotifications);
    // console.log("dataNot", JSON.stringify(uniqueNotifications));
    insertRecordLists({ jsonInput: sendtoall })
      .then((results) => {
        //  console.log("All notifications processed successfully:", results);
        this.refreshData2();
        this.showsureallcheck = false;
      })
      .catch((error) => {
        console.error("Error processing notifications:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoHeader",
          errorLog: err,
          methodName: "clickonallcheck",
          ViewName: "FusoHeader",
          InterfaceName: "Salesforce",
          EventName: "Data update",
          ModuleName: "Header"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }
  @track showsureallcheck = false;
  CloseModalSure() {
    this.showsureallcheck = false;
  }
  openModalSure() {
    this.showsureallcheck = true;
  }
  @track showtermsModal = false;
  opentermsmodal() {
    this.showtermsModal = true;
  }
  closetermsmodal() {
    this.showtermsModal = false;
  }

  handlescrollhorizontal() {
    const scrollableDiv = this.template.querySelector(".Notification-header");
    if (!scrollableDiv) return;

    const isScrollable = scrollableDiv.scrollWidth > scrollableDiv.clientWidth;
    //this.scrollbuttonneed = isScrollable;
    // Check if the scroll has reached the end (adding a small buffer for precision)
    const isAtEnd =
      Math.abs(
        scrollableDiv.scrollLeft +
          scrollableDiv.clientWidth -
          scrollableDiv.scrollWidth
      ) < 1;

    this.scrollend = isScrollable && isAtEnd;

    // console.log("Scroll Left:", scrollableDiv.scrollLeft);
    // console.log("Client Width:", scrollableDiv.clientWidth);
    // console.log("Scroll Width:", scrollableDiv.scrollWidth);
    // console.log("Button Disabled:", !this.scrollend);
  }
  @track ShowExpiryModal = false;
  @track termsdata = {
    id: "",
    Description: "",
    Title: "",
    Date: "",
    Type: "",
    regno: []
  };

  OpenExpiryModal(event) {
    const targetElement = event.currentTarget;
    // console.log("terms", JSON.stringify(this.termsdata));
    this.termsdata.id = targetElement.dataset.id;
    this.termsdata.Description = targetElement.dataset.description;
    this.termsdata.Title = targetElement.dataset.title;
    this.termsdata.Date = targetElement.dataset.date;
    this.termsdata.Type = targetElement.dataset.type;
    const regnoArray = this.termsdata.Type.split(", ");
    this.termsdata.regno = regnoArray.map((reg) => ({ regnumber: reg }));
    // console.log("terms", JSON.stringify(this.termsdata));
    this.ShowExpiryModal = true;
  }
  CloseExpiryModal() {
    this.ShowExpiryModal = false;
  }

  @track ShowMoreInfoModal = false;
  @track showMoreLoader = false;
  @track moreArray = {
    id: "",
    Description: "",
    Title: "",
    Date: "",
    Type: "",
    VehicleId: "",
    isNewsLink: false,
    isEinvoiceLink: false,
    isdtfsaLink: false,
    isRecallLink: false,
    isShakenLink: false,
    isTermsLink: false,
    regNumber: "",
    url: ""
  };
  openShowMoreModal(event) {
    this.moreArray = {
      id: "",
      Description: "",
      Title: "",
      Date: "",
      Type: "",
      VehicleId: "",
      isNewsLink: false,
      isEinvoiceLink: false,
      isdtfsaLink: false,
      isRecallLink: false,
      isShakenLink: false,
      isTermsLink: false,
      regNumber: "",
      url: "",
      Doctype: "",
      DoctypeArray: [],
      correct: 0
    };
    this.showMoreLoader = true;
    const targetElement = event.currentTarget;
    this.moreArray.id = targetElement.dataset.id;
    this.moreArray.VehicleId = targetElement.dataset.vehid;
    //console.log("this vehicle id",this.moreArray.VehicleId);
    this.moreArray.Description = targetElement.dataset.description;
    this.moreArray.Doctype = targetElement.dataset.doctype;
    this.moreArray.Title = targetElement.dataset.title;
    this.moreArray.Date = targetElement.dataset.date;
    this.moreArray.Type = targetElement.dataset.type;
    this.moreArray.regNumber = targetElement.dataset.regnumber;
    this.moreArray.url = targetElement.dataset.url || "";
    this.moreArray.correct = targetElement.dataset.correct;
    console.log("More Array: ", this.moreArray);
    if (targetElement.dataset.type) {
      const type = this.moreArray.Type;
      this.moreArray = {
        ...this.moreArray,
        isNewsLink: type === "News",
        isEinvoiceLink: type === "eInvoice",
        isdtfsaLink: type === "dtfsa",
        isRecallLink: type === "Recall",
        isShakenLink: type === "VehicleExp"
      };
    }

    console.log("this.moreArray.Description", this.moreArray.Description);

    if (this.moreArray.isdtfsaLink === true) {
      this.moreArray.Description =
        this.moreArray.Description.split("。")[0] + "。";
      this.moreArray.Doctype = this.moreArray.Doctype.replaceAll(",", "、");
      this.moreArray.DoctypeArray = this.moreArray.Doctype.split("、");
      this.moreArray.correct = this.moreArray.correct === "1" ? true : false;
      console.log("this.moreArray.DoctypeArray", this.moreArray.DoctypeArray);
    }
    if (this.moreArray.isNewsLink === true) {
      console.log("url before if: ", this.moreArray.url);
      if (this.moreArray.url !== "") {
        this.moreArray.isTermsLink = true;
        console.log("in if");
        this.moreArray.url = `${tncCustomlabel}${this.moreArray.url}`;
      }
    }
    console.log(
      "all modal data - ",
      this.moreArray.vehicleId,
      this.moreArray.id,
      this.moreArray.Description,
      this.moreArray.Title,
      this.moreArray.Date,
      this.moreArray.Type,
      "url is: ",
      this.moreArray.url
    );
    this.ShowMoreInfoModal = true;
    this.showMoreLoader = false;
  }
  CloseShowMoreInfoModal() {
    this.ShowMoreInfoModal = false;
  }
  checkthepage(event) {
    const targetElement = event.currentTarget;
    console.log("id: ", targetElement.dataset.id);
    const MainType = targetElement.dataset.type;
    if (MainType === "dtfsa") {
      this.Gotodtfsa(event);
    } else if (MainType === "eInvoice") {
      this.GotoEinovice(event);
    } else if (MainType === "Recall") {
      this.GotoDetailsPage(event);
    }
  }
}

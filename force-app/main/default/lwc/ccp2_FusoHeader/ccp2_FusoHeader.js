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
import fullReturnNotificationDataCount from "@salesforce/apex/CCP2_Notification_Controller.unseenFlag";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

import getAllServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import Id from "@salesforce/user/Id";
import { getRecord } from "lightning/uiRecordApi";
import checkGuestUser from "@salesforce/apex/CCP_HeaderController.checkGuestUser";
import getLoginURL from "@salesforce/apex/CCP_HeaderController.getLoginURL";
import labelsBranch from "@salesforce/resourceUrl/ccp2_labels";
import INDUSTRY_FIELD from "@salesforce/schema/Account.Industry";

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
import getSessionId from "@salesforce/apex/CCP2_Notification_Controller.getSessionId";

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
  @track emptyallnotifications = false;
  @track hasDuplicate = false;
  @track notificationdisableoncenter = false;
  @track AllCount;
  @track RecallCount;
  @track NewsCount;
  @track DtfsaCount;
  @track EinoviceCount;
  @track counttrue = false;
  @track recalltrue = false;
  @track Einvoicetrue = false;
  @track Dtfsatrue = false;
  @track Newstrue = false;
  wiredNotificationResult;
  wiredIndustryDataResult;

  //selected tags
  @track isAllSelected = true;
  @track isVehicleSelected = false;
  @track isFinanceSelected = false;
  @track isEInvoiceSelected = false;
  @track isNewsSelected = false;

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
  sessionId;
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
      } else {
        this.hasNewData = true;
      }

      console.log("Industry data:", this.industry);
    } else if (error) {
      console.error("Error fetching industry data:", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_FusoHeader",
        errorLog: err,
        methodName: "WiredIndustryData"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

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
    console.log("nresult", result);
    const { error, data } = result;
    if (data) {
      if (data.length === 0) {
        this.newdatapresent = false;
      } else {
        this.newdatapresent = true;
      }
      if (data.length !== this.notificationdata.length) {
        this.hasNewData = true;
      }
      if (this.notificationdata === 0) {
        this.hasNewData = false;
      }
      this.notificationdata = JSON.parse(JSON.stringify(data));

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
      this.handleallcardstoshow();
    } else if (error) {
      console.error("Error fetching Notification Data:", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_FusoHeader",
        errorLog: err,
        methodName: "WiredNotificationData"
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

  handleLinkClick(event) {
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

    this.clickedHrefUrl = event.currentTarget.getAttribute("href");
    if (!isAnyTrue) {
      if (this.clickedHrefUrl) {
        window.location.href = this.clickedHrefUrl;
      }
    } else {
      this.showTxnModal = true;
    }
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
            methodName: "getLogoutURL"
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
          this.notificationdata = this.notificationdata.filter(
            (notification) => notification.id !== id
          );
        })
        .catch((error) => {
          console.error("Error updating record:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "updateRecord"
          })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
        });

      let url = `/s/vehicle-details?vehicleId=${this.vehicleId}&instance=recall`;
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
          methodName: "LoadLanguage"
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
          methodName: "checkManagerUser"
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
    //console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === "en_US") {
      //console.log("working1");
      return "en";
    } else {
      return "jp";
    }
  }
  // }

  loadCheckGuestUser() {
    checkGuestUser().then((result) => {
      this.amIGuestUser = result;
      if (result === true) {
        this.guestNotification = true;
        getLoginURL().then((result2) => {
          //console.log("this.loginLink", result2);
          this.loginLink = result2;
        });
      } else {
        this.guestNotification = false;
        this.checkManagerUser();
      }
    });
  }
  timeZone;
  region;
  connectedCallback() {
    this.loadCheckGuestUser();
    getSessionId()
      .then((result) => {
        this.sessionId = result;
        this.console.log("onsession");
        // this.handleSubscribe();
      })
      .catch((error) => {
        console.error("Error fetching session ID: " + error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoHeader",
          errorLog: err,
          methodName: "getSessionId"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
    // this.handleSubscribe();

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
        });
      })
      .catch((error) => {
        this.errors = JSON.stringify(error);
        console.error("checkManagerUser errors:" + JSON.stringify(error));
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoHeader",
          errorLog: err,
          methodName: "getAllServices"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  // initializeCometD() {
  //   loadScript(this, cometdlwc).then(() => {
  //     var cometdlib = new window.org.cometd.CometD();
  //     // console.log('cometdlib', cometdlib);
  //     console.log('window.location.protocol', window.location.protocol);
  //     console.log('window.location.hostname', window.location.hostname);
  //     console.log('this.sessionId', this.sessionId);
  //     //Calling configure method of cometD class, to setup authentication which will be used in handshaking
  //     cometdlib.configure({
  //       url:
  //         window.location.protocol +
  //         "//" +
  //         window.location.hostname +
  //         "/cometd/47.0/",
  //       requestHeaders: { Authorization: "OAuth " + this.sessionId }, // you need get the sessionId from Apex
  //       appendMessageTypeToURL: false,
  //       logLevel: "debug",
  //       transportTypes: ['long-polling']
  //     });

  //     console.log('newdevteam');

  //     cometdlib.websocketEnabled = false;

  //     cometdlib.handshake(function (status) {
  //       if (status.successful) {
  //         // Successfully connected to the server.
  //         // Now it is possible to subscribe or send messages
  //         console.log("Successfully connected to server");
  //         cometdlib.subscribe("/event/CCP_Notification__e", function (message) {
  //           console.log("subscribed to message!" + message);
  //         });
  //       } else {
  //         /// Cannot handshake with the server, alert user.
  //         console.error("Error in handshaking: " + JSON.stringify(status));
  //       }
  //     });
  //   });
  // }

  // handleSubscribe() {
  //   console.log("start");
  //   // Callback invoked whenever a new event message is received
  //   const messageCallback = function (response) {
  //     console.log("start1");
  //     console.log("New message received: ", JSON.stringify(response));
  //     // Response contains the payload of the new message received
  //   };

  //   // Invoke subscribe method of empApi. Pass reference to messageCallback
  //   subscribe(this.channelName, -1, messageCallback).then((response) => {
  //     console.log("start2");
  //     // Response contains the subscription information on subscribe call
  //     console.log(
  //       "Subscription request sent to: ",
  //       JSON.stringify(response.channel)
  //     );
  //     this.subscription = response;
  //   });
  //   console.log("exit");
  // }

  // // Handles unsubscribe button click
  // handleUnsubscribe() {
  //   // Invoke unsubscribe method of empApi
  //   unsubscribe(this.subscription, (response) => {
  //     console.log("unsubscribe() response: ", JSON.stringify(response));
  //     // Response is true for successful unsubscribe
  //   });
  // }

  // empapi
  // handleSubscribe() {
  //   console.log("onsub");
  //   const messageCallback = (response) => {
  //       console.log('New message received: ', JSON.stringify(response));
  //       // Process the event here
  //   };
  //   console.log("onsubmessage");
  //   // Subscribe to the platform event channel
  //   subscribe(this.channelName, -1, messageCallback).then(response => {
  //       this.subscription = response;
  //       console.log('Subscribed to platform event:', JSON.stringify(response));
  //   });

  //   console.log("onsubmessage2");

  //   // Handle errors
  //   onError(error => {
  //       console.error('Error during subscription:', JSON.stringify(error));
  //   });
  // }

  // handleUnsubscribe() {
  //   unsubscribe(this.subscription, response => {
  //       console.log('Unsubscribed from platform event:', JSON.stringify(response));
  //   });
  // }

  // registerErrorListener() {
  //   // Invoke onError empApi method
  //   onError((error) => {
  //     console.log("Received error from server: ", JSON.stringify(error));
  //     // Error contains the server-side error
  //   });
  // }

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
          const sitePrefix = basePath.replace(/\/s$/i, "");
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
            methodName: "getLogoutURL"
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
      console.log("Triggered Faq Outside: ");
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
    if (this.notificationdata.length < 0) {
      this.hasNewData = true;
    }
    if (this.notificationdata.length === 0) {
      this.hasNewData = false;
    }
  }

  refreshData() {
    refreshApex(this.wiredNotificationResult).then(() => {
      console.log("Data refreshed:", JSON.stringify(this.notificationdata));
    });
  }
  refreshData2() {
    refreshApex(this.wiredNotificationResult).then(() => {
      // this.showNotificationModal = true;
      // document.body.style.overflow = "hidden";
      console.log("Data refreshed:", JSON.stringify(this.notificationdata));
    });
  }

  startDataRefresh() {
    this.refreshInterval = setInterval(() => {
      refreshApex(this.wiredIndustryDataResult).then(() => {
        console.log("Data refreshed count:", JSON.stringify(this.industry));
      });
    }, 10000);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
    document.removeEventListener("click", this.handleOutsideClick2.bind(this));
    document.removeEventListener("click", this.handleOutsideClick3.bind(this));
    document.removeEventListener(
      "click",
      this.handleOutsideClickNewone.bind(this)
    );
    this.handleUnsubscribe();
    // this.handleUnsubscribe();
  }
  //notification modal
  openNotificationModal(event) {
    console.log("notification:- ", event.target);
    console.log("notification1:- ", event.target.dataset.name);
    this.refreshData();
    event.stopPropagation();
    console.log("notification2:- ", event.target.dataset.name);
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
    this.isVehicleSelected = false;
    this.scrollend = false;
    this.showNotificationModal = false;
    document.body.style.overflow = "";
  }
  handleallcardstoshow() {
    this.notificationdata.forEach((notification) => {
      notification["a"] = false;
      notification["b"] = false;
      notification["c"] = false;
      //console.log("workife");
      notification["d"] = false;
      notification["e"] = false;
      const formattedDate = this.formatJapaneseDate(notification.Date);
      notification.Date = formattedDate;
      if (notification.newsDescription) {
        notification.newsDescription = this.convertRichTextToPlainText(
          notification.newsDescription
        );
        notification.newsDescription = this.substringToProperLength(
          notification.newsDescription,
          70
        );
      }
      if (notification.Description) {
        notification.Description = this.substringToProperLength(
          notification.Description,
          70
        );
      }
      if (notification.newsTitle) {
        notification["newsTitleMain"] = notification.newsTitle || "";
        notification.newsTitle = this.substringToProperLength(
          notification.newsTitle,
          12
        );
      }
      //console.log("Formatted Date:", formattedDate);
      switch (notification.Type) {
        case "Vehicle":
          notification.a = true;
          break;
        case "Recall":
          notification.b = true;
          break;
        case "eInvoice":
          notification.c = true;
          break;
        case "dtfsa":
          notification.d = true;
          break;
        case "News":
          notification.e = true;
          break;
        default:
          break;
      }
    });
    this.AllCount = this.notificationdata.length || 0;
    this.RecallCount =
      this.notificationdata.filter(
        (notification) => notification.Type === "Recall"
      ).length || 0;
    this.EinoviceCount =
      this.notificationdata.filter(
        (notification) => notification.Type === "eInvoice"
      ).length || 0;
    this.DtfsaCount =
      this.notificationdata.filter(
        (notification) => notification.Type === "dtfsa"
      ).length || 0;
    this.NewsCount =
      this.notificationdata.filter(
        (notification) => notification.Type === "News"
      ).length || 0;

    this.counttrue = this.AllCount > 0 ? true : false;
    this.recalltrue = this.RecallCount > 0 ? true : false;
    this.Einvoicetrue = this.EinoviceCount > 0 ? true : false;
    this.Dtfsatrue = this.DtfsaCount > 0 ? true : false;
    this.Newstrue = this.NewsCount > 0 ? true : false;

    this.AllCount = this.AllCount > 9 ? "9+" : this.AllCount;
    this.RecallCount = this.RecallCount > 9 ? "9+" : this.RecallCount;
    this.EinoviceCount = this.EinoviceCount > 9 ? "9+" : this.EinoviceCount;
    this.DtfsaCount = this.DtfsaCount > 9 ? "9+" : this.DtfsaCount;
    this.NewsCount = this.NewsCount > 9 ? "9+" : this.NewsCount;
    // console.log("all the data",this.AllCount, this.RecallCount, this.EinoviceCount, this.DtfsaCount, this.NewsCount);

    this.hasVehicle = this.notificationdata.some(
      (notification) => notification.b
    );
    this.hasEinvoice = this.notificationdata.some(
      (notification) => notification.c
    );
    this.hasDuplicate = this.notificationdata.some(
      (notification) => notification.d
    );
    this.hasNews = this.notificationdata.some((notification) => notification.e);

    if (this.notificationdata.length == 0) {
      this.emptyallnotifications = true;
      //console.log("done");
    } else {
      this.emptyallnotifications = false;
      //console.log("no done");
    }
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
  }

  handleVehicleselected() {
    this.isAllSelected = false;
    this.isVehicleSelected = true;
    this.isEInvoiceSelected = false;
    this.isFinanceSelected = false;
    this.isNewsSelected = false;
  }

  handleEInvoiceselected() {
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isEInvoiceSelected = true;
    this.isFinanceSelected = false;
    this.isNewsSelected = false;
  }

  handleDTFSAselected() {
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isEInvoiceSelected = false;
    this.isFinanceSelected = true;
    this.isNewsSelected = false;
  }
  handleNewsselected() {
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isEInvoiceSelected = false;
    this.isFinanceSelected = false;
    this.isNewsSelected = true;
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
  clickonchecked(event) {
    const notificationCard = event.target.closest(".notification-card");
    const id = notificationCard ? notificationCard.dataset.id : null;
    const type = notificationCard ? notificationCard.dataset.type : null;
    console.log("d32", type);

    if (id) {
      insertRecord({ notificationId: id, notificationType: type })
        .then(() => {
          //console.log(`Record ${id} updated: flag__c set to true.`);
          this.notificationdata = this.notificationdata.filter(
            (notification) => notification.id !== id
          );
          this.refreshData();
          if (this.notificationdata === 0) {
            this.hasNewData = false;
          }
        })
        .catch((error) => {
          console.error("Error updating record:", error);
          let err = JSON.stringify(error);
          ErrorLog({
            lwcName: "ccp2_FusoHeader",
            errorLog: err,
            methodName: "clickonchecked"
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

    this.hasVehicle = this.notificationdata.some(
      (notification) => notification.b
    );
    this.hasEinvoice = this.notificationdata.some(
      (notification) => notification.c
    );
    this.hasDuplicate = this.notificationdata.some(
      (notification) => notification.d
    );
    this.hasNews = this.notificationdata.some((notification) => notification.e);
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
      const vehicleDetailElement = event.target.closest(".vehicledetailmove");

      if (vehicleDetailElement) {
        const vehicleIdMain = vehicleDetailElement.getAttribute("data-id");
        this.vehicleId = vehicleIdMain;
        console.log("this", JSON.stringify(this.notificationdata));
        const matchingNotification = this.notificationdata.find(
          (notification) => notification.vehicleId === this.vehicleId
        );
        console.log("match", matchingNotification.id);
        console.log("working id ", this.vehicleId);
        const fields = {};
        fields.Id = matchingNotification.id;
        fields[FLAG_FIELD.fieldApiName] = true;

        const recordInput = { fields };
        this.recordInput2 = recordInput;
        // this.vehicledetailspage = true;
        // window.scrollTo(0,0);
        // this.notificationPage = false;
      } else {
        console.error("Vehicle detail element not found");
      }

      this.showTxnModal = true;
      this.notificationTxn = true;
    } else {
      const vehicleDetailElement = event.target.closest(".vehicledetailmove");

      if (vehicleDetailElement) {
        const vehicleIdMain = vehicleDetailElement.getAttribute("data-id");
        this.vehicleId = vehicleIdMain;
        console.log("this", JSON.stringify(this.notificationdata));
        const matchingNotification = this.notificationdata.find(
          (notification) => notification.vehicleId === this.vehicleId
        );
        console.log("match", matchingNotification.id);
        console.log("working id ", this.vehicleId);
        let recId = matchingNotification.id;
        let type = "Recall";

        insertRecord({ notificationId: recId, notificationType: type })
          .then(() => {
            this.notificationdata = this.notificationdata.filter(
              (notification) => notification.id !== id
            );
          })
          .catch((error) => {
            console.error("Error updating record:", error);
            let err = JSON.stringify(error);
            ErrorLog({
              lwcName: "ccp2_FusoHeader",
              errorLog: err,
              methodName: "insertRecord"
            })
              .then(() => {
                console.log("Error logged successfully in Salesforce");
              })
              .catch((loggingErr) => {
                console.error("Failed to log error in Salesforce:", loggingErr);
              });
          });

        let url = `/s/vehicle-details?vehicleId=${this.vehicleId}&instance=recall`;
        window.location.href = url;
      } else {
        console.error("Vehicle detail element not found");
      }
    }
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
      const vehicleDetailElement = event.target.closest(".vehicledtfsamove");

      if (vehicleDetailElement) {
        const vehicleIdMain = vehicleDetailElement.getAttribute("data-id");
        this.vehicleId = vehicleIdMain;
        console.log("this", JSON.stringify(this.notificationdata));
        const matchingNotification = this.notificationdata.find(
          (notification) => notification.vehicleId === this.vehicleId
        );
        console.log("match", matchingNotification.id);
        console.log("working id ", this.vehicleId);
        const fields = {};
        fields.Id = matchingNotification.id;
        fields[FLAG_FIELD.fieldApiName] = true;

        const recordInput = { fields };
        this.recordInput2 = recordInput;
        // this.vehicledetailspage = true;
        // window.scrollTo(0,0);
        // this.notificationPage = false;
      } else {
        console.error("Vehicle detail element not found");
      }

      this.showTxnModal = true;
      this.notificationTxn = true;
    } else {
      const vehicleDetailElement = event.target.closest(".vehicledtfsamove");

      if (vehicleDetailElement) {
        const vehicleIdMain = vehicleDetailElement.getAttribute("data-id");
        this.vehicleId = vehicleIdMain;
        console.log("this", JSON.stringify(this.notificationdata));
        const matchingNotification = this.notificationdata.find(
          (notification) => notification.vehicleId === this.vehicleId
        );
        console.log("match", matchingNotification.id);
        console.log("working id ", this.vehicleId);
        const fields = {};
        fields.Id = matchingNotification.id;
        fields[FLAG_FIELD.fieldApiName] = true;

        const recordInput = { fields };

        updateRecord(recordInput)
          .then(() => {
            this.notificationdata = this.notificationdata.filter(
              (notification) => notification.id !== id
            );
          })
          .catch((error) => {
            console.error("Error updating record:", error);
            let err = JSON.stringify(error);
            ErrorLog({
              lwcName: "ccp2_FusoHeader",
              errorLog: err,
              methodName: "gotodtfsa"
            })
              .then(() => {
                console.log("Error logged successfully in Salesforce");
              })
              .catch((loggingErr) => {
                console.error("Failed to log error in Salesforce:", loggingErr);
              });
          });

        window.location.href = this.dtfsaUrl;
      } else {
        console.error("Vehicle detail element not found");
      }
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
      const vehicleDetailElement = event.target.closest(".vehicleEinvoicemove");

      if (vehicleDetailElement) {
        const vehicleIdMain = vehicleDetailElement.getAttribute("data-id");
        this.vehicleId = vehicleIdMain;
        console.log("this", JSON.stringify(this.notificationdata));
        const matchingNotification = this.notificationdata.find(
          (notification) => notification.vehicleId === this.vehicleId
        );
        console.log("match", matchingNotification.id);
        console.log("working id ", this.vehicleId);
        const fields = {};
        fields.Id = matchingNotification.id;
        fields[FLAG_FIELD.fieldApiName] = true;

        const recordInput = { fields };
        this.recordInput2 = recordInput;
        // this.vehicledetailspage = true;
        // window.scrollTo(0,0);
        // this.notificationPage = false;
      } else {
        console.error("Vehicle detail element not found");
      }

      this.showTxnModal = true;
      this.notificationTxn = true;
    } else {
      const vehicleDetailElement = event.target.closest(".vehicleEinvoicemove");

      if (vehicleDetailElement) {
        const vehicleIdMain = vehicleDetailElement.getAttribute("data-id");
        this.vehicleId = vehicleIdMain;
        console.log("this", JSON.stringify(this.notificationdata));
        const matchingNotification = this.notificationdata.find(
          (notification) => notification.vehicleId === this.vehicleId
        );
        console.log("match", matchingNotification.id);
        console.log("working id ", this.vehicleId);
        const fields = {};
        fields.Id = matchingNotification.id;
        fields[FLAG_FIELD.fieldApiName] = true;

        const recordInput = { fields };

        updateRecord(recordInput)
          .then(() => {
            this.notificationdata = this.notificationdata.filter(
              (notification) => notification.id !== id
            );
          })
          .catch((error) => {
            console.error("Error updating record:", error);
            let err = JSON.stringify(error);
            ErrorLog({
              lwcName: "ccp2_FusoHeader",
              errorLog: err,
              methodName: "gotoeinvoice"
            })
              .then(() => {
                console.log("Error logged successfully in Salesforce");
              })
              .catch((loggingErr) => {
                console.error("Failed to log error in Salesforce:", loggingErr);
              });
          });

        window.location.href = this.einvoiceUrl;
      } else {
        console.error("Vehicle detail element not found");
      }
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
    console.log("waqt", notificationHeader.innerHTML);

    if (notificationHeader) {
      if (this.scrollend === false) {
        notificationHeader.scrollLeft = notificationHeader.scrollWidth;
        this.scrollend = true;
      } else {
        notificationHeader.scrollLeft = 0;
        this.scrollend = false;
      }
      console.log("in if");
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
        (charCode >= 0x4e00 && charCode <= 0x9fff)
      ) {
        charCount += 2;
      } else {
        charCount += 1;
      }

      if (charCount > limit) {
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
    event.stopPropagation();
    this.showUserList = false;
    this.isFaqListOpen = false;
    this.showVehicleList = !this.showVehicleList;
  }
  clickOnAllcheck() {
    console.log("databef", JSON.stringify(this.notificationdata));
    const notifications = this.notificationdata.map((notification) => ({
      recordId: notification.id,
      Type: notification.Type
    }));
    let sendtoall = JSON.stringify(notifications);
    console.log("no", notifications);
    console.log("dataNot", JSON.stringify(notifications));
    insertRecordLists({ jsonInput: sendtoall })
      .then((results) => {
        console.log("All notifications processed successfully:", results);
        this.refreshData2();
        this.showsureallcheck = false;
      })
      .catch((error) => {
        console.error("Error processing notifications:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoHeader",
          errorLog: err,
          methodName: "clickonallcheck"
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
}

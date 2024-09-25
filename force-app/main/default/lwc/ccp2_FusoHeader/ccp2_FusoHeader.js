import { LightningElement, track } from "lwc";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getLogoutURL from "@salesforce/apex/CCP_HeaderController.getLogoutURL";
import basePath from "@salesforce/community/basePath";
import checkManagerUser from "@salesforce/apex/CCP_HeaderController.checkManagerUser";
import getAllServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import Id from "@salesforce/user/Id";

import checkGuestUser from "@salesforce/apex/CCP_HeaderController.checkGuestUser";
import getLoginURL from "@salesforce/apex/CCP_HeaderController.getLoginURL";
import labelResource from "@salesforce/resourceUrl/ccp2_FusoHeaderLabels";

//labels
import CCP2_Home from "@salesforce/label/c.CCP2_Home";
import CCP2_VehicleManage from "@salesforce/label/c.CCP2_VehicleManagement";
import CCP2_MRL from "@salesforce/label/c.CCP2_MonthlyRequestLetter";
import CCP2_FSH from "@salesforce/label/c.CCP2_FinancialServicesHeader";
import CCP2_FusoShop from "@salesforce/label/c.CCP2_FusoShop";
import CCP2_BasicInfo from "@salesforce/label/c.CCP2_BasicInfo";
import CCP2_MemManage from "@salesforce/label/c.CCP2_MembershipManagementHeader";
import CCP2_Logout from "@salesforce/label/c.CCP2_Logout";
import CCP2_BranchManage from "@salesforce/label/c.CCP2_BranchManagementHeader";

const Logo = Vehicle_StaticResource + "/CCP2_Resources/Common/Header_Logo.png";
const UserIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/CCP2_Icon1.png";
const MessageIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/CCP_Icon2.png";
const QuesIcon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/CCP2_Icon3.png";
const shoplink = Vehicle_StaticResource + "/CCP2_Resources/Common/Outlink.png";

export default class Ccp2_FusoHeader extends LightningElement {
  FusoLogo = Logo;
  UserIcon = UserIcon;
  MessageIcon = MessageIcon;
  QuesIcon = QuesIcon;
  link = shoplink;
  amIGuestUser = true;
  //user list variables
  @track showUserList = false;
  @track showInfo = true;
  @track UserManagment = true;
  @track BranchManagment = true;
  @track IsUserLogin = true;

  FusoShop =
    "https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://jsapps.c3sf1r8zlh-daimlertr2-s1-public.model-t.cc.commerce.ondemand.com/mftbc/ja&scope=openid&response_type=code&ui_locales=ja";

  @track uid = Id;
  loginLink;

  //labels
  labels = {
    CCP2_Home,
    CCP2_VehicleManage,
    CCP2_MRL,
    CCP2_FSH,
    CCP2_FusoShop,
    CCP2_BasicInfo,
    CCP2_MemManage,
    CCP2_Logout,
    CCP2_BranchManage
  };
  labels2 = {};

  //links variables
  homeUrl;
  faqUrl;
  UserManagementUrl;
  addBranchUrl;
  vehicleListUrl;
  profileUrl;
  directBook = false;
  eInvoice = false;
  vehicleList = false;

  //   @wire(getAllServices, {userId: '$uid'})
  //   fun({ data, error }) {
  //     if (data) {
  //       console.log("data acces ID", this.uid);
  //       console.log("data of access : ", data);
  //     } else {
  //       console.error("access error: ", error);
  //     }
  //   }
  checkManagerUser() {
    checkManagerUser()
      .then((result) => {
        this.UserManagment = result;
        this.BranchManagment = result;
      })
      .catch((error) => {
        this.errors = JSON.stringify(error);
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
    fetch(labelResource)
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
            this.labels = i18next.store.data[userLocale].translation;
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
      });
  }

  getLocale() {
    const region = Intl.DateTimeFormat().resolvedOptions().locale;
    return region === "ja" ? "jp" : "en";
  }

  loadCheckGuestUser() {
    checkGuestUser().then((result) => {
      this.amIGuestUser = result;
      if (result === true) {
        getLoginURL().then((result1) => {
          this.loginLink = result1;
        });
      } else {
        this.checkManagerUser();
      }
    });
  }
  timeZone;
  region;
  connectedCallback() {
    this.loadI18nextLibrary()
      .then(() => {
        this.loadLabels(); // Now you can safely load the labels after i18next is loaded
      })
      .catch((error) => {
        console.error("Error loading i18next library: ", error);
      });
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
          if (elm.apiName === "Financial_service_Flag__c") {
            this.eInvoice = elm.isActive;
          } else if (elm.apiName === "E_invoice_Flag__c") {
            this.directBook = elm.isActive;
          } else if (elm.apiName === "Vehicle_management_Flag__c") {
            this.vehicleList = elm.isActive;
          }
        });
      })
      .catch((error) => {
        this.errors = JSON.stringify(error);
        console.log("checkManagerUser errors:" + JSON.stringify(error));
      });
    const activeLink = localStorage.getItem("activeLink");
    if (activeLink) {
      // Apply the 'active' class to the stored active link
      const activeElement = this.template.querySelector(
        `[data-link="${activeLink}"]`
      );
      if (activeElement) {
        activeElement.classList.add("active");
      }
    }
  }

  //links for href
  getAllUrl() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      this.directBookingUrl = baseUrl.split("/s/")[0] + "/s/directBooking";
      this.vehicleListUrl = baseUrl.split("/s/")[0] + "/s/vehiclemanagement";
      this.notificationsUrl = baseUrl.split("/s/")[0] + "/s/notifications";
      this.requestBookUrl = baseUrl.split("/s/")[0] + "/s/requestBook";
      this.profileUrl = baseUrl.split("/s/")[0] + "/s/profile";
      this.addUserUrl = baseUrl.split("/s/")[0] + "/s/addUser";
      this.UserManagementUrl = baseUrl.split("/s/")[0] + "/s/usermanagement";
      this.addBranchUrl = baseUrl.split("/s/")[0] + "/s/branchmangement";
      this.inquiryUrl = baseUrl.split("/s/")[0] + "/s/inquiry";
      this.faqUrl = baseUrl.split("/s/")[0] + "/faq/s/";
      this.homeUrl = baseUrl.split("/s/")[0] + "/s/";
    }
  }
  
  openUserList(event) {
    event.stopPropagation();
    this.showUserList = !this.showUserList;
  }

  //LOGOUT
  handleLogout() {
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
        console.log("getLogoutURL errors:" + JSON.stringify(error));
      });
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

  renderedCallback() {
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      this.outsideClickHandlerAdded = true;
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
  }

  handleLinkClick(event) {
    const clickedLink = event.target.dataset.link;

    localStorage.setItem("activeLink", clickedLink);

    this.template.querySelectorAll(".Link").forEach((link) => {
      link.classList.remove("active");
    });

    event.target.classList.add("active");
  }
}

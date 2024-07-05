import { LightningElement, track, api, wire } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_Vehicle";
import getLogoutURL from "@salesforce/apex/CCP_HeaderController.getLogoutURL";
import basePath from "@salesforce/community/basePath";
import checkManagerUser from "@salesforce/apex/CCP_HeaderController.checkManagerUser";
import getAllServices from "@salesforce/apex/CCP2_ServicesList.permissionValues";
import Id from "@salesforce/user/Id";

import checkGuestUser from "@salesforce/apex/CCP_HeaderController.checkGuestUser";
import getLoginURL from "@salesforce/apex/CCP_HeaderController.getLoginURL";
// import getBaseInfoByUserId from "@salesforce/apex/CCP_HeaderController.getBaseInfoByUserId";

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

const Logo =
  Vehicle_StaticResource + "/CCP_StaticResource_Vehicle/images/Header_Logo.png";
const UserIcon =
  Vehicle_StaticResource + "/CCP_StaticResource_Vehicle/images/CCP2_Icon1.png";
const MessageIcon =
  Vehicle_StaticResource + "/CCP_StaticResource_Vehicle/images/CCP_Icon2.png";
const QuesIcon =
  Vehicle_StaticResource + "/CCP_StaticResource_Vehicle/images/CCP2_Icon3.png";
const shoplink =
  Vehicle_StaticResource + "/CCP_StaticResource_Vehicle/images/Outlink.png";

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
        // console.log("checkManagerUser result: ", result);
        this.UserManagment = result;
        this.BranchManagment = result;
      })
      .catch((error) => {
        this.errors = JSON.stringify(error);
        //console.log("checkManagerUser errors:" + JSON.stringify(error));
      });
  }

  loadCheckGuestUser() {
    checkGuestUser().then((result) => {
      this.amIGuestUser = result;
      // console.log("amIGuestUser", result);
      if (result == true) {
        getLoginURL().then((result) => {
         // console.log("getLoginURL", result);
          this.loginLink = result;
        });
      } else {
        //this.getNotification();
        this.checkManagerUser();
      }
    });
  }

  connectedCallback() {
    this.loadCheckGuestUser();
    //importing the font (@Noto Sans JP)
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    this.getAllUrl();

    // console.log("info of user api id:- ", Id);
    getAllServices({ userId: this.uid })
      .then((res) => {
         //console.log("info of user api:- ", res);

        res.forEach((elm) => {
          if (elm.apiName == "E_invoice_Flag__c") {
            this.eInvoice = elm.isActive;
          } else if (elm.apiName == "Financial_service_Flag__c") {
            this.directBook = elm.isActive;
          } else if (elm.apiName == "Vehicle_management_Flag__c") {
            this.vehicleList = elm.isActive;
          }
        });

        // this.eInvoice = true;
        // this.directBook = true;
        // this.vehicleList = true;
      })
      .catch((error) => {
        this.errors = JSON.stringify(error);
       // console.log("checkManagerUser errors:" + JSON.stringify(error));
      });
  }

  //links for href
  getAllUrl() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") != -1) {
      this.directBookingUrl = baseUrl.split("/s/")[0] + "/s/directBooking";
      this.vehicleListUrl = baseUrl.split("/s/")[0] + "/s/vehicle";
      this.notificationsUrl = baseUrl.split("/s/")[0] + "/s/notifications";
      this.requestBookUrl = baseUrl.split("/s/")[0] + "/s/requestBook";
      this.profileUrl = baseUrl.split("/s/")[0] + "/s/profile";
      this.addUserUrl = baseUrl.split("/s/")[0] + "/s/addUser";
      this.UserManagementUrl = baseUrl.split("/s/")[0] + "/s/usermanagement";
      this.addBranchUrl = baseUrl.split("/s/")[0] + "/s/addbranch";
      this.inquiryUrl = baseUrl.split("/s/")[0] + "/s/inquiry";
      this.faqUrl = baseUrl.split("/s/")[0] + "/faq/s/";
      this.homeUrl = baseUrl.split("/s/")[0] + "/s/";
    }
  }
  openuserlist(event) {
    event.stopPropagation();
    this.showUserList = !this.showUserList;
  }

  //LOGOUT
  handleLogout() {
    getLogoutURL()
      .then(async (result) => {
       // console.log("getLogoutURL", result);
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
       // console.log("getLogoutURL errors:" + JSON.stringify(error));
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
     // console.log("Clicked outside");
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
}
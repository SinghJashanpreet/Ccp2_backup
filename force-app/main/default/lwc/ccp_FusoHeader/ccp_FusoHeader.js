import { LightningElement, track, wire } from "lwc";
import Header_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_Header";
import basePath from "@salesforce/community/basePath";
import checkManagerUser from "@salesforce/apex/CCP_HeaderController.checkManagerUser";
import getNotification from "@salesforce/apex/CCP_HeaderController.getNotification";
import checkGuestUser from "@salesforce/apex/CCP_HeaderController.checkGuestUser";
import getLoginURL from "@salesforce/apex/CCP_HeaderController.getLoginURL";
import getLogoutURL from "@salesforce/apex/CCP_HeaderController.getLogoutURL";
import getBaseInfoByUserId from "@salesforce/apex/CCP_HeaderController.getBaseInfoByUserId";
import getBaseInfo from "@salesforce/apex/CCP_HeaderController.getBaseInfo";
import Id from "@salesforce/user/Id";
import shopLink from "@salesforce/label/c.FUSOShopLink";

import CCP2_BranchManagement from '@salesforce/label/c.CCP2_BranchManagement';
import CCP2_UserManagement from '@salesforce/label/c.CCP2_UserManagement';



const HEADER_LOGO = Header_StaticResource + "/CCP_StaticResource_Header/images/logo.svg";
const USER_ICON = Header_StaticResource + "/CCP_StaticResource_Header/images/icon_user.svg";
const NOTICE_ICON = Header_StaticResource + "/CCP_StaticResource_Header/images/icon_notice.svg";
const QUESTION_ICON = Header_StaticResource + "/CCP_StaticResource_Header/images/icon_question.svg";
export default class Ccp_header extends LightningElement {

    labels = {
        CCP2_BranchManagement,CCP2_UserManagement
    };

    headerLogo = HEADER_LOGO;
    userIcon = USER_ICON;
    noticeIcon = NOTICE_ICON;
    questionIcon = QUESTION_ICON;
    @track
    notifications;
    @track
    notificationNumber = 0;
    @track
    enableAddUserItem = false;
    directBookingUrl;
    notificationsUrl;
    vehicleListUrl;
    bookingListUrl;
    requestBookUrl;
    profileUrl;
    addUserUrl;
    UserManagementUrl;
    addBranchUrl;
    inquiryUrl;
    faqUrl;
    homeUrl;
    shopUrl;
    @track
    amIGuestUser = true;
    @track
    loginLink;
    @track isShowModal1 = false;
    @track isShowModal2 = false;
    @track isShowModal3 = false;
    
     get logoutLink() {
         const sitePrefix = basePath.replace(/\/s$/i, "");
         return sitePrefix + "/secur/logout.jsp";
     }

    connectedCallback() {
        this.getAllUrl();
        this.loadCheckGuestUser();
        getBaseInfo().then(res =>{
            if(res.isRES != undefined){
                this.isRES = res.isRES;
            }
            if(res.isVList != undefined){
                this.isVList = res.isVList;
            }
        })
        getBaseInfoByUserId({uId:Id}).then(res =>{
            if(res.directBook != undefined){
                this.directBook = res.directBook;
            }
            if(res.eInvoice != undefined){
                this.eInvoice = res.eInvoice;
            }
            if(res.isManager != undefined){
                this.isManager = res.isManager;
            }
            if(res.isFDP != undefined){
                this.isFDP = res.isFDP;
            }


            if(!this.isFDP){
                this.showtab();
            }else{
                this.displayBlock("a[name = 'Request_Book']");
                this.displayBlock("a[name = 'Request_Book1']");
            }
            if(this.isRES&& !this.isFDP){
                this.showtab1();
            }
            if(this.isVList&& !this.isFDP){
                this.showtab2();
            }

            if(!this.directBook){
                this.stophref2("a[name = 'Reservation']");
               // this.stophref2("a[name = 'Reservation_Status']");
                this.stophref2("a[name = 'Reservation1']");
               // this.stophref2("a[name = 'Reservation_Status1']");
            }
            if(!this.eInvoice){
                this.stophref("a[name = 'Request_Book']");
                this.stophref("a[name = 'Request_Book1']");
            }
            if(!this.isManager){
                this.stophref3("a[name = 'Shop']");
                this.stophref3("a[name = 'Shop1']");
            }
        }).catch(error => {
            this.errors = JSON.stringify(error);
            console.log('checkManagerUser errors:' + JSON.stringify(error));
            this.showtab();
            if(!this.directBook){
                this.stophref2("a[name = 'Reservation']");
               // this.stophref2("a[name = 'Reservation_Status']");
                this.stophref2("a[name = 'Reservation1']");
               // this.stophref2("a[name = 'Reservation_Status1']");
            }
            if(!this.eInvoice){
                this.stophref("a[name = 'Request_Book']");
                this.stophref("a[name = 'Request_Book1']");
            }
            if(!this.isManager){
                this.stophref3("a[name = 'Shop']");
                this.stophref3("a[name = 'Shop1']");
            }
            if(this.isRES){
                this.showtab1();
            }
            if(this.isVList){
                this.showtab2();
            }    
            
        });
    }

    displayBlock(ele){
        if(this.template.querySelector(ele) != null){
            this.template.querySelector(ele).style.display = 'block';
        }
    }

    showtab(){
        this.displayBlock("a[name = 'Shop']");
        this.displayBlock("a[name = 'Request_Book']");
        this.displayBlock("a[name = 'Shop1']");
        this.displayBlock("a[name = 'Request_Book1']");
    }

    showtab1(){
        this.displayBlock("a[name = 'Reservation']");
        this.displayBlock("a[name = 'Reservation1']");
    }

    showtab2(){
        this.displayBlock("a[name = 'Vehicle_Info']");
        this.displayBlock("a[name = 'Vehicle_Info1']");
    }

    stophref(ele){
        if(this.template.querySelector(ele) != null){
            this.template.querySelector(ele).addEventListener('click',(event) =>{
                if (event.preventDefault) {
                    event.preventDefault();    // Standard
                }
                else {
                    event.cancelBubble = true;  // Old IE
                }
                this.isShowModal1 = true;
            });
        }
    }

    stophref2(ele){
        if(this.template.querySelector(ele) != null){
            this.template.querySelector(ele).addEventListener('click',(event) =>{
                if (event.preventDefault) {
                    event.preventDefault();    // Standard
                }
                else {
                    event.cancelBubble = true;  // Old IE
                }
                this.isShowModal2 = true;
            });
        }
    }

    stophref3(ele){
        if(this.template.querySelector(ele) != null){
            this.template.querySelector(ele).addEventListener('click',(event) =>{
                if (event.preventDefault) {
                    event.preventDefault();    // Standard
                }
                else {
                    event.cancelBubble = true;  // Old IE
                }
                this.isShowModal3 = true;
            });
        }
    }

    // check if this user has manage permission
    checkManagerUser(){
        checkManagerUser()
            .then((result) => {
                this.enableAddUserItem = result;
            })
            .catch((error) => {
            this.errors = JSON.stringify(error);
                console.log("checkManagerUser errors:" + JSON.stringify(error));
        });
    }

    getNotification(){
        getNotification()
            .then((result) => {
                this.notifications = JSON.parse(result).notifications;
                if (this.notifications != null) {
                    this.notifications.forEach((item) => {
                        if (item.read == false) {
                            this.notificationNumber++;
                        }
                    });
                }
            })
            .catch((error) => {
                this.errors = JSON.stringify(error);
                console.log("getNotification errors:" + JSON.stringify(error));
            });
    }

    getAllUrl(){
        let baseUrl = window.location.href;
        if(baseUrl.indexOf("/s/") != -1) {
            this.directBookingUrl = baseUrl.split("/s/")[0] + "/s/directBooking";
            this.vehicleListUrl = baseUrl.split("/s/")[0] + "/s/vehicle";
            this.notificationsUrl = baseUrl.split("/s/")[0] + "/s/notifications";
            //this.bookingListUrl = baseUrl.split("/s/")[0] + "/s/bookingList";
            this.requestBookUrl = baseUrl.split("/s/")[0] + "/s/requestBook";
            this.profileUrl = baseUrl.split("/s/")[0] + "/s/profile";
            this.addUserUrl = baseUrl.split("/s/")[0] + "/s/addUser";
            this.UserManagementUrl = baseUrl.split("/s/")[0] + "/s/usermanagement";
            this.addBranchUrl = baseUrl.split("/s/")[0] + "/s/addbranch";
            this.inquiryUrl = baseUrl.split("/s/")[0] + "/s/inquiry";
            this.faqUrl = baseUrl.split("/s/")[0] + "/faq/s/";
            this.homeUrl = baseUrl.split("/s/")[0] + "/s/";
        }
        this.shopUrl = shopLink;
    }

    drawerOperation(){
        if(this.isDrawerOpen()){
            this.closeDrawerMenu();
        } else {
            this.openDrawerMenu();
        }
    }

    openDrawerMenu(){
        var HAMBURGER = this.template.querySelector(".hamburger");
        var NAV = this.template.querySelector(".drawer-nav");
        HAMBURGER.classList.add("_open");
        NAV.classList.add("_open");
    }
    
    closeDrawerMenu(){
        var HAMBURGER = this.template.querySelector(".hamburger");
        var NAV = this.template.querySelector(".drawer-nav");
        HAMBURGER.classList.remove("_open");
        NAV.classList.remove("_open");
    }

    isDrawerOpen() {
        var HAMBURGER = this.template.querySelector(".hamburger");
        return HAMBURGER.classList.contains("_open");
    }

    loadCheckGuestUser() {
        checkGuestUser()
            .then(result => {
                this.amIGuestUser = result;
                if(result == true) {
                    getLoginURL()
                        .then(result => {
                            this.loginLink = result;
                        });
                } else {
                    this.getNotification();
                    this.checkManagerUser();
                }
            });
    }
    
    handleLogout() {
        this.closeDrawerMenu();
        getLogoutURL()
            .then(async (result) => {
                const sitePrefix = basePath.replace(/\/s$/i, "");
                const defLogoutURL = sitePrefix + "/secur/logout.jsp";
                if (result) {
                    await fetch(defLogoutURL);
                    window.location.replace(result);
                } else {
                    window.location.replace(defLogoutURL);
                }
            })
            .catch((error) => {
                this.errors = JSON.stringify(error);
                console.log("getLogoutURL errors:" + JSON.stringify(error));
            });
    }

    hideModalBox(){
        this.isShowModal1 = false;
        this.isShowModal2 = false;
        this.isShowModal3 = false;
    }
}
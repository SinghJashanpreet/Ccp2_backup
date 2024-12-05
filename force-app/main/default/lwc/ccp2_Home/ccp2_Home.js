import { LightningElement, track, wire } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getUserServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import Id from '@salesforce/user/Id';
import checkGuestUser from "@salesforce/apex/CCP_HeaderController.checkGuestUser";
import getLoginURL from "@salesforce/apex/CCP_HeaderController.getLoginURL";


const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const P1 = Vehicle_StaticResource + "/CCP2_Resources/Common/P1.webp";
const P2 = Vehicle_StaticResource + "/CCP2_Resources/Common/P2.webp";
const P3 = Vehicle_StaticResource + "/CCP2_Resources/Common/P3.webp";
const P4 = Vehicle_StaticResource + "/CCP2_Resources/Common/P4.webp";
const SALESCARD = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Sales-Card.png";
const DTFSACARD = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/DTFSA-Card.png";
const FINANCECARD = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Finance-Card.png";
const VEHICLECARD = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Vehicle-Card.png";


export default class Ccp2_Home extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  p1 = P1;
  p2 = P2;
  p3 = P3;
  p4 = P4;
  SALESCARD = SALESCARD;
  DTFSACARD = DTFSACARD;
  FINANCECARD = FINANCECARD;
  VEHICLECARD = VEHICLECARD;
  userId = Id;

  @track isGuestuser = false;

  @track allServices = [];
  @track hasEinvoice = false;
  @track hasvehicleManagement = false;
  @track hasDTFSA = false;
  
  @track currentIndex = 0;
  @track interval;

  @track errorModal = false;
  loginLink;

  @track images = [
    { id: 0, src: P4, indicatorClass: "indicator" },
    { id: 1, src: P2, indicatorClass: "indicator" },
    { id: 2, src: P3, indicatorClass: "indicator" },
    { id: 3, src: P1, indicatorClass: "indicator" }
  ];


  loadCheckGuestUser() {
    checkGuestUser().then((result) => {
      this.isGuestuser = result;
      console.log("guest user",this.isGuestuser);
      if (result === true) {
        this.hideFusoHeader();
        getLoginURL().then((result2) => {
          //console.log("this.loginLink", result2);
          this.loginLink = result2;
        });
      } else {
        this.showFusoHeader();
        // this.checkManagerUser();
      }
    });
  }

  connectedCallback() {
    this.loadCheckGuestUser();
    this.startCarousel();
    this.updateIndicatorClasses();
  }

  @wire(getUserServices, {
    userId: "$userId",
    refresh: 0
  })
  userServicesFun({ data, error }) {
    if (data) {
      console.log("services data",data);

      this.allServices = data;

      this.allServices.forEach((serv) => {
        if (serv.apiName === "Financial_service_Flag__c") {
          this.hasDTFSA = serv.isActive;
        } else if (serv.apiName === "E_invoice_Flag__c") {
          this.hasEinvoice = serv.isActive;
        } else if (serv.apiName === "Vehicle_management_Flag__c") {
          this.hasvehicleManagement = serv.isActive;
        }
      })

      console.log("all services",this.allServices);
      console.log("dtfsa",this.hasDTFSA);
      console.log("einv",this.hasEinvoice);
      console.log("vehi mana",this.hasvehicleManagement);

    } else {
      console.error("User Services Fetching error: wire", error);
    }
  }


  startCarousel() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.interval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      console.log("current index", this.currentIndex);
      this.updateIndicatorClasses();
    }, 5000);
  }

  handleIndicatorClick(event) {
    const index = event.target.dataset.index;
    if (index !== undefined) {
      this.currentIndex = parseInt(index, 10);
      this.updateIndicatorClasses();
      clearInterval(this.interval); // Reset the interval
      this.startCarousel(); // Restart the timer
    }
  }

  updateIndicatorClasses() {
    this.images = this.images.map((image, index) => {
      return {
        ...image,
        indicatorClass:
          image.id === this.currentIndex ? "indicator active" : "indicator"
      };
    });
    console.log("this. images", JSON.stringify(this.images));
    console.log("images len", this.images.length);
  }

  get carouselStyle() {
    return `transform: translateX(-${this.currentIndex * 100}%); transition: transform 0.5s ease-in-out;`;
  }

  disconnectedCallback() {
    clearInterval(this.interval); // Clear interval when component is destroyed
  }


  handleClickDtfsa(){
    if(this.hasDTFSA === true){

    }else{
      this.errorModal = true;
    }
  }

  hideFusoHeader() {
    const header = document.querySelector('c-ccp2_-fuso-header'); // Find the header LWC by its tag
    if (header) {
        header.style.display = 'none'; // Hide the header
    }
  }

  showFusoHeader() {
    const header = document.querySelector('c-ccp2_-fuso-header'); // Restore the header when navigating away
    if (header) {
        header.style.display = '';
    }
  }


}
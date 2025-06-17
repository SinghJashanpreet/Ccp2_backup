/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getUserServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import getUserServicesFinal from "@salesforce/apex/CCP2_Additional_Services.getServicesStatus";
import getTermsAndConditionData from "@salesforce/apex/CCP2_VehicleShakenController.getTermsRecord";
import insertFlag from "@salesforce/apex/CCP2_VehicleShakenController.createTermsNotification";
import Id from "@salesforce/user/Id";
import checkGuestUser from "@salesforce/apex/CCP_HeaderController.checkGuestUser";
import getLoginURL from "@salesforce/apex/CCP_HeaderController.getLoginURL";
import countsVehicle from "@salesforce/apex/CCP2_CalendarController.topPageData";
import getFeedbackques from "@salesforce/apex/CCP2_CalendarController.getFeedback";
import insertFeedback from "@salesforce/apex/CCP2_CalendarController.insertFeedback";
import getnotification from "@salesforce/apex/CCP2_CalendarController.getNotificationForTopPage";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import TNCLink from "@salesforce/label/c.CCP2_resource_Label";
import FUSOShopLink from "@salesforce/label/c.FUSOShopLink";
import fetchEInvoiceInfoByUserId from "@salesforce/apex/CCP_HomeCtrl.fetchEInvoiceInfoByUserId";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const logo = Vehicle_StaticResource + "/CCP2_Resources/Common/Logo-Title.png";
const P1 = Vehicle_StaticResource + "/CCP2_Resources/Common/P1.webp";
const P2 = Vehicle_StaticResource + "/CCP2_Resources/Common/P2.webp";
const P3 = Vehicle_StaticResource + "/CCP2_Resources/Common/P3.webp";
const P4 = Vehicle_StaticResource + "/CCP2_Resources/Common/P4.webp";
const TNC = TNCLink;

const notselemo1 =
  Vehicle_StaticResource + "/CCP2_Resources/Common/notsel-Emojis1.webp";
const notselemo2 =
  Vehicle_StaticResource + "/CCP2_Resources/Common/notsel-Emojis2.webp";
const notselemo3 =
  Vehicle_StaticResource + "/CCP2_Resources/Common/notsel-Emojis3.webp";
const notselemo4 =
  Vehicle_StaticResource + "/CCP2_Resources/Common/notsel-Emojis4.webp";
const notselemo5 =
  Vehicle_StaticResource + "/CCP2_Resources/Common/notsel-Emojis5.webp";
const Background =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Terms-background.webp";

const emo1 = Vehicle_StaticResource + "/CCP2_Resources/Common/Emoji1.webp";
const emo2 = Vehicle_StaticResource + "/CCP2_Resources/Common/Emoji2.webp";
const emo3 = Vehicle_StaticResource + "/CCP2_Resources/Common/Emoji3.webp";
const emo4 = Vehicle_StaticResource + "/CCP2_Resources/Common/Emoji4.webp";
const emo5 = Vehicle_StaticResource + "/CCP2_Resources/Common/Emoji5.webp";

const SALESCARD =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Sales-Card.webp";
const SALESCARDFULL =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Sales-Card-Full.webp";

const DTFSACARD =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/DTFSA-Card.webp";
const DTFSACARDFULL =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/DTFSA-Card-Full.png";

const FINANCECARD =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Finance-Card.webp";
const FINANCECARDFULL =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Invoice-Card-Full.png";

const VEHICLECARD =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Vehicle-Card.webp";
const VEHICLECARDFULL =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Vehicle-Card-Full.png";

export default class Ccp2_Home extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  p1 = P1;
  p2 = P2;
  p3 = P3;
  p4 = P4;
  notselemo1 = notselemo1;
  notselemo2 = notselemo2;
  notselemo3 = notselemo3;
  notselemo4 = notselemo4;
  notselemo5 = notselemo5;
  emo1 = emo1;
  emo2 = emo2;
  emo3 = emo3;
  emo4 = emo4;
  emo5 = emo5;
  logo = logo;
  SALESCARD = SALESCARD;
  SALESCARDFULL = SALESCARDFULL;
  DTFSACARD = DTFSACARD;
  DTFSACARDFULL = DTFSACARDFULL;
  FINANCECARD = FINANCECARD;
  FINANCECARDFULL = FINANCECARDFULL;
  VEHICLECARD = VEHICLECARD;
  VEHICLECARDFULL = VEHICLECARDFULL;
  userId = Id;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  @track isGuestuser = false;
  @track isLoading = true;

  @track allServices = [];
  @track hasEinvoice = false;
  @track hasvehicleManagement = true;
  @track hasDTFSA = false;
  @track isAdmin = false;
  @track restrictLeasePermission = false;
  @track restrictModal = false;

  @track currentIndex = 0;
  @track interval;

  loginLink;
  // FusoShop =
  //   "https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja&scope=openid&response_type=code&ui_locales=ja";

  FusoShop = FUSOShopLink;

  @track allVehicles = 0;
  @track userVehiclecnt = 0;
  @track allexpvehcount = 0;
  @track expvehicleCountofUser = 0;
  @track allrecallcount = 0;
  @track vehrecallCountofUser = 0;
  @track suggestionVeh = "";
  @track hasFirstLoginUser = false;

  @track images = [
    {
      id: 0,
      src: P1,
      indicatorClass: "indicator",
      heading: "ようこそ",
      description: "カスタマーポータル​",
      logo: logo,
      className: "carousel-item active"
    },
    {
      id: 1,
      src: P2,
      indicatorClass: "indicator",
      heading: "提供サービス",
      description: "車両管理",
      logo: "",
      className: "carousel-item"
    },
    {
      id: 2,
      src: P3,
      indicatorClass: "indicator",
      heading: "提供サービス",
      description: "部整月次請求書",
      logo: "",
      className: "carousel-item"
    },
    {
      id: 3,
      src: P4,
      indicatorClass: "indicator",
      heading: "提供サービス",
      description: "FUSOリース",
      logo: "",
      className: "carousel-item"
    }
  ];

  @track feedbackModal = false;
  @track successModal = false;
  @track feedbackQuescontainer = [];
  @track generalQues = [];
  @track vehicleQues = [];
  @track dtfsaQues = [];
  @track invoiceQues = [];

  @track responses = [];

  @track dtfsaNotif = [];
  @track noNotifdtfsa = true;
  @track noNotifinv = true;
  @track dtfsaDate;
  @track dtfsadesc;
  @track dtfsareissue;
  @track dtfsadesc1;
  @track dtfsadesc2;
  @track invoiceDate;
  @track invoicedesc;
  @track invoiceNotif = [];
  @track isButtonDisabled = true;

  @track isShowModal1 = false;

  loadCheckGuestUser() {
    checkGuestUser().then((result) => {
      this.isLoading = true;
      this.isGuestuser = result;
      this.isLoading = false;
      console.log("guest user", this.isGuestuser);
      if (result === true) {
        // this.hideFusoHeader();
        // this.hideFusoFooter();
        getLoginURL().then((result2) => {
          //console.log("this.loginLink", result2);
          this.loginLink = result2;
        });
      } else {
        // this.showFusoHeader();
        // this.showFusoFooter();
        // this.checkManagerUser();
      }
    });
  }

  @track dtfsaUrl;
  @track vehiclemanagementUrl;
  @track einvoiceUrl;

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
        // let err = JSON.stringify(error);
        // ErrorLog({ lwcName: "ccp2_Home", errorLog: err, methodName: "Load Language" })
        //   .then(() => {
        //     console.log("Error logged successfully in Salesforce");
        //   })
        //   .catch((loggingErr) => {
        //     console.error("Failed to log error in Salesforce:", loggingErr);
        //   });
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
    fetch(`${labelsUser}/infoCenter.json`)
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
            console.log("Delete Detail User Locale: ", userLocale);
            console.log("Delete Detail User Labels: ", this.labels2);
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        // let err = JSON.stringify(error);
        // ErrorLog({ lwcName: "ccp2_Home", errorLog: err, methodName: "Load Labels" })
        //   .then(() => {
        //     console.log("Error logged successfully in Salesforce");
        //   })
        //   .catch((loggingErr) => {
        //     console.error("Failed to log error in Salesforce:", loggingErr);
        //   });
      });
  }

  getLocale() {
    console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === "en_US") {
      console.log("working1");
      return "en";
    }
    console.log("working2");
    return "jp";
  }

  connectedCallback() {
    window.scrollTo(0, 0);
    if (this.isLoading === true)
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    this.loadCheckGuestUser();
    this.startCarousel();
    this.updateIndicatorClasses();

    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      this.dtfsaUrl = baseUrl.split("/s/")[0] + "/s/dtfsa-docs";
      this.vehiclemanagementUrl =
        baseUrl.split("/s/")[0] + "/s/vehiclemanagement";
      this.einvoiceUrl = baseUrl.split("/s/")[0] + "/s/einvoice";
    }
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
    }
  }

  @wire(getUserServicesFinal)
  userServicesFun({ data, error }) {
    if (data) {
      console.log("services data", data);

      this.hasDTFSA = data.isLeasePermission;
      this.hasEinvoice = data.isEinvoicePermission;
      this.hasvehicleManagement = data.isVehPermission;
      this.isAdmin = data.isAdmin;
      this.restrictLeasePermission = data.restrictLeasePermission;
      console.log("dtfsa", this.hasDTFSA);
      console.log("einv", this.hasEinvoice);
      console.log("vehi mana", this.hasvehicleManagement);
      console.log("vehi isAdmin", this.isAdmin);
      console.log("vehi restrictLeasePermission", this.restrictLeasePermission);

      // this.allServices = data;

      // this.allServices.forEach((serv) => {
      //   if (serv.apiName === "FUSO_CCP_External_Financial_service") {
      //     this.hasDTFSA = serv.isActive;
      //   } else if (serv.apiName === "E_invoice") {
      //     this.hasEinvoice = serv.isActive;
      //   }
      //   else if (serv.apiName === "FUSO_CCP_External_Vehicle_management") {
      //     this.hasvehicleManagement = serv.isActive;
      //   }
      // });

      // console.log("all services", JSON.stringify(this.allServices));
      // console.log("dtfsa", this.hasDTFSA);
      // console.log("einv", this.hasEinvoice);
      // console.log("vehi mana", this.hasvehicleManagement);
    } else {
      console.error("User Services Fetching error: wire", error);
    }
  }

  @track wiredTermsData;

  @wire(countsVehicle)
  countExp(result) {
    this.wiredTermsData = result; // Store result reference for refreshApex
    const { data, error } = result;

    if (data) {
      this.isLoading = true;
      console.log("data counttt", data);

      this.allVehicles = data.AccountVehCount;
      this.userVehiclecnt = data.VehCountLoggedIn;
      this.allexpvehcount = data.vehicleForExpiryCountAccount;
      this.expvehicleCountofUser = data.expiringVehicleCount;
      this.allrecallcount = data.vehicleRecallCountAccount;
      this.vehrecallCountofUser = data.vehicleRecallCount;

      this.hasFirstLoginUser = !data.agreeTnC;

      this.isLoading = false;

      this.SiebelCode = data.siebelAccountCode;
    } else {
      console.log("error", error);
    }
  }

  @wire(getFeedbackques)
  feedbackQues({ data, error }) {
    if (data) {
      console.log("data questions", data);
      this.feedbackQuescontainer = data;

      this.vehicleQues = this.feedbackQuescontainer
        .filter((itm) => itm.CCP2_Type__c === "Vehicle")
        .map((itm) => ({
          vehId: itm.Id,
          vehQues: itm.CCP2_Question__c,
          vehType: itm.CCP2_Type__c,
          vehQuesType: itm.ccp2_questionType__c,
          ratingType: itm.ccp2_questionType__c === "Rating Selection",
          textboxType: itm.ccp2_questionType__c === "Textbox",
          isRating1: false,
          isRating2: false,
          isRating3: false,
          isRating4: false,
          isRating5: false
        }));

      this.generalQues = this.feedbackQuescontainer
        .filter((itm) => itm.CCP2_Type__c === "General")
        .map((itm) => ({
          genId: itm.Id,
          genQues: itm.CCP2_Question__c,
          genType: itm.CCP2_Type__c,
          genQuesType: itm.ccp2_questionType__c,
          ratingType: itm.ccp2_questionType__c === "Rating Selection",
          textboxType: itm.ccp2_questionType__c === "Textbox",
          isRating1: false,
          isRating2: false,
          isRating3: false,
          isRating4: false,
          isRating5: false
        }));

      this.dtfsaQues = this.feedbackQuescontainer
        .filter((itm) => itm.CCP2_Type__c === "DTFSA")
        .map((itm) => ({
          dtId: itm.Id,
          dtQues: itm.CCP2_Question__c,
          dtType: itm.CCP2_Type__c,
          dtQuesType: itm.ccp2_questionType__c,
          ratingType: itm.ccp2_questionType__c === "Rating Selection",
          textboxType: itm.ccp2_questionType__c === "Textbox",
          isRating1: false,
          isRating2: false,
          isRating3: false,
          isRating4: false,
          isRating5: false
        }));

      // Filtering and mapping for Invoice questions
      this.invoiceQues = this.feedbackQuescontainer
        .filter((itm) => itm.CCP2_Type__c === "Invoice")
        .map((itm) => ({
          invId: itm.Id,
          invQues: itm.CCP2_Question__c,
          invType: itm.CCP2_Type__c,
          invQuesType: itm.ccp2_questionType__c,
          ratingType: itm.ccp2_questionType__c === "Rating Selection",
          textboxType: itm.ccp2_questionType__c === "Textbox",
          isRating1: false,
          isRating2: false,
          isRating3: false,
          isRating4: false,
          isRating5: false
        }));

      console.log("vehicle ques", JSON.stringify(this.vehicleQues));
      console.log("dtf ques", JSON.stringify(this.dtfsaQues));
      console.log("inv ques", JSON.stringify(this.invoiceQues));
      console.log("gen ques", JSON.stringify(this.generalQues));
    } else {
      console.log("error in ques", error);
    }
  }

  @wire(getnotification)
  handlenotification({ data, error }) {
    if (data) {
      console.log("data of notification", data);
      if (data.length !== 0) {
        this.dtfsaNotif = data.filter(
          (noti) => noti.Notification_Type__c === "dtfsa"
        );
        this.invoiceNotif = data.filter(
          (noti) => noti.Notification_Type__c === "eInvoice"
        );

        if (this.dtfsaNotif.length !== 0) {
          this.noNotifdtfsa = false;
          this.dtfsaDate = this.formatJapaneseDate(
            new Date(this.dtfsaNotif[0].CreatedDate).toISOString().split("T")[0]
          );
          this.dtfsadesc = this.dtfsaNotif[0].Description__c;
          this.dtfsareissue = this.dtfsaNotif[0].CorrectFlag__c === "1";
          // let descriptions = this.dtfsaNotif[0].Description__c.split(',');
          // this.dtfsadesc1 = descriptions[0] || '';
          // this.dtfsadesc2 = descriptions[1] || '';
        } else {
          this.noNotifdtfsa = true;
        }

        if (this.invoiceNotif.length !== 0) {
          this.noNotifinv = false;
          this.invoiceDate = this.formatJapaneseDate(
            new Date(this.invoiceNotif[0].CreatedDate)
              .toISOString()
              .split("T")[0]
          );
          this.invoicedesc = this.invoiceNotif[0].Description__c;
        } else {
          this.noNotifinv = true;
        }

        console.log("dtfsa dtfsareissue", this.dtfsareissue);
      } else {
        this.noNotifdtfsa = true;
        this.noNotifinv = true;
      }
    } else {
      console.log("error in notification", error);
    }
  }

  startCarousel() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.interval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      console.log("current index", this.currentIndex);
      this.updateIndicatorClasses();
    }, 4000);
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
          image.id === this.currentIndex ? "indicator active" : "indicator",
        className:
          image.id === this.currentIndex
            ? "carousel-item active"
            : "carousel-item"
      };
    });
  }

  get carouselStyle() {
    return `transform: translateX(-${this.currentIndex * 100}%); transition: transform 0.5s ease-in-out;`;
  }

  disconnectedCallback() {
    clearInterval(this.interval); // Clear interval when component is destroyed
  }

  // hideFusoHeader() {
  //   const header = document.querySelector("c-ccp2_-fuso-header"); // Find the header LWC by its tag
  //   if (header) {
  //     header.style.display = "none"; // Hide the header
  //   }
  // }

  // showFusoHeader() {
  //   const header = document.querySelector("c-ccp2_-fuso-header"); // Restore the header when navigating away
  //   if (header) {
  //     header.style.display = "";
  //   }
  // }
  // hideFusoFooter() {
  //   const header = document.querySelector("c-ccp2_-fuso-footer"); // Find the header LWC by its tag
  //   if (header) {
  //     header.style.display = "none"; // Hide the header
  //   }
  // }

  // showFusoFooter() {
  //   const header = document.querySelector("c-ccp2_-fuso-footer"); // Restore the header when navigating away
  //   if (header) {
  //     header.style.display = "";
  //   }
  // }

  handleVehicleClick() {
    window.location.href = this.vehiclemanagementUrl;
  }

  // handleInvoiceclick() {
  //   window.location.href =
  //     this.einvoiceUrl;
  // }

  async handleInvoiceclick() {
    try {
      // Apexが完了するまで待機
      const result = await fetchEInvoiceInfoByUserId();
      console.log(result);
      if (result) {
        // eInvoiceが有効な場合は画面遷移
        window.location.href = this.einvoiceUrl;
      } else {
        /// eInvoiceが有効な場合はモーダルを表示
        this.isShowModal1 = true;
      }
    } catch (error) {
      console.error("Apex呼び出しエラー:", error);
    }
  }

  handledtfsaclick() {
    window.location.href = this.dtfsaUrl;
  }

  @track SiebelCode = "";

  handleFusoshopclick() {
    // const SiebelCode = this.vehicleDetails.siebelAccountCode;
    const stateData = {
      customerID: this.SiebelCode
    };

    //const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja`;
    const baseUrl = this.FusoShop;
    // const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://fuso-shop-staging.app.mitsubishi-fuso.com/mftbc/ja/hinmoku-search`;
    // const scope = `&scope=openid offline_access 4d21e801-db95-498f-8cc5-1363af53d834&response_type=code`;
    const scope = `&scope=openid&response_type=code&ui_locales=ja`;
    //const baseUrl = `https://login.b2b-int.daimlertruck.com/corptbb2cstaging.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_signup_signin&client_id=4d21e801-db95-498f-8cc5-1363af53d834&nonce=defaultNonce&redirect_uri=https://shop.mitsubishi-fuso.com/mftbc/ja/Open-Catalogue/c/1`;
    const stateString = encodeURIComponent(JSON.stringify(stateData));
    console.log(stateString);
    const url = `${baseUrl}&state=${stateString}${scope}`;
    console.log("urldev", url);
    window.open(url, "_blank");

    // window.open(this.FusoShop, "_blank");
  }

  handleFeedbackClick() {
    this.feedbackModal = true;
  }

  hideModalBox() {
    this.isShowModal1 = false;
  }

  handleRatingClickgen(event) {
    const genId = event.currentTarget.dataset.idd;
    const ratingValue = event.currentTarget.dataset.valuee;

    this.generalQues = this.generalQues.map((veh) => {
      if (veh.genId === genId) {
        for (let i = 1; i <= 5; i++) {
          veh[`isRating${i}`] = false;
        }
        veh[`isRating${ratingValue}`] = true;
      }
      return veh;
    });
    console.log("start responses seleected");

    const existingResponseIndex = this.responses.findIndex(
      (response) => response.recordId === genId
    );

    if (existingResponseIndex !== -1) {
      this.responses[existingResponseIndex] = {
        recordId: genId,
        rating: ratingValue,
        UserId: this.userId
      };
    } else {
      this.responses.push({
        recordId: genId,
        rating: ratingValue,
        UserId: this.userId
      });
    }

    console.log("responses seleected", JSON.stringify(this.responses));
  }

  handleRatingClick(event) {
    const vehId = event.currentTarget.dataset.idd;
    const ratingValue = event.currentTarget.dataset.valuee;

    this.vehicleQues = this.vehicleQues.map((veh) => {
      if (veh.vehId === vehId) {
        for (let i = 1; i <= 5; i++) {
          veh[`isRating${i}`] = false;
        }
        veh[`isRating${ratingValue}`] = true;
      }
      return veh;
    });
    console.log("start responses seleected");

    const existingResponseIndex = this.responses.findIndex(
      (response) => response.recordId === vehId
    );

    if (existingResponseIndex !== -1) {
      this.responses[existingResponseIndex] = {
        recordId: vehId,
        rating: ratingValue,
        UserId: this.userId
      };
    } else {
      this.responses.push({
        recordId: vehId,
        rating: ratingValue,
        UserId: this.userId
      });
    }

    console.log("responses seleected", JSON.stringify(this.responses));
  }

  handleRatingClickdt(event) {
    const dtId = event.currentTarget.dataset.idd;
    const ratingValue = event.currentTarget.dataset.valuee;
    this.dtfsaQues = this.dtfsaQues.map((veh) => {
      if (veh.dtId === dtId) {
        for (let i = 1; i <= 5; i++) {
          veh[`isRating${i}`] = false;
        }
        veh[`isRating${ratingValue}`] = true;
      }
      return veh;
    });

    console.log("record id in dtfsa", dtId);
    const existingResponseIndex = this.responses.findIndex(
      (response) => response.recordId === dtId
    );
    console.log("33", existingResponseIndex);

    if (existingResponseIndex !== -1) {
      this.responses[existingResponseIndex] = {
        recordId: dtId,
        rating: ratingValue,
        UserId: this.userId
      };
    } else {
      this.responses.push({
        recordId: dtId,
        rating: ratingValue,
        UserId: this.userId
      });
    }
    console.log("responses seleected dtttt", JSON.stringify(this.responses));
  }

  handleRatingClickinv(event) {
    const invId = event.currentTarget.dataset.idd;
    const ratingValue = event.currentTarget.dataset.valuee;
    this.invoiceQues = this.invoiceQues.map((veh) => {
      if (veh.invId === invId) {
        for (let i = 1; i <= 5; i++) {
          veh[`isRating${i}`] = false;
        }
        veh[`isRating${ratingValue}`] = true;
      }
      return veh;
    });
    const existingResponseIndex = this.responses.findIndex(
      (response) => response.recordId === invId
    );

    if (existingResponseIndex !== -1) {
      this.responses[existingResponseIndex] = {
        recordId: invId,
        rating: ratingValue,
        UserId: this.userId
      };
    } else {
      this.responses.push({
        recordId: invId,
        rating: ratingValue,
        UserId: this.userId
      });
    }
    console.log("responses seleected incvvvv", JSON.stringify(this.responses));
  }

  handlesuggestionboxveh(event) {
    this.handlevalchange(event);
    const vehId = event.target.dataset.idd;
    this.suggestionVeh = event.target.value;
    const value = event.target.value;

    if (value) {
      const existingResponseIndex = this.responses.findIndex(
        (response) => response.recordId === vehId
      );

      if (existingResponseIndex !== -1) {
        this.responses[existingResponseIndex].suggestion = value;
      } else {
        this.responses.push({
          recordId: vehId,
          suggestion: value,
          UserId: this.userId
        });
      }
    } else {
      this.responses = this.responses.filter(
        (response) => response.recordId !== vehId
      );
    }

    console.log("Updated responses:", JSON.stringify(this.responses));
  }

  handlecross() {
    this.suggestionVeh = "";
    this.responses = [];
    this.isButtonDisabled = true;
    console.log("responses on cross", JSON.stringify(this.responses));
    this.invoiceQues = this.invoiceQues.map((veh) => {
      Object.keys(veh).forEach((key) => {
        if (key.startsWith("isRating")) {
          veh[key] = false;
        }
      });
      return veh;
    });
    this.generalQues = this.generalQues.map((veh) => {
      Object.keys(veh).forEach((key) => {
        if (key.startsWith("isRating")) {
          veh[key] = false;
        }
      });
      return veh;
    });
    this.dtfsaQues = this.dtfsaQues.map((veh) => {
      Object.keys(veh).forEach((key) => {
        if (key.startsWith("isRating")) {
          veh[key] = false;
        }
      });
      return veh;
    });
    this.vehicleQues = this.vehicleQues.map((veh) => {
      Object.keys(veh).forEach((key) => {
        if (key.startsWith("isRating")) {
          veh[key] = false;
        }
      });
      return veh;
    });
    this.feedbackModal = false;
  }

  handleremoveRatingClickgen(event) {
    const genId = event.currentTarget.dataset.idd;
    const ratingValue = event.currentTarget.dataset.valuee;

    this.generalQues = this.generalQues.map((veh) => {
      if (veh.genId === genId) {
        veh[`isRating${ratingValue}`] = false;
      }
      return veh;
    });
    this.responses = this.responses.filter(
      (response) =>
        response.recordId !== genId || response.rating !== ratingValue
    );
    console.log("responses removed", JSON.stringify(this.responses));
  }

  handleremoveRatingClick(event) {
    const vehId = event.currentTarget.dataset.idd;
    const ratingValue = event.currentTarget.dataset.valuee;

    this.vehicleQues = this.vehicleQues.map((veh) => {
      if (veh.vehId === vehId) {
        veh[`isRating${ratingValue}`] = false;
      }
      return veh;
    });
    this.responses = this.responses.filter(
      (response) =>
        response.recordId !== vehId || response.rating !== ratingValue
    );
    console.log("responses removed", JSON.stringify(this.responses));
  }

  handleremoveRatingClickdt(event) {
    const dtId = event.currentTarget.dataset.idd;
    const ratingValue = event.currentTarget.dataset.valuee;
    this.dtfsaQues = this.dtfsaQues.map((veh) => {
      if (veh.dtId === dtId) {
        veh[`isRating${ratingValue}`] = false;
      }
      return veh;
    });
    this.responses = this.responses.filter(
      (response) =>
        response.recordId !== dtId || response.rating !== ratingValue
    );
    console.log("responses removed dttt", JSON.stringify(this.responses));
  }
  handleremoveRatingClickinv(event) {
    const invId = event.currentTarget.dataset.idd;
    const ratingValue = event.currentTarget.dataset.valuee;
    this.invoiceQues = this.invoiceQues.map((veh) => {
      if (veh.invId === invId) {
        veh[`isRating${ratingValue}`] = false;
      }
      return veh;
    });
    this.responses = this.responses.filter(
      (response) =>
        response.recordId !== invId || response.rating !== ratingValue
    );
  }

  handlesavedata() {
    const JSONstring = JSON.stringify(this.responses);
    console.log("json string", JSONstring);
    insertFeedback({ jsonString: JSONstring })
      .then((result) => {
        console.log("result of insert", result);
        this.invoiceQues = this.invoiceQues.map((veh) => {
          Object.keys(veh).forEach((key) => {
            if (key.startsWith("isRating")) {
              veh[key] = false;
            }
          });
          return veh;
        });
        this.generalQues = this.generalQues.map((veh) => {
          Object.keys(veh).forEach((key) => {
            if (key.startsWith("isRating")) {
              veh[key] = false;
            }
          });
          return veh;
        });
        this.dtfsaQues = this.dtfsaQues.map((veh) => {
          Object.keys(veh).forEach((key) => {
            if (key.startsWith("isRating")) {
              veh[key] = false;
            }
          });
          return veh;
        });
        this.vehicleQues = this.vehicleQues.map((veh) => {
          Object.keys(veh).forEach((key) => {
            if (key.startsWith("isRating")) {
              veh[key] = false;
            }
          });
          return veh;
        });
      })
      .catch((error) => {
        console.error("error", error);
        // let err = JSON.stringify(error);
        // ErrorLog({ lwcName: "ccp2_Home", errorLog: err, methodName: "Handle Save Data" })
        //   .then(() => {
        //     console.log("Error logged successfully in Salesforce");
        //   })
        //   .catch((loggingErr) => {
        //     console.error("Failed to log error in Salesforce:", loggingErr);
        //   });
      });

    this.responses = [];
    this.feedbackModal = false;
    this.successModal = true;
  }

  formatJapaneseDate(isoDate) {
    if (isoDate === undefined) {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }

  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    this.isButtonDisabled = value.trim().length === 0;

    console.log("before", value, " - length", value.length);
    if (value.length > maxLength) {
      event.target.blur();
    }
  }

  get responseLength() {
    return this.responses.length === 0 && this.isButtonDisabled;
  }

  get servicesFlag() {
    return this.hasDTFSA || this.hasEinvoice || this.hasvehicleManagement;
  }

  handleOk() {
    this.successModal = false;
  }

  get fixedContact() {
    return !this.hasDTFSA && !this.hasEinvoice && !this.hasvehicleManagement;
  }

  // handleApplicationclickdtfsa(){
  //   const baseUrl = window.location.href + "dtfsa-docs";
  //   window.location.href = baseUrl;
  // }

  handleApplicationclick(event) {
    let name = event.target.dataset.name;
    if (event.target.dataset.name === "dtfsa") {
      if (this.restrictLeasePermission) {
        this.restrictModal = true;
      } else {
        const baseUrl =
          window.location.href + "additional-services?instance=" + name;
        window.location.href = baseUrl;
      }
    } else {
      const baseUrl =
        window.location.href + "additional-services?instance=" + name;
      window.location.href = baseUrl;
    }
  }
  // terms and conditions modal
  @track hasScrolledToBottom = false;
  background = Background;
  @track TncData = [];

  get isOpen() {
    return !this.hasScrolledToBottom;
  }

  handleOkTerms(event) {
    let Id = event.target.dataset.id;
    console.log("dataId", Id);
    let record = this.TncData.find((record) => record.Id === Id);

    if (record) {
      record.isLoading = true;
      this.TncData = [...this.TncData];
    }
    insertFlag({ termId: Id })
      .then(() => {
        let updatedRecord = this.TncData.find((rec) => rec.Id === Id);

        if (updatedRecord) {
          updatedRecord.isLoading = false;
          this.TncData = [...this.TncData];
        }
        console.log(
          "the values : ",
          updatedRecord.index,
          "sw",
          this.TncData.length
        );
        if (updatedRecord.index === this.TncData.length - 1) {
          window.location.reload();
        }
      })
      .catch((error) => {
        console.error("Error updating record:", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_TnCModal",
          errorLog: err,
          methodName: "handleOk",
          ViewName: "Home Page",
          InterfaceName: "Salesforce",
          EventName: "Data fetch",
          ModuleName: "HomePage"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  handleScroll() {
    const scrollableDiv = this.template.querySelector(
      ".modal-description-terms"
    );
    if (!scrollableDiv) return;

    const isScrollable =
      scrollableDiv.scrollHeight > scrollableDiv.clientHeight;

    if (!isScrollable) {
      this.hasScrolledToBottom = true;
      console.log("No scrolling required, button enabled!");
      return;
    }

    // Console log the scroll properties
    console.log("scrollTop:", scrollableDiv.scrollTop);
    console.log("clientHeight:", scrollableDiv.clientHeight);
    console.log("scrollHeight:", scrollableDiv.scrollHeight);
    console.log(
      "Reached Bottom?:",
      scrollableDiv.scrollTop + scrollableDiv.clientHeight >=
        scrollableDiv.scrollHeight
    );

    // Check if the user has scrolled to the bottom
    if (
      scrollableDiv.scrollTop + scrollableDiv.clientHeight >=
      scrollableDiv.scrollHeight
    ) {
      this.hasScrolledToBottom = true; // Enable button permanently
      console.log("User reached the bottom, button enabled!");
    }
  }
  @wire(getTermsAndConditionData)
  wiredTnCData({ error, data }) {
    if (data) {
      console.log("TnC data ", JSON.stringify(data));
      this.TncData = Object.keys(data).map((key, index) => ({
        ...data[key], // Spread existing data from each object (CCP, DTFSA, etc.)
        index: index,
        pdfurl: `${TNC}${data[key].pdf_Url__c}`,
        createdDate: this.formatJapaneseDate(data[key].CreatedDate),
        startDate: this.formatJapaneseDate(data[key].Start_Date__c),
        LastModified: this.formatJapaneseDate(data[key].lstDate),
        isLoading: true,
        LastModifiedDay: this.formatJapaneseDateSmall(data[key].lstDate),
        description0: data[key].Description.split("。")[0] + "。",
        description1: data[key].Description.split("。")[1],
        TrueA: data[key].Type === "E-Invoice",
        TrueB: data[key].Type === "DTFSA",
        TrueC: data[key].Type === "CCP"
      }));
      //   this.TncData = data.map((record, index) => ({
      //     ...record,
      //     index: index,
      //     pdfurl: "https://dm595--ccpdev2.sandbox.my.site.com/resource/"+ record.pdf_Url__c,
      //     createdDate: this.formatJapaneseDate(record.Start_Date__c),
      //     LastModified:  this.formatJapaneseDate(record.LastModifiedDate),
      //     isLoading : true,
      //     LastModifiedDay: this.formatJapaneseDateSmall(record.LastModifiedDate)
      // }));
      console.log("TnC data main", JSON.stringify(this.TncData));
    } else if (error) {
      console.error("Error fetching Notification Data:", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_TnCModal",
        errorLog: err,
        methodName: "wire",
        ViewName: "Home Page",
        InterfaceName: "Salesforce",
        EventName: "Data fetch",
        ModuleName: "HomePage"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  formatJapaneseDate(isoDate) {
    if (isoDate == undefined) {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }
  formatJapaneseDateSmall(isoDate) {
    if (isoDate == undefined) {
      return "";
    }
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  }

  handleInvoff() {
    this.isShowModal1 = false;
  }
  handlebackDtfsa() {
    this.restrictModal = false;
  }
}

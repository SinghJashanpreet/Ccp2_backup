import { LightningElement, track, wire } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import returnNotificationData from "@salesforce/apex/CCP2_Notification_Controller.returnNotificationData";
import labelsBranch from "@salesforce/resourceUrl/ccp2_labels";
import Languagei18n from "@salesforce/apex/CCP2_guestUserLanguage.guestuserLanguage";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import Id from "@salesforce/user/Id";
import CCP2_resource_Label from "@salesforce/label/c.CCP2_resource_Label";
import getAllServices from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const tncCustomlabel = CCP2_resource_Label;

export default class Ccp2_NotificationsCentre extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  @track notificationPage = true;
  @track vehicledetailspage = false;
  @track isAllSelected = true;
  @track vehicleId = "";
  @track isVehicleSelected = false;
  @track uid = Id;
  @track isNewsSelected = false;
  @track isTermsSelected = false;
  @track isFinanceSelected = false;
  @track isEInvoice = false;
  @track vehicleList = false;
  @track a = false;
  @track b = false;
  @track c = false;
  @track notificationloop = false;
  @track Notificationshowmore = false;
  @track NotificationshowmoreNews = false;
  @track Notificationd = [];
  @track NotifdecShowmore = "";
  @track d = false;
  @track notificationdata = [];
  @track hasNotificationVehicle = false;
  @track hasNotificationFinance = false;
  @track hasNotificationInvoice = false;
  @track hasNotificationNews = false;
  @track hasNotificationTerms = false;
  @track showMoremodalNews = false;
  @track emptynotificationdata = false;

  get notificationDataLength() {
    if (Array.isArray(this.notificationdata)) {
      console.log("Notification Data Length:", this.notificationdata.length);
      return this.notificationdata.length;
    } else {
      console.log(
        "Notification Data is not an array or is undefined:",
        this.notificationdata
      );
      return 0;
    }
  }

  @wire(returnNotificationData)
  wiredNotificationData({ error, data }) {
    if (data) {
      this.notificationdata = JSON.parse(JSON.stringify(data));
      // this.emptynotificationdata = this.notificationdata.length() != 0;
      this.notificationdata.sort((a, b) => {
        const dateA = a.Date ? new Date(a.Date) : new Date(0);
        const dateB = b.Date ? new Date(b.Date) : new Date(0);

        return dateB - dateA;
      });
      // const newNotification = {
      //     id: "a1cIo0000008me0IAA",
      //     vehicleNumber: "車両-209-の-2121",
      //     Date: "2024/10/29",
      //     Description: "リース契約の書類がアップロードされました",
      //     Type: "dtfsa",
      //     vehicleId: "a1aIo000000GwoXIAS"
      // };
      // const newNotificationInvoice = {
      //     id: "a1cIo0000008me1IAB",
      //     vehicleNumber: "車両-210-の-2122",
      //     Date: "2024/10/29",
      //     Description: "１０月の請求書アップロードされました。",
      //     Type: "Invoice",
      //     vehicleId: "a1aIo000000GwoYIAB"
      // };
      // const newNotification3 = {
      //     id: "a1cIo0000008me0IAQ",
      //     vehicleNumber: "車両-209-の-2121",
      //     Date: "2024/10/29",
      //     Description: "１０月の請求書アップロードされました。",
      //     Type: "Invoice",
      //     vehicleId: "a1aIo000000GwoXIAS"
      // };

      // // Define the new date entry
      // const newDateEntry = {
      //     date: "29/10/2024",
      //     notifications: [newNotification, newNotificationInvoice,newNotification3]
      // };

      // // Push the new date entry into the existing notificationdata array
      // this.notificationdata.push(newDateEntry);
      this.handleallcardstoshow();
    } else if (error) {
      // Log any errors if they occur
      console.error("Error fetching Notification Data:", error);
      let err = JSON.stringify(error);
      ErrorLog({
        lwcName: "ccp2_NotificationCentre",
        errorLog: err,
        methodName: "wiredNotificationData",
        ViewName: "Notification centre",
        InterfaceName: "CCP User Interface",
        EventName: "Fetching notification data",
        ModuleName: "Notification centre"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }
  directBook = false;
  eInvoice = false;

  @track notifDescription = "";
  @track notifDate = "";
  @track notifRegistration = "";
  @track showMoremodal = false;
  @track isVehicleSelectedNotEmpty = false;
  @track isRecallSelectedNotEmpty = false;
  @track isInvoiceSelectedNotEmpty = false;
  @track isNewsSelectedNotEmpty = false;
  @track isTermsSelectedNotEmpty = false;

  get notificationVehicleEmpty() {
    return this.notificationdata && this.isVehicleSelectedNotEmpty;
  }
  get notificationRecallEmpty() {
    return this.notificationdata && this.isRecallSelectedNotEmpty;
  }
  get notificationInvoiceEmpty() {
    return this.notificationdata && this.isInvoiceSelectedNotEmpty;
  }
  get notificationNewsEmpty() {
    return this.notificationdata && this.isNewsSelectedNotEmpty;
  }
  get notificationTermsEmpty() {
    return this.notificationdata && this.isTermsSelectedNotEmpty;
  }

  connectedCallback() {
    getAllServices({ userId: this.uid, refresh: 0 })
      .then((res) => {
        console.log("res", res);

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
          lwcName: "ccp2_NotificationCentre",
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

  handleallcardstoshow() {
    if (!this.notificationdata || !Array.isArray(this.notificationdata)) {
      console.error("Invalid notification data structure");
      return;
    }

    this.notificationdata.forEach((group) => {
      if (!group.notifications || !Array.isArray(group.notifications)) {
        console.error("Invalid notifications structure in group");
        return;
      }
      group.showDateA = false;
      group.showDateB = false;
      group.showDateC = false;
      group.showDateD = false;
      group.showDateE = false;
      group.showDateF = false;
      group.date = this.formatJapaneseDate(group.date);
      group.notifications.forEach((notification) => {
        if (!notification) {
          console.error("Invalid notification object");
          return;
        }
        // const a = false;
        // const b = false;
        // const c = false;
        // const d = false;
        // const Notificationshowmore = false;
        // const fullDesc = notification.Description || "";

        notification["a"] = false;
        notification["b"] = false;
        notification["c"] = false;
        notification["d"] = false;
        notification["e"] = false;
        notification["f"] = false;
        notification["Notificationshowmore"] = false;
        notification["NotificationshowmoreNews"] = false;
        notification["fullNewsDescription"] = "";
        notification["trimmedNewsDescription"] = "";
        notification["newsTitleTrimmed"] = "";
        notification["fullDesc"] = notification.Description || "";

        const formatdate = this.formatJapaneseDate(notification.Date);
        notification.Date = formatdate;
        if (notification.newsDescription) {
          notification.fullNewsDescription = this.convertRichTextToPlainText(
            notification.newsDescription
          );
          notification.trimmedNewsDescription = this.substringToProperLength(
            notification.fullNewsDescription,
            149
          );
        }
        if (notification.newsTitle) {
          notification.newsTitleTrimmed = this.substringToProperLength(
            notification.newsTitle,
            76
          );
        }
        if (notification.Description && notification.Type === "dtfsa") {
          notification.Description = notification.Description.replaceAll(
            ",",
            "、"
          );
        }

        if (notification.Description && notification.Description.length > 90) {
          notification.Description =
            notification.Description.slice(0, 90) + "...";
          notification.Notificationshowmore = true;
        }
        if (
          notification.newsDescription &&
          notification.newsDescription.length > 90
        ) {
          //  notification.Description = notification.Description.slice(0, 90) + '...';
          notification.NotificationshowmoreNews = true;
        }
        // if there is no vehicle type present then - showemptyA = true;

        // Set flags based on notification type
        switch (notification.Type) {
          case "VehicleExp":
            this.isVehicleSelectedNotEmpty = true;
            notification.a = true;
            group.showDateB = true;
            break;

          case "Recall":
            this.isVehicleSelectedNotEmpty = true;
            notification.b = true;
            group.showDateB = true;
            break;

          case "eInvoice":
            this.isRecallSelectedNotEmpty = true;
            notification.c = true;
            group.showDateC = true;
            break;

          case "dtfsa":
            if (notification.CorrectFlag === "1") {
              notification.title = "FUSOリース書類再発行のお知らせ";
            } else {
              notification.title = "FUSOリース書類発行のお知らせ";
            }
            // if(notification.NotificationCreatedDate){
            //   notification.Date = this.formatJapaneseDate(notification.NotificationCreatedDate);
            // }else{
            //   notification.Date = notification.Date;
            // }
            this.isInvoiceSelectedNotEmpty = true;
            notification.d = true;
            group.showDateD = true;
            break;
          case "News":
            this.isNewsSelectedNotEmpty = true;
            notification.e = true;
            group.showDateE = true;
            if (notification.URL) {
              notification.URL = `${tncCustomlabel}${notification.URL}`;
            }
            break;
          case "Terms":
            this.isTermsSelectedNotEmpty = true;
            notification.f = true;
            group.showDateF = true;
            break;
          default:
            break;
        }
      });

      group.notifications.forEach((notification) => {
        // If any notification has b, c, or d as true, set the respective flag to false
        if (notification.b) {
          this.hasNotificationVehicle = false;
        }
        if (notification.c) {
          this.hasNotificationInvoice = false;
        }
        if (notification.d) {
          this.hasNotificationFinance = false;
        }
        if (notification.e) {
          this.hasNotificationNews = false;
        }
        if (notification.f) {
          this.hasNotificationTerms = false;
        }
      });
    });
  }
  convertRichTextToPlainText(richText) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = richText;
    return tempDiv.textContent || tempDiv.innerText || "";
  }

  handleAllclick() {
    window.scrollTo(0, 0);
    this.isAllSelected = true;
    this.isVehicleSelected = false;
    this.isNewsSelected = false;
    this.isFinanceSelected = false;
    this.isEInvoice = false;
    this.isTermsSelected = false;
  }

  handleVehicleClick() {
    window.scrollTo(0, 0);
    this.isAllSelected = false;
    this.isVehicleSelected = true;
    this.isNewsSelected = false;
    this.isFinanceSelected = false;
    this.isEInvoice = false;
    this.isTermsSelected = false;
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

  //   abbreviateName(name) {
  //     return this.isFullWidth(name) ? name.length <= 60 ? name :  name.slice(0,60)+"..." : name.length <= 179 ? name : name.slice(0,179)+"...";
  //     }
  //     abbreviateName2(name) {
  //     return this.isFullWidth(name) ? name.length <= 50 ? name :  name.slice(0,50)+"..." : name.length <= 96 ? name : name.slice(0,96)+"...";
  //   }

  handleNewsclick() {
    window.scrollTo(0, 0);
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isNewsSelected = true;
    this.isFinanceSelected = false;
    this.isEInvoice = false;
    this.isTermsSelected = false;
  }

  handleEInvoiceClick() {
    window.scrollTo(0, 0);
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isNewsSelected = false;
    this.isFinanceSelected = false;
    this.isEInvoice = true;
    this.isTermsSelected = false;
  }

  handleFinanceClick() {
    window.scrollTo(0, 0);
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isNewsSelected = false;
    this.isFinanceSelected = true;
    this.isEInvoice = false;
    this.isTermsSelected = false;
  }
  handleTermsClick() {
    window.scrollTo(0, 0);
    this.isAllSelected = false;
    this.isVehicleSelected = false;
    this.isNewsSelected = false;
    this.isFinanceSelected = false;
    this.isEInvoice = false;
    this.isTermsSelected = true;
  }

  handleShowmoreClick(event) {
    const notificationCard = event.target.closest(".notification-card");
    const id = notificationCard ? notificationCard.dataset.id : null;
    if (id) {
      const matchingNotification = this.notificationdata
        .flatMap((group) => group.notifications)
        .find((notification) => notification.id === id);
      this.notifDescription = matchingNotification.fullDesc;
      this.notifRegistration = matchingNotification.vehicleNumber;
      this.notifDate = matchingNotification.Date;
      this.notifvehid = matchingNotification.vehicleId;
    }
    this.showMoremodal = true;
  }
  handleShowmoreClickNews(event) {
    const notificationCard = event.target.closest(".notification-card");
    const id = notificationCard ? notificationCard.dataset.id : null;
    console.log("id of click", id);
    if (id) {
      const matchingNotification = this.notificationdata
        .flatMap((group) => group.notifications)
        .find((notification) => notification.id === id);
      console.log("edc2", matchingNotification);
      this.notifDescription = matchingNotification.newsDescription;
      this.notifRegistration = matchingNotification.newsTitle;
      this.notifDate = matchingNotification.Date;
      //this.notifvehid = matchingNotification.vehicleId;
    }
    this.showMoremodalNews = true;
  }
  @track showMoremodalTerms = false;
  handleShowmoreClickTerms(event) {
    const notificationCard = event.target.closest(".notification-card");
    const id = notificationCard ? notificationCard.dataset.id : null;
    if (id) {
      const matchingNotification = this.notificationdata
        .flatMap((group) => group.notifications)
        .find((notification) => notification.id === id);
      this.notifDescription = matchingNotification.newsDescription;
      this.notifRegistration = matchingNotification.newsTitle;
      this.notifDate = matchingNotification.Date;
      // this.notifEndDate = matchingNotification;
      //this.notifvehid = matchingNotification.vehicleId;
    }
    this.showMoremodalTerms = true;
  }
  GotoDetailsPageModal(event) {
    const vehicleDetailElement = event.target.closest(".check-details");

    if (vehicleDetailElement) {
      const vehicleIdMain = vehicleDetailElement.getAttribute("data-id");
      this.vehicleId = vehicleIdMain;
      let url = `/s/vehicle-details?vehicleId=${this.vehicleId}&instance=recall`;
      window.location.href = url;
      // this.vehicledetailspage = true;
      // window.scrollTo(0,0);
      // this.notificationPage = false;
    } else {
      console.error("Vehicle detail element not found");
    }
  }
  gotodtfsa(event) {
    let id = event.target.dataset.id;
    let baseUrl = window.location.href;
    let dtfsaUrl;
    if (baseUrl.indexOf("/s/") !== -1) {
      dtfsaUrl = baseUrl.split("/s/")[0] + "/s/dtfsa-docs?instance=" + id;
    }
    window.location.href = dtfsaUrl;
  }
  gotoeinovice() {
    let baseUrl = window.location.href;
    let einvoiceUrl;
    if (baseUrl.indexOf("/s/") !== -1) {
      einvoiceUrl = baseUrl.split("/s/")[0] + "/s/einvoice";
    }
    window.location.href = einvoiceUrl;
  }

  GotoDetailsPage(event) {
    const vehicleDetailElement = event.target.closest(".vehicledetailmove");

    if (vehicleDetailElement) {
      const vehicleIdMain = vehicleDetailElement.getAttribute("data-id");
      this.vehicleId = vehicleIdMain;
      let url = `/s/vehicle-details?vehicleId=${this.vehicleId}&instance=recall`;
      window.location.href = url;
      // this.vehicledetailspage = true;
      // window.scrollTo(0,0);
      // this.notificationPage = false;
    } else {
      console.error("Vehicle detail element not found");
    }
  }
  GotoDetailsPageExpiry() {
    let url = `/s/vehiclemanagement?filter=vehicle_expiry_notification`;
    window.location.href = url;
  }

  closeNotificationModal() {
    this.showMoremodal = false;
  }
  closeNotificationModalNews() {
    this.showMoremodalNews = false;
  }
  closeNotificationModalTerms() {
    this.showMoremodalTerms = false;
  }

  formatJapaneseDate(isoDate) {
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
  // formatDateMain(isoDate) {
  //     if (isoDate === undefined || isoDate === null) {
  //         return "";
  //     }
  //     const date = new Date(isoDate);
  //     const day = String(date.getDate()).padStart(2, '0'); // Ensures 2-digit day
  //     const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensures 2-digit month
  //     const year = date.getFullYear();
  //     return `${year}-${month}-${day}`;
  // }

  get allSelectedClass() {
    return this.isAllSelected ? "border-right-black" : "";
  }

  get vehicleSelectedClass() {
    return this.isVehicleSelected ? "border-right-black" : "";
  }

  get newsSelectedClass() {
    return this.isNewsSelected ? "border-right-black" : "";
  }

  get EInvoiceSelectedClass() {
    return this.isEInvoice ? "border-right-black" : "";
  }

  get FinanceSelectedClass() {
    return this.isFinanceSelected ? "border-right-black" : "";
  }
  get TermsSelectedClass() {
    return this.isTermsSelected ? "border-right-black" : "";
  }

  get allSelectedLabel() {
    return this.isAllSelected ? "text-right-black" : "";
  }

  get vehicleSelectedLabel() {
    return this.isVehicleSelected ? "text-right-black" : "";
  }

  get newsSelectedLabel() {
    return this.isNewsSelected ? "text-right-black" : "";
  }

  get eInvoiceSelectedLabel() {
    return this.isEInvoice ? "text-right-black" : "";
  }

  get financeSelectedLabel() {
    return this.isFinanceSelected ? "text-right-black" : "";
  }
  get TermsSelectedLabel() {
    return this.isTermsSelected ? "text-right-black" : "";
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
  loadLanguage() {
    Languagei18n()
      .then((data) => {
        this.Languagei18n = data;
        return this.loadI18nextLibrary(); // Return the promise for chaining
      })
      .then(() => {
        return this.loadLabels(); // Load labels after i18next is ready
      })
      .then(() => {})
      .catch((error) => {
        console.error("Error loading language or labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_NotificationCentre",
          errorLog: err,
          methodName: "Load Language",
          ViewName: "Notification centre",
          InterfaceName: "CCP User Interface",
          EventName: "Loading language",
          ModuleName: "Notification centre"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
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
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_NotificationCentre",
          errorLog: err,
          methodName: "Load Labels",
          ViewName: "Notification centre",
          InterfaceName: "CCP User Interface",
          EventName: "Loading labels",
          ModuleName: "Notification centre"
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
  renderedCallback() {
    if (this.isLanguageChangeDone) {
      this.loadLanguage();
    }
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
    this.termsdata.id = targetElement.dataset.id;
    this.termsdata.Description = targetElement.dataset.description;
    this.termsdata.Title = targetElement.dataset.title;
    this.termsdata.Date = targetElement.dataset.date;
    this.termsdata.Type = targetElement.dataset.type;
    const regnoArray = this.termsdata.Type.split(", ");
    this.termsdata.regno = regnoArray.map((reg) => ({ regnumber: reg }));
    this.ShowExpiryModal = true;
  }
  CloseExpiryModal() {
    this.ShowExpiryModal = false;
  }
}

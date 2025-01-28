/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getDataForVehicleRegistration from "@salesforce/apex/CCP2_DashboardController.getPaginatedVehicleData";
import setDataForVehicleRegistration from "@salesforce/apex/CCP2_DashboardController.insertVehicles";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

import labelsVehicle from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

const VEHICLE_INSP_LOGO =
  Vehicle_StaticResource +
  "/CCP2_Resources/Vehicle/vehicle-insp-cert-logo.webp";

export default class Ccp2_VehicleRegistration extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  vehicleInspLogo = VEHICLE_INSP_LOGO;
  vehicleManagementUrl;
  @track showSpinner = true;
  @track isDataSendingPending = false;
  @track showCancelModal = false;
  @track showConfirmModal = false;
  @track showWaitingModal1 = false;
  @track showWaitingModal2 = false;
  @track isPage1 = true;
  @track isPage2 = false;
  @track isPage3 = false;
  @track vehicleRegistrationData = [];
  @track vehicleRegistrationDataPerPage = [];
  // @track wiredVehicleResult;
  @track totalVehicleRead = 0;

  /* pagination */
  @track showLeftDots = false;
  @track visiblePageCount = [1];
  @track showRightDots = false;
  @track totalVehiclePages = 0;
  @track currentPage = 1;
  @track currentOffset = (this.currentPage - 1) * 5;
  @track prevGoing = false;
  @track isPreviousDisabled = false;
  @track isNextDisabled = false;

  @track currentIndex = 0;
  @track interval;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;

  @track CarouselItems = [
    {
      id: 0,
      src: "temp",
      indicatorClass: "progress-line",
      heading: "Step1",
      description: "車検証閲覧アプリをダウンロードする​",
      h2: "未　定",
      h1: "マニュアルイラレ1",
      className: "carousel-item active"
    },
    {
      id: 1,
      src: "temp",
      indicatorClass: "progress-line",
      heading: "Step2",
      description: "車検証閲覧アプリに車両を登録する",
      h2: "未　定",
      h1: "マニュアルイラレ2",
      className: "carousel-item"
    },
    {
      id: 2,
      src: "temp",
      indicatorClass: "progress-line",
      heading: "Step3",
      description: "CCPに戻り、連携ボタンをクリックする",
      h2: "未　定",
      h1: "マニュアルイラレ3",
      className: "carousel-item"
    },
    {
      id: 3,
      src: "temp",
      indicatorClass: "progress-line",
      heading: "Step4",
      description: "読み取り車両情報を確認する",
      h2: "未　定",
      h1: "マニュアルイラレ4",
      className: "carousel-item"
    },
    {
      id: 4,
      src: "temp",
      indicatorClass: "progress-line",
      heading: "Step5",
      description: "車両を登録する",
      h2: "未　定",
      h1: "マニュアルイラレ5",
      className: "carousel-item"
    }
  ];

  get hasVehicleRegData() {
    return this.vehicleRegistrationData?.length > 0;
  }

  get carouselStyle() {
    if (this.currentIndex !== 0) {
      return `transform: translateX(-${this.currentIndex * 1720}px); transition: transform 0.5s ease-out;`;
    }

    return `transform: translateX(-${this.currentIndex * 1720}px); transition: none;`;
  }

  get totalSelectedCount() {
    return (
      this.vehicleRegistrationData.filter((elm) => {
        return elm.isSelected;
      })?.length || 0
    );
  }
  get totalSelectedListData() {
    return this.vehicleRegistrationData.filter((elm) => {
      return elm.isSelected;
    });
  }

  connectedCallback() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      this.vehicleManagementUrl =
        baseUrl.split("/s/")[0] + "/s/vehiclemanagement";
    }

    this.initializeCarousel();
    this.updateCarouselProgress();
  }

  disconnectedCallback() {
    clearInterval(this.interval); // Clear interval when component is destroyed
  }

  renderedCallback() {
    this.updatePageButtons();
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
    }
  }

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
    fetch(`${labelsVehicle}/labelsVehicle.json`)
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
            // eslint-disable-next-line no-undef
            this.labels2 = i18next.store.data[userLocale].translation;
            console.log("Delete Detail User Locale: ", userLocale);
            console.log("Delete Detail User Labels: ", this.labels2);
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
      });
  }

  getLocale() {
    console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === "en_US") {
      console.log("working1");
      return "en";
    }
    return "jp";
  }

  formatJapaneseDate(isoDate, isOnlyYearMonth) {
    if (isoDate === undefined || !isoDate || isoDate === "-") {
      return "-";
    }

    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
  if(isOnlyYearMonth)
    return `${year}年${month}月`;
  return `${year}年${month}月${day}日`;
}

  /* Methods for carousel */
  initializeCarousel() {
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.interval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.CarouselItems?.length;
      this.updateCarouselProgress();
    }, 4000);
  }

  updateCarouselProgress() {
    this.CarouselItems = this.CarouselItems.map((item) => {
      return {
        ...item,
        indicatorClass:
          item.id <= this.currentIndex
            ? "progress-line active"
            : "progress-line",
        className:
          item.id === this.currentIndex
            ? "carousel-item active"
            : "carousel-item"
      };
    });
  }

  handleIndicatorClick(event) {
    const index = event.target.dataset.index;
    if (index !== undefined) {
      this.currentIndex = parseInt(index, 10);
      this.updateCarouselProgress();
      clearInterval(this.interval); // Reset the interval
      this.initializeCarousel(); // Restart the timer
    }
  }

  /* Method for Getting Json From Backend */
  getDataForVehicleRegistrationFun() {
    getDataForVehicleRegistration()
      .then((data) => {
        console.log("getDataForVehicleRegistration", data);
        this.vehicleRegistrationData = data.records.map((elm) => {
          return { ...elm,
            Vehicle_Expiration_Date__c2: this.formatJapaneseDate(elm.Vehicle_Expiration_Date__c), 
            First_Registration_Date__c2: this.formatJapaneseDate(elm.First_Registration_Date__c, true),
            isSelected: true };
        });
        this.currentOffset = (this.currentPage - 1) * 5;
        this.vehicleRegistrationDataPerPage =
          this.vehicleRegistrationData.slice(
            this.currentOffset,
            this.currentOffset + 5
          );
        this.totalVehicleRead = data.totalRecords;
        this.totalVehiclePages = data.totalPages;
        this.updateVisiblePages();

        this.showSpinner = false;
      })
      .catch((error) => {
        console.error(error);
        this.logError(error, "getDataForVehicleRegistrationFun");
      });
  }

  /* Method for Sending Selected Vehicle Json to Backend */
  setDataForVehicleRegistrationFun() {
    setDataForVehicleRegistration({
      jsonInput: JSON.stringify(this.totalSelectedListData)
    })
      .then((data) => {
        this.isDataSendingPending = false;
        console.log("data sent successfully", data, this.totalSelectedListData);
      })
      .catch((error) => {
        console.error("setDataForVehicleRegistration", error);
      });
  }

  logError(error, methodName) {
    ErrorLog({
      lwcName: "ccp2_VehicleRegistration",
      errorLog: JSON.stringify(error),
      methodName: methodName
    })
      .then(() => {
        console.log("Error logged successfully in Salesforce");
      })
      .catch((loggingErr) => {
        console.error("Failed to log error in Salesforce:", loggingErr);
      });
    console.error(error);
  }

  gotoSecondPage() {
    this.getDataForVehicleRegistrationFun();
    this.currentPage = 1;
    this.toggleWaitingModal1();
    // setTimeout(() => {
    //   window.scrollTo(0, 0);
    //   this.isPage1 = false;
    //   this.isPage2 = true;
    //   this.isPage3 = false;
    // }, 2000);
  }

  gotoThirdPage() {
    this.isDataSendingPending = true;
    this.setDataForVehicleRegistrationFun();

    const interval = setInterval(() => {
      if (!this.isDataSendingPending) {
        window.scrollTo(0, 0);
        this.isPage1 = false;
        this.isPage2 = false;
        this.isPage3 = true;

        console.log(
          "totalSelectedListData",
          JSON.stringify(this.totalSelectedListData)
        );

        clearInterval(interval);
      }
    }, 1000);
  }

  gotoVehicleManagement() {
    window.location.href = this.vehicleManagementUrl;
  }

  toggleCancelModal() {
    this.showCancelModal = !this.showCancelModal;
  }
  toggleConfirmModal() {
    this.showConfirmModal = !this.showConfirmModal;
  }
  toggleWaitingModal1() {
    this.showWaitingModal1 = !this.showWaitingModal1;
    setTimeout(() => {
      this.showWaitingModal1 = false;
      this.toggleWaitingModal2();
    }, 1000);
  }
  toggleWaitingModal2() {
    this.showWaitingModal2 = !this.showWaitingModal2;
    const interval = setInterval(() => {
      if (this.showSpinner === false) {
        clearInterval(interval);
        window.scrollTo(0, 0);
        this.showWaitingModal2 = false;
        this.isPage1 = false;
        this.isPage2 = true;
        this.isPage3 = false;
      }
    }, 1000);
  }

  handleNoCancel() {
    this.showCancelModal = false;
  }

  handleYesCancel() {
    this.showCancelModal = false;
    window.location.href = this.vehicleManagementUrl;
  }
  handleNoConfirm() {
    this.showConfirmModal = false;
  }

  handleYesConfirm() {
    this.showConfirmModal = false;
    this.gotoThirdPage();
  }

  handleCheckboxSelction(event) {
    let regNumber = event.target.dataset.name;
    let temVehRegData = this.vehicleRegistrationData.map((elm) => {
      console.log("elm", elm.Registration_Number__c);
      if (elm.Registration_Number__c === regNumber) {
        elm.isSelected = event.target.checked;
      }
      return elm;
    });

    this.vehicleRegistrationData = temVehRegData;
    this.vehicleRegistrationDataPerPage = temVehRegData.slice(
      this.currentOffset,
      this.currentOffset + 5
    );
  }

  /* Methods for Pagination */
  handlePreviousPage(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (this.currentPage > 1) {
        this.prevGoing = true;
        this.currentPage -= 1;
        this.isPreviousDisabled = this.currentPage === 1;
        this.isNextDisabled = this.currentPage === this.totalVehiclePages;
        this.currentOffset = (this.currentPage - 1) * 5;
        this.vehicleRegistrationDataPerPage =
          this.vehicleRegistrationData.slice(
            this.currentOffset,
            this.currentOffset + 5
          );
        this.updatePageButtons();
        this.updateVisiblePages();
      }
    }
  }

  handleNextPage(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      if (this.totalVehiclePages > this.currentPage) {
        this.prevGoing = false;
        this.currentPage += 1;
        console.log(
          "THIS is the current page in handle next",
          this.currentPage
        );
        this.isPreviousDisabled = this.currentPage === 1;
        this.isNextDisabled = this.currentPage === this.totalVehiclePages;
        this.currentOffset = (this.currentPage - 1) * 5;
        this.vehicleRegistrationDataPerPage =
          this.vehicleRegistrationData.slice(
            this.currentOffset,
            this.currentOffset + 5
          );
        this.updatePageButtons();
        this.updateVisiblePages();
      }
    }
  }

  pageCountClick(event) {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      // this.refreshData();
      console.log(event.target.dataset.page);
      this.currentPage = Number(event.target.dataset.page);
      this.currentOffset = (this.currentPage - 1) * 5;
      this.vehicleRegistrationDataPerPage = this.vehicleRegistrationData.slice(
        this.currentOffset,
        this.currentOffset + 5
      );
      this.updatePageButtons();
      this.updateVisiblePages();
    }
  }

  updatePageButtons() {
    const buttons = this.template.querySelectorAll(".mm-page-button");
    buttons.forEach((button) => {
      const pageNum = Number(button.dataset.page);
      if (pageNum === this.currentPage) {
        console.log("Current Page Number clicked: ", pageNum);
        button.classList.add("cuurent-page");
      } else {
        button.classList.remove("cuurent-page");
      }
    });

    this.isPreviousDisabled = this.currentPage === 1;
    this.isNextDisabled = this.currentPage === this.totalVehiclePages;
  }

  updateVisiblePages() {
    let startPage, endPage;

    if (this.currentPage <= 4) {
      startPage = 1;
      endPage = Math.min(4, this.totalVehiclePages);
    } else if (
      this.currentPage > 4 &&
      this.currentPage <= this.totalVehiclePages - 4
    ) {
      startPage = this.currentPage - 1;
      endPage = this.currentPage + 2;
    } else {
      startPage = this.totalVehiclePages - 3;
      endPage = this.totalVehiclePages;
    }

    this.visiblePageCount = [];
    for (let i = startPage; i <= endPage; i++) {
      this.visiblePageCount.push(i);
    }

    this.visiblePageCount.forEach((element) => {
      this.showRightDots = element !== this.totalVehiclePages;
    });
  }
}

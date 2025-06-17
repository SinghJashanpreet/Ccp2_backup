/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track } from "lwc";

import { createRecord, getRecord } from "lightning/uiRecordApi";
import CONTENT_VERSION_OBJECT from "@salesforce/schema/ContentVersion";
import TITLE_FIELD from "@salesforce/schema/ContentVersion.Title";
import VERSION_DATA_FIELD from "@salesforce/schema/ContentVersion.VersionData";
import PATH_ON_CLIENT_FIELD from "@salesforce/schema/ContentVersion.PathOnClient";
import deletecontentversion from "@salesforce/apex/CCP2_vehcileImageUploader.deleteContentDocumentByVersionId";

import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";

import insertRegVehicles from "@salesforce/apex/CCP2_VehicleShakenController.insertRegVehicles";

import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

import getMergedJsonFiles from "@salesforce/apex/CCP2_VehicleShakenController.getMergedJsonFiles";

import labelsVehicle from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const Vehicle_Poster =
  Vehicle_StaticResource +
  "/CCP2_Resources/Vehicle/Register-vehicle-poster.webp";

const VEHICLE_INSP_LOGO =
  Vehicle_StaticResource +
  "/CCP2_Resources/Vehicle/vehicle-insp-cert-logo.webp";

export default class Ccp2_VehicleRegistration extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  vehicleInspLogo = VEHICLE_INSP_LOGO;
  vehiclePoster = Vehicle_Poster;
  vehicleManagementUrl;
  @track showSpinner = false;
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
  @track regStyle = "display: flex; gap: 8px; align-items: center";
  @track chassisStyle = "";

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

  get isTotalSelectedCount() {
    return !(
      this.vehicleRegistrationData.some((elm) => {
        return elm.isSelected;
      }) || false
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
    if (isOnlyYearMonth) return `${year}年${month}月`;
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

  // Convert full-width space to half-width space
  fullWidthToHalfWidth(str) {
    if (str === null) return null;

    return str
      .replace(/[\uFF01-\uFF5E]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
      )
      .replace(/\u3000/g, " ");
  }

  /* Method for Getting Json From Backend */
  getDataForVehicleRegistrationFun(data) {
    // getDataForVehicleRegistration()
    console.log("getDataForVehicleRegistration", data);
    this.vehicleRegistrationData = data.map((elm, index) => {
      return {
        ...elm,
        dummyId: elm?.Chassis_number__c + index,
        Vehicle_Expiration_Date__c: elm?.Vehicle_Expiration_Date__c || "-",
        ellVehicle_Expiration_Date__c:
          this.substringToProperLength(elm?.Vehicle_Expiration_Date__c, 18) ||
          "-",
        First_Registration_Date__c: elm?.First_Registration_Date__c || "-",
        ellFirst_Registration_Date__c:
          this.substringToProperLength(elm?.First_Registration_Date__c, 18) ||
          "-",
        Vehicle_Type__c: elm?.Vehicle_Type__c || "-",
        ellVehicle_Type__c:
          this.substringToProperLength(elm?.Vehicle_Type__c, 18) || "-",
        Vehicle_Name__c: elm?.Vehicle_Name__c || "-",
        ellVehicle_Name__c:
          this.substringToProperLength(elm?.Vehicle_Name__c, 16) || "-",
        Chassis_number__c: elm?.Chassis_number__c || "-",
        ellChassis_number__c:
          this.substringToProperLength(elm?.Chassis_number__c, 16) || "-",
        Registration_Number__c:
          this.fullWidthToHalfWidth(elm?.Registration_Number__c) || "-",
        ellRegistration_Number__c:
          this.fullWidthToHalfWidth(
            this.substringToProperLength(elm?.Registration_Number__c, 19)
          ) || "-",
        // this.fullWidthToHalfWidth(elm?.Registration_Number__c) || "-",
        isSelected:
          elm?.Registration_Number__c !== "空白エラー" &&
          elm?.Chassis_number__c !== "空白エラー",
        isDisabled:
          elm?.Registration_Number__c === "空白エラー" ||
          elm?.Chassis_number__c === "空白エラー",
        styles:
          elm?.Registration_Number__c === "空白エラー" ||
          elm?.Chassis_number__c === "空白エラー"
            ? "opacity: 0.6;"
            : "",
        regStyle:
          elm?.Registration_Number__c === "空白エラー"
            ? "display: flex; gap: 8px; align-items: center; color: #e10202;"
            : this.regStyle,
        chassisStyle:
          elm?.Chassis_number__c === "空白エラー"
            ? "color: #e10202;"
            : this.chassisStyle
      };
    });

    this.currentOffset = (this.currentPage - 1) * 5;
    this.vehicleRegistrationDataPerPage = this.vehicleRegistrationData.slice(
      this.currentOffset,
      this.currentOffset + 5
    );
    this.totalVehicleRead = data?.length || 0;
    this.totalVehiclePages = Math.ceil(data?.length / 5);
    this.updateVisiblePages();

    this.showSpinner = false;
  }

  /* Method for Sending Selected Vehicle Json to Backend */
  // setDataForVehicleRegistrationFun() {
  //   setDataForVehicleRegistration({
  //     jsonInput: JSON.stringify(this.totalSelectedListData)
  //   })
  //     .then((data) => {
  //       this.isDataSendingPending = false;
  //       console.log("data sent successfully", data, this.totalSelectedListData);
  //     })
  //     .catch((error) => {
  //       console.error("setDataForVehicleRegistration", error);
  //     });
  // }

  @track inertionFailed = [];

  get inertionPassedLength() {
    return this.totalSelectedCount - this.inertionFailed?.length;
  }
  get intertionfailedLength() {
    return this.inertionFailed?.length || 0;
  }

  get showLastBackButton() {
    return this.inertionPassedLength === 0;
  }

  // get inertionFailedList(){
  //   rerun inertionFailed.
  // }

  insertRegVehiclesFun() {
    let selectedContentId = [];
    this.totalSelectedListData.map((elm) => {
      if (elm.isSelected === true) {
        selectedContentId.push(elm.ContentVerId);
      }
      return elm;
    });

    console.log("IBefore data call - ", JSON.stringify(selectedContentId));

    insertRegVehicles({
      ContentVersionId: JSON.stringify(selectedContentId)
    })
      .then((data) => {
        console.log(
          "Inserted reg vehicle class : - ",
          data,
          JSON.stringify(selectedContentId)
        );

        this.inertionFailed = Object.keys(data?.Failed);
        this.inertionFailed = this.inertionFailed.map((elm) => {
          return this.substringToProperLength(elm, 45);
        });

        console.log(
          "Inserted reg vehicle class failed list : - ",
          this.inertionFailed
        );

        if (this.inertionFailed?.length === 0) {
          this.isDataSendingPending = false;
          this.showListMainModal = false;
        } else {
          this.isDataSendingPending = false;
          this.showListMainModal = true;
        }
      })
      .catch((e) =>
        console.error(
          "Error in inserting reg vehicle class : - ",
          e,
          JSON.stringify(selectedContentId)
        )
      );
  }

  logError(error, methodName) {
    ErrorLog({
      lwcName: "ccp2_VehicleRegistration",
      errorLog: JSON.stringify(error),
      methodName: methodName,
      ViewName: "Vehicle Registration",
      InterfaceName: "Salesforce",
      EventName: "Data Update",
      ModuleName: "VehicleManagement"
    })
      .then(() => {
        console.log("Error logged successfully in Salesforce");
      })
      .catch((loggingErr) => {
        console.error("Failed to log error in Salesforce:", loggingErr);
      });
    console.error(error);
  }

  gotoFirstPage() {
    if (this.totalUploadedFiles?.length) {
      this.totalUploadedFiles.map((elm) => {
        const evt = {
          target: {
            dataset: {
              id: elm.contentVersId
            }
          }
        };
        this.deleteFileChange(evt);
        return elm;
      });
    }

    this.isPage1 = true;
    this.isPage2 = false;
    this.isPage3 = false;
    this.isPage4 = false;
  }
  gotoSecondPage() {
    this.isPage2 = true;
    this.isPage1 = false;
    this.isPage3 = false;
    this.isPage4 = false;
  }

  gotoThirdPage() {
    this.currentPage = 1;
    this.showSpinner = true;
    // this.toggleWaitingModal2();

    let contentVIdForBackend = this.totalUploadedFiles.map(
      (elm) => elm.contentVersId
    );

    getMergedJsonFiles({
      ContentVersionId: JSON.stringify(contentVIdForBackend)
    })
      .then((data) => {
        // this.vehicleRegistrationData = JSON.parse(data);

        console.log(
          "Getting json from getMergedJsonFiles",
          data,
          JSON.stringify(contentVIdForBackend)
        );
        this.getDataForVehicleRegistrationFun(JSON.parse(data));
      })
      .catch((e) =>
        console.error("Error in Getting json from getMergedJsonFiles", e)
      );

    const interval = setInterval(() => {
      if (this.showSpinner === false) {
        clearInterval(interval);
        window.scrollTo(0, 0);
        this.showWaitingModal2 = false;
        this.isPage1 = false;
        this.isPage2 = false;
        this.isPage3 = true;
        this.isPage4 = false;
      }
    }, 1000);
  }

  @track interval_page3;
  gotoFourthPage() {
    this.isDataSendingPending = true;
    this.insertRegVehiclesFun();
    // this.setDataForVehicleRegistrationFun();

    this.interval_page3 = setInterval(() => {
      if (!this.isDataSendingPending && !this.showListMainModal) {
        window.scrollTo(0, 0);
        this.isPage1 = false;
        this.isPage2 = false;
        this.isPage3 = false;
        this.isPage4 = true;

        console.log(
          "totalSelectedListData",
          JSON.stringify(this.totalSelectedListData)
        );

        clearInterval(this.interval_page3);
      }
    }, 1000);
  }

  gotoVehicleManagement() {
    window.location.href = this.vehicleManagementUrl;
  }

  gotoShankenPortal() {
    // window.location.href = this.labels2.ccp2_vr_vehicle_registration2;
    window.open(this.labels2.ccp2_vr_vehicle_registration2, "_blank");
  }

  toggleCancelModal() {
    if (this.totalUploadedfiles) {
      this.showCancelModal = !this.showCancelModal;
    } else {
      sessionStorage.removeItem("ongoingTransaction");
      this.gotoFirstPage();
    }
  }

  toggleConfirmModal() {
    this.showConfirmModal = !this.showConfirmModal;
  }

  // toggleWaitingModal1() {
  //   this.showWaitingModal1 = !this.showWaitingModal1;
  //   setTimeout(() => {
  //     this.showWaitingModal1 = false;
  //     this.toggleWaitingModal2();
  //   }, 1000);
  // }

  toggleWaitingModal2() {
    this.showWaitingModal2 = !this.showWaitingModal2;
    const interval = setInterval(() => {
      if (this.showSpinner === false) {
        clearInterval(interval);
        window.scrollTo(0, 0);
        this.showWaitingModal2 = false;
        this.isPage1 = false;
        this.isPage2 = false;
        this.isPage3 = true;
        this.isPage4 = false;
      }
    }, 1000);
  }

  handleNoCancel() {
    this.showCancelModal = false;
  }

  handleYesCancel() {
    sessionStorage.removeItem("ongoingTransaction");
    this.showCancelModal = false;
    this.gotoFirstPage();
  }

  handleNoConfirm() {
    this.showConfirmModal = false;
  }

  handleYesConfirm() {
    this.showConfirmModal = false;

    sessionStorage.removeItem("ongoingTransaction");
    this.gotoFourthPage();
  }

  handleCheckboxSelction(event) {
    let dummyId = event.target.dataset.name;
    let temVehRegData = this.vehicleRegistrationData.map((elm) => {
      console.log("elm", elm.dummyId);
      if (elm.dummyId === dummyId) {
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

    if (this.totalVehiclePages === 5) {
      startPage = 1;
      endPage = Math.min(5, this.totalVehiclePages);
    } else {
      if (this.currentPage <= 4) {
        startPage = 1;
        endPage = Math.min(4, this.totalVehiclePages);
      } else if (
        this.currentPage > 4 &&
        this.currentPage <= this.totalVehiclePages - 4
      ) {
        startPage = this.currentPage - 1;
        endPage = this.currentPage + 1;
      } else {
        startPage = this.totalVehiclePages - 3;
        endPage = this.totalVehiclePages;
      }
    }

    this.visiblePageCount = [];
    for (let i = startPage; i <= endPage; i++) {
      this.visiblePageCount.push(i);
    }

    this.visiblePageCount.forEach((element) => {
      this.showRightDots = element !== this.totalVehiclePages;
    });
    this.showLeftDots = this.visiblePageCount[0] === 1 ? false : true;
  }

  /* Methods to handle Json File upload */
  @track totalUploadedFiles = [];
  @track loadedFailedFiles = [];
  @track isFileLoading = false;

  get isUploadSaveButtonDisabled() {
    console.log(
      "this.isFileLoading , this.isTotalUploadedLength",
      this.isFileLoading,
      this.isTotalUploadedLength
    );
    if (this.isFileLoading || !this.isTotalUploadedLength) return true;
    return false;
  }

  get isTotalUploadedLength() {
    if (this.totalUploadedFiles?.length > 0) {
      let ongoingTransactions =
        JSON.parse(sessionStorage.getItem("ongoingTransaction")) || {};

      ongoingTransactions.vehicleRegistrationTxn = true;

      sessionStorage.setItem(
        "ongoingTransaction",
        JSON.stringify(ongoingTransactions)
      );
    } else {
      sessionStorage.removeItem("ongoingTransaction");
    }
    return this.totalUploadedFiles?.length > 0 || false;
  }
  get totalUploadedfiles() {
    return this.totalUploadedFiles?.length || 0;
  }

  handleFilesChange(event) {
    try {
      let files = event.target.files;
      console.log("files", files);
      if (files?.length > 0) {
        this.isFileLoading = true;
        let readFilePromises = [];

        let duplicateCountList = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileName = this.substringToProperLength(file.name, 45);
          console.log("file.type", file.type);
          //If its not a JSON file
          if (file.type !== "application/json") {
            this.dispatchEvent(
              new ShowToastEvent({
                message:
                  `アップロードできるファイルは、JSON（.json)形式のみです。` +
                  fileName,
                variant: "error"
              })
            );
            continue;
          }

          //If its a duplicate name file
          const isDuplicate = this.totalUploadedFiles.some(
            (image) => image.name === fileName
          );
          if (isDuplicate) {
            duplicateCountList.push(fileName);
            continue;
          }

          const fileReaderPromise = new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
              //If everything is ok then update the array
              let fileData = {
                id: fileName + i,
                contentVersId: fileName + i,
                name: fileName,
                fullName: file.name,
                isLoaded: false,
                src: reader.result
              };
              file.src = reader.result;
              this.totalUploadedFiles.unshift(fileData);
              resolve(fileData);
              console.log("file.src", file?.src);
            };

            reader.onerror = () => {
              reject(`Error reading file: ${fileName}`);
            };

            reader.readAsDataURL(file);
          });

          readFilePromises.push(fileReaderPromise);
        }

        Promise.all(readFilePromises)
          .then(async (results) => {
            if (duplicateCountList?.length <= 3) {
              for (let duplicateCount of duplicateCountList) {
                this.dispatchEvent(
                  new ShowToastEvent({
                    message: `${duplicateCount} ファイルは既にアップロードされています。`,
                    variant: "error"
                  })
                );
              }
            } else {
              this.dispatchEvent(
                new ShowToastEvent({
                  message: `${duplicateCountList?.length} ファイルは既にアップロードされています。.`,
                  variant: "error"
                })
              );
            }

            console.log("All files loaded successfully:", results);
            if (results?.length) {
              await this.createContentVersionRecords(results);
            } else {
              this.isFileLoading = false;
            }
          })
          .catch((e) => {
            console.error("handleFileChange promise error ", e);
          });
      }
    } catch (error) {
      console.error("Error in handleFilesChange method:", error);
    } finally {
      event.target.value = null;
    }
  }

  deleteFileChange(event) {
    const id = event.target.dataset.id;

    if (!id) {
      console.error("Not a valid id to delelte!", id);
      return;
    }

    console.log(event.target.dataset.id);

    this.totalUploadedFiles = this.totalUploadedFiles.filter(
      (image) => image.contentVersId !== id
    );

    this.deleteFile(id);
  }

  deleteFile(id) {
    console.log("id", id);
    deletecontentversion({ contentVersionId: id })
      .then((result) => console.log("deletecontentversion", result))
      .catch((e) => console.error("deletecontentversion", e));
  }

  async createContentVersionRecords(files) {
    console.log("in createcontentversion", files);
    try {
      let temFilesData = await Promise.all(
        files.map(async (file) => {
          const fields = {};
          fields[TITLE_FIELD.fieldApiName] = file.fullName;
          const base64String = file.src.includes("base64,")
            ? file.src.split("base64,")[1]
            : file.src;

          if (base64String.length > 0) {
            fields[VERSION_DATA_FIELD.fieldApiName] = base64String;
            fields[PATH_ON_CLIENT_FIELD.fieldApiName] = file.fullName;
            try {
              // file.isCurrentImage = true;
              // this.updateImageProgress(image, 0);
              const record = await createRecord({
                apiName: CONTENT_VERSION_OBJECT.objectApiName,
                fields
              });
              console.log("in createcontentversion 2", record.id);
              file.contentVersId = record.id;

              // this.updateImageProgress(image, 100);
              // image.isCurrentImage = false;

              // this.imagesCreatedId.push(record.id);
              // this.contentVersionIds.push(record.id);
              // this.uploadedImages.push(file);
            } catch (error) {
              console.error("Error1", error);
            }
          }
          return file;
        })
      );

      this.totalUploadedFiles = [
        ...new Map(
          [...this.totalUploadedFiles, ...temFilesData].map((file) => [
            file.contentVersId,
            file
          ])
        ).values()
      ];

      console.log("after addign content ids", [...this.totalUploadedFiles]);
      this.isFileLoading = false;
    } catch (e) {
      console.error("Error", e);
    }
  }
  @track showListMainModal = false;

  openlistMainModal() {
    this.showListMainModal = true;
  }

  handleNoMain() {
    clearInterval(this.interval_page3);
    this.showListMainModal = false;
    this.gotoSecondPage();
  }

  handleYesMain() {
    // this.gotoThirdPage();
    this.showListMainModal = false;
  }

  substringToProperLength(string, limit) {
    let tempString = "";
    let charCount = 0;

    for (let i = 0; i < string.length; i++) {
      const char = string.charAt(i);
      const charCode = string.charCodeAt(i);

      if (
        (charCode >= 0xff01 && charCode <= 0xff5e) || // Full-width characters
        (charCode >= 0xff61 && charCode <= 0xff9f) || // Half-width Katakana
        (charCode >= 0x3040 && charCode <= 0x309f) || // Hiragana
        (charCode >= 0x30a0 && charCode <= 0x30ff) || // Katakana
        (charCode >= 0x4e00 && charCode <= 0x9fff) // Kanji
      ) {
        charCount += 2;
      } else {
        charCount += 1; // Normal English character counts as 1
      }

      // Check if we should stop adding characters
      if (charCount > limit) {
        break; // Stop when exceeding 19 characters for English
      }
      if (
        charCount > limit &&
        ((charCode >= 0x3040 && charCode <= 0x9fff) || // Full-width Japanese
          (charCode >= 0xff01 && charCode <= 0xff5e)) // Full-width characters
      ) {
        break; // Stop when exceeding 12 for Japanese characters
      }

      tempString += char;
    }

    return tempString + (charCount >= limit ? "..." : "");
  }
}

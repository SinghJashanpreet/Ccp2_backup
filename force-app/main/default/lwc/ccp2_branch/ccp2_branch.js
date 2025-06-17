import { LightningElement, wire, track } from "lwc";
import BranchList from "@salesforce/apex/CCP2_userData.BranchList";
import { getRecord } from "lightning/uiRecordApi";
import BranchVehicleCount from "@salesforce/apex/CCP2_branchController.getBranchList";
import checkManagerUser from "@salesforce/apex/CCP_HeaderController.checkManagerUser";

import { NavigationMixin } from "lightning/navigation";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import labelsBranch from "@salesforce/resourceUrl/ccp2_labels";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import userLanguage from "@salesforce/i18n/lang";

import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

const RECORDS_PER_PAGE = 6; // Number of records to display per page

export default class Ccp2Branch extends NavigationMixin(LightningElement) {
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;

  backgroundImagePC = BACKGROUND_IMAGE_PC;

  @track branches;
  @track branchData = [];
  @track selectedBranch = false;
  @track showBranchDetail = false;
  @track adminFlag;
  @track branchloader = true;
  @track emptyAdminFlag;
  @track branch = true;
  @track branchId;
  @track branchMain = true;
  @track addBranch = false;
  @track branchA = false;
  @track currentPage = 1;
  @track totalRecords = 50; // Sample total records
  @track pageNumbers = [];
  @track items = [];
  @track isPageSelected = false;

  @track showLeftDots = false;
  @track showRightDots = false;

  get isBranchesEmpty() {
    return this.branchData.length === 0;
  }

  // connectedCallback() {
  //     this.fetchBranchData();
  // }

  // fetchBranchData() {
  //     BranchVehicleCount()
  //         .then(result => {
  //             this.branchData = result;
  //             this.totalRecords = this.branchData.length;
  //             this.initializePageNumbers();
  //             this.fetchItems(this.currentPage);
  //         })
  //         .catch(error => {
  //             console.error('Error loading branches:', error);
  //         });
  // }

  @track paginatedBranchData = [];
  labels2 = {};

  connectedCallback() {
    console.log("Inbuilt Language", userLanguage);
    this.fetchBranchData();
    // this.initializePageNumbers();
    // this.fetchItems(this.currentPage);
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
    }
    this.updatePageButtons();
  }
  checkManagerUserFunction() {
    checkManagerUser()
      .then((result) => {
        this.adminFlag = result;
      })
      .catch((error) => {
        this.errors = JSON.stringify(error);
        console.error("checkManagerUser errors:" + JSON.stringify(error));
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_branch",
          errorLog: err,
          methodName: "checkManagerUser",
          ViewName: "branch",
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
    fetch(`${labelsBranch}/labelsBranch.json`)
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
            console.log("User Locale: ", userLocale);
            console.log("User Labels: ", this.labels2);
          });
      })
      .catch((error) => {
        ErrorLog({
          lwcName: "ccp2_branch",
          errorLog: error,
          methodName: "loadLabels"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
        console.error("Error loading labels: ", error);
      });
  }

  getLocale() {
    console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === "en_US") {
      console.log("working1");
      return "en";
    } else {
      console.log("working2");
      return "jp";
    }
  }
  fetchBranchData() {
    BranchVehicleCount()
      .then((result) => {
        this.branchData = Object.values(result);
        this.totalRecords = this.branchData.length;
        console.log("Branch Main Data", result);
        this.initializePageNumbers();
        this.fetchItems(this.currentPage);
        setTimeout(() => {
          this.updatePageButtons();
        }, 0);
        this.branchloader = false;
      })
      .catch((error) => {
        ErrorLog({
          lwcName: "ccp2_branch",
          errorLog: error,
          methodName: "fetchBranchData"
        })
          .then(() => console.log("Error logged successfully in Salesforce"))
          .catch((loggingErr) =>
            console.error("Failed to log error in Salesforce:", loggingErr)
          );
        console.error("Error loading branches:", error);
      });
  }

  initializePageNumbers() {
    let pages = Math.ceil(this.totalRecords / RECORDS_PER_PAGE);
    this.pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);
    this.updateVisiblePageNumbers();
    this.updatePageButtons();
  }

  get totalPageCount() {
    return this.pageNumbers.length;
  }

  // BETTER PAGINATION
  // updateVisiblePageNumbers() {
  //     const totalPages = this.pageNumbers.length;
  //     const current = this.currentPage;
  //     this.visiblePageNumbers = [];

  //     if (totalPages <= 5) {
  //         // Less than 5 pages -> show all
  //         this.visiblePageNumbers = [...this.pageNumbers];
  //         this.showLeftDots = false;
  //         this.showRightDots = false;
  //     } else {
  //         if (current <= 3) {
  //             this.visiblePageNumbers = this.pageNumbers.slice(0, 4);
  //             this.showLeftDots = false;
  //             this.showRightDots = true;
  //         } else if (current >= totalPages - 2) {
  //             this.visiblePageNumbers = this.pageNumbers.slice(totalPages - 4, totalPages);
  //             this.showLeftDots = true;
  //             this.showRightDots = false;
  //         } else {
  //             this.visiblePageNumbers = this.pageNumbers.slice(current - 2, current + 1);
  //             this.showLeftDots = true;
  //             this.showRightDots = true;
  //         }
  //     }
  //     this.isPreviousDisabled = this.currentPage === 1;
  //     this.isNextDisabled = this.currentPage === totalPages;
  // }

  updateVisiblePageNumbers() {
    const totalPages = this.pageNumbers.length;
    const current = this.currentPage;
    this.visiblePageNumbers = [];

    if (totalPages <= 5) {
      this.visiblePageNumbers = [...this.pageNumbers];
      this.showLeftDots = false;
      this.showRightDots = false;
    } else if (current <= 4) {
      this.visiblePageNumbers = [1, 2, 3, 4];
      this.showLeftDots = false;
      this.showRightDots = true;
    } else if (current >= totalPages - 3) {
      this.visiblePageNumbers = [
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
      this.showLeftDots = true;
      this.showRightDots = false;
    } else {
      this.visiblePageNumbers = [current - 1, current, current + 1];
      this.showLeftDots = true;
      this.showRightDots = true;
    }

    this.isPreviousDisabled = current === 1;
    this.isNextDisabled = current === totalPages;
  }

  handlePreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.fetchItems(this.currentPage);
      this.updateVisiblePageNumbers();
      this.updatePageButtons();
    }
  }

  handleNextPage() {
    if (this.currentPage < this.pageNumbers.length) {
      this.currentPage += 1;
      this.fetchItems(this.currentPage);
      this.updateVisiblePageNumbers();
      this.updatePageButtons();
    }
  }

  fetchItems(page) {
    console.log("Working Till FetchItems");
    const startIdx = (page - 1) * RECORDS_PER_PAGE;
    const endIdx = startIdx + RECORDS_PER_PAGE;
    this.paginatedBranchData = this.branchData
      .slice(startIdx, endIdx)
      .map((branch) => ({
        ...branch,
        formattedSiebelAccountCode: branch.SiebelAccountCode || "未登録",
        formattedBranchNO: branch.BranchNO
          ? branch.BranchNO.toString().padStart(3, "0")
          : ""
      }));
    this.isPageSelected = this.currentPage === page;
    console.log("Paginated Data", JSON.stringify(this.paginatedBranchData));
  }

  updatePageButtons() {
    const buttons = this.template.querySelectorAll(".page-button");
    buttons.forEach((button) => {
      const pageNum = Number(button.dataset.id);
      if (pageNum === this.currentPage) {
        button.classList.add("selected");
      } else {
        button.classList.remove("selected");
      }
    });

    const totalPages = this.pageNumbers.length;
    this.isPreviousDisabled = this.currentPage === 1;
    this.isNextDisabled = this.currentPage === totalPages;
  }

  handlePageChange(event) {
    this.currentPage = Number(event.target.dataset.id);
    this.fetchItems(this.currentPage);
    this.updateVisiblePageNumbers();
    this.updatePageButtons();
  }

  branchesName;

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
        ErrorLog({
          lwcName: "ccp2_branch",
          errorLog: error,
          methodName: "loadLanguage"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
        console.error("Error loading language or labels: ", error);
      });
  }
  @wire(BranchVehicleCount)
  wiredBranchesNo({ error, data }) {
    if (data) {
      this.branchData = Object.values(data);
      this.adminFlag = this.branchData.some((branch) => branch.adminFlag);
      const hasPriorityBranch = this.branchData.some(
        (branch) => branch.BranchNO === 1
      );

      if (hasPriorityBranch) {
        this.branchData.sort((a, b) => {
          return (b.BranchNO === 1 ? 1 : 0) - (a.BranchNO === 1 ? 1 : 0);
        });
      }
      console.log("Count", data);
      console.log("Total Entries", JSON.stringify(data.length));
      console.log("dedatanew", this.branchData.length);
      console.log(JSON.stringify(this.branchData));
      this.totalRecords = this.branchData.length;
      this.initializePageNumbers();
      this.fetchItems(this.currentPage);
      this.checkManagerUserFunction();
    } else if (error) {
      ErrorLog({
        lwcName: "ccp2_branch",
        errorLog: error,
        methodName: "WiredBranchesNo"
      })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
      console.error("Error loading branches:", error);
    }
  }

  handleBranchClick(event) {
    const branchId = event.target.dataset.idd;
    console.log("branch id", branchId); // Log the branchId to verify it's correct
    this.selectedBranch = this.branches.find(
      (branch) => branch.Id === branchId
    );
    this.selectedBranch = true;
  }

  handleclick2(event) {
    this.branchId = event.currentTarget.dataset.id;
    console.log("branchId", this.branchId);
    this.branchA = true;
    window.scrollTo(0, 0);
    this.branch = false;
  }

  navigateToNewBranch() {
    this.addBranch = true; // Show add branch form
    this.branch = false; // Hide branch list
    console.log("working");
  }

  goToMain() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      let addBranchUrl = baseUrl.split("/s/")[0] + "/s/";
      window.location.href = addBranchUrl;
    }
  }

  goToCreateBranch() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      let addBranchUrl = baseUrl.split("/s/")[0] + "/s/createbranch";
      window.location.href = addBranchUrl;
    }
  }
}

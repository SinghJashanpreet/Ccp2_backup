import { LightningElement, track, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import faqListByCategory from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.getKnowledgeArticlesByCategory";
import faqDetailsByRecordId from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.FaqDetails";
import globalSearchApi from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.globalSearch";
import articleViewInsertApi from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.articleViewInsert";
import updateVoteCountApi from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.voteInsert";
import deleteVoteCountApi from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.deleteVote";
import CCP2_Resources from "@salesforce/resourceUrl/CCP2_Resources";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

const Noresult = CCP2_Resources + "/CCP2_Resources/Vehicle/NoVehicles.png";

export default class Ccp2_Faq extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;

  @track recordId;
  @track knowledgeArticleId;
  @track searchKey = "";
  @track showListEmptyUi = false;
  @track showRemoveSearch = false;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  @track isGuestuser = false;
  @track showRightContentLoader = true;

  @track showListPage = true;
  @track showDetailPage = false;
  @track isIntroSelected = true;
  @track isVehicleSelected = false;
  @track isCustomerInfoSelected = false;
  @track isFinanceSelected = false;
  @track isOtherSelected = false;
  @track isEInvoice = false;
  @track comeFromIntro = false;
  @track suggestionList = [];
  @track showSuggestion = false;

  wiredFaqListResult;
  wiredFaqDetailsResult;
  wiredSuggestion;

  noresult = Noresult;

  enquiryLink = window.location.href.split("/s/")[0] + "/s/inquiry";

  @track faqListData = [];
  @track faqDetailsData = [];

  @track likeIconCss = "grey-font";
  @track dislikeIconCss = "grey-font";

  @wire(faqListByCategory, {
    dataCategoryName: "$currentFaqLabelMappingForWire"
  })
  wiredFaq(result) {
    this.wiredFaqListResult = result; // Store the wired result
    if (result.data) {
      console.log(
        "faqListByCategory params:- ",
        this.currentFaqLabelMappingForWire
      );

      this.faqListData =
        this.currentFaqLabelMappingForWire === "Intro"
          ? result.data.map((elm) => {
              return {
                ...elm,
                showDtfsa: elm.CategoryName === "Category8",
                showCustomerNumber: elm.CategoryName === "Category2",
                showVehicleMan: elm.CategoryName === "Category3",
                showOther: elm.CategoryName === "Category4",
                showEinvoice: elm.CategoryName === "Category7"
              };
            })
          : result.data;
      console.log("faqListByCategory", this.faqListData);
      this.showRightContentLoader = false;
    } else if (result.error) {
      console.error("faqListByCategory", result.error);
    }
  }

  // @wire(faqDetailsByRecordId, {
  //   RecordId: "$recordId"
  // })
  // wiredFaqDetails(result) {
  //   this.wiredFaqDetailsResult = result; // Store the wired result
  //   if (result.data) {
  //     console.log("faqDetailsByRecordId params:- ", this.recordId);
  //     this.faqDetailsData = result?.data?.ArticleDetails[0];
  //     this.faqDetailsData = {
  //       ...this.faqDetailsData,
  //       LikeCount: result?.data?.VoteStats?.LikeCount,
  //       DislikeCount: result?.data?.VoteStats?.DislikeCount,
  //       UserVote: result?.data?.VoteStats?.UserVote
  //     };
  //     console.log("faqDetailsByRecordId", this.faqDetailsData);

  //     switch (result?.data?.VoteStats?.UserVote) {
  //       case "5": {
  //         this.dislikeIconCss = "dislikeIconCss";
  //         this.likeIconCss = "likeIconCss";
  //         break;
  //       }
  //       case "1": {
  //         this.dislikeIconCss = "likeIconCss";
  //         this.likeIconCss = "dislikeIconCss";
  //         break;
  //       }
  //       default: {
  //         this.dislikeIconCss = "grey-font";
  //         this.likeIconCss = "grey-font";
  //       }
  //     }
  //     this.showRightContentLoader = false;
  //   } else if (result.error) {
  //     console.error("faqDetailsByRecordId", result.error);
  //   }
  // }

  @wire(faqDetailsByRecordId, {
    RecordId: "$recordId"
  })
  wiredFaqDetails(result) {
    this.wiredFaqDetailsResult = result; // Store the wired result
    if (result.data) {
      console.log("faqDetailsByRecordId params:- ", this.recordId);
      this.faqDetailsData = result?.data?.ArticleDetails[0];
      this.faqDetailsData = {
        ...this.faqDetailsData,
        LikeCount: result?.data?.VoteStats?.LikeCount,
        DislikeCount: result?.data?.VoteStats?.DislikeCount,
        UserVote: result?.data?.VoteStats?.UserVote
      };
      console.log("faqDetailsByRecordId", this.faqDetailsData);

      switch (result?.data?.VoteStats?.UserVote) {
        case "5": {
          this.dislikeIconCss = "grey-font";
          this.likeIconCss = "likeIconCss";
          break;
        }
        case "1": {
          this.dislikeIconCss = "likeIconCss";
          this.likeIconCss = "grey-font";
          break;
        }
        default: {
          this.dislikeIconCss = "grey-font";
          this.likeIconCss = "grey-font";
        }
      }
      this.showRightContentLoader = false;
    } else if (result.error) {
      console.error("faqDetailsByRecordId", result.error);
    }
  }

  get trimedSearchKey() {
    console.log(
      "length of string before send:-",
      this.searchKey.replace(/^\s+|\s+$/gm, "").length
    );
    return this.searchKey.replace(/^\s+|\s+$/gm, "");
  }

  @wire(globalSearchApi, {
    searchSpec: "$trimedSearchKey"
  })
  globalSearchFun(result) {
    this.wiredSuggestion = result;
    if (result.data) {
      console.log(
        "globalSearchApi params:- ",
        this.trimedSearchKey,
        result.data
      );
      this.suggestionList = result.data;
    } else if (result.error) {
      console.error("globalSearchApi", result.error);
    }
  }

  updateVoteCountApi(str) {
    updateVoteCountApi({ RecordId: this.recordId, Vote: str })
      .then(() => {
        console.log("vote params:-", this.recordId, " ", str);
        console.log("Vote count updated");
        refreshApex(this.wiredFaqDetailsResult);

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
          refreshApex(this.wiredFaqDetailsResult);
        }, 1000);
      })
      .catch((error) => {
        console.log("vote params:-", this.recordId, " ", str);
        console.error("Error updating vote count", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_faq",
          errorLog: err,
          methodName: "update Count Api"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  deleteVoteCountApi() {
    deleteVoteCountApi({ recordId: this.recordId })
      .then((result) => {
        console.log("vote delete params:-", this.recordId);
        console.log("Vote delete count updated", result);
        refreshApex(this.wiredFaqDetailsResult);

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
          refreshApex(this.wiredFaqDetailsResult);
        }, 1000);
      })
      .catch((error) => {
        console.log("vote delete params:-", this.recordId);
        console.error("Error delete updating vote count", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_faq",
          errorLog: err,
          methodName: "deleteVoteCountApi"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  updateVoteCountApi(str) {
    updateVoteCountApi({ RecordId: this.recordId, Vote: str })
      .then(() => {
        console.log("vote params:-", this.recordId, " ", str);
        console.log("Vote count updated");
        refreshApex(this.wiredFaqDetailsResult);

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
          refreshApex(this.wiredFaqDetailsResult);
        }, 1000);
      })
      .catch((error) => {
        console.log("vote params:-", this.recordId, " ", str);
        console.error("Error updating vote count", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_faq",
          errorLog: err,
          methodName: "update Count Api"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  deleteVoteCountApi() {
    deleteVoteCountApi({ recordId: this.recordId })
      .then((result) => {
        console.log("vote delete params:-", this.recordId);
        console.log("Vote delete count updated", result);
        refreshApex(this.wiredFaqDetailsResult);

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => {
          refreshApex(this.wiredFaqDetailsResult);
        }, 1000);
      })
      .catch((error) => {
        console.log("vote delete params:-", this.recordId);
        console.error("Error delete updating vote count", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_faq",
          errorLog: err,
          methodName: "deleteCountApi"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  articleViewInsert() {
    articleViewInsertApi({ RecordId: this.knowledgeArticleId })
      .then((result) => {
        console.log(
          "articleViewInsert updated with arti id:",
          this.knowledgeArticleId,
          result
        );
      })
      .catch((e) => {
        console.error("Error articleViewInsert", e);
      });
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
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_faq",
          errorLog: err,
          methodName: "Load Language"
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

  labels2 = {};
  loadLabels() {
    fetch(`${labelsUser}/labelsHeaderFooter.json`)
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
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_faq",
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

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
    }
    if (!this.handleOutsideClickBound6) {
      this.handleOutsideClickBound6 = this.handleOutsideClickSearch.bind(this);
      document.addEventListener("click", this.handleOutsideClickBound6);
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClickSearch);
  }

  get showSuggestionList() {
    return this.suggestionList.length > 0 && this.showSuggestion;
  }

  get currentFaqLabel() {
    if (this.isIntroSelected) {
      return "はじめに";
    } else if (this.isVehicleSelected) {
      return "車両管理";
    } else if (this.isCustomerInfoSelected) {
      return "お客様情報";
    } else if (this.isEInvoice) {
      return "部整月次請求書（電子版）";
    } else if (this.isFinanceSelected) {
      return "リース・ローン";
    } else if (this.isOtherSelected) {
      return "その他";
    }
    return "はじめに";
  }

  get currentFaqLabelMappingForWire() {
    if (this.isIntroSelected) {
      return "Intro";
    } else if (this.isVehicleSelected) {
      return "Category3";
    } else if (this.isCustomerInfoSelected) {
      return "Category2";
    } else if (this.isEInvoice) {
      return "Category7";
    } else if (this.isFinanceSelected) {
      return "Category8";
    } else if (this.isOtherSelected) {
      return "Category4";
    }
    return "Intro";
  }

  get introSelectedClass() {
    return this.isIntroSelected ? "border-right-black" : "";
  }

  get vehicleSelectedClass() {
    return this.isVehicleSelected ? "border-right-black" : "";
  }

  get customerInfoSelectedClass() {
    return this.isCustomerInfoSelected ? "border-right-black" : "";
  }

  get EInvoiceSelectedClass() {
    return this.isEInvoice ? "border-right-black" : "";
  }

  get FinanceSelectedClass() {
    return this.isFinanceSelected ? "border-right-black" : "";
  }
  get OtherSelectedClass() {
    return this.isOtherSelected ? "border-right-black" : "";
  }

  get introSelectedLabel() {
    return this.isIntroSelected ? "text-right-black" : "";
  }

  get vehicleSelectedLabel() {
    return this.isVehicleSelected ? "text-right-black" : "";
  }

  get customerInfoSelectedLabel() {
    return this.isCustomerInfoSelected ? "text-right-black" : "";
  }

  get eInvoiceSelectedLabel() {
    return this.isEInvoice ? "text-right-black" : "";
  }

  get financeSelectedLabel() {
    return this.isFinanceSelected ? "text-right-black" : "";
  }
  get otherSelectedLabel() {
    return this.isOtherSelected ? "text-right-black" : "";
  }

  handleIntroClick() {
    if (this.showDetailPage) {
      window.scrollTo(0, 0);
      this.showDetailPage = false;
      this.showListPage = true;
    }
    if (!this.isIntroSelected) {
      refreshApex(this.wiredFaqListResult);
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        refreshApex(this.wiredFaqListResult);
      }, 1000);
      window.scrollTo(0, 0);
      this.showRightContentLoader = true;
      this.isIntroSelected = true;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    }
  }

  handleVehicleClick() {
    if (this.showDetailPage) {
      window.scrollTo(0, 0);
      this.showDetailPage = false;
      this.showListPage = true;
    }
    if (!this.isVehicleSelected) {
      window.scrollTo(0, 0);
      this.showRightContentLoader = true;
      this.isIntroSelected = false;
      this.isVehicleSelected = true;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    }
  }
  handleCustomerInfoClick() {
    if (this.showDetailPage) {
      window.scrollTo(0, 0);
      this.showDetailPage = false;
      this.showListPage = true;
    }
    if (!this.isCustomerInfoSelected) {
      window.scrollTo(0, 0);
      this.showRightContentLoader = true;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = true;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    }
  }

  handleEInvoiceClick() {
    if (this.showDetailPage) {
      window.scrollTo(0, 0);
      this.showDetailPage = false;
      this.showListPage = true;
    }
    if (!this.isEInvoice) {
      window.scrollTo(0, 0);
      this.showRightContentLoader = true;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isEInvoice = true;
      this.isOtherSelected = false;
    }
  }

  handleFinanceClick() {
    if (this.showDetailPage) {
      window.scrollTo(0, 0);
      this.showDetailPage = false;
      this.showListPage = true;
    }
    if (!this.isFinanceSelected) {
      window.scrollTo(0, 0);
      this.showRightContentLoader = true;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = true;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    }
  }
  handleOtherClick() {
    if (this.showDetailPage) {
      window.scrollTo(0, 0);
      this.showDetailPage = false;
      this.showListPage = true;
    }
    if (!this.isOtherSelected) {
      window.scrollTo(0, 0);
      this.showRightContentLoader = true;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = true;
    }
  }

  handleShowDetailPage(event) {
    if (event.target.dataset.id !== this.recordId) {
      this.showRightContentLoader = true;
    }
    this.recordId = event.target.dataset.id;
    this.knowledgeArticleId = event.target.dataset.articleId;
    console.log("event.target.dataset.id", event.target.dataset.id);
    window.scrollTo(0, 0);
    if (this.isIntroSelected === true) {
      this.comeFromIntro = true;
    } else {
      this.comeFromIntro = false;
    }
    let categoryName = event.target.dataset.category;
    if (categoryName === "Category2") {
      this.isCustomerInfoSelected = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    } else if (categoryName === "Category3") {
      this.isVehicleSelected = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    } else if (categoryName === "Category7") {
      this.isEInvoice = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isOtherSelected = false;
    } else if (categoryName === "Category4") {
      this.isOtherSelected = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
    } else {
      this.isFinanceSelected = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    }

    this.showListPage = false;
    this.showDetailPage = true;
    this.articleViewInsert();
  }

  handleshowListPage() {
    window.scrollTo(0, 0);
    if (!this.comeFromIntro) {
      this.showDetailPage = false;
      this.showListPage = true;
    } else {
      this.handleIntroClick();
    }
    this.removeSearchInputKey();
  }

  // handleLike() {
  //   if (this.likeIconCss === "likeIconCss") {
  //     this.likeIconCss = "grey-font";
  //     this.dislikeIconCss = "grey-font";
  //     this.deleteVoteCountApi();
  //   } else if (this.likeIconCss === "dislikeIconCss") {
  //     console.log("Do nothing!!!");
  //   } else {
  //     this.likeIconCss = "likeIconCss";
  //     this.dislikeIconCss = "dislikeIconCss";
  //     this.updateVoteCountApi("5");
  //   }
  // }

  // handleDisLike() {
  //   if (this.dislikeIconCss === "likeIconCss") {
  //     this.deleteVoteCountApi();
  //     this.likeIconCss = "grey-font";
  //     this.dislikeIconCss = "grey-font";
  //   } else if (this.dislikeIconCss === "dislikeIconCss") {
  //     console.log("Do nothing!!!");
  //   } else {
  //     this.likeIconCss = "dislikeIconCss";
  //     this.dislikeIconCss = "likeIconCss";
  //     this.updateVoteCountApi("1");
  //   }
  // }

  handleLike() {
    if (this.likeIconCss === "likeIconCss") {
      this.likeIconCss = "grey-font";
      this.dislikeIconCss = "grey-font";
      return this.deleteVoteCountApi(); // Return the Promise
    } else {
      this.likeIconCss = "likeIconCss";
      this.dislikeIconCss = "grey-font";
      return this.updateVoteCountApi("5");
    }
  }

  handleDisLike() {
    if (this.dislikeIconCss === "likeIconCss") {
      this.likeIconCss = "grey-font";
      this.dislikeIconCss = "grey-font";
      return this.deleteVoteCountApi();
    } else {
      this.likeIconCss = "grey-font";
      this.dislikeIconCss = "likeIconCss";
      return this.updateVoteCountApi("1");
    }
  }

  handleLikeClick() {
    if (this.dislikeIconCss === "likeIconCss") {
      this.handleDisLike();
      setTimeout(() => {
        this.handleLike();
      }, 200);
    } else {
      this.handleLike();
    }
  }

  handleDisLikeClick() {
    if (this.likeIconCss === "likeIconCss") {
      this.handleLike();
      setTimeout(() => {
        this.handleDisLike();
      }, 200);
    } else {
      this.handleDisLike();
    }
  }

  handleSearchInput(event) {
    if (event.target.value === " ")
      event.target.value = event.target.value.trim();

    this.searchKey = event.target.value;
    console.log("search key", this.searchKey);
    if (event.target.value.length === 0) {
      this.showSuggestion = false;
      this.showListEmptyUi = false;
      this.showRemoveSearch = false;
    } else {
      this.showSuggestion = true;
      this.showRemoveSearch = true;
    }
  }

  removeSearchInputKey() {
    this.searchKey = "";
    this.showListEmptyUi = false;
    this.showRemoveSearch = false;
  }

  handleSuggestionClick(event) {
    console.log("key clicked is:- ", event.target.dataset.id);
    const categoryName = event.target.dataset.category;
    this.showSuggestion = false;
    this.searchKey = "";
    this.isIntroSelected = false;

    if (categoryName === "Category2") {
      this.isCustomerInfoSelected = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isVehicleSelected = true;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    } else if (categoryName === "Category3") {
      this.isVehicleSelected = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    } else if (categoryName === "Category7") {
      this.isEInvoice = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isOtherSelected = false;
    } else if (categoryName === "Category4") {
      this.isOtherSelected = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isFinanceSelected = false;
      this.isEInvoice = false;
    } else {
      this.isFinanceSelected = true;

      this.showRightContentLoader = false;
      this.isIntroSelected = false;
      this.isVehicleSelected = false;
      this.isCustomerInfoSelected = false;
      this.isEInvoice = false;
      this.isOtherSelected = false;
    }

    this.handleShowDetailPage(event);
  }

  handleOutsideClickSearch(event) {
    const isClickInside = this.template
      .querySelector(".suggestion-list-container")
      .contains(event.target);
    if (!isClickInside) {
      console.log("handle outside");
      this.showSuggestion = false;
    }
  }

  handleKeyDownSearch(event) {
    if (event.key === "Enter") {
      this.showSuggestion = true;

      console.log("this.suggestionList", this.suggestionList);
      console.log("this.searchKey[0]", this.searchKey);

      // eslint-disable-next-line @lwc/lwc/no-async-operation
      setTimeout(() => {
        if (
          this.suggestionList?.length === 0 &&
          this.trimedSearchKey.length !== 0
        ) {
          this.showListEmptyUi = true;
        } else {
          this.showListEmptyUi = false;
        }
      }, 500);
    }
  }

  handleClickSearch(event) {
    event.stopPropagation();
    console.log("show list", this.suggestionList.length);
    this.showSuggestion = true;
    console.log("show list 2", this.showSuggestion);
  }
}

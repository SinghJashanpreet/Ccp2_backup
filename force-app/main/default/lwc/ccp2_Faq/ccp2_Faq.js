import { LightningElement, track, wire } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import faqListByCategory from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.getKnowledgeArticlesByCategory";
import faqDetailsByRecordId from "@salesforce/apex/CCP2_vehicle_Maintenance_controller.FaqDetails";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";

export default class Ccp2_Faq extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;

  @track recordId;
  @track showRightContentLoader = true;

  @track showListPage = true;
  @track showDetailPage = false;
  @track isIntroSelected = true;
  @track isVehicleSelected = false;
  @track isCustomerInfoSelected = false;
  @track isFinanceSelected = false;
  @track isOtherSelected = false;
  @track isEInvoice = false;

  wiredFaqListResult;
  wiredFaqDetailsResult;
  @track faqListData = [];
  @track faqDetailsData = [];

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
      console.log("faqListByCategory", result.data);
      this.faqListData = result.data;
      this.showRightContentLoader = false;
    } else if (result.error) {
      console.error("faqListByCategory", result.error);
    }
  }

  @wire(faqDetailsByRecordId, {
    RecordId: "$recordId"
  })
  wiredFaqDetails(result) {
    this.wiredFaqDetailsResult = result; // Store the wired result
    if (result.data) {
      console.log(
        "faqDetailsByRecordId params:- ",
        this.recordId
      );
      console.log("faqDetailsByRecordId", result.data);
      this.faqDetailsData = result?.data[0];
      this.showRightContentLoader = false;
    } else if (result.error) {
      console.error("faqDetailsByRecordId", result.error);
    }
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
    this.showRightContentLoader = true;
    this.recordId = event.target.dataset.id;
    console.log("event.target.dataset.id", event.target.dataset.id);
    window.scrollTo(0, 0);
    this.showListPage = false;
    this.showDetailPage = true;
  }

  handleshowListPage(event){
    window.scrollTo(0, 0);
    this.showDetailPage = false;
    this.showListPage = true;
  }
}

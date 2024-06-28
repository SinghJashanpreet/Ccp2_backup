/*
 * @Author: Huanghao Tu
 * @Date: 2022-10-18 15:03:54
 * @LastEditTime: 2022-12-23 14:42:10
 * @Description: 会员追加
 */
import { LightningElement, track, wire } from "lwc";
import AddUser_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_AddUser";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_Vehicle";
import Branch_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_Vehicle";
import getContactData from "@salesforce/apex/CCP_AddUserCtrl.getContactData";
import checkUserEmail from "@salesforce/apex/CCP_AddUserCtrl.checkUserEmail";
import checkManageUser from "@salesforce/apex/CCP_AddUserCtrl.checkManageUser";
import createContact from "@salesforce/apex/CCP_AddUserCtrl.createContact";
import createBranch from "@salesforce/apex/ccp2_branchAddMember.addBranch";
import createUser from "@salesforce/apex/CCP_AddUserCtrl.createUser";
import getUserPermissionSet from "@salesforce/apex/CCP_AddUserCtrl.getUserPermissionSet";
import userTypeJudgment from "@salesforce/apex/CCP_AddUserCtrl.userTypeJudgment";
import checkUserNumber from "@salesforce/apex/CCP_AddUserCtrl.checkUserNumber";
import getBaseInfoByUserId from "@salesforce/apex/CCP_HomeCtrl.getBaseInfoByUserId";

import getbranchdetails from "@salesforce/apex/CCP2_userData.UnAssociatedBranch";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import Id from "@salesforce/user/Id";

const arrowicon =
  Branch_StaticResource + "/CCP_StaticResource_Vehicle/images/arrow_under.png";
const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource +
  "/CCP_StaticResource_Vehicle/images/Main_Background.png";
//const BACKGROUND_IMAGE_MOBILE = AddUser_StaticResource + '/CCP_StaticResource_AddUser/images/register_img_hero.png';
const BACKGROUND_IMAGE_MOBILE =
  Vehicle_StaticResource +
  "/CCP_StaticResource_Vehicle/images/user_management.png";
const TRACK_ICON =
  AddUser_StaticResource + "/CCP_StaticResource_AddUser/images/icon_track.svg";
const CHECK_ICON =
  AddUser_StaticResource + "/CCP_StaticResource_AddUser/images/icon_check.svg";

export default class Ccp_AddUser extends LightningElement {
  errors;
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  backgroundImageMobile = BACKGROUND_IMAGE_MOBILE;
  imgdrop = arrowicon;
  trackIcon = TRACK_ICON;
  checkIcon = CHECK_ICON;
  showInputSection = true;
  showConfirmationSection = false;
  showCompletionSection = false;
  isManageUser = false;
  termServiceChecked = false;
  termDataChecked = false;
  vrChecked = false;
  rbChecked = false;

  //bsChecked = false;
  //eiChecked = false;
  fsChecked = false;
  ombChecked = false;
  vmChecked = false;
  cmChecked = false;

  @track deletedBranchIds = [];
  @track selectedLabels = [];

  @track branchoptions = [];
  @track branch = [];
  @track branchDataForClass = [];
  @track selectbranchId = "";
  @track showlist = false;
  searchTerm = "";

  isLoading = false;
  contactData = [];
  allContactEmail = [];
  allUserEmail = [];
  lastNameError = false;
  firstNameError = false;
  lastNameKanaError = false;
  firstNameKanaError = false;
  emailError = false;
  phoneError = false;
  vehicleShow = false;
  requestShow = false;

  financialshow = false;
  costshow = false;
  maintenanceshow = false;
  vehiclemanagementshow = false;

  isFDPShow = true;
  lastNameErrorText;
  firstNameErrorText;
  lastNameKanaErrorText;
  firstNameKanaErrorText;
  emailErrorText;
  phoneErrorText;
  isShowModal = false;
  baseChecked = true;
  baseService = true;
  eInvioceService = false;
  directBookService = false;
  contactInputData = {
    lastName: null,
    firstName: null,
    lastNameKana: null,
    firstNameKana: null,
    title: null,
    department: null,
    email: null,
    phone: null,
    mobilePhone: null,
    employeeCode: null
  };

  connectedCallback() {
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(
            ${this.imgdrop}
            )`
    );
    this.userTypeJudgment();
    this.checkManageUser();
    checkUserNumber().then((res) => {
      if (!res) {
        this.isShowModal = true;
        console.log("usernumber", res);
        return;
      }
      this.getContactData();
      this.setUserPermissionSet();
    });

    getBaseInfoByUserId({ uId: Id }).then((res) => {
      if (res.isFDP != undefined) {
        this.isFDP = res.isFDP;
      }
      if (this.isFDP) {
        this.isFDPShow = false;
      }
    });
  }

  renderedCallback() {
    this.nextButtonCSS();
  }

  setUserPermissionSet() {
    getUserPermissionSet({ userId: Id }).then((res) => {
      if (res.Direct_Booking) {
        this.vehicleShow = true;
      }
      if (res.E_invoice) {
        this.requestShow = true;
      }
      if (res.FUSO_CCP_External_Financial_service) {
        this.financialshow = true;
      }
      if (res.FUSO_CCP_External_Cost_management) {
        this.costshow = true;
      }
      if (res.FUSO_CCP_External_Online_maintenance_booking) {
        this.maintenanceshow = true;
      }
      if (res.FUSO_CCP_External_Vehicle_management) {
        this.vehiclemanagementshow = true;
      }
    });
  }

  // get default Account Data
  getContactData() {
    getContactData()
      .then((data) => {
        let contactData = [];
        if (data != null) {
          let accountData = data.Account;
          contactData = {
            id: data.Id,
            accountId: accountData.Id,
            accountName: accountData.Name,
            accountCode: accountData.siebelAccountCode__c
          };
          this.contactData = contactData;
        }
      })
      .catch((error) => {
        console.log("errors:" + JSON.stringify(error));
      });
  }

  checkManageUser() {
    checkManageUser()
      .then((data) => {
        // if the user is not ManageUser, navigate to the home page
        if (!data) {
          this.navigateToHome();
        } else {
          // display all add User Page
          this.isManageUser = true;
        }
      })
      .catch((error) => {
        console.log("errors:" + JSON.stringify(error));
      });
  }
  // handleInputChange(event) {
  //     console.log("sample",this.contactData );
  //     // const field = event.target.dataset.id;
  //     // this.contactInputData = {...this.contactInputData, [field]: event.target.value };
  //     this.contactData = event.target.value;
  //     console.log("sample",this.contactData );
  // }
  handlebranChange() {
    //console.log('employee', this.contactInputData);

    this.showlist = !this.showlist;
  }

  @wire(getbranchdetails) wiredBranches({ data, error }) {
    if (data) {
      // console.log("")
      // console.log("Bdata",data);
      console.log("branches", data);
      this.branchoptions = data.map((vehicle) => {
        return { label: vehicle.Name, value: vehicle.Id };
      });
      console.log("branchdata", JSON.stringify(this.branchoptions));
    } else if (error) {
      console.error(error);
    }
  }
  handleOutsideClick = (event) => {
    if (!this.template.querySelector(".dataDrop").contains(event.target)) {
      this.showList = false;
    }
  };

  // Custom Validation, Input Section -> Confirmation Section
  nextClick() {
    console.log("this is brachn", JSON.stringify(this.branchDataForClass));
    // console.log('ids acc',)
    // console.log('ids con',)
    const MAX_CHARS = 80;
    const emailFormat = /[\w.\-]+@[\w\-]+\.[\w.\-]+/;
    const onlyNumber = /^[0-9]*$/;
    const fullAngleNumbers = /[０-９]+/;
    const fullAngleLetters = /[ａ-ｚＡ-Ｚ]+/;
    let lastName = this.template.querySelector('[name="lastName"]');
    let firstName = this.template.querySelector('[name="firstName"]');
    let lastNameKana = this.template.querySelector('[name="lastNameKana"]');
    let firstNameKana = this.template.querySelector('[name="firstNameKana"]');
    let email = this.template.querySelector('[name="email"]');
    let phone = this.template.querySelector('[name="phone"]');
    let mobilePhone = this.template.querySelector('[name="mobilePhone"]');
    let department = this.template.querySelector('[name="department"]');
    let title = this.template.querySelector('[name="title"]');
    let employeeCode = this.template.querySelector('[name="employeeCode"]');
    if (!this.isFDP) {
      this.baseService = this.template.querySelector(
        '[name="baseService"]'
      ).checked;
    }
    if (this.template.querySelector('[name="vehiclereservation"]') != null) {
      this.vehiclereservation = this.template.querySelector(
        '[name="vehiclereservation"]'
      ).checked;
    }
    if (this.template.querySelector('[name="requestbook"]') != null) {
      this.requestbook = this.template.querySelector(
        '[name="requestbook"]'
      ).checked;
    }
    if (this.template.querySelector('[name="financialservice"]') != null) {
      this.financialservice = this.template.querySelector(
        '[name="financialservice"]'
      ).checked;
    }
    if (
      this.template.querySelector('[name="onlinemaintenancebooking"]') != null
    ) {
      this.onlinemaintenancebooking = this.template.querySelector(
        '[name="onlinemaintenancebooking"]'
      ).checked;
    }
    if (this.template.querySelector('[name="vehiclemanagement"]') != null) {
      this.vehiclemanagement = this.template.querySelector(
        '[name="vehiclemanagement"]'
      ).checked;
    }
    if (this.template.querySelector('[name="costmanagement"]') != null) {
      this.costmanagement = this.template.querySelector(
        '[name="costmanagement"]'
      ).checked;
    }
    if (this.branch.length === 0) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error",
          message:
            "Branch data cannot be empty. Please add at least one Branch.",
          variant: "error"
        })
      );
      return;
    }
    // the lastName verify not null and up to 80 characters
    if (!lastName.value) {
      lastName.className = "form-input _error slds-input";
      this.lastNameError = true;
      this.lastNameErrorText = "姓を入力してください";
    } else if (lastName.value.length > MAX_CHARS) {
      lastName.className = "form-input _error slds-input";
      this.lastNameError = true;
      this.lastNameErrorText = "80文字以内で入力してください";
    } else {
      lastName.className = "form-input slds-input";
      this.lastNameError = false;
      this.lastNameErrorText = "";
    }
    // the firstName verify not null and up to 80 characters
    if (!firstName.value) {
      firstName.className = "form-input _error slds-input";
      this.firstNameError = true;
      this.firstNameErrorText = "名を入力してください";
    } else if (firstName.value.length > MAX_CHARS) {
      firstName.className = "form-input _error slds-input";
      this.firstNameError = true;
      this.firstNameErrorText = "80文字以内で入力してください";
    } else {
      firstName.className = "form-input slds-input";
      this.firstNameError = false;
      this.firstNameErrorText = "";
    }
    // the lastNameKana verify not null
    if (!lastNameKana.value) {
      lastNameKana.className = "form-input _error slds-input";
      this.lastNameKanaError = true;
      this.lastNameKanaErrorText = "姓（フリガナ）を入力してください";
    } else {
      lastNameKana.className = "form-input slds-input";
      this.lastNameKanaError = false;
      this.lastNameKanaErrorText = "";
    }
    // the firstNameKana verify not null
    if (!firstNameKana.value) {
      firstNameKana.className = "form-input _error slds-input";
      this.firstNameKanaError = true;
      this.firstNameKanaErrorText = "名（フリガナ）を入力してください";
    } else {
      firstNameKana.className = "form-input slds-input";
      this.firstNameKanaError = false;
      this.firstNameKanaErrorText = "";
    }
    phone.className = "form-input  slds-form-element__control slds-input";
    mobilePhone.className = "form-input  slds-form-element__control slds-input";
    // verify the phone and mobile cannot be empty at the same time
    if (!phone.value && !mobilePhone.value) {
      phone.className =
        "form-input _error slds-form-element__control slds-input";
      mobilePhone.className =
        "form-input _error slds-form-element__control slds-input";
      this.phoneError = true;
      //this.phoneErrorText = '電話番号と携帯番号のいずれかを必ず入力してください';
      this.phoneErrorText = "電話番号か携帯番号かいずれ入力してください。";
    } else if (
      (phone.value.length > 0 && !onlyNumber.test(phone.value)) ||
      (mobilePhone.value.length > 0 && !onlyNumber.test(mobilePhone.value))
    ) {
      if (phone.value.length > 0 && !onlyNumber.test(phone.value)) {
        phone.className =
          "form-input _error slds-form-element__control slds-input";
      }
      if (mobilePhone.value.length > 0 && !onlyNumber.test(mobilePhone.value)) {
        mobilePhone.className =
          "form-input _error slds-form-element__control slds-input";
      }
      this.phoneError = true;
      this.phoneErrorText =
        "電話番号・携帯番号は数字（ハイフンなし）でご入力ください";
    } else {
      phone.className = "form-input slds-form-element__control slds-input";
      mobilePhone.className =
        "form-input slds-form-element__control slds-input";
      this.phoneError = false;
      this.phoneErrorText = "";
    }
    // the email verify not null, have correct email format and the same email does not exist for contacts under the same account
    if (!email.value) {
      email.className =
        "form-input _error slds-form-element__control slds-input";
      this.emailError = true;
      this.emailErrorText = "メールアドレスを入力してください";
    } else if (
      !emailFormat.test(email.value) ||
      fullAngleNumbers.test(email.value) ||
      fullAngleLetters.test(email.value)
    ) {
      email.className =
        "form-input _error slds-form-element__control slds-input";
      this.emailError = true;
      this.emailErrorText = "メールアドレスの形式は不正です";
    } else {
      checkUserEmail({ email: email.value })
        .then((data) => {
          if (data != null && data != "" && data != undefined) {
            if (data[0] == "false" && data[1] == "false") {
              email.className =
                "form-input slds-form-element__control slds-input";
              this.emailError = false;
              this.emailErrorText = "";
            } else if (data[0] == "true") {
              email.className =
                "form-input _error slds-form-element__control slds-input";
              this.emailError = true;
              this.emailErrorText =
                "入力されたメールアドレスはすでに使われています";
            } else if (data[1] == "true") {
              email.className =
                "form-input _error slds-form-element__control slds-input";
              this.emailError = true;
              this.emailErrorText =
                "入力されたメールアドレスでは、会員登録ができません。担当営業にご連絡ください";
            }
          }
          // if the page not error can turn to next section
          if (
            !this.lastNameError &&
            !this.firstNameError &&
            !this.lastNameKanaError &&
            !this.firstNameKanaError &&
            !this.emailError &&
            !this.phoneError
          ) {
            this.showInputSection = false;
            this.showConfirmationSection = true;
            window.scrollTo(0, 0);
            this.showCompletionSection = false;
          } else {
            window.scrollTo(0, 0);
          }
        })
        .catch((error) => {
          console.log("checkUserEmail Errors:" + JSON.stringify(error));
        });
    }
    // get input data
    this.contactInputData = {
      lastName: lastName.value,
      firstName: firstName.value,
      lastNameKana: lastNameKana.value,
      firstNameKana: firstNameKana.value,
      title: title.value,
      department: department.value,
      email: email.value,
      phone: phone.value,
      mobilePhone: mobilePhone.value,
      employeeCode: employeeCode.value
    };
  }

  // get the checked information
  handleCheckboxChange(event) {
    let checkName = event.target.name;
    let isChecked = event.target.checked;
    if (checkName == "termService") {
      this.termServiceChecked = isChecked;
    } else if (checkName == "termData") {
      this.termDataChecked = isChecked;
    }
    // get input data
    this.getInputData();
  }

  //
  handleCheckboxChange1(event) {
    let checkName = event.target.name;
    let isChecked = event.target.checked;
    if (checkName == "vehiclereservation") {
      this.vrChecked = isChecked;
    } else if (checkName == "requestbook") {
      this.rbChecked = isChecked;
    }
    // else if(checkName == 'basicservice'){
    //     this.bsChecked = isChecked;
    // }
    // else if(checkName == 'einvoice'){
    //     this.eiChecked = isChecked;
    // }
    else if (checkName == "financialservice") {
      this.fsChecked = isChecked;
    } else if (checkName == "onlinemaintenancebooking") {
      this.ombChecked = isChecked;
    } else if (checkName == "vehiclemanagement") {
      this.vmChecked = isChecked;
    } else if (checkName == "costmanagement") {
      this.cmChecked = isChecked;
    }
    // get input data
    this.getInputData();
  }

  handleSearch(event) {
    this.searchTerm = event.target.value.toLowerCase();
  }

  get filteredbranch() {
    if (!this.searchTerm) {
      return this.branchoptions;
    }
    return this.branchoptions.filter((veh) => {
      return veh.label.toLowerCase().includes(this.searchTerm);
    });
  }

  handleBranchSelect(event) {
    this.selectbranchId = event.currentTarget.dataset.id;
    console.log("selected b id", JSON.stringify(this.selectbranchId));
    this.handlebranchChange();
  }
  closeList() {
    this.showlist = false;
  }

  handlebranchChange(event) {
    // this.selectbranchId = event.detail.value;
    let selectedBranch = "";
    for (let i = 0; i < this.branchoptions.length; i++) {
      if (this.branchoptions[i].value === this.selectbranchId) {
        selectedBranch = this.branchoptions[i];
        console.log("options", this.branchoptions);
        this.branchoptions = this.branchoptions.filter(
          (bran) => bran.value !== this.selectbranchId
        );
        console.log("options2", this.branchoptions);
        break;
      }
    }
    if (selectedBranch) {
      console.log("selectedBranch", selectedBranch);
      this.branch.push({
        Id: selectedBranch.value,
        Name: selectedBranch.label
      });
      this.branchDataForClass.push(selectedBranch.label);
    }
    this.selectbranchId = null;
    // console.log("AddOpt",this.selectbranchId);
    // console.log("optfind",selectedBranch);
    // console.log('optfindstr11:', JSON.stringify(this.vehicle));
    // console.log('optfindstr:', JSON.stringify(selectedVehicle));
    // console.log("veh on updt",this.morevehicles);
  }

  handleDeleteBranch(event) {
    // const vehicleId = event.currentTarget.dataset.id;
    // this.deletedVehicleIds.push(vehicleId);
    // console.log("delete",this.deletedVehicleIds);
    // this.morevehicles = this.morevehicles.filter(veh => veh.Id !== vehicleId);

    // this.vehicles = [...this.vehicles, { label: deletedVehicleFromMoreVehiclesArray.Name, value: deletedVehicleFromMoreVehiclesArray.Id }];
    // const branchId = event.currentTarget.dataset.id;

    // Find the deleted vehicle from morevehicles array
    // const deletedVehicleFromMoreVehiclesArray = this.branch.find(veh => veh.Id === branchId);

    // Push the deleted vehicle ID to deletedVehicleIds array
    // this.deletedBranchIds.push(branchId);

    // Remove the vehicle from morevehicles array
    // this.branch = this.branch.filter(veh => veh.Id !== branchId);

    // Add the deleted vehicle back to vehicles array
    // if (deletedVehicleFromMoreVehiclesArray) {
    //     this.branch = [...this.branch, { label: deletedVehicleFromMoreVehiclesArray.Name, value: deletedVehicleFromMoreVehiclesArray.Id }];

    // }

    // this.selectbranchId = '';

    const branchId = event.currentTarget.dataset.id;

    // Find the deleted branch from branch array
    const deletedBranchFromBranchArray = this.branch.find(
      (branch) => branch.Id === branchId
    );
    if (deletedBranchFromBranchArray) {
      this.branchoptions = [
        ...this.branchoptions,
        {
          label: deletedBranchFromBranchArray.Name,
          value: deletedBranchFromBranchArray.Id
        }
      ];
    }

    // Push the deleted branch ID to deletedBranchIds array
    this.deletedBranchIds.push(branchId);

    // Remove the branch from branch array
    this.branch = this.branch.filter((branch) => branch.Id !== branchId);

    // Add the deleted branch back to another array if needed

    // Clear the selected branch ID
    this.selectbranchId = "";
  }

  getInputData() {
    this.contactInputData = {
      lastName: this.template.querySelector('[name="lastName"]').value,
      firstName: this.template.querySelector('[name="firstName"]').value,
      lastNameKana: this.template.querySelector('[name="lastNameKana"]').value,
      firstNameKana: this.template.querySelector('[name="firstNameKana"]')
        .value,
      title: this.template.querySelector('[name="title"]').value,
      department: this.template.querySelector('[name="department"]').value,
      email: this.template.querySelector('[name="email"]').value,
      phone: this.template.querySelector('[name="phone"]').value,
      mobilePhone: this.template.querySelector('[name="mobilePhone"]').value,
      employeeCode: this.template.querySelector('[name="employeeCode"]').value
    };
  }

  // Confirmation Section -> Input Section
  back2InputClick() {
    this.showInputSection = true;
    this.showConfirmationSection = false;
    this.showCompletionSection = false;
    window.scrollTo(0, 0);
  }

  nextButtonCSS() {
    let nextButton = this.template.querySelector('[name="nextButton"]');
    // if the two terms not check, the next button is disable
    if (nextButton != null) {
      if (this.termServiceChecked && this.termDataChecked) {
        nextButton.className = "primary_btn--m";
      } else {
        nextButton.className = "primary_btn--m disabled";
      }
    }
  }

  // Confirmation Section -> Completion Section
  confirmClick() {
    this.isLoading = true;

    // create a new contact under this account
    createContact({
      accountId: this.contactData.accountId,
      accountCode: this.contactData.accountCode,
      contactInputDataStr: JSON.stringify(this.contactInputData)
    })
      .then((data) => {
        let contactID = data;
        console.log("dataaaaaaaaaaaaa", contactID);
        if (data != null) {
          // create a new user according to the Info of contact
          createUser({
            contactId: data,
            accountCode: this.contactData.accountCode,
            contactInputDataStr: JSON.stringify(this.contactInputData),
            vrChecked: this.vrChecked,
            rbChecked: this.rbChecked,
            //bsChecked:this.bsChecked,eiChecked:this.eiChecked,
            fsChecked: this.fsChecked,
            ombChecked: this.ombChecked,
            vmChecked: this.vmChecked,
            cmChecked: this.cmChecked
          })
            .then((data) => {
              if (data != null) {
                this.isLoading = false;
                // turn to success page when contact and user create success
                this.showInputSection = false;
                this.showConfirmationSection = false;
                this.showCompletionSection = true;
              }
            })
            .catch((error) => {
              this.isLoading = false;
              // console.log("inside user",data)
              console.log("createUser Errors:" + JSON.stringify(error));
            });

          createBranch({
            accountId: this.contactData.accountId,
            contactId: contactID,
            branches: this.branchDataForClass
          })
            .then((data) => {
              // if(data != null){
              console.log(
                "data i send for brnach: ",
                this.contactData.accountId,
                contactID,
                this.branch
              );
              // }
            })
            .catch((error) => {
              this.isLoading = false;
              // console.log("inside user",data)
              console.log("createUser Errors:" + JSON.stringify(error));
            });
        }
      })
      .catch((error) => {
        this.isLoading = false;
        // console.log("data var",data);
        console.log(
          "dataa account",
          this.contactData.accountId,
          this.contactData.accountCode
        );
        console.log("data input string", JSON.stringify(this.contactInputData));
        console.log("createContact Errors:" + JSON.stringify(error));
      });
  }

  // back to home page
  navigateToHome() {
    let baseUrl = window.location.href;
    let homeUrl;
    if (baseUrl.indexOf("/s/") != -1) {
      homeUrl = baseUrl.split("/s/")[0] + "/s/";
    }
    window.location.href = homeUrl;
  }

  userTypeJudgment() {
    userTypeJudgment()
      .then((data) => {
        // console.log('data:' + data);
        if (!data) {
          this.navigateToHome();
        }
      })
      .catch((error) => {
        console.log("userTypeJudgment errors:" + JSON.stringify(error));
      });
  }

  returnTop() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") != -1) {
      window.location.href = baseUrl.split("/s/")[0] + "/s/";
    }
  }
  saveSelections() {
    this.updateSelectedLabels();
    this.toggleDropdown();
  }
  
  
  
  }
// shivam code









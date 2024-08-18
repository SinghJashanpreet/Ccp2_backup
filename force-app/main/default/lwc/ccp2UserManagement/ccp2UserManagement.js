import { LightningElement, track, wire } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getAllUser from "@salesforce/apex/CCP2_userData.userList";
import getUserServices from "@salesforce/apex/CCP2_userController.uiPermissionList";
import getUserAllServicesList from "@salesforce/apex/CCP2_userController.permissionValuesAccessControl";
import deleteUser from "@salesforce/apex/CCP2_UserDeleteController.deleteUser";
import USER_ID from "@salesforce/user/Id";
import checkUserEmail from "@salesforce/apex/CCP_AddUserCtrl.checkUserEmail";
import getbranchdetails from "@salesforce/apex/CCP2_userData.UnAssociatedBranch";
import branchContactAdd from "@salesforce/apex/CCP2_userController.branchContactAdd";
import userListwithbranch from "@salesforce/apex/CCP2_userData.userListwithbranch";
import branchContactDelete from "@salesforce/apex/CCP2_userController.branchContactDelete";
import updatepermission from "@salesforce/apex/CCP2_userController.createAndAssociateBranch";
import branchdetails from "@salesforce/apex/CCP2_userData.userBranchDtl";
import CCP2_MembershipManagement from "@salesforce/label/c.CCP2_MembershipManagement";
import CCP2_MemberList from "@salesforce/label/c.CCP2_MemberList";
import CCP2_ReturnToTopPage from "@salesforce/label/c.CCP2_ReturnToTopPage";
import CCP2_AddMember from "@salesforce/label/c.CCP2_AddMember";
import CCP2_CompanyName from "@salesforce/label/c.CCP2_CompanyName";
import CCP2_CustomerNumber from "@salesforce/label/c.CCP2_CustomerNumber";
import CCP2_FullName from "@salesforce/label/c.CCP2_FullName";
// import CCP2_NameFurigana from "@salesforce/label/c.CCP2_NameFurigana";
import CCP2_NameFurigana from "@salesforce/label/c.CCP2_NameFurigana";
import CCP2_EmployeeNumber from "@salesforce/label/c.CCP2_EmployeeNumber";
import CCP2_Affiliation from "@salesforce/label/c.CCP2_Affiliation";
import CCP2_Deploy from "@salesforce/label/c.CCP2_Deploy";
import CCP2_Post from "@salesforce/label/c.CCP2_Post";
import CCP2_EmailAddress from "@salesforce/label/c.CCP2_EmailAddress";
import CCP2_TelephoneNumber from "@salesforce/label/c.CCP2_TelephoneNumber";
import CCP2_CellphoneNumber from "@salesforce/label/c.CCP2_CellphoneNumber";
import CCP2_ServiceUsed from "@salesforce/label/c.CCP2_ServiceUsed";
import CCP2_ToEdit from "@salesforce/label/c.CCP2_ToEdit";
import CCP2_DeleteThisMember from "@salesforce/label/c.CCP2_DeleteThisMember";
import CCP2_Return from "@salesforce/label/c.CCP2_Return";
import CCP2_Save from "@salesforce/label/c.CCP2_Save";
import CCP2_Cancel from "@salesforce/label/c.CCP2_Cancel";
import CCP2_Required from "@salesforce/label/c.CCP2_Required";
import CCP2_RemoveThisMember from "@salesforce/label/c.CCP2_RemoveThisMember";
import CCP2_Yes from "@salesforce/label/c.CCP2_Yes";
import CCP2_No from "@salesforce/label/c.CCP2_No";
import CCP2_PleaseEnterPhoneNumber from "@salesforce/label/c.CCP2_PleaseEnterPhoneNumber";
import CCP2_WIthoutHyphen from "@salesforce/label/c.CCP2_WIthoutHyphen";
import CCP2_Surname from "@salesforce/label/c.CCP2_Surname";
import CCP2_SurnameFurigana from "@salesforce/label/c.CCP2_SurnameFurigana";
import updateUser from "@salesforce/apex/CCP2_userController.updateRecords";
import updateUserServices from "@salesforce/apex/CCP2_userController.updateAccessControl";
import getUserDetail from "@salesforce/apex/CCP2_userData.userDtl";

const arrowicon = Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";
const BACKGROUND_IMAGE_PC = Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.png";

export default class Ccp2UserManagement extends LightningElement {
  labels = {
    CCP2_MembershipManagement,
    CCP2_MemberList,
    CCP2_ReturnToTopPage,
    CCP2_AddMember,
    CCP2_CompanyName,
    CCP2_CustomerNumber,
    CCP2_FullName,
    CCP2_NameFurigana,
    CCP2_EmployeeNumber,
    CCP2_Affiliation,
    CCP2_Deploy,
    CCP2_Post,
    CCP2_EmailAddress,
    CCP2_TelephoneNumber,
    CCP2_CellphoneNumber,
    CCP2_ServiceUsed,
    CCP2_ToEdit,
    CCP2_DeleteThisMember,
    CCP2_Return,
    CCP2_Save,
    CCP2_Cancel,
    CCP2_Required,
    CCP2_PleaseEnterPhoneNumber,
    CCP2_RemoveThisMember,
    CCP2_Yes,
    CCP2_No,
    CCP2_WIthoutHyphen,
    CCP2_Surname,
    CCP2_SurnameFurigana
  };

  backgroundImagePC = BACKGROUND_IMAGE_PC;
  addUserUrl;
  homeUrl;
  refreshUserDetailWireData;
  refreshToken = false;
  refreshTokenInt = 0;
  refreshTokenInt2 = 10;
  imgdrop = arrowicon;
  firstName;
  lastName;
  @track showModal = false;
  @track selectedUserId;
  @track selectedContactUserId;
  @track allUserData;
  @track customerId;
  @track showconfModal = false;
  @track userServicesData;
  @track userDetailData;
  @track allServicesListData;
  @track allServicesListDataForClass;
  @track allUserLoader = true;
  @track userDetailsLoader = true;
  @track showUserList = true;
  @track showUserDetails = false;
  @track showEditUserDetails = false;
  @track showDeleteScreen = false;
  @track formData = {};
  @track checkboxFormData = {};
  @track uid = USER_ID;
  @track formDataArray = [];
  @track usercount;
  @track IsUsercountZero = false;
  @track branchfromjunction = [];
  @track branchoptions = [];
  @track searchTerm = "";
  @track branch = [];
  @track showlist = false;
  @track deletedBranchIds = [];
  @track showCancelModal = false;

  contactClassFirstName = "";
  contactClassLastName = "";
  contactClassFKanaName = "";
  contactClassLKanaName = "";
  contactClassEmail = "";
  contactClassTelephone = "";
  contactClassCellPhone = "";
  contactClassBranch = "Inputs1 icon";
  InputFirstName = "";
  InputLastName = "";
  InputFKanaName = "";
  InputLKanaName = "";
  InputEmail = "";
  InputTelephone = "";
  InputCellPhone = "";
  InputEmpCode = "";
  InputDepartment = "";
  InputPost = "";
  @track contactName = "";
  @track contactlist = [];
  @track brnach = [];
  @track ErrorText = '';
    @track emailerrorText = ''
    @track cellPhoneErrorText = '';
    @track telephoneErrorText = '';
    @track Fnameerror = '';
    @track Lnameerror = '';
    @track Fkanaerror = '';
    @track Lkanaerror = '';
    @track initialmail = '';


  @wire(userListwithbranch)
  userlistbran({data,error}){
    if(data){
      console.log("brnach user list data",data);

    //   this.contactlist = data.map((branch)=> ({

    //     brnach: branch.branches.map((bran) => (
    //       {
    //       branhesname: bran.Name,
    //       branchesId: bran.Id
    //       }
    //   )),

    //     contactss: branch.contact.Name,
    //     contactssId: branch.contact.Id
        

    //   }));

      
    //   console.log("contact branch",JSON.stringify(this.contactlist));
    // }
    this.contactlist = data.map((branch) => {
      
      const firstBranch = branch.branches.length > 0 ? branch.branches[0] : {};

      return {
        branchName: firstBranch.Name,
        branchId: firstBranch.Id,
        contactName: branch.contact.Name,
        contactssId: branch.contact.Id,
        usercontactId: branch.contact.UserId__c
      };
    });

    console.log("contact branch", JSON.stringify(this.contactlist));
  }
  }
  @wire(getUserServices, {
    userId: "$selectedContactUserId",
    refresh: "$refreshTokenInt2"})
  userServicesFun({ data, error }) {
    if (data) {
      if (data.length == 0) {
        this.userServicesData = ["Null"];
    } else {
        const serviceOrder = [
            "基本サービス（ふそうショップ）",
            "部整月次請求書（電子版）",
            "金融サービス",
            "車検入庫予約",
            "車両管理",
            "費用管理"
        ];

        this.userServicesData = serviceOrder.map(service => data.find(item => item === service));
        console.log("userServicesData", JSON.stringify(this.userServicesData));
    }

      // console.log('getUserServices wire:-',data,this.refreshTokenInt)
      // console.log("selected con id service",this.selectedContactUserId);
      // if (data.length == 0) {
      //   this.userServicesData = ["Null"];
      // } else {
      //   this.userServicesData = data;
      // }
    } else {
      console.error("User Services Fetching error: wire", error);
    }
  }

  @wire(getUserDetail, { User: "$selectedUserId", refresh: "$refreshTokenInt" })
  wiredUser({ data, error }) {
    this.refreshUserDetailWireData = data;
    if (data) {
      this.userDetailData = {
        Name: data[0].Name == null ? "-" : data[0].Name,
        id: data[0].Id == null ? "-" : data[0].Id,
        email: data[0].Email == null ? "-" : data[0].Email,
        account: {
          name: data[0].Account.Name == null ? "-" : data[0].Account.Name,
          siebelAccountCode__c:
            data[0].Account.siebelAccountCode__c == null
              ? "-"
              : data[0].Account.siebelAccountCode__c
        },
        Department: data[0].Department == null ? "-" : data[0].Department,
        MobilePhone: data[0].MobilePhone == null ? "-" : data[0].MobilePhone,
        Phone: data[0].Phone == null ? "-" : data[0].Phone,
        Title:
          !data[0].Title || data[0].Title == undefined ? "-" : data[0].Title,
        firstNameKana__c:
          data[0].firstNameKana__c == null ? "-" : data[0].firstNameKana__c,
        lastNameKana__c:
          data[0].lastNameKana__c == null ? "-" : data[0].lastNameKana__c,
        Employee_Code__c:
          data[0].Employee_Code__c == null ? "-" : data[0].Employee_Code__c
      };
      this.firstName = data[0].Name.split(" ")[1];
      this.lastName = data[0].Name.split(" ")[0];

      this.InputFirstName = this.firstName == undefined ? "" : this.firstName;
      this.InputLastName = this.lastName == undefined ? "" : this.lastName;
      this.InputFKanaName =
        data[0].firstNameKana__c == undefined ? "" : data[0].firstNameKana__c;
      this.InputLKanaName =
        data[0].lastNameKana__c == undefined ? "" : data[0].lastNameKana__c;
      this.InputEmail = data[0].Email == undefined ? "" : data[0].Email;
      this.initialmail = data[0].Email == undefined ? "" : data[0].Email;
      this.InputTelephone = data[0].Phone == undefined ? "" : data[0].Phone;
      this.InputCellPhone =
        data[0].MobilePhone == undefined ? "" : data[0].MobilePhone;

      this.InputDepartment =
        data[0].Department == undefined ? "" : data[0].Department;
      this.InputPost = data[0].Title == undefined ? "" : data[0].Title;
      this.InputEmpCode =
        data[0].Employee_Code__c == undefined ? "" : data[0].Employee_Code__c;
      this.userDetailsLoader = false;
    } else if(error) {
      console.error(
        "User Detail Fetching error: in wire" + JSON.stringify(error)
      );
    }
  }

  @wire(branchdetails, {
    User: "$selectedUserId",
    refresh: "$refreshTokenInt2"
  })
  wiredbranches2({ data, error }) {
    if (data) {
      console.log("branchdetails wire:-", data, this.refreshTokenInt2);
      this.branchfromjunction = data.map((branch) => ({
        Name: branch.Name,
        Id: branch.Id
      }));
    } else {
      console.error("error in fetching branches from new", error);
    }
  }

  @wire(getbranchdetails, { contactId: "$selectedUserId" }) wiredBranches({
    data,
    error
  }) {
    if (data) {
      console.log("branch data branch options",data)
      this.branchoptions = data.map((vehicle) => {
        return { label: vehicle.Name, value: vehicle.Id };
      });
    } else if (error) {
      console.error(error);
    }
  }
  
  getAllUser() {
    getAllUser()
      .then((result) => {
        // this.allUserData = result;
        this.usercount = result != [] ? result.length : 0;
        if (this.usercount == 0) {
          this.IsUsercountZero = true;
          this.showUserList = false;
        }

        this.allUserData = result.map((elm) => {
          return {
            Name: elm.Name == null ? "null" : elm.Name,
            Id: elm.Id == null ? "null" : elm.Id,
            UserId__c: elm.UserId__c == null ? "null" : elm.UserId__c,
            Account: {
              Id: elm.Account.Id == null ? "Null" : elm.Account.Id,
              siebelAccountCode__c:
                elm.Account.siebelAccountCode__c == null
                  ? "null"
                  : elm.Account.siebelAccountCode__c
            },
            Branch__r: elm.Branch__r == null ? { Name: "Null" } : elm.Branch__r
          };
        });
        this.allUserLoader = false;
      })
      .catch((error) => {
        console.error("User Fetching error:" + JSON.stringify(error));
      });
  }

  reloadPage() {
    location.reload();
  }

  deleteUser() {
    deleteUser({ contactId: this.selectedUserId })
      .then((result) => {
        // this.handleDeleteSuccess();
        console.log("del result",result);
      })
      .catch((error) => {
        console.error("delete User Fetching error:" + JSON.stringify(error));
      });
  }

  updateUserServices(filteredCheckData) {
    updateUserServices({ con: filteredCheckData })
      .then((result) => {
      })
      .catch((error) => {
        console.error("updateUserServices:" + JSON.stringify(error));
      });

    updatepermission({ con: filteredCheckData })
      .then((result) => {
      })
      .catch((error) => {
        console.log(
          "updatepermission input" + JSON.stringify(filteredCheckData)
        );
        console.error("updatepermission" + JSON.stringify(error));
      });
  }

  getUserAllServicesList(id) {
    getUserAllServicesList({ userId: id, refresh: this.refreshTokenInt })
      .then((result) => {
        console.log("resut setv",result)
        if (result == undefined || result.length == 0) {
          this.allServicesListData = ["Null"];
        } else {
          const orderedServices = [
            { name: '部整月次請求書（電子版）', apiName: 'E_invoice_Flag__c', ...result[1] },
            { name: '金融サービス', apiName: 'Financial_service_Flag__c', ...result[2] },
            { name: '車検入庫予約', apiName: 'Online_maintenance_booking_Flag__c', ...result[3] },
            { name: '車両管理', apiName: 'Vehicle_management_Flag__c', ...result[4] },
            { name: '費用管理', apiName: 'Cost_management_Flag__c', ...result[0] }
          ];
          this.allServicesListData = orderedServices.map((service, index) => ({
            ...service,
            sequence: index + 1
          }));

          console.log("allServicesListData", JSON.stringify(this.allServicesListData));

          this.checkboxFormData = {
            E_invoice_Flag__c: result[1].isActive,
            Financial_service_Flag__c: result[2].isActive,
            Online_maintenance_booking_Flag__c: result[3].isActive,
            Vehicle_management_Flag__c: result[4].isActive,
            Cost_management_Flag__c: result[0].isActive
          };

          // this.allServicesListData = result;
          // console.log("allServicesListData",JSON.stringify(this.allServicesListData));

          // this.checkboxFormData = {
          //   Basic_Service_EC_Flag__c: result[0].isActive,
          //   Cost_management_Flag__c: result[1].isActive,
          //   E_invoice_Flag__c: result[2].isActive,
          //   Financial_service_Flag__c: result[3].isActive,
          //   Online_maintenance_booking_Flag__c: result[4].isActive,
          //   Vehicle_management_Flag__c: result[5].isActive
          // };
        }
      })
      .catch((error) => {
        console.error("User Fetching error services:" + JSON.stringify(error));
      });
  }

  updateUser(formDataArray) {
    // Return the promise from updateUser function
    return new Promise((resolve, reject) => {
      const BranchIdsToAdd = this.branch.map((bran) => bran.Id);
      updateUser({ uiFieldJson: formDataArray, branches: BranchIdsToAdd })
        .then((result) => {
          resolve(result); // Resolve the promise on success
        })
        .catch((error) => {
          console.error("update User error:" + JSON.stringify(error));
          reject(error); // Reject the promise on error
        });
    });
  }

  connectedCallback() {
    let baseUrl = window.location.href;
    this.addUserUrl = baseUrl.split("/s/")[0] + "/s/addUser";
    this.homeUrl = baseUrl.split("/s/")[0] + "/s/";
    this.getAllUser();
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.imgdrop})`
    );
    requestAnimationFrame(() => {
      this.addCustomStyles();
    });
  }

  handleUserClick(event) {
    this.selectedContactUserId = event.target.dataset.user;
    this.getUserAllServicesList(this.selectedContactUserId);
    this.selectedUserId = event.target.dataset.idd;
    this.refreshTokenInt = ++this.refreshTokenInt;
    this.customerId = event.target.dataset.idd;
    this.showUserList = false;
    this.showUserDetails = true;
    this.showEditUserDetails = false;
  }

  handleReturnClick() {
    window.scrollTo(0,0);
    this.showUserList = true;
    this.showUserDetails = false;
    this.showEditUserDetails = false;
    this.showDeleteScreen = false;
    this.reloadPage();
  }

  handleReturnClick2() {
    this.reloadPage();
  }

  handleEditChange() {
    window.scrollTo(0,0);
    this.showUserList = false;
    this.showUserDetails = false;
    this.showEditUserDetails = true;
    this.userDetailsLoader = true;
    if(this.InputCellPhone == "-"){
      this.InputCellPhone = ""
    }
    if(this.InputTelephone == "-"){
      this.InputTelephone = "";
    }
    if(this.InputEmpCode == "-"){
      this.InputEmpCode = "";
    }
    if(this.InputPost == "-"){
      this.InputPost = "";
    }
    if(this.InputDepartment == "-"){
      this.InputDepartment = "";
    }
  }

  handleInputChange(event) {
    const field = event.target.dataset.field;
    if (field) {
      if (event.target.type === "checkbox") {
        this.formData[field] = event.target.checked; // Use checked property for checkboxes
      } else {
        if (field == "姓") {
          this.InputLastName = event.target.value;
          // this.contactClassLastName = this.InputLastName ? "" : "invalid-input";
        } else if (field == "名") {
          this.InputFirstName = event.target.value;
          // this.contactClassFirstName = this.InputFirstName
          //   ? ""
          //   : "invalid-input";
        } else if (field == "姓（フリガナ）") {
          this.InputLKanaName = event.target.value;
          // this.contactClassLKanaName = this.InputLKanaName
          //   ? ""
          //   : "invalid-input";
        } else if (field == "名（フリガナ）") {
          this.InputFKanaName = event.target.value;
          // this.contactClassFKanaName = this.InputFKanaName
          //   ? ""
          //   : "invalid-input";
        } else if (field == "部署") {
          this.InputDepartment = event.target.value;
        } else if (field == "役職") {
          this.InputPost = event.target.value;
        } else if (field == "社員番号") {
          this.InputEmpCode = event.target.value;
        } else if (field == "メールアドレス") {
          this.InputEmail = event.target.value;
          // this.contactClassEmail = this.InputEmail ? "" : "invalid-input";
          
          
        } else if (field == "電話番号") {
          const onlyNumber = /^[0-9]*$/;
          const input = event.target;
          let isOk =
            input.value.length > 0 && onlyNumber.test(input.value)
              ? true
              : false;
          this.InputTelephone = input.value;

          // this.contactClassTelephone = isOk == true ? "" : "invalid-input";
        } else if (field == "携帯番号") {
          const onlyNumber = /^[0-9]*$/;
          const input = event.target;
          let isOk =
            input.value.length > 0 && onlyNumber.test(input.value)
              ? true
              : false;
        this.InputCellPhone = input.value;

          // this.contactClassCellPhone = isOk == true ? "" : "invalid-input";
        }
      this.formData[field] = event.target.value;
      console.log("outside error mail", JSON.stringify(this.formData));
    }
  }
}

  handleCheckInputChange(event) {
    const field = event.target.dataset.field;

    if (field) {
      if (event.target.type === "checkbox") {
        this.checkboxFormData = {
          ...this.checkboxFormData, // Copy existing values
          [field]: event.target.checked // Update the specific field with its checked state
        };
      }
    }
  }

  handleDeleteUser() {
    this.showconfModal = true;
  }

  handleYes() {
    window.scrollTo(0,0);
    this.deleteUser(this.selectedUserId);
    this.getAllUser();
    this.showDeleteScreen = true;
    this.showconfModal = false;
    this.showUserList = false;
    this.showUserDetails = false;
    this.showEditUserDetails = false;
    this.userDetailsLoader = false;
  }

  handleNo() {
    this.showconfModal = false;
  }
  branchdeleteAdd() {
    if (this.deletedBranchIds.length > 0) {
      branchContactDelete({
        contactId: this.selectedUserId,
        branchesToDelete: this.deletedBranchIds
      });
    }
    if (this.branch.length > 0) {
      const branIdsToAdd = this.branch.map((vehicle) => vehicle.Id);
      branchContactAdd({
        contactId: this.selectedUserId,
        branchesToAdd: branIdsToAdd
      });
    }
  }

  // saveFormData() {
  //   let onlyNumber = /^[0-9]*$/;
  //   let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   console.log("branch junction",this.branchfromjunction.length);
  //   if (
  //     this.InputFirstName == "" ||
  //     this.InputLastName == "" ||
  //     this.InputFKanaName == "" ||
  //     this.InputLKanaName == "" ||
  //     this.InputEmail == "" ||
  //     (this.branchfromjunction.length == 0 && this.branch.length == 0) ||
  //     (this.InputTelephone == "" && this.InputCellPhone == "")
  //   ) {
  //     this.handleError();
  //     console.log(this.InputFirstName);
  //     console.log(this.branchfromjunction.length);
  //     this.showEditUserDetails = true;
  //   }else if (!emailPattern.test(this.InputEmail)) {
  //     this.contactClassEmail = "invalid-input";
  //     this.handleValidationError();
  //   } else if (
  //     this.InputTelephone == "" &&
  //     !onlyNumber.test(this.InputCellPhone)
  //   ) {
  //     this.contactClassCellPhone = "invalid-input";
  //     this.handleValidationError();
  //   } else if (
  //     !onlyNumber.test(this.InputTelephone) &&
  //     this.InputCellPhone == ""
  //   ) {
  //     this.contactClassTelephone = "invalid-input";
  //     this.handleValidationError();
  //   } else if (
  //     this.InputTelephone != "" &&
  //     this.InputCellPhone != "" &&
  //     (!onlyNumber.test(this.InputTelephone) ||
  //       !onlyNumber.test(this.InputCellPhone))
  //   ) {
  //     this.contactClassTelephone = "invalid-input";
  //     this.contactClassCellPhone = "invalid-input";
  //     this.handleValidationError();
  //   }
  //   else {
  //     this.formDataArray = [];
  //     this.formData["ContactId"] = this.selectedUserId;
  //     this.formDataArray.push(this.formData);
  //     let filteredData = JSON.stringify(this.formDataArray);
  //     this.checkboxFormData["Name"] = this.selectedContactUserId;
  //     let filteredCheck = this.checkboxFormData;

  //     const asyncFunction = async () => {
  //       try {
  //         this.showEditUserDetails = false;
  //         this.userDetailsLoader = true;
  //         this.showUserDetails = true;
  //         window.scrollTo(0,0);
  //         await this.updateUser(filteredData);
  //         await this.updateUserServices(filteredCheck);
  //         await this.branchdeleteAdd();

  //         this.refreshTokenInt = ++this.refreshTokenInt;
  //         this.refreshTokenInt2 = ++this.refreshTokenInt2;

  //         this.branch = [];
  //         console.log(
  //           "refresh1 ,refresh2, selectedUserId in save form",
  //           this.refreshTokenInt,
  //           this.refreshTokenInt2,
  //           this.selectedUserId
  //         );
  //         setTimeout(async () => {
  //           // this.handleSuccess();
  //           this.showModalAndRefresh();
  //           this.refreshTokenInt = ++this.refreshTokenInt;
  //           this.refreshTokenInt2 = ++this.refreshTokenInt2;
  //           this.showUserList = false;
  //           this.userDetailsLoader = false;
  //           this.getUserAllServicesList(this.selectedContactUserId);
  //         }, 1000);

  //       } catch (error) {
  //         console.error("Error updating user:", error);
  //         this.handleValidationError();
  //       }
  //     };

  //     asyncFunction();
  //   }
  // }

  saveFormData() {
    let onlyNumber = /^[0-9]*$/;
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isFormValid = true; // Flag to track overall form validity

    // Reset all error messages and CSS classes
    this.contactClassFirstName = "";
    this.Fnameerror = "";
    this.contactClassLastName = "";
    this.Lnameerror = "";
    this.contactClassFKanaName = "";
    this.Fkanaerror = "";
    this.contactClassLKanaName = "";
    this.Lkanaerror = "";
    this.contactClassBranch = "Inputs1 icon";
    this.ErrorText = "";
    this.contactClassEmail = "";
    this.emailerrorText = "";
    this.contactClassCellPhone = "";
    this.contactClassTelephone = "";
    this.cellPhoneErrorText = "";

    if (this.InputFirstName == "") {
        this.contactClassFirstName = "invalid-input";
        this.Fnameerror = "名を入力してください";
        this.handleError();
        isFormValid = false;
    }
    if (this.InputLastName == "") {
        this.contactClassLastName = "invalid-input";
        this.Lnameerror = "姓を入力してください";
        this.handleError();
        isFormValid = false;
    }
    if (this.InputFKanaName == "") {
        this.contactClassFKanaName = "invalid-input";
        this.Fkanaerror = "名を入力してください";
        this.handleError();
        isFormValid = false;
    }
    if (this.InputLKanaName == "") {
        this.contactClassLKanaName = "invalid-input";
        this.Lkanaerror = "姓を入力してください";
        this.handleError();
        isFormValid = false;
    }
    if (this.branchfromjunction.length == 0 && this.branch.length == 0) {
        this.ErrorText = "所属を選択してください";
        this.contactClassBranch = "Inputs1 icon invalid-input";
        this.handleError();
        isFormValid = false;
    }
    if (this.InputEmail == "") {
        this.contactClassEmail = "invalid-input";
        this.emailerrorText = "メールアドレスを入力してください";
        this.handleError();
        isFormValid = false;
    } else if (!emailPattern.test(this.InputEmail)) {
        this.contactClassEmail = "invalid-input";
        this.emailerrorText = "メールアドレスの形式は不正です";
        isFormValid = false;
        window.scrollTo(0,0);
    }
    const emailValidationPromise = new Promise((resolve, reject) => {
      if (this.InputEmail != this.initialmail) {
          checkUserEmail({ email: this.InputEmail })
              .then((data) => {
                  if (data && data[0] == "true") {
                      this.contactClassEmail = "invalid-input";
                      this.emailerrorText = "入力されたメールアドレスはすでに使われています";
                      isFormValid = false;
                      window.scrollTo(0,0);
                  }
                  resolve();
              })
              .catch((error) => {
                  console.error("Error checking email:", error);
                  this.emailerrorText = "メールアドレスの検証中にエラーが発生しました";
                  this.contactClassEmail = "invalid-input";
                  isFormValid = false;
                  window.scrollTo(0,0);
                  resolve();
              });
      } else {
          resolve();
      }
  });

    if (this.InputTelephone == "" && this.InputCellPhone == "") {
        this.cellPhoneErrorText = "電話番号か携帯番号かいずれかをご入力ください。";
        this.contactClassCellPhone = "invalid-input";
        this.contactClassTelephone = "invalid-input";
        this.handleError();
        isFormValid = false;
    } 
    else if (this.InputTelephone == "" && !onlyNumber.test(this.InputCellPhone)) {
        this.contactClassCellPhone = "invalid-input";
        this.telephoneErrorText = "電話番号・携帯番号は半角数字（ハイフンなし）でご入力ください。";
        window.scrollTo(0,0);
        isFormValid = false;
    } else if ( this.InputCellPhone == "" && !onlyNumber.test(this.InputTelephone)) {
        this.contactClassTelephone = "invalid-input";
        this.cellPhoneErrorText = "電話番号・携帯番号は半角数字（ハイフンなし）でご入力ください。";
        window.scrollTo(0,0);
        isFormValid = false;
    } 
    else if (this.InputTelephone != "" && this.InputCellPhone != "" && (!onlyNumber.test(this.InputTelephone) || !onlyNumber.test(this.InputCellPhone))) {
        this.contactClassTelephone = "invalid-input";
        this.contactClassCellPhone = "invalid-input";
        this.cellPhoneErrorText = "電話番号・携帯番号は半角数字（ハイフンなし）でご入力ください。";
        window.scrollTo(0,0);
        isFormValid = false;
    }

    // If form is valid, proceed with the form submission
    emailValidationPromise.then(() => {
      if (isFormValid) {
        this.formDataArray = [];
            this.formData["ContactId"] = this.selectedUserId;
            this.formDataArray.push(this.formData);
            let filteredData = JSON.stringify(this.formDataArray);
            this.checkboxFormData["Name"] = this.selectedContactUserId;
            let filteredCheck = this.checkboxFormData;
  
          const asyncFunction = async () => {
              try {
                  this.showEditUserDetails = false;
                  this.userDetailsLoader = true;
                  this.showUserDetails = true;
                  window.scrollTo(0,0);
                  await this.updateUser(filteredData);
                  await this.updateUserServices(filteredCheck);
                  await this.branchdeleteAdd();
        
                  this.refreshTokenInt = ++this.refreshTokenInt;
                  this.refreshTokenInt2 = ++this.refreshTokenInt2;
        
                  this.branch = [];
                  console.log(
                    "refresh1 ,refresh2, selectedUserId in save form",
                    this.refreshTokenInt,
                    this.refreshTokenInt2,
                    this.selectedUserId
                  );
                  setTimeout(async () => {
                    // this.handleSuccess();
                    this.showModalAndRefresh();
                    this.refreshTokenInt = ++this.refreshTokenInt;
                    this.refreshTokenInt2 = ++this.refreshTokenInt2;
                    this.showUserList = false;
                    this.userDetailsLoader = false;
                    this.getUserAllServicesList(this.selectedContactUserId);
                  }, 1000);
              } catch (error) {
                  console.error("Error updating user:", error);
                  this.handleValidationError();
              }
          };
  
          asyncFunction();
      } else {
          // Display all accumulated errors
          // this.handleError();
      }
    })
}

  handleSuccess() {
    const evt = new ShowToastEvent({
      title: "完了",
      message: "情報が正常に更新されました。",
      variant: "Success"
    });
    this.dispatchEvent(evt);
  }

  handleDeleteSuccess() {
    const evt = new ShowToastEvent({
      title: "完了",
      message: "会員が正常に削除されました。",
      variant: "Success"
    });
    this.dispatchEvent(evt);
  }

  handleError() {
    const evt = new ShowToastEvent({
      title: "エラー",
      message: "必須項目を入力してください。",
      variant: "Error"
    });
    this.dispatchEvent(evt);
  }

  handleemailerror(){
    const evt = new ShowToastEvent({
      title: "エラー",
      message: "入力されたメールアドレスはすでに使われています",
      variant: "Error"
    });
    this.dispatchEvent(evt);
  }
  handleValidationError() {
    const evt = new ShowToastEvent({
      title: "エラー",
      message: " 正しい値を入力してください。",
      variant: "Error"
    });
    this.dispatchEvent(evt);
  }

  /*Custom JS*/
  handleSearch(event) {
    this.searchTerm = event.target.value.toLowerCase();
  }


  handlebranChange(event) {
    event.stopPropagation();
    this.showlist = !this.showlist;
    if (this.branchoptions.length == 0) {
      this.showlist = false;
    }
  }

  handleInsideClick(event) {
    event.stopPropagation();
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
    if (this.branchoptions.length == 1) {
      this.showlist = false;
    }
    this.selectbranchId = event.currentTarget.dataset.id;
    this.handlebranchChange();
  }

  handleDeleteBranch(event) {
    const vehicleId = event.currentTarget.dataset.id;
    const deletedVehicleFromVehicleArray = this.branch.find(
      (veh) => veh.Id === vehicleId
    );
    if (deletedVehicleFromVehicleArray) {
      this.branchoptions = [
        ...this.branchoptions,
        {
          label: deletedVehicleFromVehicleArray.Name,
          value: deletedVehicleFromVehicleArray.Id
        }
      ];
   }

    const deletedVehicleFromMoreVehiclesArray = this.branchfromjunction.find(
      (veh) => veh.Id === vehicleId
    );
    if (
      deletedVehicleFromMoreVehiclesArray &&
      !deletedVehicleFromVehicleArray
    ) {
      this.branchoptions = [
        ...this.branchoptions,
        {
          label: deletedVehicleFromMoreVehiclesArray.Name,
          value: deletedVehicleFromMoreVehiclesArray.Id
        }
      ];
    }
    
    this.deletedBranchIds.push(vehicleId);
    
    this.branch = this.branch.filter((veh) => veh.Id !== vehicleId);
   
    this.branchfromjunction = this.branchfromjunction.filter(
      (veh) => veh.Id !== vehicleId
    );
    this.selectbranchId = "";
  }

  handleOutsideClick = (event) => {
    const dataDropElement = this.template.querySelector(".dataDrop");
    const listsElement = this.template.querySelector(".lists");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showlist = false;
    }
  };

  renderedCallback() {
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      this.outsideClickHandlerAdded = true;
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
  }

  handlebranchChange() {
    let selectedBranch = "";
    for (let i = 0; i < this.branchoptions.length; i++) {
      if (this.branchoptions[i].value === this.selectbranchId) {
        selectedBranch = this.branchoptions[i];
        this.branchoptions = this.branchoptions.filter(
          (bran) => bran.value !== this.selectbranchId
        );
        break;
      }
    }
    if (selectedBranch) {
      this.branch.push({
        Id: selectedBranch.value,
        Name: selectedBranch.label
      });
      this.branchDataForClass.push(selectedBranch.label);
    }
    this.selectbranchId = null;
    if (this.branchoptions.length == 0) {
      this.showlist = false;
    }
  }
  handleCancel(){
    this.showCancelModal = true;
  }
  CancelhandleNo(){
    this.showEditUserDetails = true;
    this.showCancelModal = false;
  }
  CancelhandleYes(){
    this.showCancelModal = false;
    this.showUserDetails = true;
    this.userDetailsLoader = false;
    console.log("cancek user detail",this.showUserDetails);
    console.log("selected id",this.selectedUserId);
    this.showEditUserDetails = false;
  }
  
  showModalAndRefresh() {
    this.showModal = true;
    setTimeout(() => {
        this.showModal = false;
    }, 2000);
}
get branchPlaceholder() {
  return this.branchfromjunction.length === 0 && this.branch.length === 0;
}

handleInputValidation(event) {
  const field = event.target.dataset.field;
  if (field === "電話番号" || field === "携帯番号") {
      let value = event.target.value;
      const onlyDigitsRegex = /^[0-9０-９]*$/;

      if (!onlyDigitsRegex.test(value)) {
          value = value.replace(/[^0-9０-９]/g, '');
      }

      if (value.length > 11) {
          value = value.slice(0, 11);
      }

      event.target.value = value;
  }
}


}
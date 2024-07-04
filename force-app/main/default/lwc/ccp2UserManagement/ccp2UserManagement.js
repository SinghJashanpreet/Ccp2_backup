import { LightningElement, track, wire } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_Vehicle";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource +
  "/CCP_StaticResource_Vehicle/images/Main_Background.png";
import getAllUser from "@salesforce/apex/CCP2_userData.userList";
// import getUserServices from "@salesforce/apex/ccp2_userPermissionSet.permissionValues";
import getUserServices from "@salesforce/apex/ccp2_UIpermissionList.uiPermissionList";
import getUserAllServicesList from "@salesforce/apex/CCP2_ServicesList.permissionValues";
import deleteUser from "@salesforce/apex/CCP2_UserDeleteController.deleteUser";
import USER_ID from "@salesforce/user/Id";
import { refreshApex } from "@salesforce/apex";
import getbranchdetails from "@salesforce/apex/CCP2_userData.UnAssociatedBranch";
import branchContactAdd from "@salesforce/apex/ccp2_userupdate.branchContactAdd";
import branchContactDelete from "@salesforce/apex/ccp2_userupdate.branchContactDelete";

import updatepermission from "@salesforce/apex/CCP2_UpdatePermissionAssignment.createAndAssociateBranch";
import branchdetails from "@salesforce/apex/CCP2_userData.userBranchDtl";

import CCP2_MembershipManagement from "@salesforce/label/c.CCP2_MembershipManagement";
import CCP2_MemberList from "@salesforce/label/c.CCP2_MemberList";
import CCP2_ReturnToTopPage from "@salesforce/label/c.CCP2_ReturnToTopPage";
import CCP2_AddMember from "@salesforce/label/c.CCP2_AddMember";
import CCP2_CompanyName from "@salesforce/label/c.CCP2_CompanyName";
import CCP2_CustomerNumber from "@salesforce/label/c.CCP2_CustomerNumber";
import CCP2_FullName from "@salesforce/label/c.CCP2_FullName";
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

const arrowicon =
  Vehicle_StaticResource + "/CCP_StaticResource_Vehicle/images/arrow_under.png";

import updateUser from "@salesforce/apex/ccp2_userupdate.updateRecords";
// import updateUserServices from "@salesforce/apex/ccp2_UIpermissionList.updateRecords";
import updateUserServices from "@salesforce/apex/ContactUpdate.updateAccessControl";
// import testPermissionSet from "@salesforce/apex/CCP_AddUserCtrl.setPermissionSetforUser";
import getUserDetail from "@salesforce/apex/CCP2_userData.userDtl";
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
  @track selectedUserId;
  @track selectedContactUserId;
  imgdrop = arrowicon;
  @track allUserData;
  @track customerId;
  @track showconfModal = false;
  //   @track userId;
  @track userServicesData;
  firstName;
  lastName;
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
  contactClassFirstName = "";
  contactClassLastName = "";
  contactClassFKanaName = "";
  contactClassLKanaName = "";
  contactClassEmail = "";
  contactClassTelephone = "";
  contactClassCellPhone = "";

  @track branchfromjunction = [];
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
  // Custom vars
  //Custom Vars End

  @wire(branchdetails, { User: "$selectedUserId", refresh: "$refreshTokenInt" })
  wiredbranches2({ data, error }) {
    if (data) {
      this.branchfromjunction = data.map((branch) => ({
        Name: branch.Name,
        Id: branch.Id
      }));
      // console.log(
      //   "branch data from new branch func",
      //   JSON.stringify(this.branchfromjunction)
      // );
    } else {
      console.error("error in fetching branches from new", error);
    }
  }

  @wire(getUserServices, {
    userId: "$selectedContactUserId",
    refresh: "$refreshTokenInt"
  })
  userServicesFun({ data, error }) {
    if (data) {
      if (data.length == 0) {
        this.userServicesData = ["Null"];
      } else {
        this.userServicesData = data;
      }
      // console.log(
      //   "sercvices on detail page(ccp2_UIpermissionList) wire: ",
      //   data
      // );
      // console.log(
      //   "sercvices on detail page(ccp2_UIpermissionList) wire2: ",
      //   this.selectedUserId,
      //   this.refreshToken
      // );
    } else {
      console.error("User Services Fetching error: wire", error);
    }
  }

  @wire(getUserDetail, { User: "$selectedUserId", refresh: "$refreshTokenInt" }) wiredUser({
    data,
    error
  }) {
    this.refreshUserDetailWireData = data;
    if (data) {
      // console.log("refresh token",this.refreshToken)
      console.log("wire user Detail data:-", data, this.refreshTokenInt);
      this.userDetailData = {
        Name: data[0].Name == null ? "null" : data[0].Name,
        id: data[0].Id == null ? "null" : data[0].Id,
        email: data[0].Email == null ? "null" : data[0].Email,
        account: {
          // id: data[0].Account.Id ? 'null' : data[0].Account.Id,
          name: data[0].Account.Name == null ? "null" : data[0].Account.Name,
          siebelAccountCode__c:
            data[0].Account.siebelAccountCode__c == null
              ? "null"
              : data[0].Account.siebelAccountCode__c
        },
        Department: data[0].Department == null ? "null" : data[0].Department,
        // Branchs__r: data[0].Branchs__r == null ? [{ Name: "Null" }] : data[0].Branchs__r,
        MobilePhone: data[0].MobilePhone == null ? "null" : data[0].MobilePhone,
        Phone: data[0].Phone == null ? "null" : data[0].Phone,
        Title:
          !data[0].Title || data[0].Title == undefined ? "null" : data[0].Title,
        firstNameKana__c:
          data[0].firstNameKana__c == null ? "null" : data[0].firstNameKana__c,
        lastNameKana__c:
          data[0].lastNameKana__c == null ? "null" : data[0].lastNameKana__c,
        Employee_Code__c:
          data[0].Employee_Code__c == null ? "null" : data[0].Employee_Code__c
      };
      this.firstName = data[0].Name.split(" ")[1];
      this.lastName = data[0].Name.split(" ")[0];

      this.InputFirstName = this.firstName;
      this.InputLastName = this.lastName;
      this.InputFKanaName = data[0].firstNameKana__c;
      this.InputLKanaName = data[0].lastNameKana__c;
      this.InputEmail = data[0].Email;
      this.InputTelephone = data[0].Phone;
      this.InputCellPhone = data[0].MobilePhone;

      this.InputDepartment = data[0].Department;
      this.InputPost = data[0].Title;
      this.InputEmpCode = data[0].Employee_Code__c;

      // console.log("split", data[0].Name.split(" "));
      this.userDetailsLoader = false;

      // console.log("user detail api data response wire : ", data);
    } else {
      // console.log("user id in wire: ", this.uid);
      console.error(
        "User Detail Fetching error: in wire" + JSON.stringify(error)
      );
    }
  }

  getUserServices(id) {
    getUserServices({ userId: id, refresh: this.refreshToken })
      .then((result) => {
        if (result.length == 0) {
          this.userServicesData = ["Null"];
        } else {
          this.userServicesData = result;
        }
        // console.log(
        //   "sercvices on detail page(ccp2_UIpermissionList): ",
        //   result
        // );
      })
      .catch((error) => {
        console.error("User Services Fetching error:" + error);
      });
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
        // console.log("user count", this.usercount);
        // console.log("result", result);

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

        // this.userId = result.UserId__c;
        // console.log(
        //   "all user my data response : ",
        //   JSON.stringify(this.allUserData)
        // );

        this.allUserLoader = false;
      })
      .catch((error) => {
        console.error("User Fetching error:" + JSON.stringify(error));
      });
  }

  reloadPage() {
    // console.log("in reload function");
    location.reload();
  }

  deleteUser() {
    deleteUser({ contactId: this.selectedUserId })
      .then((result) => {
        this.handleDeleteSuccess();
        // console.log("delete user api data response : ", this.selectedUserId);
      })
      .catch((error) => {
        // console.log("delete User Fetching error id :" + this.selectedUserId);
        console.error("delete User Fetching error:" + JSON.stringify(error));
      });
  }

  updateUserServices(filteredCheckData) {
    updateUserServices({ con: filteredCheckData })
      .then((result) => {
        // this.handleDeleteSuccess();
        // console.log(
        //   "services update api data response : ",
        //   JSON.stringify(filteredCheckData)
        // );
      })
      .catch((error) => {
        // console.log(
        //   " Error services update api data response : ",
        //   filteredCheckData
        // );
        console.error("updateUserServices:" + JSON.stringify(error));
      });

    updatepermission({ con: filteredCheckData })
      .then((result) => {
        // this.handleDeleteSuccess();
        // console.log(
        //   "services update api data response in update permission : "
        //   // JSON.stringify(filteredCheckData)
        // );
      })
      .catch((error) => {
        // console.log(
        //   " Error services update api data response update permission: ",
        //   filteredCheckData
        // );
        console.log(
          "updatepermission input" + JSON.stringify(filteredCheckData)
        );
        console.error("updatepermission" + JSON.stringify(error));
      });
  }

  getUserAllServicesList(id) {
    getUserAllServicesList({ userId: id })
      .then((result) => {
        // console.log("services result final", result);
        // console.log("services result id", id);
        if (result == undefined || result.length == 0) {
          this.allServicesListData = ["Null"];
        } else {
          this.allServicesListData = result;

          this.checkboxFormData = {
            Basic_Service_EC_Flag__c: result[0].isActive,
            Cost_management_Flag__c: result[1].isActive,
            E_invoice_Flag__c: result[2].isActive,
            Financial_service_Flag__c: result[3].isActive,
            Online_maintenance_booking_Flag__c: result[4].isActive,
            Vehicle_management_Flag__c: result[5].isActive
          };
          // this.allServicesListDataForClass = result;
          // this.userId = result.UserId__c;
          // console.log(
          //   "all serviecs list data on Edit page(CCP2_ServicesList): ",
          //   JSON.stringify(result)
          // );
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
          // console.log("update User Successfully ", result);
          // console.log(
          //   "branches in update user",
          //   JSON.stringify(BranchIdsToAdd)
          // );
          resolve(result); // Resolve the promise on success
        })
        .catch((error) => {
          // console.log("update User error array:" + formDataArray);
          console.error("update User error:" + JSON.stringify(error));
          reject(error); // Reject the promise on error
        });
    });
  }

  getUserDetail(id) {
    getUserDetail({ User: id, refresh: this.refreshTokenInt })
      .then((result) => {
        // this.getUserAllServicesList(id);
        if (result) console.log("user detail from function : ", result , this.refreshTokenInt);

        this.userDetailData = {
          Name: result[0].Name == null ? "null" : result[0].Name,
          id: result[0].Id == null ? "null" : result[0].Id,
          email: result[0].Email == null ? "null" : result[0].Email,
          account: {
            // id: result[0].Account.Id ? 'null' : result[0].Account.Id,
            name:
              result[0].Account.Name == null ? "null" : result[0].Account.Name,
            siebelAccountCode__c:
              result[0].Account.siebelAccountCode__c == null
                ? "null"
                : result[0].Account.siebelAccountCode__c
          },
          Department:
            result[0].Department == null ? "null" : result[0].Department,
          // Branchs__r:
          //   result[0].Branchs__r == null
          //     ? [{ Name: "Null" }]
          //     : result[0].Branchs__r,
          MobilePhone:
            result[0].MobilePhone == null ? "null" : result[0].MobilePhone,
          Phone: result[0].Phone == null ? "null" : result[0].Phone,
          Title:
            !result[0].Title || result[0].Title == undefined
              ? "null"
              : result[0].Title,
          firstNameKana__c:
            result[0].firstNameKana__c == null
              ? "null"
              : result[0].firstNameKana__c,
          lastNameKana__c:
            result[0].lastNameKana__c == null
              ? "null"
              : result[0].lastNameKana__c,
          Employee_Code__c:
            result[0].Employee_Code__c == null
              ? "null"
              : result[0].Employee_Code__c
        };
        this.firstName = result[0].Name.split(" ")[1];
        this.lastName = result[0].Name.split(" ")[0];

        this.InputFirstName = this.firstName;
        this.InputLastName = this.lastName;
        this.InputFKanaName = result[0].firstNameKana__c;
        this.InputLKanaName = result[0].lastNameKana__c;
        this.InputEmail = result[0].Email;
        this.InputTelephone = result[0].Phone;
        this.InputCellPhone = result[0].MobilePhone;

        this.InputDepartment = result[0].Department;
        this.InputPost = result[0].Title;
        this.InputEmpCode = result[0].Employee_Code__c;

        // console.log("split", result[0].Name.split(" "));
        this.userDetailsLoader = false;
      })
      .catch((error) => {
        console.error("User Detail Fetching error:" + JSON.stringify(error));
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
    // this.refreshToken = !this.refreshToken;
    this.selectedContactUserId = event.target.dataset.user;
    // this.getUserServices(this.selectedContactUserId);
    // console.log("services contact user id", this.selectedContactUserId);
    this.getUserAllServicesList(this.selectedContactUserId);
    this.selectedUserId = event.target.dataset.idd;
    // this.uid = null;
    // this.uid = this.selectedUserId;
    // const tempStore = this.selectedContactUserId;
    // // this.selectedContactUserId = null;
    // this.selectedContactUserId = tempStore;
    // console.log("services contact id", this.selectedUserId);
    this.getUserDetail(this.selectedUserId);
    // console.log(
    //   "services contact id event",
    //   JSON.stringify(event.target.dataset)
    // );
    this.customerId = event.target.dataset.idd;
    this.showUserList = false;
    this.showUserDetails = true;
    this.showEditUserDetails = false;
  }

  handleReturnClick() {
    this.showUserList = true;
    this.showUserDetails = false;
    this.showEditUserDetails = false;
    this.showDeleteScreen = false;
  }

  handleReturnClick2() {
    this.reloadPage();
  }

  handleEditChange() {
    this.showUserList = false;
    this.showUserDetails = false;
    this.showEditUserDetails = true;
    this.userDetailsLoader = true;
  }

  handleInputChange(event) {
    const field = event.target.dataset.field;

    if (field) {
      if (event.target.type === "checkbox") {
        this.formData[field] = event.target.checked; // Use checked property for checkboxes
      } else {
        if (field == "姓") {
          this.InputLastName = event.target.value;
          this.contactClassLastName = this.InputLastName ? "" : "invalid-input";
        } else if (field == "名") {
          this.InputFirstName = event.target.value;
          this.contactClassFirstName = this.InputFirstName
            ? ""
            : "invalid-input";
        } else if (field == "姓（フリガナ）") {
          this.InputLKanaName = event.target.value;
          this.contactClassLKanaName = this.InputLKanaName
            ? ""
            : "invalid-input";
        } else if (field == "名（フリガナ）") {
          this.InputFKanaName = event.target.value;
          this.contactClassFKanaName = this.InputFKanaName
            ? ""
            : "invalid-input";
        } else if (field == "部署") {
          this.InputDepartment = event.target.value;
          //   this.contactClassFKanaName = this.InputFKanaName ? '' : 'invalid-input';
        } else if (field == "役職") {
          this.InputPost = event.target.value;
          //   this.contactClassFKanaName = this.InputFKanaName ? '' : 'invalid-input';
        } else if (field == "社員番号") {
          this.InputEmpCode = event.target.value;
          //   this.contactClassFKanaName = this.InputFKanaName ? '' : 'invalid-input';
        } else if (field == "メールアドレス") {
          this.InputEmail = event.target.value;
          this.contactClassEmail = this.InputEmail ? "" : "invalid-input";
        } else if (field == "電話番号") {
          const input = event.target;
          input.value = input.value.replace(/\D/g, "").slice(0, 10); // Allow only numbers and limit to 10 characters
          this.InputTelephone = event.target.value
            .replace(/\D/g, "")
            .slice(0, 10);
          // console.log("field in tele : ", this.InputTelephone);

          this.contactClassTelephone = this.InputTelephone
            ? ""
            : "invalid-input";
        } else if (field == "携帯番号") {
          const input = event.target;
          input.value = input.value.replace(/\D/g, "").slice(0, 10);
          this.InputCellPhone = event.target.value;

          this.contactClassCellPhone = this.InputCellPhone
            ? ""
            : "invalid-input";
        }

        this.formData[field] = event.target.value;
      }
    }
  }

  handleCheckInputChange(event) {
    const field = event.target.dataset.field;

    if (field) {
      if (event.target.type === "checkbox") {
        // this.checkboxFormData[field] = event.target.checked; // Use checked property for checkboxes
        // console.log('this is what i am sending out: ',JSON.stringify(this.allServicesListDataForClass))

        // this.allServicesListDataForClass[field] = event.target.checked;

        this.checkboxFormData = {
          ...this.checkboxFormData, // Copy existing values
          [field]: event.target.checked // Update the specific field with its checked state
        };
        // console.log(
        //   "this is what i am sending: ",
        //   JSON.stringify(this.checkboxFormData)
        // );
      }
    }
  }

  handleDeleteUser() {
    this.showconfModal = true;
  }

  handleYes() {
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

//   handleRefreshClick() {
//     console.log('refresh1')
//     this.refreshToken = !this.refreshToken; // Toggle refreshData to force refresh
//     if (this.refreshUserDetailWireData) {
//       console.log('refresh2')
//         refreshApex(this.refreshUserDetailWireData); // Explicitly refresh cached data
//     }
// }

  saveFormData() {
    if (
      this.InputFirstName == "" ||
      this.InputLastName == "" ||
      this.InputFKanaName == "" ||
      this.InputLKanaName == "" ||
      this.InputEmail == "" ||
      this.InputTelephone == "" ||
      this.InputCellPhone == ""
    ) {
      this.handleError();
    } else if (this.InputTelephone.length < 10) {
      this.contactClassTelephone = "invalid-input";
      this.handleValidationError();
    } else if (this.InputCellPhone.length < 10) {
      this.contactClassCellPhone = "invalid-input";
      this.handleValidationError();
    } else {
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
          await this.updateUser(filteredData);
          await this.updateUserServices(filteredCheck);
          await this.branchdeleteAdd();

        //  this.handleRefreshClick();
          
          // let temp = this.selectedUserId;
          // this.selectedUserId = temp;
          this.refreshTokenInt = ++this.refreshTokenInt;
          this.getUserDetail(this.selectedUserId)
          console.log(
            "refresh , selectedUserId in save form",
            this.refreshTokenInt,
            this.selectedUserId
          );
          setTimeout(async () => {
            // await this.getUserDetail(this.selectedUserId);
            this.handleSuccess();
            // Ensure changes are reflected in UI
            this.showUserList = false;
            this.userDetailsLoader = false;
          }, 2000);

          // this.userDetailsLoader = true;
        } catch (error) {
          console.error("Error updating user:", error);
          this.handleValidationError();
        }
      };

      asyncFunction();
    }
  }

  handleSuccess() {
    const evt = new ShowToastEvent({
      title: "Success",
      message: "Record edited successfully",
      variant: "success"
    });
    this.dispatchEvent(evt);
  }

  handleDeleteSuccess() {
    const evt = new ShowToastEvent({
      title: "Success",
      message: "User deleted successfully",
      variant: "success"
    });
    this.dispatchEvent(evt);
  }

  handleError() {
    const evt = new ShowToastEvent({
      title: "Error",
      message: "Please fill in all required fields",
      variant: "error"
    });
    this.dispatchEvent(evt);
  }

  handleValidationError() {
    const evt = new ShowToastEvent({
      title: "Error",
      message: "Please fill a valid value",
      variant: "error"
    });
    this.dispatchEvent(evt);
  }

  /*Custom JS*/
  @track branchoptions = [];
  @track searchTerm = "";
  @track branch = [];

  @wire(getbranchdetails, { contactId: "$selectedUserId" }) wiredBranches({
    data,
    error
  }) {
    if (data) {
      // console.log("")
      // console.log("B changed data", data);
      // console.log("branches", data);
      this.branchoptions = data.map((vehicle) => {
        return { label: vehicle.Name, value: vehicle.Id };
      });
      // console.log("branchdata", JSON.stringify(this.branchoptions));
    } else if (error) {
      console.error(error);
    }
  }

  handleSearch(event) {
    this.searchTerm = event.target.value.toLowerCase();
  }

  handlebranChange(event) {
    //console.log('employee', this.contactInputData);
    event.stopPropagation();
    this.showlist = !this.showlist;
    if (this.branchoptions.length === 0) {
      this.showlist = false;
    }
  }
  @track showlist = false;

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
    this.selectbranchId = event.currentTarget.dataset.id;
    // console.log("selected b id", JSON.stringify(this.selectbranchId));
    this.handlebranchChange();
  }

  @track deletedBranchIds = [];

  handleDeleteBranch(event) {
    const vehicleId = event.currentTarget.dataset.id;
    // console.log("ddeventmain", JSON.stringify(vehicleId));

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
      // console.log("Vehicle re-added to selection list from `vehicle` array:", JSON.stringify(this.vehicles));
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
      //console.log("Vehicle re-added to selection list from `morevehicles` array:", JSON.stringify(this.branchfromjunction));
    }
    // console.log("ddevent", JSON.stringify(vehicleId));
    this.deletedBranchIds.push(vehicleId);
    // console.log("dd1", JSON.stringify(this.deletedBranchIds));
    // console.log("dd2", JSON.stringify(this.branchfromjunction));
    // console.log("dd3", JSON.stringify(this.branch));

    this.branch = this.branch.filter((veh) => veh.Id !== vehicleId);
    // console.log("ddbranchafterdeletion", JSON.stringify(this.branch));
    this.branchfromjunction = this.branchfromjunction.filter(
      (veh) => veh.Id !== vehicleId
    );
    // console.log("ddlast", JSON.stringify(this.branchfromjunction));

    // Add the deleted branch back to another array if needed

    // Clear the selected branch ID
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
      // console.log("Clicked outside");
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
    // this.selectbranchId = event.detail.value;
    let selectedBranch = "";
    for (let i = 0; i < this.branchoptions.length; i++) {
      if (this.branchoptions[i].value === this.selectbranchId) {
        selectedBranch = this.branchoptions[i];
        // console.log("options", this.branchoptions);
        this.branchoptions = this.branchoptions.filter(
          (bran) => bran.value !== this.selectbranchId
        );
        // console.log("options2", this.branchoptions);
        break;
      }
    }
    if (selectedBranch) {
      // console.log("selectedBranch", selectedBranch);
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
}

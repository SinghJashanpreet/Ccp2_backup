import { LightningElement, track, api, wire } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { loadStyle } from "lightning/platformResourceLoader";
import pureCss from "@salesforce/resourceUrl/pure";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getBranchData from "@salesforce/apex/CCP2_userData.NewBranchDetails";
import getNullVehicles from "@salesforce/apex/CCP2_userData.VehicleWithoutAssociationDtl";
import deleteVehicles from "@salesforce/apex/CCP2_userData.unassociateVehicle";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import AddVehicle from "@salesforce/apex/CCP2_userData.associateVehicle";
import UserList from "@salesforce/apex/CCP2_userData.userListDtl";
import AddUser from "@salesforce/apex/CCP2_userData.associateUser";
import deleteUser from "@salesforce/apex/CCP2_userData.unassociateUser";
import UpdateFields from "@salesforce/apex/CCP2_branchController.updateBranchById";
import deletebranch from "@salesforce/apex/CCP2_branchController.deleteBranchById";
import labelsBranch from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";
const arrowicon =
  Vehicle_StaticResource + "/CCP2_Resources/Common/arrow_under.png";

export default class Ccp2BranchRecordDetail extends LightningElement {
  backgroundImagePC = BACKGROUND_IMAGE_PC;
  @track showDetails = true;
  @track showCancelModal = false;
  @api branchId;
  @track showlist = false;
  @track CompanyName = "";
  @track TipNumber = "";
  @track BranchNumber = "";
  @track originalBranchName = "";
  @track MentionName = "";
  @track Address = "";
  @track Contact = "";
  @track fullwidthnum = false;
  @track OriginalAddress = "";
  @track OriginalContact = "";
  @track originalMunicipalities = "";
  @track originalBuildingName = "";
  @track originalPostalCode = "";
  @track originalPrefecture = "";
  @track originalStreetAddress = "";
  @track vehicle = [];
  @track contacts = [];
  @track branchName = "";
  @track deletedVehicleIds = [];
  @track deletedContactIds = [];
  @track showSpinner = false;
  @track vehicles = [];
  @track selectedVehicleId = "";
  @track morevehicles = [];
  @track moreContacts = [];
  @track selectedContactId = "";
  @track optcontacts = [];
  @track vehicleIds = [];
  @track originalVehicle = [];
  @track originalContacts = [];
  @track showUserOpt = false;
  @track vehicletoPush = this.morevehicles;
  //for validations in inputs
  @track branchNameClass = "";
  @track addressClass = "";
  @track contactClass = "";
  @track opts = true;
  @track main = true;
  outsideClickHandlerAdded = false;
  @track selectedLabels = "";
  searchTerm = "";
  imgdrop = arrowicon;
  @track showList = false;
  @track showsure = false;
  @track combinedAddress = "";
  @track postalCode = "";
  @track prefectures = "";
  @track municipalities = "";
  @track streetAddress = "";
  @track buildingName = "";
  @track siebelcode = "";
  @track showModal = false;
  @track showerrorbranch = false;
  @track showerrorbranchNull = false;

  @wire(getBranchData, { branchId: "$branchId" })
  wiredBranchData(result) {
    this.branchData = result;
    if (result.data) {
      this.processBranchData(result.data);
      this.showSpinner = false;
      console.log("datanew", result.data);
    } else if (result.error) {
      console.error(result.error);
      this.showSpinner = false;
    }
  }

  processBranchData(data) {
    const branch = data.BranchDetails;

    this.CompanyName = branch.Account.AccountName || "-";
    this.Address = branch.Address || null;
    this.Contact = branch.ContactNo || null;
    this.branchName = branch.Name || "-";
    this.postalCode = branch.PostalCode || null;
    this.prefectures = branch.Prefecture || null;
    this.municipalities = branch.municipalities || null;
    this.streetAddress = branch.streetAddress || null;
    this.buildingName = branch.BuldingName || null;
    this.siebelcode = branch.Account.siebelAccountCode__c;
    this.BranchNumber = this.formatBranchNumber(branch.BranchNo) || "-";

    this.combinedAddress = [
      this.postalCode,
      this.prefectures,
      this.municipalities,
      this.streetAddress,
      this.buildingName
    ]
      .filter((part) => part)
      .join(" ");

    this.originalBranchName = branch.Name;
    this.OriginalContact = branch.ContactNo;
    this.originalBuildingName = branch.BuldingName;
    this.originalMunicipalities = branch.municipalities;
    this.originalPostalCode = branch.PostalCode;
    this.originalPrefecture = branch.Prefecture;
    this.originalStreetAddress = branch.streetAddress;

    this.contacts = data.Contacts.map((contact) => ({
      Name: contact.Name,
      Id: contact.Id
    }));

    this.originalContacts = data.Contacts.map((contact) => ({
      Name: contact.Name,
      Id: contact.Id
    }));
    console.log("con", JSON.stringify(this.originalContacts));

    this.vehicle = data.Vehicles.map((vehicle) => ({
      Name: vehicle.Name,
      Id: vehicle.Id
    }));
    this.originalVehicle = data.Vehicles.map((vehicle) => ({
      Name: vehicle.Name,
      Id: vehicle.Id
    }));
  }
  formatBranchNumber(branchCount) {
    let count;
    if (branchCount != null) {
      count = branchCount;
      if (count < 100) {
        return `00${count}`;
      } else if (count >= 100 && count < 1000) {
        return `0${count}`;
      }
    }
    return `${count}`;
  }

  showModalAndRefresh() {
    this.showModal = true;
    setTimeout(() => {
      this.showModal = false;
      refreshApex(this.branchData);
    }, 2000);
  }

  //get null
  get hasContact() {
    return (
      this.Contact !== null &&
      this.Contact !== undefined &&
      this.Contact.trim() !== ""
    );
  }
  get hasCombinedAddress() {
    // Return true if at least one part is present
    return ![
      this.postalCode,
      this.prefectures,
      this.municipalities,
      this.streetAddress,
      this.buildingName
    ].every((part) => !part || part.trim() === "");
  }
  get hasVehicles() {
    return Array.isArray(this.vehicle) && this.vehicle.length > 0;
  }
  get hasUsers() {
    return Array.isArray(this.contacts) && this.contacts.length > 0;
  }
  get hasPostalAddress() {
    return this.postalCode !== null && this.postalCode !== undefined;
  }

  handlevehChange(event) {
    event.stopPropagation();
    this.showlist = !this.showlist;
    if (this.vehicles.length === 0) {
      this.showlist = false;
    }
  }

  handleConChange(event) {
    event.stopPropagation();
    this.showList = !this.showList;
    if (this.optcontacts.length === 0) {
      this.showList = false;
    }
  }

  handleInsideClick(event) {
    event.stopPropagation();
  }

  get hasContacts() {
    return this.contacts.length > 0 || this.moreContacts.length > 0;
  }

  get hasVehicles() {
    return this.vehicle.length > 0 || this.morevehicles.length > 0;
  }

  @wire(getNullVehicles, { branchId: "$branchId" }) wiredVehicles({
    data,
    error
  }) {
    if (data) {
      // Create a Set of existing vehicle IDs for quick lookup
      this.vehicles = data.map((vehicle) => {
        return { label: vehicle.Name, value: vehicle.Id };
      });
      console.log("newv", data);

      // Debug logs
    } else if (error) {
      console.error(error);
    }
  }
  @wire(UserList, { branchId: "$branchId" }) wiredUsers({ data, error }) {
    if (data) {
      this.optcontacts = data.map((contact) => {
        return { label: contact.Name, value: contact.Id };
      });
    } else if (error) {
      console.error(error);
    }
  }

  connectedCallback() {
    this.loadI18nextLibrary()
      .then(() => {
        this.loadLabels(); // Now you can safely load the labels after i18next is loaded
      })
      .catch((error) => {
        console.error("Error loading i18next library: ", error);
      });
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    this.template.host.style.setProperty(
      "--dropdown-icon",
      `url(${this.imgdrop})`
    );

    this.showSpinner = true;
    loadStyle(this, pureCss)
      .then(() => {
        console.log("Pure CSS loaded successfully");
      })
      .catch((error) => {
        console.error("Error loading Pure CSS", error);
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
            console.log("Branch Detail User Locale: ", userLocale);
            console.log("Branch Detail User Labels: ", this.labels2);
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
      });
  }

  getLocale() {
    const region = Intl.DateTimeFormat().resolvedOptions().locale;
    return region === "ja" ? "jp" : "en";
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
  handleOutsideClick2 = (event) => {
    const dataDropElement = this.template.querySelector(".dataDrop2");
    const listsElement = this.template.querySelector(".lists2");

    if (
      dataDropElement &&
      !dataDropElement.contains(event.target) &&
      listsElement &&
      !listsElement.contains(event.target)
    ) {
      this.showList = false;
    }
  };

  renderedCallback() {
    if (!this.outsideClickHandlerAdded) {
      document.addEventListener("click", this.handleOutsideClick.bind(this));
      document.addEventListener("click", this.handleOutsideClick2.bind(this));
      this.outsideClickHandlerAdded = true;
    }
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
    document.removeEventListener("click", this.handleOutsideClick2.bind(this));
  }

  handleChange() {
    refreshApex(this.branchData);
    this.showDetails = !this.showDetails;
  }

  handleDeleteVehicle(event) {
    const vehicleId = event.currentTarget.dataset.id;

    const deletedVehicleFromVehicleArray = this.vehicle.find(
      (veh) => veh.Id === vehicleId
    );
    if (deletedVehicleFromVehicleArray) {
      this.vehicles = [
        ...this.vehicles,
        {
          label: deletedVehicleFromVehicleArray.Name,
          value: deletedVehicleFromVehicleArray.Id
        }
      ];
    }

    const deletedVehicleFromMoreVehiclesArray = this.morevehicles.find(
      (veh) => veh.Id === vehicleId
    );
    if (
      deletedVehicleFromMoreVehiclesArray &&
      !deletedVehicleFromVehicleArray
    ) {
      this.vehicles = [
        ...this.vehicles,
        {
          label: deletedVehicleFromMoreVehiclesArray.Name,
          value: deletedVehicleFromMoreVehiclesArray.Id
        }
      ];
    }

    this.deletedVehicleIds.push(vehicleId);

    this.vehicle = this.vehicle.filter((veh) => veh.Id !== vehicleId);
    this.morevehicles = this.morevehicles.filter((veh) => veh.Id !== vehicleId);
    this.selectedVehicleId = "";
  }

  //on clicking on cross button in contacts div in edit page
  handleDeleteContact(event) {
    const contactId = event.currentTarget.dataset.id;

    const deletedContactFromContactsArray = this.contacts.find(
      (contact) => contact.Id === contactId
    );
    if (deletedContactFromContactsArray) {
      this.optcontacts = [
        ...this.optcontacts,
        {
          label: deletedContactFromContactsArray.Name,
          value: deletedContactFromContactsArray.Id
        }
      ];
    }

    const deletedContactFromMoreContactsArray = this.moreContacts.find(
      (contact) => contact.Id === contactId
    );
    if (
      deletedContactFromMoreContactsArray &&
      !deletedContactFromContactsArray
    ) {
      this.optcontacts = [
        ...this.optcontacts,
        {
          label: deletedContactFromMoreContactsArray.Name,
          value: deletedContactFromMoreContactsArray.Id
        }
      ];
    }

    this.deletedContactIds.push(contactId);

    this.contacts = this.contacts.filter((contact) => contact.Id !== contactId);
    this.moreContacts = this.moreContacts.filter(
      (contact) => contact.Id !== contactId
    );

    this.selectedContactId = "";
  }

  callbranchDelete() {
    this.main = false;
    this.showsure = false;
    window.scrollTo(0, 0);
  }

  checkAndDeleteBranch() {
    if (this.vehicle.length === 0 && this.contacts.length === 0) {
      this.showSpinner = true;
      this.showsure = false;
      this.deletebranch();
    } else {
      this.callbranchDelete();
    }
  }

  //on Saving the data on edit page
  async handleSave() {
    try {
      const branchInput = this.template.querySelector('input[name="branch"]');

      const phoneInput = this.template.querySelector(
        'input[name="contactNumber"]'
      );
      let allValid = true;
      // Validate the branch input
      if (!branchInput.value) {
        branchInput.classList.add("invalid-input");
        window.scrollTo(0, 0);
        this.dispatchEvent(
          new ShowToastEvent({
            title: "エラー",
            message: "必須項目を入力してください。",
            variant: "error"
          })
        );
        this.showerrorbranchNull = true;
        this.showerrorbranch = false;
        allValid = false;
      } else if (branchInput.value.length > 24) {
        branchInput.classList.add("invalid-input");
        window.scrollTo(0, 0);
        this.showerrorbranch = true;
        this.showerrorbranchNull = false;
        allValid = false;
      } else {
        branchInput.classList.remove("invalid-input");
        phoneInput.classList.remove("invalid-input");
        this.showerrorbranch = false;
        this.showerrorbranchNull = false;
      }

      if (!allValid) {
        return;
      }

      const actions = [];
      if (this.deletedVehicleIds.length > 0) {
        actions.push(
          deleteVehicles({
            vehicles: this.deletedVehicleIds,
            branchId: this.branchId
          })
        );
      }

      if (this.deletedContactIds.length > 0) {
        actions.push(
          deleteUser({
            Contact: this.deletedContactIds,
            branchId: this.branchId
          })
        );
      }

      if (actions.length > 0) {
        Promise.all(actions);
      }

      if (this.morevehicles.length > 0) {
        const vehicleIdsToAdd = this.morevehicles.map((vehicle) => vehicle.Id);
        actions.push(
          AddVehicle({ vehicles: vehicleIdsToAdd, branch: this.branchId })
        );
      }

      if (this.moreContacts.length > 0) {
        const ContactIdsToAdd = this.moreContacts.map((vehicle) => vehicle.Id);
        actions.push(
          AddUser({ Contact: ContactIdsToAdd, branch: this.branchId })
        );
      }

      if (
        this.branchName !== this.originalBranchName ||
        this.Address !== this.originalAddress ||
        this.Contact !== this.originalContact ||
        this.municipalities !== this.originalMunicipalities ||
        this.streetAddress !== this.originalStreetAddress ||
        this.buildingName !== this.originalBuildingName ||
        this.prefectures !== this.originalPrefecture ||
        this.postalCode !== this.originalPostalCode
      ) {
        actions.push(
          UpdateFields({
            branchId: this.branchId,
            branchName: this.branchName,
            contactNo: this.Contact,
            postalCode: this.postalCode,
            Prefecture: this.prefectures,
            municipalities: this.municipalities,
            streetAddress: this.streetAddress,
            BuldingName: this.buildingName
          })
        );
      }
      if (actions.length > 0) {
        console.log("Actions length:", actions.length);
        await Promise.all(actions);
        console.log("success in edit");
        this.goTodetail();
        this.moreContacts = [];
        this.morevehicles = [];
        this.showModalAndRefresh();
      } else {
        console.log("going");
        this.dispatchEvent(
          new ShowToastEvent({
            //title: 'No Changes',
            message: "保存する変更はありません",
            variant: "info"
          })
        );
        this.goTodetail();
      }
    } catch (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          // title: 'Error',
          message: error.body
            ? `${error.body.message}`
            : "変更を保存できませんでした",
          variant: "error"
        })
      );
    }
  }
  handleSearch(event) {
    this.searchTerm = event.target.value.toLowerCase();
  }
  get filteredVehicles() {
    if (!this.searchTerm) {
      return this.vehicles;
    }
    const filtered = this.vehicles.filter((veh) => {
      return veh.label.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
    if (filtered.length === 0) {
      return [{ label: "見つかりません", value: "no_results" }];
    }
    return filtered;
  }

  searchTermCon;
  handleSearchCon(event) {
    this.searchTermCon = event.target.value.toLowerCase();
  }
  get filteredContacts() {
    if (!this.searchTermCon) {
      return this.optcontacts;
    }
    const filtered = this.optcontacts.filter((contact) => {
      return contact.label
        .toLowerCase()
        .includes(this.searchTermCon.toLowerCase());
    });
    if (filtered.length === 0) {
      return [{ label: "見つかりません", value: "no_results" }];
    }
    return filtered;
  }

  //on adding of vehicles
  handleVehicleSelect(event) {
    this.selectedVehicleId = event.currentTarget.dataset.id;
    this.handleVehicleChange();
  }
  closeList() {
    this.showlist = false;
  }
  suremodal() {
    this.showsure = true;
  }
  closesure() {
    this.showsure = false;
  }

  handleVehicleChange() {
    let selectedVehicle = "";
    for (let i = 0; i < this.vehicles.length; i++) {
      if (this.vehicles[i].value === this.selectedVehicleId) {
        selectedVehicle = this.vehicles[i];
        this.vehicles = this.vehicles.filter(
          (veh) => veh.value !== this.selectedVehicleId
        );
        break;
      }
    }
    if (selectedVehicle) {
      this.morevehicles.push({
        Id: selectedVehicle.value,
        Name: selectedVehicle.label
      });
    }
    this.selectedVehicleId = null;
    if (this.vehicles.length === 0) {
      this.showlist = false;
    }
  }
  //on adding of contacts
  handleContactSelect(event) {
    this.selectedContactId = event.currentTarget.dataset.id;
    this.handleContactChange();
  }
  handleContactChange() {
    let selectedContact = "";
    for (let i = 0; i < this.optcontacts.length; i++) {
      if (this.optcontacts[i].value === this.selectedContactId) {
        selectedContact = this.optcontacts[i];
        this.optcontacts.splice(i, 1);
        break;
      }
    }
    if (selectedContact) {
      this.moreContacts.push({
        Id: selectedContact.value,
        Name: selectedContact.label
      });
    }
    this.selectedContactId = null;
    if (this.optcontacts.length === 0) {
      this.showList = false;
    }
  }

  //for edit page Inputs
  handleBranchChange(event) {
    this.branchName = event.target.value;
    console.log("1br", this.branchName);
  }

  handlevalidationpostal(event) {
    const input = event.target; // Get the input element from the event
    const onlyDigitsRegex = /^[0-9０-９]*$/;
    // Clean the input value to allow only digits
    let cleanValue = [...input.value]
      .filter((char) => onlyDigitsRegex.test(char)) // Keep only numeric characters
      .slice(0, 6) // Limit to the first 6 characters
      .join(""); // Join characters back into a string

    // Update the input field with the cleaned value
    input.value = cleanValue;
    this.postalCode = cleanValue;
  }

  onInputValidationAll(event) {
    let value = event.target.value;
    if (event.target.value.length > 12) {
        event.target.value = value.slice(0, 12);
    }
  }

  handlePrefectureChange(event) {
    this.prefectures = event.target.value;
    // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
  }
  handlemunicipalitiesChange(event) {
    this.municipalities = event.target.value;
    // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
  }
  handleStreetChange(event) {
    this.streetAddress = event.target.value;
    // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
  }
  handlebuildingChange(event) {
    this.buildingName = event.target.value;
    // this.addressClass = this.Address ? '' : 'invalid-input'; @not used but in future if need
  }

  closesystem() {
    this.main = true;
    window.scrollTo(0, 0);
  }

  handleContactNoChange(event) {
    this.Contact = event.target.value;
    const input = event.target;
    const cleanedPhone = input.value.replace(/[^\d０-９]/g, "").slice(0, 11);
    this.Contact = cleanedPhone;
  }

  //contact input validation
  handleInput(event) {
    const input = event.target;
    input.value = input.value.replace(/[^\d０-９]/g, "").slice(0, 11);
    this.Contact = input.value;
  }

  //function to redirect to branch page
  goToMain() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      let addBranchUrl = baseUrl.split("/s/")[0] + "/s/branchmangement";
      window.location.href = addBranchUrl;
    }
  }

  //going to detail page
  goTodetail() {
    this.showDetails = !this.showDetails;
    window.scrollTo(0, 0);
  }

  //on deleting the branch(Whole branch removed)
  deletebranch() {
    deletebranch({ branchId: this.branchId })
      .then(() => {
        try {
          this.showSpinner = false;
          this.goToMain();
          this.dispatchEvent(
            new ShowToastEvent({
              message: "ブランチが正常に削除されました",
              variant: "success"
            })
          );
        } catch (error) {
          this.showSpinner = false;
          this.dispatchEvent(
            new ShowToastEvent({
              message:
                "ブランチの削除中にエラーが発生しました:" + error.message,
              variant: "error"
            })
          );
        }
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            //title: 'Error',
            message:
              "ブランチの削除中にエラーが発生しました:" + error.body.message,
            variant: "error"
          })
        );
      });
  }

  handleSelectionChange(event) {
    const vehicleId = event.target.value;
    const isSelected = event.target.checked;

    this.vehicles = this.vehicles.map((vehicle) => {
      if (vehicle.value === vehicleId) {
        return { ...vehicle, selected: isSelected };
      }
      return vehicle;
    });

    this.updateSelectedLabels();
  }

  updateSelectedLabels() {
    this.selectedLabels = this.vehicles
      .filter((vehicle) => vehicle.selected)
      .map((vehicle) => vehicle.label)
      .join(", ");
  }

  saveSelections() {
    this.updateSelectedLabels();
    this.toggleDropdown();
  }
  handleCancel() {
    this.showCancelModal = true;
  }
  handleNo() {
    this.showCancelModal = false;
  }
  handleYes() {
    this.branchName = "";
    this.postalCode = "";
    this.Contact = "";
    this.prefectures = "";
    this.municipalities = "";
    this.streetAddress = "";
    this.buildingName = "";
    this.morevehicles.forEach((morevehicle) => {
      this.vehicles.push({ label: morevehicle.Name, value: morevehicle.Id });
    });
    this.morevehicles = [];
    this.moreContacts.forEach((morevehicle) => {
      this.optcontacts.push({ label: morevehicle.Name, value: morevehicle.Id });
    });
    this.moreContacts = [];
    this.originalVehicle.forEach((originalVehicle) => {
      const isVehicleInList = this.vehicle.some(
        (vehicle) =>
          vehicle.Id === originalVehicle.Id &&
          vehicle.Name === originalVehicle.Name
      );
      if (!isVehicleInList) {
        this.vehicle.push({
          Name: originalVehicle.Name,
          Id: originalVehicle.Id
        });
      }
    });

    this.originalContacts.forEach((originalContact) => {
      const isContactInList = this.contacts.some(
        (contact) =>
          contact.Id === originalContact.Id &&
          contact.Name === originalContact.Name
      );
      if (!isContactInList) {
        this.contacts.push({
          Name: originalContact.Name,
          Id: originalContact.Id
        });
      }
    });

    this.compareAndRemoveCommonValues();

    this.branchName = this.originalBranchName ? this.originalBranchName : null;
    this.Contact = this.OriginalContact ? this.OriginalContact : null;
    this.postalCode = this.originalPostalCode ? this.originalPostalCode : null;
    this.prefectures = this.originalPrefecture ? this.originalPrefecture : null;
    this.municipalities = this.originalMunicipalities
      ? this.originalMunicipalities
      : null;
    this.streetAddress = this.originalStreetAddress
      ? this.originalStreetAddress
      : null;
    this.buildingName = this.originalBuildingName
      ? this.originalBuildingName
      : null;
    this.showCancelModal = false;
    this.showerrorbranch = false;
    this.showerrorbranchNull = false;
    this.showDetails = true;
  }

  compareAndRemoveCommonValues() {
    const filteredVehicles = [];
    const filteredContacts = [];

    // Filter vehicles by checking against optcontacts
    for (let vehicle of this.vehicles) {
      let isCommon = false;
      for (let contact of this.vehicle) {
        if (vehicle.label === contact.Name && vehicle.value === contact.Id) {
          isCommon = true;
          break;
        }
      }
      if (!isCommon) {
        filteredVehicles.push(vehicle);
      }
    }

    // Filter optcontacts by checking against vehicles
    for (let contact of this.optcontacts) {
      let isCommon = false;
      for (let vehicles of this.contacts) {
        if (contact.label === vehicles.Name && contact.value === vehicles.Id) {
          isCommon = true;
          break;
        }
      }
      if (!isCommon) {
        filteredContacts.push(contact);
      }
    }

    // Update the arrays with filtered data
    this.vehicles = filteredVehicles;
    this.optcontacts = filteredContacts;
  }

  //validations
  handlevalchange(event) {
    const maxLength = event.target.maxLength;
    let value = event.target.value;
    if (value.length > maxLength) {
      event.target.value = value.substring(0, maxLength);
    }
  }
}

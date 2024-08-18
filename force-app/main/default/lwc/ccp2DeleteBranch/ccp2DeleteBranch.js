import { LightningElement,track,wire,api } from 'lwc';
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import branchesList from '@salesforce/apex/CCP2_VehicleManagment.branchExceptMine';
import vehList from '@salesforce/apex/CCP2_VehicleManagment.getVehicleByBranch';
import UserList from '@salesforce/apex/CCP2_VehicleManagment.getContactByBranch';
import InsertvehList from '@salesforce/apex/CCP2_VehicleManagment.insertBranchVehicleJunctions';
import InsertUserList from '@salesforce/apex/CCP2_VehicleManagment.insertBranchContactJunctions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deletebranch from '@salesforce/apex/CCP2_branchController.deleteBranchById';






const BACKGROUND_IMAGE_PC = Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.png";
const ImageStepOne = Vehicle_StaticResource + "/CCP2_Resources/Branch/step1del.png";
const ImageStepTwo = Vehicle_StaticResource + "/CCP2_Resources/Branch/step2del.png";
const ImageStepThird = Vehicle_StaticResource + "/CCP2_Resources/Branch/step3del.png";
const  arrowicon = Vehicle_StaticResource + '/CCP2_Resources/Common/arrow_under.png';
const   AddIcon = Vehicle_StaticResource + '/CCP2_Resources/Vehicle/AddIcons.png';

export default class Ccp2DeleteBranch extends LightningElement {
    backgroundImagePC = BACKGROUND_IMAGE_PC;
    stepOnePicture = ImageStepOne;
    stepTwoPicture = ImageStepTwo;
    stepThirdPicture = ImageStepThird;
    ArrowIcon = arrowicon;
    addButton = AddIcon;
    
    

    //branchIdMain
    @api branchId;

    //show variables 
    @track firstStep = true;
    @track SecondStep = false;
    @track ThirdStep = false; 
    // @track firstStep = true;
    // @track firstStep = true;
    @track validwork = false;

    //arrays
    @track branchList = [];
    @track vehicleList = [];
    @track ContactList = [];
    @track vehicleIds = [];
    @track branchestoVehicle = [];
    @track branchestoVehicleLabel = [];
    @track branchestoUser = [];
    @track branchestoUserLabel = [];
    @track selectedValueCon = ''; 
    @track showsure = false;
    @track pagestoggle = true;
    outsideClickHandlerAdded = false;
    @track formLoader = false; 
    @track showmissing = false;

    @track sections = [
        {
            id: 1,
            selectedbranchNameForVehicle: '',
            showlist: false,
            selectedValue: '',
            selectedBranchVehicles: new Map()
        }
    ];
    @track sectionUser = [
        {
            id: 1,
            selectedContactNameForVehicle: '',
            showconlist: false,
            selectedValueCon: '',
            selectedBranchUser: new Map()
        }
    ];

    get hasValidSelection() {
        let hasBranchSelection = false;
        let hasValidVehicleSelection = false;
        let hasValidUserSelection = false;

        for (let section of this.sections) {
            if (section.selectedValue) {
                hasBranchSelection = true;
                const vehicles = section.selectedBranchVehicles.get(section.selectedValue);
                if (vehicles && vehicles.length > 0) {
                    hasValidVehicleSelection = true;
                }
            }
        }

        for (let section of this.sectionUser) {
            if (section.selectedValueCon) {
                hasBranchSelection = true;
                const users = section.selectedBranchUser.get(section.selectedValueCon);
                if (users && users.length > 0) {
                    hasValidUserSelection = true;
                }
            }
        }

        if (hasBranchSelection && !hasValidVehicleSelection && !hasValidUserSelection) {
            return false;
        }

        
        return hasBranchSelection && (hasValidVehicleSelection || hasValidUserSelection);
    }
    connectedCallback(){
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        document.head.appendChild(link);
        this.template.host.style.setProperty('--dropdown-icon', `url(${this.ArrowIcon})`);
        requestAnimationFrame(() => {
            this.addCustomStyles();
        });
        console.log(this.branchId);

        this.sections.forEach(section => {
            if (section.selectedValue === this.branchId) {
                section.selectedValue = null;
            }
        });
        document.addEventListener('click', this.handleOutsideClick);
        document.addEventListener('click', this.handleOutsideClick2);
    }
    closemodalYes(){
        this.showmissing = false;
    }

    handleOutsideClick = (event) => {
       
        this.sections = this.sections.map(section => {
            const dataDropElement = this.template.querySelector(`.Inputs1`);
            
            const listsElement = this.template.querySelector(`.lists2`);
           
            if (
                dataDropElement &&
                !dataDropElement.contains(event.target) &&
                listsElement &&
                !listsElement.contains(event.target)
            ) {
                return { ...section, showlist: false };
                
            } else {
                return section;
            }
        });
    };

    handleOutsideClick2 = (event) => {
        
        this.sectionUser = this.sectionUser.map(section => {
            const dataDropElement = this.template.querySelector(`.Inputs1`);
            
            const listsElement = this.template.querySelector(`.lists2`);
            
            if (
                dataDropElement &&
                !dataDropElement.contains(event.target) &&
                listsElement &&
                !listsElement.contains(event.target)
            ) {
                return { ...section, showconlist: false };
                
            } else {
                return section;
            }
        });
    };


    updateCheckboxStates() {
        this.sections.forEach((section, sectionIndex) => {
            const selectedValue = section.selectedValue;
            const vehicleIds = section.selectedBranchVehicles.get(selectedValue) || [];

            // Query checkboxes based on section ID and vehicle ID
            vehicleIds.forEach(vehicleId => {
                const checkboxes = this.template.querySelectorAll(`input[data-id="${vehicleId}"][data-section-id="${sectionIndex}"]`);
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
            });
        });
    }
    
    updateCheckboxStatesForUsers() {
        this.sectionUser.forEach((section, sectionIndex) => {
            const selectedValue = section.selectedValueCon;
            const userIds = section.selectedBranchUser.get(selectedValue) || [];

            userIds.forEach(userId => {
                const checkboxes = this.template.querySelectorAll(`input[data-id="${userId}"][data-section-id="${sectionIndex}"]`);
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
            });
        });
    }
    renderedCallback() {
        this.updateCheckboxStates();
        this.updateCheckboxStatesForUsers();
        if (!this.outsideClickHandlerAdded) {
            document.addEventListener('click', this.handleOutsideClick);
            document.addEventListener('click', this.handleOutsideClick2);
            this.outsideClickHandlerAdded = true;
            console.log("workingclick");
        }
    }
    

    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('click', this.handleOutsideClick2);
    }

    get selectedvaluelength() {
        return this.sections.some(section => section.selectedbranchNameForVehicle && section.selectedbranchNameForVehicle.trim() !== '');
    }

    get isCheckboxDisabled() {
        // Determine if checkboxes should be disabled based on selectedvaluelength
        return !this.selectedvaluelength;
    }

    @wire(branchesList,{branchId:'$branchId'}) 
    branchs({ data, error }) {
        if (data) {
            this.branchList = data.map(branches => {
                return { label: branches.Name, value: branches.Id };});
            console.log("branchlist", data);
        } else if (error) {
            console.error("error", error);
        }
    }


    @wire(vehList,{branchId:'$branchId'}) 
    vehicle({ data, error }) {
        if (data) {
            this.vehicleList = data.map(vehicle => {
                return { label: vehicle.Name, value: vehicle.Id};});
            console.log("vehlist", data);
        } else if (error) {
            console.error("error", error);
        }
    }

    @wire(UserList,{branchId:'$branchId'}) 
    users({ data, error }) {
        if (data) {
            this.ContactList = data.map(Contact => {
                return { label: Contact.Name, value: Contact.Id, checked: false};});
            console.log("Conlist", data);
        } else if (error) {
            console.error("error", error);
        }
    }

    handleAddNewSection() {
        this.sections.push({
            id: this.sections.length + 1,
            selectedbranchNameForVehicle: '',
            showlist: false,
            selectedValue: '',
            selectedBranchVehicles: new Map()
        });
    }

    handleAddNewSectionUser() {
        this.sectionUser.push({
            id: this.sectionUser.length + 1,
            selectedContactNameForVehicle: '',
            showconlist: false,
            selectedValueCon: '',
            selectedBranchUser: new Map()
        });
    }

    handleConChange(event) {
        event.stopPropagation();
        const sectionId = event.target.dataset.id;
        this.sectionUser[sectionId].showconlist = !this.sectionUser[sectionId].showconlist;
        if (this.branchList.length === 0) {
            this.sectionUser[sectionId].showconlist = false;
        }
    }
   
    handlevehChange(event){
        event.stopPropagation();
        const sectionId = event.target.dataset.id;
        this.sections[sectionId].showlist = !this.sections[sectionId].showlist;
        if (this.branchList.length === 0) {
            this.sections[sectionId].showlist = false;
        }
    }

    handleContactSelect(event) {
        const sectionId = event.currentTarget.dataset.sectionId;
        const selectedId = event.currentTarget.dataset.id;
        const selectedBranch = this.branchList.find(item => item.value === selectedId);
    
        if (selectedBranch) {
           
            const previousSelectedValue = this.sections[sectionId].selectedValue;
            const previousVehicleIds = this.sections[sectionId].selectedBranchVehicles.get(previousSelectedValue) || [];
            
            // Check if the selected branch is already selected in any other section
            const isBranchAlreadySelected = Object.values(this.sections)
                .some(section => section.selectedValue === selectedBranch.value);
            
            if (isBranchAlreadySelected && previousSelectedValue !== selectedBranch.value) {
                
                this.dispatchEvent(
                    new ShowToastEvent({
                        // title: 'Error',
                        message: `${selectedBranch.label}の支店は既に選択されています。`,
                        variant: 'error',
                    })
                );
                return; 
            }

            if (this.vehicleList.length === 0) {
              
                this.sections[sectionId].selectedValue = null;
                this.sections[sectionId].selectedbranchNameForVehicle = null;
                this.sections[sectionId].showlist = false; 
    
               
                this.dispatchEvent(
                    new ShowToastEvent({
                        // title: 'No Vehicles',
                        message: '本所属に紐づいている車両がありません',
                        variant: 'info',
                    })
                );
                return; 
            }
            
           
            if (previousSelectedValue) {
                this.sections[sectionId].selectedBranchVehicles.delete(previousSelectedValue);
            }
        
           
            this.sections[sectionId].selectedValue = selectedBranch.value;
            this.sections[sectionId].selectedbranchNameForVehicle = selectedBranch.label;
            this.sections[sectionId].showlist = false; // Hide the list after selection
        
            // Add the new selected value to the map with previous vehicle IDs if any
            this.sections[sectionId].selectedBranchVehicles.set(selectedBranch.value, previousVehicleIds);
        }
    
        console.log("Selected Branch ID:", this.sections[sectionId].selectedValue);
        console.log("Updated Branch Vehicles Map:", JSON.stringify(Array.from(this.sections[sectionId].selectedBranchVehicles.entries())));
    }


    // handleSelectdev(event) {
    //     const sectionId = event.currentTarget.dataset.sectionId;
    //     console.log("working A",JSON.stringify(sectionId));
    //     const vehicleId = event.currentTarget.dataset.id;
    //     console.log("working B",JSON.stringify(vehicleId));
    //     const checkbox = this.template.querySelector(`input[data-id="${vehicleId}"][data-section-id="${sectionId}"]`);
    //     console.log("working C",checkbox);
    //     let vehicleIds = this.sections[sectionId].selectedBranchVehicles.get(this.sections[sectionId].selectedValue) || [];
    //     console.log(vehicleIds);

    //     if (checkbox.checked) {
    //         checkbox.checked = false;
    //         vehicleIds = vehicleIds.filter(id => id !== vehicleId);
    //         console.log("works D",vehicleIds);
    //     } else {
    //         checkbox.checked = true;
    //         vehicleIds.push(vehicleId);
    //         console.log("works D.2",vehicleIds);
    //     }

    //     this.sections[sectionId].selectedBranchVehicles.set(this.sections[sectionId].selectedValue, vehicleIds);
    //     console.log("Selected Vehicles for Branch", this.sections[sectionId].selectedValue, ":", vehicleIds);
    //     console.log("works E",sections.selectedBranchVehicles);
    // }

    handleCheckboxClick(event) {
        // event.stopPropagation();
        const sectionId = event.target.dataset.sectionId;
        // console.log("working A",JSON.stringify(sectionId));
        const vehicleId = event.target.dataset.id;
        // console.log("working b",JSON.stringify(vehicleId));
        
        const selectedValue = this.sections[sectionId].selectedValue;

        if (!selectedValue) {
            event.target.checked = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    // title: 'Error',
                    message: '車両を選択せずに支店を選択することはできません。',
                    variant: 'error',
                })
            );
            event.preventDefault();
            return;
        }
    
        let vehicleIds = this.sections[sectionId].selectedBranchVehicles.get(this.sections[sectionId].selectedValue) || [];
        // console.log("working c",JSON.stringify(vehicleIds));
    
        if (event.target.checked) {
            vehicleIds.push(vehicleId);
        } else {
            vehicleIds = vehicleIds.filter(id => id !== vehicleId);
        }
        
    
        this.sections[sectionId].selectedBranchVehicles.set(this.sections[sectionId].selectedValue, vehicleIds);
        console.log("Selected Vehicles for Branch", this.sections[sectionId].selectedValue, ":", vehicleIds);
        const allSelectedBranchVehicles = this.sections.map((section, idx) => {
            return {
                sectionId: idx,
                selectedBranchVehicles: Array.from(section.selectedBranchVehicles.entries())
            };
        });
        console.log("last data",JSON.stringify(allSelectedBranchVehicles));
    }

    handleCheckboxClickUser(event) {
        // event.stopPropagation();
        const sectionId = event.target.dataset.sectionId;
        // console.log("working A",JSON.stringify(sectionId));
        const vehicleId = event.target.dataset.id;
        // console.log("working b",JSON.stringify(vehicleId));
        const selectedValue = this.sectionUser[sectionId].selectedValueCon;

        if (!selectedValue) {
            event.target.checked = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'ユーザーを選択せずに支店を選択することはできません。',
                    variant: 'error',
                })
            );
            event.preventDefault();
            return;
        }
    
        let UserIds = this.sectionUser[sectionId].selectedBranchUser.get(this.sectionUser[sectionId].selectedValueCon) || [];
        // console.log("working c",JSON.stringify(vehicleIds));
    
        if (event.target.checked) {
            UserIds.push(vehicleId);
        } else {
            UserIds = UserIds.filter(id => id !== vehicleId);
        }
    
        this.sectionUser[sectionId].selectedBranchUser.set(this.sectionUser[sectionId].selectedValueCon, UserIds);
        console.log("Selected user for Branch", this.sectionUser[sectionId].selectedValueCon, ":", UserIds);
        const allSelectedBranchVehicles = this.sectionUser.map((section, idx) => {
            return {
                sectionId: idx,
                selectedBranchUser: Array.from(section.selectedBranchUser.entries())
            };
        });
        console.log("last data",JSON.stringify(allSelectedBranchVehicles));
    }
   
    //  @for future
    // selectallfunction(event) {
    //     const sectionId = event.currentTarget.dataset.sectionId;
    //     const selectedValue = this.sections[sectionId].selectedValue;
    
    //     if (!selectedValue) {
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Error',
    //                 message: 'Branch is empty',
    //                 variant: 'error',
    //             })
    //         );
    //         event.preventDefault();
    //         return;
    //     }
    
    //     // Check all checkboxes and update selectedBranchVehicles
    //     const checkboxes = this.template.querySelectorAll(`input[name="vehiclecheckboxes"][data-section-id="${sectionId}"]`);
    //     checkboxes.forEach(checkbox => {
    //         checkbox.checked = event.currentTarget.checked;
    //     });
    
    //     // Update selectedBranchVehicles
    //     let vehicleIds = [];
    //     if (event.currentTarget.checked) {
    //         vehicleIds = this.vehicleList.map(vehicle => vehicle.value);
    //     }
    
    //     this.sections[sectionId].selectedBranchVehicles.set(selectedValue, vehicleIds);
    //     console.log("Selected all Vehicles for Branch", selectedValue, ":", vehicleIds);
    
    //     const allSelectedBranchVehicles = this.sections.map((section, idx) => {
    //         return {
    //             sectionId: idx,
    //             selectedBranchVehicles: Array.from(section.selectedBranchVehicles.entries())
    //         };
    //     });
    //     console.log("Updated data all", JSON.stringify(allSelectedBranchVehicles));
    // }
    
    


    handleContactvehSelect(event) {
        const sectionId = event.currentTarget.dataset.sectionId;
        const selectedId = event.currentTarget.dataset.id;
        const selectedBranch = this.branchList.find(item => item.value === selectedId);
         
         
        if (selectedBranch) {
            // Retrieve the previous selected value
            const previousSelectedValue = this.sectionUser[sectionId].selectedValueCon;
            console.log("working");
            const previousVehicleIds = this.sectionUser[sectionId].selectedBranchUser.get(previousSelectedValue) || [];
            console.log("working 2");
    
            const isBranchAlreadySelected = Object.values(this.sectionUser)
             .some(section => section.selectedValueCon === selectedBranch.value);
     
            if (isBranchAlreadySelected && previousSelectedValue !== selectedBranch.value) {
                // If the branch is already selected and is not the current selection, show an error
                this.dispatchEvent(
                    new ShowToastEvent({
                        // title: 'Error',
                        message: `${selectedBranch.label}の支店は既に選択されています。`,
                        variant: 'error',
                    })
                );
                return; 
            }
            if (this.ContactList.length === 0) {
                // Remove the selected value
                this.sectionUser[sectionId].selectedValueCon = null;
                this.sectionUser[sectionId].selectedContactNameForVehicle = null;
                this.sectionUser[sectionId].showconlist = false; // Hide the list after selection
    
                // Show a toast notification indicating no vehicles are present
                this.dispatchEvent(
                    new ShowToastEvent({
                        // title: 'No Vehicles',
                        message: '本所属に紐づいている会員がありません',
                        variant: 'info',
                    })
                );
                return; // Prevent further execution
            }
     
            if (previousSelectedValue) {
                this.sectionUser[sectionId].selectedBranchUser.delete(previousSelectedValue);
            }
    
            // Update the selected branch
            this.sectionUser[sectionId].selectedValueCon = selectedBranch.value;
            // console.log("working 4");
            this.sectionUser[sectionId].selectedContactNameForVehicle = selectedBranch.label;
            console.log("working 5");
            this.sectionUser[sectionId].showconlist = false; // Hide the list after selection
    
            // Add the new selected value to the map with previous vehicle IDs if any
            this.sectionUser[sectionId].selectedBranchUser.set(selectedBranch.value, previousVehicleIds);
        }
    
        console.log("Selected Branch ID:", this.sectionUser[sectionId].selectedValueCon);
        console.log("Updated Branch Vehicles Map:", JSON.stringify(Array.from(this.sectionUser[sectionId].selectedBranchUser.entries())));
       
    }
    // selectallfunctionUser(event) {
    //     const sectionId = event.currentTarget.dataset.sectionId;
    //     const selectedValue = this.sectionUser[sectionId].selectedValueCon;
    
    //     if (!selectedValue) {
    //         this.dispatchEvent(
    //             new ShowToastEvent({
    //                 title: 'Error',
    //                 message: 'Branch is empty',
    //                 variant: 'error',
    //             })
    //         );
    //         event.preventDefault();
    //         return;
    //     }
    
    //     // Check all checkboxes and update selectedBranchVehicles
    //     const checkboxes = this.template.querySelectorAll(`input[name="usercheckboxes"][data-section-id="${sectionId}"]`);
    //     checkboxes.forEach(checkbox => {
    //         checkbox.checked = event.currentTarget.checked;
    //     });
    
    //     // Update selectedBranchVehicles
    //     let vehicleIds = [];
    //     if (event.currentTarget.checked) {
    //         vehicleIds = this.ContactList.map(vehicle => vehicle.value);
    //     }
    
    //     this.sectionUser[sectionId].selectedBranchUser.set(selectedValue, vehicleIds);
    //     console.log("Selected all Users for Branch", selectedValue, ":", vehicleIds);
    
    //     const allSelectedBranchVehicles = this.sectionsUser.map((section, idx) => {
    //         return {
    //             sectionId: idx,
    //             selectedBranchUser: Array.from(section.selectedBranchVehicles.entries())
    //         };
    //     });
    //     console.log("Updated data users all", JSON.stringify(allSelectedBranchVehicles));
    // }

    
    
    

    OnfirstStep(){
        let branchestoVehicles = [];
        let branchestoVehiclesLabel = [];
        let branchestoUsers = [];
        let branchestoUsersLabel = [];


        


        let hasInvalidSelection = false;
        for (let section of this.sections) {
            if (section.selectedValue && (!section.selectedBranchVehicles.get(section.selectedValue) || section.selectedBranchVehicles.get(section.selectedValue).length === 0)) {
                hasInvalidSelection = true;
                break;
            }
        }

        for (let section of this.sectionUser) {
            if (section.selectedValueCon && (!section.selectedBranchUser.get(section.selectedValueCon) || section.selectedBranchUser.get(section.selectedValueCon).length === 0)) {
                hasInvalidSelection = true;
                break;
            }
        }

        if (hasInvalidSelection) {
            this.dispatchEvent(
                new ShowToastEvent({
                    // title: 'Error',
                    message: '選択した支店に対して、車両またはユーザーを選択してください。',
                    variant: 'error',
                })
            );
            return; // Prevent further execution
        }
        console.log("worksss");
    
        // Iterate through each section to gather the selectedBranchVehicles data
        this.sections.forEach(section => {
            section.selectedBranchVehicles.forEach((vehicleIds, branch) => {
                branchestoVehicles.push({ branch, vehicles: vehicleIds });
    
                // Get the branch label from branchList
                const branchLabel = this.branchList.find(item => item.value === branch)?.label || branch;
    
                // Get the vehicle labels from vehicleList
                const vehicleLabels = vehicleIds.map(vehicleId => {
                    return this.vehicleList.find(vehicle => vehicle.value === vehicleId)?.label || vehicleId;
                });
    
                branchestoVehiclesLabel.push({ branch: branchLabel, vehicles: vehicleLabels });
            });
        });
    
        // Log the results for debugging purposes
        console.log("Branches to Vehicles Mapping:", JSON.stringify(branchestoVehicles));
        console.log("Branches to Vehicles Labels Mapping:", JSON.stringify(branchestoVehiclesLabel));
    
        // Store the results in component properties (if needed for further processing)
        // console.log("Branches to Veh Mapping:", JSON.stringify(branchestoVehicles));
        // console.log("Branches to Veh Labels:", JSON.stringify(branchestoVehiclesLabel));

            // Iterate through each sectionUser to gather the selectedBranchUser data
    this.sectionUser.forEach(user => {
        console.log("works last");
        user.selectedBranchUser.forEach((userIds, branch) => {
            branchestoUsers.push({ branch, users: userIds });
            console.log("works last2");

            // Get the branch label from branchList
            const branchLabel = this.branchList.find(item => item.value === branch)?.label || branch;
            console.log("works last3");

            // Get the user labels from userList (assuming you have a userList similar to vehicleList)
            const userLabels = userIds.map(userId => {
                return this.ContactList.find(user => user.value === userId)?.label || userId;
            });
            console.log("works last4");

            branchestoUsersLabel.push({ branch: branchLabel, users: userLabels });
        });
    });
    console.log("workss22s");

    // Log the results for debugging purposes
    console.log("Branches to Users Mapping:", JSON.stringify(branchestoUsers));
    console.log("Branches to Users Labels Mapping:", JSON.stringify(branchestoUsersLabel));

   
    this.branchestoUser = branchestoUsers;
    this.branchestoUserLabel = branchestoUsersLabel;
    this.branchestoVehicle = branchestoVehicles;
    this.branchestoVehicleLabel = branchestoVehiclesLabel;

    this.checkForMissingData();
   
    this.updateCheckboxStates();
    this.updateCheckboxStatesForUsers();


    

    if (this.showmissing) {
        console.log("error");
        return; // Prevent further execution
    }

        this.SecondStep = true;
        this.firstStep = false;
    
    }

    checkForMissingData() {
        console.log("ok");
        const vehicleIds = this.vehicleList.map(vehicle => vehicle.value);
        const userIds = this.ContactList.map(contact => contact.value);
        console.log("ok1",vehicleIds);

        const vehicleIdsFromBranches = this.branchestoVehicle.flatMap(branch => branch.vehicles);
        const userIdsFromBranches = this.branchestoUser.flatMap(branch => branch.users);
        console.log("ok2",vehicleIdsFromBranches);

        // Check for missing vehicles
        for (let id of vehicleIds) {
            if (!vehicleIdsFromBranches.includes(id)) {
                this.showmissing = true;
                console.log("ok3");
                return;
                
            }
        }

        // Check for missing users
        for (let id of userIds) {
            if (!userIdsFromBranches.includes(id)) {
                this.showmissing = true;
                console.log("ok4");
                return;
            }
        }

        this.showmissing = false; // If no missing vehicles or users found
    }
    get nobranchVehicle() {
        return this.branchestoVehicleLabel.length === 0;
    }
    get nobranchContact() {
        return this.branchestoUserLabel.length === 0;
    }


   async OnSecondStep(){

        this.finalConfirm = false;
        this.formLoader = true;
        const branchvehicles = JSON.stringify(this.branchestoVehicle);
        const branchUsers = JSON.stringify(this.branchestoUser);

        let overallSuccess = true;

        const vehiclePromise = InsertvehList({ jsonBranchVehicle: branchvehicles })
            .then(result => {
                console.log('Vehicle data inserted successfully:', result);
            })
            .catch(error => {
                console.error('Error inserting vehicle data:', error);
                overallSuccess = false;
            });

        const userPromise = InsertUserList({ jsonBranchContact: branchUsers })
            .then(result => {
                console.log('User data inserted successfully:', result);
            })
            .catch(error => {
                console.error('Error inserting user data:', error);
                overallSuccess = false;
            });

        Promise.all([vehiclePromise, userPromise])
            .then(() => {
                if (overallSuccess) {
                    return deletebranch({ branchId:this.branchId});
                } else {
                    throw new Error('One or both insert operations failed.');
                }
            })
            .then(() => {
                this.formLoader = false;
                this.pagestoggle = false;
                this.ThirdStep = true;
                this.SecondStep = false;

                // this.dispatchEvent(
                //     new ShowToastEvent({
                //         // title: 'Success',
                //         message: 'データが正常に挿入され、ブランチが削除されました。',
                //         variant: 'success',
                //     })
                // );
            })
            .catch(error => {
                // Handle error in deletion or previous operations
                console.error('Error in branch deletion:', error);

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'There was an error processing the data or deleting the branch.',
                        variant: 'error',
                    })
                );
            });
    }

    goToMain(){
        let baseUrl = window.location.href;
    if(baseUrl.indexOf("/s/") !== -1) {
        let addBranchUrl = baseUrl.split("/s/")[0] + "/s/branchmangement";
        window.location.href = addBranchUrl;
    }
    }

    onCloseM(){
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
        this.showsure = false;
    }
    closemodalsure(){
        this.showsure = false;
    }
    openmodalsure(){
        this.showsure = true;
    }
        
        
    onPrevStep(){
        this.updateCheckboxStates();
        this.updateCheckboxStatesForUsers();
        this.firstStep = true;
        this.SecondStep = false;
    }
    FinalStep(){
        this.goToMain();
    }
    @track finalConfirm = false;

    closemodalfinal(){
        this.finalConfirm = false;
    }
    openModalFinal(){
        this.finalConfirm = true;
        window.scrollTo(0,0);
    }

}
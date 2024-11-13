import { LightningElement, track, wire } from 'lwc';
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import returnNotificationData from "@salesforce/apex/CCP2_Notification_Controller.returnNotificationData";

const BACKGROUND_IMAGE_PC =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Main_Background.webp";


export default class Ccp2_NotificationsCentre extends LightningElement {
    backgroundImagePC = BACKGROUND_IMAGE_PC;

    @track notificationPage = true;
    @track vehicledetailspage = false;
    @track isAllSelected = true;
    @track vehicleId = '';
    @track isVehicleSelected = false;    
    @track isNewsSelected = false;    

    @track isFinanceSelected = false;
    @track isEInvoice = false;
    @track a = false;
    @track b = false;
    @track c = false;
    @track notificationloop = false;
    @track Notificationshowmore = false;
    @track Notificationd = [];
    @track NotifdecShowmore = '';
    @track d = false;
    @track notificationdata = [];
    @track hasNotificationVehicle = false;
    @track hasNotificationFinance = false;
    @track hasNotificationInvoice = false;

    @wire(returnNotificationData)
    wiredNotificationData({ error, data }) {
        if (data) {
            this.notificationdata = JSON.parse(JSON.stringify(data));
            console.log("Notification data in JSON",JSON.stringify(this.notificationdata));
            // const newNotification = {
            //     id: "a1cIo0000008me0IAA",
            //     vehicleNumber: "車両-209-の-2121",
            //     Date: "2024/10/29",
            //     Description: "リース契約の書類がアップロードされました",
            //     Type: "dtfsa",
            //     vehicleId: "a1aIo000000GwoXIAS"
            // };
            // const newNotificationInvoice = {
            //     id: "a1cIo0000008me1IAB",
            //     vehicleNumber: "車両-210-の-2122",
            //     Date: "2024/10/29",
            //     Description: "１０月の請求書アップロードされました。",
            //     Type: "Invoice",
            //     vehicleId: "a1aIo000000GwoYIAB"
            // };
            // const newNotification3 = {
            //     id: "a1cIo0000008me0IAQ",
            //     vehicleNumber: "車両-209-の-2121",
            //     Date: "2024/10/29",
            //     Description: "１０月の請求書アップロードされました。",
            //     Type: "Invoice",
            //     vehicleId: "a1aIo000000GwoXIAS"
            // };
            
            // // Define the new date entry
            // const newDateEntry = {
            //     date: "29/10/2024",
            //     notifications: [newNotification, newNotificationInvoice,newNotification3]
            // };
            
            // // Push the new date entry into the existing notificationdata array
            // this.notificationdata.push(newDateEntry);
            this.handleallcardstoshow();
            console.log("Notification data in JSON",JSON.stringify(this.notificationdata));
        } else if (error) {
            // Log any errors if they occur
            console.error('Error fetching Notification Data:', error);
        }
    }

    @track notifDescription = '';
    @track notifDate = '';
    @track notifRegistration = '';
    @track showMoremodal = false;
    @track isVehicleSelectedNotEmpty = false;
    @track isRecallSelectedNotEmpty = false;
    @track isInvoiceSelectedNotEmpty = false;

    get notificationVehicleEmpty() {
        console.log("Called 1");
        return this.notificationdata && this.isVehicleSelectedNotEmpty;
    }
    get notificationRecallEmpty() {
        console.log("Called 2");
        return this.notificationdata && this.isRecallSelectedNotEmpty;
    }
    get notificationInvoiceEmpty() {
        console.log("Called 3");
        return this.notificationdata && this.isInvoiceSelectedNotEmpty;
    }

    handleallcardstoshow(){
        if (!this.notificationdata || !Array.isArray(this.notificationdata)) {
            console.error("Invalid notification data structure");
            return;
        }
    
        this.notificationdata.forEach(group => {
            if (!group.notifications || !Array.isArray(group.notifications)) {
                console.error("Invalid notifications structure in group");
                return;
            }
            group.showDateA = false;
            group.showDateB = false;
            group.showDateC = false;
            group.showDateD = false;
            group.notifications.forEach(notification => {
                if (!notification) {
                    console.error("Invalid notification object");
                    return;
                }
    
                console.log("sw Object ext", Object(JSON.stringify(notification)));
                
                // const a = false;
                // const b = false;
                // const c = false;
                // const d = false;
                // const Notificationshowmore = false;
                // const fullDesc = notification.Description || ""; 

                notification["a"] = false;
                notification["b"] = false;
                notification["c"] = false;
                console.log("workife");
                notification["d"] = false;
                notification["Notificationshowmore"] = false;
                notification["fullDesc"] = notification.Description || "";
                
                const formatdate = this.formatJapaneseDate(notification.Date);
                notification.Date = formatdate;
                
                
                console.log("full desc", notification.fullDesc);
    
                // Shorten the description if longer than 50 characters
                if (notification.Description && notification.Description.length > 90) {
                    notification.Description = notification.Description.slice(0, 90) + '...';
                    notification.Notificationshowmore = true;
                    console.log("inside show more");
                }

                // if there is no vehicle type present then - showemptyA = true;
    
                // Set flags based on notification type
                switch (notification.Type) {
                    case "Vehicle":
                        notification.a = true;
                        group.showDateA = true;
                        break;
                        case "Recall":
                        this.isVehicleSelectedNotEmpty = true;
                        notification.b = true;
                        group.showDateB = true;
                        break;
                        case "Invoice":
                        this.isRecallSelectedNotEmpty = true;
                        notification.c = true;
                        group.showDateC = true;
                        break;
                        case "dtfsa":
                        this.isInvoiceSelectedNotEmpty = true;
                        notification.d = true;
                        group.showDateD = true;
                        break;
                    default:
                        break;
                }
                console.log("Notification after processing", notification);
            });
            group.notifications.forEach(notification => {
                // If any notification has b, c, or d as true, set the respective flag to false
                if (notification.b) {
                    this.hasNotificationVehicle = false;
                }
                if (notification.c) {
                    this.hasNotificationInvoice = false;
                }
                if (notification.d) {
                    this.hasNotificationFinance = false;
                }
            });
           
        });

       
        console.log("flag A",this.hasNotificationVehicle);
        console.log("flag B",this.hasNotificationInvoice);
        console.log("flag C",this.hasNotificationFinance);
        
        console.log("Final notification data", this.notificationdata);
    }


    handleAllclick(){
        this.isAllSelected = true;
        this.isVehicleSelected = false;
        this.isNewsSelected = false;
        this.isFinanceSelected = false;
        this.isEInvoice = false;
    }

    handleVehicleClick(){
        this.isAllSelected = false;
        this.isVehicleSelected = true;
        this.isNewsSelected = false;
        this.isFinanceSelected = false;
        this.isEInvoice = false;
        console.log("Is vehicle Selected: ", JSON.stringify(this.notificationdata));
    }    
    handleNewsclick(){
        this.isAllSelected = false;
        this.isVehicleSelected = false;
        this.isNewsSelected = true;
        this.isFinanceSelected = false;
        this.isEInvoice = false;
        console.log("Is vehicle Selected: ", JSON.stringify(this.notificationdata));
    }

    handleEInvoiceClick(){
        this.isAllSelected = false;
        this.isVehicleSelected = false;
        this.isNewsSelected = false;
        this.isFinanceSelected = false;
        this.isEInvoice = true;
        console.log("Is Envoice Selected: ", JSON.stringify(this.notificationdata));
    }
    
    handleFinanceClick(){
        this.isAllSelected = false;
        this.isVehicleSelected = false;
        this.isNewsSelected = false;
        this.isFinanceSelected = true;
        this.isEInvoice = false;
        console.log("Is Finance Selected: ", this.notificationdata);
    }
    
    handleShowmoreClick(event){
        const notificationCard = event.target.closest('.notification-card');
        const id = notificationCard ? notificationCard.dataset.id : null;
        console.log("id of click",id)
        if(id){
            const matchingNotification = this.notificationdata
            .flatMap(group => group.notifications) 
            .find(notification => notification.id === id);
            console.log("edc2",matchingNotification)
            this.notifDescription = matchingNotification.fullDesc;
            this.notifRegistration = matchingNotification.vehicleNumber;
            this.notifDate = matchingNotification.Date;
            this.notifvehid = matchingNotification.vehicleId;
        }
        this.showMoremodal = true;
    }
    GotoDetailsPageModal(event){
      const vehicleDetailElement = event.target.closest('.check-details');

        if (vehicleDetailElement) {
            const vehicleIdMain = vehicleDetailElement.getAttribute('data-id');
             this.vehicleId = vehicleIdMain;
             console.log("working id ",this.vehicleId);
             let url = `/s/vehicle-details?vehicleId=${this.vehicleId}`;
             window.location.href = url;
            // this.vehicledetailspage = true;
            // window.scrollTo(0,0);
            // this.notificationPage = false;

        } else {
            console.error('Vehicle detail element not found');
        }
    }

    GotoDetailsPage(event){
      const vehicleDetailElement = event.target.closest('.vehicledetailmove');

        if (vehicleDetailElement) {
            const vehicleIdMain = vehicleDetailElement.getAttribute('data-id');
             this.vehicleId = vehicleIdMain;
             console.log("working id ",this.vehicleId);
             let url = `/s/vehicle-details?vehicleId=${this.vehicleId}`;
             window.location.href = url;
            // this.vehicledetailspage = true;
            // window.scrollTo(0,0);
            // this.notificationPage = false;

        } else {
            console.error('Vehicle detail element not found');
        }
    }

    closeNotificationModal(){
        this.showMoremodal = false;
    }

    formatJapaneseDate(isoDate) {
        const date = new Date(isoDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        let reiwaYear;
        if (year === 2019) {
          if (month <= 4) {
            return `平成31年${month}月${day}日`;
          } else if (month > 4) {
            return `令和1年${month}月${day}日`;
          }
        } else if (year > 2019) {
          reiwaYear = year - 2018;
          return `令和${reiwaYear}年${month}月${day}日`;
        } else {
          reiwaYear = 30 - (2018 - year);
          return `平成${reiwaYear}年${month}月${day}日`;
        }
        return isoDate;
    }



    get allSelectedClass(){
        return this.isAllSelected ? 'border-right-black' : '';
    }

    get vehicleSelectedClass(){
        return this.isVehicleSelected ? 'border-right-black' : '';
    }
    
    get newsSelectedClass(){
        return this.isNewsSelected ? 'border-right-black' : '';
    }

    get EInvoiceSelectedClass(){
        return this.isEInvoice ? 'border-right-black' : '';
    }

    get FinanceSelectedClass(){
        return this.isFinanceSelected ? 'border-right-black' : '';
    }

    get allSelectedLabel(){
        return this.isAllSelected ? 'text-right-black' : '';
    }

    get vehicleSelectedLabel(){
        return this.isVehicleSelected ? 'text-right-black' : '';
    }    
    
    get newsSelectedLabel(){
        return this.isNewsSelected ? 'text-right-black' : '';
    }

    get eInvoiceSelectedLabel(){
        return this.isEInvoice ? 'text-right-black' : '';
    }

    get financeSelectedLabel(){
        return this.isFinanceSelected ? 'text-right-black' : '';
    }
}
import { LightningElement, track, wire } from 'lwc';
import getTermsAndConditionData from "@salesforce/apex/CCP2_VehicleShakenController.getTermsRecord";
import insertFlag from "@salesforce/apex/CCP2_VehicleShakenController.createTermsNotification";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

const Background =
  Vehicle_StaticResource + "/CCP2_Resources/Common/Terms-background.webp";

export default class Ccp2_TnCModal extends LightningElement {

    background = Background;

    handleOk(event){
      let Id = event.target.dataset.id;
      console.log("dataId",Id);
        insertFlag({ termId: Id})
                .then(() => {
                  this.dispatchEvent(new CustomEvent("back"));
                })
                .catch((error) => {
                  console.error("Error updating record:", error);
                  let err = JSON.stringify(error);
                  ErrorLog({
                    lwcName: "ccp2_TnCModal",
                    errorLog: err,
                    methodName: "handleOk"
                  })
                    .then(() => {
                      console.log("Error logged successfully in Salesforce");
                    })
                    .catch((loggingErr) => {
                      console.error("Failed to log error in Salesforce:", loggingErr);
                    });
                });
    }

    @track hasScrolledToBottom = false; 

    handleScroll() {
        if (this.hasScrolledToBottom) return; 

        const scrollableDiv = this.template.querySelector('.modal-description-terms');
        if (!scrollableDiv) return;

        // Console log the scroll properties
        console.log("scrollTop:", scrollableDiv.scrollTop);
        console.log("clientHeight:", scrollableDiv.clientHeight);
        console.log("scrollHeight:", scrollableDiv.scrollHeight);
        console.log("Reached Bottom?:", scrollableDiv.scrollTop + scrollableDiv.clientHeight >= scrollableDiv.scrollHeight);

        // Check if the user has scrolled to the bottom
        if (scrollableDiv.scrollTop + scrollableDiv.clientHeight >= scrollableDiv.scrollHeight) {
            this.hasScrolledToBottom = true; // Enable button permanently
            console.log("User reached the bottom, button enabled!");
        }
    }

    get isOpen() {
        return !this.hasScrolledToBottom; // Button stays enabled once scrolled to bottom
    }

    

    @track TncData = [];
     @wire(getTermsAndConditionData)
        wiredTnCData({ error, data }) {
            if (data) {
                console.log("TnC data ",data);
                this.TncData = data.map(record => ({
                  ...record,
                  createdDate: this.formatJapaneseDate(record.Start_Date__c),
                  LastModified:  this.formatJapaneseDate(record.LastModifiedDate)
              }));
                console.log("TnC data main",JSON.stringify(this.TncData));
            } else if (error) {
              console.error('Error fetching Notification Data:', error);
              let err = JSON.stringify(error);
                  ErrorLog({ lwcName: "ccp2_TnCModal", errorLog: err, methodName: "wire" })
            .then(() => {
              console.log("Error logged successfully in Salesforce");
            })
            .catch((loggingErr) => {
              console.error("Failed to log error in Salesforce:", loggingErr);
            });
            }
        }
        formatJapaneseDate(isoDate) {
            if (isoDate == undefined) {
              return "";
            }
            const date = new Date(isoDate);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}年${month}月${day}日`;
          }
}
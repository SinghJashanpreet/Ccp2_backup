import { LightningElement, track,wire } from "lwc";
import Home_StaticResource from "@salesforce/resourceUrl/CCP_StaticResource_Home";
import labelsBranch from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_guestUserLanguage.guestuserLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";
import checkGuestUser from "@salesforce/apex/CCP_HeaderController.checkGuestUserAndTerms";

const FOOTER_LOGO =
  Home_StaticResource + "/CCP_StaticResource_Home/images/logo.svg";
export default class Ccp2_FusoFooter extends LightningElement {
  @track Languagei18n1 = "";
  @track isLanguageChangeDone = true;
  @track amIGuestUser = true;
  footer_logo = FOOTER_LOGO;


  connectedCallback(){
    this.loadCheckGuestUser();
  }

  //  loadCheckGuestUser() {
  //     checkGuestUser().then((result) => {
  //       console.log("guest and tnc check",result);
        
  //     });
  //   }
    @wire(checkGuestUser)
    wiredGuestUser({ error, data }) {
        if (data) {
          console.log("footer data",data);
          if (data.GuestUser === true || data.agreeTnC === false) {
          } else {
            this.amIGuestUser = data.GuestUser;
          }
        } else if (error) {
            console.error("Error fetching guest user data:", error);
        }
    }

  loadLanguage() {
    Languagei18n()
      .then((data) => {
        this.Languagei18n1 = data;
        console.log("lang Method Footer", data, this.Languagei18n1);
        return this.loadI18nextLibrary();
      })
      .then(() => {
        return this.loadLabels();
      })
      .then(() => {
        //console.log("Upload Label: ", this.isLanguageChangeDone);
      })
      .catch((error) => {
        console.error("Error loading language or labels Footer22: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoFooter",
          errorLog: err,
          methodName: "Load Language",
          ViewName:"FusoFooter",
          InterfaceName:"Salesforce",
          EventName: "Data fetch",
          ModuleName: "footer"
        })
          .then(() => {
            console.log("Error logged successfully in Salesforce");
          })
          .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
          });
      });
  }

  connectedCallback() {
    // window.addEventListener("load", () => {
    // });
    sessionStorage.removeItem("ongoingTransaction");
  }

  renderedCallback() {
    //console.log("In Footer Render");
    if (this.isLanguageChangeDone) {
      //console.log("Working 1 in Footer");
      this.loadLanguage();
    }
  }
  @track labels2 = {};

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
    fetch(`${labelsBranch}/labelsHeaderFooter.json`)
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
            //console.log("User Locale: footer ", userLocale);
            //console.log("User Labels: footer", this.labels2);
            this.labels2 = i18next.store.data[userLocale].translation;
          });
      })
      .catch((error) => {
        console.error("Error loading labels footer: ", error);
        let err = JSON.stringify(error);
        ErrorLog({
          lwcName: "ccp2_FusoFooter",
          errorLog: err,
          methodName: "Load Labels",
          ViewName:"FusoFooter",
          InterfaceName:"Salesforce",
          EventName: "Data fetch",
          ModuleName: "footer"
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
    //console.log("Lang 2 Footer", this.Languagei18n1);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n1 === "en_US") {
      //console.log("working1 Footer");
      return "en";
    } else {
      //console.log("working2");
      return "jp";
    }
  }
}
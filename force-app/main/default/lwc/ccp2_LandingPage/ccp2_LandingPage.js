import { LightningElement,track } from 'lwc';
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getLoginURL from "@salesforce/apex/CCP_HeaderController.getLoginURL";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_guestUserLanguage.guestuserLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

const landingImg = Vehicle_StaticResource + "/CCP2_Resources/Common/Landing_page_Picture.webp";

export default class Ccp2_LandingPage extends LightningElement {

    landingImg = landingImg;
    loginLink;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
    loginURL(){
        getLoginURL().then((result) => {
            //console.log("this.loginLink", result2);
            this.loginLink = result;
            console.log("login link",this.loginLink);
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
      ErrorLog({ lwcName: "ccp2_LandingPage", errorLog: err, methodName: "Load Language" })
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
    fetch(`${labelsUser}/infoCenter.json`)
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
      ErrorLog({ lwcName: "ccp2_LandingPage", errorLog: err, methodName: "Load Labels" })
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
    }
    return "jp";
  }

    connectedCallback(){
        this.loginURL();
    }
    renderedCallback() {
            if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
    }
    }

    handleSSO(){
        window.location.href = this.loginLink;
    }
}
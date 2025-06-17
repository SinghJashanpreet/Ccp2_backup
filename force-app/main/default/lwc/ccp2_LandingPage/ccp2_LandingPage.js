import { LightningElement, track, wire } from 'lwc';
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import getLoginURL from "@salesforce/apex/CCP_HeaderController.getLoginURL";
import labelsUser from "@salesforce/resourceUrl/ccp2_labels";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_guestUserLanguage.guestuserLanguage";
//import Gettoken from "@salesforce/apex/CCP2_guestUserLanguage.getToken";
// import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

import CCP2_User_Manual_Url from "@salesforce/label/c.CCP2_User_Manual_Url";
const landingImg = Vehicle_StaticResource + "/CCP2_Resources/Common/Landing_page_Picture.webp";

export default class Ccp2_LandingPage extends LightningElement {

  landingImg = landingImg;
  loginLink;
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;
  loginURL() {
    getLoginURL().then((result) => {
      this.loginLink = result;
      console.log("login link", this.loginLink);
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

  connectedCallback() {
    //this.fetchToken();
    this.loginURL();
  }
  renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
      this.loadLanguage();
    }
  }

  handleNavigate() {
    window.location.href = CCP2_User_Manual_Url;
  }
  handleSSO() {
    window.location.href = this.loginLink;
  }
//  fetchToken() {
//   Gettoken()
//     .then((data) => {
//       console.log('received token', data);
//     })
//     .catch((error) => {
//       console.error('Error fetching vehicle lease data:', error);
//     });
// }
}
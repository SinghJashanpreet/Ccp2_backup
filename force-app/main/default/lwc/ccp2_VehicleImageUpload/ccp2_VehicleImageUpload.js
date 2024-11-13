import { LightningElement, track, api } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import updateFirstPublishLocationId from "@salesforce/apex/CCP2_vehcileImageUploader.updateFirstPublishLocationId";
const sample = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/sample.png";
const upload = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/upload.png";
const error_outline =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/error_outline.png";
import { createRecord } from "lightning/uiRecordApi";
import deleteBranchApi from "@salesforce/apex/CCP2_vehcileImageUploader.deleteContentDocumentByVersionId";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";

import labelsVehicle from '@salesforce/resourceUrl/ccp2_labels';
import i18nextStaticResource from '@salesforce/resourceUrl/i18next';

export default class Ccp2_VehicleImageUpload extends LightningElement {
    @track Languagei18n = '';
  @track isLanguageChangeDone = true;
  @api imageData;
  @api vehicleId;
  @track fileName = "";
  @track fileURL = "";
  @track fileType = "";
  @track uploadImagesArray = [];
  @track uploadImagesOnlyIds = [];
  @track instructionContainerCss = "upload-instruction-container";
  @track uploadImageCss = "upload-image";
  @track uploadImageIconCss = "upload-image-icon-box";
  @track uploadContainerCss = "upload-container full-width-two-element";
  @track saveButtonCss = "upload-button save disable";
  @track UploadImageButtonCss = "upload-image-icon-container";
  @track imageScrollerContainer = "upload-button save disable";
  @track isImageEmpty = true;
  @track isImageLimitReached = false;
  @track saveLoader = false;
  isButtonDisabled = true;
  isUplaodButtonDisabled = false;
  sample = sample;
  upload = upload;
  error_outline = error_outline;

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

  connectedCallback() {
    this.loadI18nextLibrary().then(() => {
      this.loadLabels(); // Now you can safely load the labels after i18next is loaded
  }).catch((error) => {
      console.error("Error loading i18next library: ", error);
  });
    // console.log("this.imageData", JSON.parse(JSON.stringify(this.imageData)));
    if (this.imageData != null) {
      this.uploadImagesArray = [...this.imageData];

      this.instructionContainerCss =
        this.uploadImagesArray.length > 0
          ? "upload-instruction-container left"
          : "upload-instruction-container";
      this.imageScrollerContainer =
        this.uploadImagesArray.length >= 3
          ? "image-scroll-container padding-right"
          : "image-scroll-container";
      this.uploadImageCss =
        this.uploadImagesArray.length === 1 || this.uploadImagesArray.length === 2
          ? "upload-image one-element"
          : "upload-image one-element";
      this.uploadImageIconCss =
        this.uploadImagesArray.length === 1 || this.uploadImagesArray.length === 2
          ? "upload-image-icon-box"
          : "upload-image-icon-box";
      this.saveButtonCss =
        this.uploadImagesArray.length <= 0
          ? "upload-button save disable"
          : "upload-button save";
      this.UploadImageButtonCss =
        this.uploadImagesArray.length <= 3
          ? "upload-image-icon-container"
          : "upload-image-icon-container disable-div";
      this.isButtonDisabled = this.uploadImagesArray.length <= 0 ? true : false;
      this.isUplaodButtonDisabled =
        this.uploadImagesArray.length >= 4 ? true : false;

      if (this.uploadImagesArray.length === 1) {
        this.uploadContainerCss = "upload-container full-width-two-element";
      } else if (
        this.uploadImagesArray.length === 2 ||
        this.uploadImagesArray.length === 3
      ) {
        this.uploadContainerCss = "upload-container full-width-two-element";
      } else {
        this.uploadContainerCss = "upload-container full-width-two-element";
      }
      this.isImageEmpty = this.uploadImagesArray.length > 0 ? false : true;
      this.isImageLimitReached =
        this.uploadImagesArray.length >= 4 ? true : false;
    }
  }

  renderedCallback() {
    if (this.isLanguageChangeDone) {
      console.log("Working 1");
    this.loadLanguage();
    }
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
    fetch(`${labelsVehicle}/labelsVehicle.json`)
    .then(response => response.json())
    .then(data => {
        const userLocale = this.getLocale(); // Method to determine user locale (e.g., 'en', 'jp')
        
        // Initialize i18next with the fetched labels
        i18next.init({
            lng: userLocale,
            resources: {
                [userLocale]: {
                    translation: data[userLocale]
                }
            }
        }).then(() => {
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
    if (this.Languagei18n === 'en_US'){
      console.log("working1");
      return "en";
    }
    else{
      console.log("working2");
      return "jp";
    }
  }

  handleFilesChange(event) {
    const files = event.target.files;
    const maxSizeInBytes = 10 * 1024 * 1024;

    const fileTypeWeGet = files[0].type;
    
    if (!['image/jpeg', 'image/png'].includes(fileTypeWeGet)) {
        this.showToast(this.labels2.ccp2_vi_Error_9,this.labels2.ccp2_vi_invalidFileType9,'Error');
       return;
    }


    if (files[0] && files[0].size > maxSizeInBytes) {
      this.showToast(this.labels2.ccp2_vi_Error_9, this.labels2.ccp2_vi_fileSizeExceed9, "Error");
    } else if (files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  deleteBranchApi(id) {
    deleteBranchApi({ contentVersionId: id })
      .then((result) => {
        console.log("result", result);
        this.uploadImagesOnlyIds = this.uploadImagesOnlyIds.filter((elm) => {
          return elm !== id;
        });

        this.saveLoader = false;
      })
      .catch((e) => {
        this.showToast(this.labels2.ccp2_vi_Error_9, this.labels2.ccp2_vi_somethingWentWrong9 , 'error');
        this.saveLoader = false;
        console.log("error", e);
      });
  }

  uploadImage(fileArray) {
    updateFirstPublishLocationId({
      contentVersionIdsJson: JSON.stringify(fileArray),
      vehicleId: this.vehicleId
    })
      .then(() => {
        console.log("success updateFirstPublishLocationId");
        this.saveLoader = false;
      })
      .catch((err) => {
        console.log("error in uploading updateFirstPublishLocationId:-", err);
        this.showToast(this.labels2.ccp2_vi_Error_9, this.labels2.ccp2_vi_tryAgain9, "error");
        this.saveLoader = false;
      });
  }

  uploadFile(file) {
    this.saveLoader = true;
    this.fileName = file.name;
    this.fileType = file.type;

    // Check if the file name already exists in the array
    const isFileNameExists = this.uploadImagesArray.some(
      (uploadedFile) => uploadedFile.fileName === file.name
    );

    // If the file name exists, do not proceed with the upload
    if (isFileNameExists) {
      this.showToast(this.labels2.ccp2_vi_Error_9, `${file.name} ${this.labels2.ccp2_vi_alreadyUploaded9}`, "error");
      this.saveLoader = false;
      return;
    }

    let reader = new FileReader();
    reader.onload = () => {
      const readerResult = reader.result;
      this.fileURL = readerResult;
      const base64 = reader.result.split(",")[1];

      let image = new Image();
      image.src = readerResult;

      image.onload = () => {
        const maxWidth = 2800;

        const maxHeight = 2600;

        var canvas = document.createElement("canvas");

        var width = image.width;

        var height = image.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;

            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;

            height = maxHeight;
          }
        }

        canvas.width = width;

        canvas.height = height;

        let context = canvas.getContext("2d");

        context.drawImage(image, 0, 0, width, height);

        const compressedImageData = canvas.toDataURL(this.fileType, 0.7);

        this.compressedImageData = compressedImageData;

        const fields = {
          Title: this.fileName,

          PathOnClient: this.fileName,

          VersionData: this.compressedImageData.split(",")[1],

          FirstPublishLocationId: this.recordId,

          ContentLocation: "S",

          Description: 'Images'

        };

        createRecord({
          apiName: "ContentVersion",
          fields: fields
        })
          .then((result) => {
            console.log("result", result.id);

            this.newfile = true;

            this.uploadImagesArray.push({
              id: result.id,
              fileName: file.name,
              fileURL: this.compressedImageData,
              base64: this.compressedImageData.split(",")[1],
              filetype: "vehicleImage"
            });

            this.uploadImagesOnlyIds.push(result.id);

            console.log(
              "this.uploadImagesOnlyIds",
              JSON.stringify(this.uploadImagesOnlyIds)
            );

            console.log(
              "this.uploadImagesArray after push:_",
              JSON.stringify(this.uploadImagesArray)
            );

            this.instructionContainerCss =
              this.uploadImagesArray.length > 0
                ? "upload-instruction-container left"
                : "upload-instruction-container";
            this.imageScrollerContainer =
              this.uploadImagesArray.length >= 3
                ? "image-scroll-container padding-right"
                : "image-scroll-container";
            this.uploadImageCss =
              this.uploadImagesArray.length === 1 ||
              this.uploadImagesArray.length === 2
                ? "upload-image one-element"
                : "upload-image one-element";
            this.uploadImageIconCss =
              this.uploadImagesArray.length === 1 ||
              this.uploadImagesArray.length === 2
                ? "upload-image-icon-box"
                : "upload-image-icon-box";
            this.saveButtonCss =
              this.uploadImagesArray.length <= 0
                ? "upload-button save disable"
                : "upload-button save";
            this.UploadImageButtonCss =
              this.uploadImagesArray.length <= 3
                ? "upload-image-icon-container"
                : "upload-image-icon-container disable-div";
            this.isButtonDisabled =
              this.uploadImagesArray.length <= 0 ? true : false;
            this.isUplaodButtonDisabled =
              this.uploadImagesArray.length >= 4 ? true : false;

            if (this.uploadImagesArray.length === 1) {
              this.uploadContainerCss =
                "upload-container full-width-two-element";
            } else if (
              this.uploadImagesArray.length === 2 ||
              this.uploadImagesArray.length === 3
            ) {
              this.uploadContainerCss =
                "upload-container full-width-two-element";
            } else {
              this.uploadContainerCss =
                "upload-container full-width-two-element";
            }
            this.isImageEmpty =
              this.uploadImagesArray.length > 0 ? false : true;
            this.isImageLimitReached =
              this.uploadImagesArray.length >= 4 ? true : false;

            this.saveLoader = false;
          })

          .catch((error) => {
            console.error("Error in callback:", error);
            this.showToast(this.labels2.ccp2_vi_Error_9, this.labels2.ccp2_vi_tryAgain9, "error");
            this.saveLoader = false;
          });
      };
    };
    reader.readAsDataURL(file);
  }

  handleFileUpload() {
    this.template.querySelector(".file-input").click();
  }

  handleDeleteImage(event) {
    this.saveLoader = true;
    console.log("id for delete", event.target.dataset.id);
    console.log("id for delete", event.target.dataset.name);
    this.deleteBranchApi(event.target.dataset.id);
    this.uploadImagesArray = this.uploadImagesArray.filter((item) => {
      return item.fileName !== event.target.dataset.name;
    });
    this.instructionContainerCss =
      this.uploadImagesArray.length > 0
        ? "upload-instruction-container left"
        : "upload-instruction-container";
    this.imageScrollerContainer =
      this.uploadImagesArray.length >= 3
        ? "image-scroll-container padding-right"
        : "image-scroll-container";
    this.uploadImageCss =
      this.uploadImagesArray.length === 1 || this.uploadImagesArray.length === 2
        ? "upload-image one-element"
        : "upload-image one-element";
    this.uploadImageIconCss =
      this.uploadImagesArray.length === 1 || this.uploadImagesArray.length === 2
        ? "upload-image-icon-box"
        : "upload-image-icon-box";
    this.saveButtonCss =
      this.uploadImagesArray.length <= 0
        ? "upload-button save disable"
        : "upload-button save";
    this.UploadImageButtonCss =
      this.uploadImagesArray.length <= 3
        ? "upload-image-icon-container"
        : "upload-image-icon-container disable-div";
    this.isButtonDisabled = this.uploadImagesArray.length <= 0 ? true : false;
    this.isUplaodButtonDisabled =
      this.uploadImagesArray.length >= 4 ? true : false;

    if (this.uploadImagesArray.length === 1) {
      this.uploadContainerCss = "upload-container full-width-two-element";
    } else if (
      this.uploadImagesArray.length === 2 ||
      this.uploadImagesArray.length === 3
    ) {
      this.uploadContainerCss = "upload-container full-width-two-element";
    } else {
      this.uploadContainerCss = "upload-container full-width-two-element";
    }
    this.isImageEmpty = this.uploadImagesArray.length > 0 ? false : true;

    this.isImageLimitReached =
      this.uploadImagesArray.length >= 4 ? true : false;

    const events = new CustomEvent("updateitems", {
      detail: this.uploadImagesArray
    });
    this.dispatchEvent(events);

    const eventss = new CustomEvent("updateids", {
      detail: this.uploadImagesOnlyIds
    });
    this.dispatchEvent(eventss);
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

  handleSaveClick(event) {
    this.saveLoader = true;

    // const events = new CustomEvent("updateitems", {
    //   detail: this.uploadImagesArray
    // });
    // this.dispatchEvent(events);

    // const eventss = new CustomEvent("updateids", {
    //   detail: this.uploadImagesOnlyIds
    // });
    // this.dispatchEvent(eventss);

    console.log('this.uploadImagesArray', this.uploadImagesArray)
    console.log('this.uploadImagesOnlyIds', this.uploadImagesOnlyIds)

    this.uploadImage(this.uploadImagesOnlyIds);

    const event2 = new CustomEvent("closemodal");
    this.dispatchEvent(event2);
    this.saveLoader = false;
  }

  handleCancelClick(event) {
    console.log('cancel button on this.uploadImagesArray',JSON.stringify(this.uploadImagesArray))
    // const events = new CustomEvent("updateitems", {
    //   detail: this.uploadImagesArray
    // });
    // this.dispatchEvent(events);

    // const eventss = new CustomEvent("updateids", {
    //   detail: this.uploadImagesOnlyIds
    // });
    // this.dispatchEvent(eventss);


    const eventsss = new CustomEvent("closemodal");
    this.dispatchEvent(eventsss);
  }
}
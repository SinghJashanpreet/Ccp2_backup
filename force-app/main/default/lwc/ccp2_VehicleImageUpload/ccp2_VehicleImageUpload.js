import { LightningElement, track, api } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import updateFirstPublishLocationId from "@salesforce/apex/CCP2_vehcileImageUploader.updateFirstPublishLocationId";
import updatefav from "@salesforce/apex/CCP2_CalendarController.contentVersionUpdate";

import { updateRecord } from 'lightning/uiRecordApi';
const sample = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/sample.png";
const upload = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/upload.png";
const error_outline =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/error_outline.png";
import { createRecord } from "lightning/uiRecordApi";
import deleteBranchApi from "@salesforce/apex/CCP2_vehcileImageUploader.deleteContentDocumentByVersionId";
import Languagei18n from "@salesforce/apex/CCP2_userData.userLanguage";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

import labelsVehicle from '@salesforce/resourceUrl/ccp2_labels';
import i18nextStaticResource from '@salesforce/resourceUrl/i18next';

import CCP2_FAV_IMAGE_FIELD from '@salesforce/schema/ContentVersion.CCP2_FavImage__c';

export default class Ccp2_VehicleImageUpload extends LightningElement {
    @track Languagei18n = '';
  @track isLanguageChangeDone = true;
  @api imageData;
  @api vehicleId;
  @track fileName = "";
  @track fileURL = "";
  @track fileType = "";
  @track previousIdofFav;
  @track uploadImagesArray = [];
  @track uploadImagesOnlyIds = [];
  @track instructionContainerCss = "upload-instruction-container";
  @track uploadImageCss = "upload-image";
  @track uploadImageIconCss = "upload-image-icon-box";
  @track uploadContainerCss = "upload-container full-width-two-element";
  @track saveButtonCss = "upload-button save";
  @track UploadImageButtonCss = "upload-image-icon-container";
  @track imageScrollerContainer = "upload-button save disable";
  @track isImageEmpty = true;
  @track isImageLimitReached = false;
  @track deleteimagesids = [];
  @track saveLoader = false;
  @track showsuretoeditModal = false;
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
           let err = JSON.stringify(error);
      ErrorLog({ lwcName: "ccp2_VehicleImageUpload", errorLog: err, methodName: "Load Language" })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
        });
}

  connectedCallback() {
    this.loadI18nextLibrary().then(() => {
      this.loadLabels(); // Now you can safely load the labels after i18next is loaded
  }).catch((error) => {
    console.error("Error loading i18next library: ", error);
    let err = JSON.stringify(error);
      ErrorLog({ lwcName: "ccp2_VehicleImageUpload", errorLog: err, methodName: "Connected Callback" })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
  });
    // console.log("this.imageData", JSON.parse(JSON.stringify(this.imageData)));
    if (this.imageData != null) {
      this.uploadImagesArray = [...this.imageData];
    this.uploadImagesArray = this.imageData.map((file) => ({
      ...file,
      fileNameTrimmed: file.fileName?.length > 26 ? file.fileName.substring(0, 26) + "..." : file.fileName,
    }));
    this.setOriginalFlag();
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
        this.uploadImagesArray.length < 0
          ? "upload-button save disable"
          : "upload-button save";
      this.UploadImageButtonCss =
        this.uploadImagesArray.length <= 3
          ? "upload-image-icon-container"
          : "upload-image-icon-container disable-div";
      this.isButtonDisabled = this.uploadImagesArray.length < 0 ? true : false;
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

  setOriginalFlag() {
    let flagFound = false;

    // Iterate over uploadImagesArray to find a record with CCP2_FavImage__c
    for (const record of this.uploadImagesArray) {
        if (record.hasOwnProperty('FavImage') && record.FavImage) {
            this.originalFlag = record.FavImage;
            this.previousIdofFav = record.id; 
            console.log("orginal flag",this.previousIdofFav); 
            flagFound = true;
            console.log("w2",flagFound);
            break; 
        }
    }

    // If no record has CCP2_FavImage__c, set originalFlag to null
    if (!flagFound) {
        this.originalFlag = null;
        console.log("dhe",this.originalFlag);
    }

    console.log('Original Flag:', this.originalFlag);
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
        let err = JSON.stringify(error);
      ErrorLog({ lwcName: "ccp2_VehicleImageUpload", errorLog: err, methodName: "Load Labels" })
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
    if (this.Languagei18n === 'en_US'){
      console.log("working1");
      return "en";
    }
    else{
      console.log("working2");
      return "jp";
    }
}
get imagesWithTrimmed() {
  return this.uploadImagesArray.map((file) => ({
    ...file, // Keep all existing properties
    fileNameTrimmed: file.name.length > 26 ? file.name.substring(0, 26) + "..." : file.name,
  }));
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
      this.showToast("f", this.labels2.ccp2_vi_file_size_exceeded, "Error");
    } else if (files.length > 0) {
      this.uploadFile(files[0]);
    }
    event.target.value = null;
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
        this.uploadImagesOnlyIds = [];
      })
      .catch((error) => {
        console.log("error in uploading updateFirstPublishLocationId:-", error);
        this.showToast(this.labels2.ccp2_vi_Error_9, this.labels2.ccp2_vi_tryAgain9, "error");
        let err = JSON.stringify(error);
      ErrorLog({ lwcName: "ccp2_VehicleImageUpload", errorLog: err, methodName: "Load Image" })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
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
            width  = height / 6;

            height = height / 6;
          }
        } else {
          if (height > maxHeight) {
            width  = height / 6;

            height = height / 6;
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

            if(this.uploadImagesArray?.length < 3){
              this.uploadImagesArray.push({
                id: result.id,
                fileName: file.name,
                fileNameTrimmed: file.name.length > 26 ? file.name.substring(0,26)+"..." : file.name,
                fileURL: this.compressedImageData,
                base64: this.compressedImageData.split(",")[1],
                filetype: "vehicleImage"
              });
   
              this.uploadImagesOnlyIds.push(result.id);
            }
            else{
              this.uploadImagesArray.unshift({
                id: result.id,
                fileName: file.name,
                fileNameTrimmed: file.name.length > 26 ? file.name.substring(0,26)+"..." : file.name,
                fileURL: this.compressedImageData,
                base64: this.compressedImageData.split(",")[1],
                filetype: "vehicleImage"
              });
   
              this.uploadImagesOnlyIds.unshift(result.id);
            }

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
              this.uploadImagesArray.length < 0
                ? "upload-button save disable"
                : "upload-button save";
            this.UploadImageButtonCss =
              this.uploadImagesArray.length <= 3
                ? "upload-image-icon-container"
                : "upload-image-icon-container disable-div";
            this.isButtonDisabled =
              this.uploadImagesArray.length < 0 ? true : false;
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
            let err = JSON.stringify(error);
      ErrorLog({ lwcName: "ccp2_VehicleImageUpload", errorLog: err, methodName: "uploadFile" })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
            this.saveLoader = false;
          });
      };
    };
    reader.readAsDataURL(file);
  }

  handleFileUpload() {
    this.template.querySelector(".file-input").click();
  }

  @track showcancelimageModal = false;
  @track imageEvent;
  opencancelimagemodal(event) {
    this.imageEvent = event.currentTarget;
    this.showcancelimageModal = true;
  }

  handleimageNo() {
    this.showcancelimageModal = false;
  }

handleimageYes() {
    this.handleDeleteImage(this.imageEvent); // Call the function
    this.showcancelimageModal = false; // Close the modal
}

  handleDeleteImage(event) {
    this.saveLoader = true;
    console.log("id for delete", event.dataset.id);
    console.log("id for delete", event.dataset.name);

    this.deleteimagesids.push(event.dataset.id);
    console.log("delids",JSON.stringify(this.deleteimagesids));
    this.uploadImagesArray = this.uploadImagesArray.filter((item) => {
      return item.fileName !== event.dataset.name;
    });
    this.uploadImagesOnlyIds = this.uploadImagesOnlyIds.filter((item) => {
      return item !== event.dataset.id;
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
      this.uploadImagesArray.length < 0
        ? "upload-button save disable"
        : "upload-button save";
    this.UploadImageButtonCss =
      this.uploadImagesArray.length <= 3
        ? "upload-image-icon-container"
        : "upload-image-icon-container disable-div";
    this.isButtonDisabled = this.uploadImagesArray.length < 0 ? true : false;
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
    this.saveLoader = false;
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      // title: title,
      message: message,
      variant: "error"
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
    
    if (this.deleteimagesids && this.deleteimagesids.length > 0) {
      this.deleteimagesids.forEach((id) => {
          this.deleteBranchApi(id);
      });
    } else {
        console.log('No IDs to delete.');
    }

    console.log('this.uploadImagesArray', this.uploadImagesArray)
    console.log('this.uploadImagesOnlyIds', this.uploadImagesOnlyIds)

    this.uploadImage(this.uploadImagesOnlyIds);
    if(this.originalFlag === null){
      if(this.selectedImageId !== null){
        const fields = {};
        fields['Id'] = this.selectedImageId; 
        fields[CCP2_FAV_IMAGE_FIELD.fieldApiName] = true;

        // Prepare record input for update
        const recordInput = { fields};

        
        updateRecord(recordInput)
            .then(() => {
                console.log('Record updated successfully');
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record updated successfully',
                        variant: 'success',
                    })
                );
            })
            .catch((error) => {
                console.error('Error updating record:', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error updating record: ' + error.body.message,
                        variant: 'error',
                    })
                );
              let err = JSON.stringify(error);
      ErrorLog({ lwcName: "ccp2_VehicleImageUpload", errorLog: err, methodName: "handleSaveClick" })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
            });
      }else{
        console.log("no fav selected");
      }
    }else{
      if(this.selectedImageId !== null){
        updatefav({ contentVersionId: this.selectedImageId, vehicleId: this.vehicleId })
        .then(() => {
            console.log('Success to update');
            // this.dispatchEvent(
            //     new ShowToastEvent({
            //         title: 'Success',
            //         message: 'Image updated successfully!',
            //         variant: 'success'
            //     })
            // );
        })
        .catch((error) => {
            console.error('Error updating record:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body ? error.body.message : 'Unknown error',
                    variant: 'error'
                })
            );
          let err = JSON.stringify(error);
      ErrorLog({ lwcName: "ccp2_VehicleImageUpload", errorLog: err, methodName: "handleSaveClick" })
        .then(() => {
          console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
          console.error("Failed to log error in Salesforce:", loggingErr);
        });
        });
      }else{
        console.log("update empty");
      }
    }
    const event2 = new CustomEvent("closemodal");
    this.dispatchEvent(event2);
    this.isImageEmpty = this.uploadImagesArray.length > 0 ? false : true;
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

    this.uploadImagesOnlyIds.forEach((id) => {
      this.deleteBranchApi(id);
  });

    const eventsss = new CustomEvent("closemodal");
    this.dispatchEvent(eventsss);
  }
@track addedImages;

handleCancelModal() {
    console.log("All Image Ids: ", JSON.stringify(this.uploadImagesOnlyIds), JSON.stringify(this.deleteimagesids));

    // Ensure arrays are not undefined or null
    const uploadedImages = this.uploadImagesOnlyIds || [];
    const deletedImages = this.deleteimagesids || [];

    if (uploadedImages.length > 0) {
        this.addedImages = uploadedImages;
    }

    console.log("All ids here: ", this.addedImages, deletedImages);

    // Check if there are uploaded images or if the added images differ from deleted ones
    // if (!this.areArraysEqual(this.addedImages, deletedImages)) {
    if (uploadedImages?.length > 0 || deletedImages?.length > 0) {
        this.showsuretoeditModal = true;
    } else {
        this.handleCancelClick();
    }
}

// Helper function to compare arrays
areArraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

  CloseModalSureEdit() {
    this.showsuretoeditModal = false;
  }

  finalChecktoChange() {
    this.showsuretoeditModal = false;
    this.handleCancelClick();
  }
  @track selectedImageId = null;

  handleSelectImageHover(event) {
    const clickedImageId = event.currentTarget.dataset.id; 
    console.log("clickedId", clickedImageId);

    if (this.selectedImageId === clickedImageId) {
        console.log("No change as the same image is clicked again.");
        return;
    }
    let previousId = this.selectedImageId || this.previousIdofFav;
    console.log("prev",previousId);

    this.uploadImagesArray = this.uploadImagesArray.map((image) => {
        if (image.id === previousId) {
            return { ...image, FavImage: false }; 
        }
        else if (image.id === clickedImageId) {
            return { ...image, FavImage: true }; 
        }
        return { ...image };
    });
    this.selectedImageId = clickedImageId;

    console.log("Updated uploadImagesArray:", JSON.stringify(this.uploadImagesArray));
  }
  
}
import { LightningElement, track, wire } from 'lwc';
import createCaseNew from "@salesforce/apex/CCP_Inquiry.createCaseNew";
import Vehicle_StaticResource from '@salesforce/resourceUrl/CCP2_Resources';
import { createRecord,getRecord } from "lightning/uiRecordApi";
import deletecontentversion from "@salesforce/apex/CCP2_vehcileImageUploader.deleteContentDocumentByVersionId";
import CONTENT_VERSION_OBJECT from "@salesforce/schema/ContentVersion";
import TITLE_FIELD from "@salesforce/schema/ContentVersion.Title";
import VERSION_DATA_FIELD from "@salesforce/schema/ContentVersion.VersionData";
import PATH_ON_CLIENT_FIELD from "@salesforce/schema/ContentVersion.PathOnClient";
import Id from "@salesforce/user/Id";
import getBasicInfo from "@salesforce/apex/CCP2_userController.userBasicInfo";
import INQUIRY_TYPE_FIELD from "@salesforce/schema/Case.inquiryType__c";
import CONTACT_ID_FIELD from "@salesforce/schema/User.ContactId";
import ACCOUNT_ID_FIELD from "@salesforce/schema/Contact.AccountId";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import i18nextStaticResource from "@salesforce/resourceUrl/i18next";
import Languagei18n from "@salesforce/apex/CCP2_guestUserLanguage.guestuserLanguage";
import labelsBranch from "@salesforce/resourceUrl/ccp2_labels";
import ErrorLog from "@salesforce/apex/CCP2_lwc_ErrorLogs.createLwcErrorLog";

const BACKGROUND_IMAGE_PC = Vehicle_StaticResource + '/CCP2_Resources/Common/Main_Background.webp';

export default class Ccp2_Enquiry extends LightningElement {
  @track imageLoaded = false;
  @track showOptions = false;
  @track outsideClickHandlerAdded = false;
  @track contentVersionIds = [];
  @track accountId;
  @track allLoadedImages = true;
  @track uploadedImages = [];
  @track imageList = [];
  @track userDetailData = {
    id: null,
    firstName: null,
    lastName: null,
    email: null,
    accountname: null
  };
  @track descValInput = '';
  @track remainingChars = 1000;
  @track textareaValue = '';
  @track lastSavedValue = "";
  @track Languagei18n = "";
  @track isLanguageChangeDone = true;

  backgroundImagePC = BACKGROUND_IMAGE_PC;
  selectedOption = "";
  descValue = "";
  contactId;
  refreshTokenInt = 1;
  userId = Id;
  isStep1 = true;
  isStep2 = false;
  isStep3 = false;
  maxLength = 1000;
  dummyOptions = [];
  lastchanged = false;
  wiredUserInfo;
  FinalMainLoader = false;
  labels2 = {};

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA",
    fieldApiName: INQUIRY_TYPE_FIELD
  })
  wiredBodyPicklistValues({ error, data }) {
    if (data) {
      this.dummyOptions = data.values.map((item) => ({
        label: item.label,
        value: item.value
      }));
    } else if (error) {
      console.error("Error fetching picklist values: ", error);
            let error = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error, methodName: "inquiryType__c" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @wire(getBasicInfo, { ContactId: "$contactId", refresh: "$refreshTokenInt" })
  fetUserInfo(result) {
    this.wiredUserInfo = result;
    const { data, error } = result;
    if (data) {
      this.userDetailData = {
        accountname: data.AccountName || "-",
        firstName: data.FirstName || "-",
        lastName: data.LastName || "-",
        id: data.Id || "-",
        email: data.Email || "-"
      };
    } else if (error) {
      console.error("Error fetching user info:", error);
            let error = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error, methodName: "ContactId" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @wire(getRecord, { recordId: "$userId", fields: [CONTACT_ID_FIELD] })
  userRecord({ error, data }) {
    if (data) {
      this.contactId = data.fields.ContactId.value;
      refreshApex(this.wiredUserInfo);
    } else if (error) {
      console.error("Error fetching user record:", error);
            let error = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error, methodName: "userId" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  @wire(getRecord, { recordId: "$contactId", fields: [ACCOUNT_ID_FIELD] })
  contactRecord({ error, data }) {
    if (data) {
      this.accountId = data.fields.AccountId.value;
    } else if (error) {
      console.error("Error fetching contact record:", error);
            let error = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error, methodName: "contactId" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
    }
  }

  get processedImageList() {
    return this.imageList.map(image => {
      return {
        ...image,
        trimmedName: this.trimFileName(image.name, 24)
      };
    });
  }

  handleSvgClick() {
    this.template.querySelector('input[type="file"]').click();
  }

  async handleRemoveImage(event) {
    const recordId = event.target.dataset.id;

    if (!recordId) {
      console.error("Error: No valid record ID found for deletion.");
            let error = JSON.stringify("Error: No valid record ID found for deletion.");
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error, methodName: "handleRemoveImage" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
      return;
    }

    const imageToDelete = this.imageList.find((img) => img.recordId === recordId);

    if (imageToDelete) {
      imageToDelete.isDeleting = true;
      this.imageList = [...this.imageList];
    }

    try {
      await deletecontentversion({ contentVersionId: recordId });

      this.imageList = this.imageList.filter((image) => image.recordId !== recordId);
      this.contentVersionIds = this.contentVersionIds.filter((image) => image !== recordId);

      this.uploadedImages = this.uploadedImages.filter((image) => image.recordId !== recordId);
      this.imagesCreatedId = this.imagesCreatedId.filter((id) => id !== recordId);
    } catch (error) {
      console.error("Error deleting image:", error);
      let error2 = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error2, methodName: "deleteContentVersion" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
      this.showSpinner = true;

      if (imageToDelete) {
        imageToDelete.isDeleting = false;
        this.imageList = [...this.imageList];
      }
    } finally {
      this.isloadingImages = false;
    }
  }

  async createContentVersionRecords(newImages) {
    try {
      this.imagesCreatedId = this.imagesCreatedId || [];
      this.uploadedImages = this.uploadedImages || [];
      this.contentVersionIds = this.contentVersionIds || [];

      for (const image of newImages) {
        if (this.uploadedImages.some((uploaded) => uploaded.name === image.name)) {
          continue;
        }

        const fields = {};
        fields[TITLE_FIELD.fieldApiName] = image.name;
        const base64String = image.src.includes("base64,") ? image.src.split("base64,")[1] : image.src;

        if (base64String.length > 0 && base64String.length <= 5242880) {
          fields[VERSION_DATA_FIELD.fieldApiName] = base64String;
          fields[PATH_ON_CLIENT_FIELD.fieldApiName] = image.name;
          try {
            image.isCurrentImage = true;
            this.updateImageProgress(image, 0);
            const record = await createRecord({
              apiName: CONTENT_VERSION_OBJECT.objectApiName,
              fields
            });
            this.updateImageProgress(image, 100);
            image.isCurrentImage = false;

            this.imagesCreatedId.push(record.id);
            this.contentVersionIds.push(record.id);
            this.uploadedImages.push(image);

            const imageToUpdate = this.imageList.find((img) => img.id === image.id);
            if (imageToUpdate) {
              imageToUpdate.recordId = record.id;
              imageToUpdate.progress = 100;
              imageToUpdate.isLoaded = true;
            }

          } catch (error) {
            this.handleUploadError(image, error);
            let error2 = JSON.stringify(err);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error2, methodName: "createContentVersionRecords" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
      this.showSpinner = true;
            return;
          }

        } else {
          this.handleInvalidImage(image);
          return;
        }
      }

    } catch (e) {
      console.error("Error", e);
      let error = JSON.stringify(e);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error, methodName: "createContentVersionRecords" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
      this.showSpinner = true;
    } finally {
      // this.allLoadedImages = true;
      this.validateButton();
      this.isloadingImages = false;

    }
  }

  handleUploadError(image, error) {
    const pillElement = document.querySelector(`.pill-parent[data-id="${image.id}"]`);
    const loaderElement = pillElement ? pillElement.querySelector('.progress-container') : null;
    if (pillElement) pillElement.remove();
    if (loaderElement) loaderElement.remove();
    this.imageList = this.imageList.filter((img) => img.id !== image.id);
    this.dispatchEvent(
      new ShowToastEvent({
        message: `${this.labels2.ccp2_en_uploadError} "${image.name}": ${error.message || error}`,
        variant: "error"
      })
    );
  }
  handleInvalidImage(image) {
    const pillElement = document.querySelector(`.pill-parent[data-id="${image.id}"]`);
    const loaderElement = pillElement ? pillElement.querySelector('.progress-container') : null;
    if (pillElement) pillElement.remove();
    if (loaderElement) loaderElement.remove();
    this.dispatchEvent(
      new ShowToastEvent({
        message: `${image.name} ${this.labels2.ccp2_en_sizeLimitError}`,
        variant: "error"
      })
    );
  }

  @track handleFilesCounter = 0;
  @track calledCnt = 0;

  handleFilesChange(event) {
    this.calledCnt = 0;
    this.allLoadedImages = false;
    this.handleFilesCounter++;
    try {
      let scrollerContainer = this.template.querySelector(".pill-content");
      if (scrollerContainer) {
        scrollerContainer.scrollTop = 0;
      }
      const files = event.target.files;
      const newImages = [];
      if (this.imageList.length + files.length > 10) {
        this.dispatchEvent(
          new ShowToastEvent({
            message: `${this.labels2.ccp2_en_maxFilesError}`,
            variant: "error"
          })
        );
        console.log("Counter on error case: ", this.handleFilesCounter);
        if (this.handleFilesCounter <= 1) {
          this.handleFilesCounter--;
          this.allLoadedImages = true;
        }
        event.stopPropagation();
        this.template.querySelector('file-upload-input').value = "";
      }
      else {
        const fileTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'font/ttf',
          'image/png',
          'image/jpeg',
          'image/jpg'
        ];
        const fileReadPromises = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

          if (!fileTypes.includes(file.type)) {
            this.dispatchEvent(
              new ShowToastEvent({
                message: `${this.labels2.ccp2_en_invalidFileTypeError}`,
                variant: "error"
              })
            );
            this.isalluploadedimages = false;
            continue;
          }

          const isDuplicate = this.uploadedImages.some(image => image.name === file.name);

          if (isDuplicate) {
            this.dispatchEvent(
              new ShowToastEvent({
                message: `${file.name} ${this.labels2.ccp2_en_duplicateFileError}`,
                variant: 'error',
              })
            );
            continue;
          }
          if (fileSizeMB > 5 && file.type.startsWith('image/')) {
            this.dispatchEvent(
              new ShowToastEvent({
                message: `${file.name}${this.labels2.ccp2_en_imageSizeExceededError}`,
                variant: 'error',
              })
            );
            continue;
          } else if (fileSizeMB > 2 && !file.type.startsWith('image/')) {
            this.dispatchEvent(
              new ShowToastEvent({
                message: `${file.name}${this.labels2.ccp2_en_fileSizeExceededError}`,
                variant: 'error',
              })
            );
            continue;
          }

          if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
            const newImage = {
              id: file.name + i,
              recordId: file.name + i,
              name: file.name,
              sizeMB: fileSizeMB,
              progress: 0,
              isloadingImages: true,
              isLoaded: false,
              isCurrentImage: false,
              isDeleting: false,
              isImage: true
            };
            newImages.unshift(newImage);
            this.imageList = [newImage, ...this.imageList];

            const fileReadPromise = new Promise((resolve) => {
              const reader = new FileReader();
              reader.onprogress = (e) => {
                if (e.lengthComputable) {
                  // newImage.progress = 0;
                  this.imageList = [...this.imageList];
                }
              };

              reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;

                img.onload = () => {
                  let width = img.width;
                  let height = img.height;

                  if (width > 2400 || height > 2000) {
                    width /= 6;
                    height /= 6;
                  }
                  const canvas = document.createElement("canvas");
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(img, 0, 0, width, height);

                  newImage.src = canvas.toDataURL(file.type);
                  newImage.halfName = this.trimFileName(file.name, 45);
                  this.imageList = [...this.imageList];
                  resolve();
                };
              };

              reader.readAsDataURL(file);
            });

            fileReadPromises.push(fileReadPromise);
          }
          else {
            const newImage = {
              id: file.name + i,
              recordId: file.name + i,
              name: file.name,
              sizeMB: fileSizeMB,
              progress: 0,
              isloadingImages: true,
              isLoaded: false,
              isCurrentImage: false,
              isDeleting: false,
              isImage: false
            };
            newImages.unshift(newImage);
            this.imageList = [newImage, ...this.imageList];

            const fileReadPromise = new Promise((resolve) => {
              const reader = new FileReader();
              reader.onprogress = (e) => {
                if (e.lengthComputable) {
                  const progress = Math.round((e.loaded / e.total) * 100);
                  // newImage.progress = progress;
                  this.imageList = [...this.imageList];
                }
              };

              reader.onloadend = () => {
                if (
                  file.type === 'application/pdf' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  file.type === 'application/msword' ||
                  file.type === 'application/vnd.ms-powerpoint' ||
                  file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                  file.type === 'font/ttf'
                ) {
                  newImage.src = reader.result;
                  newImage.halfName = this.trimFileName(file.name, 45);
                  this.imageList = [...this.imageList];
                  resolve();
                } else {
                  console.warn("Unsupported file type:", file.type);
                  resolve();
                }
              };

              reader.readAsDataURL(file);
            });

            fileReadPromises.push(fileReadPromise);

          }
        }
        Promise.all(fileReadPromises)
          .then(async () => {
            if (newImages.length > 0) {
              await this.createContentVersionRecords(newImages);
            }
          })
          .then(() => {
            this.handleFilesCounter--;
            if (!this.allLoadedImages && this.calledCnt < 1) {
              this.calledCnt = 1;
              this.allLoadedImages = true;
              this.validateButton();
            }
          })
          .catch((error) => {
            console.error("Error uploading files: ", error);
            let error2 = JSON.stringify(error);
            ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error2, methodName: "HandleFilesChange" })
              .then(() => {
                console.log("Error logged successfully in Salesforce");
              })
              .catch((loggingErr) => {
                console.error("Failed to log error in Salesforce:", loggingErr);
              });
            this.showSpinner = true;
            this.handleFilesCounter--;
            this.allLoadedImages = true;
          });
      }

    } catch (e) {
      console.error("HandleFiles Error: ", e);
      let error = JSON.stringify(e);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error, methodName: "handleFilesChange" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
      this.showSpinner = true;
    }
    finally {
      event.target.value = null;
      // this.allLoadedImages = true;
      this.isloadingImages = false;
      // this.validateButton();
    }
  }


  updateImageProgress(image, currentVal) {
    const speed = image.isImage ? this.getRandomSpeed() : this.getRandomSpeed2();
    const interval = setInterval(() => {
      if (currentVal < 100) {
        if (currentVal < 90) {
          currentVal += 2;
        } else if (currentVal >= 95) {
          clearInterval(interval);
          return;
        }

        // Increment progress and update the UI
        currentVal = Math.min(currentVal + 2, 100);  // Cap progress at 100
        image.progress = currentVal;
        this.imageList = [...this.imageList];

        if (currentVal === 100) {
          clearInterval(interval);
          setTimeout(() => {
            image.isloadingImages = false;
            this.imageList = [...this.imageList];
          }, 100);
        }
      } else {
        clearInterval(interval);
      }
    }, speed);
  }

  getRandomInt(min, max) {
  const randomBuffer = new Uint32Array(1);
  window.crypto.getRandomValues(randomBuffer);
  const randomNumber = randomBuffer[0] / (0xFFFFFFFF + 1);
  return Math.floor(randomNumber * (max - min)) + min;
}

  getRandomSpeed() {
    return this.getRandomInt(50,150);
  }
  getRandomSpeed2() {
    return this.getRandomInt(150,250);
  }


  trimFileName(value, maxLength) {
    let adjustedLength = 0;
    let actualLength = 0;
    for (let i = 0; i < value.length; i++) {
      if (
        (value.charCodeAt(i) >= 0xff01 && value.charCodeAt(i) <= 0xff5e) ||
        (value.charCodeAt(i) >= 0xff61 && value.charCodeAt(i) <= 0xff9f) ||
        (value.charCodeAt(i) >= 0x3040 && value.charCodeAt(i) <= 0x309f) ||
        (value.charCodeAt(i) >= 0x30a0 && value.charCodeAt(i) <= 0x30ff) ||
        (value.charCodeAt(i) >= 0x4e00 && value.charCodeAt(i) <= 0x9fff)
      ) {
        adjustedLength += 2;
      } else {
        adjustedLength += 1;
      }
      actualLength++;
      if (adjustedLength > maxLength) {
        break;
      }
    }
    return adjustedLength > maxLength ? value.substring(0, actualLength) + '...' : value;
  }

  isOnlySpaces(input) {
    return input.trim() === "";
  }

  substringToProperLength(string, limit) {
    let tempString = "";
    let charCount = 0;

    for (let i = 0; i < string.length; i++) {
      const char = string.charAt(i);
      const charCode = string.charCodeAt(i);

      if (
        (charCode >= 0xff01 && charCode <= 0xff5e) || // Full-width characters
        (charCode >= 0xff61 && charCode <= 0xff9f) || // Half-width Katakana
        (charCode >= 0x3040 && charCode <= 0x309f) || // Hiragana
        (charCode >= 0x30a0 && charCode <= 0x30ff) || // Katakana
        (charCode >= 0x4e00 && charCode <= 0x9fff) // Kanji
      ) {
        charCount += 2;
      } else {
        charCount += 1; // Normal English character counts as 1
      }

      // Check if we should stop adding characters
      if (charCount > limit) {
        break; // Stop when exceeding 19 characters for English
      }
      if (
        charCount > limit &&
        ((charCode >= 0x3040 && charCode <= 0x9fff) || // Full-width Japanese
          (charCode >= 0xff01 && charCode <= 0xff5e)) // Full-width characters
      ) {
        break; // Stop when exceeding 12 for Japanese characters
      }

      tempString += char;
    }

    return tempString + (charCount >= limit ? "..." : "");
  }

  handleInput(event) {
    let value = event.target.value;
    let adjustedLength = 0;
    for (let i = 0; i < value.length; i++) {
      // if (
      //     (value.charCodeAt(i) >= 0xff01 && value.charCodeAt(i) <= 0xff5e) ||
      //     (value.charCodeAt(i) >= 0xff61 && value.charCodeAt(i) <= 0xff9f) ||
      //     (value.charCodeAt(i) >= 0x3040 && value.charCodeAt(i) <= 0x309f) ||
      //     (value.charCodeAt(i) >= 0x30a0 && value.charCodeAt(i) <= 0x30ff) ||
      //     (value.charCodeAt(i) >= 0x4e00 && value.charCodeAt(i) <= 0x9fff)
      //   ) {
      //     adjustedLength += 2;
      //   } else {
      //     adjustedLength += 1;
      //   }
      adjustedLength += 1;
      if (adjustedLength > this.maxLength) {
        value = value.slice(0, i);
        event.target.blur();
        break;
      }
    }
    this.descValInput = value;
    this.validateButton();
    this.textareaValue = value;
    this.remainingChars = this.maxLength - adjustedLength;
    event.target.value = this.textareaValue;
  }


  handleFirstClick() {
    this.isStep1 = false;
    this.isStep2 = true;
  }

  cancelstep2() {
    this.isStep2 = false;
    this.isStep1 = true;
    this.lastchanged = true;
    this.validateButton();
  }

  submitstep2() {
    this.FinalMainLoader = true;
    this.submitInquiry();
  }

  submitInquiry() {
    const inquiryType = this.selectedOption;
    const description = this.descValue;
    const accountName = this.userDetailData.accountname;
    const accountId = this.accountId;
    console.log("Data for case: ", inquiryType, description, accountName, accountId, this.contentVersionIds);
    createCaseNew({
      inquiryType,
      description,
      accountName,
      accountId,
      contentVersionIds: this.contentVersionIds
    })
      .then(result => {
        console.log("Case Created Successfully");
        this.FinalMainLoader = false;
        this.isStep2 = false;
        this.isStep3 = true;
      })
      .catch(error => {
        console.error("Error creating case:", error);
        let error2 = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error2, methodName: "CCP_Inquiry.createCaseNew" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
      this.showSpinner = true;
        this.dispatchEvent(
          new ShowToastEvent({
            message: `${this.labels2.ccp2_en_caseCreationFailed}`,
            variant: "error"
          })
        );
        this.FinalMainLoader = false;
      });
  }


  handlePicklistToggle(event) {
    event.stopPropagation();
    this.showOptions = !this.showOptions;
  }

  selectOption(event) {
    const selectedValue = event.currentTarget.dataset.id;
    const selectedOption = this.dummyOptions.find(option => option.value === selectedValue);
    this.selectedOption = selectedOption.label;
    this.showOptions = false;
  }

  handleOptionClick(event) {
    event.stopPropagation();
  }

  handleOutsideClick = (event) => {
    const dropdownElement = this.template.querySelector(".inquiry-type-val");
    const listElement = this.template.querySelector(".lists2");

    if (
      dropdownElement &&
      !dropdownElement.contains(event.target) &&
      listElement &&
      !listElement.contains(event.target)
    ) {
      this.showOptions = false;
    }
  };

  handleDescChange(event) {
    this.descValue = event.target.value;
    if (this.lastchanged == false) this.lastSavedValue = this.descValue;
    this.validateButton();
  }

  handleInputChange(event) {
    this.selectedOption = event.target.value;
    this.validateButton();
  }

  validateButton() {
    if (this.descValInput && this.selectedOption && this.allLoadedImages && !this.isOnlySpaces(this.descValInput)) {
      const button = this.template.querySelector('.submit-button-1');
      const buttonParent = this.template.querySelector('.buttons1');
      if (buttonParent) buttonParent.style.cursor = 'pointer';
      if (button) button.classList.add("submit-button-1-red");
      if (button) button.classList.remove("submit-button-1");
    } else {
      const button = this.template.querySelector('.submit-button-1-red');
      const buttonParent = this.template.querySelector('.buttons1');
      if (buttonParent) buttonParent.style.cursor = 'not-allowed';
      if (button) button.classList.remove("submit-button-1-red");
      if (button) button.classList.add("submit-button-1");
    }
  }

  goToMain() {
    let baseUrl = window.location.href;
    if (baseUrl.indexOf("/s/") !== -1) {
      let addBranchUrl = baseUrl.split("/s/")[0] + "/s/";;
      window.location.href = addBranchUrl;
    }
  }

    loadLanguage() {
    Languagei18n()
      .then((data) => {
        this.Languagei18n = data;
        //console.log("lang Method", data, this.Languagei18n);
        return this.loadI18nextLibrary(); // Return the promise for chaining
      })
      .then(() => {
        return this.loadLabels(); // Load labels after i18next is ready
      })
      .then(() => {
        //console.log("Upload Label: Header", this.isLanguageChangeDone); // Check language change status
      })
      .catch((error) => {
        console.error("Error loading language or labels: ", error);
        let error2 = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error2, methodName: "CCP_Inquiry.createCaseNew" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
      this.showSpinner = true;
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

  loadLabels() {
    fetch(`${labelsBranch}/labelsHeaderFooter.json`)
      .then((response) => response.json())
      .then((data) => {
        const userLocale = this.getLocale(); 
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
            //console.log("User Locale: Header", userLocale);
            console.log("Enquiry Labels: Header", this.labels2);
          });
      })
      .catch((error) => {
        console.error("Error loading labels: ", error);
        let error2 = JSON.stringify(error);
        ErrorLog({ lwcName: "ccp2_Enquiry", errorLog: error2, methodName: "LoadLabels" })
        .then(() => {
            console.log("Error logged successfully in Salesforce");
        })
        .catch((loggingErr) => {
            console.error("Failed to log error in Salesforce:", loggingErr);
        });
      this.showSpinner = true;
      });
  }

  getLocale() {
    //console.log("Lang 2", this.Languagei18n);
    this.isLanguageChangeDone = false;
    if (this.Languagei18n === "en_US") {
      //console.log("working1");
      return "en";
    } else {
      return "jp";
    }
  }

  renderedCallback() {
        if (this.isLanguageChangeDone) {
      //console.log("Working 1");
          this.loadLanguage();
        }
    if (this.lastchanged) {
      this.descValue = this.lastSavedValue;
      const textarea = this.template.querySelector('[data-id="descriptionInput"]');
      if (textarea) {
        textarea.value = this.descValue;
      }
      this.lastchanged = false;
    }
    document.addEventListener("click", this.handleOutsideClick.bind(this));
    this.validateButton();
  }

  connectedCallback() {
    document.removeEventListener("click", this.handleOutsideClick.bind(this));
  }

}
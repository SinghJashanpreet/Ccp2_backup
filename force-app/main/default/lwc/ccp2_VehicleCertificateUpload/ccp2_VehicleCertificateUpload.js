import { LightningElement, track, api } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import CCP2_vehcileImageUploader from "@salesforce/apex/CCP2_vehcileImageUploader.uploadImage";
const sample =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/Certificate.png";
const upload = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/upload.png";
const error_outline =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/error_outline.png";
import { createRecord } from "lightning/uiRecordApi";

import deleteBranchApi from "@salesforce/apex/CCP2_vehcileImageUploader.deleteContentDocumentByVersionId";
export default class Ccp2_VehicleCertificateUpload extends LightningElement {
  @api imageData;
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

  handleFilesChange(event) {
    const files = event.target.files;
    if (files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  deleteBranchApi(id) {
    deleteBranchApi({ contentVersionId: id })
      .then((result) => {
        console.log("result", result);
        this.uploadImagesOnlyIds = this.uploadImagesOnlyIds.filter((elm) => {
          return elm.id !== id;
        });

        this.saveLoader = false;
      })
      .catch((e) => {
        console.log("error", e);
      });
  }

  connectedCallback() {
    console.log("this.imageData", JSON.parse(JSON.stringify(this.imageData)));
    if (this.imageData != null) {
      this.uploadImagesArray = [...this.imageData];
      this.isImageEmpty = this.uploadImagesArray.length > 0 ? false : true;
      this.instructionContainerCss =
        this.uploadImagesArray.length > 0
          ? "upload-instruction-container"
          : "upload-instruction-container";
      this.imageScrollerContainer =
        this.uploadImagesArray.length >= 3
          ? "image-scroll-container padding-right"
          : "image-scroll-container";
      this.uploadImageCss =
        this.uploadImagesArray.length == 1 || this.uploadImagesArray.length == 2
          ? "upload-image one-element"
          : "upload-image one-element";
      this.uploadImageIconCss =
        this.uploadImagesArray.length == 1 || this.uploadImagesArray.length == 2
          ? "upload-image-icon-box"
          : "upload-image-icon-box";
      this.saveButtonCss =
        this.uploadImagesArray.length <= 0
          ? "upload-button save disable"
          : "upload-button save";
      this.UploadImageButtonCss =
        this.uploadImagesArray.length <= 1
          ? "upload-image-icon-container"
          : "upload-image-icon-container disable-div";
      this.isButtonDisabled = this.uploadImagesArray.length <= 0 ? true : false;
      this.isUplaodButtonDisabled =
        this.uploadImagesArray.length >= 2 ? true : false;

      if (this.uploadImagesArray.length == 1) {
        this.uploadContainerCss = "upload-container full-width-two-element";
      } else if (this.uploadImagesArray.length == 2) {
        this.uploadContainerCss = "upload-container full-width-two-element";
      } else {
        this.uploadContainerCss = "upload-container full-width-two-element";
      }
      this.isImageEmpty = this.uploadImagesArray.length > 0 ? false : true;
      // console.log("aary", JSON.stringify(this.uploadImagesArray));

      this.isImageLimitReached =
        this.uploadImagesArray.length >= 2 ? true : false;
    }
  }

  uploadImage(fileArray) {
    CCP2_vehcileImageUploader({
      jsonStrings: fileArray
    })
      .then(() => {
        console.log("success");
        this.showToast("Success", `Photos Uploaded.`, "success");
        this.saveLoader = false;
      })
      .catch((err) => {
        console.log("fileArray", fileArray);
        console.log("error in uploading:-", err);
        this.showToast("error", err.body.message, "error");
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
      this.showToast("Error", `${file.name} already exists.`, "error");
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
        // console.log('compressedImageData',this.compressedImageData);

        const fields = {
          Title: this.fileName,

          PathOnClient: this.fileName,

          VersionData: this.compressedImageData.split(",")[1],

          FirstPublishLocationId: this.recordId,

          ContentLocation: "S",

          Description: this.description

          // Add any other fields you need
        };

        createRecord({
          apiName: "ContentVersion",
          fields: fields
        })
          .then((result) => {
            console.log("result", result.id);
            this.showToast(
              "Success",
              "File has been uploaded successfully.",
              "Success"
            );

            this.newfile = true;

            this.uploadImagesArray.push({
              id: result.id,
              fileName: file.name,
              fileURL: this.compressedImageData,
              base64: this.compressedImageData.split(",")[1],
              filetype: "certificate"
            });

            this.uploadImagesOnlyIds.push({
              fileName: file.name,
              id: result.id
            });

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
                ? "upload-instruction-container"
                : "upload-instruction-container";
            this.imageScrollerContainer =
              this.uploadImagesArray.length >= 3
                ? "image-scroll-container padding-right"
                : "image-scroll-container";
            this.uploadImageCss =
              this.uploadImagesArray.length == 1 ||
              this.uploadImagesArray.length == 2
                ? "upload-image one-element"
                : "upload-image one-element";
            this.uploadImageIconCss =
              this.uploadImagesArray.length == 1 ||
              this.uploadImagesArray.length == 2
                ? "upload-image-icon-box"
                : "upload-image-icon-box";
            this.saveButtonCss =
              this.uploadImagesArray.length <= 0
                ? "upload-button save disable"
                : "upload-button save";
            this.UploadImageButtonCss =
              this.uploadImagesArray.length <= 1
                ? "upload-image-icon-container"
                : "upload-image-icon-container disable-div";
            this.isButtonDisabled =
              this.uploadImagesArray.length <= 0 ? true : false;
            this.isUplaodButtonDisabled =
              this.uploadImagesArray.length >= 2 ? true : false;

            if (this.uploadImagesArray.length == 1) {
              this.uploadContainerCss =
                "upload-container full-width-two-element";
            } else if (this.uploadImagesArray.length == 2) {
              this.uploadContainerCss =
                "upload-container full-width-two-element";
            } else {
              this.uploadContainerCss =
                "upload-container full-width-two-element";
            }
            this.isImageEmpty =
              this.uploadImagesArray.length > 0 ? false : true;
            // console.log("aary", JSON.stringify(this.uploadImagesArray));

            this.isImageLimitReached =
              this.uploadImagesArray.length >= 2 ? true : false;

            this.saveLoader = false;
          })

          .catch((error) => {
            console.error("Error in callback:", error);

            this.showToast("error", error.body.message, "error");
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
    this.deleteBranchApi(event.target.dataset.id);
    // console.log("delete name:-", event.target.dataset.name);
    this.uploadImagesArray = this.uploadImagesArray.filter((item) => {
      return item.fileName !== event.target.dataset.name;
    });

    console.log(this.uploadImagesArray.length);
    this.instructionContainerCss =
      this.uploadImagesArray.length > 0
        ? "upload-instruction-container"
        : "upload-instruction-container";
    this.uploadImageCss =
      this.uploadImagesArray.length == 1 || this.uploadImagesArray.length == 2
        ? "upload-image one-element"
        : "upload-image one-element";
    this.uploadImageIconCss =
      this.uploadImagesArray.length == 1 || this.uploadImagesArray.length == 2
        ? "upload-image-icon-box"
        : "upload-image-icon-box";
    this.imageScrollerContainer =
      this.uploadImagesArray.length >= 3
        ? "image-scroll-container padding-right"
        : "image-scroll-container";
    this.saveButtonCss =
      this.uploadImagesArray.length <= 0
        ? "upload-button save disable"
        : "upload-button save";

    this.UploadImageButtonCss =
      this.uploadImagesArray.length <= 1
        ? "upload-image-icon-container"
        : "upload-image-icon-container disable-div";

    this.isButtonDisabled = this.uploadImagesArray.length <= 0 ? true : false;
    this.isUplaodButtonDisabled =
      this.uploadImagesArray.length >= 2 ? true : false;

    if (this.uploadImagesArray.length == 1) {
      this.uploadContainerCss = "upload-container full-width-two-element";
    } else if (
      this.uploadImagesArray.length == 2 ||
      this.uploadImagesArray.length == 3
    ) {
      this.uploadContainerCss = "upload-container full-width-two-element";
    } else {
      this.uploadContainerCss = "upload-container";
    }

    this.isImageEmpty = this.uploadImagesArray.length > 0 ? false : true;
    this.isImageLimitReached =
      this.uploadImagesArray.length >= 2 ? true : false;
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

    const events = new CustomEvent("updateitems", {
      detail: this.uploadImagesArray
    });
    this.dispatchEvent(events);

    const eventss = new CustomEvent("updateids", {
      detail: this.uploadImagesOnlyIds
    });
    this.dispatchEvent(eventss);

    const event2 = new CustomEvent("closemodal");
    this.dispatchEvent(event2);

    this.saveLoader = false;
    // this.uploadImage(JSON.stringify(this.uploadImagesArray));
  }

  handleCancelClick(event) {
    const events = new CustomEvent("closemodal");
    this.dispatchEvent(events);
  }
}

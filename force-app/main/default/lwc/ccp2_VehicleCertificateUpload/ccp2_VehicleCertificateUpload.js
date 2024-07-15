import { LightningElement, track } from "lwc";
import Vehicle_StaticResource from "@salesforce/resourceUrl/CCP2_Resources";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import CCP2_vehcileImageUploader from "@salesforce/apex/CCP2_vehcileImageUploader.uploadImage";
const sample = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/sample.png";
const upload = Vehicle_StaticResource + "/CCP2_Resources/Vehicle/upload.png";
const error_outline =
  Vehicle_StaticResource + "/CCP2_Resources/Vehicle/error_outline.png";

  
export default class Ccp2_VehicleCertificateUpload extends LightningElement {
  @track fileName = "";
  @track fileURL = "";
  @track uploadImagesArray = [];
  @track instructionContainerCss = "upload-instruction-container";
  @track uploadImageCss = "upload-image";
  @track uploadImageIconCss = "upload-image-icon-box";
  @track uploadContainerCss = "upload-container";
  @track saveButtonCss = "upload-button save disable";
  @track isImageEmpty = true;
  @track isImageLimitReached = false;
  @track saveLoader = false;
  isButtonDisabled = true;


  sample = sample;
  upload = upload;
  error_outline = error_outline;

  uploadImage(fileArray) {
    CCP2_vehcileImageUploader({
      jsonStrings: fileArray
    })
      .then(() => {
        console.log("success");
        this.showToast("Success", `Photos Uploaded.`, 'success');
        this.saveLoader = false;
      })
      .catch((err) => {
        console.log("fileArray", fileArray);
        console.log("error in uploading:-", err);
        this.showToast("error", err.body.message, 'error');
        this.saveLoader = false;
      });
  }

  handleFilesChange(event) {
    const files = event.target.files;
    if (files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  uploadFile(file) {
    this.fileName = file.name;

    // Check if the file name already exists in the array
    const isFileNameExists = this.uploadImagesArray.some(
      (uploadedFile) => uploadedFile.fileName === file.name
    );

    // If the file name exists, do not proceed with the upload
    if (isFileNameExists) {
      this.showToast("Error", `${file.name} already exists.`, 'error');
      return;
    }

    let reader = new FileReader();
    reader.onload = () => {
      this.fileURL = reader.result;
      const base64 = reader.result.split(",")[1];
      this.uploadImagesArray.push({
        fileName: file.name,
        fileURL: reader.result,
        base64: base64,
        filetype: "certificate"
      });
      this.instructionContainerCss =
        this.uploadImagesArray.length > 0
          ? "upload-instruction-container left"
          : "upload-instruction-container";
          this.uploadImageCss =
          this.uploadImagesArray.length == 1 || this.uploadImagesArray.length == 2
            ? "upload-image one-element"
            : "upload-image";
        this.uploadImageIconCss =
          this.uploadImagesArray.length == 1 || this.uploadImagesArray.length == 2
            ? "upload-image-icon-box one-element"
            : "upload-image-icon-box";
      this.saveButtonCss =
        this.uploadImagesArray.length <= 0
          ? "upload-button save disable"
          : "upload-button save";
      this.isButtonDisabled = this.uploadImagesArray.length <= 0 ? true : false;

      if (this.uploadImagesArray.length == 1) {
        this.uploadContainerCss = "upload-container full-width-one-element";
      } else if (
        this.uploadImagesArray.length == 2
      ) {
        this.uploadContainerCss = "upload-container full-width-one-element";
      } else {
        this.uploadContainerCss = "upload-container";
      }
      this.isImageEmpty = this.uploadImagesArray.length > 0 ? false : true;
      console.log("aary", JSON.stringify(this.uploadImagesArray));

      this.isImageLimitReached =
        this.uploadImagesArray.length >= 2 ? true : false;
    };
    reader.readAsDataURL(file);
  }

  handleFileUpload() {
    this.template.querySelector(".file-input").click();
  }

  handleDeleteImage(event) {
    console.log("delete name:-", event.target.dataset.name);
    this.uploadImagesArray = this.uploadImagesArray.filter((item) => {
      return item.fileName !== event.target.dataset.name;
    });

    console.log(this.uploadImagesArray.length);
    this.instructionContainerCss =
      this.uploadImagesArray.length > 0
        ? "upload-instruction-container left"
        : "upload-instruction-container";
    this.uploadImageCss =
      this.uploadImagesArray.length == 1 || this.uploadImagesArray.length == 2
        ? "upload-image one-element"
        : "upload-image";
    this.uploadImageIconCss =
      this.uploadImagesArray.length == 1 || this.uploadImagesArray.length == 2
        ? "upload-image-icon-box one-element"
        : "upload-image-icon-box";

    this.saveButtonCss =
      this.uploadImagesArray.length <= 0
        ? "upload-button save disable"
        : "upload-button save";

    this.isButtonDisabled = this.uploadImagesArray.length <= 0 ? true : false;

    if (this.uploadImagesArray.length == 1) {
      this.uploadContainerCss = "upload-container full-width-one-element";
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
      this.uploadImagesArray.length >= 10 ? true : false;
  }

  showToast(title, message,variant) {
    const event = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(event);
  }

  handleSaveClick(event) {
    this.saveLoader = true;
    this.uploadImage(JSON.stringify(this.uploadImagesArray));
  }

  handleCancelClick(event) {}
}

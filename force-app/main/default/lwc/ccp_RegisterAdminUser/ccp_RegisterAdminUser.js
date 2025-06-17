/*
 * @Author: AMS watanabe
 * @Date: 2024-12-03 
 * @LastEditTime: 
 * @Description: 会员追加
 */
import { LightningElement, track} from 'lwc';
import userId from '@salesforce/user/Id'; 
import label from '@salesforce/label/c.CCP_SiteLoginUrlPortal'; 
import searchAccount from '@salesforce/apex/CCP_RegisterAdminUserCtrl.searchAccount';
import updateContact from '@salesforce/apex/CCP_RegisterAdminUserCtrl.updateContact';
import setPermissionSetForManagerUser from '@salesforce/apex/CCP_RegisterAdminUserCtrl.setPermissionSetForManagerUser';
import sendCCPSCContactEmail from '@salesforce/apex/CCP_RegisterAdminUserCtrl.sendCCPSCContactEmail';
import getOpenVisualforcePage from '@salesforce/apex/CCP_RegisterAdminUserCtrl.getOpenVisualforcePage';
import handleRedirect from '@salesforce/apex/CCP_RegisterAdminUserCtrl.handleRedirect';
import hasActiveLeaseLoanAccounts from '@salesforce/apex/CCP_RegisterAdminUserCtrl.hasActiveLeaseLoanAccounts';
import updateAccessControlAsync from '@salesforce/apex/CCP_RegisterAdminUserCtrl.updateAccessControlAsync';
import checkSiebelAccountCode from '@salesforce/apex/CCP_RegisterAdminUserCtrl.checkSiebelAccountCode';
/* Last Modified by Jashanpreet Singh*/
import checkAvailablePermissions from '@salesforce/apex/CCP_RegisterAdminUserCtrl.checkUserPermission';
import sendNoTerritoryManagerNotificationEmail from '@salesforce/apex/CCP_CustomerMasterChangeRequestFormCtrl.sendNoTerritoryManagerNotificationEmail';
import getTerritoryEmployeeStatus from '@salesforce/apex/CCP_CustomerMasterChangeRequestFormCtrl.getTerritoryEmployeeStatus';
import updateLeaseLoanStatus from '@salesforce/apex/CCP_CustomerMasterChangeRequestFormCtrl.updateLeaseLoanStatus';
import CCP_RegistrerAdminUser_BackgroundUserInfo from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_BackgroundUserInfo';
import CCP_RegistrerAdminUser_Progress1 from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_Progress1';
import CCP_RegistrerAdminUser_Progress2 from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_Progress2';
import CCP_RegistrerAdminUser_Progress3 from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_Progress3';
import CCP_RegistrerAdminUser_Progress4 from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_Progress4';
import CCP_RegistrerAdminUser_Progress5 from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_Progress5';
import CCP_RegistrerAdminUser_Progress6 from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_Progress6';
import CCP_RegistrerAdminUser_Invoice_SiebelAccountCode_Img from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_Invoice_SiebelAccountCode_Img';
import CCP_RegistrerAdminUser_Invoice_PostalCode_Img from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_Invoice_PostalCode_Img';
import CCP_RegistrerAdminUser_invoiceServiceImg from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_invoiceServiceImg';
import CCP2_RegistrerAdminUser_vehicleImg from '@salesforce/resourceUrl/CCP2_RegistrerAdminUser_Vehicle_Img';
import CCP_RegistrerAdminUser_leaseLoanServiceImg from '@salesforce/resourceUrl/CCP_RegistrerAdminUser_leaseLoanServiceImg';
import getLatestTermsUrls from '@salesforce/apex/CCP_RegisterAdminUserCtrl.getLatestTermsUrls';
import createTermsNotification from '@salesforce/apex/CCP2_VehicleShakenController.createTermsNotification';



export default class Ccp_RegisterAdminUser extends LightningElement {
    RedirectFlag = false;
    // 利用規約のURLを保存
    @track termsUrls = {}; 

    //リダイレクト処理
    connectedCallback() {
        
        // ログインしていない場合、特定のURLにリダイレクト
        if (!userId) {
            window.location.href = label;
        }
        // Apexメソッドを呼び出してリダイレクトURLを取得
        handleRedirect()
            .then(result => {
                console.log(result);
                if(result){
                    // リダイレクトURLが取得できた場合
                    window.location.href = result;  // 取得したURLにリダイレクト
                }else{
                    this.RedirectFlag = true;
                }
            })
            .catch(error => {
                console.error('Error occurred while handling redirect:', error);
            });
        // 最新の利用規約のIDとURLを取得
        this.fetchTermsUrls();
    }

    /**
     * 最新の利用規約のIDとURLを取得
     */
    fetchTermsUrls() {
        getLatestTermsUrls()
            .then(data => {
                console.log("Latest Terms Data:", JSON.stringify(data));

                this.termsUrls = {
                    CCP: {
                        id: data?.CCP?.Id || null,
                        url: `/resource/${data?.CCP?.pdf_Url}` || null
                    },
                    DTFSA: {
                        id: data?.DTFSA?.Id || null,
                        url: `/resource/${data?.DTFSA?.pdf_Url}` || null
                    },
                    EInvoice: {
                        id: data?.["E-Invoice"]?.Id || null,
                        url: `/resource/${data?.["E-Invoice"]?.pdf_Url}` || null
                    }
                };

                console.log("Processed Terms Data:", JSON.stringify(this.termsUrls));
            })
            .catch(error => {
                console.error('Error fetching Latest Terms Data:', error);
            });
    }

    // VisualforceページのURLを生成
    get pdfUrl() {
        return `/apex/CCP_WebInvoiceApplicationForm`;
    }

    // MFTBC利用規約ページのURLを生成
    get usageTermsUrl() {
        return `/s/mftbcUsageTerms`;
    }

    // 背景画像のスタイル
    get layoutStyle() {
        return `background-image:url(${CCP_RegistrerAdminUser_BackgroundUserInfo});background-repeat: no-repeat;background-color: #F4F4F4;background-size:cover;`;
    }
    // ステップごとに設定する値
    get progressContect() {
        const content = {
            imgSrc: '',
            title: '',
        }
        if(this.CorporateRegistrationSection){
            content.imgSrc = CCP_RegistrerAdminUser_Progress1;
            content.title = 'お客様の確認';
        }else if(this.UserRegistrationSection){
            content.imgSrc = CCP_RegistrerAdminUser_Progress2;
            content.title = 'お客様情報の登録';
        }else if(this.UserConfirmationSection){
            content.imgSrc = CCP_RegistrerAdminUser_Progress3;
            content.title = '内容の確認';
        }else if(this.ServiceSelectSection || this.ServiceRegistrationSection){
            content.imgSrc = CCP_RegistrerAdminUser_Progress4;
            content.title = 'サービスの登録';
        }else if(this.ServicConfirmationSection){
            content.imgSrc = CCP_RegistrerAdminUser_Progress5;
            content.title = '内容の確認';
        }else if(this.CompletionSection){
            content.imgSrc = CCP_RegistrerAdminUser_Progress6;
            content.title = '登録完了';
        }
        return content;
    }
    // 顧客コードをホバーしたときに表示する請求書サンプル画像
    get invoiceImg_siebelAccountCode() {
        return CCP_RegistrerAdminUser_Invoice_SiebelAccountCode_Img;
    }
    // 顧客コードをホバーしたときに表示する請求書サンプル画像
    get invoiceImg_postalCode() {
        return CCP_RegistrerAdminUser_Invoice_PostalCode_Img;
    }
    // 部整月次請求書サービスイメージ画像
    get invoiceServiceImg() {
        return CCP_RegistrerAdminUser_invoiceServiceImg;
    }
    get vehicleImg() {
        return CCP2_RegistrerAdminUser_vehicleImg;
    }
    // リース・ローンイメージ画像
    get leaseLoanServiceImg() {
        return CCP_RegistrerAdminUser_leaseLoanServiceImg;
    }
    // ユーザの登録と確認のセクションの場合trueを返す
    get userRegistrationOrConfirmation(){
        return this.UserRegistrationSection || this.UserConfirmationSection;
    }
    // サービスの登録と確認のセクションの場合trueを返す
    get serviceRegistrationOrConfirmation(){
        return this.ServiceRegistrationSection || this.ServicConfirmationSection;
    }

    // どちらかのサービスが有効
    get isServicesActive() {
        return this.invoiceService || this.leaseLoanService;
    }

    // どちらのサービスも無効
    get isServicesInactive() {
        return !this.isServicesActive;
    }

    // ボタンの状態を管理
    @track corporateRegistrationButton = false;
    @track userRegistrationButton = false;
    @track serviceRegistrationButton = false;

    // 入力値の変更を処理
    handleInputChange(event) {
        const fieldName = event.target.dataset.id;
        const input = event.target;
        const onlyDigitsRegex = /^[0-9]*$/;

        if(event.target.type === 'checkbox') {
            this[fieldName] = event.target.checked;
            if((fieldName === 'vehicleService' || fieldName === 'invoiceService' || fieldName === 'leaseLoanService') && event.target.checked === true){
                this.isAnyServiceNotSelected = false;
            }else if(!this.vehicleService && !this.invoiceService && !this.leaseLoanService){
                this.isAnyServiceNotSelected = true;
            }
        }else if(event.target.type === 'text') {
            if (event.target.name === "phone") {
              // const onlyNumber = /^[0-9]*$/;
              if (!onlyDigitsRegex.test(input.value)) {
                event.target.blur();
              }
              const cleanedPhone = input.value.replace(/[^0-9]/g, "");
              input.value = cleanedPhone;
              // let isOk =
              //   input.value.length > 0 && onlyNumber.test(input.value)
              //     ? true
              //     : false;
              this.phone = input.value;
    
              // this.contactClassTelephone = isOk == true ? "" : "invalid-input";
            }else if(event.target.name === "mobilePhone"){
            if (!onlyDigitsRegex.test(input.value)) {
                event.target.blur();
              }
              const cleanedPhone = input.value.replace(/[^0-9]/g, "");
              input.value = cleanedPhone;
              // let isOk =
              //   input.value.length > 0 && onlyNumber.test(input.value)
              //     ? true
              //     : false;
              this.mobilePhone = input.value;
            }else{
                this[fieldName] = event.target.value;
            }
        } 
        // 法人の追加で必須項目が入力された場合、ボタンを有効化
        this.corporateRegistrationButton = this.siebelAccountCode && this.postalCodePrefix && this.postalCodeSuffix;
        // ユーザの登録で必須項目が入力された場合、ボタンを有効化
        this.userRegistrationButton = this.lastNameKana && this.firstNameKana && (this.phone || this.mobilePhone) && this.terms;
        // サービスの登録で必須項目が入力された場合、ボタンを有効化 
        this.serviceRegistrationButton =
            (
                (this.invoiceService && this.leaseLoanService)
                &&
                (this.invoiceTermsOfService && this.leaseLoanTermsOfService && this.regNumPlaceName && this.regNumClassificationNumber && this.regNumHiragana && this.regNumSerialNumber)
            )
            ||
            (
                (!this.invoiceService && this.leaseLoanService)
                &&
                (this.leaseLoanTermsOfService && this.regNumPlaceName && this.regNumClassificationNumber && this.regNumHiragana && this.regNumSerialNumber)
            )
            ||
            (
                (this.invoiceService && !this.leaseLoanService)
                &&
                (this.invoiceTermsOfService)
            );
    }

    // セクションを管理するフラグ
    CorporateRegistrationSection = true;
    UserRegistrationSection = false;
    UserConfirmationSection = false;
    ServiceSelectSection = false;
    ServiceRegistrationSection = false;
    ServicConfirmationSection = false;
    CompletionSection = false;

    // モーダルの状態を管理するフラグ
    showNoCorporationModal = false;
    showCcpUserModal = false;
    showCorporationCheckModal = false;
    showLeaseLoanAccountModal = false;
    showNoServiceSelectModal = false;

    //ログインユーザー情報
    contactId = '';
    lastName = '';
    firstName = '';
    email = '';

    territoryEmployeeFlag = false;

    //取引先項目
    @track siebelAccountCode = '';  
    @track postalCodePrefix = '';  
    @track postalCodeSuffix = '';  
    accountId = '';  
    accountName = '';
    accountAddress = '';
    corporateData = {
        siebelAccountCode: null,
        postalCodePrefix: null,
        postalCodeSuffix: null,
        accountId: null, 
        accountName: null,
        accountAddress: null
    };

    //取引先担当者項目
    @track lastNameKana = '';
    @track firstNameKana = '';
    @track title = '';
    @track department = '';
    @track email = '';
    @track phone = '';
    @track mobilePhone = '';
    contactData = {
        contactId: null,
        lastName: null,
        firstName: null,
        email: null,
    };
    contactInputData = {
        lastName: null,
        firstName: null,
        lastNameKana: null,
        firstNameKana: null,
        title: null,
        department: null,
        email: null,
        phone: null,
        mobilePhone: null
    };
    @track regNumPlaceName = '';
    @track regNumClassificationNumber = '';
    @track regNumHiragana = '';
    @track regNumSerialNumber = '';

    //サービス利用チェック
    @track vehicleService = false;
    @track invoiceService = false;
    @track leaseLoanService = false;
    e_invoiceName = '';

    //リース・ローン申込可能フラグ
    @track isAuthorizedSiebel = false;
    @track isAuthorizedForEinvoice = false;
    @track isAuthorizedForVehicleManagement = false;

    // 三菱ふそうカスタマーポータル利用規約チェック
    @track terms = false;
    // 部整月次請求書（電子版）利用規約チェック
    @track invoiceTermsOfService = false;
    // リース・ローン利用規約チェック
    @track leaseLoanTermsOfService = false;

    // エラーメッセージ
    // 法人の追加
    @track customerCodeError = '';
    @track postalCodeFrontError = '';
    @track postalCodeBackError = '';
    // ユーザの登録
    @track lastNameKanaError = '';
    @track firstNameKanaError = '';
    @track titleError = '';
    @track departmentError = '';
    @track phoneError = '';
    @track mobilePhoneError = '';
    // サービスの登録
    @track baseServiceError = '';
    @track regNumPlaceNameError = '';
    @track regNumClassificationNumberError = '';
    @track regNumHiraganaError = '';
    @track regNumSerialNumberError = '';

    // リース・ローン申込済みフラグ
    @track hasActiveLeaseLoan = false; // フラグ

    @track isConfirmDisabled = false;



    corporateNextClick() {
        const MAX_CUSTOMER_CODE_LENGTH = 10; // 顧客コードの最大文字数
        const onlyNumber = /^[0-9]*$/; // 数字のみのバリデーション用正規表現
        const alphanumericUppercase = /^[A-Z0-9]*$/; // 半角数字および英大文字のバリデーション用正規表現

        // 各項目のエラーメッセージ初期化
        this.customerCodeError = '';
        this.postalCodeFrontError = '';
        this.postalCodeBackError = '';

        // 顧客コードのバリデーション
        if (!this.siebelAccountCode) {
            this.customerCodeError = '入力内容に誤りがあります。内容をご確認ください。';
        } else if (this.siebelAccountCode.length > MAX_CUSTOMER_CODE_LENGTH) {
            this.customerCodeError = '入力内容に誤りがあります。内容をご確認ください。';
        } else if (!alphanumericUppercase.test(this.siebelAccountCode)) {
            this.customerCodeError = '入力内容に誤りがあります。内容をご確認ください。';
        }

        // 郵便番号（前3桁）のバリデーション
        if (!this.postalCodePrefix) {
            this.postalCodeFrontError = '入力内容に誤りがあります。内容をご確認ください。';
        } else if (!onlyNumber.test(this.postalCodePrefix) || this.postalCodePrefix.length !== 3) {
            this.postalCodeFrontError = '入力内容に誤りがあります。内容をご確認ください。';
        }

        // 郵便番号（後4桁）のバリデーション
        if (!this.postalCodeSuffix) {
            this.postalCodeBackError = '入力内容に誤りがあります。内容をご確認ください。';
        } else if (!onlyNumber.test(this.postalCodeSuffix) || this.postalCodeSuffix.length !== 4) {
            this.postalCodeBackError = '入力内容に誤りがあります。内容をご確認ください。';
        }

        // エラーがない場合に確認セクションへ移動
        if (!this.customerCodeError && !this.postalCodeFrontError && !this.postalCodeBackError) {
            // 入力内容を基にApexメソッドを呼び出す
            searchAccount({
                siebelAccountCode: this.siebelAccountCode,
                postalCodePrefix: this.postalCodePrefix,
                postalCodeSuffix: this.postalCodeSuffix
            })
            .then(result => {
                if (result.Status === '法人なし') {
                    this.modalType = 'noCorporation'; // 法人なしモーダルを表示
                } else if (result.Status === 'CCP利用あり') {
                    this.modalType = 'ccpUser'; // CCP利用ありモーダルを表示
                } else if (result.Status === '法人確認') {
                    this.modalType = 'corporationCheck'; // 法人確認モーダルを表示
                    this.accountName = result.accountName;
                    this.accountAddress = result.accountAddress;
                    this.corporateData = {
                        siebelAccountCode: this.siebelAccountCode,
                        postalCodePrefix: this.postalCodePrefix,
                        postalCodeSuffix: this.postalCodeSuffix,
                        accountId: result.accountId,
                        accountName: result.accountName,
                        accountAddress: result.accountAddress,
                        headOfficeId: result.headOfficeId
                    };
                    // Contact情報を保持
                    this.contactData = {
                        contactId: result.contactId,
                        lastName: result.lastName,
                        firstName: result.firstName,
                        email: result.email
                    };
                }
                // モーダルを表示
                this.showModal();
            })
            .catch(error => {
                console.error('エラー:', error);
            });
        }
        // get input data
        this.corporateData = {
            siebelAccountCode: this.siebelAccountCode,
            postalCodePrefix: this.postalCodePrefix,
            postalCodeSuffix: this.postalCodeSuffix,
        };
    }

    showModal() {
        // 全てのモーダルを非表示にする
        this.showNoCorporationModal = false;
        this.showCcpUserModal = false;
        this.showCorporationCheckModal = false;
        this.showLeaseLoanAccountModal = false;
        this.showNoServiceSelectModal = false;

        // modalTypeに応じて適切なモーダルを表示する
        switch (this.modalType) {
            case 'noCorporation':
                this.showNoCorporationModal = true;
                break;
            case 'ccpUser':
                this.showCcpUserModal = true;
                break;
            case 'corporationCheck':
                this.showCorporationCheckModal = true;
                break;
            case 'activeLeaseLoan':
                this.showLeaseLoanAccountModal = true;
                console.log( this.showLeaseLoanAccountModal);
                break;
            case 'NoServiceSelect':
                this.showNoServiceSelectModal = true;
                console.log( this.showNoServiceSelectModal);
                break;
            default:
                console.log('不明なモーダルタイプ:', this.modalType);
                break;
        }
    }
    
    closeModal() {
        this.showNoCorporationModal = false;
        this.showCcpUserModal = false;
        this.showCorporationCheckModal = false;
        this.showLeaseLoanAccountModal = false;
        this.showNoServiceSelectModal = false;
    }

    onPreviousCorporateButtonClick() {
        window.scrollTo(0, 0);
        // セクション表示の制御
        this.CorporateRegistrationSection = true;
        this.UserRegistrationSection = false;
        this.UserConfirmationSection = false;
        this.ServiceSelectSection = false;
        this.ServiceRegistrationSection = false;
        this.ServicConfirmationSection = false;
        this.CompletionSection = false;
        this.closeModal();
    }

    onConfirmCorporateNextButtonClick(){
        window.scrollTo(0, 0);
        // セクション表示の制御
        this.CorporateRegistrationSection = false;
        this.UserRegistrationSection = true;
        this.UserConfirmationSection = false;
        this.ServiceSelectSection = false;
        this.ServiceRegistrationSection = false;
        this.ServicConfirmationSection = false;
        this.CompletionSection = false;
        this.closeModal();
    }

    
    contactNextClick() {
        const MAX_NAME_KANA_LENGTH = 30; // 姓(フリガナ)と名(フリガナ)の最大文字数
        const MAX_PHONE_LENGTH = 11; // 電話番号と携帯番号の最大文字数
        const MAX_TITLE_LENGTH = 128; // 役職の最大文字数
        const MAX_DEPARTMENT_LENGTH = 80; // 部署の最大文字数
        const onlyNumber = /^[0-9]*$/; // 数字のみのバリデーション用正規表現

        // 各項目のエラーメッセージ初期化
        this.lastNameKanaError = '';
        this.firstNameKanaError = '';
        this.titleError = '';
        this.departmentError = '';
        this.phoneError = '';
        this.mobilePhoneError = '';

        // 氏名:姓(フリガナ)のバリデーション
        if (!this.lastNameKana) {
            this.lastNameKanaError = '入力内容に誤りがあります。内容をご確認ください。';
        } else if (this.lastNameKana.length > MAX_NAME_KANA_LENGTH) {
            this.lastNameKanaError = '入力内容に誤りがあります。内容をご確認ください。';
        }
        // 氏名:名(フリガナ)のバリデーション
        if (!this.firstNameKana) {
            this.firstNameKanaError = '入力内容に誤りがあります。内容をご確認ください。';
        } else if (this.firstNameKana.length > MAX_NAME_KANA_LENGTH) {
            this.firstNameKanaError = '入力内容に誤りがあります。内容をご確認ください。';
        }
        // 役職のバリデーション
        if (this.title.length > MAX_TITLE_LENGTH) {
            this.titleError = '入力内容に誤りがあります。内容をご確認ください。';
        }
        // 部署のバリデーション
        if (this.department.length > MAX_DEPARTMENT_LENGTH) {
            this.departmentError = '入力内容に誤りがあります。内容をご確認ください。';
        }
        //電話番号と携帯番号のどちらかが入力されているか
        if(!this.phone && !this.mobilePhone){
            this.phoneError = '入力内容に誤りがあります。内容をご確認ください。';
            this.mobilePhoneError = '入力内容に誤りがあります。内容をご確認ください。';
        }else{
            // 電話番号のバリデーション
            if (this.phone.length > MAX_PHONE_LENGTH) {
                this.phoneError = '入力内容に誤りがあります。内容をご確認ください。';
            }else if (!onlyNumber.test(this.phone)) {
                this.phoneError = '入力内容に誤りがあります。内容をご確認ください。';
            }
            // 携帯番号のバリデーション
            if (this.mobilePhone.length > MAX_PHONE_LENGTH) {
                this.mobilePhoneError = '入力内容に誤りがあります。内容をご確認ください。';
            }else if (!onlyNumber.test(this.mobilePhone)) {
                this.mobilePhoneError = '入力内容に誤りがあります。内容をご確認ください。';
            }
        }

        // エラーがない場合に確認セクションへ移動
        if (!this.lastNameKanaError && !this.firstNameKanaError && !this.titleError && !this.departmentError && !this.phoneError && !this.mobilePhoneError) {
            this.contactInputData = {
                lastNameKana: this.lastNameKana,
                firstNameKana: this.firstNameKana,
                title: this.title,
                department: this.department,
                phone: this.phone,
                mobilePhone: this.mobilePhone
            };
            window.scrollTo(0, 0);
            // セクション表示の制御
            this.CorporateRegistrationSection = false;
            this.UserRegistrationSection = false;
            this.UserConfirmationSection = true;
            this.ServiceSelectSection = false;
            this.ServiceRegistrationSection = false;
            this.ServicConfirmationSection = false;
            this.CompletionSection = false;
        }
        // get input data
        this.contactInputData = {
            lastName: this.lastName.value,
            firstName: this.firstName.value,
            lastNameKana: this.lastNameKana,
            firstNameKana: this.firstNameKana,
            title: this.title,
            department: this.department,
            email: this.email.value,
            phone: this.phone,
            mobilePhone: this.mobilePhone
        };
        console.log(this.contactInputData);

        checkSiebelAccountCode({siebelAccountCode: this.corporateData.siebelAccountCode }) 
        .then((result) => {
            console.log('SiebelAccountCode:' + result);
            console.log('SiebelAccountCode:' + this.corporateData.siebelAccountCode);
            if (result) {
                this.isAuthorizedSiebel = result;
            }
        })
        .catch((error) => {
            console.error('サービスエラー:', error);
        });

        checkAvailablePermissions({siebelAccountCode: this.corporateData.siebelAccountCode }) 
        .then((result) => {
            console.log('checkAvailablePermissions:' + result);
            console.log('checkAvailablePermissions:' + JSON.stringify(result));
            if (result) {
                this.isAuthorizedForVehicleManagement = result.Vehicle;
                this.isAuthorizedForEinvoice = result.eInvoice;
            }
        })
        .catch((error) => {
            console.error('サービスエラー:', error);
        });


        
        // `hasActiveLeaseLoanAccounts` を非同期で実行
        this.checkLeaseLoanStatus();
    }

    // 非同期処理を分離
    async checkLeaseLoanStatus() {
        try {
            const result = await hasActiveLeaseLoanAccounts({ headOfficeId: this.corporateData.headOfficeId });
            console.log('Lease Loan Status:', result);
            this.hasActiveLeaseLoan = result;
        } catch (error) {
            console.error('サービスエラー:', error);
        }
    }

    onConfirmContactNextButtonClick(){
        window.scrollTo(0, 0);
        // セクション表示の制御
        this.isAnyServiceNotSelected = true;
        this.CorporateRegistrationSection = false;
        this.UserRegistrationSection = false;
        this.UserConfirmationSection = false;
        this.ServiceSelectSection = true;
        this.ServiceRegistrationSection = false;
        this.ServicConfirmationSection = false;
        this.CompletionSection = false;
        console.log(this.hasActiveLeaseLoan);
    }

    // serviceCheckNextClick() {
    //     // エラーメッセージの初期化
    //     this.baseServiceError = '';
    //     console.log(this.hasActiveLeaseLoan);

    //     if (!this.invoiceService && !this.leaseLoanService) {
    //         this.baseServiceError = 'サービスを選択してください。';
    //     } else {
    //         if (this.hasActiveLeaseLoan) {
    //             console.log(this.hasActiveLeaseLoan);
    //             // 取引先が存在する場合は申込不可モーダルを表示
    //             this.modalType = 'activeLeaseLoan';
    //             // モーダルを表示
    //             this.showModal();
    //         } else {
    //             // 取引先が存在しない場合は通常の遷移処理を実行
    //             this.e_invoiceName = '部整月次請求書（電子版）';

    //             window.scrollTo(0, 0);

    //             // セクション表示の制御
    //             this.CorporateRegistrationSection = false;
    //             this.UserRegistrationSection = false;
    //             this.UserConfirmationSection = false;
    //             this.ServiceSelectSection = false;
    //             this.ServiceRegistrationSection = false;
    //             this.ServicConfirmationSection = true;
    //             this.CompletionSection = false;
    //         }
    //     }
    // }

    //保持しているcontactの情報をSalesforceにupdateしたい
    async onConfirmServiceNextButtonClick(){
        this.isConfirmDisabled = true; // ボタンを無効化
        // Contactデータを準備
        const contactToUpdate = {
            Id: this.contactData.contactId,
            LastNameKana__c: this.contactInputData.lastNameKana || '',
            FirstNameKana__c: this.contactInputData.firstNameKana || '',
            Title: this.contactInputData.title || '',
            Department: this.contactInputData.department || '',
            Phone: this.contactInputData.phone || '',
            MobilePhone: this.contactInputData.mobilePhone || '',
            LeaseLoanRegisteredVehicleName: this.leaseLoanRegisteredVehicleName || ''
        };

       
        console.log('invoiceService:', this.invoiceService);
        console.log('invoiceService:', this.leaseLoanService);
        console.log('Type of this.invoiceService.checked:', typeof this.invoiceService);
        console.log('Type of this.invoiceService.checked:', typeof this.leaseLoanService);
            getTerritoryEmployeeStatus({ accountId: this.corporateData.accountId })
            .then(result => {
                this.territoryEmployeeFlag = result;
                console.log('territoryEmployeeFlag2:', this.territoryEmployeeFlag);

                if (!this.territoryEmployeeFlag && this.invoiceService) {
           
                    // テリトリ社員が存在しない場合の処理を追加
                    sendNoTerritoryManagerNotificationEmail({ accountId: this.corporateData.accountId , contactInputData: contactToUpdate})
                        .then(() => {
                            console.log('通知メールを送信しました');
                        })
                        .catch(error => {
                            console.error('通知メール送信中にエラーが発生:', error);
                        });

                    console.log('テリトリ社員が存在しません');
                }
            })
            .catch(error => {
                console.error('getTerritoryEmployeeStatusの実行中にエラーが発生:', error);
            });

        
        // Apexメソッドを呼び出してContactを更新
        await updateContact({ contactInputData: contactToUpdate ,accountId:this.corporateData.accountId})
        .then(async () => {
            console.log('Contact updated successfully');

            //権限セット付与
            await setPermissionSetForManagerUser({vehicleService: this.vehicleService, invoiceService: this.invoiceService, leaseLoanService: this.leaseLoanService});
                
            //e-invoice申込通知メールをSC担当者に送信
            sendCCPSCContactEmail({accountId:this.corporateData.accountId, contactId: contactToUpdate.Id, invoiceService: this.invoiceService, leaseLoanService: this.leaseLoanService});

            console.log(this.termsUrls.CCP.id);
            console.log(this.termsUrls.EInvoice.id);
            console.log(this.termsUrls.DTFSA.id);
            // CCP利用規約に同意したことを記録
            createTermsNotification({termId: this.termsUrls.CCP.id});

            // E_invoiceまたはリース・ローンの利用申し込みがある場合
            if(this.invoiceService || this.leaseLoanService || this.vehicleService){
                await updateAccessControlAsync({contactId: contactToUpdate.Id, vehicleService: this.vehicleService, invoiceService: this.invoiceService, leaseLoanService: this.leaseLoanService})
                // E_invoiceの利用申し込みがある場合
                if(this.invoiceService){
                    //変更登録申請書と同意書の送信メールをSC担当者に送信
                    if(this.territoryEmployeeFlag){
                    getOpenVisualforcePage({accountId:this.corporateData.accountId, contactInputData: contactToUpdate});
                    }
                    // E-invoice利用規約に同意したことを記録
                    createTermsNotification({termId: this.termsUrls.EInvoice.id});
                }
                // リース・ローンの利用申し込みがある場合
                if(this.leaseLoanService){
                    updateLeaseLoanStatus({accountId:this.corporateData.accountId})
                    // DTFSA利用規約に同意したことを記録
                    createTermsNotification({termId: this.termsUrls.DTFSA.id});
                }
            }

            console.log('RF通知');
        
            // セクション表示の制御
            this.CorporateRegistrationSection = false;
            this.UserRegistrationSection = false;
            this.UserConfirmationSection = false;
            this.ServiceSelectSection = false;
            this.ServiceRegistrationSection = false;
            this.ServicConfirmationSection = false;
            this.CompletionSection = true;
            this.closeModal();
        })
        .catch(error => {
           console.error('Error updating contact:', error);
        });
    }

    // 戻るボタンクリック
    onPreviousButtonClick() {
        window.scrollTo(0, 0);
        // セクション表示の制御
        if(this.UserRegistrationSection){
            this.CorporateRegistrationSection = true;
            this.UserRegistrationSection = false;
        }else if(this.UserConfirmationSection){
            this.UserRegistrationSection = true;
            this.UserConfirmationSection = false;
        }else if(this.ServiceSelectSection){
            this.UserConfirmationSection = true;
            this.ServiceSelectSection = false;
        }else if(this.ServiceRegistrationSection){
            this.ServiceSelectSection = true;
            this.ServiceRegistrationSection = false;
        }else if(this.ServicConfirmationSection){
            this.ServiceRegistrationSection = true;
            this.ServicConfirmationSection = false;
        }
    }
    
    @track isAnyServiceNotSelected = true;

    /* Modified by Singh Jashanpreet on 10/04/2025 */
    // ➃サービスの選択で次へボタンクリック
    onServiceSelectNextButtonClick() {
        if(!this.leaseLoanService && !this.invoiceService && !this.vehicleService){
            // 取引先が存在する場合は申込不可モーダルを表示
            // this.modalType = 'NoServiceSelect';
            // モーダルを表示
            // this.showModal();
            this.isAnyServiceNotSelected = true;
        }else{
            this.isAnyServiceNotSelected = false;
        }
        if(!this.leaseLoanService && !this.invoiceService && this.vehicleService){
            //code here
            this.showNoCorporationModal = false;
            this.showCcpUserModal = false;
            this.showCorporationCheckModal = false;
            this.showLeaseLoanAccountModal = false;
            this.showNoServiceSelectModal = false;
            this.onConfirmServiceNextButtonClick();
        }
        else if (this.leaseLoanService) {
            if (this.hasActiveLeaseLoan) {
                // 取引先が存在する場合は申込不可モーダルを表示
                this.modalType = 'activeLeaseLoan';
                // モーダルを表示
                this.showModal();
            } else {
                // 取引先が存在しない場合は通常の遷移処理を実行
                this.e_invoiceName = '部整月次請求書（電子版）';
                window.scrollTo(0, 0);
                // セクション表示の制御
                this.CorporateRegistrationSection = false;
                this.UserRegistrationSection = false;
                this.UserConfirmationSection = false;
                this.ServiceSelectSection = false;
                this.ServiceRegistrationSection = true;
                this.ServicConfirmationSection = false;
                this.CompletionSection = false;
            }
        }else{
            window.scrollTo(0, 0);
            // セクション表示の制御
            this.CorporateRegistrationSection = false;
            this.UserRegistrationSection = false;
            this.UserConfirmationSection = false;
            this.ServiceSelectSection = false;
            this.ServiceRegistrationSection = true;
            this.ServicConfirmationSection = false;
            this.CompletionSection = false;
        }
    }

    // ➃サービスの登録で次へボタンクリック
    onServiceRegistrationNextButtonClick() {

         // エラーメッセージの初期化
         this.baseServiceError = '';

         if (!this.invoiceService && !this.leaseLoanService) {
             this.baseServiceError = '利用規約に同意してください';
         } else if(this.leaseLoanService) {
            
             this.e_invoiceName = '部整月次請求書（電子版）';
             const VEHICLE_NAME1_LENGTH = 4;
             const VEHICLE_NAME2_LENGTH = 3;
             const VEHICLE_NAME3_LENGTH = 1;
             const VEHICLE_NAME4_LENGTH = 4;
             const onlyAlphanumeric  = /^[a-zA-Z0-9]*$/; // 半角英数字のみのバリデーション用正規表現
             const specialCharacters = /[!@#$%^&*()_+={}[\]:;"'<>,.?/\\|`~]/;
 
             // 各項目のエラーメッセージ初期化
             this.regNumPlaceNameError = '';
             this.regNumClassificationNumberError = '';
             this.regNumHiraganaError = '';
             this.regNumSerialNumberError = '';
         
             console.log('結合した車両名:', this.regNumPlaceName);
             console.log('結合した車両名:', this.regNumClassificationNumber);
             console.log('結合した車両名:', this.regNumHiragana);
             console.log('結合した車両名:', this.regNumSerialNumber);
             // regNumPlaceNameのバリデーション
             if (!this.regNumPlaceName) {
                 this.regNumPlaceNameError = '入力内容に誤りがあります。内容をご確認ください。';
             } else if (this.regNumPlaceName.length > VEHICLE_NAME1_LENGTH) {
                 this.regNumPlaceNameError = '入力内容に誤りがあります。内容をご確認ください。';
             }else if (specialCharacters.test(this.regNumPlaceName)){
                this.regNumPlaceNameError = '入力内容に誤りがあります。内容をご確認ください。';
             }
             // regNumClassificationNumberのバリデーション
             if (!this.regNumClassificationNumber) {
                 this.regNumClassificationNumberError = '入力内容に誤りがあります。内容をご確認ください。';
             } else if (this.regNumClassificationNumber.length > VEHICLE_NAME2_LENGTH) {
                 this.regNumClassificationNumberError = '入力内容に誤りがあります。内容をご確認ください。';
             }else if (!onlyAlphanumeric.test(this.regNumClassificationNumber)) {
                 this.regNumClassificationNumberError = '入力内容に誤りがあります。内容をご確認ください。';
             }
             // regNumHiraganaのバリデーション
             if (!this.regNumHiragana) {
                 this.regNumHiraganaError = '入力内容に誤りがあります。内容をご確認ください。';
             } else if (this.regNumHiragana.length > VEHICLE_NAME3_LENGTH) {
                 this.regNumHiraganaError = '入力内容に誤りがあります。内容をご確認ください。';
             }else if (specialCharacters.test(this.regNumHiragana)){
                this.regNumPlaceNameError = '入力内容に誤りがあります。内容をご確認ください。';
             }
             // regNumSerialNumberのバリデーション
             if (!this.regNumSerialNumber) {
                 this.regNumSerialNumberError = '入力内容に誤りがあります。内容をご確認ください。';
             } else if (this.regNumSerialNumber.length > VEHICLE_NAME4_LENGTH) {
                 this.regNumSerialNumberError = '入力内容に誤りがあります。内容をご確認ください。';
             } else if (!onlyAlphanumeric.test(this.regNumSerialNumber)) {
                 this.regNumSerialNumberError = '入力内容に誤りがあります。内容をご確認ください。';
             }
 
            // エラーがない場合に確認セクションへ移動
            if (!this.regNumPlaceNameError && !this.regNumClassificationNumberError && !this.regNumHiraganaError && !this.regNumSerialNumberError) {
                // 4つの名前を結合
                this.leaseLoanRegisteredVehicleName = this.regNumPlaceName + this.regNumClassificationNumber + this.regNumHiragana + this.regNumSerialNumber;

                // 結合結果の確認用（必要に応じて削除）
                console.log('結合した車両名:', this.leaseLoanRegisteredVehicleName);

                window.scrollTo(0, 0);
                // セクション表示の制御
                this.CorporateRegistrationSection = false;
                this.UserRegistrationSection = false;
                this.UserConfirmationSection = false;
                this.ServiceSelectSection = false;
                this.ServiceRegistrationSection = false;
                this.ServicConfirmationSection = true;
                this.CompletionSection = false;
            }
         } else if(this.invoiceService) {
            window.scrollTo(0, 0);
            // セクション表示の制御
            this.CorporateRegistrationSection = false;
            this.UserRegistrationSection = false;
            this.UserConfirmationSection = false;
            this.ServiceSelectSection = false;
            this.ServiceRegistrationSection = false;
            this.ServicConfirmationSection = true;
            this.CompletionSection = false;
         }
    }
}
//getAccountDetails
//getExistingMaintenance
//editExistingMaintenance
//createNewsAndDelete
//getServicesStatus
//getAllAssociatedAccounts
//createInvoiceGroup
//assignPermission
//sendNotificationEmail
public without sharing class CCP2_Additional_Services {
  @AuraEnabled(cacheable=true)
  public static Account getAccountDetails() {
    Id ccpUserId = UserInfo.getUserId();
    Account account = new Account();
    // Id ccpUserId = '005Io000000uTA3IAM';
    try {
      User user = [
        SELECT Id, FirstName, AccountId
        FROM User
        WHERE Id = :ccpUserId
        LIMIT 1
      ];
      account = [
        SELECT
          Id,
          lbc_head_office_id__c,
          siebelAccountCode__c,
          integrationcode__c
        FROM Account
        WHERE Id = :user.AccountId
        LIMIT 1
      ];
      if (Test.isRunningTest() && user.FirstName == 'ThrowException') {
        throw new QueryException('Simulated test exception');
      }
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('An error occurred: ' + e.getMessage());
    }
    System.debug(account);
    return account;
  }

  @AuraEnabled
  public static String getExistingMaintenance(
    Date scheduleDate,
    Date scheduleEndDate,
    String vehicleId,
    String serviceType,
    Integer refreshToken
  ) {
    try {
      List<String> inspectionTypes = new List<String>{
        '3ヵ月点検',
        '6ヵ月点検',
        '12ヵ月点検',
        '24ヵ月点検'
      };
      if (
        scheduleDate != null &&
        scheduleEndDate != null &&
        serviceType != null &&
        vehicleId != null
      ) {
        List<CCP2_Maintenance_Booking__c> existingList = [
          SELECT
            Id,
            Schedule_Date__c,
            Schedule_EndDate__c,
            Service_Type__c,
            Vehicle__c
          FROM CCP2_Maintenance_Booking__c
          WHERE
            Schedule_Date__c <= :scheduleEndDate
            AND Schedule_EndDate__c >= :scheduleDate
            AND Vehicle__c = :vehicleId
        ];
        for (CCP2_Maintenance_Booking__c existing : existingList) {
          String existingType = existing.Service_Type__c;
          if (existingType == null)
            continue;
          Boolean isCurrentInspection = inspectionTypes.contains(serviceType);
          Boolean isExistingInspection = inspectionTypes.contains(existingType);
          /*if (existingType == '一般整備' && serviceType == '一般整備') {
                        return false;
                    }*/
          if (existingType == '車検整備' && serviceType == '車検整備') {
            return 'この予定日には車検の予定がすでに登録されています。';
          }
          if (isExistingInspection && isCurrentInspection) {
            return 'この予定日には点検の予定がすでに登録されています。';
          }
        }
      }
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('An error occurred: ' + e.getMessage());
    }
    return '';
  }

  @AuraEnabled
  public static String editExistingMaintenance(
    Date scheduleDate,
    Date scheduleEndDate,
    String vehicleId,
    String serviceType,
    Integer refreshToken,
    String Id
  ) {
    try {
      List<String> inspectionTypes = new List<String>{
        '3ヵ月点検',
        '6ヵ月点検',
        '12ヵ月点検',
        '24ヵ月点検'
      };
      if (
        scheduleDate != null &&
        scheduleEndDate != null &&
        serviceType != null &&
        vehicleId != null
      ) {
        List<CCP2_Maintenance_Booking__c> existingList = [
          SELECT
            Id,
            Schedule_Date__c,
            Schedule_EndDate__c,
            Service_Type__c,
            Vehicle__c
          FROM CCP2_Maintenance_Booking__c
          WHERE
            Schedule_Date__c <= :scheduleEndDate
            AND Schedule_EndDate__c >= :scheduleDate
            AND Vehicle__c = :vehicleId
        ];
        for (CCP2_Maintenance_Booking__c existing : existingList) {
          String existingType = existing.Service_Type__c;
          if (existingType == null)
            continue;
          Boolean isCurrentInspection = inspectionTypes.contains(serviceType);
          Boolean isExistingInspection = inspectionTypes.contains(existingType);
          /*if (existingType == '一般整備' && serviceType == '一般整備' && existing.Id != Id) {
                        return false;
                    }*/
          if (
            existingType == '車検整備' &&
            serviceType == '車検整備' &&
            existing.Id != Id
          ) {
            return 'この予定日には車検の予定がすでに登録されています。';
          }
          if (
            isExistingInspection &&
            isCurrentInspection &&
            existing.Id != Id
          ) {
            return 'この予定日には点検の予定がすでに登録されています。';
          }
        }
      }
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('An error occurred: ' + e.getMessage());
    }
    return '';
  }

  @InvocableMethod(label='News')
  public static void createNewsAndDelete() {
    Date today = Date.today();
    DateTime startOfDay = DateTime.newInstance(
      today,
      Time.newInstance(0, 0, 0, 0)
    );
    DateTime endOfDay = DateTime.newInstance(
      today,
      Time.newInstance(23, 59, 59, 0)
    );
    System.debug(startOfDay + '' + endOfDay);
    try {
      List<Knowledge__kav> newsList = [
        SELECT Id, Description__c, validDateFrom__c, Title, validDateTo__c
        FROM Knowledge__kav
        WHERE
          validDateFrom__c >= :startOfDay
          AND validDateFrom__c < :endOfDay
          AND (Record_Type_Name__c = 'News'
          OR Record_Type_Name__c = 'UrgentNews')
      ];
      List<CCP2_Notification__c> notificationsToInsert = new List<CCP2_Notification__c>();
      for (Knowledge__kav news : newsList) {
        CCP2_Notification__c notification = new CCP2_Notification__c();

        notification.Notification_Type__c = 'News';
        notification.News_Description__c = news.Description__c;
        notification.News_Title__c = news.Title;
        notification.File_Name__c = 'News';
        notification.News_Id__c = news.Id;
        //notification.News_Expiry_Date__c = news.validDateTo__c.date();

        notificationsToInsert.add(notification);
      }
      if (!notificationsToInsert.isEmpty()) {
        insert notificationsToInsert;
        System.debug(
          'Inserted ' + notificationsToInsert.size() + ' notifications.'
        );
      } else {
        System.debug('No notifications to insert.');
      }

      List<CCP2_Notification__c> newsDeleteList = [
        SELECT Id, Notification_Type__c, News_Expiry_Date__c
        FROM CCP2_Notification__c
        WHERE
          Notification_Type__c = 'News'
          AND File_Name__c = 'News'
          AND Seen_Flag__c = FALSE
          AND News_Expiry_Date__c <= :Date.today()
      ];
      for (CCP2_Notification__c notification : newsDeleteList) {
        notification.Seen_Flag__c = true;
      }
      if (!newsDeleteList.isEmpty()) {
        update newsDeleteList;
        System.debug(
          'Updates ' + notificationsToInsert.size() + ' notifications.'
        );
      } else {
        System.debug('No notifications to Update.');
      }
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('An error occurred: ' + e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static Map<String, Boolean> getServicesStatus() {
    Map<String, Boolean> result = new Map<String, Boolean>();
    //Id ccpUserId = '005Io000000uhNVIAY';
    Id ccpUserId = UserInfo.getUserId();
    try {
      //Account userAccount = [select id,lbc_head_office_id__c,Lease_Loan_UsageStatus__c from Account where id = '001Io000006WPcZIAW'];
      Account userAccount = getAccountDetails();

      if (userAccount == null) {
        throw new AuraHandledException(
          'No account details found for current user.'
        );
      }

      String lbcCode = userAccount.lbc_head_office_id__c;
      System.debug('lbcCode: ' + lbcCode);

      Boolean isAdmin = [
        SELECT id, UserId__c, canManageMember__c
        FROM contact
        WHERE UserId__c = :ccpUserId
        LIMIT 1
      ]
      .canManageMember__c;
      Boolean restrictLeasePermission =
        [
          SELECT id, lbc_head_office_id__c, Lease_Loan_UsageStatus__c
          FROM account
          WHERE
            lbc_head_office_id__c = :lbcCode
            AND Lease_Loan_UsageStatus__c = TRUE
          LIMIT 1
        ]
        .size() > 0;

      // if(!isAdmin){
      //     result.put('isLeasePermission', false);
      //     result.put('isVehPermission', false);
      //     result.put('isEinvoicePermission', false);
      //     result.put('restrictLeasePermission', restrictLeasePermission);
      //     result.put('isAdmin', false);

      //     System.Debug('result Non Admin' + result);
      //     return result;
      // }

      Id leasePermissionId = [
        SELECT Id
        FROM PermissionSet
        WHERE Name = 'FUSO_CCP_External_Financial_service'
        LIMIT 1
      ]
      .Id;
      Id vehPermissionId = [
        SELECT Id
        FROM PermissionSet
        WHERE Name = 'FUSO_CCP_External_Vehicle_management'
        LIMIT 1
      ]
      .Id;
      Id einvoicePermissionId = [
        SELECT Id
        FROM PermissionSet
        WHERE Name = 'E_invoice'
        LIMIT 1
      ]
      .Id;
      List<PermissionSetAssignment> psaList = [
        SELECT PermissionSetId
        FROM PermissionSetAssignment
        WHERE
          AssigneeId = :ccpUserId
          AND PermissionSetId IN :new Set<Id>{
            leasePermissionId,
            vehPermissionId,
            einvoicePermissionId
          }
      ];
      Set<Id> assignedPermissions = new Set<Id>();
      for (PermissionSetAssignment psa : psaList) {
        assignedPermissions.add(psa.PermissionSetId);
      }
      // Set flags in result map
      result.put(
        'isLeasePermission',
        assignedPermissions.contains(leasePermissionId)
      );
      result.put('restrictLeasePermission', restrictLeasePermission);
      result.put(
        'isVehPermission',
        assignedPermissions.contains(vehPermissionId)
      );
      result.put(
        'isEinvoicePermission',
        assignedPermissions.contains(einvoicePermissionId)
      );
      result.put('isAdmin', isAdmin);

      System.Debug('result Admin' + result);
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('An error occurred: ' + e.getMessage());
    }
    return result;
  }

  @AuraEnabled(cacheable=true)
  public static List<Map<String, Object>> getAllAssociatedAccounts() {
    //Account userAccount = [select id,lbc_head_office_id__c,integrationcode__c from Account where id = '001Io000006APW6IAO'];
    Account userAccount = getAccountDetails();
    String UserIntegrationCode = userAccount.integrationcode__c;
    List<Map<String, Object>> result = new List<Map<String, Object>>();

    try {
      List<Account> accList = [
        SELECT
          Id,
          Name,
          siebelAccountCode__c,
          ShippingAddress,
          invoiceGroup__c,
          integrationcode__c,
          ShippingPostalCode,
          prefectureCodeForce__c,
          ShippingCity
        FROM Account
        WHERE
          integrationcode__c = :UserIntegrationCode
          AND integrationcode__c != NULL
          AND Id != :userAccount.Id
      ];
      System.debug(accList.size());
      System.debug(accList);
      for (Account acc : accList) {
        Map<String, Object> temMap = new Map<String, Object>();
        temMap.put('Id', acc.Id);
        temMap.put('Name', acc.Name);
        temMap.put('siebelAccountCode__c', acc.siebelAccountCode__c);
        temMap.put('ShippingAddress', acc.ShippingAddress);
        if (acc.ShippingPostalCode == '' || acc.ShippingPostalCode == null) {
          temMap.put('ShippingPostalCode', '');
        } else {
          temMap.put('ShippingPostalCode', '〒' + acc.ShippingPostalCode);
        }
        temMap.put('prefectureCodeForce__c', acc.prefectureCodeForce__c);
        temMap.put('ShippingCity', acc.ShippingCity);
        temMap.put('invoiceGroup__c', acc.invoiceGroup__c);
        temMap.put('integrationcode__c', acc.integrationcode__c);
        if (String.isNotBlank(acc.invoiceGroup__c)) {
          temMap.put('HasInvoiceGroup', true);
        } else {
          temMap.put('HasInvoiceGroup', false);
        }

        System.debug(temMap);
        result.add(temMap);
      }
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('An error occurred: ' + e.getMessage());
    }
    System.debug(result);
    return result;
  }

  /*@AuraEnabled
    public static void createInvoiceGroup(List<Id> accIds,String permissionName, String regNum){
        //User user = [Select Id,AccountId,ContactId,Email,Name from User Where Id = '005Io000000uj6qIAA' Limit 1];
        User user = [Select Id,AccountId,Email,ContactId,Name from User Where Id = :UserInfo.getUserId() Limit 1];
        Id accId = user.AccountId;
        System.debug(accId);
        Map<String, Object> contactData = new Map<String, Object>();
        try{
            if(permissionName == 'E-invoice'){
                assignPermission(user.id , 'E_invoice');

                CCP2_Access_Control__c  accessControl = [select id from CCP2_Access_Control__c where name = :user.Id limit 1];
                System.debug(accessControl);
                if(accessControl != null){
                    accessControl.E_invoice_Flag__c = true;
                }
                   
                upsert accessControl;
                System.debug(accessControl);
                
                Contact contact = [Select Id,Name,Email from Contact where UserId__c = :user.Id];
                contactData.put('Name',contact.Name);
                contactData.put('Email',contact.Email);
                System.debug(contactData);
                if (accIds == null || accIds.isEmpty()) {
                    System.debug('here');
                    CCP_RegisterAdminUserCtrl.sendCCPSCContactEmail(accId,user.ContactId,true,false);
                    CCP_CustomerMasterChangeRequestFormCtrl.sendNoTerritoryManagerNotificationEmail(accId,contactData);
                    return;
                }
                accIds.add(accId);
                String accountName = [Select Id,Name from Account where Id =: accId Limit 1].Name;
                InvoiceGroup__c invoiceGroup = new InvoiceGroup__c(Name = accountName);
                insert invoiceGroup;
                List<Account> accounts = [Select Id,invoiceGroup__c from Account where Id IN : accIds];
                for(Account acc : accounts){
                   acc.invoiceGroup__c = invoiceGroup.Id; 
                }
                update accounts;
                Account eInvoiceMaster = [Select Id,EinvoiceGroupApplicant__c from Account where Id = :accId Limit 1];
                eInvoiceMaster.EinvoiceGroupApplicant__c = true;
                update eInvoiceMaster;
            }else if(permissionName == 'Vehicle'){
               assignPermission(user.id , 'FUSO_CCP_External_Vehicle_management');


                CCP2_Access_Control__c  accessControl = [select id from CCP2_Access_Control__c where name = :user.Id and Contact__c = :user.ContactId limit 1];
                  
                if(accessControl != null){
                    accessControl.Vehicle_management_Flag__c = true;
                }
                   
                upsert accessControl;
            }else if(permissionName == 'DTFSA'){
                assignPermission(user.id , 'FUSO_CCP_External_Financial_service');

                Account acc = [select id from Account where id = :accId];
                acc.Lease_Loan_UsageStatus__c  = true;
                update acc;

                CCP2_Access_Control__c  accessControl = [select id from CCP2_Access_Control__c where name = :user.Id and Contact__c = :user.ContactId limit 1];
                  
                if(accessControl != null){
                    accessControl.Financial_service_Flag__c = true;
                }
                upsert accessControl;
                
                Contact contact = [Select Id,leaseLoanRegisteredVehicleName__c from Contact where UserId__c = :user.Id];
                if(contact != null){
                    contact.leaseLoanRegisteredVehicleName__c = regNum;
                }
                update contact;
                System.debug(contact.leaseLoanRegisteredVehicleName__c);
            }
            sendServiceConfirmationEmail(user.Email,user.Name,permissionName);
        }
        catch(Exception e){
            CCP2_HandlerForException.LogException(e);
            System.debug('An error occurred: ' + e.getMessage());
        }
    }*/

  @AuraEnabled
  public static void createInvoiceGroup(
    List<Id> accIds,
    String permissionName,
    String regNum
  ) {
    //User user = [Select Id,AccountId,ContactId,Email,Name from User Where Id = '005BW000005YvnNYAS' Limit 1];
    User user = [
      SELECT Id, AccountId, Email, ContactId, Name
      FROM User
      WHERE Id = :UserInfo.getUserId()
      LIMIT 1
    ];
    System.debug(user);
    Id accId = user.AccountId;
    System.debug(accId);
    Boolean emailShouldSend = false;
    Map<String, Object> contactData = new Map<String, Object>();
    try {
      if (permissionName == 'E-invoice') {
        try {
          assignPermission(user.id, 'E_invoice');

          CCP2_Access_Control__c accessControl = [
            SELECT Id
            FROM CCP2_Access_Control__c
            WHERE Name = :user.Id
            LIMIT 1
          ];
          if (accessControl != null) {
            accessControl.E_invoice_Flag__c = true;
            upsert accessControl;
          }
          Contact contact = [
            SELECT Id, Name, Email
            FROM Contact
            WHERE UserId__c = :user.Id
          ];
          contactData.put('Name', contact.Name);
          contactData.put('Email', contact.Email);
          if (accIds == null || accIds.isEmpty()) {
            CCP_RegisterAdminUserCtrl.sendCCPSCContactEmail(
              accId,
              user.ContactId,
              true,
              false
            );
            //CCP_CustomerMasterChangeRequestFormCtrl.sendNoTerritoryManagerNotificationEmail(accId,contactData);
            emailShouldSend = true;
          } else {
            accIds.add(accId);
            String accountName = [
              SELECT Name
              FROM Account
              WHERE Id = :accId
              LIMIT 1
            ]
            .Name;
            InvoiceGroup__c invoiceGroup = new InvoiceGroup__c(
              Name = accountName
            );
            insert invoiceGroup;
            List<Account> accounts = [
              SELECT Id, invoiceGroup__c
              FROM Account
              WHERE Id IN :accIds
            ];
            for (Account acc : accounts) {
              acc.invoiceGroup__c = invoiceGroup.Id;
            }
            update accounts;
            Account eInvoiceMaster = [
              SELECT Id, EinvoiceGroupApplicant__c
              FROM Account
              WHERE Id = :accId
              LIMIT 1
            ];
            eInvoiceMaster.EinvoiceGroupApplicant__c = true;
            update eInvoiceMaster;
            emailShouldSend = true;
          }
        } catch (Exception ex) {
          CCP2_HandlerForException.LogException(ex);
        }
      } else if (permissionName == 'Vehicle') {
        try {
          assignPermission(user.id, 'FUSO_CCP_External_Vehicle_management');

          CCP2_Access_Control__c accessControl = [
            SELECT Id
            FROM CCP2_Access_Control__c
            WHERE Name = :user.Id AND Contact__c = :user.ContactId
            LIMIT 1
          ];
          if (accessControl != null) {
            accessControl.Vehicle_management_Flag__c = true;
            upsert accessControl;
          }
          emailShouldSend = true;
        } catch (Exception ex) {
          CCP2_HandlerForException.LogException(ex);
        }
      } else if (permissionName == 'DTFSA') {
        try {
          assignPermission(user.id, 'FUSO_CCP_External_Financial_service');

          Account acc = [SELECT Id FROM Account WHERE Id = :accId];
          acc.Lease_Loan_UsageStatus__c = true;
          update acc;

          CCP2_Access_Control__c accessControl = [
            SELECT Id
            FROM CCP2_Access_Control__c
            WHERE Name = :user.Id AND Contact__c = :user.ContactId
            LIMIT 1
          ];
          if (accessControl != null) {
            accessControl.Financial_service_Flag__c = true;
            upsert accessControl;
          }

          Contact contact = [
            SELECT Id, leaseLoanRegisteredVehicleName__c
            FROM Contact
            WHERE UserId__c = :user.Id
            LIMIT 1
          ];
          if (contact != null) {
            contact.leaseLoanRegisteredVehicleName__c = regNum;
            update contact;
          }

          emailShouldSend = true;
        } catch (Exception ex) {
          CCP2_HandlerForException.LogException(ex);
        }
      }

      // Always send the email if all logic succeeded
      if (emailShouldSend) {
        sendServiceConfirmationEmail(user.Email, user.Name, permissionName);
      }
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('An error occurred: ' + e.getMessage());
    }
  }

  @future
  public static void assignPermission(Id assigeeId, String permissionSetName) {
    try {
      PermissionSetAssignment permission = new PermissionSetAssignment(
        AssigneeId = assigeeId,
        PermissionSetId = [
          SELECT Id
          FROM PermissionSet
          WHERE Name = :permissionSetName
          LIMIT 1
        ]
        .Id
      );
      insert permission;
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('An error occurred: ' + e.getMessage());
    }
  }

  @AuraEnabled
  public static void sendServiceConfirmationEmail(
    String recipientEmail,
    String userName,
    String serviceName
  ) {
    // Email subject and body
    String subject = '';
    String body = userName + '様<br><br>';

    if (serviceName == 'E-invoice') {
      body += 'この度は部整月次請求書（電子版）サービスに申し込みいただき、誠にありがとうございます。<br><br>';
      body += '大変申し訳ありませんが、手続きのため利用開始まで5営業日程度お時間をいただいております。ご利用開始となりましたら改めてメールにてご連絡いたします。今しばらくお待ちください。<br><br>';
    }
    if (serviceName == 'DTFSA') {
      body += 'この度はFUSOリースサービスに申し込みいただき、誠にありがとうございます。<br><br>';
      body += '大変申し訳ありませんが、手続きのため利用開始まで5営業日程度お時間をいただいております。ご利用開始となりましたら改めてメールにてご連絡いたします。今しばらくお待ちください。<br><br>';
    }
    if (serviceName == 'Vehicle') {
      body += 'この度は車両管理サービスに申し込みいただき、誠にありがとうございます。<br><br>';
      body += '申込完了後、すぐにご利用いただけます。トップページの「車両管理」をクリックすると車両一覧画面にアクセスいただけますので、はじめに車両登録を行ってください。車両登録完了後、各種機能をぜひご活用ください。<br><br>';
    }

    body +=
      '' +
      'ご利用開始直後は管理者の方のみがご利用いただけます。<br>' +
      '他のユーザにもご利用いただくには、管理者の方が会員管理画面で「利用サービス」の設定を変更してください。<br><br>' +
      'なお、カスタマーポータルのご利用方法につきましてはユーザーマニュアルをご参照ください。<br>' +
      'マニュアルは以下のリンクからダウンロードいただけます。<br>' +
      '<a href="https://fuso-family.mitsubishi-fuso.com/s/manual">ユーザーマニュアルダウンロード</a><br>' +
      '<a href="https://fuso-family.mitsubishi-fuso.com/s/">トップページ</a><br><br>' +
      'また、ご不明な点やお困りごとがございましたら以下の方法でお気軽にお問い合わせください。<br>' +
      'お問い合わせフォーム' +
      '<a href="https://fuso-family.mitsubishi-fuso.com/s/inquiry">https://fuso-family.mitsubishi-fuso.com/s/inquiry</a>';

    OrgWideEmailAddress owea = [
      SELECT Id
      FROM OrgWideEmailAddress
      WHERE Address = 'no-reply_fusoportal@daimlertruck.com'
      LIMIT 1
    ];
    Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
    email.setToAddresses(new List<String>{ recipientEmail });
    email.setSubject(subject);
    email.setHtmlBody(body);
    email.setOrgWideEmailAddressId(owea.Id); // Send from static email

    // Send the email
    try {
      Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ email });
    } catch (Exception e) {
      System.debug('Error sending email: ' + e.getMessage());
    }
  }

  public static void sendNotificationEmail(List<CCP2_Notification__c> newList) {
    try {
      Set<Id> newNotificationIds = new Set<Id>();
      for (CCP2_Notification__c notif : newList) {
        newNotificationIds.add(notif.Id);
      }
      List<CCP2_Notification__c> notification = [
        SELECT Id, Notification_Type__c
        FROM CCP2_Notification__c
        WHERE
          Notification_Type__c IN ('eInvoice', 'dtfsa')
          AND Id = :newNotificationIds
      ];
      for (CCP2_Notification__c notif : notification) {
        if (notif.Notification_Type__c == 'eInvoice') {
          Account account = [
            SELECT Id, invoiceGroup__c, siebelAccountCode__c
            FROM Account
            WHERE siebelAccountCode__c = :notif.CCP2_CustomerCode__c
            LIMIT 1
          ];
          System.debug(account);
          if (account.invoiceGroup__c != null) {
            List<Account> allAccountList = [
              SELECT Id
              FROM Account
              WHERE invoiceGroup__c = :account.invoiceGroup__c
            ];
            for (Account acc : allAccountList) {
              List<Contact> contactList = [
                SELECT Id, eInvoice_email__c
                FROM Contact
                WHERE AccountId = :acc.Id AND eInvoice_email__c = TRUE
              ];
              Set<Id> contactIds = new Set<Id>();
              for (Contact con : contactList) {
                contactIds.add(con.Id);
              }
              List<User> userList = [
                SELECT Id, Email, AccountId
                FROM User
                WHERE ContactId = :contactIds
              ];
              PermissionSet einvoicepermission = [
                SELECT Id, Name
                FROM PermissionSet
                WHERE Name = 'E_invoice'
                LIMIT 1
              ];
              Set<Id> userIds = new Set<Id>();
              for (User user : userList) {
                PermissionSetAssignment psaId = [
                  SELECT Id, AssigneeId
                  FROM PermissionSetAssignment
                  WHERE
                    AssigneeId = :user.Id
                    AND PermissionSetId = :einvoicepermission.Id
                ];
                if (psaId != null) {
                  userIds.add(user.Id);
                }
              }
              notificationEmail(userIds, 'eInvoice');
            }
          } else {
            List<Contact> contactList = [
              SELECT Id, eInvoice_email__c
              FROM Contact
              WHERE AccountId = :account.Id AND eInvoice_email__c = TRUE
            ];
            Set<Id> contactIds = new Set<Id>();
            for (Contact con : contactList) {
              contactIds.add(con.Id);
            }
            List<User> userList = [
              SELECT Id, Email, AccountId
              FROM User
              WHERE ContactId = :contactIds
            ];
            PermissionSet einvoicepermission = [
              SELECT Id, Name
              FROM PermissionSet
              WHERE Name = 'E_invoice'
              LIMIT 1
            ];
            Set<Id> userIds = new Set<Id>();
            for (User user : userList) {
              PermissionSetAssignment psaId = [
                SELECT Id, AssigneeId
                FROM PermissionSetAssignment
                WHERE
                  AssigneeId = :user.Id
                  AND PermissionSetId = :einvoicepermission.Id
              ];
              if (psaId != null) {
                userIds.add(user.Id);
              }
            }
            notificationEmail(userIds, 'eInvoice');
          }
        } else if (notif.Notification_Type__c == 'dtfsa') {
          System.debug(notif);
          List<String> targetValues = new List<String>{
            '約定代金請求書(振込)',
            'リース取引注記明細表'
          };
          Boolean containsTarget = false;

          if (!String.isBlank(notif.Doc_Type__c)) {
            for (String value : notif.Doc_Type__c.split(',')) {
              if (targetValues.contains(value.trim())) {
                containsTarget = true;
                break;
              }
            }
          }
          System.debug(containsTarget);
          if (containsTarget) {
            Account account = [
              SELECT Id
              FROM Account
              WHERE siebelAccountCode__c = :notif.CCP2_CustomerCode__c
              LIMIT 1
            ];
            System.debug(account);
            List<Contact> contactList = [
              SELECT Id, Lease_email__c
              FROM Contact
              WHERE AccountId = :account.Id AND Lease_email__c = TRUE
            ];
            Set<Id> contactIds = new Set<Id>();
            for (Contact con : contactList) {
              contactIds.add(con.Id);
            }
            List<User> userList = [
              SELECT Id, Email, AccountId
              FROM User
              WHERE ContactId = :contactIds
            ];
            PermissionSet dtfsapermission = [
              SELECT Id, Name
              FROM PermissionSet
              WHERE Name = 'FUSO_CCP_External_Financial_service'
              LIMIT 1
            ];
            Set<Id> userIds = new Set<Id>();
            for (User user : userList) {
              PermissionSetAssignment psaId = [
                SELECT Id, AssigneeId
                FROM PermissionSetAssignment
                WHERE
                  AssigneeId = :user.Id
                  AND PermissionSetId = :dtfsapermission.Id
              ];
              if (psaId != null) {
                userIds.add(user.Id);
              }
            }
            System.debug(userIds);
            notificationEmail(userIds, 'dtfsa');
          }
        }
      }
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
    }
  }

  public static void notificationEmail(Set<Id> userIds, String Notification) {
  }
}

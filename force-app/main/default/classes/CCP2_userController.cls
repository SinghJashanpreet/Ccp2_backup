//updateRecords
//branchContactDelete
//branchContactAdd
//deleteUser
//permissionValuesAccessControl
//updateAccessRecords
//uiPermissionList
//permissionValues
//userBasicInfo
//updateAccessControl
//callMethodPermissionSet
//createAndAssociateBranch
//updateContactFields
//getInquiryType
public without sharing class CCP2_userController {
  @AuraEnabled
  //@future
  public static void updateRecords(String uiFieldJson) {
    System.debug(uiFieldJson);
    //String input = uiFieldJson;
    // Deserialize the JSON string into a list of maps
    List<Object> fieldMapListRaw = (List<Object>) JSON.deserializeUntyped(
      uiFieldJson
    );
    if (fieldMapListRaw.isEmpty()) {
      throw new AuraHandledException('Input JSON is empty');
    }

    // Assuming the list contains maps
    Map<String, Object> fieldMap = (Map<String, Object>) fieldMapListRaw[0];

    // Maintain the existing logic of using ccp2_filedmap
    Map<String, String> updatedFieldMap = new Map<String, String>();
    for (String uiFieldKey : fieldMap.keySet()) {
      Object uiFieldValueObj = fieldMap.get(uiFieldKey);
      String uiFieldValue = uiFieldValueObj != null
        ? String.valueOf(uiFieldValueObj)
        : null; // Convert to String

      // Get the corresponding Salesforce field name
      String sfFieldKey = ccp2_filedmap.uiFieldInput(uiFieldKey);
      if (sfFieldKey != null) {
        updatedFieldMap.put(sfFieldKey, uiFieldValue);
      } else {
        updatedFieldMap.put(uiFieldKey, uiFieldValue);
      }
    }

    String contactId = updatedFieldMap.get('ContactId');
    if (String.isBlank(contactId)) {
      throw new AuraHandledException('ContactId is required');
    }

    Contact contactToUpdate;
    try {
      contactToUpdate = [
        SELECT
          Id,
          FirstName,
          LastName,
          Email,
          Title,
          Employee_Code__c,
          MobilePhone,
          Phone,
          firstNameKana__c,
          lastNameKana__c,
          Department,
          CCP2_Notify_Selected_Date__c,
          CCP2_Notification_Option__c,
          CCP2_Notify_Exp_Duration__c,
          CCP2_Notification_Toggle__c
        FROM Contact
        WHERE Id = :contactId
        LIMIT 1
      ];
      System.debug('Contact to Update: ' + contactToUpdate);
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      throw new AuraHandledException('Contact not found');
    }

    // Update fields if they exist in the map
    if (updatedFieldMap.containsKey('FirstName')) {
      contactToUpdate.FirstName = updatedFieldMap.get('FirstName');
    }
    if (updatedFieldMap.containsKey('LastName')) {
      contactToUpdate.LastName = updatedFieldMap.get('LastName');
    }
    if (updatedFieldMap.containsKey('Department')) {
      contactToUpdate.Department = updatedFieldMap.get('Department');
    }
    if (updatedFieldMap.containsKey('Email')) {
      contactToUpdate.Email = updatedFieldMap.get('Email');
    }
    if (updatedFieldMap.containsKey('Phone')) {
      contactToUpdate.Phone = updatedFieldMap.get('Phone');
    }
    if (updatedFieldMap.containsKey('MobilePhone')) {
      contactToUpdate.MobilePhone = updatedFieldMap.get('MobilePhone');
    }
    if (updatedFieldMap.containsKey('firstNameKana__c')) {
      contactToUpdate.firstNameKana__c = updatedFieldMap.get(
        'firstNameKana__c'
      );
    }
    /*if (updatedFieldMap.containsKey('Branch__c')) {
            contactToUpdate.Branch__c = updatedFieldMap.get('Branch__c');
        }*/
    if (updatedFieldMap.containsKey('Title')) {
      contactToUpdate.Title = updatedFieldMap.get('Title');
    }
    if (updatedFieldMap.containsKey('Employee_Code__c')) {
      contactToUpdate.Employee_Code__c = updatedFieldMap.get(
        'Employee_Code__c'
      );
    }
    if (updatedFieldMap.containsKey('lastNameKana__c')) {
      contactToUpdate.lastNameKana__c = updatedFieldMap.get('lastNameKana__c');
    }
    //Update class for notification
    if (updatedFieldMap.containsKey('CCP2_Notification_Toggle__c')) {
      String toggleValue = updatedFieldMap.get('CCP2_Notification_Toggle__c');
      if (toggleValue == 'オフ') {
        contactToUpdate.CCP2_Notification_Toggle__c = updatedFieldMap.get(
          'CCP2_Notification_Toggle__c'
        );
        contactToUpdate.CCP2_Notify_Exp_Duration__c = null;
        contactToUpdate.CCP2_Notification_Option__c = '';
        contactToUpdate.CCP2_Notify_Selected_Date__c = '';
      } else if (toggleValue == 'オン') {
        contactToUpdate.CCP2_Notification_Toggle__c = updatedFieldMap.get(
          'CCP2_Notification_Toggle__c'
        );
      }
    }
    if (updatedFieldMap.containsKey('CCP2_Notify_Exp_Duration__c')) {
      Integer duration = Integer.valueof(
        updatedFieldMap.get('CCP2_Notify_Exp_Duration__c')
      );
      contactToUpdate.CCP2_Notify_Exp_Duration__c = duration;
    }
    if (updatedFieldMap.containsKey('CCP2_Notification_Option__c')) {
      contactToUpdate.CCP2_Notification_Option__c = updatedFieldMap.get(
        'CCP2_Notification_Option__c'
      );
      String NotificationOption = updatedFieldMap.get(
        'CCP2_Notification_Option__c'
      );
      System.debug(NotificationOption);
      if (NotificationOption == 'NotifyWhenExp') {
        System.debug('here ' + NotificationOption);
        contactToUpdate.CCP2_Notify_Selected_Date__c = '';
      }
    }
    if (updatedFieldMap.containsKey('CCP2_Notify_Selected_Date__c')) {
      contactToUpdate.CCP2_Notify_Selected_Date__c = updatedFieldMap.get(
        'CCP2_Notify_Selected_Date__c'
      );
    }
    if (
      updatedFieldMap.containsKey('mostLikelyWeekdayStartTimesForAppoint__c')
    ) {
      String timeString = updatedFieldMap.get(
        'mostLikelyWeekdayStartTimesForAppoint__c'
      );

      // Convert the string to an integer representing milliseconds
      Long milliseconds = Long.valueOf(timeString);

      // Calculate hours, minutes, seconds, and milliseconds
      Integer hours = (Integer) (milliseconds / (1000 * 60 * 60));
      Long remainingMillisAfterHours = milliseconds - (hours * 1000 * 60 * 60);

      Integer minutes = (Integer) (remainingMillisAfterHours / (1000 * 60));
      Long remainingMillisAfterMinutes =
        remainingMillisAfterHours - (minutes * 1000 * 60);

      Integer seconds = (Integer) (remainingMillisAfterMinutes / 1000);
      Integer millis = (Integer) (remainingMillisAfterMinutes -
      (seconds * 1000));
      // Create the Time object
      Time timeValue = Time.newInstance(hours, minutes, seconds, millis);

      // Assign the Time object to the contact field
      contactToUpdate.mostLikelyWeekdayStartTimesForAppoint__c = timeValue;
    }
    if (updatedFieldMap.containsKey('mostLikelyWeekdayEndTimesForAppoint__c')) {
      String timeString = updatedFieldMap.get(
        'mostLikelyWeekdayEndTimesForAppoint__c'
      );

      // Convert the string to an integer representing milliseconds
      Long milliseconds = Long.valueOf(timeString);

      // Calculate hours, minutes, seconds, and milliseconds
      Integer hours = (Integer) (milliseconds / (1000 * 60 * 60));
      Long remainingMillisAfterHours = milliseconds - (hours * 1000 * 60 * 60);

      Integer minutes = (Integer) (remainingMillisAfterHours / (1000 * 60));
      Long remainingMillisAfterMinutes =
        remainingMillisAfterHours - (minutes * 1000 * 60);

      Integer seconds = (Integer) (remainingMillisAfterMinutes / 1000);
      Integer millis = (Integer) (remainingMillisAfterMinutes -
      (seconds * 1000));
      // Create the Time object
      Time timeValue = Time.newInstance(hours, minutes, seconds, millis);

      // Assign the Time object to the contact field
      contactToUpdate.mostLikelyWeekdayEndTimesForAppoint__c = timeValue;
    }
    if (
      updatedFieldMap.containsKey('mostLikelyHolidayStartTimesForAppoint__c')
    ) {
      String timeString = updatedFieldMap.get(
        'mostLikelyHolidayStartTimesForAppoint__c'
      );

      // Convert the string to an integer representing milliseconds
      Long milliseconds = Long.valueOf(timeString);

      // Calculate hours, minutes, seconds, and milliseconds
      Integer hours = (Integer) (milliseconds / (1000 * 60 * 60));
      Long remainingMillisAfterHours = milliseconds - (hours * 1000 * 60 * 60);

      Integer minutes = (Integer) (remainingMillisAfterHours / (1000 * 60));
      Long remainingMillisAfterMinutes =
        remainingMillisAfterHours - (minutes * 1000 * 60);

      Integer seconds = (Integer) (remainingMillisAfterMinutes / 1000);
      Integer millis = (Integer) (remainingMillisAfterMinutes -
      (seconds * 1000));

      Time timeValue = Time.newInstance(hours, minutes, seconds, millis);

      contactToUpdate.mostLikelyHolidayStartTimesForAppoint__c = timeValue;
    }
    if (updatedFieldMap.containsKey('mostLikelyHolidayEndTimesForAppoint__c')) {
      String timeString = updatedFieldMap.get(
        'mostLikelyHolidayEndTimesForAppoint__c'
      );

      // Convert the string to an integer representing milliseconds
      Long milliseconds = Long.valueOf(timeString);

      // Calculate hours, minutes, seconds, and milliseconds
      Integer hours = (Integer) (milliseconds / (1000 * 60 * 60));
      Long remainingMillisAfterHours = milliseconds - (hours * 1000 * 60 * 60);

      Integer minutes = (Integer) (remainingMillisAfterHours / (1000 * 60));
      Long remainingMillisAfterMinutes =
        remainingMillisAfterHours - (minutes * 1000 * 60);

      Integer seconds = (Integer) (remainingMillisAfterMinutes / 1000);
      Integer millis = (Integer) (remainingMillisAfterMinutes -
      (seconds * 1000));
      // Create the Time object
      Time timeValue = Time.newInstance(hours, minutes, seconds, millis);

      // Assign the Time object to the contact field
      contactToUpdate.mostLikelyHolidayEndTimesForAppoint__c = timeValue;
    }

    try {
      System.debug('Final Contact to Update: ' + contactToUpdate);
      update contactToUpdate;
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      throw new AuraHandledException(
        'Error updating Contact record: ' + e.getMessage()
      );
    }
  }

  @AuraEnabled
  public static void branchContactDelete(
    Id contactId,
    List<Id> branchesToDelete
  ) {
    if (!branchesToDelete.isEmpty()) {
      // Fetch child records to be deleted
      List<CCP2_BranchContact_Junction__c> childRecords = [
        SELECT Id, ContactId__c, BranchId__c
        FROM CCP2_BranchContact_Junction__c
        WHERE ContactId__c = :contactId AND BranchId__c IN :branchesToDelete
      ];

      if (!childRecords.isEmpty()) {
        try {
          delete childRecords;
        } catch (Exception e) {
          CCP2_HandlerForException.LogException(e);
          throw new AuraHandledException(
            'Failed to delete Branch records: ' + e.getMessage()
          );
        }
      }
    }
  }

  @AuraEnabled
  public static void branchContactAdd(Id contactId, List<Id> branchesToAdd) {
    List<CCP2_BranchContact_Junction__c> branchRecords = new List<CCP2_BranchContact_Junction__c>();

    // Iterate through the branches list and create Branch records
    for (Id branchId : branchesToAdd) {
      CCP2_BranchContact_Junction__c branch = new CCP2_BranchContact_Junction__c();
      branch.BranchId__c = branchId;
      branch.ContactId__c = contactId;
      branchRecords.add(branch);
    }

    // Insert the Branch records if there are any
    if (!branchRecords.isEmpty()) {
      try {
        insert branchRecords;
      } catch (Exception e) {
        CCP2_HandlerForException.LogException(e);
        throw new AuraHandledException(
          'Failed to insert Branch records: ' + e.getMessage()
        );
      }
    }
  }

  /* @AuraEnabled
    public static void deleteUser(String contactId) {
        try {
            // Query the Contact record based on the given contactId
            Contact contact = [SELECT Id, OwnerId, UserId__c, ccpUseFlag__c FROM Contact WHERE Id = :contactId LIMIT 1];
            System.debug(contact);
            contact.ccpUseFlag__c = false;
      		 System.debug(contact.ccpUseFlag__c);
            update contact;
            // Check if the Contact has an associated User record
            if (contact.UserId__c != null) {
                // Query the UserLogin record based on the UserId
                UserLogin userLogin = [SELECT Id, IsFrozen FROM UserLogin WHERE UserId = :contact.UserId__c LIMIT 1];
                System.debug(userLogin);
                // Freeze the User by setting the IsFrozen field to true
                userLogin.IsFrozen = true;
                update userLogin;
                System.debug('User record frozen successfully for user ID: ' + contact.UserId__c);
            } else {
                System.debug('No associated User record found for contact ID: ' + contactId);
            }
			// delete branch from Junction Object
			List<CCP2_BranchContact_Junction__c> junctions = [SELECT Id FROM CCP2_BranchContact_Junction__c WHERE ContactId__c = :contactId];
			if (!junctions.isEmpty()) {
                System.debug(junctions);
				delete junctions;
				System.debug('Junction records deleted successfully.');
			} else {
				System.debug('No junction records found for contact ID: ' + contactId);
			}
        } catch (Exception e) {
             CCP2_HandlerForException.LogException(e);
            System.debug('An error occurred: ' + e.getMessage());
        }
    }*/

  @AuraEnabled(cacheable=true)
  public static List<Map<String, Object>> permissionValuesAccessControl(
    Id userId,
    Integer refresh
  ) {
    try {
      if (userId == null) {
        throw new AuraHandledException('Input is empty');
      }

      // Query to fetch permissions assigned to the user
      List<PermissionSetAssignment> permissionSetAssignments = [
        SELECT
          Id,
          PermissionSetId,
          PermissionSet.Name,
          AssigneeId,
          Assignee.Name
        FROM PermissionSetAssignment
        WHERE AssigneeId = :userId
      ];

      System.debug('userId: ' + userId);
      System.debug('permissionSetAssignments: ' + permissionSetAssignments);

      // Extract the names of the permission sets assigned to the user
      Set<String> assignedPermissionSetNames = new Set<String>();
      for (PermissionSetAssignment assignment : permissionSetAssignments) {
        assignedPermissionSetNames.add(assignment.PermissionSet.Name);
      }

      List<String> activePermissions = new List<String>();

      // Map to relate permission set names to their corresponding functionalities
      Map<String, String> permissionMap = new Map<String, String>{
        'FUSO_CCP_External_Vehicle_management' => '車両管理',
        'E_invoice' => '部整月次請求書（電子版）',
        //'Direct_Booking' => '三菱ふそう_ショップ',
        'FUSO_CCP_External_Financial_service' => 'FUSOリース'

        //'FUSO_CCP_External_Cost_management' => '費用管理',(NEW change)
        //'FUSO_CCP_External_Financial_service' => '金融サービス',
        //'FUSO_CCP_External_Online_maintenance_booking' => '車検入庫予約',(NEW change)
      };

      // Identify active permissions based on assigned permission sets
      for (String permissionSetName : permissionMap.keySet()) {
        if (assignedPermissionSetNames.contains(permissionSetName)) {
          activePermissions.add(permissionSetName);
        }
      }

      // Prepare the final list of permission statuses
      List<Map<String, Object>> permissionStatusList = new List<Map<String, Object>>();
      for (String apiName : permissionMap.keySet()) {
        Map<String, Object> permissionStatus = new Map<String, Object>();
        permissionStatus.put('apiName', apiName);
        permissionStatus.put('japaneseName', permissionMap.get(apiName));
        permissionStatus.put('isActive', activePermissions.contains(apiName));
        permissionStatusList.add(permissionStatus);
      }
      return permissionStatusList;
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      throw new AuraHandledException('An error occurred: ' + e.getMessage());
    }
  }

  //Contactupdate method is used instead updateAccessRecords
  @AuraEnabled
  public static void updateAccessRecords(String uiSRJson) {
    List<Object> fieldMapListRaw = (List<Object>) JSON.deserializeUntyped(
      uiSRJson
    );
    System.debug(fieldMapListRaw);

    if (fieldMapListRaw.isEmpty()) {
      throw new AuraHandledException('Input JSON is empty');
    }

    Map<String, Object> fieldMap = (Map<String, Object>) fieldMapListRaw[0];
    System.debug(fieldMap);

    Id userId = (Id) fieldMap.get('userId');
    if (userId == null) {
      throw new AuraHandledException('userId is missing in the input JSON');
    }

    List<CCP2_Access_Control__c> accessList = [
      SELECT
        Id,
        Name,
        Basic_Service_EC_Flag__c,
        Cost_management_Flag__c,
        E_invoice_Flag__c,
        Financial_service_Flag__c,
        Online_maintenance_booking_Flag__c,
        Vehicle_management_Flag__c
      FROM CCP2_Access_Control__c
      WHERE Name = :userId
      LIMIT 1
    ];
    if (accessList.isEmpty()) {
      throw new AuraHandledException(
        'No access control record found for the given userId'
      );
    }

    CCP2_Access_Control__c accessControl = accessList[0];

    // Map the JSON keys to the corresponding fields
    Map<String, String> fieldMapping = new Map<String, String>{
      'E_invoice' => '外部電子請求書',
      'FUSO_CCP_External_Financial_service' => 'リース・ローン',
      'FUSO_CCP_External_Basic_Service_EC' => '三菱ふそう_ショップ',
      'FUSO_CCP_External_Cost_management' => 'コスト管理',
      'FUSO_CCP_External_Online_maintenance_booking' => 'オンラインメンテナンス予約',
      'FUSO_CCP_External_Vehicle_management' => '車両管理'
    };

    // Update the fields based on the input JSON
    for (String key : fieldMapping.keySet()) {
      String fieldName = fieldMapping.get(key);
      if (fieldMap.containsKey(fieldName)) {
        Boolean fieldValue = (Boolean) fieldMap.get(fieldName);
        if (key == 'E_invoice') {
          accessControl.E_invoice_Flag__c = fieldValue;
        } else if (key == 'FUSO_CCP_External_Financial_service') {
          accessControl.Financial_service_Flag__c = fieldValue;
        } else if (key == 'FUSO_CCP_External_Basic_Service_EC') {
          accessControl.Basic_Service_EC_Flag__c = fieldValue;
        } else if (key == 'FUSO_CCP_External_Cost_management') {
          accessControl.Cost_management_Flag__c = fieldValue;
        } else if (key == 'FUSO_CCP_External_Online_maintenance_booking') {
          accessControl.Online_maintenance_booking_Flag__c = fieldValue;
        } else if (key == 'FUSO_CCP_External_Vehicle_management') {
          accessControl.Vehicle_management_Flag__c = fieldValue;
        }
      }
    }

    // Perform the update
    try {
      System.debug(accessControl);
      update accessControl;
      System.debug(
        'Access control record updated successfully: ' + accessControl.Id
      );
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug(
        'An error occurred while updating the access control record: ' +
        e.getMessage()
      );
      throw new AuraHandledException(
        'Error updating access control record: ' + e.getMessage()
      );
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<String> uiPermissionList(Id userId, Integer refresh) {
    try {
      List<PermissionSetAssignment> permissionAssignments = [
        SELECT PermissionSet.Name
        FROM PermissionSetAssignment
        WHERE AssigneeId = :userId
      ];

      List<String> activePermissions = new List<String>();

      Map<String, String> permissionMap = new Map<String, String>{
        'Direct_Booking' => '三菱ふそう_ショップ',
        //'FUSO_CCP_External_Cost_management' => '費用管理',
        'E_invoice' => '部整月次請求書（電子版）',
        'FUSO_CCP_External_Financial_service' => 'FUSOリース',
        //'FUSO_CCP_External_Online_maintenance_booking' => '車検入庫予約',
        'FUSO_CCP_External_Vehicle_management' => '車両管理'
      };

      for (PermissionSetAssignment psa : permissionAssignments) {
        String permissionLabel = permissionMap.get(psa.PermissionSet.Name);
        if (permissionLabel != null) {
          activePermissions.add(permissionLabel);
        }
      }

      System.debug(activePermissions);
      return activePermissions;
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('An error occurred: ' + e.getMessage());
      throw new AuraHandledException(
        'An error occurred while fetching permissions: ' + e.getMessage()
      );
    }
  }

  @AuraEnabled
  public static void updateAccessControl(String con, String userId) {
    try {
      if (String.isEmpty(con)) {
        throw new AuraHandledException('Input JSON is empty.');
      }

      System.debug('Input JSON: ' + con);

      // Deserialize JSON into a Map
      Map<String, Object> inputMap = (Map<String, Object>) JSON.deserializeUntyped(
        con
      );

      if (String.isEmpty(userId)) {
        throw new AuraHandledException(
          'User ID (Name) is missing in the input JSON.'
        );
      }

      // Fetch the existing record
      CCP2_Access_Control__c result = [
        SELECT
          Id,
          E_invoice_Flag__c,
          Financial_service_Flag__c,
          Basic_Service_EC_Flag__c,
          Cost_management_Flag__c,
          Online_maintenance_booking_Flag__c,
          Vehicle_management_Flag__c
        FROM CCP2_Access_Control__c
        WHERE Name = :userId
        LIMIT 1
      ];

      if (result != null) {
        // Update fields based on the input JSON
        if (inputMap.containsKey('E_invoice')) {
          result.E_invoice_Flag__c = (Boolean) inputMap.get('E_invoice');
        }
        if (inputMap.containsKey('FUSO_CCP_External_Financial_service')) {
          result.Financial_service_Flag__c = (Boolean) inputMap.get(
            'FUSO_CCP_External_Financial_service'
          );
        }
        if (
          inputMap.containsKey('FUSO_CCP_External_Online_maintenance_booking')
        ) {
          result.Online_maintenance_booking_Flag__c = (Boolean) inputMap.get(
            'FUSO_CCP_External_Online_maintenance_booking'
          );
        }
        if (inputMap.containsKey('FUSO_CCP_External_Vehicle_management')) {
          result.Vehicle_management_Flag__c = (Boolean) inputMap.get(
            'FUSO_CCP_External_Vehicle_management'
          );
        }
        if (inputMap.containsKey('FUSO_CCP_External_Cost_management')) {
          result.Cost_management_Flag__c = (Boolean) inputMap.get(
            'FUSO_CCP_External_Cost_management'
          );
        }

        System.debug('Updated Record: ' + result);
        update result;

        System.debug(
          'CCP2_Access_Control__c updated successfully: ' + result.Id
        );
      } else {
        System.debug(
          'No CCP2_Access_Control__c record found with Name: ' + userId
        );
      }
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('Error updating CCP2_Access_Control__c: ' + e.getMessage());
      throw new AuraHandledException('An error occurred: ' + e.getMessage());
    }
  }

  @AuraEnabled
  public static void permissionValues(ID userId) {
    // Predefined permissions
    Set<String> predefinedPermissions = new Set<String>{
      //'FUSO_CCP_External_E_invoice_new',
      'E_invoice',
      'FUSO_CCP_External_Financial_service',
      //'FUSO_CCP_External_Basic_Service_EC',
      'Direct_Booking',
      'FUSO_CCP_External_Cost_management',
      'FUSO_CCP_External_Online_maintenance_booking',
      'FUSO_CCP_External_Vehicle_management'
    };

    // Query the user's permission set assignments
    List<PermissionSetAssignment> Listvalue = [
      SELECT Id, PermissionSetId, PermissionSet.Name, AssigneeId, Assignee.Name
      FROM PermissionSetAssignment
      WHERE AssigneeId = :userId
    ];
    System.debug(Listvalue);
    List<Map<String, Object>> permissionStatusList = new List<Map<String, Object>>();
    Map<String, Boolean> permissionMap = new Map<String, Boolean>();

    for (String permission : predefinedPermissions) {
      Map<String, Object> permissionStatus = new Map<String, Object>();
      permissionStatus.put('name', permission);
      permissionStatus.put('isActive', false);
      System.debug(permission);
      for (PermissionSetAssignment psa : Listvalue) {
        if (permission.equals(psa.PermissionSet.Name)) {
          permissionStatus.put('isActive', true);
          break;
        }
      }
      permissionStatusList.add(permissionStatus);
      permissionMap.put(permission, (Boolean) permissionStatus.get('isActive'));
    }

    System.debug(permissionStatusList);

    // Query for existing access control record
    CCP2_Access_Control__c existingRecord;
    try {
      existingRecord = [
        SELECT Id
        FROM CCP2_Access_Control__c
        WHERE Name = :userId
        LIMIT 1
      ];
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      existingRecord = null;
    }

    Contact contact = [
      SELECT Id
      FROM Contact
      WHERE UserId__c = :userId
      LIMIT 1
    ];
    // Create or update the access control record
    CCP2_Access_Control__c accessControlRecord = existingRecord != null
      ? existingRecord
      : new CCP2_Access_Control__c();
    accessControlRecord.Basic_Service_EC_Flag__c = permissionMap.get(
      'Direct_Booking'
    );
    accessControlRecord.Cost_management_Flag__c = permissionMap.get(
      'FUSO_CCP_External_Cost_management'
    );
    accessControlRecord.E_invoice_Flag__c = permissionMap.get('E_invoice');
    accessControlRecord.Financial_service_Flag__c = permissionMap.get(
      'FUSO_CCP_External_Financial_service'
    );
    accessControlRecord.Online_maintenance_booking_Flag__c = permissionMap.get(
      'FUSO_CCP_External_Online_maintenance_booking'
    );
    accessControlRecord.Vehicle_management_Flag__c = permissionMap.get(
      'FUSO_CCP_External_Vehicle_management'
    );
    accessControlRecord.Name = Listvalue[0].AssigneeId;
    accessControlRecord.Contact__c = contact.Id;
    try {
      if (existingRecord == null) {
        insert accessControlRecord;
        System.debug(
          'Access control record inserted successfully: ' +
          accessControlRecord.Id
        );
      } else {
        update accessControlRecord;
        System.debug(
          'Access control record updated successfully: ' +
          accessControlRecord.Id
        );
      }
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug(
        'An error occurred while inserting/updating the access control record: ' +
        e.getMessage()
      );
      throw new AuraHandledException(
        'Error inserting/updating access control record: ' + e.getMessage()
      );
    }
  }

  @InvocableMethod(label='userId' description='userId')
  public static void callMethodPermissionSet(List<Id> userId) {
    permissionValues(userId[0]);
  }

  @AuraEnabled
  public static Void createAndAssociateBranch(String con, String userId) {
    if (String.isEmpty(con)) {
      throw new AuraHandledException('Input JSON is empty.');
    }

    System.debug('Input JSON: ' + con);

    Map<String, Object> inputMap = (Map<String, Object>) JSON.deserializeUntyped(
      con
    );
    System.debug(inputMap);
    if (String.isEmpty(userId)) {
      throw new AuraHandledException(
        'User ID (Name) is missing in the input JSON.'
      );
    }
    //Id userId = con.Name;
    //Boolean bsChecked = (Boolean) inputMap.get('Direct_Booking');
    Boolean eiChecked = (Boolean) inputMap.get('E_invoice');
    Boolean fsChecked = (Boolean) inputMap.get(
      'FUSO_CCP_External_Financial_service'
    );
    //Boolean ombChecked = (Boolean) inputMap.get('FUSO_CCP_External_Online_maintenance_booking');
    Boolean vmChecked = (Boolean) inputMap.get(
      'FUSO_CCP_External_Vehicle_management'
    );
    //Boolean cmChecked = (Boolean) inputMap.get('FUSO_CCP_External_Cost_management');

    List<PermissionSet> permissionSets = [
      SELECT Id, Name
      FROM permissionSet
      WHERE
        Name IN (
          'E_invoice',
          'FUSO_CCP_External_Financial_service',
          'Direct_Booking',
          'FUSO_CCP_External_Cost_management',
          'FUSO_CCP_External_Online_maintenance_booking',
          'FUSO_CCP_External_Vehicle_management'
        )
    ];
    List<Id> permissionSetIds = new List<Id>();
    for (PermissionSet ps : permissionSets) {
      permissionSetIds.add(ps.Id);
    }
    System.debug(permissionSets);
    System.debug(permissionSetIds);
    PermissionSet bsCheck = [
      SELECT Id
      FROM permissionSet
      WHERE Name = 'Direct_Booking'
    ];
    Id bsCheckedId = bsCheck.Id;
    PermissionSet eiCheck = [
      SELECT Id
      FROM permissionSet
      WHERE Name = 'E_invoice'
    ];
    Id eiCheckedId = eiCheck.Id;
    PermissionSet fsCheck = [
      SELECT Id
      FROM permissionSet
      WHERE Name = 'FUSO_CCP_External_Financial_service'
    ];
    Id fsCheckedId = fsCheck.Id;
    PermissionSet ombCheck = [
      SELECT Id
      FROM permissionSet
      WHERE Name = 'FUSO_CCP_External_Online_maintenance_booking'
    ];
    Id ombCheckedId = ombCheck.Id;
    PermissionSet vmCheck = [
      SELECT Id
      FROM permissionSet
      WHERE Name = 'FUSO_CCP_External_Vehicle_management'
    ];
    Id vmCheckedId = vmCheck.Id;
    PermissionSet cmCheck = [
      SELECT Id
      FROM permissionSet
      WHERE Name = 'FUSO_CCP_External_Cost_management'
    ];
    Id cmCheckedId = cmCheck.Id;

    List<PermissionSetAssignment> psaList = [
      SELECT Id, AssigneeId, PermissionSetId
      FROM PermissionSetAssignment
      WHERE AssigneeId = :userId AND PermissionSetId IN :permissionSetIds
    ];
    System.debug(psaList);
    if (!psaList.isEmpty()) {
      try {
        //psaList[0].AssigneeId = null;
        System.debug(psaList[0].AssigneeId);

        delete psaList;
      } catch (Exception e) {
        //CCP2_HandlerForException.LogException(e);
        System.debug(
          'An error occurred while deleting PermissionSetAssignment record: ' +
          e.getMessage()
        );
      }
    } else {
      System.debug(
        'No PermissionSetAssignment record found for user ID: ' + userId
      );
    }
    try {
      /* System.debug('No1 '+bsChecked);
            if(bsChecked){
                PermissionSetAssignment vsa = new PermissionSetAssignment(PermissionSetId = bsCheckedId, AssigneeId = userId);
                System.debug('First');
                insert vsa;
            }*/
      if (eiChecked) {
        PermissionSetAssignment vsa = new PermissionSetAssignment(
          PermissionSetId = eiCheckedId,
          AssigneeId = userId
        );
        insert vsa;
      }
      if (fsChecked) {
        PermissionSetAssignment vsa = new PermissionSetAssignment(
          PermissionSetId = fsCheckedId,
          AssigneeId = userId
        );
        insert vsa;
      }
      /*if(ombChecked){
                PermissionSetAssignment vsa = new PermissionSetAssignment(PermissionSetId = ombCheckedId, AssigneeId = userId);
                insert vsa;
            }*/
      if (vmChecked) {
        PermissionSetAssignment vsa = new PermissionSetAssignment(
          PermissionSetId = vmCheckedId,
          AssigneeId = userId
        );
        insert vsa;
      }
      /* if(cmChecked){
                PermissionSetAssignment vsa = new PermissionSetAssignment(PermissionSetId = cmCheckedId, AssigneeId = userId);
                insert vsa;
            }*/
    } catch (Exception e) {
      //CCP2_HandlerForException.LogException(e);
      throw new DmlException(
        'setPermissionSetforUser error :' + e.getMessage()
      );
    }
  }
  @AuraEnabled
  public static Id getAccountId() {
    Id returnValue = null;
    User portalUser = [
      SELECT ContactId, Contact.AccountId
      FROM User
      WHERE Id = :UserInfo.getUserId()
      LIMIT 1
    ];
    if (portalUser != null && portalUser.ContactId != null) {
      returnValue = portalUser.Contact.AccountId;
    }
    return returnValue;
  }
  @AuraEnabled(cacheable=true)
  public static List<Contact> adminUser() {
    Id accId = getAccountId();
    //Id accId='001Io000003ITP2IAO';
    List<Contact> adminList = [
      SELECT Id, Name
      FROM Contact
      WHERE
        ccpUseFlag__c = TRUE
        AND canManageMember__c = FALSE
        AND AccountId = :accId
    ];
    System.debug(adminList);
    return adminList;
  }

  @AuraEnabled(cacheable=true)
  public static Map<String, Object> userBasicInfo(
    String ContactId,
    Integer refresh
  ) {
    Map<String, Object> userInfo = new Map<String, Object>();
    /*List<User> userList = [SELECT ContactId FROM User WHERE Id = :UserId];
        String reqId = userList[0].ContactId;
        System.debug('ContactId: ' + reqId);*/
    List<Contact> contactInfoList = [
      SELECT
        Id,
        FirstName,
        LastName,
        firstNameKana__c,
        lastNameKana__c,
        Department,
        Title,
        Email,
        Phone,
        MobilePhone,
        Account.Name,
        Account.siebelAccountCode__c,
        mostLikelyWeekdayStartTimesForAppoint__c,
        mostLikelyWeekdayEndTimesForAppoint__c,
        mostLikelyHolidayStartTimesForAppoint__c,
        mostLikelyHolidayEndTimesForAppoint__c,
        Employee_Code__c,
        Lease_email__c,
        eInvoice_email__c,
        CCP2_Notify_Exp_Duration__c,
        CCP2_Notification_Option__c,
        CCP2_Notify_Selected_Date__c,
        CCP2_Notification_Toggle__c
      FROM Contact
      WHERE Id = :ContactId
    ];

    if (!contactInfoList.isEmpty()) {
      Contact contactInfo = contactInfoList[0];

      // Add contact information to userInfo map
      userInfo.put('Id', String.valueOf(contactInfo.Id));
      userInfo.put('FirstName', String.valueOf(contactInfo.FirstName));
      userInfo.put('LastName', String.valueOf(contactInfo.LastName));
      userInfo.put(
        'FirstNameKana',
        String.valueOf(contactInfo.firstNameKana__c)
      );
      userInfo.put('LastNameKana', String.valueOf(contactInfo.lastNameKana__c));
      userInfo.put('Department', String.valueOf(contactInfo.Department));
      userInfo.put('Title', String.valueOf(contactInfo.Title));
      userInfo.put('Email', String.valueOf(contactInfo.Email));
      userInfo.put('Phone', String.valueOf(contactInfo.Phone));
      userInfo.put('MobilePhone', String.valueOf(contactInfo.MobilePhone));
      userInfo.put('AccountName', String.valueOf(contactInfo.Account.Name));
      userInfo.put(
        'AccountSiebelAccountCode',
        String.valueOf(contactInfo.Account.siebelAccountCode__c)
      );
      userInfo.put(
        'MostLikelyWeekdayStartTimesForAppoint',
        contactInfo.mostLikelyWeekdayStartTimesForAppoint__c
      );
      userInfo.put(
        'MostLikelyWeekdayEndTimesForAppoint',
        contactInfo.mostLikelyWeekdayEndTimesForAppoint__c
      );
      userInfo.put(
        'MostLikelyHolidayStartTimesForAppoint',
        contactInfo.mostLikelyHolidayStartTimesForAppoint__c
      );
      userInfo.put(
        'MostLikelyHolidayEndTimesForAppoint',
        contactInfo.mostLikelyHolidayEndTimesForAppoint__c
      );
      userInfo.put(
        'CCP2_Notify_Exp_Duration__c',
        String.valueOf(contactInfo.CCP2_Notify_Exp_Duration__c)
      );
      userInfo.put(
        'CCP2_Notification_Option__c',
        String.valueOf(contactInfo.CCP2_Notification_Option__c)
      );
      userInfo.put(
        'CCP2_Notify_Selected_Date__c',
        String.valueOf(contactInfo.CCP2_Notify_Selected_Date__c)
      );
      userInfo.put(
        'CCP2_Notification_Toggle__c',
        String.valueOf(contactInfo.CCP2_Notification_Toggle__c)
      );
      userInfo.put(
        'EmployeeCode',
        String.valueOf(contactInfo.Employee_Code__c)
      );
      userInfo.put('LeaseEmail', String.valueOf(contactInfo.Lease_email__c));
    }

    List<CCP2_BranchContact_Junction__c> branchIds = [
      SELECT BranchId__c
      FROM CCP2_BranchContact_Junction__c
      WHERE ContactId__c = :ContactId
    ];
    List<Id> branchIdList = new List<Id>();

    for (CCP2_BranchContact_Junction__c branchContact : branchIds) {
      branchIdList.add(branchContact.BranchId__c);
    }
    List<CCP2_Branch__c> branchNameList = [
      SELECT Name, Account__r.siebelAccountCode__c, Branch_Code__c
      FROM CCP2_Branch__c
      WHERE Id IN :branchIdList
    ];
    List<String> branchNames = new List<String>();
    for (CCP2_Branch__c branch : branchNameList) {
      branchNames.add(String.valueOf(branch.Name));
    }
    userInfo.put('BranchNames', branchNameList);

    System.debug(userInfo);
    return userInfo;
  }

  @AuraEnabled
  public static void createAdmin(String oldAdmin, String newAdmin) {
    try {
      List<Contact> oldAdminList = [
        SELECT Id, canManageMember__c
        FROM Contact
        WHERE Id = :oldAdmin
        LIMIT 1
      ];
      System.debug(oldAdminList);
      if (!oldAdminList.isEmpty()) {
        Contact oldAdminUpdate = oldAdminList[0];
        oldAdminUpdate.canManageMember__c = false;
        try {
          System.debug(oldAdminUpdate + 'old admin');
          update oldAdminUpdate;
        } catch (DmlException e) {
          CCP2_HandlerForException.LogException(e);
          System.debug('Error updating old admin: ' + e.getMessage());
        }
      }

      List<Contact> newAdminList = [
        SELECT Id, canManageMember__c
        FROM Contact
        WHERE Id = :newAdmin
        LIMIT 1
      ];
      if (!newAdminList.isEmpty()) {
        Contact newAdminUpdate = newAdminList[0];
        newAdminUpdate.canManageMember__c = true;
        try {
          update newAdminUpdate;
        } catch (DmlException e) {
          CCP2_HandlerForException.LogException(e);
          System.debug('Error updating new admin: ' + e.getMessage());
        }
      }

      /* Id accId = getAccountId();
        List<CCP2_Branch__c> Branches = [SELECT Id FROM CCP2_Branch__c WHERE Account__c = :accId];
        Set<Id> branchIds = new Set<Id>();
        
        for (CCP2_Branch__c brn : Branches) {
            branchIds.add(brn.Id);
        }
        Set<Id> existingBranchIds = new Set<Id>();
        
        List<CCP2_BranchContact_Junction__c> existingAssignments = [
            SELECT BranchId__c FROM CCP2_BranchContact_Junction__c 
            WHERE ContactId__c = :newAdmin
        ];
        
        for (CCP2_BranchContact_Junction__c record : existingAssignments) {
            existingBranchIds.add(record.BranchId__c);
        }
        
        System.debug('Existing Assigned Branches: ' + existingBranchIds);
        List<CCP2_BranchContact_Junction__c> newAdminBranches = new List<CCP2_BranchContact_Junction__c>();
        
        for (Id branchId : branchIds) {
            if (!existingBranchIds.contains(branchId)) {  // Avoid duplicate assignment
                CCP2_BranchContact_Junction__c branchInsert = new CCP2_BranchContact_Junction__c();
                branchInsert.ContactId__c = newAdmin;
                branchInsert.BranchId__c = branchId;
                newAdminBranches.add(branchInsert);
            }
        }
        if (!newAdminBranches.isEmpty()) {
            insert newAdminBranches;
        }*/

      adminPermissionRemove(oldAdmin);
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('Error in createAdmin method: ' + e.getMessage());
    }
  }
  @future
  public static void adminPermissionRemove(String oldAdmin) {
    try {
      list<Contact> con = [
        SELECT Id, userId__c
        FROM Contact
        WHERE Id = :oldAdmin
        LIMIT 1
      ];
      Id userId = con[0].userId__c;
      System.debug('New Admin User ID: ' + userId);

      Id permissionSetId = [
        SELECT Id
        FROM PermissionSet
        WHERE Name = 'FUSO_CCP_External_User_Manager'
        LIMIT 1
      ]
      .Id;

      PermissionSetAssignment psa = [
        SELECT Id
        FROM PermissionSetAssignment
        WHERE PermissionSetId = :permissionSetId AND AssigneeId = :userId
      ];

      delete psa;

      System.debug('Permission set assigned successfully.');
    } catch (Exception e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('Error in createAdmin method: ' + e.getMessage());
    }
  }

  @AuraEnabled
  public static void createAdminPermission(String conId) {
    try {
      list<Contact> con = [SELECT Id, userId__c FROM Contact WHERE Id = :conId];
      Id userId = con[0].userId__c;
      System.debug('New Admin User ID: ' + userId);

      Id permissionSetId = [
        SELECT Id
        FROM PermissionSet
        WHERE Name = 'FUSO_CCP_External_User_Manager'
        LIMIT 1
      ]
      .Id;

      PermissionSetAssignment psa = new PermissionSetAssignment(
        PermissionSetId = permissionSetId,
        AssigneeId = userId
      );

      insert psa;

      System.debug('Permission set assigned successfully.');
    } catch (DmlException e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('Error assigning permission set: ' + e.getMessage());
    }
  }
  @AuraEnabled
  public static void updateContactFields(
    List<String> selectedReason,
    Id contactId,
    String other
  ) {
    Contact contactToUpdate = [
      SELECT
        Id,
        Few_benefits_and_services_for_members__c,
        Found_another_good_product__c,
        Due_to_going_out_of_business__c,
        Infrequently_used__c,
        Poor_operability__c,
        Dissatisfied_with_data_accuracy__c,
        Other__c
      FROM Contact
      WHERE Id = :contactId
      LIMIT 1
    ];

    // Mapping between Japanese feedback and Contact fields
    Map<String, String> feedbackToFieldMap = new Map<String, String>{
      '会員向けの特典・サービスが少ない' => 'Few_benefits_and_services_for_members__c',
      'データ精度に不満がある' => 'Dissatisfied_with_data_accuracy__c',
      '他によい商品を見つけた' => 'Found_another_good_product__c',
      '廃業の為' => 'Due_to_going_out_of_business__c',
      '使用頻度が低い' => 'Infrequently_used__c',
      '操作性が悪い' => 'Poor_operability__c'
    };

    // Iterate through the feedback list and update corresponding fields
    for (String feedback : selectedReason) {
      if (feedbackToFieldMap.containsKey(feedback)) {
        // Get the corresponding field name and set it to true
        String fieldName = feedbackToFieldMap.get(feedback);
        contactToUpdate.put(fieldName, true);
      } else {
        // Any other feedback goes into the "Other" field
        contactToUpdate.Other__c = other;
      }
    }

    // Update the contact record
    try {
      update contactToUpdate;
    } catch (DmlException e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('Error updating Contact record: ' + e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<String> getInquiryType() {
    List<String> filteredPicklistValues = new List<String>();
    try {
      List<String> picklistValuesResult = new List<String>();
      Schema.DescribeFieldResult fieldResult = Case.InquiryType__c.getDescribe();
      List<Schema.PicklistEntry> picklistValues = fieldResult.getPicklistValues();
      System.debug(picklistValues.size());
      //Id userId = '005Io000000uhPHIAY';
      Id userId = UserInfo.getUserId();
      System.debug('User ID: ' + userId);

      Map<String, String> permissionSetMap = new Map<String, String>{
        'Vehicle' => 'FUSO_CCP_External_Vehicle_management',
        'DTFSA' => 'FUSO_CCP_External_Financial_service',
        'EInvoice' => 'E_invoice'
      };

      Map<String, Id> permissionSetIds = new Map<String, Id>();
      for (PermissionSet ps : [
        SELECT Id, Name
        FROM PermissionSet
        WHERE Name IN :permissionSetMap.values()
      ]) {
        permissionSetIds.put(ps.Name, ps.Id);
      }

      Set<Id> assignedPermissionSetIds = new Set<Id>();
      for (PermissionSetAssignment psa : [
        SELECT PermissionSetId
        FROM PermissionSetAssignment
        WHERE
          AssigneeId = :userId
          AND PermissionSetId = :permissionSetIds.Values()
      ]) {
        assignedPermissionSetIds.add(psa.PermissionSetId);
      }

      for (Schema.PicklistEntry entry : picklistValues) {
        picklistValuesResult.add(entry.getLabel());
      }
      Set<String> valuesToRemove = new Set<String>();

      if (
        !assignedPermissionSetIds.contains(
          permissionSetIds.get('FUSO_CCP_External_Vehicle_management')
        )
      ) {
        valuesToRemove.add('車両管理に関するお問い合わせ');
      }
      if (
        !assignedPermissionSetIds.contains(
          permissionSetIds.get('FUSO_CCP_External_Financial_service')
        )
      ) {
        valuesToRemove.add('FUSOリースに関するお問い合わせ');
      }
      if (
        !assignedPermissionSetIds.contains(permissionSetIds.get('E_invoice'))
      ) {
        valuesToRemove.add('部整月次請求書（電子版）に関するお問い合わせ');
      }

      for (String value : picklistValuesResult) {
        if (!valuesToRemove.contains(value)) {
          filteredPicklistValues.add(value);
        }
      }
    } catch (DmlException e) {
      CCP2_HandlerForException.LogException(e);
      System.debug('Error updating Contact record: ' + e.getMessage());
    }
    System.debug('Filtered Picklist Values: ' + filteredPicklistValues);
    return filteredPicklistValues;
  }
}

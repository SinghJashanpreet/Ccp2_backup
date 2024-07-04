public class ccp2_userupdate {
    @AuraEnabled
    //@future
    public static void updateRecords(String uiFieldJson) {
        System.debug(uiFieldJson);
        //String input = uiFieldJson;
        // Deserialize the JSON string into a list of maps
        List<Object> fieldMapListRaw = (List<Object>) JSON.deserializeUntyped(uiFieldJson);
        
		System.debug(fieldMapListRaw);
        
        System.debug(fieldMapListRaw.isEmpty());
        if (fieldMapListRaw.isEmpty()) {
            throw new AuraHandledException('Input JSON is empty');
        }

        // Assuming the list contains maps
        Map<String, Object> fieldMap = (Map<String, Object>) fieldMapListRaw[0];

        // Maintain the existing logic of using ccp2_filedmap
        Map<String, String> updatedFieldMap = new Map<String, String>();
        for (String uiFieldKey : fieldMap.keySet()) {
            Object uiFieldValueObj = fieldMap.get(uiFieldKey);
            String uiFieldValue = uiFieldValueObj != null ? String.valueOf(uiFieldValueObj) : null; // Convert to String

            // Get the corresponding Salesforce field name
            String sfFieldKey = ccp2_filedmap.uiFieldInput(uiFieldKey);
            if (sfFieldKey != null) {
                updatedFieldMap.put(sfFieldKey, uiFieldValue);
            } else {
                updatedFieldMap.put(uiFieldKey, uiFieldValue);
            }
        }
        System.debug('Updated Field Map: ' + updatedFieldMap);

        String contactId = updatedFieldMap.get('ContactId');
        if (String.isBlank(contactId)) {
            throw new AuraHandledException('ContactId is required');
        }

        Contact contactToUpdate;
        try {
            contactToUpdate = [SELECT Id, FirstName, LastName, Email, Title, Employee_Code__c, MobilePhone, Phone, firstNameKana__c, lastNameKana__c, Branch__c, Department
                               FROM Contact 
                               WHERE Id = :contactId 
                               LIMIT 1];
            System.debug('Contact to Update: ' + contactToUpdate);
        } catch (Exception e) {
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
            contactToUpdate.firstNameKana__c = updatedFieldMap.get('firstNameKana__c');
        }
        if (updatedFieldMap.containsKey('Branch__c')) {
            contactToUpdate.Branch__c = updatedFieldMap.get('Branch__c');
        }
        if (updatedFieldMap.containsKey('Title')) {
            contactToUpdate.Title = updatedFieldMap.get('Title');
        }
        if (updatedFieldMap.containsKey('Employee_Code__c')) {
            contactToUpdate.Employee_Code__c = updatedFieldMap.get('Employee_Code__c');
        }
        if (updatedFieldMap.containsKey('lastNameKana__c')) {
            contactToUpdate.lastNameKana__c = updatedFieldMap.get('lastNameKana__c');
        }

        try {
            System.debug('Final Contact to Update: ' + contactToUpdate);
            update contactToUpdate;
        } catch (DmlException e) {
             CCP2_HandlerForException.LogException(e);
            throw new AuraHandledException('Error updating Contact record: ' + e.getMessage());
        }
        //Deleting branch from junction table
        /*List<CCP2_BranchContact_Junction__c> childRecords = [SELECT Id,ContactId__c FROM CCP2_BranchContact_Junction__c WHERE ContactId__c  =:contactId];
         try {
            delete childRecords;
        } catch (DmlException e) {
            CCP2_HandlerForException.LogException(e);
            throw new AuraHandledException('Failed to insert Branch records: ' + e.getMessage());
        }
        
        List<CCP2_BranchContact_Junction__c> branchRecords = new List<CCP2_BranchContact_Junction__c>();

        // Iterate through the branches list and create Branch records
        for (String branchName : branches) {
            CCP2_BranchContact_Junction__c branch = new CCP2_BranchContact_Junction__c();
            branch.BranchId__c = branchName;
            branch.ContactId__c = contactId;
           // branch.Name = branchName;
            branchRecords.add(branch);
        }

        // Insert the Branch records
        if (!branchRecords.isEmpty()) {
        try {
            insert branchRecords;
        } catch (DmlException e) {
            CCP2_HandlerForException.LogException(e);
            throw new AuraHandledException('Failed to insert Branch records: ' + e.getMessage());
        }
    }*/
    }
        public static void branchContactDelete(Id contactId, List<Id> branchesToDelete) {
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
                } catch (DmlException e) {
                    CCP2_HandlerForException.LogException(e);
                    throw new AuraHandledException('Failed to delete Branch records: ' + e.getMessage());
                }
            }
        }
    }

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
            } catch (DmlException e) {
                CCP2_HandlerForException.LogException(e);
                throw new AuraHandledException('Failed to insert Branch records: ' + e.getMessage());
            }
        }
    }
    }
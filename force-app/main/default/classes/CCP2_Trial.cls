public class CCP2_Trial {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getCalendarData2(String uiStartStr, Integer page, String jsonInput) { 
    Map<String, Object> result = new Map<String, Object>();
        List<CCP2_Maintenance_Booking__c> TotalList = new List<CCP2_Maintenance_Booking__c>();
        //Id ccpUserId = '005Io000000uTA3IAM';
        Id ccpUserId = UserInfo.getUserId();
        Date uiStart = Date.valueOf(uiStartStr);
        Date uiEnd = uiStart.AddDays(19);
        Date startDate = Date.Today()-730;
        Date endDate = Date.Today()+730;
        try {
            // Fetch user related to a specific user ID
            Contact contact = [SELECT Id FROM Contact WHERE UserId__c = :ccpUserId LIMIT 1];

            // Fetch branches linked to the user
            List<CCP2_BranchContact_Junction__c> branches =
                [SELECT BranchId__c FROM CCP2_BranchContact_Junction__c WHERE ContactId__c = :contact.Id];
            Set<Id> branchIds = new Set<Id>();
            for (CCP2_BranchContact_Junction__c branch : branches) {
                branchIds.add(branch.BranchId__c);
            }

            // Fetch vehicles linked to the branches
            List<CCP2_BranchVehicle_Junction__c> junctionVehicle =
                [SELECT VehicleId__c FROM CCP2_BranchVehicle_Junction__c WHERE BranchId__c IN :branchIds];
            Set<Id> vehicleIds = new Set<Id>();
            for (CCP2_BranchVehicle_Junction__c vehicle : junctionVehicle) {
                vehicleIds.add(vehicle.VehicleId__c);
            }

            Integer pageSize = 10;
            Integer offset = (page - 1) * pageSize;

            // Fetch paginated registered vehicles
            List<ccp2_Registered_Vehicle__c> vehicles = [
                SELECT Id, Favoruite_Vehicle__c, Registration_Number__c,Vehicle_Expiration_Date__c
                FROM ccp2_Registered_Vehicle__c
                WHERE Id IN :vehicleIds
                LIMIT :pageSize OFFSET :offset
            ];
            
            Integer vehicleSize = vehicles.size();
            Integer totalPage = (vehicleSize + pageSize -1) / pageSize;
            
            // Aggregate to find counts of service types per vehicle
            Map<Id, Integer> serviceTypeCounts = new Map<Id, Integer>();
            for (AggregateResult ar : [
                SELECT Vehicle__c, COUNT(Service_Type__c) count_service
                FROM CCP2_Maintenance_Booking__c
                WHERE Vehicle__c IN :vehicleIds
                GROUP BY Vehicle__c
            ]) {
                serviceTypeCounts.put((Id) ar.get('Vehicle__c'), (Integer) ar.get('count_service'));
            }

            Map<Id, Map<Date, Map<Integer, CCP2_Maintenance_Booking__c>>> maintenanceByVehicle = new Map<Id, Map<Date, Map<Integer, CCP2_Maintenance_Booking__c>>>();
            Map<Id, Map<Id, Integer>> servicePositionMap = new Map<Id, Map<Id, Integer>>();
             TotalList = [SELECT Id, CCP2_Branch__c, Implementation_Date__c, Maintenance_Type__c, Recieving_Destination__c,
                       Recieving_Destination_noSearch__c, Schedule_Date__c, Schedule_EndDate__c, Service_Factory__c,
                       Service_Type__c, Status__c, Vehicle__c, Account__c
                FROM CCP2_Maintenance_Booking__c
                WHERE Vehicle__c IN :vehicleIds AND
                      ((Schedule_Date__c >= :startDate And Schedule_EndDate__c <= :endDate) Or (Implementation_Date__c >= :startDate AND Implementation_Date__c <= :endDate))
                ORDER BY Schedule_Date__c ASC, Schedule_EndDate__c DESC
            ];
            System.debug(TotalList);
            
            Date firstMaintenanceDate1 = Date.Today(), lastMaintenanceDate = Date.Today();
            if(TotalList.size() > 0){
                firstMaintenanceDate1 = TotalList[0].Schedule_Date__c;
                lastMaintenanceDate = TotalList[TotalList.size()-1].Schedule_EndDate__c;
            }
            
            //System.debug(firstMaintenanceDate1);
            //System.debug(lastMaintenanceDate);
            Date currentDate1 = Date.today();
            Map<Date, Integer> dateWiseCount = new Map<Date, Integer>();
            
            for (CCP2_Maintenance_Booking__c maintenance : TotalList) {
                if (!maintenanceByVehicle.containsKey(maintenance.Vehicle__c)) {
                    maintenanceByVehicle.put(maintenance.Vehicle__c, new Map<Date, Map<Integer, CCP2_Maintenance_Booking__c>>());
                }

                if (!servicePositionMap.containsKey(maintenance.Vehicle__c)) {
                    servicePositionMap.put(maintenance.Vehicle__c, new Map<Id, Integer>());
                }

                Map<Date, Map<Integer, CCP2_Maintenance_Booking__c>> dateMap = maintenanceByVehicle.get(maintenance.Vehicle__c);
                Map<Id, Integer> vehicleServicePosition = servicePositionMap.get(maintenance.Vehicle__c);

                // Assign position based on range overlap
                Boolean isPositioned = false;
                for (Date currentDate = maintenance.Schedule_Date__c; currentDate <= maintenance.Schedule_EndDate__c; currentDate = currentDate.addDays(1)) {
                    if (dateMap.containsKey(currentDate)) {
                        isPositioned = true;
                        break;
                    }
                }

                Integer servicePosition = isPositioned ? vehicleServicePosition.size() + 1 : 1;
                vehicleServicePosition.put(maintenance.Id, servicePosition);

                for (Date currentDate = maintenance.Schedule_Date__c; currentDate <= maintenance.Schedule_EndDate__c; currentDate = currentDate.addDays(1)) {
                    if (!dateMap.containsKey(currentDate)) {
                        dateMap.put(currentDate, new Map<Integer, CCP2_Maintenance_Booking__c>());
                    }

                    Map<Integer, CCP2_Maintenance_Booking__c> indexMap = dateMap.get(currentDate);
                    Integer maxServiceTypeCount = serviceTypeCounts.get(maintenance.Vehicle__c);

                    if (servicePosition <= maxServiceTypeCount) {
                        indexMap.put(servicePosition, maintenance);
                    }
                }
            }

            List<Map<String, Object>> vehicleData = new List<Map<String, Object>>();
            for (ccp2_Registered_Vehicle__c vehicle : vehicles) {
                Map<String, Object> vehicleDetails = new Map<String, Object>();
                vehicleDetails.put('vehicle', vehicle);
                
                 
                String favoriteIcon = vehicle.Favoruite_Vehicle__c ? 'utility:favorite' : 'utility:favorite_alt';
                vehicleDetails.put('favIcon', favoriteIcon);
                vehicleDetails.put('Registration_Number__c',vehicle.Registration_Number__c);
                List<Map<String, Object>> dateWiseMaintenance = new List<Map<String, Object>>();
                List<Map<String, Object>> dateWiseMaintenanceForUi = new List<Map<String, Object>>();

                for (Date currentDate = startDate; currentDate <= endDate; currentDate = currentDate.addDays(1)) {
                    Map<String, Object> dateDetails = new Map<String, Object>();
                    dateDetails.put('date', currentDate);
                   
                    Integer dayOfWeek = currentDate.toStartOfWeek().daysBetween(currentDate) + 1;
                    String classForBoxes = 'Calender-tile-white';
                    String cssClass = '';
                    
                    String width = '';
                    Integer count = 0;
                    Boolean isContinue = false;
                    Boolean implementationFlag = false;
                    Boolean isMultiple = false;
                    Boolean isStart = false, isEnd = false;
                    String serviceType = '';
                    Boolean isExpirationDate = vehicle.Vehicle_Expiration_Date__c != null && vehicle.Vehicle_Expiration_Date__c == currentDate;
                    dateDetails.put('isExpirationDate', isExpirationDate);

                    List<CCP2_Maintenance_Booking__c> maintenanceList = new List<CCP2_Maintenance_Booking__c>();
                    if (maintenanceByVehicle.containsKey(vehicle.Id) &&
                        maintenanceByVehicle.get(vehicle.Id).containsKey(currentDate)) {
                        Map<Integer, CCP2_Maintenance_Booking__c> maintenanceMap = maintenanceByVehicle.get(vehicle.Id).get(currentDate);
                        Integer maxServiceTypeCount = serviceTypeCounts.get(vehicle.Id);

                        // Populate the maintenanceList with ordered maintenance and empty records
                        for (Integer i = 1; i <= maxServiceTypeCount; i++) {
                            if (maintenanceMap.containsKey(i)) {
                                maintenanceList.add(maintenanceMap.get(i));
                            } else {
                               CCP2_Maintenance_Booking__c emptyMaintenance = new CCP2_Maintenance_Booking__c();
                                emptyMaintenance.Maintenance_Type__c='a012w00000XXXXXAAA'+i;
                                emptyMaintenance.CCP2_Branch__c = null; 
                                emptyMaintenance.Implementation_Date__c = null;
                       			emptyMaintenance.Recieving_Destination_noSearch__c = '';
                                emptyMaintenance.Schedule_Date__c = null;
                                emptyMaintenance.Schedule_EndDate__c = null;
                                emptyMaintenance.Service_Factory__c ='';
                       			emptyMaintenance.Service_Type__c = '';
                                emptyMaintenance.Status__c = '';
                                emptyMaintenance.Vehicle__c = null;
                                emptyMaintenance.Account__c = null;
                                maintenanceList.add(emptyMaintenance);
                            }
                        }
                    }
                    dateDetails.put('maintenance', maintenanceList);
                    
                    for (CCP2_Maintenance_Booking__c maintenance : TotalList) {
                        if (maintenance.Vehicle__c == vehicle.Id && maintenance.Implementation_Date__c != null && maintenance.Implementation_Date__c == currentDate) {
                            dateDetails.put('implementationDate', maintenance.Implementation_Date__c);
                            implementationFlag = true;
                            dateDetails.put('implementationFlag', implementationFlag);
                            dateDetails.put('cssClass','grey-box');
                            //dateDetails.put();
                            //dateDetails.put('implementationDetails', maintenance);
                            //break;
                        }
                    }
                    
                    if(maintenanceList.size() > 0){
                        Date firstMaintenanceDate = maintenanceList[0].Schedule_Date__c;
                        String serviceType1 = maintenanceList[0].Service_Type__c;
                        if(currentDate == firstMaintenanceDate){
                        	isStart = true;
                            serviceType = serviceType1;
                           
                    	}   
                    }
                    
                   if(maintenanceList.size() > 0){
                       String factory = maintenanceList[0].Service_Factory__c;
                       if(factory == '自社'){
                           cssClass = 'green-box';
                       }
                       else {
                           cssClass = 'yellow-box';
                       }
                   }
                    
                    if(dayOfWeek == 1 || dayOfWeek == 7){
                        classForBoxes = 'Calender-tile-grey';
                    }
                    if(maintenanceList.size() > 0){
                        Date lastMaintenanceDate1 = maintenanceList[0].Schedule_EndDate__c;        
                        if(currentDate == lastMaintenanceDate1){
                        	isEnd = true;  
                    	}   
                    }
                    if(isStart == true && isEnd == true){
                        width = 'width: calc(100% - 6px);';
                    }
                    else if(isStart == true){
                        width = 'width: calc(100% + 4px - 6px); border-top-right-radius: 0px; border-bottom-right-radius: 0px; z-index:2;';
                    }
                    else if(isEnd == true){
                        width = 'width: 100%; left: 0px; border-top-right-radius: 5px; border-bottom-right-radius: 5px;';
                    }
                    else {
                        width = 'width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;';
                    }
                    
                    
                    if (maintenanceList.size() > 1) {
                        for (Integer i = 0; i < maintenanceList.size(); i++) {
                            if (maintenanceList[i].Schedule_Date__c != null) {
                                count += 1; 
                            }
                            if (count > 1) { 
                                isMultiple = true;
                                //break;
                            }
                        }
                    }
                    if (isMultiple == true) {
              			width = width + 'height: calc(50% - 2px); font-size:11px;';
                    }
                    
                    if (maintenanceList.size() > 1) {
                        if (maintenanceList[0].Schedule_Date__c == null) {
                           	isContinue = true;
                        }
                    }
                    //System.debug(count);
                    dateDetails.put('countOfMaintenance',count);
                    dateDetails.put('isContinue',isContinue);
                    dateDetails.put('isMultiple',isMultiple);
                    dateDetails.put('width',width);
                    dateDetails.put('cssClass', cssClass);
                    dateDetails.put('isStart', isStart);
                    dateDetails.put('isEnd', isEnd);
                    dateDetails.put('serviceType', serviceType);
                    dateDetails.put('classForBoxes', classForBoxes);
                    if(maintenanceList.size()>0){
                        dateDetails.put('isMaintenanceAvailable', 'true');  
                    }
                    else
                    {
                        dateDetails.put('isMaintenanceAvailable', 'false');  
                    }
                    dateWiseMaintenance.add(dateDetails);
                    
                    if((currentDate >= uiStart && currentDate <= uiEnd)){
                     dateWiseMaintenanceForUi.add(dateDetails);   
                    }
                }
                vehicleDetails.put('dates', dateWiseMaintenanceForUi);
                vehicleData.add(vehicleDetails);
            }
    
            List<ccp2_Registered_Vehicle__c> vehicleForExpiryCount = 
                [SELECT Vehicle_Expiration_Date__c 
                 FROM ccp2_Registered_Vehicle__c 
                 WHERE Id IN :vehicleIds];
            
            Integer expiringVehicleCount = 0;
            for (ccp2_Registered_Vehicle__c vehicle : vehicleForExpiryCount) {
                if (vehicle.Vehicle_Expiration_Date__c != null &&
                    vehicle.Vehicle_Expiration_Date__c <= Date.today().addDays(30) &&
                    vehicle.Vehicle_Expiration_Date__c >= Date.today()) {
                    expiringVehicleCount++;
                }
            }
            Integer vehicleRecallCount = [SELECT Count() FROM ccp2_Registered_Vehicle__c 
                                          WHERE CCP2_Recall_Status__c = 'Not Completed' And Id IN :vehicles];
            
            result.put('vehicleRecallCount', vehicleRecallCount);
            result.put('expiringVehicleCount', expiringVehicleCount);
            result.put('vehicles', vehicleData);

        } catch (Exception e) {
            CCP2_HandlerForException.LogException(e);
            System.debug('An error occurred: ' + e.getMessage());
        }
        System.debug(result);
        return result;
    }
}
import { LightningElement, track, wire, api } from "lwc";
import getDataFromDLO from "@salesforce/apex/DataCloudDataService.getParsedDataFromDLO";

import {
  subscribe,
  unsubscribe,
  onError,
  setDebugFlag,
  isEmpEnabled
} from "lightning/empApi";
import { loadScript } from "lightning/platformResourceLoader";
import cometdlwc from "@salesforce/resourceUrl/cometd";
import getSessionId from "@salesforce/apex/CCP2_Notification_Controller.getSessionId";

export default class VehicleServiceTimeline extends LightningElement {
  channelName = "/event/CCP_Notification__e";
  sessionId;
  subscription = {};
  connectedCallback() {
    let dates = [
      {
        date: "2025-01-31",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: false,
        width:
          "width: calc(100% + 4px - 6px); border-top-right-radius: 0px; border-bottom-right-radius: 0px; z-index:2;",
        cssClass: "green-box",
        isStart: true,
        isEnd: false,
        serviceType: "車検整備",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-01",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            Id: "a1deX000000CbAHQA0",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-02-01",
            Schedule_EndDate__c: "2025-02-03",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: true,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;height: calc(50% - 2px); font-size:11px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-grey",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-02",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            Id: "a1deX000000CbAHQA0",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-02-01",
            Schedule_EndDate__c: "2025-02-03",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: true,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;height: calc(50% - 2px); font-size:11px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-grey",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-03",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            Id: "a1deX000000CbAHQA0",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-02-01",
            Schedule_EndDate__c: "2025-02-03",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: true,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;height: calc(50% - 2px); font-size:11px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-04",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            Id: "a1deX000000CIafQAG",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-02-04",
            Schedule_EndDate__c: "2025-02-06",
            Service_Factory__c: "自社",
            Service_Type__c: "3か月点検",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: true,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;height: calc(50% - 2px); font-size:11px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-05",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            Id: "a1deX000000CIafQAG",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-02-04",
            Schedule_EndDate__c: "2025-02-06",
            Service_Factory__c: "自社",
            Service_Type__c: "3か月点検",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: true,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;height: calc(50% - 2px); font-size:11px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-06",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            Id: "a1deX000000CIafQAG",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-02-04",
            Schedule_EndDate__c: "2025-02-06",
            Service_Factory__c: "自社",
            Service_Type__c: "3か月点検",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: true,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;height: calc(50% - 2px); font-size:11px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-07",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-08",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-grey",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-09",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-grey",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-10",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-11",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Id: "a1deX000000CggDQAS",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-02-11",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "3か月点検",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: true,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;height: calc(50% - 2px); font-size:11px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-grey",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-12",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Id: "a1deX000000CggDQAS",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-02-11",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "3か月点検",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            Id: "a1deX000000CIXRQA4",
            CCP2_Branch__c: "a1VIo0000000QQCMA2",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "HK Branch 1",
            Schedule_Date__c: "2025-02-12",
            Schedule_EndDate__c: "2025-02-16",
            Service_Factory__c: "自社",
            Service_Type__c: "一般整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: true,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;height: calc(50% - 2px); font-size:11px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-13",
        maintenance: [
          {
            Id: "a1deX000000CIUDQA4",
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-01-31",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "車検整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            CCP2_Branch__c: "a1VIo0000000QQ2MAM",
            Id: "a1deX000000CggDQAS",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "本社",
            Schedule_Date__c: "2025-02-11",
            Schedule_EndDate__c: "2025-02-13",
            Service_Factory__c: "自社",
            Service_Type__c: "3か月点検",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          },
          {
            Id: "a1deX000000CIXRQA4",
            CCP2_Branch__c: "a1VIo0000000QQCMA2",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "HK Branch 1",
            Schedule_Date__c: "2025-02-12",
            Schedule_EndDate__c: "2025-02-16",
            Service_Factory__c: "自社",
            Service_Type__c: "一般整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: false,
        isMultiple: true,
        width:
          "width: 100%; left: 0px; border-top-right-radius: 5px; border-bottom-right-radius: 5px;height: calc(50% - 2px); font-size:11px;",
        cssClass: "green-box",
        isStart: false,
        isEnd: true,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-14",
        maintenance: [
          {
            Id: "a1deX000000CIXRQA4",
            CCP2_Branch__c: "a1VIo0000000QQCMA2",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "HK Branch 1",
            Schedule_Date__c: "2025-02-12",
            Schedule_EndDate__c: "2025-02-16",
            Service_Factory__c: "自社",
            Service_Type__c: "一般整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-15",
        maintenance: [
          {
            Id: "a1deX000000CIXRQA4",
            CCP2_Branch__c: "a1VIo0000000QQCMA2",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "HK Branch 1",
            Schedule_Date__c: "2025-02-12",
            Schedule_EndDate__c: "2025-02-16",
            Service_Factory__c: "自社",
            Service_Type__c: "一般整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-grey",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-16",
        maintenance: [
          {
            Id: "a1deX000000CIXRQA4",
            CCP2_Branch__c: "a1VIo0000000QQCMA2",
            Maintenance_Type__c: "Scheduled",
            Recieving_Destination__c: "HK Branch 1",
            Schedule_Date__c: "2025-02-12",
            Schedule_EndDate__c: "2025-02-16",
            Service_Factory__c: "自社",
            Service_Type__c: "一般整備",
            Status__c: "In Progress",
            Vehicle__c: "a1aIo000000HDryIAG"
          }
        ],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-grey",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-17",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-18",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-19",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-20",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-21",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-22",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-23",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-24",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-25",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-26",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-27",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-02-28",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      },
      {
        date: "2025-03-01",
        maintenance: [],
        isExpirationDate: false,
        countOfMaintenance: 1,
        isContinue: true,
        isMultiple: false,
        width:
          "width: calc(100% + 4px); left: 0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;",
        cssClass: "yellow-box",
        isStart: false,
        isEnd: false,
        serviceType: "",
        classForBoxes: "Calender-tile-white",
        isMaintenanceAvailable: "true"
      }
    ]

    this.getSortedCalendarData(dates);

    getSessionId()
      .then((result) => {
        this.sessionId = result;
        this.initializeCometD();
      })
      .catch((error) => {
        console.error("Error fetching session ID: " + error);
      });
    // Simulating fetched data
    // this.processServiceDates(this.maintanceHistoryData);
  }

  initializeCometD() {
    loadScript(this, cometdlwc).then(() => {
      var cometdlib = new window.org.cometd.CometD();
      // console.log('cometdlib', cometdlib);
      // console.log('window.location.protocol', window.location.protocol);
      // console.log('window.location.hostname', window.location.hostname);
      // console.log('this.sessionId', this.sessionId);
      //Calling configure method of cometD class, to setup authentication which will be used in handshaking
      cometdlib.configure({
        url:
          window.location.protocol +
          "//" +
          window.location.hostname +
          "/cometd/59.0/",
        requestHeaders: { Authorization: "OAuth " + this.sessionId }, // you need get the sessionId from Apex
        appendMessageTypeToURL: false,
        logLevel: "debug"
      });

      cometdlib.websocketEnabled = false;

      cometdlib.handshake(function (status) {
        if (status.successful) {
          // Successfully connected to the server.
          // Now it is possible to subscribe or send messages
          // console.log("Successfully connected to server");
          cometdlib.subscribe("/event/CCP_Notification__e", function (message) {
            // console.log("subscribed to message!" + message);
          });
        } else {
          /// Cannot handshake with the server, alert user.
          console.error("Error in handshaking: " + JSON.stringify(status));
        }
      });
    });
  }

  disconnectedCallback() {
    // this.unsubscribeFromPlatformEvent();
  }

  @api vehicleChessis;
  months = [
    { name: "Jan", hasService: false, className: "service-marker" },
    { name: "Feb", hasService: false, className: "service-marker" },
    { name: "Mar", hasService: false, className: "service-marker" },
    { name: "Apr", hasService: false, className: "service-marker" },
    { name: "May", hasService: false, className: "service-marker" },
    { name: "Jun", hasService: false, className: "service-marker" },
    { name: "Jul", hasService: false, className: "service-marker" },
    { name: "Aug", hasService: false, className: "service-marker" },
    { name: "Sep", hasService: false, className: "service-marker" },
    { name: "Oct", hasService: false, className: "service-marker" },
    { name: "Nov", hasService: false, className: "service-marker" },
    { name: "Dec", hasService: false, className: "service-marker" }
  ];

  isTooltipVisible = false;
  hoveredServiceDate = "";
  tooltipClass = "tooltip hidden"; // Initially hidden

  serviceDates = [];
  serviceCosts = [];

  @track maintanceHistoryData = [];

  //   , { vehicleId: "$vehicleId" }
  @wire(getDataFromDLO, { key: "$vehicleChessis" })
  handledata(result) {
    const { data, error } = result;
    if (data) {
      // console.log("getDataFromDLO data:- ", data);
      this.maintanceHistoryData = data;
      this.processServiceDates(data);
    } else if (error) {
      // console.error("geting from DLO api: ", error);
    }
  }

  processServiceDates(data) {
    // Extract service dates from data
    this.serviceDates = data.map((item) => {
      return item.srv_dt__c.split(" ")[0]; // Only keep the date part (DD/MM/YYYY)
    });

    // Mark the months with services
    this.updateServiceMonths();
  }

  updateServiceMonths() {
    let costToShow = 0;
    this.months = this.months.map((month) => {
      const serviceForMonth = this.serviceDates.find((service) => {
        costToShow = this.maintanceHistoryData.filter((x) => {
          let cost = 0;
          if (x.srv_dt__c.split(" ")[0] === service) {
            cost = x.x_bill_amount_total__c;
          }
          return cost;
        });
        const serviceDate = new Date(service.split("/").reverse().join("/")); // Convert to YYYY/MM/DD
        return this.getMonthName(serviceDate) === month.name;
      });
      if (serviceForMonth) {
        return {
          ...month,
          hasService: true,
          className: "service-marker marked",
          serviceDate: serviceForMonth, // Store the service date,
          costToShow: costToShow[0].x_bill_amount_total__c
        };
      }
      return month;
    });
  }

  getMonthName(date) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    return monthNames[date.getMonth()];
  }

  getTooltipShow() {
    return this.showTool === true;
  }

  handleMouseOver(event) {
    const arrow = event.target; // Directly get the arrow element
    const monthItem = arrow.closest(".timeline-item");
    const monthName = monthItem.dataset.month; // Get the month name
    const serviceMonth = this.months.find(
      (month) => month.name === monthName && month.hasService
    );

    if (serviceMonth) {
      this.hoveredServiceDate = serviceMonth.costToShow;

      // Get the arrow's position relative to the document
      const arrowRect = arrow.getBoundingClientRect();
      const tooltip = this.template.querySelector(".tooltip");

      // Calculate the position
      tooltip.style.left = `${arrowRect.left + arrowRect.width / 2 - tooltip.offsetWidth / 2 - 380}px`;
      //   tooltip.style.top = `${arrowRect.top + window.scrollY - tooltip.offsetHeight - 5}px`; // Adjust top value as needed

      this.tooltipClass = "tooltip visible";
    }
  }

  handleMouseOut() {
    this.tooltipClass = "tooltip hidden"; // Hide tooltip on mouse out
    // this.hoveredServiceDate = ''
  }

  //   navigationPoc(event){
  //    window.focus();
  //    setTimeout(() => {
  //     window.focus();
  //     console.log('2focuesdwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww');

  //    }, 3000);
  //    this.newFun();

  // const elm = this.template.querySelector('nnnn');
  // elm.click();

  //   }

  navigationPoc() {
    // console.log('hi!!');
    const newW = window.open(
      "https://www.w3schools.com",
      "_blank",
      "noopener,noreferrer,width=800,height=600,resizable=yes,scrollbars=yes"
    );

    if (newW) {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      newW.blur();
      setTimeout(newW.focus, 0);
    } else {
      // eslint-disable-next-line no-alert
      alert("Please allow popups for this website");
    }
  }

  //   getSortedCalendarData(dates){
  //     if (!dates || dates.length === 0) return [];
  //     console.log('dates',dates);

  //     let modifiedDates = [];
  //     let prevList = [...dates[0].maintenance];

  //     modifiedDates.push({ ...dates[0] });

  //    for (let i = 1; i < dates.length; i++) {
  //         let currentDate = { ...dates[i] };
  //         let newMaintenance = [];
  //         let usedIndices = new Set();

  //         prevList.forEach((prevEvent, index) => {
  //             let matchedEvent = currentDate.maintenance.find(event => event.Id === prevEvent.Id);
  //             if (matchedEvent) {
  //                 newMaintenance[index] = matchedEvent;
  //                 usedIndices.add(currentDate.maintenance.indexOf(matchedEvent));
  //             } else {
  //                 newMaintenance[index] = this.createDummyEvent();
  //             }
  //         });

  //         currentDate.maintenance.forEach((event, idx) => {
  //             if (!usedIndices.has(idx)) {
  //                 newMaintenance.push(event);
  //             }
  //         });

  //         currentDate.maintenance = newMaintenance;
  //         modifiedDates.push(currentDate);
  //         prevList = [...newMaintenance];
  //     }

  //     console.log('modifiedDates',JSON.stringify(modifiedDates));
  //     return modifiedDates;
  //   }

  //  createDummyEvent() {
  //     return {
  //         Id: null,
  //         CCP2_Branch__c: null,
  //         Maintenance_Type__c: null,
  //         Recieving_Destination__c: null,
  //         Schedule_Date__c: null,
  //         Schedule_EndDate__c: null,
  //         Service_Factory__c: null,
  //         Service_Type__c: null,
  //         Status__c: null,
  //         Vehicle__c: null
  //     };
  // }






  /* 
  Below two method are for calendar 
  Just pass dates(30 or 31) of any vehicle it will arrange the dates in proper order,
  and append dummy data for proper positioning of events.
  */
  getSortedCalendarData(dates) {
    if (!dates || dates.length === 0) return [];

    console.log("dates", dates);

    let modifiedDates = [];
    let prevList = [...dates[0].maintenance];

    modifiedDates.push({ ...dates[0] });
    for (let i = 1; i < dates.length; i++) {
      let currentDate = { ...dates[i] };
      console.log("currentDate.date", currentDate.date);
      let newMaintenance = Array(prevList.length).fill({
        Id: null,
        CCP2_Branch__c: null,
        Maintenance_Type__c: null,
        Recieving_Destination__c: null,
        Schedule_Date__c: null,
        Schedule_EndDate__c: null,
        Service_Factory__c: null,
        Service_Type__c: null,
        Status__c: null,
        Vehicle__c: null
      }); 
      // console.log('newMaintenance first', [...newMaintenance])
      let usedIndices = new Set();

      let matchedCount = 0;
      let lastMatchedIndex = -1;

      // Step 1: Try to place matched events at their previous positions
      prevList.forEach((prevEvent, index) => {
        let matchedEvent = currentDate.maintenance.find(
          (event) => event.Id === prevEvent.Id
        );
        if (matchedEvent) {
          newMaintenance[index] = matchedEvent;
          usedIndices.add(currentDate.maintenance.indexOf(matchedEvent));
          matchedCount++;
          lastMatchedIndex = index;
          // console.log('newMaintenance if', [...newMaintenance])
        } else {
          newMaintenance[index] = this.createDummyEvent();
          // console.log('newMaintenance else', [...newMaintenance])
        }
      });

      currentDate.maintenance.forEach((event, idx) => {
        if (!usedIndices.has(idx)) {
          // console.log('event', event,idx, lastMatchedIndex)
          // console.log('newMaintenance', newMaintenance)
          lastMatchedIndex = lastMatchedIndex + 1;
          // while ([...newMaintenance[insertIndex]]?.Id !== null || undefined) {
          //       insertIndex++;
          //   }
          newMaintenance[lastMatchedIndex] = event;
          // console.log('newMaintenance2', newMaintenance)
        }
      });

      // Remove trailing dummy events if not required
      newMaintenance = newMaintenance.filter((event) => event !== null);

      currentDate.maintenance = newMaintenance;
      modifiedDates.push(currentDate);
      prevList = [...newMaintenance];
    }

    console.log("modifiedDates", JSON.stringify(modifiedDates));
    return modifiedDates;
  }

  createDummyEvent() {
    return {
      Id: null,
      CCP2_Branch__c: null,
      Maintenance_Type__c: null,
      Recieving_Destination__c: null,
      Schedule_Date__c: null,
      Schedule_EndDate__c: null,
      Service_Factory__c: null,
      Service_Type__c: null,
      Status__c: null,
      Vehicle__c: null
    };
  }
}

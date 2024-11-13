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
          console.log("Successfully connected to server");
          cometdlib.subscribe("/event/CCP_Notification__e", function (message) {
            console.log("subscribed to message!" + message);
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
}
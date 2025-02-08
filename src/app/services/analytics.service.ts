import { Injectable } from "@angular/core";

declare var gtag: any;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  trackEvent(eventCategory: string, eventName: string, eventDetails: string) {
    gtag('event', eventName, {
      'event_category': eventCategory,
      'event_label': eventName,
      'value': eventDetails
    });
  }
}

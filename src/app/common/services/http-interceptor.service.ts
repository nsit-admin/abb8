import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonfunctionService } from './commonfunction.service';
import { apiEndPoints } from '@app/common/utils/api-endpoint.constant';
import { Router } from '@angular/router';
import { appConstants } from '../utils/app.constant';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];
  constructor(public commonfunctionService: CommonfunctionService, private router: Router) { }
  // Method for removing the once error or succeed get service call
  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    if (!req.url.includes(apiEndPoints.login)) {
      this.commonfunctionService.isLoading.next(this.requests.length > 0);
    }
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      setHeaders: {
        'Authorization': 'Bearer ' + localStorage.getItem('abb8_token')
      }
    });
    if (!req.url.includes(apiEndPoints.searchWorkspace) && !req.url.includes(apiEndPoints.SortList) && !req.url.includes(apiEndPoints.tags)
      && !req.url.includes(apiEndPoints.sendMessage) && !req.url.includes(apiEndPoints.retrieveMessageByWorkspaceDocumentName) && !req.url.includes(apiEndPoints.workspaces)
      && (!req.url.includes(apiEndPoints.getUsers) || this.router.url.includes(appConstants.route.documentDashboard)) && (!req.url.includes(apiEndPoints.getDocument) || this.router.url.includes(appConstants.route.documentDashboard)) && !req.url.includes(apiEndPoints.editDocument)
      && !req.url.includes(apiEndPoints.getDocumentDetails) && !req.url.includes(apiEndPoints.sharedNotification)
      && !req.url.includes(apiEndPoints.deleteDocument) && !req.url.includes(apiEndPoints.workspaceClone)
      && !req.url.includes(apiEndPoints.getDocAnalytics) && !req.url.includes(apiEndPoints.saveDocAnalytics)) {
      this.requests.push(req);
      this.commonfunctionService.isLoading.next(true);
    }
    return new Observable(observer => {
      const subscription = next.handle(req)
        .subscribe(
          event => {
            if (event instanceof HttpResponse) {
              this.removeRequest(req);
              observer.next(event);
            }
          },
          err => {
            this.removeRequest(req);
            observer.error(err);
          },
          () => {
            this.removeRequest(req);
            observer.complete();
          });
      // remove request from queue when cancelled
      return () => {
        this.removeRequest(req);
        subscription.unsubscribe();
      };
    });
  }
}

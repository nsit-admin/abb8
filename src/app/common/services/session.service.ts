import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClientService } from './http-client.service';
import { apiEndPoints } from '../utils/api-endpoint.constant';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private httpClientService: HttpClientService) { }

  validateToken() {
    return new Observable((observer) => {
      this.httpClientService.postData(apiEndPoints.validateToken, {}).subscribe((data: any) => {
        if (data && data.users[0]) {
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      }, (error: any) => {
        observer.next(false);
        observer.complete();
      });
    });
  }

}

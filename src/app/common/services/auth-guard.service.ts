import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { appConstants } from '../utils/app.constant';

import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private sessionService: SessionService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return new Observable((observer) => {
      // this.sessionService.validateToken().subscribe(res => {
        if (localStorage.getItem('abb8_token')) {
          observer.next(true);
          observer.complete();
        } else {
          this.router.navigate([appConstants.route.login]);
        }
      // });
    });
  }

}

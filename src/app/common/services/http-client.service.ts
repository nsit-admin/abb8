import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  public options: any = {};
  public token: any;
  public baseUrl = '/api';
  socket = io();
  constructor(private httpClient: HttpClient, public router: Router, public location: Location) {
    // console.log(location._platformLocation);
    // if (location._platformLocation.location.hostname === 'localhost') {
    //   this.baseUrl = "http://localhost:4000";
    // } else if (location._platformLocation.location.hostname.indexOf('dev') > -1) {
    //   this.baseUrl = "https://qh717ki9i3.execute-api.us-east-1.amazonaws.com/dev";
    // } else if (location._platformLocation.location.hostname.indexOf('prod') > -1) {
    //   this.baseUrl = "https://bw108p8puh.execute-api.us-east-1.amazonaws.com/prod";
    // }
    // console.log(this.router.location._platformLocation.location.hostname);
  }

  getData(url: string) {
    return this.httpClient.get(this.baseUrl + url).pipe(
      map(
        (data) => {
          return data;
        }),
      catchError((err: HttpErrorResponse) => {
        return this.handleError(err);
      }));
  }

  getDataWithParams(url: string, params: [{ name: any, value: any }]) {
    let httpParams = new HttpParams();
    params.forEach(filter => {
      httpParams = httpParams.append(filter.name, filter.value);
    });
    return this.httpClient.get(this.baseUrl + url, { params: httpParams }).pipe(
      map(
        (data) => {
          return data;
        }),
      catchError((err: HttpErrorResponse) => {
        return this.handleError(err);
      }));
  }

  postData(url: string, formdata: any) {
    return this.httpClient.post(this.baseUrl + url, formdata).pipe(
      map(
        (data) => {
          return data;
        }),
      catchError((err: HttpErrorResponse) => {
        return this.handleError(err);
      }));
  }

  putData(url: string, formdata: any) {
    return this.httpClient.put(this.baseUrl + url, formdata).pipe(
      map(
        (data) => {
          return data;
        }),
      catchError((err: HttpErrorResponse) => {
        return this.handleError(err);
      }));
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    return throwError(errorMessage);
  }

}

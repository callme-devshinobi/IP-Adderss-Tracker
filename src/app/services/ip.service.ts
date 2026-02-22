import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface IpApiResponse {
  ip: string;
  location: {
    city: string;
    region: string;
    postalCode: string;
    timezone: string;
    lat: number;
    lng: number;
  };
  isp: string;
}

@Injectable({
  providedIn: 'root'
})
export class IpService {
  private geoApiUrl = 'https://geo.ipify.org/api/v2/country,city';
  private ipifyUrl = 'https://api.ipify.org?format=json';

  constructor(private http: HttpClient) {}

  getUserIp(): Observable<{ ip: string }> {
    return this.http.get<{ ip: string }>(this.ipifyUrl);
  }

  getIpData(ipOrDomain: string): Observable<IpApiResponse> {
    return this.http.get<IpApiResponse>(
      `${this.geoApiUrl}?apiKey=${environment.ipifyApiKey}&ipAddress=${ipOrDomain}`
    );
  }
}
import { Component, signal, OnInit, AfterViewInit } from '@angular/core';
import { IpService, IpApiResponse } from '../../services/ip.service';
import * as L from 'leaflet';

export interface IpData {
  ip: string;
  location: string;
  timezone: string;
  isp: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  searchQuery = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  ipData = signal<IpData>({
    ip: '',
    location: '',
    timezone: '',
    isp: '',
    lat: 0,
    lng: 0,
  });

  private map!: L.Map;
  private marker!: L.Marker;

  constructor(private ipService: IpService) {}

  ngOnInit(): void {
    this.ipService.getUserIp().subscribe({
      next: (res) => {
        this.fetchIpData(res.ip);
      },
      error: () => {
        this.errorMessage.set('Could not detect your IP address.');
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Fix Leaflet's broken default marker icons in webpack/Angular
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.map = L.map('map', {
      center: [0, 0],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.marker = L.marker([0, 0], { icon: iconDefault }).addTo(this.map);
  }

  private updateMap(lat: number, lng: number): void {
    if (this.map) {
      this.map.setView([lat, lng], 13);
      this.marker.setLatLng([lat, lng]);
    }
  }

  onSearch(): void {
    if (!this.searchQuery().trim()) return;
    this.fetchIpData(this.searchQuery().trim());
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  private fetchIpData(ipOrDomain: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.ipService.getIpData(ipOrDomain).subscribe({
      next: (res: IpApiResponse) => {
        this.ipData.set({
          ip: res.ip,
          location: `${res.location.city}, ${res.location.region} ${res.location.postalCode}`,
          timezone: `UTC ${res.location.timezone}`,
          isp: res.isp,
          lat: res.location.lat,
          lng: res.location.lng,
        });
        this.updateMap(res.location.lat, res.location.lng);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Invalid IP address or domain. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
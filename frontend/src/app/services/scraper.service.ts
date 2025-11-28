import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScraperService {
    private apiUrl = 'http://localhost:5000'; // Ajustar si el puerto es diferente

    constructor(private http: HttpClient) { }

    runScraper(date: string = 'hoy'): Observable<any> {
        return this.http.post(`${this.apiUrl}/run-scraper`, { date });
    }

    getScraperStatus(): Observable<any> {
        return this.http.get(`${this.apiUrl}/scraper-status`);
    }

    stopScraper(): Observable<any> {
        return this.http.post(`${this.apiUrl}/stop-scraper`, {});
    }
}

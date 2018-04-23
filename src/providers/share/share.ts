import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { Share } from '../../app/shared/models/share.model';

/*
  Generated class for the ShareProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ShareProvider {
	
	data: any;
	
	

  constructor(public http: HttpClient) {
    console.log('Hello ShareProvider Provider');
	this.data = null;
  }
  
  //from share.service.ts from HW4
  getShares(): Observable<Share[]> {
    return this.http.get<Share[]>('http://localhost:8080/api/shares', {});
  }
  
  
  addShare(share: Share): Observable<Share> {
	  share.user = '';
    return this.http.post<Share>('http://localhost:8080/api/share', share); 
  }
  
  editShare(share: Share): Observable<string> {
    return this.http.put(`http://localhost:8080/api/share/${share._id}`, share, { responseType: 'text' });
  } 
  
  deleteShare(share: Share): Observable<string> {
    return this.http.delete(`http://localhost:8080/api/share/${share._id}`, { responseType: 'text' });
  }
  
  //used weather.service.ts as reference
  getCurrentValue(id: String) {
	  var endpoint = "http://localhost:8080/api/share/value/" + id;
	  console.log(endpoint);
	  
	  return this.http.get<String>(endpoint);
  }

}

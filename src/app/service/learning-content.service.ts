import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LearningContentService {

  constructor(private http : HttpClient) { }
  getcontentdata(){
    return this.http.get('http://localhost:3000/api/content')
  }
  getquizdata(){
    return this.http.get('http://localhost:3000/api/quizcontent')

  }
  getpracticedata(){
    return this.http.get('http://localhost:3000/api/practicecontent')
  }
  notesdata(data :any){
    return this.http.post('http://localhost:3000/api/notesdata/add',data)

  }
  getnotesdata(){
    return this.http.get("http://localhost:3000/api/notesdata")
  }
}

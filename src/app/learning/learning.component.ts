import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-learning',
  templateUrl: './learning.component.html',
  styleUrls: ['./learning.component.css']
})
export class LearningComponent implements OnInit{
  showValue : boolean = true
  // @ViewChild('myDiv', {static: false}) myDiv!: ElementRef;
 constructor(private route : Router){}
  ngOnInit() {
    setTimeout(() => {
      this.showValue  = false
      this.route.navigate(['/basic'])
    }, 5000);
  }
}

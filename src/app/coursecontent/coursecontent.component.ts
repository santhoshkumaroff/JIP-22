import { Component } from '@angular/core';
import {MessageService} from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-coursecontent',
  templateUrl: './coursecontent.component.html',
  styleUrls: ['./coursecontent.component.css'],
  providers: [MessageService]

})
export class CoursecontentComponent {
  displayMaximizable: boolean = false;
  constructor(private messageService: MessageService, private primengConfig: PrimeNGConfig) {}
  showBottomCenter() {
    this.messageService.add({key: 'bc', severity:'success', summary: 'Success', detail: 'Successfully add to cart'});
}

  ngOnInit() {
    this.primengConfig.ripple = true;
  }
  
  showMaximizableDialog() {
    this.displayMaximizable = true;
}
 
}

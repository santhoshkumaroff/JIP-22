import { Component} from '@angular/core';


@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent {
  rangeValues: number[] = [0, 20];
  isLiked = true;

  toggleLike() {
    this.isLiked = !this.isLiked;
  }
  val2: number = 3;


  
}

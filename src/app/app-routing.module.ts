import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { CourseComponent } from './course/course.component';
import { CoursecontentComponent } from './coursecontent/coursecontent.component';
import { AddtocartComponent } from './addtocart/addtocart.component';
import { LearningComponent } from './learning/learning.component';
import { BasicComponent } from './learning/basic/basic.component';
import { IntermediateComponent } from './learning/intermediate/intermediate.component';
import { AdvanceComponent } from './learning/advance/advance.component';
import { QuizComponent } from './quiz/quiz.component';
const routes: Routes = [
  {
    path : 'home', component : HomeComponent
  },
  {
    path : 'quiz', component : QuizComponent
  },
  {
    path : 'login', component : LoginComponent
  },
  {
    path : 'signup', component : SignupComponent
  },
  {
    path : 'courses', component : CourseComponent
  },
  {
    path : 'coursecontent', component : CoursecontentComponent
  },
  {
    path : 'cart', component : AddtocartComponent
  },
  {
    path : 'learning', component : LearningComponent
  },
  {
    path : 'basic', component : BasicComponent
  },
  {
    path : 'intermediate', component : IntermediateComponent
  },
  {
    path : 'advance', component : AdvanceComponent
  },
  {
    path : '', component : CoursecontentComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

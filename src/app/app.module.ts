import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CourseComponent } from './course/course.component';
import { CoursecontentComponent } from './coursecontent/coursecontent.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { SliderModule } from 'primeng/slider';
import {InputTextModule} from 'primeng/inputtext';
import {CardModule} from 'primeng/card';
import {AccordionModule} from 'primeng/accordion';
import {ToastModule} from 'primeng/toast';
import {DialogModule} from 'primeng/dialog';
import { AddtocartComponent } from './addtocart/addtocart.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LearningComponent } from './learning/learning.component';
import { BasicComponent } from './learning/basic/basic.component';
import { IntermediateComponent } from './learning/intermediate/intermediate.component';
import { AdvanceComponent } from './learning/advance/advance.component';
import {HttpClientModule} from '@angular/common/http';
import {SpeedDialModule} from 'primeng/speeddial';
import { QuizComponent } from './quiz/quiz.component';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {TerminalModule} from 'primeng/terminal';
import { EditorModule } from 'primeng/editor';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    CourseComponent,
    CoursecontentComponent,
    AddtocartComponent,
    NavbarComponent,
    LearningComponent,
    BasicComponent,
    IntermediateComponent,
    AdvanceComponent,
    QuizComponent,
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ButtonModule,
    RatingModule,
    SliderModule,
    InputTextModule,
    CardModule,
    AccordionModule,
    ToastModule,
    DialogModule,
    HttpClientModule,
    SpeedDialModule,
    InputTextareaModule,
    TerminalModule,
    EditorModule,
    MatTooltipModule,
    TooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


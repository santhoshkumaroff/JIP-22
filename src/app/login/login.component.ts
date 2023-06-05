import { Component,OnInit } from '@angular/core';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent{

  constructor(private router: Router) {


  }


  usericon = faUser;
  envelopicon = faEnvelope;
  lockicon = faLock;
  rememberMe: any;
  email: any;
  password: any;
  success = false;
  container = true;
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  login() {
  throw new Error('Method not implemented.');
  }
  register() {
  throw new Error('Method not implemented.');
  }
  submitlogin(){
    this.success = true;
    this.container = false;
    setTimeout(() => {
      this.router.navigate(['../home']);
      this.success = false;
    }, 1600);

  }

}

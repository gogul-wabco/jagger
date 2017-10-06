import { Network } from '@ionic-native/network';
import { SERVER_NAME, API_PATH } from './../config';
import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { NavController, ToastController, Platform, LoadingController, Loading } from 'ionic-angular';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  // Animation for Extended Settings START
  animations: [
    trigger('shrink', [
      state('active', style({ height: '*', minHeight: '*' })),
      state('inactive', style({ height: 0, minHeight: 0 })),
      transition('* => *', animate('.3s')) //Animation duration
    ])
  ]
  // Animation for Extended Settings END
})
export class LoginPage {
  system_url: string = SERVER_NAME; //BASE URL for API

  state = 'inactive'; //Extended settings state identifiesr
  hideorshow = 'Extended settings'; //Extended settings Label Text
  showhideIcon = 'arrow-dropdown-circle'; //Extended settings Icon

  username: string = '';
  password: string = '';

  loading: Loading;
  constructor(public navCtrl: NavController, public platform: Platform, private http: Http, public network: Network, private toastCtrl: ToastController, private loadingCtrl: LoadingController) {

  }
  /**
   * Method [toggleState]
        |
        |  Purpose:  To show hide extended settings
        |  Parameters: NULL
        |  Returns: void
   * 
   */
  toggleState(): void {
    if (this.state === 'inactive') {
      this.present_toast('It is not reccommended to change this settings unless you have'
        + ' knowledge about server, Application won\'t work properly if wrong information is provided', null, true);
    }
    this.state = this.state === 'active' ? 'inactive' : 'active';
    if (this.state === 'inactive') {
      this.hideorshow = 'Extended settings';
      this.showhideIcon = 'arrow-dropdown-circle';
    } else {
      this.hideorshow = 'Hide extended settings';
      this.showhideIcon = 'arrow-dropup-circle';
    }
  }
  /**
   * Method [login]
        |
        |  Purpose:  To authenticate User and store succesfull response for future logins, On failure 
                    notify user.
        |  Parameters: NULL
        |  Returns: void
   * 
   */
  login(): void {
    if ((this.network.type === null || this.network.type === "none") && this.platform.is('cordova')) {
      this.present_toast('Your internet connection appears to be offline.', null, true);
    } else {
      this.showLoading();
      let reqBody = new URLSearchParams();
      let username = this.username.toLowerCase().trim();
      reqBody.set('loginname', username);
      reqBody.set('password', encodeURIComponent(this.password));

      if (username !== '' && this.password !== '') {
        //===''?SERVER_NAME:this.system_url
        this.http.post(this.system_url + API_PATH + '/acquire', reqBody)
          .timeout(10000) //Timeoot
          .map(res => res.json())
          .subscribe(response => {
            this.loading.dismiss();
            if (response.code !== '401' && typeof response.token !== undefined) {
              localStorage.setItem('username', username);
              localStorage.setItem('server', this.system_url.split('//')[1]);
              localStorage.setItem('userSession', JSON.stringify(response));
              this.navCtrl.setRoot(HomePage);
            } else {
              this.present_toast('Username/Password incorrect');
            }
          }, (error) => {
            this.loading.dismiss();
            this.present_toast('Something went Wrong! Please try after sometime', 3000);
          });

      } else {
        if (username == '') {
          this.present_toast('Please enter Username', 3000);
        } else {
          this.present_toast('Please enter Password', 3000);
        }
      }
    }
  }
  /**
   * Method [login]
        |
        |  Purpose:  To Present a Toast Element in the view to Deliver message to User.
        |  Parameters: 
        |             msg type of String ==> Message to be displayed in Toast
        |             duration type of number in milliseconds ==> Duration of the toast Element, 
        |                       Setting null will make toast appear indefenitely Untill dismiss() is called/Close button clicked
        |             close type of boolean  ==> Whether close button required or not
        |
        |  Example: this.present_toast('MESSAGE', 1000, true);
        |  Returns: void
   * 
   */
  present_toast(msg: string, duration: number = 2000, close: boolean = false) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: duration,
      position: 'middle',
      showCloseButton: close
    });
    toast.present();
  }
  showLoading() {

    this.loading = this.loadingCtrl.create({
      content: "Please Wait..."
    });
    this.loading.present();
  }
}
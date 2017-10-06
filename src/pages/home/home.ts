import { Network } from '@ionic-native/network';
import { SERVER_NAME, API_PATH } from './../config';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LoginPage } from './../login/login';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ToastController } from 'ionic-angular';


/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  username: string;
  server: string;
  validating: boolean = false;
  session_status: boolean = true;
  options: RequestOptions;
  status_icon: string = "md-checkmark-circle";
  status_text: string = "ok"
  userSession: any;
  //myHeaders: Headers;

  system_url: string = SERVER_NAME; //BASE URL for API
  api_path: string = API_PATH;

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private http: Http, public network: Network, private toastCtrl: ToastController) {
    this.username = localStorage.getItem('username');
    this.server = localStorage.getItem('server');

    this.userSession = JSON.parse(localStorage.getItem('userSession'));

    this.options = new RequestOptions();

    let myHeaders: Headers = new Headers();

    myHeaders.set('X-P4T-AUTH-USER', this.username);
    myHeaders.append('X-P4T-AUTH-TOKEN', this.userSession.token);
    // myHeaders.append('X-P4T-AUTH-TOKEN', '2b_a6michiCbbhiLLa.8Caudi_iChg');


    this.options = new RequestOptions({
      headers: myHeaders
    })
  }
  logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('userSession');
    this.navCtrl.setRoot(LoginPage);
  }
  open_browser() {
    if ((this.network.type === null || this.network.type === "none") && this.platform.is('cordova')) {
      this.present_toast('Your internet connection appears to be offline.', null, true);
    } else {
      this.validating = true;
      this.http.get('https://' + this.server + API_PATH + '/validate', this.options)
        .timeout(10000)
        .map(res => res.json())
        .subscribe(data => {
          this.validating = false;
          if (data) {
            console.log("Test Browser")
            window.open('https://' + this.server + "/modules/api/auth/?x-token=" + encodeURIComponent(this.userSession.token)+'&x-user='+this.username, "_system");
          } else {
            this.session_status = false;
            this.status_icon = "md-warning";
            this.status_text = "failed"
          }
        }, (error) => {
          this.validating = false;
          this.present_toast('Something went Wrong! Please try after sometime', 3000);
        });
    }
  }
  retry() {
    if ((this.network.type === null || this.network.type === "none") && this.platform.is('cordova')) {
      this.present_toast('Your internet connection appears to be offline.', null, true);
    } else {
      this.validating = true;
      this.http.get('https://' + this.server + API_PATH + '/validate', this.options)
        .timeout(10000)
        .map(res => res.json())
        .subscribe(data => {
          this.validating = false;
          if (data) {
            this.session_status = true;
            this.status_icon = "md-checkmark-circle";
            this.status_text = "ok"
          } else {
            this.session_status = false;
            this.status_icon = "md-warning";
            this.status_text = "failed"
          }
        }, (error) => {
          this.validating = false;
          this.present_toast('Something went Wrong! Please try after sometime', 3000);
        });
    }
  }
  present_toast(msg: string, duration: number = 2000, close: boolean = false) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: duration,
      position: 'middle',
      showCloseButton: close
    });
    toast.present();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

}

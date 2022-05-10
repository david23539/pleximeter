import {Component, OnInit} from '@angular/core';
import Swal from 'sweetalert2';

export interface RegistryInterface {
  dateInit: Date;
  nameProyect: string;
  descCall: string;
  dateEnd: Date;
  timer: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements  OnInit {

  title = 'pleximeter';
  public nameProyect: string;
  public descriptionCall: string;
  public startStop: boolean;
  public hour: number;
  public minute: number;
  public secons: number;
  private interval: number;
  public registry!: RegistryInterface[];

  constructor() {
    this.startStop = false;
    this.hour = 0;
    this.minute = 0;
    this.secons = 0;
    this.registry = [];
  }

  ngOnInit(): void {
    if (localStorage.getItem('hour')) {
      this.hour = parseInt(localStorage.getItem('hour'), 0);

    }
    if (localStorage.getItem('minute')) {
      this.minute = parseInt(localStorage.getItem('minute'), 0);

    }
    if (localStorage.getItem('secons')) {
      this.secons = parseInt(localStorage.getItem('secons'), 0);

    }
    if(localStorage.getItem('data')) {
      this.registry = JSON.parse(localStorage.getItem('data'));
    }
  }

  start() {
      this.startStop = !this.startStop;

      if (this.startStop) {
        if (!this.hour && !this.minute && !this.secons) {
          this.showQuestion((result: boolean) => {
            if ( result) {
              const timer = this.getTimerNow();
              this.registry.push({
                dateInit: new Date(),
                nameProyect: this.nameProyect,
                descCall: this.descriptionCall,
                dateEnd: null,
                timer
              });
              localStorage.setItem('data', JSON.stringify(this.registry));
              this.initInterval();
            }
          });
        } else {
          localStorage.setItem('data', JSON.stringify(this.registry));
          this.initInterval();
          this.registry[this.registry.length - 1 ].dateEnd = new Date();
          this.registry[this.registry.length - 1 ].timer = this.getTimerNow();
        }
      } else {
        clearInterval(this.interval);
        this.saveData();
      }
  }

  private saveData(): void {
    localStorage.setItem('hour', this.hour.toString());
    localStorage.setItem('minute', this.minute.toString());
    localStorage.setItem('secons', this.secons.toString());
    localStorage.setItem('data', JSON.stringify(this.registry));
  }

  private initInterval(): void {
    this.interval = setInterval(() => {
      this.secons++;
      if (this.secons === 60) {
        this.minute++;
        this.secons = 0;
      }
      if ( this.minute === 60) {
        this.hour++;
        this.minute = 0;
      }
    this.saveData();
    }, 1000);
  }

  stop() {
    clearInterval(this.interval);

    if (this.registry.length) {

      this.registry[this.registry.length - 1 ].dateEnd = new Date();
      this.registry[this.registry.length - 1 ].timer = this.getTimerNow();
    }
    this.secons = 0;
    this.minute = 0;
    this.hour = 0;
    this.saveData();
    this.startStop = false;
  }

  private getTimerNow(): string {
    return `${this.hour < 10 ? '0' + this.hour : this.hour}
               : ${this.minute < 10 ? '0' + this.minute : this.minute}
                : ${this.secons < 10 ? '0' + this.secons : this.secons}`;
  }

  private showQuestion(cb: any ): void {
    Swal.fire({
      title: '¿De que proyecto se trata?',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.nameProyect = result.value;
        Swal.fire({
          title: '¿De que se va a tratar en la llamada?',
          input: 'textarea',
          inputAttributes: {
            autocapitalize: 'off'
          },
          showCancelButton: false,
          confirmButtonText: 'Guardar',
          showLoaderOnConfirm: true,
          allowOutsideClick: () => !Swal.isLoading()
        }).then((resultDescription) => {
          if (resultDescription.isConfirmed) {
            this.descriptionCall = resultDescription.value;
            cb(true);
          }
        });
      } else {
        cb(false);
      }
    });
  }
}

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { QuarterpickerComponent } from './quarter-picker/quarter-picker.component';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// angular i18n
import { registerLocaleData } from '@angular/common';
import localeZhHans from '@angular/common/locales/zh-Hans';
registerLocaleData(localeZhHans);
// 日期组件语言包
import zh from '@angular/common/locales/zh';
registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    QuarterpickerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NzDatePickerModule,
    FormsModule,
    NzNotificationModule,
    BrowserAnimationsModule
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

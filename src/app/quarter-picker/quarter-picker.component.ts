/* 
  引用方式  <app-quarterpicker [(quarter)]='quartertime' [nzDisabledDate]='nzDisabledDate' (quarterChange)='quarterChange($event)'></app-quarterpicker>
  
  属性说明：
  quarter  为季度格式的字符串，yyyy-q,可双向绑定
  nzDisabled  不可用状态
  
  nzDisabledDate   某些季度不可选取，自定义季度范围
  例如：
  如果当前季节(currentQuarter) 小于或者等于 开始季节(this.startValue),则当前季节不可选取。
  可参考 https://ng.ant.design/components/date-picker/zh#components-date-picker-demo-start-end

  nzDisabledDate = (currentQuarter: number) => {
    if (!currentQuarter || !this.startValue) {
      return false;
    }
    return currentQuarter <= Number.parseInt(this.startValue.replace("-", ""),10);
  };

  方法说明：
  quarterChange   为当选择的季度发生改变时触发的事件
  
  默认高度为36px，受index.less影响,如果要调整的话，后面再说！
*/

import { Component, Renderer2, ElementRef, OnInit, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";

import { NzNotificationService } from 'ng-zorro-antd';
@Component({
  selector: 'app-quarterpicker',
  templateUrl: './quarter-picker.component.html',
  styleUrls: ['./quarter-picker.component.less'],
})
export class QuarterpickerComponent implements OnInit, OnChanges {

  // 季度选择控件,为了在选择了季度之后，关闭改选择器
  @ViewChild('quarterPicker', { static: false }) quarterPicker: any;
  // 父组件传入的季度时间
  @Input() quarter: string;

  @Input() nzDisabled: boolean = false;

  @Input() nzDisabledDate: any;

  @Input() selectedFilterItem: any;

  @Input() quarterType;

  @Output() quarterChange: EventEmitter<any> = new EventEmitter();

  // 月选择器的时间，用来触发正确的年份
  date;

  // 当前选中的季度，以用来标识当前季度选中样式
  quarterSelect: number = null;
  quarterYear: string = null;
  // 所有的监听，用于关闭季度选择器注销所有的监听事件
  allListenList = [];

  // 清空时间的监听
  clearListen: any = null;

  constructor(
    private renderer: Renderer2, private el: ElementRef,
    private notification: NzNotificationService
  ) { }

  ngOnInit() {

  }
  querterTimes;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.quarter && changes.quarter.currentValue) {
      this.quarter = changes.quarter.currentValue;

      this.quarter = this.quarter.replace(/\s*/g, "");
      // 获取到年份
      this.quarterYear = this.quarter.slice(0, 4);
      // 如果是正确的年份的话
      if (this.quarterYear && this.quarterYear.length == 4) {
        this.setDate(this.quarterYear);
      }
      this.quarterSelect = +this.quarter[this.quarter.length - 1] - 1;

    }

    // 不可用状态 nzDisabled
    if (changes.nzDisabled) {
      if ((changes.nzDisabled.currentValue != false && changes.nzDisabled.currentValue == '') || changes.nzDisabled.currentValue == true) {
        this.nzDisabled = true;

      } else {
        this.nzDisabled = false;
      }

    }
    switch (this.quarterType) {
      case 1:
        if (this.selectedFilterItem && this.selectedFilterItem.startModel && this.selectedFilterItem.endModel) {
          if (this.startNoBigEnd(this.selectedFilterItem.startModel, this.selectedFilterItem.endModel)) {
            changes.quarter.previousValue == undefined ? this.selectedFilterItem.startModel = null : this.selectedFilterItem.startModel = changes.quarter.previousValue;
            this.notification.create("warning", "开始时间不能小于结束的时间", "");
            return;
          }
        }
        break;
      case 2:
        if (this.selectedFilterItem && this.selectedFilterItem.startModel && this.selectedFilterItem.endModel) {
          if (this.startNoBigEnd(this.selectedFilterItem.startModel, this.selectedFilterItem.endModel)) {
            changes.quarter.previousValue == undefined ? this.selectedFilterItem.endModel = null : this.selectedFilterItem.endModel = changes.quarter.previousValue;
            this.notification.create("warning", "开始时间不能小于结束的时间", "");
            return;
          }
        }
        break;
      case 4:
        if (this.selectedFilterItem && this.selectedFilterItem.filterStartModel && this.selectedFilterItem.filterEndModel) {
          if (this.startNoBigEnd(this.selectedFilterItem.filterStartModel, this.selectedFilterItem.filterEndModel)) {
            changes.quarter.previousValue == undefined ? this.selectedFilterItem.filterStartModel = null : this.selectedFilterItem.filterStartModel = changes.quarter.previousValue;
            this.notification.create("warning", "开始时间不能小于结束的时间", "");
            return;
          }
        }
        break;
      case 5:
        if (this.selectedFilterItem && this.selectedFilterItem.filterStartModel && this.selectedFilterItem.filterEndModel) {
          if (this.startNoBigEnd(this.selectedFilterItem.filterStartModel, this.selectedFilterItem.filterEndModel)) {
            changes.quarter.previousValue == undefined ? this.selectedFilterItem.filterEndModel = null : this.selectedFilterItem.filterEndModel = changes.quarter.previousValue;
            this.notification.create("warning", "开始时间不能小于结束的时间", "");
            return;
          }
        }
        break;
    }
  }

  // ngAfterContentInit() {
  //   const clearBtn = this.el.nativeElement.querySelector('.ant-calendar-picker-clear');
  //   this.clearListen = this.renderer.listen(
  //     clearBtn, 'click', event => {
  //       this.selectQuarter(0, true);
  //     }
  //   );
  // }

  showQuarter(isOpen: boolean) {
    if (isOpen) {
      setTimeout(() => {
        // 直接选择季度
        this.quarterPickerOpen();

        // 点击month-header，切换年份
        this.changeYearSelect();

        // 点击month-header切换年份
        const prevAndNextYear: any = document.querySelectorAll('.ant-calendar-month-panel-prev-year-btn,.ant-calendar-month-panel-next-year-btn');
        prevAndNextYear.forEach(item => {
          const prevAndNextYearListen = this.renderer.listen(item, "click", event => {
            this.quarterPickerOpen();
          });
          this.allListenList.push(prevAndNextYearListen);

        });
      }, 0);
    }
  }

  // 开始时间不能小于结束的时间
  startNoBigEnd(startTime, endTime): boolean {
    if (startTime && endTime) {
      let start = parseInt(startTime.replace('-', ''), 10);
      let end = parseInt(endTime.replace('-', ''), 10);
      if (start > end) {
        this.date = '';
        this.quarter = null;
        return true;
      }
    }
  }

  // 季度面板被点击打开
  quarterPickerOpen() {

    // 在月选择器的基础上生成季度选择器
    let monthHeaderNode = document.querySelector(
      ".ant-calendar-month-panel-header"
    );

    const parentNode = monthHeaderNode.parentNode;

    parentNode.removeChild(parentNode.lastElementChild);

    let quarterNode = document.createElement("div");
    parentNode.appendChild(quarterNode);

    const quarterListStr = `<div class="ant-calendar-quarter-panel-body"><div class="ant-calendar-quarter-panel-quarter"> 第一季度 </div><div class="ant-calendar-quarter-panel-quarter"> 第二季度 </div><div class="ant-calendar-quarter-panel-quarter"> 第三季度 </div><div class="ant-calendar-quarter-panel-quarter"> 第四季度 </div></div>`;
    quarterNode.innerHTML = quarterListStr;

    // 获取四个季度节点，并在季度节点被点击时，获取点击的具体季度，以及关闭季度选择器
    const quarterList: any = document.querySelectorAll(
      ".ant-calendar-quarter-panel-quarter"
    );
    // 有可能为0
    const year = document.querySelector(
      ".ant-calendar-month-panel-year-select-content"
    ).textContent;

    if (this.quarterSelect || this.quarterSelect == 0) {
      if (this.quarterYear == year) {
        quarterList[this.quarterSelect].classList.add('select');
      }
    }
    quarterList.forEach((item, index) => {

      let isDisabled = false;
      // 判断是否自定义了季度选取范围
      if (this.nzDisabledDate) {
        const quarterCount = index + 1;
        let quarterValue = Number.parseInt(`${year}${quarterCount}`, 10);
        isDisabled = this.nzDisabledDate(quarterValue);
      }

      // 如果不可选用
      if (isDisabled) {
        item.classList.add('quarter-disabled');
      } else {
        const quarterListen = this.renderer.listen(item, "click", event => {
          this.selectQuarter(index);
          event.stopPropagation();

          this.quarterPicker.picker.hideOverlay();
        });
        this.allListenList.push(quarterListen);
      }

    });


  }

  // 选中季度的处理
  selectQuarter(quarter: number, isClear?: boolean) {
    let selectQuarter;

    // 如果是清空的话，则quarter是null，date也是null
    if (isClear) {
      selectQuarter = null;
      this.date = null;

    } else {
      const year = document.querySelector(
        ".ant-calendar-month-panel-year-select-content"
      ).textContent;

      selectQuarter = `${year}-${++quarter}`;
      // 根据年份设置当前的选中的时间，传给月选择器，以能正确显示对应的年份
      this.setDate(year);
    }
    // 只有当选择的季度发现变化时，发触发发射事件
    if (this.quarter != selectQuarter) {
      this.quarter = selectQuarter;
      this.quarterChange.emit(this.quarter);
    }


    // 撤销所有的监听
    this.logoutAllListen();



  }
  setDate(year: string) {
    let date = new Date();
    date.setFullYear(Number.parseInt(year, 10));
    this.date = date;
  }
  logoutAllListen() {
    for (let index = 0; index < this.allListenList.length; index++) {
      this.allListenList[index]();
      this.allListenList[index] = null;

    }
    this.allListenList = [];
  }
  // 顶部的年份被点击，切换出年份选择器
  changeYearSelect() {
    // 如果是year-body的内容被点击
    const yearContent: any = document.querySelector(
      ".ant-calendar-month-panel-year-select"
    );
    // const yearContent: any = document.querySelector(
    //   ".ant-calendar-month-panel-year-select-content"
    // );

    const yearChangeListen = this.renderer.listen(
      yearContent,
      "click",
      event => {

        // 延迟是为了将下面的函数变成异步的，放在调用栈后面，以能在年选择器完成展开后在执行
        setTimeout(() => {

          // 年选择器的处理
          this.yearPickerHandle();
        }, 0);
      }
    );
    this.allListenList.push(yearChangeListen);
  }

  // 年选择器的处理，从月选择器变成年选择器，从年间选择器变成年选择器！都要监听完下面的三个方法
  yearPickerHandle() {
    // year-body中的年份被点击，包括第一年和最后一年
    this.yearClick();

    // year-hearder中的上一个和下一个箭头被点击
    this.changeYearsDuring();

    // year-header中的年间被点击.弹出年间选择器（难怪qbi不要这一层了！）
    this.yearsRangeOpen();
  }


  yearClick() {

    // 判断是否自定义了季度选取范围
    if (this.nzDisabledDate) {
      // 获取当前展示的所有年
      const allYearList: any = document.querySelectorAll(
        ".ant-calendar-year-panel-cell"
      );
      allYearList.forEach(item => {
        // 获取每一个具体的年份
        const year = item.getAttribute("title");

        // 如果所有的季度都满足禁用条件的话，那么该年份禁止
        if (
          this.nzDisabledDate(Number.parseInt(`${year}1`, 10)) &&
          this.nzDisabledDate(Number.parseInt(`${year}2`, 10)) &&
          this.nzDisabledDate(Number.parseInt(`${year}3`, 10)) &&
          this.nzDisabledDate(Number.parseInt(`${year}4`, 10))
        ) {
          item.classList.add('year-disabled');
          item.classList.remove('ant-calendar-year-panel-selected-cell');
        }
      });
    }

    // 这里去头掐尾了
    const yearList: any = document.querySelectorAll(
      ".ant-calendar-year-panel-cell:not(.ant-calendar-year-panel-last-decade-cell):not(.ant-calendar-year-panel-next-decade-cell)"
    );



    // 年被点击事件
    yearList.forEach(item => {
      const yearListen = this.renderer.listen(item, "click", event => {
        setTimeout(() => {
          this.showQuarter(true);
        }, 0);
      });
      this.allListenList.push(yearListen);
    });

    // 如果是上一个年和下一年被点击
    const firstAndLastYears: any = document.querySelectorAll(
      ".ant-calendar-year-panel-last-decade-cell,.ant-calendar-year-panel-next-decade-cell "
    );
    firstAndLastYears.forEach(item => {
      const firstAndLastYearsListen = this.renderer.listen(
        item,
        "click",
        () => {
          setTimeout(() => {
            this.yearClick();
          }, 0);
        }
      );
      this.allListenList.push(firstAndLastYearsListen);
    });
  }

  changeYearsDuring() {
    // 如果是 year-header中的上一个和下一个箭头被点击
    const preAndNextYears: any = document.querySelectorAll(
      ".ant-calendar-year-panel-prev-decade-btn,.ant-calendar-year-panel-next-decade-btn "
    );
    preAndNextYears.forEach(item => {
      const preAndNextYearsListen = this.renderer.listen(
        item,
        "click",
        () => {
          setTimeout(
            () => {
              this.yearClick();
            }, 0);

        }
      );
      this.allListenList.push(preAndNextYearsListen);
    });
  }

  yearsRangeOpen() {

    // const yearRange: any = document.querySelector(
    //   ".ant-calendar-year-panel-decade-select-content"
    // );
    const yearRange: any = document.querySelector(
      ".ant-calendar-year-panel-decade-select"
    );
    const yearRangeOpenListen = this.renderer.listen(
      yearRange,
      "click",
      () => {

        // 监听选择不同的年范围的切换
        setTimeout(() => {
          // yearRange-body具体年间被点击，包括第一个年间和最后一个年间
          this.yearRangeClick();

          // yearRange-hearder的左右两边的上一个yearRange和下一个YearRange被点击

          this.changeYearsRange();
        }, 0);
      }
    );
    this.allListenList.push(yearRangeOpenListen);
  }

  // yearRage-body中的具体年间被点击
  yearRangeClick() {


    // 这里去头掐尾了
    const yearRangeList: any = document.querySelectorAll(
      ".ant-calendar-decade-panel-cell:not(.ant-calendar-decade-panel-last-century-cell):not(.ant-calendar-decade-panel-next-century-cell)"
    );

    // 年被点击事件
    yearRangeList.forEach(item => {
      const yearRangeListen = this.renderer.listen(item, "click", event => {
        setTimeout(() => {

          this.yearPickerHandle();

        }, 0);

      });
      this.allListenList.push(yearRangeListen);
    });

    // 如果是上一个年和下一年被点击

    const firstAndLastYearsRange: any = document.querySelectorAll(
      ".ant-calendar-decade-panel-last-century-cell,.ant-calendar-decade-panel-next-century-cell "
    );
    firstAndLastYearsRange.forEach(item => {
      const firstAndLastYearsRangeListen = this.renderer.listen(
        item,
        "click",
        () => {
          setTimeout(() => {
            this.yearRangeClick();
          }, 0);
        }
      );
      this.allListenList.push(firstAndLastYearsRangeListen);
    });

    // yearRage-body中的具体年间的第一个和最后一个被点击
  }

  changeYearsRange() {
    // 如果是 year-header中的上一个和下一个箭头被点击
    const preAndNextYearsRange: any = document.querySelectorAll(
      ".ant-calendar-decade-panel-prev-century-btn,.ant-calendar-decade-panel-next-century-btn "
    );

    preAndNextYearsRange.forEach(item => {
      const preAndNextYearsRangeListen = this.renderer.listen(
        item,
        "click",
        () => {
          setTimeout(() => {
            this.yearRangeClick();
          }, 0);

        }
      );
      this.allListenList.push(preAndNextYearsRangeListen);
    });
  }

  // 清除时间的回调,需要将季度的时间置为null
  clearTime(date: Date) {
    if (date == null) {
      this.selectQuarter(0, true);
    }
  }
}

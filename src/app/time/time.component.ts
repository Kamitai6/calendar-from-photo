import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { DatePicker } from "tns-core-modules/ui/date-picker";
import { TimePicker } from "tns-core-modules/ui/time-picker";

@Component({
    selector: "modal",
    moduleId: module.id,
    templateUrl: "./time.component.html",
    styleUrls: ["./time.component.css"]
})
export class TimeComponent implements OnInit {
    public now = new Date();
    public dtyear = this.now.getFullYear();
    public dtmonth = this.now.getMonth() + 1;
    public dtday = this.now.getDate();

    public dthour = this.now.getHours();
    public dtminute = this.now.getMinutes();


    @ViewChild("datePicker", { static: false }) datePicker: ElementRef;
    @ViewChild("timePicker", { static: false }) timePicker: ElementRef;

    //public datePicker: datePickerModule.DatePicker = new datePickerModule.DatePicker();
    //prompt: string;

    constructor(private params: ModalDialogParams) {
        //this.prompt = params.context.promptMsg;
    }
    ngOnInit() {
    }

    public close() {
        let datePickerView = <DatePicker>this.datePicker.nativeElement;
        //console.log("Year " + this.dtyear);
        //console.log("Year from NGModel Year " + datePickerView.year);
        //console.log("Year from NGModel month " + datePickerView.month);
        //console.log("Year from NGModel day " + datePickerView.day);

        let timePickerView = <TimePicker>this.timePicker.nativeElement;
        //console.log("hour " + this.dthour);
        //console.log("Year from NGModel hour " + timePickerView.hour);
        //console.log("Year from NGModel minute " + timePickerView.minute);

        let returndate = new Date(datePickerView.year, datePickerView.month - 1, datePickerView.day, timePickerView.hour, timePickerView.minute);

        this.params.closeCallback(returndate);
    }

    public cancel() {
        this.params.closeCallback();
    }
}

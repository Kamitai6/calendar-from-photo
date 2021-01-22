import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { ShowModalOptions } from "tns-core-modules/ui/core/view";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { TimeComponent } from "../time/time.component";

@Component({
    selector: "modal",
    moduleId: module.id,
    providers: [ModalDialogService],
    templateUrl: "./modal.component.html",
    styleUrls: ["./modal.component.css"]
})
export class ModalComponent implements OnInit {
    title: string = "";


    startValue: any = "";
    endValue: any = "";

    startchange(num) {
        this.startValue = num;
    }

    endchange(num) {
        this.endValue = num;
    }

    onButtonTap(): void {
        //console.log("Button was pressed");
    }


    constructor(private modalService: ModalDialogService, private viewContainerRef: ViewContainerRef, private params: ModalDialogParams) {
    }

    ngOnInit(): void {

    }


    showstartModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            fullscreen: false,
            context: {}
        };

        this.modalService.showModal(TimeComponent, options).then((res) => {
            //console.log(res);
            this.startchange(res);
        });
    }

    showendModal() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            fullscreen: false,
            context: {}
        };

        this.modalService.showModal(TimeComponent, options).then((res) => {
            //console.log(res);
            this.endchange(res);
        });
    }


    public close() {
        let event = [this.title, this.startValue, this.endValue];
        this.params.closeCallback(event);
    }

    public cancel() {
        this.params.closeCallback();
    }
}
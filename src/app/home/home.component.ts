import { Component, Inject, OnInit, ViewContainerRef, ElementRef, ViewChild, AfterViewInit } from "@angular/core";
import { isIOS, isAndroid } from "tns-core-modules/platform";
import { ImageAsset } from "tns-core-modules/image-asset";
import { Color } from "tns-core-modules/color";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { knownFolders, path } from "tns-core-modules/file-system";
import { ImageSource } from "tns-core-modules/image-source";

import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { takePicture, requestPermissions } from 'nativescript-camera';
import * as calendarModule from "nativescript-ui-calendar";
import * as imagepicker from "nativescript-imagepicker";

import { ModalComponent } from "../modal/modal.component";
import { Vision } from "../vision/vision";


@Component({
    selector: "ns-gcv",
    providers: [ModalDialogService],
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit, AfterViewInit {

    calendarEvents = [];
    image: ImageAsset;
    imagePath: string;
    saveToGallery: boolean = true;
    imageSrc: any;
    resulttext: any;

    constructor(
        private modalService: ModalDialogService, 
        private viewContainerRef: ViewContainerRef,
        @Inject(Vision) private vision: Vision
        ){}

    ngOnInit(): void {}

    ngAfterViewInit(): void {}

    //イベント追加
    onRedisplay() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.viewContainerRef,
            fullscreen: true,
            context: {}
        };
        this.modalService.showModal(ModalComponent, options).then((res) => {
            this.addEvent(res);
        });
    }

    //イベント消去
    onInlineEventSelected(args) {
        dialogs.confirm ({
            message: "イベントを消去しますか？",
            okButtonText: "はい",
            cancelButtonText: "いいえ"
        }).then(result => {
            if (result == true) {
                this.delEvent(args);
            }
        });
    }

    //カメラ選択
    onTakePictureTap() {
        this.takePhoto();
    }

    //ローカル画像選択
    onSelectImageTap() {
        this.selectPhoto();
    }

    loaded(args) {
        let that = this;
        that.imageSrc = '~/logo/noimage.png';
    }

    private addEvent(args) {
        let now = new Date();
        let eventName = args[0];
        if (eventName == "") {
            eventName = "NEW event";
        }
        let startDate = args[1];
        if (startDate == "") {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        }
        let endDate = args[2];
        if (endDate == "") {
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
        }
        let full = false;
        let colors = [new Color(200, 188, 26, 214), new Color(220, 255, 109, 130), new Color(255, 55, 45, 255), new Color(199, 17, 227, 10), new Color(255, 255, 54, 3)];
        let color = colors[0];
        let event = new calendarModule.CalendarEvent(eventName, startDate, endDate, full, color);
        let events = [];
        for (let i = 0; i < this.calendarEvents.length; i++) {
            events.push(this.calendarEvents[i]);
        }
        events.push(event);
        this.calendarEvents = events;
    }

    private delEvent(args) {
        let events = [];
        for (let i = 0; i < this.calendarEvents.length; i++) {
            if (this.calendarEvents[i].title == args.eventData.title) {
                if (this.calendarEvents[i].startDate.getTime() == args.eventData.startDate.getTime()) {
                    if (this.calendarEvents[i].endDate.getTime() == args.eventData.endDate.getTime()) {
                    }
                    else {
                        events.push(this.calendarEvents[i]);
                    }
                }
                else {
                    events.push(this.calendarEvents[i]);
                }
            }
            else {
                events.push(this.calendarEvents[i]);
            }
        }
        this.calendarEvents = events;
    }

    private takePhoto() {
        let that = this;

        // 権限の要求
        requestPermissions()
        .then(
        // 許可
        () => {
            console.log('Permitted');
            takePicture({
                keepAspectRatio: true,
                saveToGallery: false,
                allowsEditing: true,
                cameraFacing: 'rear',
            })
            .then(imageAsset => {
                that.imageSrc = imageAsset;
                this.setImage(imageAsset);
            })
            .catch(err => {
                console.error({err});
                this.image = null;
            });
        },
        // 拒否
        () => {
            console.log('Denied to use camera/photo library');
            alert({
            title: 'カメラ利用',
            message: 'カメラを利用するには「設定」→「プライバシー」から「写真」と「カメラ」の利用を許可してください',
            okButtonText: 'OK',
            });
        }
        ).catch(err => console.error({err}));
    }

    private selectPhoto() {
        const context = imagepicker.create({ mode: 'single'});
        let that = this;

        // 権限の要求
        context
            .authorize()
            .then(() => {
                that.imageSrc = null;
                return context.present(); // 選択画面の表示
            })
            .then((selection) => {
                that.imageSrc = selection[0];
                this.setImage(selection[0]);
            })
            .catch(err => {
                console.error({err});
                this.image = null;
            });
    }

    private setImage(imageAsset: ImageAsset) {
        this.image = imageAsset;

        if (isAndroid) {
            // Android は imageAsset.android にファイルパスが入っている
            this.imagePath = imageAsset.android;
            // png として保存
            const source = new ImageSource();
            source.fromAsset(imageAsset)
                .then((imageSource: ImageSource) => {
                    const saved = imageSource.saveToFile(this.imagePath, 'png');
                    if (saved) {
                        console.log("successfully in path: " + this.imagePath);
                        this.toGcv(imageSource);
                    }
                })
                .catch((e) => {
                    console.log("Error: ");
                    console.log(e);
                });
        }
        else {
            // iOS はファイルパスが取得できないため、アプリ内にファイルを一時保存する必要がある
            const folder = knownFolders.documents();  // ユーザーからは見えないディレクトリ
            this.imagePath = path.join(folder.path, 'temp.png');
            // png として保存
            const source = new ImageSource();
            source.fromAsset(imageAsset)
                .then((imageSource: ImageSource) => {
                    const saved = imageSource.saveToFile(this.imagePath, 'png');
                    if (saved) {
                        console.log("successfully in path: " + this.imagePath);
                        this.toGcv(imageSource);
                    }
                })
                .catch((e) => {
                    console.log("Error: ");
                    console.log(e);
                });
        }
    }

    private toGcv(imageSource: ImageSource) {
        let array = [];
        let newevent = [];

        this.vision.ocrPicture(imageSource.toBase64String('png'))
            .then(evaluation => {
                console.log(evaluation.ocr);
                console.log(`${evaluation.things}`);
                this.resulttext = evaluation.things;
                array = this.arrangeResult(evaluation.things);

                for (var i = 0; i < array.length; i++) {
                    console.log(array[i].title);
                    newevent[0] = array[i].title;
                    newevent[1] = array[i].month;
                    newevent[2] = array[i].date;
                    this.newEvent(newevent);
                }
            });
    }

    private arrangeResult(args) {
        let arranged = [];
        let object = {title: 'つかれた', month: 1, data: 20};

        arranged.push(object);
        return arranged;
    }

    private newEvent(event_data) {

        let now = new Date();
        let eventName =  event_data[0];
        let eventMonth = event_data[1] - 1;
        let eventDate =  event_data[2];
        let startDate = new Date(now.getFullYear(), eventMonth, eventDate, 0, 0);
        let endDate = new Date(now.getFullYear(), eventMonth, eventDate, 23, 59);
        let full = false;
        let colors = [
            new Color(200, 188, 26, 214), 
            new Color(220, 255, 109, 130), 
            new Color(255, 55, 45, 255), 
            new Color(199, 17, 227, 10), 
            new Color(255, 255, 54, 3)
        ];
        let color = colors[0];
        let event = new calendarModule.CalendarEvent(eventName, startDate, endDate, full, color);
        let events = [];

        for (let i = 0; i < this.calendarEvents.length; i++) {
            events.push(this.calendarEvents[i]);
        }

        events.push(event);
        this.calendarEvents = events;
    }
}

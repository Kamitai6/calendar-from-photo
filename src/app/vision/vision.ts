import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable() 
export class Vision{
    constructor (private http: HttpClient) {}
        
    private apiKey = "your_key";

    private googleVisionURL = "https://vision.googleapis.com/v1/images:annotate?key=" + this.apiKey;

    private getImageAnnotations (base64Image: string): Promise<any> {
        const options: any = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
        }
        const request = {
            requests: [
                {
                    features: [{
                        type: "TEXT_DETECTION"
                    }],
                    image: {
                        content: base64Image
                    }
                }]
        };
        return this.http
            .post(this.googleVisionURL, JSON.stringify(request), options)
            .toPromise();
    }

    ocrPicture(base64Image: string): any {
        return this.getImageAnnotations(base64Image)
            .then(response => {
                if (response.error) {
                   console.log('API key wrong/missing ?', response.error);
                   return {
                       ocr:'API key wrong/missing ?',
                       things: response.error
                    };
                }

                let textAnnotations = response.responses[0];
                let fullTextAnnotation = textAnnotations.fullTextAnnotation;
                
                return {
                    ocr: 'succeeded!!!',
                    things: fullTextAnnotation.text
                }
            },
            e => {
                console.log("Error occurred ! " + e);
                return {
                    ocr: 'not succeeded!!!',
                    things: null
                }
            });
    }
}

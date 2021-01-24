import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable() 
export class Vision{
    constructor (private http: HttpClient) {}
        
    private apiKey = "AIzaSyBqDbcSg4K-TqiD83dkdLJHCs10TIdrhZU";

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
        let result;
        
        return this.getImageAnnotations(base64Image)
            .then(response => {
                //result = response.json();
                if (response.error){
                   console.log('API key wrong/missing ?', result.error);
                   return { ocr:'API key wrong/missing ?', things: result.error};
                }
                // let faceAnnotations = result.responses[0].faceAnnotations;
                // let labelAnnotations = result.responses[0].labelAnnotations;
                // let evaluatedEmoticons = '';
                            
                // if (faceAnnotations){
                //     faceAnnotations.forEach(faceAnnotation => {
                //         evaluatedEmoticons += this.evalEmotions(faceAnnotation);
                //     });
                // }    

                // return {
                //     faces: evaluatedEmoticons,
                //     things: this.evalLabels(labelAnnotations) 
                // }
                let textAnnotations = response.responses[0];
                let fullTextAnnotation = textAnnotations.fullTextAnnotation;
                
                console.log(`${fullTextAnnotation.text}`);
                

                return {
                    ocr: 'succeeded!!!',
                    things: "yes"
                }
            }, e => {
                console.log("Error occurred ! " + e);
                return {
                    ocr: 'not succeeded!!!',
                    things: null
                }
            });
    }

    // private evalEmotions(faceAnnotations):string {
    //     let emotionResult = '';

    //     if (faceAnnotations['joyLikelihood'] == 'LIKELY' || faceAnnotations['joyLikelihood'] == 'VERY_LIKELY'){
    //         emotionResult = ' :) ';
    //     }
    //     else if (faceAnnotations['sorrowLikelihood'] == 'LIKELY' || faceAnnotations['sorrowLikelihood'] == 'VERY_LIKELY'){
    //         emotionResult = ' :( ';
    //     }
    //     else if (faceAnnotations['angerLikelihood'] == 'LIKELY' || faceAnnotations['angerLikelihood'] == 'VERY_LIKELY'){
    //         emotionResult = ' :@ ';
    //     }
    //     else if (faceAnnotations['surpriseLikelihood'] == 'POSSIBLE' || faceAnnotations['surpriseLikelihood'] == 'LIKELY' || faceAnnotations['surpriseLikelihood'] == 'VERY_LIKELY'){
    //         emotionResult = ' :o ';
    //     }
    //     else if (faceAnnotations['headwearLikelihood'] == 'LIKELY' || faceAnnotations['headwearLikelihood'] == 'VERY_LIKELY'){
    //         emotionResult = ' =|:) ';
    //     }
    //     else {
    //         emotionResult = ':|';
    //     }    
    //     return emotionResult;
    // }
    // private evalLabels(things) :string {
    //     let retString = '';
    //     if(things) {
    //         things.forEach(thing => {
    //             retString += thing.description + ' (' + Math.floor(thing.score * 100) + '%), ' 
    //         });    
    //     }
    //     return retString;
    // }

}
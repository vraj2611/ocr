
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { createWorker, Worker } from 'tesseract.js';

export interface ITesseractData {
    text: string;
    progression: number;
    imageUrl: SafeUrl;    
}

@Injectable({
    providedIn: 'root'
})
export class TesseractService {
    public text: string;
    public progression: number;
    private imageUrl: SafeUrl;
    private sanitizer: DomSanitizer;
    private worker: Worker;
    private _dados = new BehaviorSubject<ITesseractData>(null)
  
    dados$(){
      return this._dados.asObservable()
    }

    constructor(sanitizer: DomSanitizer) {
        this.sanitizer = sanitizer;
        this.startWorker();
    }

    private async startWorker() {
        this.worker = createWorker({
            logger: m => {
                this._dados.next({
                    imageUrl: this.imageUrl,
                    progression: m.progress,
                    text: m.status + "... " + Math.round(100 * m.progress) + "%"
                })
            }
        });
        await this.worker.load();
        await this.worker.loadLanguage('por');
        await this.worker.initialize('por');
        this._dados.next({
            imageUrl: this.imageUrl,
            progression: 1,
            text: "Pronto. Copie uma imagem e aperte Ctrl + V nessa tela."
        })
    }

    public terminate(): void {
        this.worker.terminate();
    }

    public processarImagem(file) {
        if (file.type.search(/^image\//i) === 0) {
            this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file))
            this.worker.recognize(file).then(result => {
                this._dados.next({
                    imageUrl: this.imageUrl,
                    progression: 1,
                    text: this.removerLinhasVazias(result.data.text)
                })
            })
        }
    }

    private removerLinhasVazias(text: string) {
        return text.split("\n")
            .reduce((prev, curr) => {
                if (curr.replace(" ", "").trim().length == 0) return prev;
                return prev + curr.trim() + "\n";
            }, "")
    }
}

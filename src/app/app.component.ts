import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { createWorker, Worker } from 'tesseract.js';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  host: { "(window:paste)": "handlePaste( $event )" }
})
export class AppComponent implements OnDestroy {
  public text:string;
  public imageUrl: SafeUrl;
  private sanitizer: DomSanitizer;
  private worker: Worker;

  constructor(sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
    this.startWorker();
  }

  private async startWorker(){
    this.worker = createWorker({ logger: m => this.text = m.status + "... " + Math.round(100 * m.progress) + "%" });
    await this.worker.load();
    await this.worker.loadLanguage('por');
    await this.worker.initialize('por');
    this.text = "Pronto. Copie uma imagem e aperte Ctrl + V nessa tela."
  }

  ngOnDestroy(): void {
    this.worker.terminate();
  }

  public handlePaste(event: ClipboardEvent): void {
    if (!(event.clipboardData &&
      event.clipboardData.files &&
      event.clipboardData.files.length &&
      (event.clipboardData.files[0].type.search(/^image\//i) === 0)
    )) return;

    const image = event.clipboardData.files[0];  
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl( URL.createObjectURL(image) )
    this.worker.recognize(image).then(result => this.text = result.data.text);
  }

}

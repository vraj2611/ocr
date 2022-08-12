import { Component, VERSION } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { createWorker, ImageLike } from 'tesseract.js';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  host: { "(window:paste)": "handlePaste( $event )" }
})
export class AppComponent  {
  public ocrResult:string;
  public imageUrl: SafeUrl;
  private sanitizer: DomSanitizer;

  constructor(sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  async processar(image: ImageLike) {
    this.ocrResult = "Processando... 5"
    const worker = createWorker({ logger: m => console.log(m) });
    this.ocrResult = "Processando... 4"
    await worker.load();
    this.ocrResult = "Processando... 3"
    await worker.loadLanguage('por');
    this.ocrResult = "Processando... 2"
    await worker.initialize('por');
    this.ocrResult = "Processando... 1"
    const { data: { text } } = await worker.recognize(image);
    this.ocrResult = text;
    await worker.terminate();
  }

  public handlePaste(event: ClipboardEvent): void {
    let pastedImage = null;
    if (
      event.clipboardData &&
      event.clipboardData.files &&
      event.clipboardData.files.length &&
      (event.clipboardData.files[0].type.search(/^image\//i) === 0)
    ) {
      pastedImage = event.clipboardData.files[0];
    }
  
    if (!pastedImage) return;
    this.processar(pastedImage);
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl( URL.createObjectURL(pastedImage) )
    
  }

}

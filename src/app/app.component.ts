import { Component, VERSION } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';

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
    this.imageUrl = "https://tesseract.projectnaptha.com/img/eng_bw.png";
    this.doOCR("https://tesseract.projectnaptha.com/img/eng_bw.png");
  }

  async doOCR(image: Tesseract.ImageLike) {
    this.ocrResult = "Processando... 1"
    const worker = createWorker({
      logger: m => console.log(m),
    });
    this.ocrResult = "Processando... 2"
    await worker.load();
    this.ocrResult = "Processando... 3"
    await worker.loadLanguage('eng');
    this.ocrResult = "Processando... 4"
    await worker.initialize('eng');
    this.ocrResult = "Processando... 5"
    const { data: { text } } = await worker.recognize(image);
    this.ocrResult = text;
    console.log(text);
    await worker.terminate();
  }

  public handlePaste(event: ClipboardEvent): void {
    var pastedImage = this.getPastedImage(event);
    if (!pastedImage) return;
    this.doOCR(pastedImage);
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl( URL.createObjectURL(pastedImage) )
    
  }

  private getPastedImage(event: ClipboardEvent): File | null {

    if (
      event.clipboardData &&
      event.clipboardData.files &&
      event.clipboardData.files.length &&
      this.isImageFile(event.clipboardData.files[0])
    ) {
      return (event.clipboardData.files[0]);
    }
    return (null);

  }
  private isImageFile(file: File): boolean {
    return (file.type.search(/^image\//i) === 0);
  }
}

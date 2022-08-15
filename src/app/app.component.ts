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
  public progression: number;
  public imageUrl: SafeUrl;
  private sanitizer: DomSanitizer;
  private worker: Worker;

  constructor(sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
    this.startWorker();
  }

  private async startWorker(){
    this.worker = createWorker({ logger: m => {
      this.text = m.status + "... " + Math.round(100 * m.progress) + "%";
      this.progression = m.progress;
    }});
    await this.worker.load();
    await this.worker.loadLanguage('por');
    await this.worker.initialize('por');
    this.text = "Pronto. Copie uma imagem e aperte Ctrl + V nessa tela."
  }

  ngOnDestroy(): void {
    this.worker.terminate();
  }

  public handlePaste(event: ClipboardEvent): void {
    
    if (event.clipboardData.getData('text').length > 0) this.text = this.removerLinhasVazias( event.clipboardData.getData('text'));
    if (!(event.clipboardData?.files[0])) return;
    const file = event.clipboardData.files[0];
    if (file.type.search(/^image\//i) === 0){
      this.imageUrl = this.sanitizer.bypassSecurityTrustUrl( URL.createObjectURL(file))
      this.worker.recognize(file).then(result => this.text = this.removerLinhasVazias( result.data.text));
    }
  }

  private removerLinhasVazias(text:string){
    return text.split("\n")
      .reduce((prev, curr)=>{
        if (curr.replace(" ","").trim().length == 0) return prev;
        return prev + curr.trim() + "\n";
      },"")
  }
}


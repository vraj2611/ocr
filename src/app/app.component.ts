import { Component, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { TesseractService, ITesseractData } from './tesseract.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  host: { "(window:paste)": "handlePaste( $event )" }
})
export class AppComponent implements OnDestroy {
  public text:string;
  // public progression: number;
  // public imageUrl: SafeUrl;
  tdados$: Observable<ITesseractData>;

  constructor(private tserv:TesseractService) {
    this.tdados$ = this.tserv.dados$()
  }

  ngOnDestroy(): void {
    this.tserv.terminate()
  }

  public colar(){
  }

  public handlePaste(event: ClipboardEvent): void {    
    if (event.clipboardData.getData('text').length > 0) this.text = event.clipboardData.getData('text');
    if (!(event.clipboardData?.files[0])) return;
    this.tserv.processarImagem(event.clipboardData.files[0]);
  }

  public selecionarArquivo(event) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    this.tserv.processarImagem(target.files[0]);
  }

}


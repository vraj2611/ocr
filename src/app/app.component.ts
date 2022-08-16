import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
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
  public statusmodalcamera: string = 'modal modaloculto';
  tdados$: Observable<ITesseractData>;

  @ViewChild('video') video: ElementRef | undefined;
  @ViewChild('canvas') canvas: ElementRef | undefined;
  
  WIDTH = 640;
  HEIGHT = 480;

  error: any;
  isCaptured: boolean = false;

  constructor(private tserv:TesseractService) {
    this.tdados$ = this.tserv.dados$()
  }

  ngOnDestroy(): void {
    this.tserv.terminate()
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

  capturarFoto(){
    this.video.nativeElement.srcObject.getTracks().forEach(track => track.stop());
    this.statusmodalcamera = 'modal modaloculto';
  }

  async setupCamera() {
    this.statusmodalcamera = 'modal modalativo';
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (stream && this.video) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
        } else {
          this.error = 'Sorry camera device is not exist or not working';
        }
      } catch (error) {
        this.error = error;
      }
    }
  }

  capture() {
    this.drawImageToCanvas(this.video?.nativeElement);
    this.tserv.bypassImagem(this.canvas.nativeElement);
    this.isCaptured = true;
  }

  drawImageToCanvas(image: any) {
    this.canvas?.nativeElement
      .getContext('2d')
      .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }

}


import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImpresionReciboService {

  imprimirElemento(
    elementId: string,
    titulo: string = 'Recibo',
  ): void {
    const elemento = document.getElementById(elementId);

    if (!elemento) {
      return;
    }

    const ventana = window.open(
      '',
      '_blank',
      'width=400,height=700',
    );

    if (!ventana) {
      return;
    }

    ventana.document.open();

    ventana.document.write(
      this.generarHtml(
        elemento.innerHTML,
        titulo,
      ),
    );

    ventana.document.close();
  }

  private generarHtml(
    contenido: string,
    titulo: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${titulo}</title>

          <style>
            @page {
              size: 80mm auto;
              margin: 2mm 3mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              width: 74mm;
              margin: 0 auto;
              padding: 0;
              font-family: 'Courier New', monospace;
              font-size: 10px;
              line-height: 1.3;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            hr {
              border-top: 1px dashed #000;
              border-bottom: none;
              margin: 2px 0;
            }

            .text-center {
              text-align: center;
            }

            .text-end {
              text-align: right;
            }

            .fw-bold {
              font-weight: bold;
            }

            .d-flex {
              display: flex;
            }

            .justify-content-between {
              justify-content: space-between;
            }

            .mb-0 {
              margin-bottom: 0;
            }

            .mb-1 {
              margin-bottom: 2px;
            }

            .mb-2 {
              margin-bottom: 4px;
            }

            .mt-1 {
              margin-top: 2px;
            }

            .my-1 {
              margin-top: 2px;
              margin-bottom: 2px;
            }

            h5 {
              font-size: 12px;
              margin: 0 0 2px 0;
            }

            small {
              font-size: 9px;
            }
          </style>
        </head>

        <body onload="window.print();">
          ${contenido}
        </body>
      </html>
    `;

  }
}
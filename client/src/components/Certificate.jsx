import React, { useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import constants from '../config/constants';

function Certificate({ userName }) {
  useEffect(() => {
    const loadAndPrintDocument = async () => {
      try {
        if (!userName) {
          console.error('No username provided');
          return;
        }

        const cert_url = `${constants.SOCKET_URL}/CertificateTemplate.pdf`;
        const response = await fetch(cert_url);
        if (!response.ok) {
          console.error('Failed to fetch certificate template:', response.status);
          return;
        }
        const existingPdfBytes = await response.arrayBuffer();
        
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const DATE = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).toUpperCase();

        // Measure the width of the text at the specified font and size
        const userNameWidth = font.widthOfTextAtSize(userName, 48);
        const dateWidth = font.widthOfTextAtSize(DATE, 24);

        // Calculate the center position for userName
        const userNameX = (firstPage.getWidth() - userNameWidth) / 2;
        const dateX = (firstPage.getWidth() - dateWidth) / 2;

        firstPage.drawText(userName, {
          x: userNameX,
          y: 460, // Adjust this value as needed
          size: 48,
          font,
          color: rgb(0.56, 0.43, 0.16)
        });

        firstPage.drawText(DATE, {
          x: dateX,
          y: 225, // Adjust this value as needed
          size: 24,
          font,
          color: rgb(0.56, 0.43, 0.16)
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Certificate.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error generating certificate:', error);
      }
    };

    loadAndPrintDocument();
  }, [userName]);  // Dependency array includes userName to regenerate when userName changes

  return null; // No UI needed for this component
}

export default Certificate;

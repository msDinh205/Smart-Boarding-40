import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const exportToPdf = async (element: HTMLElement, fileName: string) => {
  const buttons = element.querySelectorAll('.print\\:hidden');
  buttons.forEach((btn) => (btn as HTMLElement).style.display = 'none');

  try {
    const dataUrl = await toJpeg(element, { 
      quality: 0.95, 
      backgroundColor: '#E4E3E0',
      pixelRatio: 2
    });
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  } catch (error) {
    console.error('Lỗi khi tạo PDF:', error);
    throw error;
  } finally {
    buttons.forEach((btn) => (btn as HTMLElement).style.display = '');
  }
};

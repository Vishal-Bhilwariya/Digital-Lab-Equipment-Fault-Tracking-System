import QRCode from 'qrcode';

/**
 * Generate a printable Data URL (Base64 PNG) for an equipment QR code.
 * The QR code directly encodes the public URL accessible by Google Lens / Phone Camera.
 * 
 * @param {string} publicId - The equipment's unique publicId
 * @returns {Promise<string>} Base64 Data URL
 */
export const generateEquipmentQR = async (publicId) => {
  const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const targetUrl = `${clientBaseUrl}/equipment/${publicId}`;

  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    width: 320,
    color: {
      dark: '#1e293b', // Slate 800 for high-contrast crisp scanning
      light: '#ffffff'
    }
  });

  return { targetUrl, qrDataUrl };
};

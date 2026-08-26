import { QRCode } from 'react-qr-code';

interface InviteQrProps {
  url: string;
}

export function InviteQr({ url }: InviteQrProps) {
  return (
    <div className="bg-background p-3">
      <QRCode
        value={url}
        size={160}
        bgColor="#0a0a0a"
        fgColor="#f5a623"
        title={`QR code for invite link: ${url}`}
      />
    </div>
  );
}

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import gpayLogo from '../../assets/qr/gpay.avif';
import phonepeLogo from '../../assets/qr/phonepe.jpg';
import paytmLogo from '../../assets/qr/paytm.png';
import bhimLogo from '../../assets/qr/bhim.png';

const Payment = () => {
  const upiId = "kushaldubey121-1@okaxis";
  const amount = 1;
  const upiLink = `upi://pay?pa=${upiId}&pn=Bank+of+Maharashtra+Store&am=${amount}&cu=INR`;

  const copyUPI = () => {
    navigator.clipboard.writeText(upiId)
      .then(() => alert("UPI ID Copied ✅"))
      .catch(() => alert("Failed to Copy ❌"));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Pay ₹{amount} via UPI</h1>

      <QRCodeSVG value={upiLink} size={220} />

      <p className="text-lg">UPI ID: <span className="font-semibold">{upiId}</span></p>
      <button
        onClick={copyUPI}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Copy UPI ID
      </button>

      <a
        href={upiLink}
        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold text-lg"
      >
        Pay ₹{amount} via UPI App
      </a>

      <div className="flex items-center gap-3 mt-4">
        <img src={gpayLogo} alt="GPay" className="w-10 h-10" />
        <img src={phonepeLogo} alt="PhonePe" className="w-10 h-10" />
        <img src={paytmLogo} alt="Paytm" className="w-10 h-10" />
        <img src={bhimLogo} alt="BHIM" className="w-10 h-10" />
      </div>

      <p className="text-sm text-gray-600 mt-2 text-center">
        Works with GPay, PhonePe, Paytm, BHIM & all UPI apps
      </p>
    </div>
  );
};

export default Payment;

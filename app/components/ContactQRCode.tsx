import React from "react";
import { Card } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
interface ContactInfo {
  fullName?: string;
  phone?: string;
  address?: string;
  email?: string;
  position?: string;
  linkedin?: string;
  website?: string;
  skills?: string[];
}

const generateVCard = (contact: ContactInfo): string => {
  const {
    fullName,
    phone,
    address = "",
    email = "",
    position = "",
    linkedin = "",
    website = "",
    skills = [],
  } = contact;

  const notes: string[] = [];

  if (skills.length > 0) {
    notes.push(`Skills: ${skills.join(", ")}`);
  }

  return `BEGIN:VCARD
VERSION:3.0
FN:${fullName}${position}
ADR:${address}
TEL;TYPE=CELL:${phone}
EMAIL:${email}
URL:${linkedin}
URL:${website}
NOTE:${notes}
END:VCARD`;
};

// interface Props {
//   contact: ContactInfo;
// }

function ContactQRCode({ contact }) {
  const vCardData = generateVCard(contact);

  return (
    <Card className="p-4 dark:bg-white">
      <QRCodeSVG value={vCardData} size={128} />
    </Card>
  );
}

export default ContactQRCode;

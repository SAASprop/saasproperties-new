import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FiPhone } from "react-icons/fi";

export type SocialIcon =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "phone"
  | "whatsapp";

const ICONS: Record<SocialIcon, IconType> = {
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  phone: FiPhone,
  whatsapp: FaWhatsapp,
};

export function SocialGlyph({
  icon,
  className,
}: {
  icon: SocialIcon;
  className?: string;
}) {
  const Icon = ICONS[icon];

  return <Icon className={className} aria-hidden="true" />;
}

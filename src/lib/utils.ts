import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const VALID_EMAIL_DOMAINS = () => {
  const domains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "aol.com",
    "icloud.com",
    "protonmail.com",
    "zoho.com",
    "gmx.com",
    "mail.com",
  ];

  // if (process.env.NODE_ENV === "development") {
  //   domains.push("test.com", "example.com");
  // }
  return domains
}
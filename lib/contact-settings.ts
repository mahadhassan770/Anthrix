import { db } from "@/lib/db";

export interface ContactSettings {
  email: string;
  phone: string;
  secondaryPhone: string;
  location: string;
  supportEmail: string;
  workingHours: string;
}

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  email: "anthrixtechnologies@gmail.com",
  phone: "+92 336 5561164",
  secondaryPhone: "+92 342 6225425",
  location: "Islamabad, Pakistan",
  supportEmail: "mahadhassan095@gmail.com",
  workingHours: "24/7",
};

export async function getContactSettings(): Promise<ContactSettings> {
  try {
    const keys = [
      "contact_email",
      "contact_phone",
      "contact_phone_secondary",
      "contact_location",
      "contact_support_email",
      "contact_working_hours",
    ];

    const settings = await db.systemSetting.findMany({
      where: {
        key: { in: keys },
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    return {
      email: map["contact_email"] || DEFAULT_CONTACT_SETTINGS.email,
      phone: map["contact_phone"] || DEFAULT_CONTACT_SETTINGS.phone,
      secondaryPhone: map["contact_phone_secondary"] || DEFAULT_CONTACT_SETTINGS.secondaryPhone,
      location: map["contact_location"] || DEFAULT_CONTACT_SETTINGS.location,
      supportEmail: map["contact_support_email"] || DEFAULT_CONTACT_SETTINGS.supportEmail,
      workingHours: map["contact_working_hours"] || DEFAULT_CONTACT_SETTINGS.workingHours,
    };
  } catch (error) {
    console.error("Failed to fetch contact settings:", error);
    return DEFAULT_CONTACT_SETTINGS;
  }
}

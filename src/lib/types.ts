export type Lang = "el" | "en";

export type LocalizedBuilding = {
  name: string;
  island: string;
  school: string;
  departments: string[];
  address: string;
  rooms: string[];
  offices: string[];
  services: string[];
  notes?: string;
};

export type Building = {
  id: string;
  published: boolean;
  buildingCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  lat?: number;
  lng?: number;
  el: LocalizedBuilding;
  en: LocalizedBuilding;
};

export type BuildingsFile = Building[];

export type LocalizedOffice = {
  label: string;
  occupant: string;
  title: string;
  building: string;
  department: string;
  notes?: string;
};

export type Office = {
  id: string;
  code: string;
  buildingCode: string;
  buildingId?: string;
  published: boolean;
  kind: "office" | "lab" | "room";
  phone?: string;
  email?: string;
  el: LocalizedOffice;
  en: LocalizedOffice;
};

export const EMPTY_LOCALIZED: LocalizedBuilding = {
  name: "",
  island: "",
  school: "",
  departments: [],
  address: "",
  rooms: [],
  offices: [],
  services: [],
  notes: "",
};

export function createEmptyBuilding(id: string): Building {
  return {
    id,
    published: true,
    phone: "",
    email: "",
    website: "",
    el: { ...EMPTY_LOCALIZED, departments: [], rooms: [], offices: [], services: [] },
    en: { ...EMPTY_LOCALIZED, departments: [], rooms: [], offices: [], services: [] },
  };
}

export function createEmptyOffice(id: string): Office {
  return {
    id,
    code: "",
    buildingCode: "",
    published: true,
    kind: "office",
    phone: "",
    email: "",
    el: { label: "", occupant: "", title: "", building: "", department: "", notes: "" },
    en: { label: "", occupant: "", title: "", building: "", department: "", notes: "" },
  };
}

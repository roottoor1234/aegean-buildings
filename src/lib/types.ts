export type Lang = "el" | "en";
export type Role = "admin" | "user";
export type OfficeKind = "office" | "lab" | "room";

export type LocalizedOffice = {
  label: string;
  occupant: string;
  title: string;
  department: string;
  notes: string;
};

export type Office = {
  id: string;
  code: string;
  buildingId: string | null;
  kind: OfficeKind;
  published: boolean;
  phone: string;
  email: string;
  el: LocalizedOffice;
  en: LocalizedOffice;
  updatedAt?: string | null;
  updatedBy?: string | null;
};

export type LocalizedBuilding = {
  name: string;
  island: string;
  school: string;
  address: string;
  notes: string;
  departments: string[];
};

export type Building = {
  id: string;
  code: string;
  published: boolean;
  phone: string;
  email: string;
  website: string;
  lat: number | null;
  lng: number | null;
  el: LocalizedBuilding;
  en: LocalizedBuilding;
  updatedAt?: string | null;
  updatedBy?: string | null;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
};

export type Activity = {
  id: number;
  action: "create" | "update" | "delete";
  entity: "office" | "building" | "user";
  entityId: string | null;
  summary: string;
  createdAt: string;
  userName: string | null;
};

const emptyOfficeText = (): LocalizedOffice => ({
  label: "",
  occupant: "",
  title: "",
  department: "",
  notes: "",
});

export function emptyOffice(): Office {
  return {
    id: "",
    code: "",
    buildingId: null,
    kind: "office",
    published: false,
    phone: "",
    email: "",
    el: { ...emptyOfficeText(), department: "Τμήμα Πολιτισμικής Τεχνολογίας και Επικοινωνίας" },
    en: { ...emptyOfficeText(), department: "Department of Cultural Technology and Communication" },
  };
}

const emptyBuildingText = (): LocalizedBuilding => ({
  name: "",
  island: "",
  school: "",
  address: "",
  notes: "",
  departments: [],
});

export function emptyBuilding(): Building {
  return {
    id: "",
    code: "",
    published: false,
    phone: "",
    email: "",
    website: "",
    lat: null,
    lng: null,
    el: emptyBuildingText(),
    en: emptyBuildingText(),
  };
}

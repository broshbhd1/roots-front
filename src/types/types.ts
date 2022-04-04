export interface Class {
  id: number;
  name: string;
  building: Building;
  owner: Unit;
  type: ClassType;
}

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: number;
  firstName: Building;
  lastName: string;
  phoneNumber: string;
  team: Unit;
  role: Role;
}

export interface ClassAssign {
  id: number;
  title: string;
  assignedClass: Class;
  startDate: Date;
  endDate: Date;
  createdBy: User;
  isApproved: boolean;
}

export interface Building {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
  parent: Unit;
  children: Unit[];
}

export interface Url {
  id: number;
  name: string;
  url: string;
}

export interface ClassType {
  id: number;
  name: string;
}

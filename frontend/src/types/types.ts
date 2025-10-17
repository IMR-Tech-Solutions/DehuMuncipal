// src/types/types.ts

export interface RoleData {
  role_id: number;
  role_name: string;
}

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    module: string;
  }[];
  module?: string;
};

export interface UserData {
  id: number;
  email: string;
  mobile_number: string;
  first_name: string;
  last_name: string;
  user_type: number;
  user_type_name: string;
  country: string | null;
  state: string | null;
  city: string | null;
  postal_code: string | null;
  user_image: string;
}

export interface Step1Data {
  [key: string]: string | File | null; // allows dynamic indexing
  zoneNo: string;
  wardNo: string;
  propertyNo: string;
  partitionNo: string;
  oldWardNo: string;
  oldPropertyNo: string;
  propertyDescription: string;
  plotNo: string;
  mobileNo: string;
  propertyImage: File | null; // can hold file from camera
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  flatShopName: string;
  buildingName: string;
  address: string;
  titleMarathi: string;
  firstNameMarathi: string;
  middleNameMarathi: string;
  lastNameMarathi: string;
  flatShopNameMarathi: string;
  buildingNameMarathi: string;
  addressMarathi: string;
}

export interface Step2Data {
  [key: string]: string; // dynamic indexing
  floorNumber: string;
  constructionYear: string;
  typeOfConstruction: string;
  typeOfUse: string;
  typeOfUseDesc: string;
  measurementType: string;
  lengthMt: string;
  widthMt: string;
  minuslengthsqmt: string;
  minuswidthsqmt: string;
  userType: string;
  renterFullName: string;
  renterFullNameMarathi: string;
  renterHasRegistration: string;
  renterCalculateRent: string;
  occupierFullName: string;
  occupierFullNameMarathi: string;
  occupierHasRegistration: string;
  occupierCalculateRent: string;
}

export interface Step3Data {
  [key: string]: string;
  residentialToilets: string;
  commercialToilets: string;
  waterConnectionAvailable: string;
  numberOfWaterConnections: string;
  connectionSize: string;
  rainwaterHarvesting: string;
  solarSystem: string;
  remarks: string;
  remarksMarathi: string;
}

// Fixed FloorData interface to resolve key property type error
export interface FloorData extends Step2Data {
  key: string; // Required for Ant Design Table - must be string type
  id: string; // Changed from number to string for consistency with key type
}

export interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  options?: (string | { value: string; label: string })[];
  placeholder?: string;
  required?: boolean;
  accept?: string;
  isMarathi?: boolean;
  step?: string;
}


// Backend API response interfaces for proper typing
export interface BackendFloorData {
  id?: number;
  floor_number?: string | number;
  construction_year?: string | number;
  type_of_construction?: string;
  type_of_use?: string;
  type_of_use_desc?: string;
  measurement_type?: string;
  length_mt?: string | number;
  width_mt?: string | number;
  minus_length_sqmt?: string | number;
  minus_width_sqmt?: string | number;
  user_type?: string;
  renter_full_name?: string;
  renter_full_name_marathi?: string;
  renter_has_registration?: string;
  renter_calculate_rent?: string | number;
  occupier_full_name?: string;
  occupier_full_name_marathi?: string;
  occupier_has_registration?: string;
  occupier_calculate_rent?: string | number;
}

// API Error types for proper error handling
export interface ApiError {
  response?: {
    status: number;
    statusText: string;
    data?: {
      message?: string;
      [key: string]: unknown;
    };
  };
  request?: unknown;
  message: string;
  stack?: string;
}

// Translation mapping interfaces with proper typing
export interface TitleMapping {
  [key: string]: string;
  'Mr': 'श्री.';
  'Mrs': 'श्रीमती.';
  'Ms': 'कु.';
}

export interface MarathiTitleMapping {
  [key: string]: string;
  'श्री.': 'Mr';
  'श्रीमती.': 'Mrs';
  'कु.': 'Ms';
}

export interface EnglishToMarathiMap {
  [key: string]: string;
  firstName: 'firstNameMarathi';
  middleName: 'middleNameMarathi';
  lastName: 'lastNameMarathi';
  flatShopName: 'flatShopNameMarathi';
  buildingName: 'buildingNameMarathi';
  address: 'addressMarathi';
}

export interface Step2EnglishToMarathiMap {
  [key: string]: string;
  renterFullName: 'renterFullNameMarathi';
  occupierFullName: 'occupierFullNameMarathi';
}

export interface Step3EnglishToMarathiMap {
  [key: string]: string;
  remarks: 'remarksMarathi';
}

// Field mapping interfaces for backend API
export interface Step1Mapping {
  [key: string]: string;
  zoneNo: 'zone_no';
  wardNo: 'ward_no';
  propertyNo: 'property_no';
  partitionNo: 'partition_no';
  oldWardNo: 'old_ward_no';
  oldPropertyNo: 'old_property_no';
  propertyDescription: 'property_description';
  plotNo: 'plot_no';
  mobileNo: 'mobile_no';
  propertyImage: 'property_image';
  title: 'title';
  firstName: 'first_name';
  middleName: 'middle_name';
  lastName: 'last_name';
  flatShopName: 'flat_shop_name';
  buildingName: 'building_name';
  titleMarathi: 'title_marathi';
  firstNameMarathi: 'first_name_marathi';
  middleNameMarathi: 'middlenamemarathi';
  lastNameMarathi: 'last_name_marathi';
  flatShopNameMarathi: 'flat_shop_name_marathi';
  buildingNameMarathi: 'building_name_marathi';
  address: 'address';
  addressMarathi: 'address_marathi';
}

export interface Step3Mapping {
  [key: string]: string;
  residentialToilets: 'residential_toilets';
  commercialToilets: 'commercial_toilets';
  waterConnectionAvailable: 'water_connection_available';
  numberOfWaterConnections: 'number_of_water_connections';
  connectionSize: 'connection_size';
  rainwaterHarvesting: 'rainwater_harvesting';
  solarSystem: 'solar_system';
  remarks: 'remarks';
  remarksMarathi: 'remarks_marathi';
}

// Utility types for form handling
export type SanitizeValueType = 'string' | 'number' | 'boolean';

export type FormChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

// Survey data interface for API responses
export interface SurveyData {
  zone_no?: string | number;
  ward_no?: string | number;
  property_no?: string | number;
  partition_no?: string | number;
  old_ward_no?: string | number;
  old_property_no?: string | number;
  property_description?: string;
  plot_no?: string | number;
  mobile_no?: string | number;
  property_image?: string;
  title?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  flat_shop_name?: string;
  building_name?: string;
  title_marathi?: string;
  first_name_marathi?: string;
  middle_name_marathi?: string;
  last_name_marathi?: string;
  flat_shop_name_marathi?: string;
  building_name_marathi?: string;
  address?: string;
  address_marathi?: string;
  residential_toilets?: string | number;
  commercial_toilets?: string | number;
  water_connection_available?: string;
  number_of_water_connections?: string | number;
  connection_size?: string;
  rainwater_harvesting?: string;
  solar_system?: string;
  remarks?: string;
  remarks_marathi?: string;
}

// Dropdown option interfaces
export interface DropdownOption {
  value: string;
  label: string;
}

// Floor data API response interface
export interface FloorDataResponse {
  results?: BackendFloorData[];
  data?: BackendFloorData[];
  [key: string]: unknown;
}

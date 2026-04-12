export interface Category {
  id?: string;
  name: string;
  created_at?: string;
}

export interface TransportMethod {
  id?: string;
  name: string;
  created_at?: string;
}

export interface InventoryItem {
  id?: string;
  name: string;
  category: string;
  organization: 'Ministère de la Défense' | 'Forces Armées d\'Haïti' | 'Conjoint (Ministère & FAd\'H)';
  service?: string;
  direction?: string;
  deptDirection?: string;
  section?: string;
  militaryUnitId?: string;
  quantity: number;
  minThreshold: number;
  condition: string;
  location: string;
  serialNumber?: string;
  lastInventoryDate?: string;
  acquiredDate?: string;
  estimatedValue?: number;
  description?: string;
  notes?: string;
  icon?: string;
  munitions?: {
    type: string;
    quantity: number;
  };
}

export interface Movement {
  id?: string;
  itemId: string;
  itemName: string;
  itemType: 'Matériel' | 'Mobilier';
  quantity: number;
  originUnit: string;
  destinationUnit: string;
  departureDate: string;
  arrivalDate?: string;
  status: 'En transit' | 'Livré' | 'Annulé';
  createdBy: string;
  transportMethod?: string;
}

export interface MilitaryUnit {
  id?: string;
  name: string;
  branch: "Armée de Terre" | "Corps d'Aviation" | "Garde-Côtes" | "Génie Militaire" | "Service de Santé" | "Autre";
  location?: string;
  commander?: string;
  personnelCount?: number;
  description?: string;
}

export interface PreAuthorizedUser {
  id?: string;
  email: string;
  role: 'Administrateur' | 'Officier Logistique' | 'Consultant';
  organization: 'Ministère de la Défense' | 'Forces Armées d\'Haïti' | 'Conjoint (Ministère & FAd\'H)';
  addedBy?: string;
  createdAt?: string;
}

export interface AIInsight {
  category: string;
  subUnit?: string;
  status: 'Critique' | 'Attention' | 'Optimal';
  observation: string;
  recommendation: string;
  prediction: string;
}

export interface AIAnalysisResult {
  lastUpdated: string;
  insights: AIInsight[];
  globalSummary: string;
}

export interface UserProfile {
  id?: string;
  email: string;
  full_name: string;
  role: 'Administrateur' | 'Officier Logistique' | 'Consultant';
  organization: string;
}

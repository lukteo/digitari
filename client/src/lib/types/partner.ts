// src/lib/types/partner.ts

export interface Partner {
	id: string;
	user_id: string;
	dna_hash: string;
	name: string;
	visual_attributes: VisualAttributes;
	personality: Personality;
	needs?: Needs;
	stage: PartnerStage;
	generation_timestamp: string;
	created_at: string;
	updated_at: string;
}

export interface VisualAttributes {
	species: Species;
	color_primary: string;
	color_secondary: string;
	pattern: Pattern;
}

export interface Personality {
	energy: number; // 0-100
	social: number; // 0-100
	curiosity: number; // 0-100
	affection: number; // 0-100
}

export interface Needs {
	energy: number; // 0-100
	happiness: number; // 0-100
	bond: number; // 0-100
}

export type Species = "Fluffy" | "Scaly" | "Feathered" | "Aquatic" | "Rocky";
export type Pattern = "solid" | "stripes" | "spots" | "gradient";
export type PartnerStage = "egg" | "baby" | "child" | "teen" | "adult";

// API Request/Response types
export interface GeneratePartnerRequest {
	user_initials: string;
	quiz_answers: number[];
}

export interface UpdatePartnerNameRequest {
	name: string;
}

export interface AuthResponse {
	user_id: string;
	token: string;
}

export interface ErrorResponse {
	error: string;
}

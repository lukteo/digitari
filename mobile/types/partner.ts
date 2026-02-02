export interface Partner {
	id: string;
	dnaHash: string;
	name: string;
	species: string;
	colorPrimary: string;
	colorSecondary: string;
	pattern: "solid" | "stripes" | "spots" | "gradient";
	personality: {
		energy: number;
		social: number;
		curiosity: number;
		affection: number;
	};
	needs: {
		energy: number;
		happiness: number;
		bond: number;
	};
	stage: "egg" | "baby" | "child" | "teen" | "adult";
	createdAt: Date;
	lastInteraction: Date;
}

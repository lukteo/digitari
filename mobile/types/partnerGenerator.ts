import { createHash } from "node:crypto";
import type { Partner } from "./partner";

export interface GenerationInputs {
	userInitials: string;
	timestamp: number;
	quizAnswers: number[];
}

function seededRandom(seed: number) {
	return () => {
		seed = (seed * 9301 + 4927) % 233280;
		return seed / 233280;
	};
}

const SPECIES = ["Fluffy", "Scaly", "Feathered", "Aquatic", "Rocky"];
const PATTERNS = ["solid", "stripes", "spots", "gradient"];

function generateColor(rng: () => number): string {
	const r = Math.floor(rng() * 256);
	const g = Math.floor(rng() * 256);
	const b = Math.floor(rng() * 256);

	function padHex(color: number): string {
		return color.toString(16).padStart(2, "0");
	}

	return `${padHex(r)}${padHex(g)}${padHex(b)}`;
}

function mapAnswer(answer: number, min: number, max: number): number {
	return min + (answer - 1) * ((max - min) / 4);
}

export function generatePartner(inputs: GenerationInputs): Partner {
	// Create dna hash from user inputs
	const dnaString = `${inputs.userInitials}-${inputs.timestamp}-${inputs.quizAnswers.join("")}`;
	const dnaHash = createHash("sha256").update(dnaString).digest("hex");

	// Use hash to seed random number generator
	const seed = parseInt(dnaHash.substring(0, 8), 16);
	const rng = seededRandom(seed);

	// Generate visual attributes
	const species = SPECIES[Math.floor(rng() * SPECIES.length)];
	const colorPrimary = generateColor(rng);
	const colorSecondary = generateColor(rng);
	const pattern = PATTERNS[Math.floor(rng() * PATTERNS.length)] as any;

	// Generate personality from quiz answers
	const personality = {
		energy: mapAnswer(inputs.quizAnswers[0], 20, 80),
		social: mapAnswer(inputs.quizAnswers[1], 20, 80),
		curiosity: mapAnswer(inputs.quizAnswers[2], 20, 80),
		affection: mapAnswer(inputs.quizAnswers[3], 20, 80),
	};

	return {
		id: crypto.randomUUID(),
		dnaHash,
		name: "",
		species,
		colorPrimary,
		colorSecondary,
		pattern,
		personality,
		needs: { energy: 100, happiness: 100, bond: 50 },
		stage: "egg",
		createdAt: new Date(),
		lastInteraction: new Date(),
	};
}

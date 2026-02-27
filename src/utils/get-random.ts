export function getRandomEnumValue<T>(enumeration: any): T {
	const enumValues = Object.values(enumeration);
	const randomIndex = Math.floor(Math.random() * enumValues.length);
	return enumValues[randomIndex] as T;
}
export function getRandomIndex(n: number): number {
	return Math.floor(Math.random() * n);
}

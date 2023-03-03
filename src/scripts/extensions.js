const toUpperCase = (str) => {
	const upperStrings = [];
	for (const s of str.split(" ")) {
		upperStrings.push(s.charAt(0).toUpperCase() + s.slice(1));
	}
	return upperStrings.join(" ");
}

export { toUpperCase }
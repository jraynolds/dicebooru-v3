const toUpperCase = (str) => {
	if (!str) return '';
	const upperStrings = [];
	for (const s of str.split(" ")) {
		upperStrings.push(toUpperFirst(s));
	}
	return upperStrings.join(" ");
}

const toUpperFirst = (str) => {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

const sentenced = (str) => {
	if (!str) return '';
	return toUpperFirst(str) + '.';
}

export { toUpperCase, toUpperFirst, sentenced }
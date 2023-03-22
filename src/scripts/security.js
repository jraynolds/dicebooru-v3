const securityLevels = [
	{
		title: "unknown",
		icon: "mdi-lock-question",
		description: "Unknown license.",
		value: 0,
	},
	{
		title: "free",
		icon: "mdi-lock-open",
		description: "Free for non-commercial use.",
		value: 1,
	},
	{
		title: "locked",
		icon: "mdi-lock",
		description: "Maps can be bought on an external site.",
		value: 2,
	},
	{
		title: "forbidden",
		icon: "mdi-lock-off",
		description: "Maps can't be bought or used.",
		value: 3,
	},
];

const selectableSecurityLevels = [
	{
		title: "unlocked",
		icon: "mdi-lock-open",
		description: "Free for non-commercial use.",
		value: 1,
	},
	{
		title: "locked",
		icon: "mdi-lock",
		description: "Maps can be bought on an external site.",
		value: 2,
	},
	{
		title: "forbidden",
		icon: "mdi-lock-off",
		description: "Maps can't be bought or used.",
		value: 3,
	},
];

const securitySearchLevels = [
	{
		title: "any",
		icon: "mdi-lock-question",
		description: "Any use restrictions."
	},
	{
		title: "free",
		icon: "mdi-lock-open",
		description: "Only free maps."
	},
	{
		title: "paid",
		icon: "mdi-lock",
		description: "Only paid maps."
	},
];

export { securityLevels, selectableSecurityLevels, securitySearchLevels };
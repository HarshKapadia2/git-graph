function getId(hash = "", name = "") {
	let id = hash + "-";

	name = name.split(".");

	for (let i = 0; i < name.length; i++) id += name[i];

	return id;
}

export default getId;

import "./loader.css";
import loader from "./loader.svg";

const Loader = () => {
	return (
		<div id="loader-wrapper">
			<img id="loader" src={loader} alt="Loading..." />
			<div>Loading...</div>
		</div>
	);
};

export default Loader;

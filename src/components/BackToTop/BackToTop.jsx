import "./BackToTop.css";
import upArrow from "./up-arrow.svg";

const BackToTop = ({ backToTopBtn, header }) => {
	const scrollToTop = () => {
		header.current.scrollIntoView(true);
	};

	return (
		<button
			id="back-to-top-btn"
			ref={backToTopBtn}
			onClick={() => scrollToTop()}
		>
			<img src={upArrow} alt="Top" />
		</button>
	);
};

export default BackToTop;

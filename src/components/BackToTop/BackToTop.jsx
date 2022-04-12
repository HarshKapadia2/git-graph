import "./BackToTop.css";
import upArrow from "./up-arrow.svg";

const BackToTop = ({ backToTopBtn, scrollToTopTriggerDiv }) => {
	const scrollToTop = () => {
		scrollToTopTriggerDiv.current.scrollIntoView(true);
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

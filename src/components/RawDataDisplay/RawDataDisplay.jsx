import "./RawDataDisplay.css";
import cross from "./cross.svg";

const RawDataDisplay = ({ objDetails, rawData, dismissRawDataDisplay }) => {
	return (
		<div id="raw-data-display">
			<button onClick={() => dismissRawDataDisplay()} title="Close">
				<img src={cross} alt="Close" />
			</button>

			<div id="raw-data">
				<div className="raw-data-field">
					Object Name:{" "}
					{objDetails.objName !== "" ? objDetails.objName : " —"}
				</div>
				<div className="raw-data-field">
					Object Hash:{"  "}
					{objDetails.objHash}
				</div>
				<div className="raw-data-field">
					Object Type:{"  "}
					{rawData.objType}
				</div>
				<div className="raw-data-field">
					Object Length:{"  "}
					{rawData.objLength}
				</div>
				<div className="raw-data-field">
					<div id="raw-data-content-field-name">Object Content</div>
					<div id="raw-data-file-content">{rawData.objContent}</div>
				</div>
			</div>
		</div>
	);
};

export default RawDataDisplay;

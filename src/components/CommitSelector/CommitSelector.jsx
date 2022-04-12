import { useState, useEffect } from "react";
import "./CommitSelector.css";
import cross from "./cross.svg";

const CommitSelector = ({
	commits,
	selectorDisplayState,
	selectCommits,
	selectedCommits
}) => {
	const [isChecked, setIsChecked] = useState(
		new Array(commits.length).fill(false)
	);

	useEffect(() => {
		if (selectedCommits.length === 0)
			setIsChecked(new Array(commits.length).fill(false));
		else {
			const updatedCheckedState = [];
			for (let i = 0; i < commits.length; i++) {
				if (
					selectedCommits.some(
						(element) => element === commits[i].hash
					)
				)
					updatedCheckedState.push(true);
				else updatedCheckedState.push(false);
			}

			setIsChecked(updatedCheckedState);
		}
	}, []);

	const handleCheckboxChange = (index) => {
		let checkboxState = [...isChecked]; // Can't directly assign, as passing by reference isn't considered as a change
		checkboxState[index] = !checkboxState[index];
		setIsChecked(checkboxState);
	};

	const submitSelectedCommits = () => {
		let commitArr = [];
		for (let i = 0; i < commits.length; i++) {
			if (isChecked[i] === true) commitArr.push(commits[i].hash);
		}
		selectCommits(commitArr);
	};

	const submitAllCommits = () => {
		const updatedCheckedState = new Array(commits.length).fill(true);
		let commitArr = [];

		for (let i = 0; i < commits.length; i++)
			commitArr.push(commits[i].hash);

		setIsChecked(updatedCheckedState);
		selectCommits(commitArr);
	};

	const submitNoCommit = () => {
		setIsChecked(new Array(commits.length).fill(false));
		selectCommits([]);
	};

	return (
		<div id="commit-selector">
			<div id="commit-selector-commit-wrapper">
				<div id="commit-selector-dismiss">
					<button
						onClick={() => selectorDisplayState(false)}
						title="Close"
					>
						<img src={cross} alt="Close" />
					</button>
				</div>

				<div id="commit-selector-shortcut-btn-wrapper">
					<button onClick={() => submitAllCommits()}>
						Highlight All Commits
					</button>

					<button onClick={() => submitNoCommit()}>
						Unselect All Commits
					</button>
				</div>

				<div id="commit-selector-btn-wrapper">
					<button onClick={() => submitSelectedCommits()}>
						Highlight Checked Commits
					</button>
				</div>

				<div
					id="selector-commit-wrapper"
					onWheel={(event) => event.stopPropagation()}
				>
					{commits.map((commit, index) => (
						<div
							key={index}
							className="selector-commit"
							onClick={() => handleCheckboxChange(index)}
						>
							<input
								type="checkbox"
								checked={isChecked[index]}
								readOnly
							/>

							<div className="selector-commit-text">
								commit {commit.hash.slice(0, 7)}
								<br />
								<span className="selector-commit-text-msg">
									{commit.name.length <= 30
										? commit.name
										: commit.name.slice(0, 30) + "..."}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default CommitSelector;

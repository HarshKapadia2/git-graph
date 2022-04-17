import { useState, useEffect, useRef } from "react";
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

	const timeoutInstance = useRef();

	useEffect(() => {
		if (selectedCommits.length !== 0) {
			let updatedCheckedState = [];
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
		debouncedCommitSubmission(checkboxState);
	};

	const debouncedCommitSubmission = (checkboxState) => {
		clearTimeout(timeoutInstance.current);

		timeoutInstance.current = setTimeout(
			() => submitSelectedCommits(checkboxState),
			800
		);
	};

	const submitSelectedCommits = (checkboxState) => {
		let commitArr = [];
		for (let i = 0; i < commits.length; i++)
			if (checkboxState[i] === true) commitArr.push(commits[i].hash);

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

				<h2>Highlight Commits</h2>

				<div id="commit-selector-shortcut-btn-wrapper">
					<button onClick={() => submitAllCommits()}>
						Highlight All Commits
					</button>

					<button onClick={() => submitNoCommit()}>
						Unselect All Commits
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

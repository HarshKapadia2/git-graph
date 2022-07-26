import "./BranchSelector.css";

const BranchSelector = ({ branchInfo, handleBranchChange, isDisabled }) => {
	return (
		<select
			name="branch-name"
			onChange={(e) => handleBranchChange(e.target.value)}
			disabled={isDisabled}
		>
			<option value={branchInfo.currentBranch.name}>
				Branch: {branchInfo.currentBranch.name}
			</option>

			{branchInfo.allBranches.map((brObj, index) => {
				if (brObj.branchName !== branchInfo.currentBranch.name)
					return (
						<option value={brObj.branchName} key={index}>
							{brObj.branchName.length > 30
								? brObj.branchName.slice(0, 30) + "..."
								: brObj.branchName}
						</option>
					);
			})}
		</select>
	);
};

export default BranchSelector;

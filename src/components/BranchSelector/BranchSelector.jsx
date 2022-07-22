import "./BranchSelector.css";

const BranchSelector = ({ branchNames, handleBranchChange, isDisabled }) => {
	return (
		<select
			name="branch-name"
			onChange={(e) => handleBranchChange(e.target.value)}
			disabled={isDisabled}
		>
			<option value={branchNames.currentBranch}>
				Branch: {branchNames.currentBranch}
			</option>

			{branchNames.allBranches.map((brName, index) => {
				if (brName !== branchNames.currentBranch)
					return (
						<option value={brName} key={index}>
							{brName.length > 30
								? brName.slice(0, 30) + "..."
								: brName}
						</option>
					);
			})}
		</select>
	);
};

export default BranchSelector;

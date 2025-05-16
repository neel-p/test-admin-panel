// utils/inputHandlers.ts
export const handleNumericInput = (
	event: React.ChangeEvent<HTMLInputElement> | React.WheelEvent<HTMLInputElement>,
	onChange: (value: string) => void
) => {
	if (event.type === 'wheel') {
		// Prevent scrolling from changing the number input value
		event.preventDefault();
		return;
	}

	const { value } = event.target as HTMLInputElement;
	// Allow only numeric characters (and empty string for backspace/delete)
	const numericValue = value.replace(/[^0-9]/g, '');
	onChange(numericValue);
};
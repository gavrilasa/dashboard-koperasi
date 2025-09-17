// hooks/use-currency-input.ts

import { useState, useRef, useEffect, useCallback } from "react";
import { formatRupiahInput, parseRupiahInput } from "@/lib/utils";

interface UseCurrencyInputProps {
	maxValue?: number;
}

export const useCurrencyInput = ({
	maxValue = 999999999999,
}: UseCurrencyInputProps = {}) => {
	const [displayValue, setDisplayValue] = useState("");
	const [rawValue, setRawValue] = useState("0");
	const inputRef = useRef<HTMLInputElement>(null);
	const cursorRef = useRef(0);

	// useEffect ini akan berjalan setiap kali displayValue berubah (setelah re-render)
	// untuk mengatur posisi kursor ke tempat yang seharusnya.
	useEffect(() => {
		const input = inputRef.current;
		if (input) {
			// Atur posisi kursor ke nilai yang telah kita simpan di cursorRef
			input.setSelectionRange(cursorRef.current, cursorRef.current);
		}
	}, [displayValue]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const input = e.target;
			const originalValue = input.value;
			const cursorPosition = input.selectionStart || 0;

			let newRawValue = parseRupiahInput(originalValue);

			if (newRawValue === "" || isNaN(Number(newRawValue))) {
				newRawValue = "0";
			}

			if (Number(newRawValue) > maxValue) {
				newRawValue = String(maxValue);
			}

			const newDisplayValue = formatRupiahInput(newRawValue);

			// Hitung posisi kursor yang baru
			const lengthDifference = newDisplayValue.length - originalValue.length;
			const newCursorPosition = cursorPosition + lengthDifference;

			// Simpan posisi kursor yang baru di ref agar bisa diakses oleh useEffect
			cursorRef.current = newCursorPosition >= 0 ? newCursorPosition : 0;

			setRawValue(newRawValue);
			setDisplayValue(newDisplayValue);
		},
		[maxValue]
	);

	const setValue = useCallback((value: number | string) => {
		const stringValue = String(value);
		const formattedValue = formatRupiahInput(stringValue);
		setRawValue(stringValue);
		setDisplayValue(formattedValue);
		// Saat mengatur nilai secara programatik, pindahkan kursor ke akhir
		cursorRef.current = formattedValue.length;
	}, []);

	return {
		// Anda bisa menghilangkan inputRef dari return jika tidak digunakan di luar
		rawValue,
		setValue,
		inputProps: {
			ref: inputRef,
			value: displayValue,
			onChange: handleInputChange,
			type: "text",
			inputMode: "numeric" as const,
			placeholder: "Rp 0",
		},
	};
};

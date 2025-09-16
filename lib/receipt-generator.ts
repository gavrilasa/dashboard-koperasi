// lib/receipt-generator.ts

import { PrismaClient } from "@prisma/client";

function generateRandomNumber(length: number): string {
	const max = 10 ** length;
	const num = Math.floor(Math.random() * max);
	return num.toString().padStart(length, "0");
}

export async function generateUniqueReceiptNumber(
	prefix: "TR" | "SP" | "TF" | "IK",
	length: 7 | 5,
	prisma:
		| PrismaClient
		| Omit<
				PrismaClient,
				"$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
		  >
): Promise<string> {
	let receiptNumber: string;
	let isUnique = false;

	do {
		const randomNumber = generateRandomNumber(length);
		receiptNumber = `${prefix}${randomNumber}`;

		// Check uniqueness in both transaction tables
		const existingTransaction = await prisma.transaction.findUnique({
			where: { receiptNumber },
		});

		const existingMainAccountTransaction =
			await prisma.mainAccountTransaction.findUnique({
				where: { receiptNumber },
			});

		// If not found in either table, the number is unique
		if (!existingTransaction && !existingMainAccountTransaction) {
			isUnique = true;
		}
	} while (!isUnique);

	return receiptNumber;
}

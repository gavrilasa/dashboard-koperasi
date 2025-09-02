// path: worker.js

// Pesan ini akan muncul di log Docker untuk menandakan worker berjalan.
console.log("Worker process started. Waiting for jobs...");

// Jaga agar proses tetap berjalan.
// Tanpa ini, skrip akan langsung selesai dan kontainer akan berhenti.
setInterval(() => {
	// Worker tetap hidup, melakukan pengecekan atau tugas ringan jika perlu.
}, 1000 * 60 * 60); // Interval ini bisa diatur sesuai kebutuhan, misal setiap jam.

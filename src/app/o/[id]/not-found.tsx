import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">404</h1>
      <p className="mt-2 text-muted">Το γραφείο δεν βρέθηκε ή δεν είναι δημοσιευμένο.</p>
      <Link href="/" className="mt-6 inline-block text-navy font-semibold underline">Αρχική</Link>
    </main>
  );
}

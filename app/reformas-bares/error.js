"use client";

export default function Error({ error, reset }) {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-red-600">Se produjo un error en esta página</h1>
      <pre className="mt-3 p-3 bg-gray-100 overflow-auto rounded">{String(error?.message || error)}</pre>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 rounded bg-blue-600 text-white"
      >
        Reintentar
      </button>
    </main>
  );
}

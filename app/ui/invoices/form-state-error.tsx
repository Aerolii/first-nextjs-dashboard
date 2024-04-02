export default function FormStateError({
  errors,
  ariaId,
}: {
  errors: string[];
  ariaId: string;
}) {
  return (
    <div aria-live="polite" aria-atomic="true">
      {errors.map((error: string) => (
        <p className="mt-2 text-sm text-red-500" key={error}>
          {error}
        </p>
      ))}
    </div>
  );
}

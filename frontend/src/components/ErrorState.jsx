export default function ErrorState({ title = "Something went wrong", message, action }) {
  return (
    <div className="rounded-[14px] border border-brandRed/15 bg-brandRed/[0.06] p-6 text-brandRed shadow-soft">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-brandRed/80">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

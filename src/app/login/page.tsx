import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Sign in</h1>
        <p className="text-slate-300">Use your email to receive a secure magic link.</p>
      </div>
      <LoginForm />
    </section>
  );
}

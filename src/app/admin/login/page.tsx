import LoginForm from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-lg font-extrabold" style={{ color: "#004172" }}>
          Area riservata
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Dashboard assessment — accesso protetto.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

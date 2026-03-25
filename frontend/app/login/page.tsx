import { LoginForm } from "@/components/login-form"
import { PublicGuard } from "@/components/public-guard"

function LoginContent() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <PublicGuard>
      <LoginContent />
    </PublicGuard>
  )
}

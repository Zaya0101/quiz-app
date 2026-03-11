import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-[73px] w-full items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="text-[22px] font-semibold tracking-[-0.02em] text-slate-950">
          💡Quiz App
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton>
            <button className="h-10 cursor-pointer rounded-full border border-slate-300 px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
              Нэвтрэх
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="h-10 cursor-pointer rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800">
              Бүртгүүлэх
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

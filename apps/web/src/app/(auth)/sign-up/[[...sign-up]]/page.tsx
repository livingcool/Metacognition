import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040A0C]">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-cyan-600 hover:bg-cyan-700 text-sm normal-case border-none shadow-none',
            card: 'bg-[#081418] border border-white/5 shadow-2xl',
            headerTitle: 'text-white font-serif italic',
            headerSubtitle: 'text-slate-400',
            socialButtonsBlockButton: 'bg-white/5 border border-white/5 hover:bg-white/10 text-white',
            socialButtonsBlockButtonText: 'text-white',
            dividerLine: 'bg-white/10',
            dividerText: 'text-slate-500',
            formFieldLabel: 'text-slate-300',
            formFieldInput: 'bg-black/20 border-white/10 text-white focus:border-cyan-500',
            footerActionText: 'text-slate-500',
            footerActionLink: 'text-cyan-500 hover:text-cyan-400 font-medium'
          }
        }}
      />
    </div>
  );
}

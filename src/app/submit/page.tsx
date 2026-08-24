import { SubmitForm } from '@/components/SubmitForm'

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
            Enter the Race
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Submit your resume and see how you rank against other engineers. No login required.
          </p>
        </div>
        
        <SubmitForm />
      </div>
    </main>
  )
}

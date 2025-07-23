import { Mail, Lock, Loader2 } from 'lucide-react'

export function Auth({
  actionText,
  onSubmit,
  status,
  afterSubmit,
}: {
  actionText: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  status: 'pending' | 'idle' | 'success' | 'error'
  afterSubmit?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-primary-content">💰</span>
            </div>
            <h1 className="card-title text-2xl justify-center">Tanstack Start Sqlite</h1>
            <p className="text-base-content/70 mt-2">{actionText} to your account</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(e)
            }}
            className="space-y-4"
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2">
                  <Lock size={16} />
                  Password
                </span>
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                className="input input-bordered w-full"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-6"
              disabled={status === 'pending'}
            >
              {status === 'pending' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Please wait...
                </>
              ) : (
                actionText
              )}
            </button>

            {afterSubmit && (
              <div className="mt-4 text-center">
                {afterSubmit}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

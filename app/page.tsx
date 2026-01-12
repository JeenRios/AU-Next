export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to AU Next
        </h1>
        <p className="text-center text-lg mb-8">
          Your advanced trading platform is ready to deploy on Dokploy
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Fast</h2>
            <p>Built with Next.js 14 for optimal performance</p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Scalable</h2>
            <p>Deploy easily with Docker on Dokploy</p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Modern</h2>
            <p>TypeScript, React 18, and App Router</p>
          </div>
        </div>
      </div>
    </main>
  )
}

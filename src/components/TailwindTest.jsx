/**
 * TailwindTest — drop <TailwindTest /> anywhere to confirm Tailwind is working.
 * Remove once you've verified styles apply correctly.
 */
const TailwindTest = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center p-8">
    <div className="bg-white rounded-4xl shadow-card p-10 max-w-md w-full text-center space-y-6">
      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
        Tailwind <span className="text-brand-500">is working</span> ✅
      </h1>

      {/* Color swatch row */}
      <div className="flex justify-center gap-2">
        {['bg-brand-100','bg-brand-300','bg-brand-500','bg-brand-700','bg-brand-900'].map(c => (
          <div key={c} className={`w-8 h-8 rounded-full ${c}`} title={c} />
        ))}
      </div>

      {/* Custom shadow */}
      <div className="bg-brand-50 rounded-2xl p-4 shadow-brand text-brand-600 font-semibold text-sm">
        shadow-brand + rounded-2xl + bg-brand-50
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <button className="btn-brand">Primary Button (btn-brand)</button>
        <button className="btn-brand-outline">Outline Button (btn-brand-outline)</button>
      </div>

      {/* Font check */}
      <p className="text-gray-400 text-sm font-medium">
        Font family: <span className="font-extrabold text-gray-700">Nunito</span> — rounded &amp; friendly
      </p>
    </div>
  </div>
);

export default TailwindTest;

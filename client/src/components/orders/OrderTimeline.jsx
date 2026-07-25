import { CheckCircle, Clock, Truck, Package, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'pending',   label: 'Ordered',   icon: Package      },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle  },
  { key: 'shipped',   label: 'Shipped',   icon: Truck        },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle  },
];

// ── Compact (horizontal) ── used in order cards ───────────────────────────
const CompactTimeline = ({ currentIdx }) => (
  <div className="flex items-center">
    {STEPS.map((step, i) => {
      const done   = i < currentIdx;
      const active = i === currentIdx;
      const isLast = i === STEPS.length - 1;
      return (
        <div key={step.key} className="flex items-center flex-1 min-w-0">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              done   ? 'bg-green-500' :
              active ? 'bg-brand-500 ring-2 ring-brand-200' :
                       'bg-gray-200'
            }`}>
              {done
                ? <CheckCircle className="w-3 h-3 text-white" />
                : <div className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-gray-300'}`} />
              }
            </div>
            <span className={`text-[9px] font-semibold capitalize whitespace-nowrap ${
              done || active ? 'text-gray-700' : 'text-gray-400'
            }`}>{step.label}</span>
          </div>
          {!isLast && (
            <div className={`h-0.5 flex-1 mx-1 mb-3.5 transition-colors ${
              done ? 'bg-green-400' : 'bg-gray-200'
            }`} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Full (vertical) ── used in TrackOrder page ────────────────────────────
const FullTimeline = ({ currentIdx }) => (
  <div className="space-y-0">
    {STEPS.map((step, i) => {
      const done    = i < currentIdx;
      const active  = i === currentIdx;
      const pending = i > currentIdx;
      const Icon    = step.icon;
      const isLast  = i === STEPS.length - 1;

      return (
        <div key={step.key} className="flex gap-4">
          {/* Dot + line */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
              done    ? 'bg-green-500 shadow-sm' :
              active  ? 'bg-brand-500 shadow-brand ring-4 ring-brand-100' :
                        'bg-gray-100 border-2 border-gray-200'
            }`}>
              <Icon className={`w-5 h-5 ${done || active ? 'text-white' : 'text-gray-300'}`} />
            </div>
            {!isLast && (
              <div className={`w-0.5 flex-1 min-h-10 my-1 ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>

          {/* Content */}
          <div className={`pb-8 ${isLast ? 'pb-0' : ''} pt-1.5 flex-1`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-bold ${done || active ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </p>
              {done && (
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              )}
              {active && (
                <span className="text-xs text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded-full animate-pulse">
                  In Progress
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${done || active ? 'text-gray-500' : 'text-gray-300'}`}>
              {step.key === 'pending'   && 'Your order has been placed successfully'}
              {step.key === 'confirmed' && 'Order confirmed and being prepared'}
              {step.key === 'shipped'   && 'Package handed to delivery partner'}
              {step.key === 'delivered' && 'Package delivered to your address'}
            </p>
          </div>
        </div>
      );
    })}
  </div>
);

// ── Main export ───────────────────────────────────────────────────────────────
const OrderTimeline = ({ status, compact = false }) => {
  if (status === 'cancelled') {
    return (
      <div className={`flex items-center gap-2 text-red-500 ${compact ? '' : 'py-4'}`}>
        <XCircle className={compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
        <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
          This order was cancelled
        </span>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status);
  const safeIdx    = currentIdx === -1 ? 0 : currentIdx;

  if (compact) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-50">
        <CompactTimeline currentIdx={safeIdx} />
      </div>
    );
  }

  return <FullTimeline currentIdx={safeIdx} />;
};

export default OrderTimeline;

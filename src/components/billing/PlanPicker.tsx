import { Check } from "lucide-react";
import { PLANS, PREMIUM_FEATURES, type Plan } from "@/lib/pricing";

export function PlanPicker({ value, onChange }: { value: Plan["id"]; onChange: (id: Plan["id"]) => void }) {
  return (
    <div>
      <div role="radiogroup" aria-label="Formule" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PLANS.map((plan) => {
          const active = plan.id === value;
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(plan.id)}
              className={`relative rounded-[16px] border-2 p-4 text-left transition-colors ${
                active ? "border-purple bg-purple/[0.06]" : "border-border bg-white hover:border-purple/40"
              }`}
            >
              {plan.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-purple px-2 py-0.5 text-[11px] font-bold text-white">
                  {plan.badge}
                </span>
              )}
              <span className="block text-[14px] font-semibold text-text-secondary">{plan.name}</span>
              <span className="mt-1 block text-text">
                <span className="font-display text-[26px] font-bold">{plan.price}</span>{" "}
                <span className="text-[14px] text-text-secondary">{plan.period}</span>
              </span>
              <span className="mt-0.5 block text-[13px] text-text-secondary">{plan.note}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-5 flex flex-col gap-2">
        {PREMIUM_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[14px] text-text">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-purple" strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

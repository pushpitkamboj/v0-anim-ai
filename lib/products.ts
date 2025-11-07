export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  priceInPaise: number // Changed from priceInCents to priceInPaise for INR
  features: string[]
  tier: "pro" | "team" | "enterprise"
  popular?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "pro-plan",
    name: "Pro",
    description: "Perfect for individuals and creators",
    priceInPaise: 199900, // ₹1999/month in paise
    tier: "pro",
    features: [
      "Unlimited video generations",
      "HD video quality",
      "Priority processing",
      "Chat history saved",
      "Email support",
      "No watermark",
    ],
  },
  {
    id: "team-plan",
    name: "Team",
    description: "Best for small teams and businesses",
    priceInPaise: 499900, // ₹4999/month in paise
    tier: "team",
    popular: true,
    features: [
      "Everything in Pro",
      "4K video quality",
      "Team collaboration",
      "Advanced AI models",
      "Priority support",
      "Custom branding",
      "API access",
    ],
  },
  {
    id: "enterprise-plan",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    priceInPaise: 999900, // ₹9999/month in paise
    tier: "enterprise",
    features: [
      "Everything in Team",
      "Unlimited team members",
      "Dedicated account manager",
      "Custom AI training",
      "SLA guarantee",
      "On-premise deployment",
      "Advanced analytics",
      "24/7 phone support",
    ],
  },
]

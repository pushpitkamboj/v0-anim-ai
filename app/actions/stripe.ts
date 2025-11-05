"use server"

import { stripe } from "@/lib/stripe"
import { SUBSCRIPTION_PLANS } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function startCheckoutSession(planId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
  if (!plan) {
    throw new Error(`Plan with id "${planId}" not found`)
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email!,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id

    // Update profile with Stripe customer ID
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    ui_mode: "embedded",
    redirect_on_completion: "never",
    payment_method_types: ["card", "link"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: plan.priceInCents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      supabase_user_id: user.id,
      plan_tier: plan.tier,
    },
  })

  return session.client_secret
}

export async function getSubscriptionStatus() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { tier: "free", status: null }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, stripe_subscription_id")
    .eq("id", user.id)
    .single()

  return {
    tier: profile?.subscription_tier || "free",
    subscriptionId: profile?.stripe_subscription_id,
  }
}

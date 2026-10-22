'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect,useRef,useState } from 'react';
import { loadStripe,type Stripe } from '@stripe/stripe-js';
import { EmbeddedCheckout,EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';

type Snapshot={credit:{balance_micros:string;refresh_at:string};subscription:{plan:{name:string};status:string;cancelAtPeriodEnd:boolean;currentPeriodEnd:string|null}|null};
type Plan={slug:string;name:string;features:string[];prices:{month:Price|null;year:Price|null}};
type Price={currency:string;unitAmount:number;lookupKey:string|null};
export function AccountPanel() {
  const {getToken,userId}=useAuth();
  const owner=useRef(userId);owner.current=userId;
  const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[plans,setPlans]=useState<Plan[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false),[interval,setInterval]=useState<'month'|'year'>('month');
  const [checkout,setCheckout]=useState<{checkoutId:string;clientSecret:string;stripe:Promise<Stripe|null>}|null>(null);
  async function request(path:string,body?:unknown) {
    const startedFor=owner.current, token=await getToken();
    if(!token||startedFor!==owner.current)throw new Error('Sign in again to continue.');
    const result=await fetch(`/api/v1/${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
    const data=await result.json();
    if(startedFor!==owner.current)throw new Error('The active account changed.');
    if(!result.ok)throw new Error(typeof data.error==='string'?data.error:data.error?.message||'Please try again.');
    return data;
  }
  useEffect(()=>{
    let active=true;setCheckout(null);setSnapshot(null);setError('');setBusy(false);
    Promise.all([request('billing/subscription'),request('billing/plans')]).then(([data,available])=>{if(active){setSnapshot(data);setPlans(available.plans);}}).catch(e=>{if(active)setError(e.message);});
    return()=>{active=false;};
  },[userId,getToken]);
  async function portal(){setBusy(true);setError('');try{const result=await request('billing/portal',{returnUrl:`${location.origin}/account`});location.assign(result.url);}catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
  async function subscribe(lookupKey:string){setBusy(true);setError('');try{const result=await request('billing/checkout',{lookupKey,returnUrl:`${location.origin}/account`});setCheckout({checkoutId:result.checkoutId,clientSecret:result.clientSecret,stripe:loadStripe(result.publishableKey)});}catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
  async function closeCheckout(){if(!checkout)return;setBusy(true);setError('');try{await request('billing/checkout/cancel',{checkoutId:checkout.checkoutId});setCheckout(null);setSnapshot(await request('billing/subscription'));}catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
  const activeSubscription=!!snapshot?.subscription&&!['canceled','incomplete_expired'].includes(snapshot.subscription.status);
  return <>
    <section><h2>Plan and usage</h2>{snapshot?<><p>{activeSubscription?snapshot.subscription!.plan.name:'Aux Free'}</p><p>${(Number(snapshot.credit.balance_micros)/1000000).toFixed(2)} in service credits available</p>{activeSubscription&&snapshot.subscription?.cancelAtPeriodEnd&&snapshot.subscription.currentPeriodEnd&&<p>Your subscription will end on {new Date(snapshot.subscription.currentPeriodEnd).toLocaleDateString()}.</p>}{snapshot.subscription&&<button disabled={busy} onClick={portal}>Manage billing</button>}</>:<p>Loading your account…</p>}</section>
    {checkout?<section><button disabled={busy} onClick={closeCheckout}>Close checkout</button><EmbeddedCheckoutProvider stripe={checkout.stripe} options={{clientSecret:checkout.clientSecret}}><EmbeddedCheckout/></EmbeddedCheckoutProvider></section>:<>
      <div className="interval" role="group" aria-label="Billing interval"><button aria-pressed={interval==='month'} onClick={()=>setInterval('month')}>Monthly</button><button aria-pressed={interval==='year'} onClick={()=>setInterval('year')}>Yearly</button></div>
      <div className="plans">{plans.filter(plan=>plan.slug!=='free').map(plan=>{const price=plan.prices[interval];return <section key={plan.slug}><h2>{plan.name}</h2><p>{price?`$${(price.unitAmount/100).toFixed(0)} / ${interval}`:'Unavailable'}</p><ul>{plan.features.map(feature=><li key={feature}>{feature}</li>)}</ul><button disabled={busy||!price?.lookupKey} onClick={()=>activeSubscription?portal():price?.lookupKey&&subscribe(price.lookupKey)}>{activeSubscription?'Change plan':'Choose plan'}</button></section>;})}</div>
    </>}
    <section><h2>Privacy</h2><p>Your browser data stays local unless you enable sync or explicitly publish a conversation. Hosted AI requests require zero-data-retention routing.</p></section>{error&&<p role="alert">{error}</p>}
  </>;
}

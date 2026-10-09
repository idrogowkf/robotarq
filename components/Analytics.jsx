"use client";
import { Analytics } from '@vercel/analytics/next';
export default function UsageAnalytics(){return <Analytics beforeSend={event=>{const url=new URL(event.url);url.search='';url.hash='';return {...event,url:url.toString()};}} />;}

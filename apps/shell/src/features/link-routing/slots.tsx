import { lazy, Suspense } from "react";
const Settings = lazy(()=>import("../../settings/sections/LinkRouting").then(module=>({default:module.LinkRoutingSettings})));
const Prompts = lazy(()=>import("../../settings/sections/LinkRouting").then(module=>({default:module.RoutingPrompts})));
export function RoutingSettings(){return <Suspense fallback={null}><Settings/></Suspense>;}
export function RoutingOverlay(){return <Suspense fallback={null}><Prompts/></Suspense>;}

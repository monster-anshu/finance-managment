import { router, type Href } from "expo-router";

/**
 * Goes back, or replaces with `fallback` when there's no history — e.g. the
 * page was opened directly or reloaded (common in an iOS home-screen PWA).
 */
export function goBack(fallback: Href) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

export interface RouteParams {
  id?: string;
  instrumentId?: string;
}

/** Logical parent of a stack route, used when there's no history to go back to. */
export function parentHref(routeName: string, params: RouteParams): Href {
  switch (routeName) {
    case "transaction/new":
      return params.instrumentId
        ? `/instrument/${params.instrumentId}`
        : "/portfolio";
    case "instrument/edit/[id]":
      return params.id ? `/instrument/${params.id}` : "/portfolio";
    case "instrument/new":
    case "instrument/[id]":
    case "transaction/edit/[id]":
      return "/portfolio";
    default:
      return "/";
  }
}

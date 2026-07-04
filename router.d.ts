/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/portfolio`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/instrument/new`; params?: Router.UnknownInputParams; } | { pathname: `/instrument/[id]`, params: Router.UnknownInputParams & { id: string | number; } } | { pathname: `/instrument/edit/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/portfolio`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/instrument/new`; params?: Router.UnknownOutputParams; } | { pathname: `/instrument/[id]`, params: Router.UnknownOutputParams & { id: string; } } | { pathname: `/instrument/edit/[id]`, params: Router.UnknownOutputParams & { id: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/portfolio${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/instrument/new${`?${string}` | `#${string}` | ''}` | `/instrument/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}` | `/instrument/edit/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/portfolio`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/instrument/new`; params?: Router.UnknownInputParams; } | { pathname: `/instrument/[id]`, params: Router.UnknownInputParams & { id: string | number; } } | { pathname: `/instrument/edit/[id]`, params: Router.UnknownInputParams & { id: string | number; } };
    }
  }
}

import type { IconName } from './icons/icons.js';
export type PageSearchItem = {
    href: string;
    label: string;
    icon: IconName;
    /** The group the page sits in, such as a sidebar section; shown beside it and searched too. */
    section?: string;
    /** The page shown, marked with aria-current. */
    active?: boolean;
};
export declare function filterPages<Page extends PageSearchItem>(pages: readonly Page[], query: string): Page[];

import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
    /** Accessible name of the list, such as "Bots". */
    label?: string;
    /** The rows are still loading: said with aria-busy while skeleton rows stand in. */
    busy?: boolean;
    /** RowItems. */
    children?: Snippet;
}
declare const RowList: import("svelte").Component<Props, {}, "">;
type RowList = ReturnType<typeof RowList>;
export default RowList;

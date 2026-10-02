export type IconDef = {
    /** Stroked paths. */
    d: string[];
    /** Paths filled with the current colour. */
    fill?: string[];
    /** Small filled dots, as [x, y]. */
    nodes?: [number, number][];
};
export declare const icons: {
    dashboard: {
        d: string[];
    };
    markets: {
        d: string[];
        nodes: [number, number][];
    };
    portfolio: {
        d: string[];
        nodes: [number, number][];
    };
    orders: {
        d: string[];
        nodes: [number, number][];
    };
    bots: {
        d: string[];
        nodes: [number, number][];
    };
    scores: {
        d: string[];
        nodes: [number, number][];
    };
    friends: {
        d: string[];
    };
    watchlist: {
        d: string[];
        nodes: [number, number][];
    };
    inbox: {
        d: string[];
    };
    coins: {
        d: string[];
    };
    search: {
        d: string[];
    };
    signIn: {
        d: string[];
    };
    signOut: {
        d: string[];
    };
    menu: {
        d: string[];
    };
    close: {
        d: string[];
    };
    more: {
        d: string[];
    };
    plus: {
        d: string[];
    };
    check: {
        d: string[];
    };
    play: {
        d: string[];
    };
    pause: {
        d: string[];
    };
    bolt: {
        d: string[];
    };
    trendUp: {
        d: string[];
    };
    trendDown: {
        d: string[];
    };
    alert: {
        d: string[];
        nodes: [number, number][];
    };
    settings: {
        d: string[];
    };
    clock: {
        d: string[];
    };
    spark: {
        d: string[];
    };
    arrowRight: {
        d: string[];
    };
    arrowLeft: {
        d: string[];
    };
    copy: {
        d: string[];
    };
    theme: {
        d: string[];
        fill: string[];
    };
    wallet: {
        d: string[];
        nodes: [number, number][];
    };
};
export type IconName = keyof typeof icons;

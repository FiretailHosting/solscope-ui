// The solscope icon set: angular 24px line icons with chamfered corners and
// small filled "node" dots, for a technical look that stays flat. Drawn here
// rather than taken from an icon package, so the library has no dependencies.
//
// Each icon is stroked paths, optional filled paths, and node positions.
export const icons = {
    dashboard: {
        d: ['M3 5l2-2h5v7H3Z', 'M14 3h5l2 2v4h-7Z', 'M3 14h7v7H5l-2-2Z', 'M14 13h7v6l-2 2h-5Z']
    },
    markets: {
        d: ['M3 3v18h18', 'M7 16l4-6 3 3 5-7'],
        nodes: [[11, 10], [14, 13], [19, 6]]
    },
    portfolio: {
        d: ['M3 8l2-2h14v13H5l-2-2Z', 'M15 11h6v5h-6Z', 'M7 6l2-3h8'],
        nodes: [[17.5, 13.5]]
    },
    orders: {
        d: ['M9 6h11', 'M9 12h11', 'M9 18h7'],
        nodes: [[4.5, 6], [4.5, 12], [4.5, 18]]
    },
    bots: {
        d: [
            'M8 7h8l1 1v8l-1 1H8l-1-1V8Z',
            'M10 3v4', 'M14 3v4', 'M10 17v4', 'M14 17v4',
            'M3 10h4', 'M3 14h4', 'M17 10h4', 'M17 14h4'
        ],
        nodes: [[12, 12]]
    },
    scores: {
        d: ['M3 21v-6h5v6', 'M9.5 21V10l2.5-2.5 2.5 2.5v11', 'M16 21v-8h5v8', 'M2 21h20'],
        nodes: [[12, 4]]
    },
    friends: {
        d: ['M12 3.8l2.6 1.5v3L12 9.8 9.4 8.3v-3Z', 'M6 14.8l2.6 1.5v3L6 20.8l-2.6-1.5v-3Z', 'M18 14.8l2.6 1.5v3L18 20.8l-2.6-1.5v-3Z', 'M10.6 9.4 7.4 14.3', 'M13.4 9.4l3.2 4.9', 'M8.6 17.8h6.8']
    },
    watchlist: {
        d: ['M12 2v5', 'M12 17v5', 'M2 12h5', 'M17 12h5', 'M8.5 8.5h7v7h-7Z'],
        nodes: [[12, 12]]
    },
    inbox: {
        d: ['M3 13l3-9h12l3 9v7H3Z', 'M3 13h5l1.5 3h5L16 13h5']
    },
    coins: {
        d: ['M12 2.5l8 4.6v9.8l-8 4.6-8-4.6V7.1Z', 'M12 7v10', 'M8.5 9.5 12 7l3.5 2.5']
    },
    search: {
        d: ['M10.5 4.5l4.2 1.7 1.7 4.3-1.7 4.2-4.2 1.8-4.3-1.8-1.7-4.2 1.7-4.3Z', 'M15.5 15.5 21 21']
    },
    signIn: {
        d: ['M10 3H4v18h6', 'M21 12H9', 'M17 8l4 4-4 4']
    },
    signOut: {
        d: ['M14 3h6v18h-6', 'M3 12h12', 'M7 8l-4 4 4 4']
    },
    menu: {
        d: ['M3 6h18', 'M3 12h18', 'M3 18h11']
    },
    close: {
        d: ['M5 5l14 14', 'M19 5 5 19']
    },
    more: {
        d: ['M3.5 10.5h3v3h-3Z', 'M10.5 10.5h3v3h-3Z', 'M17.5 10.5h3v3h-3Z']
    },
    plus: {
        d: ['M12 4v16', 'M4 12h16']
    },
    check: {
        d: ['M4 12.5l5 5L20 6.5']
    },
    play: {
        d: ['M7 4.5 19 12 7 19.5Z']
    },
    pause: {
        d: ['M8 5v14', 'M16 5v14']
    },
    bolt: {
        d: ['M13.5 2 5 13h6.5l-1 9L19 11h-6.5Z']
    },
    trendUp: {
        d: ['M3 17l6-6 4 4 8-8', 'M15 7h6v6']
    },
    trendDown: {
        d: ['M3 7l6 6 4-4 8 8', 'M15 17h6v-6']
    },
    alert: {
        d: ['M12 3 22 20H2Z', 'M12 9.5v4.5'],
        nodes: [[12, 16.8]]
    },
    settings: {
        d: ['M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5Z', 'M12 9l2.6 1.5v3L12 15l-2.6-1.5v-3Z']
    },
    clock: {
        d: ['M12 3.5l6 2.5 2.5 6-2.5 6-6 2.5-6-2.5L3.5 12 6 6Z', 'M12 7.5V12l3 2']
    },
    spark: {
        d: ['M12 2v5', 'M12 17v5', 'M2 12h5', 'M17 12h5', 'M12 8l4 4-4 4-4-4Z']
    },
    arrowRight: {
        d: ['M4 12h15', 'M13 6l6 6-6 6']
    },
    arrowLeft: {
        d: ['M20 12H5', 'M11 6l-6 6 6 6']
    },
    chevronDown: {
        d: ['M6 9l6 6 6-6']
    },
    copy: {
        d: ['M9 9h11v11H9Z', 'M5 15H4V4h11v1']
    },
    theme: {
        d: ['M12 3.5l6 2.5 2.5 6-2.5 6-6 2.5-6-2.5L3.5 12 6 6Z'],
        fill: ['M12 3.5v17l6-2.5 2.5-6-2.5-6Z']
    },
    wallet: {
        d: ['M3 7l2-2h14v14H5l-2-2Z', 'M14 10h7v4h-7Z'],
        nodes: [[16.5, 12]]
    }
};

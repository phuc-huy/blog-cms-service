'use client'

import { createContext, useState } from "react";

export const Context = createContext(null);

export default function Provider({ children }) {
    const [numReset, setNumReset] = useState(0);

    return (
        <Context.Provider value={ { numReset, setNumReset } }>
            { children }
        </Context.Provider>
    );
}

'use client'

import {
    isServer,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60*1000,
            }
        }
    })
}

let broswerQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
    if (isServer) {
        return makeQueryClient()
    } else {
        if (!broswerQueryClient) broswerQueryClient = makeQueryClient()
        return broswerQueryClient
    }
}

interface QueryProviderProps {
    children: React.ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
    const queryClient = getQueryClient()

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}
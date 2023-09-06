import {ApolloClient, createHttpLink, InMemoryCache, InMemoryCacheConfig, PossibleTypesMap} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";

interface GraphqlClientConstructorOptions {
    // URL to graphql
    uri: string;
    // Introspect PossibleTypesMap
    possibleTypes: PossibleTypesMap;
    // A function that provides the accessToken
    accessTokeProvider: ()=>string;
    // If your environment does not support fetch (nodejs) provide a fetch function
    fetch?: (url: string, options: any) => Promise<Response>
}
export class GraphqlClient {
    private possibleTypes: PossibleTypesMap;
    private accessTokeProvider: () => string;
    private uri: string;
    private fetch: (url: string, options: any) => Promise<Response>;
    constructor(options: GraphqlClientConstructorOptions) {
        this.uri = options.uri;
        this.possibleTypes = options.possibleTypes;
        this.accessTokeProvider = options.accessTokeProvider;
        this.fetch = options.fetch as any;
    }

    public createClient() {
        const CacheSettings:  InMemoryCacheConfig = {
            addTypename: true,
            possibleTypes: this.possibleTypes,
        }

        const apolloHttpLink = createHttpLink({
            uri: this.uri,
            fetch: this.fetch
        })

        const apolloAuthContext = setContext(async (_, {headers}) => {
            const token = this.accessTokeProvider();
            const authorization = token ? `Bearer ${token}` : "";
            return {
                headers: {
                    ...headers,
                    authorization
                },
            }
        })
        return new ApolloClient({
            link: apolloAuthContext.concat(apolloHttpLink),
            cache: new InMemoryCache(CacheSettings)
        });
    }

}




import fetch  from "cross-fetch";


//  Implements a fetch that supports retry
export function fetchRetry(url:string, delay: number, tries: number, fetchOptions = {}) {
    function wait(delay: number){
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
    function onError(err){
        let triesLeft = tries - 1;
        if(!triesLeft){
            throw err;
        }
        return wait(delay).then(() => fetchRetry(url, delay, triesLeft, fetchOptions));
    }
    return fetch(url,fetchOptions).catch(onError);
}

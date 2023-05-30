import { get as getSplitFlag } from '../api/standalone/split/flags/[flagname]';

//export const config = { runtime: "edge" };

export default function Page() {

    console.log("hello from Split.tsx");

    let data: string;
    //getSplitFlag("first_split").then(res => data = res);

    //console.log("done fetching... ?");

    return (
        <>
            <p>{data ?? 'Loading...'}</p>
        </>
    );
}
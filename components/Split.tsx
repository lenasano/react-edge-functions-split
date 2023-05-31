import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';

import { get as getSplitFlag } from '../api/standalone/split/flags/[flagname]';
import { Timer, createTimer } from "../util/utils"

type SplitResponse = {
    treatment: string;
    duration: number;
};

export const getServerSideProps: GetServerSideProps<{
    split: SplitResponse;
}> = async () => {

    let stopwatch: Timer = createTimer();

    const split = await getSplitFlag("first_split", stopwatch);

    console.log(`split when pre-rendered is ${split}`);
    console.log(`split with json is ${ JSON.stringify({ split, duration: stopwatch.duration() }) }`);

    return { props: { split } };
};

export default function Page({
    split,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return <p>split</p>;
}

/*
export default function Page() {

    console.log("hello from Split.tsx");

    let data: string;
    //getSplitFlag("first_split").then(res => data = res);

    //console.log("done fetching... ?");

    return (
        <>
            <p>{data ?? "Let's show the split info here..."}</p>
        </>
    );
}*/
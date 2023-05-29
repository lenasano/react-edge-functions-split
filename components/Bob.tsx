import { useState, useEffect } from 'react';
import { sayHello } from '../api/helloBob.js';
import useSWR from "swr";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
        throw new Error(data.message);
    }
    return data;
};

export default function Page() {
    const [person, setPerson] = useState('Alice');
    const [hello, setHello] = useState(null);

    console.log("hello from Bob.tsx");

    const { data, error } = useSWR(
        () => ( `/api/split/flag` ),
        fetcher
    );

    if (error) return <div>{error.message}</div>;

    /* useEffect(() => {
        async function startFetching() {
            setHello(null);
            const result = await sayHello(person);
            if (!ignore) {
                setHello(result);
                console.log(`set hello ${result}`)
            }
        }

        let ignore = false;
        startFetching();
        return () => {
            ignore = true;
        }
    }, [person]);*/

    return (
        <>
            <select value={person} onChange={e => {
                setPerson(e.target.value);
            }}>
                <option value="Alice">Alice</option>
                <option value="Bob">Bob</option>
                <option value="Joe">Joe</option>
            </select>
            <p>{data ?? 'Loading...'}</p>
        </>
    );
}
import { useState, useEffect } from 'react';
import { get as getSplitFlag } from '../api/split/flag';

export default function Page() {
    const [person, setPerson] = useState('Alice');
    // const [hello, setHello] = useState(null);

    console.log("hello from Bob.tsx");

    let data: string;
    getSplitFlag().then(res => data = res);

    console.log("done fetching... ?");

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
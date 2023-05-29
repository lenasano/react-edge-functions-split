import { useState, useEffect } from 'react';
import { sayHello } from '../api/helloBob.js';

export default function Page() {
    const [person, setPerson] = useState('Alice');
    const [hello, setHello] = useState(null);
    useEffect(() => {
        async function startFetching() {
            setHello(null);
            const result = await sayHello(person);
            if (!ignore) {
                setHello(result);
            }
        }

        let ignore = false;
        startFetching();
        return () => {
            ignore = true;
        }
    }, [person]);

    return (
        <>
            <select value={person} onChange={e => {
                setPerson(e.target.value);
            }}>
                <option value="Alice">Alice</option>
                <option value="Bob">Bob</option>
                <option value="Joe">Joe</option>
            </select>
            <p>{hello ?? 'Loading...'}</p>
        </>
    );
}
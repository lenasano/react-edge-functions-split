import { get as getSplitFlag } from '../api/standalone/split/flags/[flagname]';

//export const config = { runtime: "edge" };

export default function Page() {
    const [person, setPerson] = useState('Alice');
    // const [hello, setHello] = useState(null);

    console.log("hello from Bob.tsx");

    let data: string;
    getSplitFlag("first_split").then(res => data = res);

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